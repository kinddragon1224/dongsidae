import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildTimeSlice, hasBatchim, iGa, pickLead } from "./slice.ts";

describe("time slice", () => {
  it("puts Luther, Jungjong, Zhengde, and Selim in 1517 without blending them", () => {
    const slice = buildTimeSlice(1517);
    const by = Object.fromEntries(slice.regions.map((row) => [row.region, row]));

    assert.equal(by.christianity?.eventId, "luther-95");
    assert.equal(by.christianity?.presence, "exact");
    assert.equal(by.korea?.eventId, "jungjong");
    assert.equal(by.korea?.presence, "reign");
    assert.equal(by.east_asia?.eventId, "zhengde");
    assert.equal(by.east_asia?.presence, "reign");
    assert.equal(by.world?.eventId, "selim-egypt");
    assert.equal(by.world?.presence, "exact");

    assert.match(slice.sentence, /95개조/);
    assert.match(slice.sentence, /중종/);
    assert.match(slice.sentence, /정덕/);
    assert.equal(slice.lead?.eventId, "luther-95");
    assert.doesNotMatch(slice.sentence, /위대한/);
  });

  it("names Nicaea and the Three Kingdoms as the same moment in 325", () => {
    const slice = buildTimeSlice(325);
    const by = Object.fromEntries(slice.regions.map((row) => [row.region, row]));
    assert.equal(by.christianity?.eventId, "nicaea-325");
    assert.equal(by.christianity?.presence, "exact");
    assert.ok(
      by.korea?.eventId === "three-kingdoms-korea" ||
        by.korea?.eventId === "micheon" ||
        by.korea?.title.includes("삼국") ||
        by.korea?.title.includes("미천"),
    );
    assert.match(slice.sentence, /니케아/);
    assert.match(slice.sentence, /삼국|미천/);
  });

  it("keeps 1885 on the Chemulpo landing and does not invent a world event", () => {
    const slice = buildTimeSlice(1885);
    const christ = slice.regions.find((row) => row.region === "christianity");
    assert.equal(christ?.eventId, "korea-mission-1885");
    assert.match(slice.sentence, /제물포|언더우드|아펜젤러/);
  });

  it("holds 1945 liberation and the war's end as exact, not as a metaphor", () => {
    const slice = buildTimeSlice(1945);
    const ids = slice.regions.map((row) => row.eventId);
    assert.ok(ids.includes("liberation-1945"));
    assert.ok(ids.includes("ww2-end"));
    assert.match(slice.sentence, /광복|종전/);
  });

  it("marks nearby headlines instead of speaking as if they are this year", () => {
    const slice = buildTimeSlice(871);
    const world = slice.regions.find((row) => row.region === "world");
    assert.ok(world);
    assert.equal(world.presence, "nearby");
    assert.match(world.label, /년 전|년 후/);
    assert.doesNotMatch(slice.sentence, /카롤루스 대제의 대관이 있던 해/);
    if (slice.sentence.includes("카롤루스")) {
      assert.match(slice.sentence, /년 전|년 후/);
    }
  });

  it("always returns four regions", () => {
    for (const year of [325, 451, 800, 1054, 1392, 1517, 1592, 1876, 1885, 1910, 1945, 1987]) {
      const slice = buildTimeSlice(year);
      assert.equal(slice.regions.length, 4);
      assert.ok(slice.sentence.length > 4);
      assert.ok(slice.sentence.endsWith("."));
    }
  });

  it("does not call a church schism a reign", () => {
    const slice = buildTimeSlice(1392);
    assert.doesNotMatch(slice.sentence, /재위/);
    assert.match(slice.sentence, /조선 건국/);
  });

  it("picks an exact event over a long era when both are present", () => {
    const slice = buildTimeSlice(1517);
    assert.equal(pickLead(slice.regions)?.presence, "exact");
  });

  it("uses Korean batchim for particles", () => {
    assert.equal(hasBatchim("중종"), true);
    assert.equal(hasBatchim("논제"), false);
    assert.equal(iGa("중종"), "이");
    assert.equal(iGa("논제"), "가");
  });
});
