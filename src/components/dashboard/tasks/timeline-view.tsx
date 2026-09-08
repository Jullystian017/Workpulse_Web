"use client"

import * as React from "react"
import {
  ClockIcon,
  LayersIcon,
  FilterIcon,
  SparklesIcon,
  UserPlusIcon,
  MapPinIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Task } from "@/types/database"

interface TimelineViewProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onOpenDelegate?: (task: Task) => void
  selectedDate?: string | null
  onSelectDate?: (date: string | null) => void
  onOpenCreate?: () => void
}

// 24-Hour / Full Working & Overtime Shifts (07:00 to 22:00 WIB)
const HOUR_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 7 // 07:00 to 22:00
  const label = `${String(h).padStart(2, "0")}:00`
  const nextLabel = `${String(h + 1).padStart(2, "0")}:00`
  return {
    hour: h,
    label,
    rangeLabel: `${label} – ${nextLabel}`,
  }
})

export function TimelineView({
  tasks,
  onSelectTask,
  onOpenDelegate,
  selectedDate: propSelectedDate,
}: TimelineViewProps) {
  const [internalDate] = React.useState<Date>(() => new Date())
  const [filterOnlyWithTasks, setFilterOnlyWithTasks] = React.useState(false)

  const formatDateKey = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const todayKey = formatDateKey(new Date())

  // Active date resolution
  const activeDateObj = propSelectedDate
    ? new Date(propSelectedDate + "T00:00:00")
    : internalDate
  const activeDateKey = formatDateKey(activeDateObj)
  const isToday = activeDateKey === todayKey
  const currentHour = new Date().getHours()

  // Format Helper for Task Deadline Time
  const formatTaskTime = (task: Task) => {
    if (!task.deadline_at) return "17:00 WIB"
    const d = new Date(task.deadline_at)
    const hours = String(d.getHours()).padStart(2, "0")
    const mins = String(d.getMinutes()).padStart(2, "0")
    return `${hours}:${mins} WIB`
  }

  // Group tasks for the active date by Hour (0-23)
  const tasksByHour = React.useMemo(() => {
    const map: Record<number, Task[]> = {}
    HOUR_SLOTS.forEach((slot) => {
      map[slot.hour] = []
    })

    const allDayTasks: Task[] = []

    tasks.forEach((t) => {
      const targetStr = t.deadline_at || t.created_at
      if (!targetStr) {
        allDayTasks.push(t)
        return
      }

      const d = new Date(targetStr)
      const taskDateKey = formatDateKey(d)

      // Match task with active selected date
      if (taskDateKey === activeDateKey) {
        const h = d.getHours()
        if (map[h]) {
          map[h].push(t)
        } else if (h < 7) {
          map[7] = map[7] || []
          map[7].push(t)
        } else {
          map[22] = map[22] || []
          map[22].push(t)
        }
      }
    })

    return { map, allDayTasks }
  }, [tasks, activeDateKey])

  return (
    <div className="flex flex-col gap-4 font-sans px-4 lg:px-6">
      {/* Hourly Schedule Table (Left = Jam, Right = Daftar Tugas) */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3 text-xs font-bold text-muted-foreground">
          <div className="w-36 sm:w-44 shrink-0 flex items-center gap-2 text-foreground font-extrabold">
            <ClockIcon className="size-4 text-red-600" />
            <span>Waktu / Jam (WIB)</span>
          </div>
          <div className="flex-1 flex items-center justify-between pl-4">
            <div className="flex items-center gap-2 text-foreground font-extrabold">
              <LayersIcon className="size-4 text-red-600" />
              <span>Daftar Penugasan Kerja Kantor</span>
            </div>
            {/* Filter Toggle (All Hours vs Only with Tasks) */}
            <button
              type="button"
              onClick={() => setFilterOnlyWithTasks(!filterOnlyWithTasks)}
              className={`h-7 px-2.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterOnlyWithTasks
                  ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                  : "bg-background text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              <FilterIcon className="size-3" />
              <span>{filterOnlyWithTasks ? "Tampilkan Semua Jam" : "Hanya Jam Berisi Tugas"}</span>
            </button>
          </div>
        </div>

        {/* Hour by Hour Schedule Rows */}
        <div className="divide-y divide-border">
          {HOUR_SLOTS.filter((slot) => {
            if (!filterOnlyWithTasks) return true
            return (tasksByHour.map[slot.hour]?.length || 0) > 0
          }).map((slot) => {
            const hourTasks = tasksByHour.map[slot.hour] || []
            const hasTasks = hourTasks.length > 0
            const isCurrentHourNow = isToday && currentHour === slot.hour

            return (
              <div
                key={slot.hour}
                className={`flex flex-col sm:flex-row transition-colors group ${
                  isCurrentHourNow
                    ? "bg-red-50/40 dark:bg-red-950/20"
                    : hasTasks
                    ? "bg-card hover:bg-muted/20"
                    : "bg-card/60 hover:bg-muted/10 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Left Column: Jam / Time Slot */}
                <div
                  className={`w-full sm:w-36 sm:w-44 shrink-0 p-3.5 sm:border-r border-border flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-1 ${
                    isCurrentHourNow
                      ? "bg-red-100/60 dark:bg-red-950/60 border-l-4 border-l-red-600"
                      : "bg-muted/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Current Hour Pulse Marker */}
                    {isCurrentHourNow && (
                      <span className="size-2 rounded-full bg-red-600 animate-ping" />
                    )}
                    <span
                      className={`text-base font-black tracking-tight ${
                        isCurrentHourNow
                          ? "text-red-600 dark:text-red-400"
                          : "text-foreground font-mono"
                      }`}
                    >
                      {slot.label}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      WIB
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {slot.rangeLabel}
                    </span>
                    {hasTasks && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                        {hourTasks.length} tugas
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Area: Tugas Apa Aja di Jam Ini */}
                <div className="flex-1 p-3 sm:p-3.5 min-w-0">
                  {hasTasks ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {hourTasks.map((task) => {
                        const subtasks = task.subtasks || []
                        const completed = subtasks.filter((s) => s.is_completed).length
                        const progressPct =
                          subtasks.length > 0
                            ? Math.round((completed / subtasks.length) * 100)
                            : task.status === "done"
                            ? 100
                            : task.status === "review"
                            ? 85
                            : task.status === "in_progress"
                            ? 45
                            : 15

                        return (
                          <div
                            key={task.id}
                            onClick={() => onSelectTask(task)}
                            className="rounded-xl border border-border bg-card p-3 shadow-2xs hover:shadow-md hover:border-red-400 dark:hover:border-red-800 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 group/card"
                          >
                            {/* Card Header: Ticket + Status + Jam SLA */}
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded-md border border-red-200 dark:border-red-900 leading-none">
                                  {task.ticket_code}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] uppercase font-bold px-1.5 py-0 ${
                                    task.priority === "urgent"
                                      ? "border-red-500 text-red-600 bg-red-50/50"
                                      : task.priority === "high"
                                      ? "border-orange-500 text-orange-600"
                                      : "border-border text-muted-foreground"
                                  }`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Exact Time Badge */}
                                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900">
                                  <ClockIcon className="size-2.5" />
                                  <span>{formatTaskTime(task)}</span>
                                </span>

                                {/* Status Pill */}
                                <span
                                  className={`size-2 rounded-full ${
                                    task.status === "done"
                                      ? "bg-emerald-500"
                                      : task.status === "review"
                                      ? "bg-purple-500"
                                      : task.status === "in_progress"
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                  }`}
                                  title={task.status.replace("_", " ")}
                                />
                              </div>
                            </div>

                            {/* Card Title & Channel */}
                            <div>
                              <h4 className="text-xs font-bold text-foreground group-hover/card:text-red-600 transition-colors line-clamp-2 leading-snug">
                                {task.title}
                              </h4>
                              {task.channel?.name && (
                                <span className="inline-block text-[10px] font-medium text-muted-foreground mt-0.5">
                                  #{task.channel.name}
                                </span>
                              )}
                            </div>

                            {/* Location if present */}
                            {task.location_name && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                <MapPinIcon className="size-2.5 text-red-500 shrink-0" />
                                <span className="truncate">{task.location_name}</span>
                              </div>
                            )}

                            {/* Card Footer: PIC + Delegasi Quick Action + Progress */}
                            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground gap-2">
                              {task.assignee ? (
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <img
                                    src={
                                      task.assignee.avatar_url ||
                                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                                    }
                                    alt={task.assignee.nama}
                                    className="size-5 rounded-full object-cover border border-border shrink-0"
                                  />
                                  <span className="font-semibold text-foreground truncate text-[11px] max-w-[85px]">
                                    {task.assignee.nama.split(" ")[0]}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                  <UserPlusIcon className="size-3 shrink-0" />
                                  <span>Unassigned</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                {onOpenDelegate && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onOpenDelegate(task)
                                    }}
                                    className="h-6 px-1.5 text-[10px] font-bold gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md cursor-pointer"
                                    title="Limpahkan tugas ke bawahan"
                                  >
                                    <SparklesIcon className="size-2.5 text-amber-500" />
                                    <span>Delegasi</span>
                                  </Button>
                                )}

                                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                                  {progressPct}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-2.5 text-xs text-muted-foreground/60 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-border" />
                      <span>Tidak ada jadwal tugas di jam {slot.label}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}




