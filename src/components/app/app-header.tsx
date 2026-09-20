import { Search, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGION_META } from "@/lib/history/regions";
import { REGIONS } from "@/lib/history/types";
import { useTimeline } from "@/lib/history/store";
import { formatYear } from "@/lib/history/years";
import { cn } from "@/lib/utils";
import { useAiAvailable } from "@/components/explain/use-ai-available";

export function AppHeader() {
  const year = useTimeline((s) => s.year);
  const exitToIntro = useTimeline((s) => s.exitToIntro);
  const setSearchOpen = useTimeline((s) => s.setSearchOpen);
  const explainOpen = useTimeline((s) => s.explainOpen);
  const setExplainOpen = useTimeline((s) => s.setExplainOpen);
  const regions = useTimeline((s) => s.regions);
  const toggleRegion = useTimeline((s) => s.toggleRegion);
  const ai = useAiAvailable();

  return (
    <header className="flex items-center gap-2 border-b border-border px-3 py-2 md:gap-3 md:px-6 md:py-3">
      <button
        type="button"
        onClick={exitToIntro}
        className="h-11 px-1 font-serif text-base tracking-wide text-foreground"
      >
        동시대
      </button>
      <p className="hidden text-xs text-subtle md:block">
        같은 시간, 다른 세계.
      </p>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <p
          className="mr-1 hidden font-serif text-sm tabular-nums tracking-tight text-primary lg:block"
          aria-live="polite"
        >
          {formatYear(year)}
        </p>
        <div className="hidden items-center gap-1 sm:flex">
          {REGIONS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleRegion(id)}
              className={cn(
                "h-9 rounded-full px-2 text-[0.6875rem] tracking-wide",
                regions[id] ? "text-foreground" : "text-subtle line-through",
              )}
            >
              <span
                className="mr-1 inline-block size-1.5 rounded-full"
                style={{
                  background: regions[id]
                    ? REGION_META[id].token
                    : "var(--color-border)",
                }}
              />
              {REGION_META[id].short}
            </button>
          ))}
        </div>
        {ai && (
          <Button
            variant={explainOpen ? "secondary" : "ghost"}
            size="sm"
            className="h-11"
            onClick={() => setExplainOpen(!explainOpen)}
          >
            <Quote className="size-3.5" />
            <span className="hidden sm:inline">이 시대를 설명해줘</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label="검색"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-4" />
        </Button>
      </div>
    </header>
  );
}
