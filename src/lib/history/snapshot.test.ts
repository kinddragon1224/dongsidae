import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getRegionSnapshot, getYearSnapshot, relatedEvents } from "./snapshot.ts";
import { getEventById } from "./catalog.ts";
import { addYears } from "./years.ts";

describe("year snapshot", () => {
  it("treats 1517 as Luther + Jungjong + Ming + Ottoman, not as one blob", () => {
    const snap = getYearSnapshot(1517, { nearbyRange: 12, nearbyLimit: 4 });
    const byRegion = Object.fromEntries(
      snap.regions.map((row) => [row.region, row]),
    );

    const christ = byRegion.christianity!;
    assert.ok(christ.exactEvents.some((event) => event.id === "luther-95"));
    assert.ok(
      christ.active.some(
        (item) => item.event.id === "luther-95" && item.label === "이 해",
      ),
    );

    const korea = byRegion.korea!;
    assert.ok(korea.activeEras.some((event) => event.id === "jungjong"));
    assert.ok(
      korea.active.some(
        (item) => item.event.id === "jungjong" && item.label === "재위 중",
      ),
    );
    assert.ok(korea.nearbyAfter.some((item) => item.event.id === "gimyo-1519"));
    const gimyo = korea.nearbyAfter.find((item) => item.event.id === "gimyo-1519");
    assert.equal(gimyo?.label, "2년 후");

    const east = byRegion.east_asia!;
    assert.ok(east.activeEras.some((event) => event.id === "ming"));
    assert.ok(east.activeEras.some((event) => event.id === "zhengde"));

    const world = byRegion.world!;
    assert.ok(world.exactEvents.some((event) => event.id === "selim-egypt"));
  });

  it("shows Nicaea and Three Kingdoms as simultaneous in 325", () => {
    const snap = getYearSnapshot(325);
    const christ = snap.regions.find((row) => row.region === "christianity")!;
    const korea = snap.regions.find((row) => row.region === "korea")!;
    assert.ok(christ.exactEvents.some((event) => event.id === "nicaea-325"));
    assert.ok(korea.activeEras.some((event) => event.id === "three-kingdoms-korea"));
  });

  it("does not treat nearby events as related", () => {
    const luther = getEventById("luther-95")!;
    const related = relatedEvents(luther);
    assert.ok(related.every((event) => luther.relatedEventIds?.includes(event.id)));
    assert.ok(!related.some((event) => event.id === "gimyo-1519"));
  });

  it("keeps BCE snapshots on the same engine", () => {
    const snap = getRegionSnapshot("christianity", -4, { nearbyRange: 8 });
    assert.ok(
      snap.active.some((item) => item.event.id === "jesus-birth") ||
        snap.headline.event?.id === "jesus-birth",
    );
    assert.equal(addYears(-1, 1), 1);
  });
});
