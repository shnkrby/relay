"use client"

import { useActionState } from "react"
import { cn } from "@/lib/utils"
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
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login } from "@/app/(public)/(auth)/_actions/auth"
import { ActionResponse } from "@/types/actions"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

const initialState: ActionResponse = {
  success: false,
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const [state, formAction, pending] = useActionState(login, initialState)

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/organizations`,
      },
    })
  }

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex flex-col items-center text-center">
        <a href="/" className="flex items-center justify-center gap-2 font-medium mb-2">
          <Image src="/logo.png" alt="Relay Logo" width={32} height={32} className="rounded-md" />
          <span className="text-xl">Relay</span>
        </a>
        <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-background"
          />
        </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {pending ? "Logging in..." : "Login"}
                </Button>
                <FieldSeparator className="my-4">Or continue with</FieldSeparator>
                <Button variant="outline" type="button" disabled={pending} onClick={handleGoogleLogin} className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Login with Google
                </Button>
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="underline underline-offset-4 text-blue-600 hover:text-blue-800 font-medium">
                    Sign up
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
