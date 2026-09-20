import { useEffect, useRef } from "react";
import { IntroScreen } from "@/components/app/intro-screen";
import { AppHeader } from "@/components/app/app-header";
import { ExplainPanel } from "@/components/explain/explain-panel";
import { SearchCommand } from "@/components/search/search-command";
import { EventDetail } from "@/components/timeline/event-detail";
import { MobileNow } from "@/components/timeline/mobile-now";
import { NowStrip } from "@/components/timeline/now-strip";
import { TimeControls } from "@/components/timeline/time-controls";
import { TimelineView } from "@/components/timeline/timeline-view";
import { YearInputDialog } from "@/components/timeline/year-input";
import { GrainOverlay } from "@/components/visual/grain-overlay";
import { TimeTransition } from "@/components/visual/time-transition";
import { getEventById } from "@/lib/history/query";
import { getZoom, useTimeline } from "@/lib/history/store";
import { formatYear } from "@/lib/history/years";
import {
  filterFromRegions,
  parseTimelineSearch,
  regionsFromFilter,
  serializeTimelineSearch,
} from "@/lib/history/url";

export function AppShell() {
  const entered = useTimeline((s) => s.entered);
  const selectedId = useTimeline((s) => s.selectedId);
  const select = useTimeline((s) => s.select);
  const selectedEvent = selectedId ? getEventById(selectedId) : undefined;

  useUrlSync();
  useDocumentTitle();
  useKeyboard();

  useEffect(() => {
    if (selectedId && !selectedEvent) select(null);
  }, [selectedId, selectedEvent, select]);

  return (
    <>
      <GrainOverlay />
      <TimeTransition />
      {!entered ? (
        <>
          <IntroScreen />
          <YearInputDialog />
          <SearchCommand />
        </>
      ) : (
        <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-background text-foreground">
          <AppHeader />
          <NowStrip />
          <div className="flex min-h-0 min-w-0 flex-1 overflow-x-hidden md:hidden">
            <MobileNow />
          </div>
          <div className="hidden min-h-0 flex-1 md:flex">
            <TimelineView />
          </div>
          <TimeControls />
          <EventDetail />
          <SearchCommand />
          <YearInputDialog />
          <ExplainPanel />
        </div>
      )}
    </>
  );
}

function useDocumentTitle() {
  const year = useTimeline((s) => s.year);
  const entered = useTimeline((s) => s.entered);
  const selectedId = useTimeline((s) => s.selectedId);
  const event = selectedId ? getEventById(selectedId) : undefined;

  useEffect(() => {
    if (event) {
      document.title = `${event.title} · ${formatYear(event.startYear)} · 동시대`;
      return;
    }
    if (entered) {
      document.title = `동시대 · ${formatYear(year)}`;
      return;
    }
    document.title = "동시대";
  }, [event, entered, year]);
}

function useUrlSync() {
  const year = useTimeline((s) => s.year);
  const zoomId = useTimeline((s) => s.zoomId);
  const selectedId = useTimeline((s) => s.selectedId);
  const regions = useTimeline((s) => s.regions);
  const entered = useTimeline((s) => s.entered);
  const hydrateFromUrl = useTimeline((s) => s.hydrateFromUrl);
  const applying = useRef(false);
  const lastPushed = useRef("");

  useEffect(() => {
    const params = window.location.search;
    if (!params) return;
    const parsed = parseTimelineSearch(params);
    applying.current = true;
    hydrateFromUrl({
      year: parsed.year,
      zoomId: parsed.zoomId,
      regions: filterFromRegions(parsed.regions),
      eventId: parsed.eventId,
      entered: true,
    });
    lastPushed.current = serializeTimelineSearch(parsed);
    queueMicrotask(() => {
      applying.current = false;
    });
  }, [hydrateFromUrl]);

  useEffect(() => {
    function onPop() {
      const parsed = parseTimelineSearch(window.location.search);
      applying.current = true;
      if (!window.location.search) {
        useTimeline.getState().exitToIntro();
      } else {
        hydrateFromUrl({
          year: parsed.year,
          zoomId: parsed.zoomId,
          regions: filterFromRegions(parsed.regions),
          eventId: parsed.eventId,
          entered: true,
        });
      }
      lastPushed.current = window.location.search.replace(/^\?/, "");
      queueMicrotask(() => {
        applying.current = false;
      });
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [hydrateFromUrl]);

  useEffect(() => {
    if (applying.current) return;
    if (!entered) {
      if (window.location.search) {
        window.history.pushState(null, "", window.location.pathname);
        lastPushed.current = "";
      }
      return;
    }
    const encoded = serializeTimelineSearch({
      year,
      zoomId,
      regions: regionsFromFilter(regions),
      eventId: selectedId,
    });
    if (encoded === lastPushed.current) return;
    const next = `${window.location.pathname}?${encoded}`;
    const significant =
      selectedId !== parseTimelineSearch(lastPushed.current).eventId ||
      lastPushed.current === "";
    if (significant) window.history.pushState(null, "", next);
    else window.history.replaceState(null, "", next);
    lastPushed.current = encoded;
  }, [year, zoomId, selectedId, regions, entered]);
}

function useKeyboard() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const state = useTimeline.getState();
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        if (state.searchOpen) state.setSearchOpen(false);
        else if (state.yearInputOpen) state.setYearInputOpen(false);
        else if (state.explainOpen) state.setExplainOpen(false);
        else if (state.selectedId) state.select(null);
        return;
      }

      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        state.setSearchOpen(true);
        return;
      }

      if (!state.entered || typing) return;

      const zoom = getZoom(state.zoomId);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.altKey ? -100 : e.shiftKey ? -10 : -zoom.step;
        state.shift(delta);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const delta = e.altKey ? 100 : e.shiftKey ? 10 : zoom.step;
        state.shift(delta);
      } else if (e.key === "+" || e.key === "=") {
        state.cycleZoom(-1);
      } else if (e.key === "-" || e.key === "_") {
        state.cycleZoom(1);
      } else if (e.key === "g") {
        state.setYearInputOpen(true);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
