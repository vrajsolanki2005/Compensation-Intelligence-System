import { z } from "zod";

export const compensationQuerySchema =
  z.object({
    companyId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    roleId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    levelId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    locationId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    minTC: z.coerce
      .number()
      .min(0)
      .optional(),

    maxTC: z.coerce
      .number()
      .min(0)
      .optional(),

    minExperience: z.coerce
      .number()
      .int()
      .min(0)
      .optional(),

    maxExperience: z.coerce
      .number()
      .int()
      .min(0)
      .optional(),

    sort: z
      .enum([
        "base",
        "bonus",
        "equity",
        "totalCompensation",
        "experience",
      ])
      .default("totalCompensation"),

    order: z
      .enum(["asc", "desc"])
      .default("desc"),

    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20),
  });