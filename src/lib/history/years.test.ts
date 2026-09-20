import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addYears,
  civilYearToOrdinal,
  clampYear,
  formatYearRange,
  ordinalToCivilYear,
  parseYearInput,
  signedYearDistance,
  sliderMaxValue,
  sliderToYear,
  ticksAround,
  yearToSlider,
  yearsBetween,
} from "./years.ts";

describe("chronology", () => {
  it("maps civil years onto a continuous ordinal with no year 0", () => {
    assert.equal(civilYearToOrdinal(-2), -1);
    assert.equal(civilYearToOrdinal(-1), 0);
    assert.equal(civilYearToOrdinal(1), 1);
    assert.equal(civilYearToOrdinal(2), 2);
    assert.equal(ordinalToCivilYear(-1), -2);
    assert.equal(ordinalToCivilYear(0), -1);
    assert.equal(ordinalToCivilYear(1), 1);
    assert.equal(ordinalToCivilYear(2), 2);
  });

  it("adds years across the BCE/CE boundary", () => {
    assert.equal(addYears(-1, 1), 1);
    assert.equal(addYears(1, -1), -1);
    assert.equal(addYears(30, -50), -21);
    assert.equal(addYears(-50, 100), 51);
  });

  it("counts inclusive civil distance", () => {
    assert.equal(yearsBetween(-1, 1), 1);
    assert.equal(yearsBetween(-2, 2), 3);
    assert.equal(signedYearDistance(-1, 1), 1);
    assert.equal(signedYearDistance(1, -1), -1);
    assert.equal(yearsBetween(1517, 1517), 0);
  });

  it("formats ranges in Korean", () => {
    assert.equal(formatYearRange(-6, -4), "기원전 6–4년");
    assert.equal(formatYearRange(1517), "1517년");
    assert.equal(formatYearRange(-1, 1), "기원전 1년 – 1년");
  });

  it("never emits year 0 from public helpers", () => {
    assert.notEqual(addYears(-1, 1), 0);
    assert.notEqual(addYears(1, -1), 0);
    assert.notEqual(clampYear(0), 0);
    assert.equal(clampYear(0), 1);
    for (const tick of ticksAround(1, 20, 1)) {
      assert.notEqual(tick, 0);
    }
  });

  it("clamps to bounds and rejects invalid numbers", () => {
    assert.equal(clampYear(Number.NaN), 1517);
    assert.equal(clampYear(-9999, -221, 2020), -221);
    assert.equal(clampYear(4000, -221, 2020), 2020);
  });

  it("parses historical year strings", () => {
    assert.equal(parseYearInput("325"), 325);
    assert.equal(parseYearInput("325년"), 325);
    assert.equal(parseYearInput("기원전 50년"), -50);
    assert.equal(parseYearInput("BC 50"), -50);
    assert.equal(parseYearInput("BCE 50"), -50);
    assert.equal(parseYearInput("서기 325"), 325);
    assert.equal(parseYearInput("1517년"), 1517);
    assert.equal(parseYearInput("0"), null);
    assert.equal(parseYearInput("기원전 0"), null);
    assert.equal(parseYearInput(""), null);
  });

  it("places ticks across the era boundary", () => {
    const ticks = ticksAround(1, 12, 1);
    assert.ok(ticks.includes(-1));
    assert.ok(ticks.includes(1));
    assert.ok(!ticks.includes(0));
  });

  it("converts slider values without exposing year 0", () => {
    const min = -10;
    const max = 10;
    const span = sliderMaxValue(min, max);
    for (let i = 0; i <= span; i += 1) {
      const year = sliderToYear(i, min);
      assert.notEqual(year, 0);
      assert.equal(yearToSlider(year, min), i);
    }
    assert.equal(sliderToYear(yearToSlider(-1, min), min), -1);
    assert.equal(sliderToYear(yearToSlider(1, min), min), 1);
  });
});
