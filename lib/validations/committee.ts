import { z } from "zod"

export const createCommitteeSchema = z.object({
  name: z.string().min(2, {
    message: "Committee name must be at least 2 characters.",
  }).max(50, {
    message: "Committee name must not exceed 50 characters."
  }),
  leadId: z.string().uuid("Please select a valid committee head."),
  memberLimit: z.number().min(8, { message: 'Minimum members must be at least 8.' }).nullable().optional(),
})

export const assignMemberSchema = z.object({
  profileId: z.string().uuid("Invalid member ID."),
  committeeId: z.string().uuid("Invalid committee ID."),
})
