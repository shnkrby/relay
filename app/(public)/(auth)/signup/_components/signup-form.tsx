"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signup } from "@/app/(public)/(auth)/_actions/auth"
import { ActionResponse } from "@/types/actions"
import { createClient } from "@/lib/supabase/client"
import { FieldSeparator } from "@/components/ui/field"
import Image from "next/image"

const initialState: ActionResponse = {
  success: false,
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [state, formAction, pending] = useActionState(signup, initialState)

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/organizations`,
      },
    })
  }

  return (
    <Card className="shadow-sm" {...props}>
      <CardHeader className="flex flex-col items-center text-center">
        <a href="/" className="flex items-center justify-center gap-2 font-medium mb-2">
          <Image src="/logo.png" alt="Relay Logo" width={32} height={32} className="rounded-md" />
          <span className="text-xl">Relay</span>
        </a>
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            {state?.error && (
              <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
                {state.error}
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                required
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required className="bg-background" />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {pending ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldSeparator className="my-4">Or continue with</FieldSeparator>
                <Button variant="outline" type="button" disabled={pending} onClick={handleGoogleSignup} className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </Button>
                <div className="text-sm text-center mt-4 text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/login" className="underline underline-offset-4 text-blue-600 hover:text-blue-800 font-medium">
                    Sign in
                  </a>
                </div>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
