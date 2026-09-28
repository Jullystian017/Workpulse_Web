"use client"

import * as React from "react"
import {
  SparklesIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  AwardIcon,
  CheckCircle2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import { Task } from "@/types/database"
import { calculatePerformance, getActiveUserFromStorage } from "@/lib/api"

interface KaryawanAiInsightProps {
  tasks?: Task[]
}

export function KaryawanAiInsight({ tasks = [] }: KaryawanAiInsightProps) {
  const aiPanel = useAiPanel()
  const activeUser = React.useMemo(() => getActiveUserFromStorage(), [])

  // Calculate synchronized performance metrics identical to admin dashboard
  const myTasks = React.useMemo(() => {
    if (!activeUser) return tasks
    const filtered = tasks.filter((t) => t.assigned_to === activeUser.id)
    return filtered.length > 0 ? filtered : tasks
  }, [tasks, activeUser])

  const perf = React.useMemo(() => {
    return calculatePerformance(myTasks)
  }, [myTasks])

  // Pick top priority active task
  const topActiveTask = React.useMemo(() => {
    const active = myTasks.filter((t) => t.status === "in_progress" || t.status === "todo")
    if (active.length === 0) return null

    const prioWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
    return [...active].sort((a, b) => (prioWeight[b.priority] || 0) - (prioWeight[a.priority] || 0))[0]
  }, [myTasks])

  // Default deterministic data from admin calculation
  const [insight, setInsight] = React.useState({
    scoreText: `Skor Kinerja ${perf.score}/100`,
    scoreDesc: `Masuk kategori ${perf.predicate} (${perf.onTimeRate}% SLA On-Time) bulan ini.`,
    focusTaskTitle: topActiveTask ? "Fokus Task Hari Ini" : "Status Tugas Terkendali",
    focusTaskDesc: topActiveTask
      ? `Prioritaskan [${topActiveTask.ticket_code}] "${topActiveTask.title.slice(0, 30)}${topActiveTask.title.length > 30 ? "..." : ""}" agar selesai tepat waktu.`
      : "Seluruh penugasan aktif telah terselesaikan dengan baik tanpa tunggakan.",
    penaltyTitle: perf.penaltyPoints === 0 ? "Bebas Penalti Keterlambatan" : "Catatan Penalti SLA",
    penaltyDesc:
      perf.penaltyPoints === 0
        ? "Seluruh tugas prioritas tinggi bulan ini diselesaikan tepat waktu."
        : `Tercatat pengurangan -${perf.penaltyPoints} poin dari ${perf.overdueCount} tugas melewati batas toleransi SLA.`,
    isAiGenerated: false,
  })

  const [isLoadingAi, setIsLoadingAi] = React.useState(false)

  // Fetch Groq AI insight
  React.useEffect(() => {
    let isMounted = true

    async function fetchAiInsight() {
      if (!tasks) return
      setIsLoadingAi(true)

      try {
        const payload = {
          userName: activeUser?.nama || "Karyawan",
          userRole: activeUser?.role || "Staff",
          score: perf.score,
          predicate: perf.predicate,
          onTimeRate: perf.onTimeRate,
          penaltyPoints: perf.penaltyPoints,
          activeTasks: tasks
            .filter((t) => t.status === "in_progress" || t.status === "todo")
            .slice(0, 3)
            .map((t) => ({
              ticket_code: t.ticket_code,
              title: t.title,
              priority: t.priority,
              deadline_at: t.deadline_at,
              status: t.status,
            })),
        }

        const res = await fetch("/api/ai/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error("API response error")
        const data = await res.json()

        if (isMounted && data) {
          setInsight({
            scoreText: data.scoreText || `Skor Kinerja ${perf.score}/100`,
            scoreDesc: data.scoreDesc || `Masuk kategori ${perf.predicate} (${perf.onTimeRate}% SLA On-Time).`,
            focusTaskTitle: data.focusTaskTitle || "Fokus Task Hari Ini",
            focusTaskDesc:
              data.focusTaskDesc ||
              (topActiveTask
                ? `Prioritaskan ${topActiveTask.ticket_code} agar selesai tepat waktu.`
                : "Seluruh penugasan terselesaikan."),
            penaltyTitle: data.penaltyTitle || (perf.penaltyPoints === 0 ? "Bebas Penalti Keterlambatan" : "Catatan Penalti SLA"),
            penaltyDesc:
              data.penaltyDesc ||
              (perf.penaltyPoints === 0
                ? "Seluruh tugas prioritas tinggi diselesaikan tepat waktu."
                : `Penalti -${perf.penaltyPoints} poin keterlambatan.`),
            isAiGenerated: Boolean(data.isAiGenerated),
          })
        }
      } catch (err) {
        console.warn("Could not fetch Groq insight, keeping synced admin math:", err)
      } finally {
        if (isMounted) setIsLoadingAi(false)
      }
    }

    fetchAiInsight()

    return () => {
      isMounted = false
    }
  }, [tasks, activeUser, perf, topActiveTask])

  return (
    <div className="px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-[8px] border border-red-200/80 dark:border-red-950/80 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-xs">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-red-500/10 blur-2xl dark:bg-red-500/20" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left section: Header & Badge */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                <SparklesIcon className="size-3.5 fill-white" />
                WorkPulse AI Assistant Insight
              </span>
            </div>

            {/* 3 Insight Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Bullet 1: Score & Predicate */}
              <div className="flex items-start gap-2.5 rounded-[8px] border border-border/60 bg-background/80 p-2.5 backdrop-blur-xs">
                <div className="size-7 rounded-[8px] bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                  <AwardIcon className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{insight.scoreText}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {insight.scoreDesc}
                  </p>
                </div>
              </div>

              {/* Bullet 2: Top Active Task Alert */}
              <div className="flex items-start gap-2.5 rounded-[8px] border border-border/60 bg-background/80 p-2.5 backdrop-blur-xs">
                <div className="size-7 rounded-[8px] bg-red-50 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{insight.focusTaskTitle}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {insight.focusTaskDesc}
                  </p>
                </div>
              </div>

              {/* Bullet 3: Penalty & SLA Status */}
              <div className="flex items-start gap-2.5 rounded-[8px] border border-border/60 bg-background/80 p-2.5 backdrop-blur-xs">
                <div className="size-7 rounded-[8px] bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                  <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{insight.penaltyTitle}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {insight.penaltyDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right section: AI Panel CTA button */}
          <div className="flex items-center shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => aiPanel?.toggleAiPanel()}
              className="w-full sm:w-auto h-9 px-4 gap-1.5 rounded-[8px] text-xs font-bold border-red-200 dark:border-red-900 bg-background hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 cursor-pointer transition-all shadow-2xs"
            >
              <span>Konsultasi Kinerja AI</span>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
