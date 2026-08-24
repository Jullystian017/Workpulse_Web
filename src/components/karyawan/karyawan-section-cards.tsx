"use client"

import * as React from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  CalendarRangeIcon,
} from "lucide-react"

const cards = [
  {
    icon: ClipboardListIcon,
    label: "Total Task Saya",
    value: "4",
    badge: "Aktif",
    trend: "up" as const,
    desc: "3 Dalam proses, 1 review atasan",
  },
  {
    icon: CheckCircle2Icon,
    label: "Task Selesai",
    value: "24",
    badge: "+85.7%",
    trend: "up" as const,
    desc: "Dari 28 total penugasan bulan ini",
  },
  {
    icon: CalendarCheckIcon,
    label: "Presensi Hari Ini",
    value: "07:58",
    badge: "Tepat Waktu",
    trend: "up" as const,
    desc: "Check-in terverifikasi sistem",
  },
  {
    icon: CalendarRangeIcon,
    label: "Sisa Kuota Cuti",
    value: "9",
    badge: "Hari",
    trend: "up" as const,
    desc: "Hak cuti tahunan periode 2026",
  },
]

export function KaryawanSectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Watermark icon — faint, top-right */}
          <card.icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />

          {/* Content */}
          <div className="relative">
            {/* Top row: label + badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                {card.trend === "up" ? (
                  <TrendingUpIcon className="size-2.5" />
                ) : (
                  <TrendingDownIcon className="size-2.5" />
                )}
                {card.badge}
              </span>
            </div>

            {/* Number Count */}
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
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
