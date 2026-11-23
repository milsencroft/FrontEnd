import { describe, expect, it } from "vitest";
import { fillDays, presetRange, todayIST } from "../lib/reports";

describe("reports helpers", () => {
  it("uses the India date, not UTC", () => { expect(todayIST(new Date("2026-11-22T20:00:00Z"))).toBe("2026-11-23"); });
  it("builds presets ending today", () => {
    const now = new Date("2026-11-23T06:00:00Z");
    expect(presetRange("7", now)).toEqual({ from: "2026-11-17", to: "2026-11-23" });
    expect(presetRange("30", now)).toEqual({ from: "2026-10-25", to: "2026-11-23" });
    expect(presetRange("month", now)).toEqual({ from: "2026-11-01", to: "2026-11-23" });
    expect(presetRange("year", now)).toEqual({ from: "2026-01-01", to: "2026-11-23" });
  });
  it("fills empty days", () => {
    const r = fillDays([{ day: "2026-11-02", orders: 2, gross_paise: 500 }], "2026-11-01", "2026-11-03");
    expect(r.map((x) => x.orders)).toEqual([0, 2, 0]);
  });
});
