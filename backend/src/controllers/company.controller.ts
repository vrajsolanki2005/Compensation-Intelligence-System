import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { percentile } from "../utils/statistics";

export async function getCompanies(
  _req: Request,
  res: Response
) {
  try {
    const companies =
      await prisma.company.findMany({
        orderBy: {
          name: "asc",
        },
      });

    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
    });
  }
}

export async function getCompanyById(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const company =
      await prisma.company.findUnique({
        where: { id },
      });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company",
    });
  }
}

/**
 * Bug 5 fix: New endpoint — returns median total compensation per level for a company.
 * Used by CompanyPage to render the level breakdown chart.
 * Route: GET /companies/:id/compensation-summary
 */
export async function getCompanyCompensationSummary(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    // Fetch all compensation records for this company with their level info
    const records = await prisma.compensationRecord.findMany({
      where: { companyId: id },
      select: {
        totalCompensation: true,
        level: {
          select: {
            id: true,
            name: true,
            rank: true,
          },
        },
      },
    });

    // Group total compensation values by level
    const levelMap = new Map<
      number,
      { levelName: string; rank: number; values: number[] }
    >();

    for (const r of records) {
      const entry = levelMap.get(r.level.id) ?? {
        levelName: r.level.name,
        rank: r.level.rank,
        values: [],
      };
      entry.values.push(r.totalCompensation);
      levelMap.set(r.level.id, entry);
    }

    // Compute median per level and sort by rank ascending (IC2 → IC5)
    const levels = Array.from(levelMap.entries())
      .map(([levelId, { levelName, rank, values }]) => ({
        levelId,
        levelName,
        medianTotalCompensation: Math.round(percentile(values, 50)),
        sampleCount: values.length,
        _rank: rank,
      }))
      .sort((a, b) => a._rank - b._rank)
      .map(({ _rank: _r, ...rest }) => rest); // strip internal sort key

    return res.json({
      success: true,
      data: { levels },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company compensation summary",
    });
  }
}