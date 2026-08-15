"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BellIcon, SearchIcon, SparklesIcon } from "lucide-react"
import { useAiPanel } from "@/components/dashboard/ai-panel-context"

export function SiteHeader() {
  const pathname = usePathname()

  let aiPanel: ReturnType<typeof useAiPanel> | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    aiPanel = useAiPanel()
  } catch {
    aiPanel = null
  }

  const getBreadcrumb = () => {
    if (pathname.includes("/ai")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">WorkPulse AI Assistant</span>
        </div>
      )
    }

    if (pathname.includes("/tasks")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Task Management</span>
        </div>
      )
    }

    if (pathname.includes("/karyawan")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Manajemen Karyawan</span>
        </div>
      )
    }

    if (pathname.includes("/presensi")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Presensi & Kehadiran (Geofencing)</span>
        </div>
      )
    }

    if (pathname.includes("/jadwal")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Jadwal & Shift Kerja</span>
        </div>
      )
    }

    if (pathname.includes("/akses")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Hak Akses & Role</span>
        </div>
      )
    }

    if (pathname.includes("/integrasi")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Integrasi & API Sistem</span>
        </div>
      )
    }

    if (pathname.includes("/settings")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Pengaturan Sistem</span>
        </div>
      )
    }

    if (pathname.includes("/laporan/kinerja")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span>Laporan</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Kinerja Karyawan</span>
        </div>
      )
    }

    if (pathname.includes("/laporan/kehadiran")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span>Laporan</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Rekap Kehadiran</span>
        </div>
      )
    }

    if (pathname.includes("/notifikasi")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Notifikasi Sistem</span>
        </div>
      )
    }

    if (pathname.includes("/log")) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Log Aktivitas</span>
        </div>
      )
    }

    // Default for /dashboard Overview
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
        <span>Dashboard</span>
        <span>/</span>
        <span className="font-semibold text-foreground">Admin Overview</span>
      </div>
    )
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b rounded-tl-2xl rounded-tr-2xl bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) dark:bg-zinc-950">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 text-zinc-500 hover:text-red-600" />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 data-vertical:self-auto"
          />
          {getBreadcrumb()}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative hidden sm:block">
            <SearchIcon className="absolute left-2.5 top-2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari karyawan, task..."
              className="h-8 w-44 lg:w-48 rounded-md border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          {/* Notif Bell */}
          <button className="relative rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400">
            <BellIcon className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-zinc-950"></span>
          </button>
        </div>
      </div>
    </header>
  )
}
