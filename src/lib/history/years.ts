export const YEAR_MIN = -221;
export const YEAR_MAX = 2020;

/** There is no year 0 in historical (proleptic) civil counting. */
export function addYears(from: number, delta: number): number {
  if (delta === 0) return from === 0 ? 1 : from;
  const to = from + delta;
  if (from < 0 && to >= 0) return to + 1;
  if (from > 0 && to <= 0) return to - 1;
  if (to === 0) return delta > 0 ? 1 : -1;
  return to;
}

export function clampYear(year: number): number {
  if (!Number.isFinite(year)) return 1517;
  let y = Math.trunc(year);
  if (y === 0) y = 1;
  return Math.min(YEAR_MAX, Math.max(YEAR_MIN, y));
}

export function parseYearInput(raw: string): number | null {
  const text = raw.trim().replace(/,/g, "").replace(/\s+/g, "");
  if (!text) return null;

  const bce =
    /^(?:기원전|기원\s*전|bc|bce|전)(-?\d+)$/i.exec(text) ??
    /^(-?\d+)(?:년)?(?:기원전|bc|bce)$/i.exec(text);
  if (bce) {
    const n = Math.abs(parseInt(bce[1] ?? "", 10));
    if (!Number.isFinite(n) || n === 0) return null;
    return clampYear(-n);
  }

  const ce = /^(?:기원후|ad|ce|서기)?(-?\d+)(?:년)?$/i.exec(text);
  if (!ce) return null;
  const n = parseInt(ce[1] ?? "", 10);
  if (!Number.isFinite(n) || n === 0) return null;
  return clampYear(n);
}

export function formatYear(year: number, opts?: { era?: boolean }): string {
  if (year < 0) return `기원전 ${Math.abs(year)}년`;
  if (opts?.era) return `기원후 ${year}년`;
  return `${year}년`;
}

export function formatYearShort(year: number): string {
  if (year < 0) return `전${Math.abs(year)}`;
  return String(year);
}

export function formatYearBare(year: number): string {
  if (year < 0) return `전 ${Math.abs(year)}`;
  return String(year);
}

export function formatYearRange(start: number, end?: number): string {
  if (end == null || end === start) {
    return formatYear(start);
  }
  if (start < 0 && end < 0) {
    return `기원전 ${Math.abs(start)}–${Math.abs(end)}년`;
  }
  return `${formatYear(start)} – ${formatYear(end)}`;
}

/** Inclusive civil-year distance, skipping year 0. */
export function yearsBetween(a: number, b: number): number {
  if (a === b) return 0;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  let n = hi - lo;
  if (lo < 0 && hi > 0) n -= 1;
  return n;
}

export function formatDistance(from: number, to: number): string {
  const n = yearsBetween(from, to);
  if (n === 0) return "같은 해";
  const later = to > from;
  const formatted = n.toLocaleString("ko-KR");
  return later ? `${formatted}년 후` : `${formatted}년 전`;
}

export function eventAnchorYear(start: number, end?: number): number {
  if (end == null || end === start) return start;
  if (start < 0 && end > 0) {
    return start;
  }
  return Math.round((start + end) / 2) || 1;
}

export function spansYear(
  start: number,
  end: number | undefined,
  year: number,
): boolean {
  const last = end ?? start;
  const lo = Math.min(start, last);
  const hi = Math.max(start, last);
  return year >= lo && year <= hi;
}

export function distanceToYear(
  start: number,
  end: number | undefined,
  year: number,
): number {
  if (spansYear(start, end, year)) return 0;
  const last = end ?? start;
  const lo = Math.min(start, last);
  const hi = Math.max(start, last);
  if (year < lo) return yearsBetween(year, lo);
  return yearsBetween(hi, year);
}

export function skipZero(year: number): number {
  return year === 0 ? 1 : year;
}

export function ticksAround(
  year: number,
  halfWindow: number,
  tick: number,
): number[] {
  const start = year - halfWindow;
  const end = year + halfWindow;
  const first = Math.floor(start / tick) * tick;
  const out: number[] = [];
  for (let y = first; y <= end; y += tick) {
    if (y === 0) continue;
    if (y < YEAR_MIN || y > YEAR_MAX) continue;
    out.push(y);
  }
  return out;
}
