export type LayoutInput = {
  id: string;
  naturalY: number;
  significance: number;
  /** Where to try placing the card; defaults to naturalY. */
  targetY?: number;
};

export type LaidCard<T extends LayoutInput> = T & {
  y: number;
  lane: 0 | 1;
  cluster: T[];
};

const MAX_DRIFT = 10;

export function layoutCards<T extends LayoutInput>(
  items: T[],
  minGap: number,
): LaidCard<T>[] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => {
    const ay = a.targetY ?? a.naturalY;
    const by = b.targetY ?? b.naturalY;
    if (ay !== by) return ay - by;
    if (a.naturalY !== b.naturalY) return a.naturalY - b.naturalY;
    return b.significance - a.significance;
  });

  const placed: LaidCard<T>[] = [];
  const laneBottom = [-Infinity, -Infinity];

  for (const item of sorted) {
    const target = item.targetY ?? item.naturalY;
    let lane: 0 | 1 | null = null;
    let y = target;

    for (const candidate of [0, 1] as const) {
      const last = laneBottom[candidate]!;
      const needed = last + minGap;
      if (target >= needed) {
        lane = candidate;
        y = target;
        break;
      }
      const drifted = Math.min(needed, target + MAX_DRIFT);
      if (drifted >= needed && drifted - target <= MAX_DRIFT) {
        lane = candidate;
        y = drifted;
        break;
      }
    }

    if (lane == null) {
      let nearest = 0;
      let best = Infinity;
      for (let i = 0; i < placed.length; i += 1) {
        const dist = Math.abs(placed[i]!.naturalY - item.naturalY);
        if (dist < best) {
          best = dist;
          nearest = i;
        }
      }
      placed[nearest]!.cluster.push(item);
      continue;
    }

    laneBottom[lane] = y;
    placed.push({ ...item, y, lane, cluster: [] });
  }

  return placed;
}
