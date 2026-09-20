import { useEffect } from "react";
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
import { getEventById } from "@/lib/history/query";
import { getZoom, useTimeline } from "@/lib/history/store";
import { parseYearInput } from "@/lib/history/years";

export function AppShell() {
  const entered = useTimeline((s) => s.entered);
  const selectedId = useTimeline((s) => s.selectedId);
  const select = useTimeline((s) => s.select);
  const selectedEvent = selectedId ? getEventById(selectedId) : undefined;

  useUrlSync();
  useKeyboard();

  useEffect(() => {
    if (selectedId && !selectedEvent) select(null);
  }, [selectedId, selectedEvent, select]);

  if (!entered) {
    return (
      <>
        <IntroScreen />
        <YearInputDialog />
        <SearchCommand />
      </>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <AppHeader />
      <NowStrip />
      <div className="flex min-h-0 flex-1 md:hidden">
        <MobileNow />
      </div>
      <div className="hidden min-h-0 flex-1 md:flex">
        <TimelineView />
      </div>
      <TimeControls />
      {selectedEvent && (
        <button
          type="button"
          aria-label="상세 닫기"
          className="fixed inset-0 z-30 bg-background/50 md:right-[28rem] md:bg-background/20"
          onClick={() => select(null)}
        />
      )}
      <EventDetail />
      <SearchCommand />
      <YearInputDialog />
      <ExplainPanel />
    </div>
  );
}

function useUrlSync() {
  const year = useTimeline((s) => s.year);
  const entered = useTimeline((s) => s.entered);
  const enter = useTimeline((s) => s.enter);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("y");
    if (!raw) return;
    const parsed = parseYearInput(raw);
    if (parsed != null) enter(parsed);
  }, [enter]);

  useEffect(() => {
    if (!entered) {
      const url = new URL(window.location.href);
      if (url.searchParams.has("y")) {
        url.searchParams.delete("y");
        window.history.replaceState(null, "", url.pathname);
      }
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("y", String(year));
    window.history.replaceState(
      null,
      "",
      `${url.pathname}?${url.searchParams.toString()}`,
    );
  }, [year, entered]);
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
