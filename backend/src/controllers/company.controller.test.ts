import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

// ---------------------------------------------------------------------------
// Mock Prisma so tests never touch the real database
// ---------------------------------------------------------------------------
vi.mock("../lib/prisma", () => ({
  prisma: {
    company: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    compensationRecord: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/prisma";

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockCompany = {
  id: 1,
  name: "Google",
  normalizedName: "google",
  website: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeLevelRecord = (levelId: number, levelName: string, rank: number, tc: number) => ({
  totalCompensation: tc,
  level: { id: levelId, name: levelName, rank },
});

// ===========================================================================
// GET /api/companies
// ===========================================================================
describe("GET /api/companies", () => {
  it("returns 200 with an array of companies", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([mockCompany] as any);

    const res = await request(app).get("/api/companies");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Google");
  });

  it("returns an empty array when no companies exist", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);

    const res = await request(app).get("/api/companies");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it("returns 500 when Prisma throws", async () => {
    vi.mocked(prisma.company.findMany).mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/api/companies");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===========================================================================
// GET /api/companies/:id
// ===========================================================================
describe("GET /api/companies/:id", () => {
  it("returns 200 with the company when found", async () => {
    vi.mocked(prisma.company.findUnique).mockResolvedValue(mockCompany as any);

    const res = await request(app).get("/api/companies/1");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Google");
  });

  it("returns 404 when the company does not exist", async () => {
    vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

    const res = await request(app).get("/api/companies/9999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for id = 0", async () => {
    const res = await request(app).get("/api/companies/0");
    expect(res.status).toBe(400);
  });
});

// ===========================================================================
// GET /api/companies/:id/compensation-summary
// ===========================================================================
describe("GET /api/companies/:id/compensation-summary", () => {
  it("returns 200 with level summaries sorted by rank", async () => {
    const records = [
      makeLevelRecord(1, "IC2", 2, 2_000_000),
      makeLevelRecord(1, "IC2", 2, 2_500_000),
      makeLevelRecord(2, "IC3", 3, 4_500_000),
      makeLevelRecord(3, "IC4", 4, 7_000_000),
    ];
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue(records as any);

    const res = await request(app).get("/api/companies/1/compensation-summary");

    expect(res.status).toBe(200);
    expect(res.body.data.levels).toHaveLength(3);

    const levelNames = res.body.data.levels.map((l: any) => l.levelName);
    expect(levelNames).toEqual(["IC2", "IC3", "IC4"]); // sorted by rank

    const ic2 = res.body.data.levels[0];
    expect(ic2.levelId).toBe(1);
    expect(ic2.sampleCount).toBe(2);
    expect(ic2.medianTotalCompensation).toBe(2_250_000); // median of 2M and 2.5M
  });

  it("returns empty levels array when company has no records", async () => {
    vi.mocked(prisma.compensationRecord.findMany).mockResolvedValue([]);

    const res = await request(app).get("/api/companies/1/compensation-summary");

    expect(res.status).toBe(200);
    expect(res.body.data.levels).toHaveLength(0);
  });

  it("returns 400 for id = 0", async () => {
    const res = await request(app).get("/api/companies/0/compensation-summary");
    expect(res.status).toBe(400);
  });

  it("returns 500 when Prisma throws", async () => {
    vi.mocked(prisma.compensationRecord.findMany).mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/companies/1/compensation-summary");
    expect(res.status).toBe(500);
  });
});
