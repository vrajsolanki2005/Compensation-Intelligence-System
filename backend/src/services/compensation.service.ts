import { prisma } from "../lib/prisma";
import { CompensationInput } from "../validators/compensation.validator";

export async function createCompensation(
  input: CompensationInput
) {
  const bonus = input.bonus ?? 0;
  const equity = input.equity ?? 0;

  const totalCompensation =
    input.baseSalary +
    bonus +
    equity;

  // Check that referenced entities exist
  const [company, role, level, location] =
    await Promise.all([
      prisma.company.findUnique({
        where: { id: input.companyId },
      }),

      prisma.role.findUnique({
        where: { id: input.roleId },
      }),

      prisma.level.findUnique({
        where: { id: input.levelId },
      }),

      prisma.location.findUnique({
        where: { id: input.locationId },
      }),
    ]);

  if (!company) {
    throw new Error("Company not found");
  }

  if (!role) {
    throw new Error("Role not found");
  }

  if (!level) {
    throw new Error("Level not found");
  }

  if (!location) {
    throw new Error("Location not found");
  }

  // Duplicate check
  const duplicate =
    await prisma.compensationRecord.findFirst({
      where: {
        companyId: input.companyId,
        roleId: input.roleId,
        levelId: input.levelId,
        locationId: input.locationId,
        experienceYears: input.experienceYears,
        compensationYear:
          input.compensationYear,
        baseSalary: input.baseSalary,
        bonus,
        equity,
      },
    });

  if (duplicate) {
    throw new Error(
      "Duplicate compensation record"
    );
  }

  return prisma.compensationRecord.create({
    data: {
      companyId: input.companyId,
      roleId: input.roleId,
      levelId: input.levelId,
      locationId: input.locationId,

      experienceYears:
        input.experienceYears,

      baseSalary: input.baseSalary,
      bonus,
      equity,

      totalCompensation,

      compensationYear:
        input.compensationYear,

      verified: input.verified ?? false,
    },

    include: {
      company: true,
      role: true,
      level: true,
      location: true,
    },
  });
}