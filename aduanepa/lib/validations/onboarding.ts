import { z } from "zod"
import {
  DietaryGoal,
  HealthCondition,
  LanguagePreference,
} from "@prisma/client"

const SELECTABLE_CONDITIONS = [
  HealthCondition.HYPERTENSION,
  HealthCondition.DIABETES,
  HealthCondition.OBESITY,
] as const

function ageFromDateOfBirth(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export const onboardingStep1Schema = z.object({
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .transform((value) => new Date(value))
    .refine((date) => ageFromDateOfBirth(date) >= 10, "You must be at least 10 years old")
    .refine((date) => ageFromDateOfBirth(date) <= 120, "Enter a valid date of birth"),
  weight: z.coerce
    .number({ message: "Weight is required" })
    .min(20, "Weight must be at least 20 kg")
    .max(300, "Weight must be at most 300 kg"),
  height: z.coerce
    .number({ message: "Height is required" })
    .min(50, "Height must be at least 50 cm")
    .max(250, "Height must be at most 250 cm"),
})

export const onboardingStep2Schema = z.object({
  healthConditions: z
    .array(z.enum(SELECTABLE_CONDITIONS))
    .default([])
    .transform((conditions) =>
      conditions.length === 0 ? [HealthCondition.NONE] : conditions
    ),
})

export const onboardingStep3Schema = z.object({
  dietaryGoal: z.nativeEnum(DietaryGoal, { message: "Select a dietary goal" }),
})

export const onboardingStep4Schema = z.object({
  language: z.nativeEnum(LanguagePreference, { message: "Select a language" }),
})

export const onboardingStep5Schema = z.object({
  privacyAccepted: z.literal(true, {
    message: "You must agree to the Privacy Policy to continue",
  }),
})

export const onboardingSchema = onboardingStep1Schema
  .merge(onboardingStep2Schema)
  .merge(onboardingStep3Schema)
  .merge(onboardingStep4Schema)
  .merge(onboardingStep5Schema)

export type OnboardingInput = z.input<typeof onboardingSchema>
export type OnboardingParsed = z.output<typeof onboardingSchema>
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>
export type OnboardingStep4Input = z.infer<typeof onboardingStep4Schema>
export type OnboardingStep5Input = z.infer<typeof onboardingStep5Schema>

export { SELECTABLE_CONDITIONS }
