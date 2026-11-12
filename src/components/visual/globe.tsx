import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import type { GlobeHandle, GlobeScreenPoint } from "./globe-gl";

export type GlobeMark = {
  id: string;
  /** 장소 이름 — 지구본 위 라벨 */
  name: string;
  lat: number;
  lng: number;
  /** CSS 색 (var(--…) 가능) */
  color: string;
  /** 스크린리더용: "기독교사 루터의 95개조 논제, 비텐베르크" */
  label: string;
};

type Props = {
  marks: GlobeMark[];
  onOpen: (id: string) => void;
  className?: string;
};

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** var(--token) → 실제 색. three.js는 CSS 변수를 모른다. */
function resolveColor(color: string): string {
  const match = /^var\((--[^)]+)\)$/.exec(color);
  if (!match) return color;
  return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() || "#cbb89a";
}

/**
 * 그 해의 사건이 일어난 곳을 보여주는 지구본.
 * WebGL이 없으면 아무것도 그리지 않는다 — 같은 정보가 옆의 목록에 글로 있다.
 */
export function Globe({ marks, onOpen, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef(new Map<string, HTMLButtonElement>());
  const handle = useRef<GlobeHandle | null>(null);
  const latest = useRef(marks);
  latest.current = marks;
  const [supported, setSupported] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasWebGL()) {
      setSupported(false);
      return;
    }
    let cancelled = false;
    let observer: ResizeObserver | undefined;

    function place(points: GlobeScreenPoint[]) {
      const width = shell.current?.clientWidth ?? 0;
      // 가까운 라벨끼리 겹치지 않게: 같은 쪽에서 위→아래로 14px 간격을 보장
      const lastY = { left: -Infinity, right: -Infinity };
      for (const point of [...points].sort((a, b) => a.y - b.y)) {
        const el = labels.current.get(point.id);
        if (!el) continue;
        if (!point.visible) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          continue;
        }
        const side = point.x < width / 2 ? "left" : "right";
        const y = Math.max(point.y, lastY[side] + 15);
        lastY[side] = y;
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.style.transform =
          side === "left"
            ? `translate(${point.x - 10}px, ${y}px) translate(-100%, -50%)`
            : `translate(${point.x + 10}px, ${y}px) translate(0, -50%)`;
      }
    }

    Promise.all([import("./globe-gl"), import("@/data/geo/coast-110m.json")])
      .then(([gl, coast]) => {
        if (cancelled || !canvas.current || !shell.current) return;
        const globe = gl.createGlobe(canvas.current, coast.default.lines, {
          animate: !reduced,
          onFrame: place,
        });
        handle.current = globe;
        observer = new ResizeObserver(([entry]) => {
          globe.resize(entry.contentRect.width, entry.contentRect.height);
        });
        observer.observe(shell.current);
        globe.resize(shell.current.clientWidth, shell.current.clientHeight);
        globe.setPins(toPins(latest.current));
        setReady(true);
      })
      .catch(() => setSupported(false));

    return () => {
      cancelled = true;
      observer?.disconnect();
      handle.current?.dispose();
      handle.current = null;
    };
    // reduced가 바뀌어도 다시 만들 만큼의 차이는 아니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const key = marks.map((mark) => `${mark.id}:${mark.lat}:${mark.lng}`).join("|");
  useEffect(() => {
    handle.current?.setPins(toPins(latest.current));
  }, [key]);

  const drag = useRef<{ x: number; y: number } | null>(null);

  if (!supported) return null;

  return (
    <div
      ref={shell}
      className={className}
      style={{ position: "relative", touchAction: "pan-y", cursor: "grab" }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        drag.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        handle.current?.rotateBy(
          -(e.clientX - drag.current.x) * 0.35,
          (e.clientY - drag.current.y) * 0.35,
        );
        drag.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="absolute inset-0 h-full w-full"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 400ms ease-out" }}
      />
      {marks.map((mark) => (
        <button
          key={mark.id}
          type="button"
          ref={(el) => {
            if (el) labels.current.set(mark.id, el);
            else labels.current.delete(mark.id);
          }}
          onClick={() => onOpen(mark.id)}
          aria-label={mark.label}
          className="globe-label absolute top-0 left-0 flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs whitespace-nowrap text-foreground"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <span className="size-1.5 rounded-full" style={{ background: mark.color }} />
          {mark.name}
        </button>
      ))}
    </div>
  );
}

function toPins(marks: GlobeMark[]) {
  return marks.map((mark) => ({
    id: mark.id,
    lat: mark.lat,
    lng: mark.lng,
    color: resolveColor(mark.color),
  }));
}
