import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getLocations(
  _req: Request,
  res: Response
) {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        city: "asc",
      },
    });

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
}