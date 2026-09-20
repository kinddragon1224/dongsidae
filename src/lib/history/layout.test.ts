import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { layoutCards } from "./layout.ts";

describe("card layout", () => {
  it("keeps isolated cards on their natural y", () => {
    const laid = layoutCards(
      [
        { id: "a", naturalY: 100, significance: 5 },
        { id: "b", naturalY: 300, significance: 4 },
      ],
      62,
    );
    assert.equal(laid[0]?.y, 100);
    assert.equal(laid[1]?.y, 300);
    assert.equal(laid[0]?.lane, 0);
  });

  it("uses a second lane before distorting time", () => {
    const laid = layoutCards(
      [
        { id: "a", naturalY: 100, significance: 5 },
        { id: "b", naturalY: 110, significance: 4 },
      ],
      62,
    );
    assert.equal(laid.length, 2);
    const lanes = new Set(laid.map((item) => item.lane));
    assert.equal(lanes.size, 2);
    for (const item of laid) {
      assert.ok(Math.abs(item.y - item.naturalY) <= 10);
    }
  });

  it("clusters overflow instead of pushing cards down the axis", () => {
    const laid = layoutCards(
      [
        { id: "a", naturalY: 100, significance: 5 },
        { id: "b", naturalY: 102, significance: 4 },
        { id: "c", naturalY: 104, significance: 3 },
        { id: "d", naturalY: 106, significance: 2 },
      ],
      62,
    );
    const clustered = laid.reduce((n, item) => n + item.cluster.length, 0);
    assert.ok(clustered >= 1);
    assert.ok(laid.length < 4);
    for (const item of laid) {
      assert.ok(Math.abs(item.y - item.naturalY) <= 10);
    }
  });
});
