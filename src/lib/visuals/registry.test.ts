import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { EVENTS_BY_ID } from "../history/catalog.ts";
import {
  PORTALS,
  VISUAL_ASSETS,
  getVisualById,
  visualForEvent,
  visualForYear,
} from "./registry.ts";

describe("visual asset registry", () => {
  it("records source, license, and caption for every asset", () => {
    const failures: string[] = [];
    for (const asset of VISUAL_ASSETS) {
      if (asset.source.length < 8) failures.push(`${asset.id}: short source`);
      if (!asset.sourceUrl.startsWith("https://")) {
        failures.push(`${asset.id}: sourceUrl`);
      }
      if (asset.license.length < 3) failures.push(`${asset.id}: license`);
      if (asset.caption.length < 12) failures.push(`${asset.id}: caption`);
      if (asset.alt.length < 8) failures.push(`${asset.id}: alt`);
      if (typeof asset.reconstruction !== "boolean") {
        failures.push(`${asset.id}: reconstruction`);
      }
      if (!asset.src.startsWith("/visuals/") || !asset.src.endsWith(".webp")) {
        failures.push(`${asset.id}: src ${asset.src}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("points eventIds at real catalog events", () => {
    const failures: string[] = [];
    for (const asset of VISUAL_ASSETS) {
      for (const id of asset.eventIds ?? []) {
        if (!EVENTS_BY_ID.has(id)) failures.push(`${asset.id} → ${id}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("keeps every file on disk", () => {
    const root = path.join(process.cwd(), "public");
    for (const asset of VISUAL_ASSETS) {
      const file = path.join(root, asset.src);
      assert.equal(existsSync(file), true, file);
    }
  });

  it("covers the four portal years with sourced images", () => {
    assert.deepEqual(
      PORTALS.map((portal) => portal.year),
      [325, 1517, 1885, 1945],
    );
    for (const portal of PORTALS) {
      assert.ok(getVisualById(portal.visualId), portal.visualId);
    }
  });

  it("selects landmark visuals without inventing ids", () => {
    assert.equal(visualForEvent("luther-95")?.id, "luther-theses");
    assert.equal(visualForEvent("nicaea-325")?.id, "nicaea-icon");
    assert.equal(visualForEvent("korea-mission-1885")?.id, "chemulpo-map");
    assert.equal(visualForYear(1945)?.id, "seoul-1945");
    assert.equal(visualForEvent("no-such-event"), undefined);
  });

  it("flags reconstructions so they are not shown as photographs", () => {
    assert.equal(getVisualById("luther-posting")?.reconstruction, true);
    assert.equal(getVisualById("nicaea-icon")?.reconstruction, true);
    assert.equal(getVisualById("luther-theses")?.reconstruction, false);
    assert.equal(getVisualById("seoul-1945")?.reconstruction, false);
  });
});
