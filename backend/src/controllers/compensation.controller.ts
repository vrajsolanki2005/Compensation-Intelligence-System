import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { compensationSchema } from "../validators/compensation.validator.js";
import { createCompensation } from "../services/compensation.service.js";

export async function getCompensation(
  req: Request,
  res: Response
) {
  try {
    const {
      companyId,
      roleId,
      levelId,
      locationId,
      minTC,
      maxTC,
      minExperience,
      maxExperience,
      sort = "totalCompensation",
      order = "desc",
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const allowedSortFields = [
      "baseSalary",
      "bonus",
      "equity",
      "totalCompensation",
      "experienceYears",
    ];

    const sortField = allowedSortFields.includes(
      String(sort)
    )
      ? String(sort)
      : "totalCompensation";

    const sortOrder =
      order === "asc" ? "asc" : "desc";

    const where = {
      ...(companyId
        ? { companyId: Number(companyId) }
        : {}),

      ...(roleId
        ? { roleId: Number(roleId) }
        : {}),

      ...(levelId
        ? { levelId: Number(levelId) }
        : {}),

      ...(locationId
        ? { locationId: Number(locationId) }
        : {}),

      ...(minTC
        ? {
            totalCompensation: {
              gte: Number(minTC),
              ...(maxTC
                ? { lte: Number(maxTC) }
                : {}),
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
              ...(maxExperience
                ? { lte: Number(maxExperience) }
                : {}),
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

    const [records, total] =
      await Promise.all([
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
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch compensation data",
    });
  }
}

export async function getCompensationById(
  req: Request,
  res: Response
) {
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

export async function createCompensationRecord(
  req: Request,
  res: Response
) {
  try {
    const validation =
      compensationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid compensation data",
        errors: validation.error.flatten(),
      });
    }

    const record =
      await createCompensation(
        validation.data
      );

    return res.status(201).json({
      success: true,
      message:
        "Compensation record created successfully",
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

    if (
      message ===
      "Duplicate compensation record"
    ) {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create compensation record",
    });
  }
}

function calculateMedian(
  values: number[]
) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
}

export async function compareCompensation(
  req: Request,
  res: Response
) {
  try {
    const {
      roleId,
      levelId,
      locationId,
      companyIds,
    } = req.query;

    if (!roleId || !levelId || !locationId) {
      return res.status(400).json({
        success: false,
        message:
          "roleId, levelId and locationId are required",
      });
    }

    const companyIdList = companyIds
      ? String(companyIds)
          .split(",")
          .map(Number)
          .filter(Boolean)
      : [];

    const records =
      await prisma.compensationRecord.findMany({
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

    const grouped = new Map<
      number,
      typeof records
    >();

    for (const record of records) {
      const existing =
        grouped.get(record.companyId) ?? [];

      existing.push(record);

      grouped.set(
        record.companyId,
        existing
      );
    }

    const comparison = Array.from(
      grouped.entries()
    ).map(([companyId, companyRecords]) => {
      const baseValues =
        companyRecords.map(
          (record) => record.baseSalary
        );

      const bonusValues =
        companyRecords.map(
          (record) => record.bonus
        );

      const equityValues =
        companyRecords.map(
          (record) => record.equity
        );

      const totalValues =
        companyRecords.map(
          (record) =>
            record.totalCompensation
        );

      return {
        companyId,

        companyName:
          companyRecords[0].company.name,

        sampleCount:
          companyRecords.length,

        baseMedian:
          Math.round(
            calculateMedian(baseValues)
          ),

        bonusMedian:
          Math.round(
            calculateMedian(bonusValues)
          ),

        equityMedian:
          Math.round(
            calculateMedian(equityValues)
          ),

        totalCompensationMedian:
          Math.round(
            calculateMedian(totalValues)
          ),
      };
    });

    comparison.sort(
      (a, b) =>
        b.totalCompensationMedian -
        a.totalCompensationMedian
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
      message:
        "Failed to compare compensation",
    });
  }
}