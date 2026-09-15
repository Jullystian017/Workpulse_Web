"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { ShieldAlertIcon, LockIcon } from "lucide-react"
import { getActiveUserFromStorage } from "@/lib/api"
import { User } from "@/types/database"
import { AiPanelProvider } from "@/components/dashboard/ai-panel-context"
import { AiIntegratedPanel } from "@/components/dashboard/ai-integrated-panel"

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (!user) {
      router.replace("/login")
    } else {
      setCurrentUser(user)
      setIsChecking(false)
    }
  }, [router, pathname])

  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border shadow-xs">
          <div className="size-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center animate-pulse">
            <LockIcon className="size-5" />
          </div>
          <div className="text-center">
            <h4 className="text-xs font-bold text-foreground">Memverifikasi Sesi Akses...</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Memeriksa hak otorisasi akun Telkom Akses</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AiPanelProvider>
      {children}
      <AiIntegratedPanel />
    </AiPanelProvider>
  )
}
