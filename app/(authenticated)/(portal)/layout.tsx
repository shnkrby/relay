import { ZapIcon } from 'lucide-react'
import Image from 'next/image'
import { ProfileTrigger } from '@/components/profile-trigger'
import { ThemeToggle } from '@/components/theme-toggle'
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-slate-900 px-6">
        <div className="flex items-center gap-2 font-medium text-blue-600">
          <Image src="/logo.png" alt="Relay Logo" width={32} height={32} className="rounded-md" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">Relay</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <ProfileTrigger />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center p-6 md:p-10">
        {children}
      </main>
    </div>
  )
}
