import { Button } from "@/components/ui/button"
import { Activity, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const resolvedParams = await searchParams
  const errorMessage = resolvedParams.message || "We encountered an unexpected error while processing your request."

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium text-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900">Relay</span>
        </Link>
        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <CardTitle className="text-xl">Something went wrong!</CardTitle>
            <CardDescription>
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Link href="/" className="w-full">
              <Button className="w-full">
                Go back home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
