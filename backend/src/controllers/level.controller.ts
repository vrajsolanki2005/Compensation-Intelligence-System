import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getLevels(
  _req: Request,
  res: Response
) {
  try {
    const levels = await prisma.level.findMany({
      orderBy: {
        rank: "asc",
      },
    });

    res.json({
      success: true,
      data: levels,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch levels",
    });
  }
}