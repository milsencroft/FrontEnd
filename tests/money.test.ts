import { describe, expect, it } from "vitest";
import { rupees } from "../lib/money";
import { errorText, ApiError } from "../lib/api";

describe("display helpers", () => {
  it("formats integer paise as rupees", () => {
    expect(rupees(99900)).toBe("₹999");
    expect(rupees(199900)).toBe("₹1,999");
    expect(rupees(15239)).toBe("₹152.39");
  });
  it("maps API error codes to customer text, and never leaks unknown codes", () => {
    expect(errorText(new ApiError("closed", 409))).toBe("This launch is fully allocated.");
    expect(errorText(new ApiError("weird_internal", 500))).toBe("Something went wrong. Please try again.");
  });
});
