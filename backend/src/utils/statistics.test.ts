import { describe, it, expect } from "vitest";
import { percentile } from "./statistics";

describe("percentile()", () => {
  it("returns 0 for an empty array", () => {
    expect(percentile([], 50)).toBe(0);
  });

  it("returns the single element for a one-element array", () => {
    expect(percentile([42], 50)).toBe(42);
    expect(percentile([42], 0)).toBe(42);
    expect(percentile([42], 100)).toBe(42);
  });

  it("returns the minimum for P0", () => {
    expect(percentile([10, 20, 30, 40, 50], 0)).toBe(10);
  });

  it("returns the maximum for P100", () => {
    expect(percentile([10, 20, 30, 40, 50], 100)).toBe(50);
  });

  it("returns the median (P50) of an odd-length array", () => {
    // sorted: [1, 2, 3, 4, 5] → index 2 → value 3
    expect(percentile([3, 1, 5, 2, 4], 50)).toBe(3);
  });

  it("returns the median (P50) of an even-length array via interpolation", () => {
    // sorted: [1, 2, 3, 4] → index 1.5 → 2 + (3-2)*0.5 = 2.5
    expect(percentile([4, 1, 3, 2], 50)).toBe(2.5);
  });

  it("computes P25 correctly", () => {
    // sorted: [1,2,3,4,5,6,7,8,9,10] → index 2.25 → 3 + (4-3)*0.25 = 3.25
    expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 25)).toBe(3.25);
  });

  it("computes P75 correctly", () => {
    // sorted: [1..10] → index 6.75 → 7 + (8-7)*0.75 = 7.75
    expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 75)).toBe(7.75);
  });

  it("computes P90 correctly", () => {
    // sorted: [1..10] → index 8.1 → 9 + (10-9)*0.1 = 9.1
    expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90)).toBe(9.1);
  });

  it("handles duplicate values", () => {
    expect(percentile([5, 5, 5, 5], 50)).toBe(5);
  });

  it("does not mutate the input array", () => {
    const input = [3, 1, 2];
    percentile(input, 50);
    expect(input).toEqual([3, 1, 2]);
  });

  it("handles large salary values without precision loss", () => {
    const salaries = [3_000_000, 4_500_000, 6_000_000];
    expect(percentile(salaries, 50)).toBe(4_500_000);
  });
});
