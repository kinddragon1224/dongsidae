import { useEffect, useRef, useState } from "react";
import { REGION_META } from "@/lib/history/regions";
import { useTimeline } from "@/lib/history/store";
import { REGIONS } from "@/lib/history/types";
import { addYears, formatYearBare } from "@/lib/history/years";
import { canUseWebGL } from "@/lib/visuals/capability";
import { ChronosphereFallback } from "./chronosphere-fallback";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type ChronosphereHandle = {
  setPointer: (x: number, y: number) => void;
  setYear: (year: number) => void;
  resize: (width: number, height: number) => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

type Props = {
  onEnter?: () => void;
};

export function Chronosphere({ onEnter }: Props) {
  const year = useTimeline((s) => s.year);
  const setYear = useTimeline((s) => s.setYear);
  const reduced = usePrefersReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const gl = useRef<ChronosphereHandle | null>(null);
  const loading = useRef(false);
  const [webgl, setWebgl] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const drag = useRef<{
    x: number;
    y: number;
    year: number;
    active: boolean;
  } | null>(null);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) gl.current?.stop();
      else gl.current?.start();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      gl.current?.dispose();
      gl.current = null;
    };
  }, []);

  useEffect(() => {
    gl.current?.setYear(year);
  }, [year]);

  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      gl.current?.resize(box.width, box.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [webgl]);

  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      const step = e.shiftKey ? 10 : 1;
      setYear(addYears(useTimeline.getState().year, dir * step));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setYear]);

  function enableGl() {
    if (reduced || loading.current || gl.current) return;
    if (!canUseWebGL() || !stage.current) return;
    loading.current = true;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "absolute inset-0 h-full w-full";
    stage.current.appendChild(canvas);
    import("./chronosphere-gl")
      .then(({ mountChronosphere }) => {
        if (!stage.current) {
          canvas.remove();
          return;
        }
        const handle = mountChronosphere(canvas);
        gl.current = handle;
        const box = shell.current?.getBoundingClientRect();
        handle.resize(box?.width ?? 480, box?.height ?? 480);
        handle.setYear(useTimeline.getState().year);
        if (!document.hidden) handle.start();
        setWebgl(true);
      })
      .catch(() => {
        canvas.remove();
        loading.current = false;
        setWebgl(false);
      });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    enableGl();
    const el = shell.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (!reduced) {
      el.style.setProperty("--tilt-x", `${x * 6}deg`);
      el.style.setProperty("--tilt-y", `${-y * 4}deg`);
      gl.current?.setPointer(x, y);
    }
    const current = drag.current;
    if (!current) return;
    const dx = e.clientX - current.x;
    const dy = e.clientY - current.y;
    if (!current.active) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        current.active = true;
        setGrabbing(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (Math.abs(dy) > 14) {
        drag.current = null;
      }
      return;
    }
    const delta = Math.round(dx / 14);
    if (delta !== 0) setYear(addYears(current.year, delta));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    enableGl();
    drag.current = { x: e.clientX, y: e.clientY, year, active: false };
  }

  function onPointerUp() {
    drag.current = null;
    setGrabbing(false);
  }

  return (
    <div
      ref={shell}
      className={cn(
        "chronosphere relative mx-auto aspect-square w-full max-w-64 select-none md:max-w-lg lg:max-w-xl",
        grabbing ? "cursor-grabbing" : "cursor-grab",
      )}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={enableGl}
      onPointerLeave={() => {
        drag.current = null;
        setGrabbing(false);
        shell.current?.style.setProperty("--tilt-x", "0deg");
        shell.current?.style.setProperty("--tilt-y", "0deg");
        gl.current?.setPointer(0, 0);
      }}
      onDoubleClick={() => onEnter?.()}
    >
      <div ref={stage} className="chronosphere-stage absolute inset-0">
        <div
          className={cn(
            "absolute inset-[6%] text-primary",
            webgl ? "opacity-0" : "opacity-100",
          )}
        >
          <ChronosphereFallback />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs tracking-[0.28em] text-subtle">지금</p>
        <p
          key={year}
          className="year-swap font-serif text-year leading-none font-medium tracking-tight text-primary tabular-nums"
        >
          {formatYearBare(year)}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">같은 시간, 다른 세계</p>
      </div>

      <ul className="pointer-events-none absolute inset-x-0 bottom-[8%] flex justify-center gap-4 text-xs tracking-wide text-subtle">
        {REGIONS.map((id) => (
          <li key={id} className="flex items-center gap-1.5">
            <span
              className="size-1 rounded-full"
              style={{ background: REGION_META[id].token }}
            />
            {REGION_META[id].short}
          </li>
        ))}
      </ul>
    </div>
  );
}
