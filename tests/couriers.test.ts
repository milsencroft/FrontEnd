import { describe, expect, it } from "vitest";
import { shipMessage, trackingLink, whatsappLink } from "../lib/couriers";

const couriers = [{ name: "Test Courier", url_template: "https://track.example/t/{tracking}", is_active: true }, { name: "Off", url_template: "https://off.example/{tracking}", is_active: false }];

describe("couriers", () => {
  it("builds a link from the saved template, ignoring case", () => { expect(trackingLink(couriers, "test courier", "AB 12")).toBe("https://track.example/t/AB%2012"); });
  it("returns null without a template, an inactive courier or a number", () => {
    expect(trackingLink(couriers, "Unknown", "1")).toBeNull(); expect(trackingLink(couriers, "Off", "1")).toBeNull(); expect(trackingLink(couriers, "Test Courier", "")).toBeNull();
  });
  it("adds 91 to ten-digit numbers and rejects bad ones", () => {
    expect(whatsappLink("98765 43210", "hi")).toBe("https://wa.me/919876543210?text=hi"); expect(whatsappLink("123", "hi")).toBeNull(); expect(whatsappLink(null, "hi")).toBeNull();
  });
  it("includes tracking details in the message", () => {
    const m = shipMessage({ name: "Asha", order: "MC-ORD-2026-00001", courier: "Test Courier", tracking: "AB12", link: "https://x" });
    expect(m).toContain("MC-ORD-2026-00001"); expect(m).toContain("AB12"); expect(m).toContain("https://x");
  });
});
