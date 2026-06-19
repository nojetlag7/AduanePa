import { z } from "zod"

/**
 * Coerce a possibly-empty string/number field into `number | undefined`.
 * Empty string / null / undefined → undefined (field left blank).
 */
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined
    if (typeof value === "string") {
      const n = Number(value)
      return Number.isNaN(n) ? value : n
    }
    return value
  }, schema.optional())

export const HealthLogSchema = z
  .object({
    weight: optionalNumber(z.number().min(20, "Weight must be at least 20 kg").max(300, "Weight must be under 300 kg")),
    bloodSugar: optionalNumber(
      z.number().min(2, "Blood sugar must be at least 2.0 mmol/L").max(30, "Blood sugar must be under 30 mmol/L")
    ),
    bpSystolic: optionalNumber(
      z.number().int("Use whole numbers").min(60, "Systolic must be at least 60").max(250, "Systolic must be under 250")
    ),
    bpDiastolic: optionalNumber(
      z.number().int("Use whole numbers").min(40, "Diastolic must be at least 40").max(150, "Diastolic must be under 150")
    ),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must be under 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) =>
      data.weight !== undefined ||
      data.bloodSugar !== undefined ||
      data.bpSystolic !== undefined ||
      data.bpDiastolic !== undefined,
    { message: "Enter at least one reading", path: ["weight"] }
  )

export type HealthLogInputDto = z.infer<typeof HealthLogSchema>
