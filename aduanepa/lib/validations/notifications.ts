import { z } from "zod"

export const saveDeviceTokenSchema = z.object({
  token: z.string().trim().min(20, "Invalid device token").max(4096),
})

export const notificationsPreferenceSchema = z.object({
  enabled: z.boolean(),
  /** Present when enabling so we can persist the FCM token in the same request. */
  token: z.string().trim().min(20).max(4096).optional(),
})

export type SaveDeviceTokenInput = z.infer<typeof saveDeviceTokenSchema>
export type NotificationsPreferenceInput = z.infer<typeof notificationsPreferenceSchema>
