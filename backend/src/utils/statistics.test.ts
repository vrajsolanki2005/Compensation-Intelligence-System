import { describe, expect, it } from "vitest";

import { percentile } from "./statistics";

describe("percentile", () => {
  it("calculates the median", () => {
    const result = percentile([10, 20, 30, 40, 50], 50);

    expect(result).toBe(30);
  });

  it("calculates p25", () => {
    const result = percentile([10, 20, 30, 40, 50], 25);

    expect(result).toBe(20);
  });

  it("returns zero for empty values", () => {
    expect(percentile([], 50)).toBe(0);
  });
});
