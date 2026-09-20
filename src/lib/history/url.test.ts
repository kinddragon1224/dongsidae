import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseTimelineSearch, serializeTimelineSearch } from "./url.ts";

describe("research url", () => {
  it("round-trips year, zoom, regions, and event", () => {
    const encoded = serializeTimelineSearch({
      year: 1517,
      zoomId: "year",
      regions: ["christianity", "korea"],
      eventId: "luther-95",
    });
    const parsed = parseTimelineSearch(`?${encoded}`);
    assert.equal(parsed.year, 1517);
    assert.equal(parsed.zoomId, "year");
    assert.deepEqual(parsed.regions, ["christianity", "korea"]);
    assert.equal(parsed.eventId, "luther-95");
  });

  it("falls back safely on junk", () => {
    const parsed = parseTimelineSearch("?y=not-a-year&z=nope&r=mars&e=missing");
    assert.equal(parsed.year, 1517);
    assert.equal(parsed.zoomId, "decade");
    assert.equal(parsed.regions.length, 4);
    assert.equal(parsed.eventId, null);
  });

  it("parses BCE years in the y param", () => {
    assert.equal(parseTimelineSearch("?y=-4").year, -4);
    assert.equal(parseTimelineSearch("?y=기원전50").year, -50);
  });
});
