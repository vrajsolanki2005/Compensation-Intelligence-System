import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function normalize(value: String) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

async function main() {
  console.log("Seeding Database");

  //comapnies
  const companyNames = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Adobe",
    "Salesforce",
    "Uber",
    "Atlassian",
    "Flipkart",
    "Razorpay",
    "Swiggy",
  ];

  const companies = [];

  for (const name of companyNames) {
    const comapny = await prisma.company.upsert({
      where: {
        normalizeName: normalize(name),
      },
      update: {},
      create: {
        name,
        normalizeName: normalize(name),
      },
    });
    companies.push(comapny);
  }
  //roles
  const roleNames = [
    "Software Engineer",
    "Frontend Engineer",
    "Backend Engineer",
    "Data Engineer",
    "Product Manager",
  ];
  const roles = [];
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: {
        normalizedName: normalize(name),
      },
      update: {},
      create: {
        name,
        normalizedName: normalize(name),
      },
    });

    roles.push(role);
  }
  //levels
  const levelNames = [
    { name: "IC1", rank: 1 },
    { name: "IC2", rank: 2 },
    { name: "IC3", rank: 3 },
    { name: "IC4", rank: 4 },
    { name: "IC5", rank: 5 },
    { name: "IC6", rank: 6 },
  ];

  const levels = [];

  for (const level of levelNames) {
    const created = await prisma.level.upsert({
      where: {
        id: level.rank,
      },
      update: {},
      create: level,
    });

    levels.push(created);
  }

  // -------------------------
  // Locations
  // -------------------------

  const locationData = [
    {
      city: "Bengaluru",
      country: "India",
      currency: "INR",
    },
    {
      city: "Hyderabad",
      country: "India",
      currency: "INR",
    },
    {
      city: "Pune",
      country: "India",
      currency: "INR",
    },
    {
      city: "Mumbai",
      country: "India",
      currency: "INR",
    },
    {
      city: "Gurugram",
      country: "India",
      currency: "INR",
    },
  ];

  const locations = [];

  for (const location of locationData) {
    const created = await prisma.location.upsert({
      where: {
        city_country: {
          city: location.city,
          country: location.country,
        },
      },
      update: {},
      create: location,
    });

    locations.push(created);
  }


  //Compensation records
  const baseByLevel: Record<number, number> = {
    1: 900000,
    2: 1500000,
    3: 2400000,
    4: 3500000,
    5: 5000000,
    6: 7000000,
  };

  const companyMultiplier: Record<string, number> = {
    Google: 1.25,
    Microsoft: 1.15,
    Amazon: 1.1,
    Meta: 1.3,
    Apple: 1.25,
    Adobe: 1.05,
    Salesforce: 1.08,
    Uber: 1.12,
    Atlassian: 1.15,
    Flipkart: 0.95,
    Razorpay: 0.9,
    Swiggy: 0.88,
  };

  const roleMultiplier: Record<string, number> = {
    "Software Engineer": 1,
    "Frontend Engineer": 0.95,
    "Backend Engineer": 1.05,
    "Data Engineer": 1.02,
    "Product Manager": 1.08,
  };

  const locationMultiplier: Record<string, number> = {
    Bengaluru: 1,
    Hyderabad: 0.92,
    Pune: 0.9,
    Mumbai: 1.02,
    Gurugram: 0.95,
  };

  for (const company of companies) {
    for (const role of roles) {
      for (const level of levels) {
        for (const location of locations) {
          const base =
            baseByLevel[level.rank] *
            companyMultiplier[company.name] *
            roleMultiplier[role.name] *
            locationMultiplier[location.city];

          const bonus = base * 0.1;
          const equity = base * 0.2;
          const totalCompensation = base + bonus + equity;

          await prisma.compensationRecord.create({
            data: {
              companyId: company.id,
              roleId: role.id,
              levelId: level.id,
              locationId: location.id,

              experienceYears: Math.max(1, level.rank * 2),

              baseSalary: Math.round(base),
              bonus: Math.round(bonus),
              equity: Math.round(equity),
              totalCompensation: Math.round(totalCompensation),

              compensationYear: 2026,

              verified: Math.random() > 0.3,
            },
          });
        }
      }
    }
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
