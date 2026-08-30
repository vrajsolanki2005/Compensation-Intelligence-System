import { z } from "zod";

export const compensationSchema = z.object({
  companyId: z.coerce.number().int().positive(),

  roleId: z.coerce.number().int().positive(),

  levelId: z.coerce.number().int().positive(),

  locationId: z.coerce.number().int().positive(),

  experienceYears: z
    .coerce
    .number()
    .int()
    .min(0)
    .max(50),

  baseSalary: z
    .coerce
    .number()
    .positive(),

  bonus: z
    .coerce
    .number()
    .min(0)
    .default(0),

  equity: z
    .coerce
    .number()
    .min(0)
    .default(0),

  compensationYear: z
    .coerce
    .number()
    .int()
    .min(2000)
    .max(2100),

  verified: z
    .boolean()
    .optional()
    .default(false),
});

export type CompensationInput = z.infer<
  typeof compensationSchema
>;