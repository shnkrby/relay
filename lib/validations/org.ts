import { z } from 'zod'

export const createOrgSchema = z.object({
  orgName: z.string().min(2, { message: 'Organization name must be at least 2 characters long.' }).max(50, { message: 'Organization name must be at most 50 characters long.' }),
})

export const joinOrgSchema = z.object({
  joinCode: z.string().min(6, { message: 'Join code is too short.' }).regex(/^RELAY-[A-Z0-9]+$/, { message: 'Invalid join code format. Must start with RELAY-' }),
})
