"use client"

import * as React from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  StarIcon,
} from "lucide-react"
import { Task } from "@/types/database"
import { calculatePerformance } from "@/lib/api"

export function KaryawanSectionCards({ tasks }: { tasks?: Task[] }) {
  const cards = React.useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return [
        {
          icon: StarIcon,
          label: "Bintang Kinerja Saya",
          value: "4.8",
          valueSuffix: "/ 5.0",
          badge: "Sangat Baik",
          isStar: true,
          trend: "up" as const,
          desc: "96% Tugas Tepat Waktu (Skor 96)",
        },
        {
          icon: CheckCircle2Icon,
          label: "Tugas Selesai",
          value: "24",
          badge: "100%",
          trend: "up" as const,
          desc: "Tugas telah disetujui atasan",
        },
        {
          icon: ClipboardListIcon,
          label: "Tugas Aktif Berjalan",
          value: "4",
          badge: "3 Proses",
          trend: "up" as const,
          desc: "Dalam proses & review",
        },
        {
          icon: ClockIcon,
          label: "Ketepatan Target Waktu",
          value: "96%",
          badge: "Tepat Waktu",
          trend: "up" as const,
          desc: "Bebas penalti keterlambatan",
        },
      ]
    }

    const perf = calculatePerformance(tasks)
    const completed = tasks.filter((t) => t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in_progress").length
    const review = tasks.filter((t) => t.status === "review").length
    const active = inProgress + review + tasks.filter((t) => t.status === "todo").length

    return [
      {
        icon: StarIcon,
        label: "Bintang Kinerja Saya",
        value: perf.stars.toFixed(1),
        valueSuffix: "/ 5.0",
        badge: perf.predicate,
        isStar: true,
        trend: perf.stars >= 4.0 ? ("up" as const) : ("down" as const),
        desc: `${perf.onTimeRate}% Tepat Waktu (Skor ${perf.score})`,
      },
      {
        icon: CheckCircle2Icon,
        label: "Tugas Selesai",
        value: `${completed}`,
        badge: `${tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%`,
        trend: "up" as const,
        desc: `Dari ${tasks.length} total penugasan kantor`,
      },
      {
        icon: ClipboardListIcon,
        label: "Tugas Aktif Berjalan",
        value: `${active}`,
        badge: `${inProgress} Proses`,
        trend: "up" as const,
        desc: `${inProgress} dalam pengerjaan, ${review} review atasan`,
      },
      {
        icon: ClockIcon,
        label: "Ketepatan Target Waktu",
        value: `${perf.onTimeRate}%`,
        badge: perf.penaltyPoints === 0 ? "Tepat Waktu" : "Ada Penalti",
        trend: perf.onTimeRate >= 85 ? ("up" as const) : ("down" as const),
        desc: `${perf.onTimeRate}% tugas diselesaikan tepat waktu`,
      },
    ]
  }, [tasks])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Watermark icon — faint, top-right */}
          <card.icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />

          {/* Content */}
          <div className="relative">
            {/* Top row: label + badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${
                  card.isStar
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                    : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                }`}
              >
                {card.trend === "up" ? (
                  <TrendingUpIcon className="size-2.5" />
                ) : (
                  <TrendingDownIcon className="size-2.5" />
                )}
                {card.badge}
              </span>
            </div>

            {/* Number Count */}
            <div className="mt-2 flex items-baseline gap-1">
              {card.isStar && (
                <StarIcon className="size-6 text-amber-500 fill-amber-500 shrink-0 self-center mr-0.5" />
              )}
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
                {card.value}
              </span>
              {card.valueSuffix && (
                <span className="text-xs font-bold text-muted-foreground">
                  {card.valueSuffix}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-1 text-[11px] text-muted-foreground">{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
