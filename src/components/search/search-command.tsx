import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SEARCH_HINTS } from "@/lib/history/constants";
import { searchEvents } from "@/lib/history/query";
import { REGION_META } from "@/lib/history/regions";
import { useTimeline } from "@/lib/history/store";
import { clampYear, formatYear, formatYearRange, parseYearInput } from "@/lib/history/years";
import { YEAR_MAX, YEAR_MIN } from "@/lib/history/catalog";

export function SearchCommand() {
  const open = useTimeline((s) => s.searchOpen);
  const setOpen = useTimeline((s) => s.setSearchOpen);
  const goToEvent = useTimeline((s) => s.goToEvent);
  const enter = useTimeline((s) => s.enter);
  const setYear = useTimeline((s) => s.setYear);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => searchEvents(query), [query]);
  const yearHit = useMemo(() => parseYearInput(query), [query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[12%] left-1/2 flex w-[min(36rem,calc(100%-1.5rem))] max-h-[76vh] -translate-x-1/2 flex-col overflow-hidden rounded-xl p-0">
        <DialogTitle className="sr-only">검색</DialogTitle>
        <DialogDescription className="sr-only">
          사건, 인물, 시대, 연도를 검색합니다.
        </DialogDescription>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-subtle" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="루터, 조선, 니케아, 기원전 4…"
            className="h-12 w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-subtle"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {!query && (
            <div className="px-3 py-4">
              <p className="text-xs tracking-wide text-subtle">바로 찾아보기</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SEARCH_HINTS.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setQuery(hint)}
                    className="h-11 rounded-full border border-border px-3.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}
          {yearHit != null && (
            <button
              type="button"
              onClick={() => {
                const y = clampYear(yearHit, YEAR_MIN, YEAR_MAX);
                enter(y);
                setYear(y);
                setOpen(false);
              }}
              className="mb-1 flex min-h-12 w-full items-center rounded-md px-3 py-3 text-left hover:bg-accent"
            >
              <span className="font-serif text-sm text-foreground">
                {formatYear(yearHit)}으로 이동
              </span>
            </button>
          )}
          {query && results.length === 0 && yearHit == null && (
            <p className="px-4 py-8 text-center text-sm text-subtle">
              기록이 없습니다. 다른 이름이나 연도를 시도해 보세요.
            </p>
          )}
          <ul>
            {results.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => goToEvent(event.id, event.startYear)}
                  className="flex min-h-12 w-full items-baseline gap-3 rounded-md px-3 py-3 text-left hover:bg-accent"
                >
                  <span className="w-16 shrink-0 font-serif text-xs tabular-nums text-muted-foreground">
                    {formatYearRange(event.startYear, event.endYear)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">
                      {event.title}
                    </span>
                    <span className="block truncate text-xs text-subtle">
                      {REGION_META[event.region].label}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
