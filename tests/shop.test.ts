import { describe, expect, it } from "vitest";
import { notesList } from "../lib/useShop";

describe("notesList", () => {
  it("keeps only string notes and tolerates bad data", () => {
    expect(notesList(["a", 1, null, "b"])).toEqual(["a", "b"]);
    expect(notesList(null)).toEqual([]);
    expect(notesList({ a: 1 })).toEqual([]);
  });
});
