import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HISTORY_EVENTS } from "../../data/history-events.ts";
import { EVENTS_BY_ID, YEAR_MAX, YEAR_MIN } from "./catalog.ts";
import { REGIONS } from "./types.ts";

const SIGNIFICANCE = new Set([1, 2, 3, 4, 5]);
const CONFIDENCE = new Set(["high", "medium", "low"]);
const KINDS = new Set(["event", "era", "person", "war", "council", "work"]);

describe("history data integrity", () => {
  it("has unique ids", () => {
    const seen = new Set<string>();
    const dup: string[] = [];
    for (const event of HISTORY_EVENTS) {
      if (seen.has(event.id)) dup.push(event.id);
      seen.add(event.id);
    }
    assert.deepEqual(dup, []);
  });

  it("keeps region, years, and enums valid", () => {
    const failures: string[] = [];
    for (const event of HISTORY_EVENTS) {
      if (!(REGIONS as readonly string[]).includes(event.region)) {
        failures.push(`${event.id}: invalid region ${event.region}`);
      }
      if (event.startYear === 0) failures.push(`${event.id}: startYear is 0`);
      if (event.endYear === 0) failures.push(`${event.id}: endYear is 0`);
      if (event.endYear != null && event.endYear < event.startYear) {
        failures.push(`${event.id}: endYear before startYear`);
      }
      if (!SIGNIFICANCE.has(event.significance)) {
        failures.push(`${event.id}: bad significance`);
      }
      if (!CONFIDENCE.has(event.confidence)) {
        failures.push(`${event.id}: bad confidence`);
      }
      if (!KINDS.has(event.kind)) failures.push(`${event.id}: bad kind`);
      if (event.startYear < YEAR_MIN || event.startYear > YEAR_MAX) {
        failures.push(`${event.id}: startYear outside bounds`);
      }
      if (event.endYear != null && (event.endYear < YEAR_MIN || event.endYear > YEAR_MAX)) {
        failures.push(`${event.id}: endYear outside bounds`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("points relatedEventIds at real events, never self", () => {
    const failures: string[] = [];
    for (const event of HISTORY_EVENTS) {
      for (const id of event.relatedEventIds ?? []) {
        if (id === event.id) failures.push(`${event.id}: related to self`);
        if (!EVENTS_BY_ID.has(id)) failures.push(`${event.id}: missing related ${id}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("keeps source records well-formed", () => {
    const failures: string[] = [];
    for (const event of HISTORY_EVENTS) {
      if (event.sources) {
        for (const source of event.sources) {
          if (!source.title?.trim()) failures.push(`${event.id}: empty source title`);
          if (source.url && !/^https?:\/\//.test(source.url)) {
            failures.push(`${event.id}: bad source url ${source.url}`);
          }
        }
      }
      if ((!event.sources || event.sources.length === 0) && !event.needsVerification) {
        failures.push(`${event.id}: missing sources without needsVerification`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("flags duplicate title + year pairs", () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const event of HISTORY_EVENTS) {
      const key = `${event.region}:${event.title}:${event.startYear}`;
      const prev = seen.get(key);
      if (prev) dup.push(`${prev} ~ ${event.id}`);
      else seen.set(key, event.id);
    }
    assert.deepEqual(dup, []);
  });
});
