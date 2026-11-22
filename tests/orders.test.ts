import { describe, expect, it } from "vitest";
import { NEXT_ACTIONS, toCsv, orderError } from "../lib/orders";

describe("order helpers", () => {
  it("offers no shipping action before packing and no action after return", () => {
    expect(NEXT_ACTIONS.unfulfilled.map((a) => a.to)).toEqual(["processing"]);
    expect(NEXT_ACTIONS.returned).toBeUndefined();
    expect(NEXT_ACTIONS.packed.map((a) => a.to)).toEqual(["shipped"]);
  });
  it("escapes CSV and blocks spreadsheet formula injection", () => {
    const csv = toCsv([{ a: 'x"y', b: "=cmd()", c: "plain, comma" }]);
    expect(csv).toContain('"x""y"'); expect(csv).toContain(`"'=cmd()"`); expect(csv).toContain('"plain, comma"');
  });
  it("shows plain messages for known errors and hides unknown ones", () => {
    expect(orderError("tracking_required")).toMatch(/tracking/);
    expect(orderError("relation x does not exist")).toBe("Could not complete that action.");
  });
});
