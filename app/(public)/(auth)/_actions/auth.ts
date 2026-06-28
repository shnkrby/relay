'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types/actions'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

const signupSchema = z.object({
  full_name: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
})

export async function login(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = loginSchema.safeParse(rawData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword(result.data)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/organizations')
}

export async function signup(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const rawData = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = signupSchema.safeParse(rawData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { full_name, email, password } = result.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/organizations')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
