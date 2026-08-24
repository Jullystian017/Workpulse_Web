"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarCheckIcon, PlusIcon, SparklesIcon, CalendarRangeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function KaryawanWelcome() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-1 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      {/* Left: Clean Welcome message & Summary text */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Selamat Datang, Andi Pratama!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Senior Network Engineer &bull; Hari ini Anda memiliki{" "}
          <span className="font-semibold text-red-600 dark:text-red-400">4 task aktif</span>.
        </p>
      </div>

      {/* Right: Functional Action Shortcuts */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/karyawan/presensi">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 gap-1.5 rounded-xl text-xs font-semibold hover:bg-muted border-border cursor-pointer shadow-2xs transition-colors"
          >
            <CalendarCheckIcon className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>Presensi GPS</span>
          </Button>
        </Link>

        <Link href="/karyawan/cuti">
          <Button
            size="sm"
            className="h-9 px-4 gap-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs transition-all"
          >
            <PlusIcon className="size-3.5" />
            <span>Ajukan Cuti</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
