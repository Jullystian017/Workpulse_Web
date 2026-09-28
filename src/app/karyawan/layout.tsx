"use client"

import * as React from "react"
import { AppSidebarStaff } from "@/components/dashboard/app-sidebar-staff"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AiPanelProvider } from "@/components/dashboard/ai-panel-context"
import { AiIntegratedPanel } from "@/components/dashboard/ai-integrated-panel"

import { useRouter } from "next/navigation"
import { getActiveUserFromStorage } from "@/lib/api"
import { LockIcon } from "lucide-react"

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (!user) {
      router.replace("/login")
    } else if (user.role === "admin") {
      router.replace("/admin/dashboard")
    } else {
      setIsChecking(false)
    }
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border shadow-xs">
          <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center animate-pulse">
            <LockIcon className="size-5" />
          </div>
          <div className="text-center">
            <h4 className="text-xs font-bold text-foreground">Memverifikasi Portal Karyawan...</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Memeriksa hak otorisasi sesi kerja</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AiPanelProvider>
        <AppSidebarStaff variant="inset" />
        <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
          <SiteHeader />
          <div className="flex flex-1 min-h-0 h-full flex-row overflow-hidden">
            {/* Main Center Content with smooth scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </div>

            {/* Integrated Right AI Column Panel - Full Height */}
            <AiIntegratedPanel />
          </div>
        </SidebarInset>
      </AiPanelProvider>
    </SidebarProvider>
  )
}
