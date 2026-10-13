"use client"

import * as React from "react"
import {
  SparklesIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  AwardIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  EyeIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import { Task } from "@/types/database"
import { calculatePerformance, getActiveUserFromStorage, getTaskAssigneeIds } from "@/lib/api"

interface KaryawanAiInsightProps {
  tasks?: Task[]
}

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes cache to avoid AI rate limits

export function KaryawanAiInsight({ tasks = [] }: KaryawanAiInsightProps) {
  const aiPanel = useAiPanel()
  const activeUser = React.useMemo(() => getActiveUserFromStorage(), [])

  const isManagerOrOfficer = React.useMemo(() => {
    return ['manager', 'sgm', 'officer_1', 'officer_2', 'officer_3'].includes(activeUser?.role || '')
  }, [activeUser])

  // Tasks waiting for user's approval/review
  const pendingReviewTasks = React.useMemo(() => {
    if (!activeUser) return []
    return tasks.filter(
      (t) =>
        (t.reviewer_id === activeUser.id || (t.assignee?.supervisor_id === activeUser.id && !t.reviewer_id)) &&
        t.status === 'review'
    )
  }, [tasks, activeUser])

  // Direct tasks or relevant tasks scope
  const myTasks = React.useMemo(() => {
    if (!activeUser) return tasks
    const direct = tasks.filter(
      (t) => getTaskAssigneeIds(t).includes(activeUser.id) || t.created_by === activeUser.id
    )
    if (direct.length > 0) return direct
    // If manager/officer has no direct assigned tasks, evaluate their review/supervisory tasks
    if (isManagerOrOfficer) {
      return tasks.filter((t) => t.reviewer_id === activeUser.id || t.assignee?.supervisor_id === activeUser.id)
    }
    return direct
  }, [tasks, activeUser, isManagerOrOfficer])

  // Reviewer tasks
  const reviewerTasks = React.useMemo(() => {
    if (!activeUser) return []
    return tasks.filter((t) => t.reviewer_id === activeUser.id)
  }, [tasks, activeUser])

  // Team tasks under supervision
  const teamTasks = React.useMemo(() => {
    if (!activeUser) return []
    return tasks.filter((t) => t.assignee?.supervisor_id === activeUser.id)
  }, [tasks, activeUser])

  // Synchronized performance calculation with role awareness
  const perf = React.useMemo(() => {
    return calculatePerformance(myTasks, {
      role: activeUser?.role,
      userId: activeUser?.id,
      reviewerTasks,
      teamTasks,
    })
  }, [myTasks, activeUser, reviewerTasks, teamTasks])

  // Pick top priority active task
  const topActiveTask = React.useMemo(() => {
    const active = myTasks.filter((t) => t.status === "in_progress" || t.status === "todo")
    if (active.length === 0) return null

    const prioWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
    return [...active].sort((a, b) => (prioWeight[b.priority] || 0) - (prioWeight[a.priority] || 0))[0]
  }, [myTasks])

  const hasTasks = myTasks.length > 0 || pendingReviewTasks.length > 0 || teamTasks.length > 0

  // Default deterministic data from synchronized math
  const defaultInsight = React.useMemo(() => {
    return {
      scoreText: isManagerOrOfficer
        ? `Skor Supervisi ${perf.score}/100`
        : hasTasks
        ? `Skor Kinerja ${perf.score}/100`
        : "Akun Baru Terdaftar",
      scoreDesc: isManagerOrOfficer
        ? `Kategori ${perf.predicate} (${perf.onTimeRate}% SLA on-time tim & review).`
        : hasTasks
        ? `Masuk kategori ${perf.predicate} (${perf.onTimeRate}% SLA On-Time) bulan ini.`
        : "Belum ada riwayat penugasan yang dievaluasi.",
      focusTaskTitle:
        pendingReviewTasks.length > 0
          ? `Tinjau ${pendingReviewTasks.length} Tugas Menunggu`
          : topActiveTask
          ? "Fokus Task Hari Ini"
          : isManagerOrOfficer
          ? "Supervisi Terkendali"
          : "Belum Ada Tugas Aktif",
      focusTaskDesc:
        pendingReviewTasks.length > 0
          ? `Prioritaskan review [${pendingReviewTasks[0].ticket_code}] "${pendingReviewTasks[0].title.slice(0, 30)}"`
          : topActiveTask
          ? `Prioritaskan [${topActiveTask.ticket_code}] "${topActiveTask.title.slice(0, 30)}" agar selesai tepat waktu.`
          : isManagerOrOfficer
          ? "Seluruh antrean review telah diverifikasi tuntas."
          : "Saat ini belum ada tugas aktif yang dialokasikan ke akun Anda.",
      penaltyTitle:
        perf.penaltyPoints === 0
          ? isManagerOrOfficer
            ? "SLA Supervisi Prima"
            : "Bebas Penalti Keterlambatan"
          : "Catatan Penalti SLA",
      penaltyDesc:
        perf.penaltyPoints === 0
          ? isManagerOrOfficer
            ? "Seluruh tugas pengawasan dan proses review berjalan tepat waktu."
            : "Tidak ada catatan penalti keterlambatan SLA."
          : `Tercatat pengurangan ${perf.penaltyPoints} poin penalti keterlambatan.`,
      isAiGenerated: false,
    }
  }, [isManagerOrOfficer, perf, hasTasks, pendingReviewTasks, topActiveTask])

  const [insight, setInsight] = React.useState(defaultInsight)
  const [isLoadingAi, setIsLoadingAi] = React.useState(false)

  // Cache signature: hash of user + score + pending review count + tasks count
  const cacheSignature = React.useMemo(() => {
    return `${activeUser?.id || 'anon'}_${activeUser?.role || 'staff'}_${perf.score}_${pendingReviewTasks.length}_${topActiveTask?.ticket_code || 'none'}_${tasks.length}`
  }, [activeUser, perf.score, pendingReviewTasks.length, topActiveTask, tasks.length])

  // Fetch or retrieve cached Groq AI insight
  const fetchAiInsight = React.useCallback(async (force = false) => {
    if (!activeUser) return

    const cacheKey = `workpulse_insight_${activeUser.id}`

    // 1. Check client-side sessionStorage cache first (unless force refresh)
    if (!force && typeof window !== "undefined") {
      try {
        const cachedRaw = sessionStorage.getItem(cacheKey)
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw)
          const isFresh = Date.now() - (parsed.timestamp || 0) < CACHE_TTL_MS
          if (isFresh && parsed.sig === cacheSignature && parsed.data) {
            setInsight(parsed.data)
            return
          }
        }
      } catch (err) {
        // Cache read fail, continue to API
      }
    }

    setIsLoadingAi(true)

    try {
      const payload = {
        userName: activeUser?.nama || "Karyawan",
        userRole: activeUser?.role || "Staff",
        score: perf.score,
        predicate: perf.predicate,
        onTimeRate: perf.onTimeRate,
        penaltyPoints: perf.penaltyPoints,
        pendingReviewTasks: pendingReviewTasks.slice(0, 3).map((t) => ({
          ticket_code: t.ticket_code,
          title: t.title,
          priority: t.priority,
          deadline_at: t.deadline_at,
          assignee_name: t.assignee?.nama || "Bawahan",
        })),
        activeTasks: myTasks
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

      if (data) {
        const finalData = {
          scoreText: data.scoreText || defaultInsight.scoreText,
          scoreDesc: data.scoreDesc || defaultInsight.scoreDesc,
          focusTaskTitle: data.focusTaskTitle || defaultInsight.focusTaskTitle,
          focusTaskDesc: data.focusTaskDesc || defaultInsight.focusTaskDesc,
          penaltyTitle: data.penaltyTitle || defaultInsight.penaltyTitle,
          penaltyDesc: data.penaltyDesc || defaultInsight.penaltyDesc,
          isAiGenerated: Boolean(data.isAiGenerated),
        }

        setInsight(finalData)

        // Store in sessionStorage with TTL
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                timestamp: Date.now(),
                sig: cacheSignature,
                data: finalData,
              })
            )
          } catch (e) {
            // Storage quota full or unavailable
          }
        }

        if (force) {
          toast.success("Insight AI berhasil diperbarui!")
        }
      }
    } catch (err) {
      console.warn("Could not fetch Groq insight, keeping synced math:", err)
      setInsight(defaultInsight)
    } finally {
      setIsLoadingAi(false)
    }
  }, [activeUser, cacheSignature, perf, pendingReviewTasks, myTasks, defaultInsight])

  React.useEffect(() => {
    fetchAiInsight(false)
  }, [fetchAiInsight])

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

              {/* Refresh AI button with cache notice */}
              <button
                type="button"
                onClick={() => fetchAiInsight(true)}
                disabled={isLoadingAi}
                title="Segarkan analisis AI (Gunakan hemat agar tidak terkena limit)"
                className="inline-flex items-center gap-1 rounded-[6px] border border-border/60 bg-background/60 hover:bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCwIcon className={`size-3 ${isLoadingAi ? "animate-spin text-red-600" : ""}`} />
                <span>{isLoadingAi ? "Menganalisis..." : "Segarkan"}</span>
              </button>

              {isManagerOrOfficer && pendingReviewTasks.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[11px] font-semibold">
                  <EyeIcon className="size-3" />
                  {pendingReviewTasks.length} Review Menunggu
                </span>
              )}
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

              {/* Bullet 2: Top Active Task or Review Queue Alert */}
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
