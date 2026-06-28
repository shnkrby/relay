import { z } from "zod"

export const updateOrgProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }).max(50, {
    message: "Organization name must not exceed 50 characters."
  }),
  description: z.string().max(250, { message: "Description must not exceed 250 characters." }).optional().nullable(),
})
