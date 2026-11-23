import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(n) ? [p] : []; });
const files = ["app", "components", "lib"].flatMap(walk);

describe("the browser never touches the database", () => {
  it("has no direct table, RPC or storage calls on the Supabase client", () => {
    const bad = files.filter((f) => /supabase\s*\.\s*(from|rpc|storage)\b/.test(readFileSync(f, "utf8")));
    expect(bad).toEqual([]);
  });
  it("uses the Supabase client for Google sign-in only", () => {
    const bad = files.filter((f) => !/lib\/(supabase|api|session)\.tsx?$|auth\/callback/.test(f) && /supabase\.auth\.(?!signOut)/.test(readFileSync(f, "utf8")));
    expect(bad).toEqual([]);
  });
  it("keeps the cart out of browser storage", () => {
    expect(readFileSync("lib/cart.tsx", "utf8")).not.toMatch(/localStorage\.(set|get)Item\(KEY/);
  });
});
