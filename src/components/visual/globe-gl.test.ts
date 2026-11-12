import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ERA_SHORTCUTS } from "../../lib/history/constants.ts";
import { getEventById } from "../../lib/history/query.ts";
import { buildTimeSlice } from "../../lib/history/slice.ts";
import { latLngToVector, viewForPins } from "./globe-gl.ts";

const DEG = Math.PI / 180;

describe("globe view", () => {
  it("keeps every pin of every home year on the visible side", () => {
    for (const era of ERA_SHORTCUTS) {
      const pins = buildTimeSlice(era.year).regions.flatMap((row) => {
        const place = row.eventId ? getEventById(row.eventId)?.place : undefined;
        return place ? [place] : [];
      });
      assert.ok(pins.length >= 2, `${era.year}: 지구본에 찍을 곳이 2곳은 있어야 한다`);
      const view = viewForPins(pins);
      const center = latLngToVector(view.lat, view.lng);
      for (const pin of pins) {
        const away = center.angleTo(latLngToVector(pin.lat, pin.lng)) / DEG;
        assert.ok(away < 70, `${era.year} ${pin.name}: 정면에서 ${away.toFixed(0)}° — 가장자리 밖`);
      }
    }
  });

  it("has sane coordinates", () => {
    for (const era of ERA_SHORTCUTS) {
      for (const row of buildTimeSlice(era.year).regions) {
        const place = row.eventId ? getEventById(row.eventId)?.place : undefined;
        if (!place) continue;
        assert.ok(Math.abs(place.lat) <= 90 && Math.abs(place.lng) <= 180, place.name);
      }
    }
  });
});
