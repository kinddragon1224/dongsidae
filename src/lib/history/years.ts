/** Safety rails when a caller does not pass dataset bounds. */
export const CIVIL_YEAR_FLOOR = -400;
export const CIVIL_YEAR_CEILING = 2030;

/**
 * Continuous chronology: civil years have no year 0, ordinals do not skip.
 * -2 BCE → -1, -1 BCE → 0, 1 CE → 1, 2 CE → 2
 */
export function civilYearToOrdinal(year: number): number {
  const y = year === 0 ? 1 : year;
  return y < 0 ? y + 1 : y;
}

export function ordinalToCivilYear(ordinal: number): number {
  if (ordinal === 0) return -1;
  return ordinal < 0 ? ordinal - 1 : ordinal;
}

/** There is no year 0 in historical (proleptic) civil counting. */
export function addYears(from: number, delta: number): number {
  const start = from === 0 ? 1 : from;
  if (delta === 0) return start;
  return ordinalToCivilYear(civilYearToOrdinal(start) + delta);
}

export function clampYear(
  year: number,
  min: number = CIVIL_YEAR_FLOOR,
  max: number = CIVIL_YEAR_CEILING,
): number {
  if (!Number.isFinite(year)) return 1517;
  let y = Math.trunc(year);
  if (y === 0) y = 1;
  const lo = min === 0 ? -1 : min;
  const hi = max === 0 ? 1 : max;
  if (y < lo) return lo;
  if (y > hi) return hi;
  return y;
}

function normalizeYearText(raw: string): string {
  return raw
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/년/g, "");
}

export function parseYearInput(raw: string): number | null {
  const text = normalizeYearText(raw);
  if (!text) return null;

  const bce =
    /^(?:기원전|bc|b\.?c\.?e?\.?|전)(-?\d+)$/i.exec(text) ??
    /^(-?\d+)(?:기원전|bc|b\.?c\.?e?\.?)$/i.exec(text);
  if (bce) {
    const n = Math.abs(parseInt(bce[1] ?? "", 10));
    if (!Number.isFinite(n) || n === 0) return null;
    return -n;
  }

  const ce = /^(?:기원후|서기|ad|a\.?d\.?|ce|c\.?e\.?)?(-?\d+)$/i.exec(text);
  if (!ce) return null;
  const n = parseInt(ce[1] ?? "", 10);
  if (!Number.isFinite(n) || n === 0) return null;
  return n;
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
  return Math.abs(civilYearToOrdinal(b) - civilYearToOrdinal(a));
}

export function signedYearDistance(from: number, to: number): number {
  return civilYearToOrdinal(to) - civilYearToOrdinal(from);
}

export function formatDistance(from: number, to: number): string {
  const n = yearsBetween(from, to);
  if (n === 0) return "같은 해";
  const later = signedYearDistance(from, to) > 0;
  const formatted = n.toLocaleString("ko-KR");
  return later ? `${formatted}년 후` : `${formatted}년 전`;
}

export function eventAnchorYear(start: number, end?: number): number {
  if (end == null || end === start) return start;
  if (start < 0 && end > 0) {
    return start;
  }
  const mid = ordinalToCivilYear(
    Math.round((civilYearToOrdinal(start) + civilYearToOrdinal(end)) / 2),
  );
  return mid === 0 ? 1 : mid;
}

export function spansYear(
  start: number,
  end: number | undefined,
  year: number,
): boolean {
  const last = end ?? start;
  const lo = Math.min(start, last);
  const hi = Math.max(start, last);
  if (year === 0) return false;
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
  if (signedYearDistance(year, lo) > 0) return yearsBetween(year, lo);
  return yearsBetween(hi, year);
}

export function skipZero(year: number): number {
  return year === 0 ? 1 : year;
}

export function ticksAround(
  year: number,
  halfWindow: number,
  tick: number,
  min: number = CIVIL_YEAR_FLOOR,
  max: number = CIVIL_YEAR_CEILING,
): number[] {
  const startOrd = civilYearToOrdinal(year) - halfWindow;
  const endOrd = civilYearToOrdinal(year) + halfWindow;
  const startYear = ordinalToCivilYear(startOrd);
  let y = Math.trunc(startYear / tick) * tick;
  if (y === 0) y = tick > 0 ? -tick : tick;
  if (signedYearDistance(y, startYear) < 0) {
    y = addYears(y, tick);
  }
  const out: number[] = [];
  for (let i = 0; i < 400; i += 1) {
    const o = civilYearToOrdinal(y);
    if (o > endOrd) break;
    if (o >= startOrd && y !== 0 && y >= min && y <= max) out.push(y);
    y = addYears(y, tick);
  }
  return out;
}

export function yearToSlider(year: number, min: number): number {
  return civilYearToOrdinal(year) - civilYearToOrdinal(min);
}

export function sliderToYear(value: number, min: number): number {
  return ordinalToCivilYear(civilYearToOrdinal(min) + value);
}

export function sliderMaxValue(min: number, max: number): number {
  return civilYearToOrdinal(max) - civilYearToOrdinal(min);
}
