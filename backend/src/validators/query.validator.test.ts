import { describe, it, expect } from "vitest";
import { compensationQuerySchema } from "./query.validator";

describe("compensationQuerySchema", () => {
  it("applies all defaults when called with an empty object", () => {
    const result = compensationQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe("totalCompensation");
      expect(result.data.order).toBe("desc");
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts all valid sort field values", () => {
    const fields = ["base", "bonus", "equity", "totalCompensation", "experience"];
    for (const sort of fields) {
      const result = compensationQuerySchema.safeParse({ sort });
      expect(result.success, `sort="${sort}" should be valid`).toBe(true);
    }
  });

  it("rejects an invalid sort field", () => {
    const result = compensationQuerySchema.safeParse({ sort: "baseSalary" });
    expect(result.success).toBe(false);
  });

  it("accepts order asc and desc", () => {
    expect(compensationQuerySchema.safeParse({ order: "asc" }).success).toBe(true);
    expect(compensationQuerySchema.safeParse({ order: "desc" }).success).toBe(true);
  });

  it("rejects an invalid order value", () => {
    expect(compensationQuerySchema.safeParse({ order: "ascending" }).success).toBe(false);
  });

  it("coerces string page to integer", () => {
    const result = compensationQuerySchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });

  it("rejects page 0 (must be positive)", () => {
    expect(compensationQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(compensationQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("accepts limit of exactly 100", () => {
    expect(compensationQuerySchema.safeParse({ limit: 100 }).success).toBe(true);
  });

  it("coerces string IDs to positive integers", () => {
    const result = compensationQuerySchema.safeParse({
      companyId: "5",
      roleId: "2",
      levelId: "1",
      locationId: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(5);
      expect(result.data.roleId).toBe(2);
    }
  });

  it("rejects a non-positive companyId", () => {
    expect(compensationQuerySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("accepts minTC and maxTC as decimals", () => {
    const result = compensationQuerySchema.safeParse({ minTC: "500000", maxTC: "2000000" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minTC).toBe(500_000);
      expect(result.data.maxTC).toBe(2_000_000);
    }
  });
});
