"use client"

import * as React from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  StarIcon,
  EyeIcon,
} from "lucide-react"
import { Task } from "@/types/database"
import { calculatePerformance, getActiveUserFromStorage, getTaskAssigneeIds } from "@/lib/api"

export function KaryawanSectionCards({ tasks }: { tasks?: Task[] }) {
  const cards = React.useMemo(() => {
    const activeUser = getActiveUserFromStorage()
    const allTasks = tasks || []
    const isManagerOrOfficer = activeUser && ['manager', 'sgm', 'officer_1', 'officer_2', 'officer_3'].includes(activeUser.role)

    // Direct tasks
    const directTasks = activeUser
      ? allTasks.filter((t) => getTaskAssigneeIds(t).includes(activeUser.id) || t.created_by === activeUser.id)
      : allTasks

    // Reviewer & subordinate tasks
    const reviewerTasks = activeUser ? allTasks.filter((t) => t.reviewer_id === activeUser.id) : []
    const pendingReviewTasks = activeUser
      ? allTasks.filter(
          (t) =>
            (t.reviewer_id === activeUser.id || (t.assignee?.supervisor_id === activeUser.id && !t.reviewer_id)) &&
            t.status === 'review'
        )
      : []
    const teamTasks = activeUser ? allTasks.filter((t) => t.assignee?.supervisor_id === activeUser.id) : []

    const evaluatedTasks = directTasks.length > 0
      ? directTasks
      : isManagerOrOfficer
      ? (reviewerTasks.length > 0 ? reviewerTasks : teamTasks)
      : directTasks

    const perf = calculatePerformance(evaluatedTasks, {
      role: activeUser?.role,
      userId: activeUser?.id,
      reviewerTasks,
      teamTasks,
    })

    // 1. Tampilan Khusus Role Manager / Officer (Supervisi, Review & Tim SLA)
    if (isManagerOrOfficer) {
      const activeSupervisionCount = (teamTasks.length > 0 ? teamTasks : (reviewerTasks.length > 0 ? reviewerTasks : directTasks))
        .filter((t) => t.status === "in_progress" || t.status === "review" || t.status === "todo").length
      const totalSupervisionCount = teamTasks.length > 0 ? teamTasks.length : (reviewerTasks.length > 0 ? reviewerTasks.length : directTasks.length)

      return [
        {
          icon: StarIcon,
          label: "Bintang Supervisi Saya",
          value: perf.stars.toFixed(1),
          valueSuffix: "/ 5.0",
          badge: perf.predicate,
          isStar: true,
          trend: perf.stars >= 4.0 ? ("up" as const) : ("down" as const),
          desc: `${perf.onTimeRate}% SLA Tim (Skor ${perf.score})`,
        },
        {
          icon: EyeIcon,
          label: "Menunggu Review Saya",
          value: `${pendingReviewTasks.length}`,
          badge: pendingReviewTasks.length > 0 ? `${pendingReviewTasks.length} Perlu Cek` : "Tuntas",
          trend: pendingReviewTasks.length > 0 ? ("down" as const) : ("up" as const),
          desc: pendingReviewTasks.length > 0
            ? "Tugas bawahan menunggu verifikasi Anda"
            : "Semua antrean review telah diverifikasi",
        },
        {
          icon: ClipboardListIcon,
          label: "Tugas Dalam Supervisi",
          value: `${totalSupervisionCount}`,
          badge: `${activeSupervisionCount} Aktif`,
          trend: "up" as const,
          desc: `${activeSupervisionCount} tugas sedang berjalan dalam pengawasan`,
        },
        {
          icon: ClockIcon,
          label: "Ketepatan Waktu SLA",
          value: `${perf.onTimeRate}%`,
          badge: perf.penaltyPoints === 0 ? "SLA Prima" : "Ada Penalti",
          trend: perf.onTimeRate >= 85 ? ("up" as const) : ("down" as const),
          desc: perf.penaltyPoints === 0 ? "Bebas penalti keterlambatan tugas & review" : `Penalti -${perf.penaltyPoints} poin keterlambatan`,
        },
      ]
    }

    // 2. Tampilan Khusus Staff Pelaksana
    if (!directTasks || directTasks.length === 0) {
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

    const completed = directTasks.filter((t) => t.status === "done").length
    const inProgress = directTasks.filter((t) => t.status === "in_progress").length
    const review = directTasks.filter((t) => t.status === "review").length
    const active = inProgress + review + directTasks.filter((t) => t.status === "todo").length

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
        badge: `${Math.round((completed / directTasks.length) * 100)}%`,
        trend: "up" as const,
        desc: `${completed} dari ${directTasks.length} total penugasan Anda`,
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
