import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getRoles(
  _req: Request,
  res: Response
) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
}