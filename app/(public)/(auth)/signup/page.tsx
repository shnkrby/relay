"use client"

import { SignupForm } from "./_components/signup-form"
import Image from "next/image"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 md:p-10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex justify-center">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image src="/logo.png" alt="Relay Logo" width={28} height={28} className="rounded-md" />
            <span className="text-xl">Relay</span>
          </a>
        </div>
        
        <SignupForm />
      </div>
    </div>
  )
}
