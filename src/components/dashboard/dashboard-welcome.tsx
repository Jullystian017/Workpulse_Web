"use client"

import * as React from "react"
import Link from "next/link"
import { PlusIcon, UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getActiveUserFromStorage, getExecutiveKpiStats } from "@/lib/api"
import { User } from "@/types/database"

export function DashboardWelcome({ onOpenCreateTask }: { onOpenCreateTask?: () => void }) {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const [stats, setStats] = React.useState<{
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    reviewTasks: number
    unassignedTasks: number
  } | null>(null)

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (user) setCurrentUser(user)

    getExecutiveKpiStats().then((data) => {
      if (data) setStats(data)
    }).catch(console.error)
  }, [])

  const nama = currentUser?.nama || "Karyawan Telkom Akses"

  const inProgress = stats?.inProgressTasks ?? 2
  const review = stats?.reviewTasks ?? 1
  const done = stats?.completedTasks ?? 2

  return (
    <div className="flex flex-col gap-4 px-4 pt-1 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      {/* Left: Clean Welcome message & Summary */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Selamat Datang, {nama.split(",")[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Ringkasan operasional kantor: terdapat{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{inProgress} tugas dalam proses</span>,{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{review} menunggu review</span>, dan{" "}
          <span className="font-semibold text-red-600 dark:text-red-400">{done} tugas selesai</span>.
        </p>
      </div>

      {/* Right: Functional Action Shortcuts */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/admin/karyawan">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 gap-1.5 rounded-[8px] text-xs font-semibold hover:bg-muted border-border cursor-pointer shadow-2xs transition-colors"
          >
            <UsersIcon className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>Struktur Organisasi</span>
          </Button>
        </Link>

        {onOpenCreateTask ? (
          <Button
            size="sm"
            onClick={onOpenCreateTask}
            className="h-9 px-4 gap-1.5 rounded-[8px] text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs transition-all"
          >
            <PlusIcon className="size-3.5" />
            <span>Buat Tugas Baru</span>
          </Button>
        ) : (
          <Link href="/admin/tasks">
            <Button
              size="sm"
              className="h-9 px-4 gap-1.5 rounded-[8px] text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs transition-all"
            >
              <PlusIcon className="size-3.5" />
              <span>Buat Tugas Baru</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
