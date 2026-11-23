const IST = "Asia/Kolkata";
/** Today's date in India as YYYY-MM-DD. */
export const todayIST = (now = new Date()) => now.toLocaleDateString("en-CA", { timeZone: IST });
const shift = (ymd: string, days: number) => { const d = new Date(`${ymd}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };

export type Preset = "7" | "30" | "month" | "year";
export const presetRange = (p: Preset, now = new Date()): { from: string; to: string } => {
  const to = todayIST(now);
  if (p === "7") return { from: shift(to, -6), to };
  if (p === "30") return { from: shift(to, -29), to };
  if (p === "month") return { from: `${to.slice(0, 7)}-01`, to };
  return { from: `${to.slice(0, 4)}-01-01`, to };
};

/** Fills days with no orders so the chart has one bar per day. */
export const fillDays = (rows: { day: string; orders: number; gross_paise: number }[], from: string, to: string) => {
  const by = new Map(rows.map((r) => [r.day, r])); const out: { day: string; orders: number; gross_paise: number }[] = [];
  for (let d = from, n = 0; d <= to && n < 400; d = shift(d, 1), n++) out.push(by.get(d) ?? { day: d, orders: 0, gross_paise: 0 });
  return out;
};
