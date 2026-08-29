import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getCompanies(
  _req: Request,
  res: Response
) {
  try {
    const companies = await prisma.company.findMany({
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