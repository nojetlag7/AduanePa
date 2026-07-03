import { z } from "zod"
import { DietaryGoal, HealthCondition, LanguagePreference } from "@prisma/client"

const SELECTABLE_CONDITIONS = [
  HealthCondition.HYPERTENSION,
  HealthCondition.DIABETES,
  HealthCondition.OBESITY,
] as const

function ageFromDateOfBirth(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export const profileSettingsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
    .transform((v) => new Date(v))
    .refine((d) => ageFromDateOfBirth(d) >= 10, "You must be at least 10 years old")
    .refine((d) => ageFromDateOfBirth(d) <= 120, "Enter a valid date of birth"),
  weight: z.coerce
    .number({ message: "Weight is required" })
    .min(20, "Weight must be at least 20 kg")
    .max(300, "Weight must be at most 300 kg"),
  height: z.coerce
    .number({ message: "Height is required" })
    .min(50, "Height must be at least 50 cm")
    .max(250, "Height must be at most 250 cm"),
})

export const healthProfileSettingsSchema = z.object({
  healthConditions: z
    .array(z.enum(SELECTABLE_CONDITIONS))
    .default([])
    .transform((conditions) =>
      conditions.length === 0 ? [HealthCondition.NONE] : conditions
    ),
  dietaryGoal: z.nativeEnum(DietaryGoal, { message: "Select a dietary goal" }),
})

export const passwordSettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  })

export const languageSettingsSchema = z.object({
  language: z.nativeEnum(LanguagePreference, { message: "Select a language" }),
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion"),
})

export type ProfileSettingsInput = z.input<typeof profileSettingsSchema>
export type ProfileSettingsParsed = z.output<typeof profileSettingsSchema>
export type HealthProfileSettingsInput = z.infer<typeof healthProfileSettingsSchema>
export type PasswordSettingsInput = z.infer<typeof passwordSettingsSchema>
export type LanguageSettingsInput = z.infer<typeof languageSettingsSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
