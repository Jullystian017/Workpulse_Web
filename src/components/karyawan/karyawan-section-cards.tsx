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
import { calculatePerformance, getActiveUserFromStorage } from "@/lib/api"

export function KaryawanSectionCards({ tasks }: { tasks?: Task[] }) {
  const cards = React.useMemo(() => {
    const activeUser = getActiveUserFromStorage()
    const myTasks = activeUser && tasks
      ? tasks.filter((t) => t.assigned_to === activeUser.id || t.created_by === activeUser.id)
      : (tasks || [])

    // Jika pengguna baru atau belum memiliki penugasan
    if (!myTasks || myTasks.length === 0) {
      return [
        {
          icon: StarIcon,
          label: "Bintang Kinerja Saya",
          value: "5.0",
          valueSuffix: "/ 5.0",
          badge: "Akun Baru",
          isStar: true,
          trend: "up" as const,
          desc: "Belum ada riwayat tugas yang dievaluasi",
        },
        {
          icon: CheckCircle2Icon,
          label: "Tugas Selesai",
          value: "0",
          badge: "0%",
          trend: "up" as const,
          desc: "Belum ada tugas yang diselesaikan",
        },
        {
          icon: ClipboardListIcon,
          label: "Tugas Aktif Berjalan",
          value: "0",
          badge: "0 Proses",
          trend: "up" as const,
          desc: "Tidak ada tugas dalam pengerjaan",
        },
        {
          icon: ClockIcon,
          label: "Ketepatan Target Waktu",
          value: "100%",
          badge: "Tepat Waktu",
          trend: "up" as const,
          desc: "Bebas penalti keterlambatan",
        },
      ]
    }

    const perf = calculatePerformance(myTasks)
    const completed = myTasks.filter((t) => t.status === "done").length
    const inProgress = myTasks.filter((t) => t.status === "in_progress").length
    const review = myTasks.filter((t) => t.status === "review").length
    const active = inProgress + review + myTasks.filter((t) => t.status === "todo").length

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
        badge: `${Math.round((completed / myTasks.length) * 100)}%`,
        trend: "up" as const,
        desc: `${completed} dari ${myTasks.length} total penugasan Anda`,
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
