import Link from "next/link"
import Image from "next/image"
import { Building2Icon, ZapIcon, CheckCircle2Icon, UsersIcon, ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Relay Logo" width={32} height={32} className="rounded-lg shadow-sm" />
            <span className="text-xl font-bold tracking-tight">Relay</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block">
              Log in
            </Link>
            <Button render={<Link href="/signup" />} className="rounded-full px-6" nativeButton={false}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-blue-950/30 dark:via-slate-950 dark:to-slate-950"></div>
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20 dark:opacity-10 pointer-events-none">
            <div className="size-[600px] rounded-full bg-blue-400 blur-3xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 opacity-20 dark:opacity-10 pointer-events-none">
            <div className="size-[500px] rounded-full bg-indigo-400 blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 text-center">

            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The modern operating system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">organizations.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Streamline operations, manage committees, track duties, and coordinate events—all from a single, beautifully designed platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" render={<Link href="/signup" />} className="rounded-full px-8 h-12 text-base w-full sm:w-auto shadow-lg shadow-blue-500/20" nativeButton={false}>
                Try it now <ArrowRightIcon className="ml-2 size-4" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/login" />} className="rounded-full px-8 h-12 text-base w-full sm:w-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800" nativeButton={false}>
                Sign in
              </Button>
            </div>
            
            {/* Dashboard Preview Mockup */}
            <div className="mt-20 mx-auto max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-950 z-10"></div>
              <div className="rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-900/5">
                <div className="h-10 bg-slate-100/50 dark:bg-slate-950 flex items-center px-4 border-b border-slate-200/50 dark:border-slate-800/50 gap-2">
                  <div className="size-3 rounded-full bg-red-400"></div>
                  <div className="size-3 rounded-full bg-amber-400"></div>
                  <div className="size-3 rounded-full bg-emerald-400"></div>
                </div>
                {/* Mockup content */}
                <div className="flex aspect-video bg-slate-50 dark:bg-slate-950 p-4 gap-4">
                  <div className="w-48 hidden md:flex flex-col gap-2 opacity-50">
                    <div className="h-8 rounded bg-slate-200 dark:bg-slate-800 mb-4"></div>
                    <div className="h-6 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-6 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-6 rounded bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="h-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"></div>
                    <div className="flex gap-4 flex-1">
                      <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                        <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-10 rounded bg-slate-100 dark:bg-slate-950"></div>
                          <div className="h-10 rounded bg-slate-100 dark:bg-slate-950"></div>
                          <div className="h-10 rounded bg-slate-100 dark:bg-slate-950"></div>
                        </div>
                      </div>
                      <div className="w-1/3 hidden lg:block rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to run your organization</h2>
              <p className="text-slate-600 dark:text-slate-400">Powerful features designed to help leadership teams coordinate effectively and keep members engaged.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                  <UsersIcon className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Committee Management</h3>
                <p className="text-slate-600 dark:text-slate-400">Structure your organization into focused committees. Appoint leads, manage members, and track group progress effortlessly.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <div className="size-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                  <CheckCircle2Icon className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Task & Duty Tracking</h3>
                <p className="text-slate-600 dark:text-slate-400">Assign specific duties to committees and granular tasks to individuals. Never lose track of who is responsible for what.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                  <Building2Icon className="size-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-Org Support</h3>
                <p className="text-slate-600 dark:text-slate-400">Belong to multiple organizations? Switch between them seamlessly with a single unified account and dashboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            &copy; {new Date().getFullYear()} Relay. All rights reserved.
          </p>

        </div>
      </footer>
    </div>
  )
}
