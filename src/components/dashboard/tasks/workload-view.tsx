"use client"

import * as React from "react"
import {
  UsersIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  PlusIcon,
  UserCheckIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  FlameIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Task, User, ROLE_LABELS } from "@/types/database"

interface WorkloadViewProps {
  tasks: Task[]
  users: User[]
  onSelectTask: (task: Task) => void
  onOpenDelegate: (task: Task) => void
  onOpenCreate: () => void
}

export function WorkloadView({
  tasks,
  users,
  onSelectTask,
  onOpenDelegate,
  onOpenCreate,
}: WorkloadViewProps) {
  // Compute workload metrics for each user
  const userWorkloads = React.useMemo(() => {
    return users.map((user) => {
      const userTasks = tasks.filter((t) => t.assigned_to === user.id)
      const activeTasks = userTasks.filter((t) => t.status !== "done")
      const inProgress = userTasks.filter((t) => t.status === "in_progress").length
      const inReview = userTasks.filter((t) => t.status === "review").length
      const inTodo = userTasks.filter((t) => t.status === "todo").length
      const completed = userTasks.filter((t) => t.status === "done").length

      const activeCount = activeTasks.length

      // Capacity level classification
      // Max nominal load benchmark = 6 tasks
      const loadPercentage = Math.min(Math.round((activeCount / 6) * 100), 100)

      let capacityStatus: "underloaded" | "optimal" | "overloaded" = "optimal"
      let statusLabel = "Optimal"
      let badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-900"
      let barColor = "bg-amber-500"

      if (activeCount <= 2) {
        capacityStatus = "underloaded"
        statusLabel = "Siaga / Tersedia"
        badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900"
        barColor = "bg-emerald-500"
      } else if (activeCount >= 5) {
        capacityStatus = "overloaded"
        statusLabel = "Beban Tinggi"
        badgeClass = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900"
        barColor = "bg-red-500"
      }

      return {
        user,
        activeTasks,
        activeCount,
        inProgress,
        inReview,
        inTodo,
        completed,
        loadPercentage,
        capacityStatus,
        statusLabel,
        badgeClass,
        barColor,
      }
    })
  }, [users, tasks])

  // Summary Metrics
  const totalStaff = users.length
  const totalActiveTasks = tasks.filter((t) => t.status !== "done").length
  const avgLoad = totalStaff > 0 ? (totalActiveTasks / totalStaff).toFixed(1) : "0"
  const availableCount = userWorkloads.filter((w) => w.capacityStatus === "underloaded").length
  const overloadedCount = userWorkloads.filter((w) => w.capacityStatus === "overloaded").length

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 font-sans">
      {/* 4 Summary Heatmap Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Total Personil Terdaftar</span>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-foreground">{totalStaff}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Rantai komando SGM s/d Staff</p>
          </div>
          <div className="size-11 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
            <UsersIcon className="size-5.5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Rata-rata Beban Tugas</span>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {avgLoad} <span className="text-sm font-medium text-muted-foreground">tugas/org</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Kapasitas aman: ≤ 4 tugas</p>
          </div>
          <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ClockIcon className="size-5.5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Personil Siaga / Tersedia</span>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-emerald-600">
              {availableCount} <span className="text-sm font-medium text-muted-foreground">personil</span>
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" /> Rekomendasi delegasi baru
            </p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheckIcon className="size-5.5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Personil Beban Tinggi</span>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-red-600">
              {overloadedCount} <span className="text-sm font-medium text-muted-foreground">personil</span>
            </p>
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-red-500 inline-block" /> Beban kerja ≥ 5 tugas
            </p>
          </div>
          <div className="size-11 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
            <FlameIcon className="size-5.5" />
          </div>
        </div>
      </div>

      {/* Capacity Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {userWorkloads.map((item) => {
          const roleMeta = ROLE_LABELS[item.user.role] || { label: item.user.role, color: "bg-muted text-muted-foreground" }
          return (
            <div
              key={item.user.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Top User Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.user.avatar_url ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={item.user.nama}
                      className="size-11 rounded-full object-cover ring-2 ring-border shadow-xs shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight">{item.user.nama}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.user.position_title || "Kantor Telkom Akses"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className={`px-2 py-0.2 text-[10px] font-bold ${roleMeta.color}`}>
                          {roleMeta.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">NIK: {item.user.nik}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${item.badgeClass}`}>
                    {item.statusLabel}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-muted-foreground">Kapasitas Beban Kerja</span>
                    <span className="tabular-nums font-bold text-foreground">
                      {item.activeCount} / 6 Tugas ({item.loadPercentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${item.barColor}`}
                      style={{ width: `${item.loadPercentage}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-[11px] text-muted-foreground text-center">
                    <span className="bg-muted/40 py-1 rounded">Proses: <strong>{item.inProgress}</strong></span>
                    <span className="bg-muted/40 py-1 rounded">Review: <strong>{item.inReview}</strong></span>
                    <span className="bg-muted/40 py-1 rounded">Selesai: <strong>{item.completed}</strong></span>
                  </div>
                </div>

                {/* Active Tasks Assigned List */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tugas Aktif ({item.activeTasks.length})
                  </span>
                  <div className="space-y-1.5 mt-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {item.activeTasks.length === 0 ? (
                      <div className="p-3 text-center rounded-xl bg-muted/20 border border-dashed border-border text-[11px] text-muted-foreground">
                        Sedang tidak memegang tugas aktif. Siap didelegasikan tugas baru.
                      </div>
                    ) : (
                      item.activeTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask(t)}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl border border-border/70 bg-background hover:bg-muted/50 cursor-pointer transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 shrink-0">
                                {t.ticket_code}
                              </span>
                              <span className="text-xs font-semibold text-foreground truncate">{t.title}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Channel: #{t.channel?.name || "Umum"}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase font-bold shrink-0 ${
                              t.priority === "urgent"
                                ? "text-red-700 bg-red-50 border-red-200"
                                : t.priority === "high"
                                ? "text-amber-700 bg-amber-50 border-amber-200"
                                : "text-muted-foreground"
                            }`}
                          >
                            {t.priority}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenCreate}
                  className="h-8 px-3 text-xs font-semibold rounded-xl gap-1 hover:bg-muted"
                >
                  <PlusIcon className="size-3.5" />
                  <span>Buat & Tugaskan</span>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
