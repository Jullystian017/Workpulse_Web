"use client"

import * as React from "react"
import Link from "next/link"
import { PlusIcon, CalendarCheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardWelcome() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-1 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      {/* Left: Clean Welcome message & Summary text */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Selamat Datang, Dimas!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Hari ini terdapat <span className="font-semibold text-red-600">3 task overdue</span>, 9 task dalam proses, dan 16 dari 17 karyawan telah check-in.
        </p>
      </div>

      {/* Right: Functional Action Shortcuts */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/admin/presensi">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 gap-1.5 rounded-[8px] text-xs font-semibold hover:bg-muted border-border cursor-pointer shadow-2xs transition-colors"
          >
            <CalendarCheckIcon className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>Live Presensi GPS</span>
          </Button>
        </Link>

        <Link href="/admin/tasks">
          <Button
            size="sm"
            className="h-9 px-4 gap-1.5 rounded-[8px] text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs transition-all"
          >
            <PlusIcon className="size-3.5" />
            <span>Buat Task Baru</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
