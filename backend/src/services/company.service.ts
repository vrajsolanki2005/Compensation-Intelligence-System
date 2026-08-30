import { prisma } from "../lib/prisma";

function normalizeCompanyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b(inc|llc|ltd|limited|corp|corporation)\b/g, "")
    .trim();
}

export async function findOrCreateCompany(
  companyName: string
) {
  const normalizedName = normalizeCompanyName(companyName);

  const existingCompany =
    await prisma.company.findUnique({
      where: {
        normalizedName,
      },
    });

  if (existingCompany) {
    return existingCompany;
  }

  return prisma.company.create({
    data: {
      name: companyName.trim(),
      normalizedName,
    },
  });
}