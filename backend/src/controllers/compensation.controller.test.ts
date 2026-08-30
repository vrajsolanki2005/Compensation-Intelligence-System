import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

// ---------------------------------------------------------------------------
// Mock Prisma so tests never touch the real database
// ---------------------------------------------------------------------------
vi.mock("../lib/prisma", () => ({
  prisma: {
    compensationRecord: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/prisma";

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------
const makeRecord = (overrides = {}) => ({
  id: 1,
  baseSalary: 3_000_000,
  bonus: 500_000,
  equity: 1_000_000,
  totalCompensation: 4_500_000,
  experienceYears: 3,
  compensationYear: 2024,
  verified: true,
  company: { id: 1, name: "Google" },
  role: { id: 1, name: "Software Engineer" },
  level: { id: 1, name: "IC3", rank: 3 },
  location: { id: 1, city: "Bengaluru", country: "India" },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// GET /api/compensation
// ===========================================================================
describe("GET /api/compensation", () => {
  it("returns 200 with transformed records", async () => {
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue([makeRecord()] as any);
    vi.mocked(prisma.compensationRecord.count).mockResolvedValue(1);

    const res = await request(app).get("/api/compensation");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);

    const record = res.body.data[0];
    // Verify flat shape (not nested)
    expect(record.companyName).toBe("Google");
    expect(record.roleName).toBe("Software Engineer");
    expect(record.levelName).toBe("IC3");
    expect(record.locationName).toBe("Bengaluru, India");
    expect(record.base).toBe(3_000_000);
    expect(record.experience).toBe(3);
    // Raw DB keys must NOT be present in the response
    expect(record.baseSalary).toBeUndefined();
    expect(record.experienceYears).toBeUndefined();
  });

  it("returns pagination metadata", async () => {
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue([makeRecord()] as any);
    vi.mocked(prisma.compensationRecord.count).mockResolvedValue(42);

    const res = await request(app).get("/api/compensation?page=2&limit=10");

    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({
      page: 2,
      limit: 10,
      total: 42,
      totalPages: 5,
    });
  });

  it("returns 400 for an invalid sort field", async () => {
    const res = await request(app).get("/api/compensation?sort=baseSalary");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a non-positive page", async () => {
    const res = await request(app).get("/api/compensation?page=0");
    expect(res.status).toBe(400);
  });

  it("returns empty data array when no records match", async () => {
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue([]);
    vi.mocked(prisma.compensationRecord.count).mockResolvedValue(0);

    const res = await request(app).get("/api/compensation");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it("passes companyId filter to Prisma", async () => {
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue([]);
    vi.mocked(prisma.compensationRecord.count).mockResolvedValue(0);

    await request(app).get("/api/compensation?companyId=5");

    expect(prisma.compensationRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: 5 }),
      }),
    );
  });
});

// ===========================================================================
// GET /api/compensation/summary
// ===========================================================================
describe("GET /api/compensation/summary", () => {
  it("returns 200 with percentile data and count field", async () => {
    const records = Array.from({ length: 4 }, (_, i) =>
      ({ baseSalary: 1_000_000 * (i + 1), bonus: 100_000, equity: 200_000, totalCompensation: 1_300_000 * (i + 1) }),
    );
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue(records as any);

    const res = await request(app).get(
      "/api/compensation/summary?roleId=1&levelId=1&locationId=1",
    );

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(4);
    expect(res.body.data.base).toHaveProperty("p25");
    expect(res.body.data.base).toHaveProperty("p50");
    expect(res.body.data.base).toHaveProperty("p75");
    expect(res.body.data.base).toHaveProperty("p90");
    expect(res.body.data.totalCompensation).toHaveProperty("p50");
  });

  it("returns 400 when required params are missing", async () => {
    const res = await request(app).get("/api/compensation/summary?roleId=1");
    expect(res.status).toBe(400);
  });

  it("returns zero percentiles when no records match", async () => {
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue([]);

    const res = await request(app).get(
      "/api/compensation/summary?roleId=1&levelId=1&locationId=1",
    );

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(0);
    expect(res.body.data.base.p50).toBe(0);
  });
});

// ===========================================================================
// GET /api/compensation/compare
// ===========================================================================
describe("GET /api/compensation/compare", () => {
  it("returns 200 with correctly keyed comparison rows", async () => {
    const records = [
      makeRecord({ companyId: 1, company: { id: 1, name: "Google" } }),
      makeRecord({ id: 2, companyId: 2, company: { id: 2, name: "Meta" }, baseSalary: 3_500_000, totalCompensation: 5_000_000 }),
    ];
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue(records as any);

    const res = await request(app).get(
      "/api/compensation/compare?roleId=1&levelId=1&locationId=1&companyIds=1,2",
    );

    expect(res.status).toBe(200);
    const row = res.body.data[0];
    // Keys must be base/bonus/equity/totalCompensation (not baseMedian etc.)
    expect(row).toHaveProperty("base");
    expect(row).toHaveProperty("bonus");
    expect(row).toHaveProperty("equity");
    expect(row).toHaveProperty("totalCompensation");
    expect(row).toHaveProperty("sampleCount");
    expect(row).not.toHaveProperty("baseMedian");
    expect(row).not.toHaveProperty("bonusMedian");
  });

  it("returns 400 when roleId is missing", async () => {
    const res = await request(app).get(
      "/api/compensation/compare?levelId=1&locationId=1",
    );
    expect(res.status).toBe(400);
  });

  it("sorts results by totalCompensation descending", async () => {
    const records = [
      makeRecord({ companyId: 1, company: { id: 1, name: "TCS" }, totalCompensation: 2_000_000 }),
      makeRecord({ id: 2, companyId: 2, company: { id: 2, name: "Google" }, totalCompensation: 10_000_000 }),
    ];
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue(records as any);

    const res = await request(app).get(
      "/api/compensation/compare?roleId=1&levelId=1&locationId=1&companyIds=1,2",
    );

    expect(res.status).toBe(200);
    const names = res.body.data.map((r: any) => r.companyName);
    expect(names[0]).toBe("Google"); // higher TC comes first
  });
});

// ===========================================================================
// GET /api/compensation/:id
// ===========================================================================
describe("GET /api/compensation/:id", () => {
  it("returns 200 with the record when found", async () => {
    vi.mocked(prisma.compensationRecord.findUnique).mockResolvedValue(makeRecord() as any);

    const res = await request(app).get("/api/compensation/1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 when the record does not exist", async () => {
    vi.mocked(prisma.compensationRecord.findUnique).mockResolvedValue(null);

    const res = await request(app).get("/api/compensation/9999");
    expect(res.status).toBe(404);
  });
});
