import Link from "next/link"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const resolvedParams = await searchParams
  const errorMessage = resolvedParams.message || "The page you are looking for doesn't exist or another error occurred."

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-9xl font-extrabold tracking-tight text-foreground sm:text-[10rem]">
        Error
      </h1>
      <h2 className="mt-8 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Something went wrong
      </h2>
      <p className="mt-4 text-sm text-muted-foreground sm:text-base">
        {errorMessage}
        <br />
        <Link href="/" className="font-medium text-primary hover:underline">
          Go back
        </Link>
        , or head over to{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          home
        </Link>{" "}
        to choose a new direction.
      </p>
    </div>
  )
}
