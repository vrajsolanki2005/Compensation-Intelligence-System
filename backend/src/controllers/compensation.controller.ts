import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { compensationSchema } from "../validators/compensation.validator.js";
import { createCompensation } from "../services/compensation.service.js";
import { percentile } from "../utils/statistics.js";
import { compensationQuerySchema } from "../validators/query.validator.js";
export async function getCompensation(req: Request, res: Response) {
  try {
    const parsed = compensationQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: parsed.error.flatten(),
      });
    }

    const {
      companyId,
      roleId,
      levelId,
      locationId,
      minTC,
      maxTC,
      minExperience,
      maxExperience,
      sort,
      order,
      page,
      limit,
    } = parsed.data;

    const pageNumber = page;
    const limitNumber = limit;
    const skip = (pageNumber - 1) * limitNumber;
    

    const allowedSortFields = [
      "baseSalary",
      "bonus",
      "equity",
      "totalCompensation",
      "experienceYears",
    ];

    const sortField=sort;
    const sortOrder=order;

    const where = {
      ...(companyId ? { companyId: Number(companyId) } : {}),

      ...(roleId ? { roleId: Number(roleId) } : {}),

      ...(levelId ? { levelId: Number(levelId) } : {}),

      ...(locationId ? { locationId: Number(locationId) } : {}),

      ...(minTC
        ? {
            totalCompensation: {
              gte: Number(minTC),
              ...(maxTC ? { lte: Number(maxTC) } : {}),
            },
          }
        : maxTC
          ? {
              totalCompensation: {
                lte: Number(maxTC),
              },
            }
          : {}),

      ...(minExperience
        ? {
            experienceYears: {
              gte: Number(minExperience),
              ...(maxExperience ? { lte: Number(maxExperience) } : {}),
            },
          }
        : maxExperience
          ? {
              experienceYears: {
                lte: Number(maxExperience),
              },
            }
          : {}),
    };

    const [records, total] = await Promise.all([
      prisma.compensationRecord.findMany({
        where,

        select: {
          id: true,
          experienceYears: true,
          baseSalary: true,
          bonus: true,
          equity: true,
          totalCompensation: true,
          compensationYear: true,
          verified: true,

          company: {
            select: {
              id: true,
              name: true,
            },
          },

          role: {
            select: {
              id: true,
              name: true,
            },
          },

          level: {
            select: {
              id: true,
              name: true,
              rank: true,
            },
          },

          location: {
            select: {
              id: true,
              city: true,
              country: true,
              currency: true,
            },
          },
        },

        orderBy: {
          [sortField]: sortOrder,
        },

        skip,
        take: limitNumber,
      }),

      prisma.compensationRecord.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: records,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch compensation data",
    });
  }
}

export async function getCompensationById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid compensation ID",
      });
    }

    const record = await prisma.compensationRecord.findUnique({
      where: { id },

      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Compensation record not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch compensation record",
    });
  }
}

export async function createCompensationRecord(req: Request, res: Response) {
  try {
    const validation = compensationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid compensation data",
        errors: validation.error.flatten(),
      });
    }

    const record = await createCompensation(validation.data);

    return res.status(201).json({
      success: true,
      message: "Compensation record created successfully",
      data: record,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create compensation record";

    if (
      message === "Company not found" ||
      message === "Role not found" ||
      message === "Level not found" ||
      message === "Location not found"
    ) {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message === "Duplicate compensation record") {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create compensation record",
    });
  }
}

function calculateMedian(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export async function compareCompensation(req: Request, res: Response) {
  try {
    const { roleId, levelId, locationId, companyIds } = req.query;

    if (!roleId || !levelId || !locationId) {
      return res.status(400).json({
        success: false,
        message: "roleId, levelId and locationId are required",
      });
    }

    const companyIdList = companyIds
      ? String(companyIds).split(",").map(Number).filter(Boolean)
      : [];

    const records = await prisma.compensationRecord.findMany({
      where: {
        roleId: Number(roleId),
        levelId: Number(levelId),
        locationId: Number(locationId),

        ...(companyIdList.length > 0
          ? {
              companyId: {
                in: companyIdList,
              },
            }
          : {}),
      },

      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
    });

    const grouped = new Map<number, typeof records>();

    for (const record of records) {
      const existing = grouped.get(record.companyId) ?? [];

      existing.push(record);

      grouped.set(record.companyId, existing);
    }

    const comparison = Array.from(grouped.entries()).map(
      ([companyId, companyRecords]) => {
        const baseValues = companyRecords.map((record) => record.baseSalary);

        const bonusValues = companyRecords.map((record) => record.bonus);

        const equityValues = companyRecords.map((record) => record.equity);

        const totalValues = companyRecords.map(
          (record) => record.totalCompensation,
        );

        return {
          companyId,

          companyName: companyRecords[0].company.name,

          sampleCount: companyRecords.length,

          baseMedian: Math.round(calculateMedian(baseValues)),

          bonusMedian: Math.round(calculateMedian(bonusValues)),

          equityMedian: Math.round(calculateMedian(equityValues)),

          totalCompensationMedian: Math.round(calculateMedian(totalValues)),
        };
      },
    );

    comparison.sort(
      (a, b) => b.totalCompensationMedian - a.totalCompensationMedian,
    );

    return res.json({
      success: true,

      filters: {
        roleId: Number(roleId),
        levelId: Number(levelId),
        locationId: Number(locationId),
      },

      data: comparison,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to compare compensation",
    });
  }
}

export async function getCompensationSummary(req: Request, res: Response) {
  try {
    const { companyId, roleId, levelId, locationId } = req.query;

    if (!roleId || !levelId || !locationId) {
      return res.status(400).json({
        success: false,
        message: "roleId, levelId and locationId are required",
      });
    }

    const records = await prisma.compensationRecord.findMany({
      where: {
        roleId: Number(roleId),
        levelId: Number(levelId),
        locationId: Number(locationId),

        ...(companyId
          ? {
              companyId: Number(companyId),
            }
          : {}),
      },

      select: {
        baseSalary: true,
        bonus: true,
        equity: true,
        totalCompensation: true,
      },
    });

    if (records.length === 0) {
      return res.json({
        success: true,
        data: {
          sampleCount: 0,
          base: {
            p25: 0,
            p50: 0,
            p75: 0,
            p90: 0,
          },
          bonus: {
            p25: 0,
            p50: 0,
            p75: 0,
            p90: 0,
          },
          equity: {
            p25: 0,
            p50: 0,
            p75: 0,
            p90: 0,
          },
          totalCompensation: {
            p25: 0,
            p50: 0,
            p75: 0,
            p90: 0,
          },
        },
      });
    }

    const baseValues = records.map((r) => r.baseSalary);

    const bonusValues = records.map((r) => r.bonus);

    const equityValues = records.map((r) => r.equity);

    const totalValues = records.map((r) => r.totalCompensation);

    const createPercentiles = (values: number[]) => ({
      p25: Math.round(percentile(values, 25)),
      p50: Math.round(percentile(values, 50)),
      p75: Math.round(percentile(values, 75)),
      p90: Math.round(percentile(values, 90)),
    });

    return res.json({
      success: true,

      data: {
        sampleCount: records.length,

        base: createPercentiles(baseValues),

        bonus: createPercentiles(bonusValues),

        equity: createPercentiles(equityValues),

        totalCompensation: createPercentiles(totalValues),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate compensation summary",
    });
  }
}
