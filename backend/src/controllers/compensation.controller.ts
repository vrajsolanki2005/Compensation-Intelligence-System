import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

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
    } = req.query;

    const compensation = await prisma.compensationRecord.findMany({
      where: {
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
      },

      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },

      orderBy: {
        totalCompensation: "desc",
      },
    });

    res.json({
      success: true,
      count: compensation.length,
      data: compensation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch compensation data",
    });
  }
}