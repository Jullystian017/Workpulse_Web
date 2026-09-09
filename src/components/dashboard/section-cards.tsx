"use client"

import * as React from "react"
import {
  ClipboardListIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  UsersIcon,
} from "lucide-react"
import { getExecutiveKpiStats } from "@/lib/api"

interface SectionCardsProps {
  stats?: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    reviewTasks: number
    unassignedTasks: number
    overdueTasks: number
    completionRate: number
    activeStaffCount: number
    totalEmployees: number
  } | null
}

export function SectionCards({ stats: initialStats }: SectionCardsProps) {
  const [stats, setStats] = React.useState(initialStats || null)

  React.useEffect(() => {
    if (!initialStats) {
      getExecutiveKpiStats().then(setStats).catch(console.error)
    } else {
      setStats(initialStats)
    }
  }, [initialStats])

  const total = stats?.totalTasks ?? 7
  const done = stats?.completedTasks ?? 2
  const review = stats?.reviewTasks ?? 1
  const unassigned = stats?.unassignedTasks ?? 1
  const rate = stats?.completionRate ?? 29
  const totalEmployees = stats?.totalEmployees ?? 7

  const cards = [
    {
      icon: ClipboardListIcon,
      label: "Total Dokumen & Tugas",
      value: total.toString(),
      badge: `${unassigned} Pool`,
      desc: "Proposal, laporan keuangan, SPJ & SOP",
    },
    {
      icon: CheckCircle2Icon,
      label: "Tugas Selesai Tepat Waktu",
      value: done.toString(),
      badge: `${rate}% Selesai`,
      desc: "Telah diverifikasi & disetujui atasan",
    },
    {
      icon: AlertCircleIcon,
      label: "Menunggu Review Atasan",
      value: review.toString(),
      badge: "Perlu Tindakan",
      desc: "Hasil kerja siap divalidasi atasan",
    },
    {
      icon: UsersIcon,
      label: "Personil Karyawan Aktif",
      value: totalEmployees.toString(),
      badge: "6 Level",
      desc: `Dari total ${totalEmployees} personil terdaftar`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Watermark icon */}
          <card.icon className="absolute -right-2 -top-2 size-20 text-red-100/70 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 pointer-events-none" />

          {/* Content */}
          <div className="relative">
            {/* Top row: label + badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{card.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[10px] font-extrabold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                {card.badge}
              </span>
            </div>

            {/* Number Count */}
            <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              {card.value}
            </p>

            {/* Description */}
            <p className="mt-1 text-[11px] text-muted-foreground">{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
