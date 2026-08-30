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