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

    // The DB Location model has `city` and `country` but no `name` field.
    // The frontend Location type expects `{ id, name }`, so we build name here.
    res.json({
      success: true,
      data: locations.map((l) => ({
        id: l.id,
        name: `${l.city}, ${l.country}`,
      })),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
}