"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TaskItem } from "./task-detail-sheet"

interface CalendarViewProps {
  tasks: TaskItem[]
  onSelectTask: (task: TaskItem) => void
}

const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

export function CalendarView({ tasks, onSelectTask }: CalendarViewProps) {
  // Generate August 2026 calendar days grid (31 days)
  const calendarDays = React.useMemo(() => {
    const days = []
    // Aug 1, 2026 is Saturday (day 6)
    for (let i = 0; i < 6; i++) {
      days.push({ day: null, dateStr: "" })
    }
    for (let d = 1; d <= 31; d++) {
      const dateStr = `2026-08-${String(d).padStart(2, "0")}`
      days.push({ day: d, dateStr })
    }
    return days
  }, [])

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <CalendarIcon className="size-4 text-primary" />
          Agustus 2026
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
            Hari Ini (12 Ags)
          </Button>
          <Button variant="outline" size="icon" className="size-8">
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-[8px] border bg-card shadow-sm overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-xs font-bold py-3 text-muted-foreground">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 border-b divide-x divide-y">
          {calendarDays.map((cell, idx) => {
            if (!cell.day) {
              return <div key={`empty-${idx}`} className="h-28 bg-muted/20" />
            }

            const isToday = cell.day === 12
            const dayTasks = tasks.filter((t) => t.deadline === cell.dateStr)

            return (
              <div
                key={cell.dateStr}
                className={`h-32 p-2 flex flex-col gap-1 overflow-hidden transition-colors ${
                  isToday ? "bg-primary/5 font-semibold" : "bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`size-6 rounded-full flex items-center justify-center text-xs ${
                      isToday
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground font-medium"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {dayTasks.length} task
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="flex flex-col gap-1 overflow-y-auto pt-1">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`px-2 py-1 rounded text-[11px] font-medium truncate cursor-pointer transition-all hover:scale-[1.02] shadow-xs ${
                        t.status === "Selesai"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : t.status === "Tertunda"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {t.judulTask}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
