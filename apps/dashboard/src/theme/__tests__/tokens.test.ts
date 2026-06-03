import { describe, it, expect } from "vitest";
import { statusColorMap } from "../tokens";
import { ORDER_STATUS } from "@odyssey/shared";

/**
 * StatusBadge and the kanban columns colour orders by status via statusColorMap.
 * If a new ORDER_STATUS is ever added without a matching colour, badges silently
 * fall back to a grey default. These tests guard against that drift by asserting
 * the map covers every status with a valid hex colour.
 */
describe("statusColorMap", () => {
  it("has a colour for every ORDER_STATUS value", () => {
    for (const status of Object.values(ORDER_STATUS)) {
      expect(statusColorMap[status]).toBeDefined();
    }
  });

  it("maps each status to a 6-digit hex colour", () => {
    for (const color of Object.values(statusColorMap)) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("uses distinct colours per status", () => {
    const values = Object.values(statusColorMap);
    expect(new Set(values).size).toBe(values.length);
  });

  it("does not contain any extra keys beyond the known statuses", () => {
    const statusKeys = Object.values(ORDER_STATUS).sort();
    expect(Object.keys(statusColorMap).sort()).toEqual(statusKeys);
  });
});
