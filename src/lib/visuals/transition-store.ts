import { create } from "zustand";
import { signedYearDistance } from "@/lib/history/years";

const JUMP_THRESHOLD = 80;

type YearReveal = {
  from: number;
  to: number;
  active: boolean;
};

type TransitionState = {
  reveal: YearReveal | null;
  play: (from: number, to: number, then?: () => void) => void;
  finish: () => void;
};

let pending: (() => void) | null = null;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useYearReveal = create<TransitionState>((set, get) => ({
  reveal: null,
  play: (from, to, then) => {
    if (get().reveal?.active) return;
    const distance = Math.abs(signedYearDistance(from, to));
    if (distance < JUMP_THRESHOLD || prefersReducedMotion()) {
      then?.();
      return;
    }
    pending = then ?? null;
    set({ reveal: { from, to, active: true } });
  },
  finish: () => {
    const next = pending;
    pending = null;
    set({ reveal: null });
    next?.();
  },
}));
