import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const company =
      await prisma.company.findUnique({
        where: { id },

        include: {
          compensationRecords: {
            include: {
              role: true,
              level: true,
              location: true,
            },
            orderBy: {
              totalCompensation: "desc",
            },
            take: 100,
          },
        },
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
      message:
        "Failed to fetch company",
    });
  }
}