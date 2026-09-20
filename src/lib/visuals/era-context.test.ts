import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { VISUAL_ASSETS } from "./registry.ts";
import { eraBandForYear, eraTextureForYear, eraWashForYear } from "./era-context.ts";

describe("era visual context", () => {
  it("only points at sourced registry ids", () => {
    const known = new Set(VISUAL_ASSETS.map((asset) => asset.id));
    for (const year of [325, 800, 1392, 1517, 1885, 1945]) {
      const band = eraBandForYear(year);
      for (const id of band.visualIds) {
        assert.equal(known.has(id), true, id);
      }
    }
  });

  it("does not wash 800 with a 325 nicaea icon", () => {
    assert.equal(eraWashForYear(800), undefined);
    assert.equal(eraTextureForYear(800), "medieval");
  });

  it("may wash portal years with an image that actually belongs there", () => {
    assert.ok(eraWashForYear(325));
    assert.ok(["nicaea-icon", "goguryeo-hunt", "luo-river", "constantine-head"].includes(eraWashForYear(325)!.id));
    assert.ok(eraWashForYear(1517));
    assert.ok(eraWashForYear(1945));
  });

  it("keeps textures in the archive register", () => {
    assert.equal(eraTextureForYear(325), "antiquity");
    assert.equal(eraTextureForYear(1517), "early-modern");
    assert.equal(eraTextureForYear(1885), "modern");
  });
});
