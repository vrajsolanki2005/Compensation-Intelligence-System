import { describe, it, expect } from "vitest";
import { compensationSchema } from "./compensation.validator";

const VALID_INPUT = {
  companyId: 1,
  roleId: 2,
  levelId: 3,
  locationId: 4,
  experienceYears: 3,
  baseSalary: 3_000_000,
  bonus: 500_000,
  equity: 1_000_000,
  compensationYear: 2024,
  verified: false,
};

describe("compensationSchema", () => {
  it("accepts a fully valid input", () => {
    const result = compensationSchema.safeParse(VALID_INPUT);
    expect(result.success).toBe(true);
  });

  it("defaults bonus and equity to 0 when omitted", () => {
    const { bonus, equity, ...rest } = VALID_INPUT;
    const result = compensationSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bonus).toBe(0);
      expect(result.data.equity).toBe(0);
    }
  });

  it("defaults verified to false when omitted", () => {
    const { verified, ...rest } = VALID_INPUT;
    const result = compensationSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.verified).toBe(false);
    }
  });

  it("rejects a negative baseSalary", () => {
    const result = compensationSchema.safeParse({ ...VALID_INPUT, baseSalary: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero baseSalary", () => {
    const result = compensationSchema.safeParse({ ...VALID_INPUT, baseSalary: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative experience years", () => {
    const result = compensationSchema.safeParse({ ...VALID_INPUT, experienceYears: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects experience years above 50", () => {
    const result = compensationSchema.safeParse({ ...VALID_INPUT, experienceYears: 51 });
    expect(result.success).toBe(false);
  });

  it("rejects compensationYear before 2000", () => {
    const result = compensationSchema.safeParse({ ...VALID_INPUT, compensationYear: 1999 });
    expect(result.success).toBe(false);
  });

  it("rejects compensationYear after 2100", () => {
    const result = compensationSchema.safeParse({ ...VALID_INPUT, compensationYear: 2101 });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = compensationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces string numbers to numbers", () => {
    const result = compensationSchema.safeParse({
      ...VALID_INPUT,
      companyId: "1",
      baseSalary: "3000000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.baseSalary).toBe(3_000_000);
    }
  });

  it("rejects a non-positive companyId", () => {
    const result = compensationSchema.safeParse({ ...VALID_INPUT, companyId: 0 });
    expect(result.success).toBe(false);
  });
});
