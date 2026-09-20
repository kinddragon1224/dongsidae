import { useRef } from "react";
import { formatYearBare } from "@/lib/history/years";
import { getVisualById } from "@/lib/visuals/registry";
import type { PortalSpec } from "@/lib/visuals/types";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

type Props = {
  portal: PortalSpec;
  onOpen: (year: number) => void;
};

export function HistoricalPortal({ portal, onOpen }: Props) {
  const asset = getVisualById(portal.visualId);
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLButtonElement>(null);

  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (reduced) return;
    const el = root.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--px", `${x * 6}px`);
    el.style.setProperty("--py", `${y * 4}px`);
    el.style.setProperty("--mx", `${x * 10}px`);
    el.style.setProperty("--my", `${y * 7}px`);
  }

  function onLeave() {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--px", "0px");
    el.style.setProperty("--py", "0px");
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  }

  return (
    <button
      ref={root}
      type="button"
      onClick={() => onOpen(portal.year)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "portal-card group relative flex min-h-40 w-full flex-col overflow-hidden rounded-xl text-left",
        "border border-border bg-card shadow-[var(--shadow-border)]",
        "transition-[box-shadow,transform] duration-200 ease-out",
        "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98] md:min-h-48",
      )}
    >
      {asset ? (
        <span aria-hidden className="portal-media absolute inset-0">
          <img
            src={asset.src}
            alt=""
            className="archive-photo portal-layer-back"
            style={{
              objectPosition: asset.focalPoint
                ? `${asset.focalPoint.x * 100}% ${asset.focalPoint.y * 100}%`
                : "50% 40%",
            }}
          />
          <span className="portal-layer-mid" />
        </span>
      ) : (
        <span aria-hidden className="absolute inset-0 bg-card" />
      )}
      <span className="relative z-10 mt-auto flex flex-col px-4 pt-16 pb-4">
        <span className="text-[0.625rem] tracking-[0.22em] text-primary/80">
          {portal.archiveLabel}
        </span>
        <span className="mt-1 font-serif text-4xl tabular-nums tracking-tight text-primary md:text-5xl">
          {formatYearBare(portal.year)}
        </span>
        <span className="mt-2 font-serif text-sm text-foreground">{portal.title}</span>
        <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-subtle">
          {portal.line}
        </span>
      </span>
    </button>
  );
}
