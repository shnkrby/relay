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

const initialState: ActionResponse = {
  success: false,
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [state, formAction, pending] = useActionState(signup, initialState)

  return (
    <Card className="bg-white shadow-sm border-slate-200" {...props}>
      <CardHeader>
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
