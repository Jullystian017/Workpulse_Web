"use client"

import * as React from "react"
import Link from "next/link"
import { CheckSquareIcon, FileBarChartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getActiveUserFromStorage } from "@/lib/api"
import { ROLE_LABELS } from "@/types/database"

export function KaryawanWelcome() {
  const [name, setName] = React.useState("Karyawan")
  const [roleBadge, setRoleBadge] = React.useState("Staff")
  const [roleColor, setRoleColor] = React.useState("")
  const [positionTitle, setPositionTitle] = React.useState("Karyawan Telkom Akses")

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (user) {
      // Get first name only
      const firstName = user.nama.split(" ")[0]
      setName(firstName)
      setPositionTitle(user.position_title || ROLE_LABELS[user.role]?.label || "Karyawan")
      setRoleBadge(ROLE_LABELS[user.role]?.badge || user.role)
      setRoleColor(ROLE_LABELS[user.role]?.color || "")
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 px-4 pt-1 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      {/* Left: Dynamic Welcome message & role info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Selamat Datang, {name}!
          </h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${roleColor}`}>
            {roleBadge}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {positionTitle}
        </p>
      </div>

      {/* Right: Functional Action Shortcuts */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/karyawan/laporan">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 gap-1.5 rounded-[8px] text-xs font-semibold hover:bg-muted border-border cursor-pointer shadow-2xs transition-colors"
          >
            <FileBarChartIcon className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>Kinerja & Bintang</span>
          </Button>
        </Link>

        <Link href="/karyawan/tasks">
          <Button
            size="sm"
            className="h-9 px-4 gap-1.5 rounded-[8px] text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs transition-all"
          >
            <CheckSquareIcon className="size-3.5" />
            <span>Lihat Penugasan</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
