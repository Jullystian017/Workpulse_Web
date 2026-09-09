"use client"

import * as React from "react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
  LayersIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Task, TaskStatus } from "@/types/database"

interface CalendarViewProps {
  tasks: Task[]
  onSelectTask?: (task: Task) => void
  onSelectDate?: (dateStr: string) => void
  onOpenCreate?: (defaultStatus?: TaskStatus) => void
}

const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

const YEARS = Array.from({ length: 16 }, (_, i) => 2020 + i)

export function CalendarView({ tasks, onSelectDate, onOpenCreate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date())
  const [viewMode, setViewMode] = React.useState<"month" | "week">("month")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (viewMode === "month") {
        d.setMonth(d.getMonth() - 1)
      } else {
        d.setDate(d.getDate() - 7)
      }
      return d
    })
  }

  const handleNext = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (viewMode === "month") {
        d.setMonth(d.getMonth() + 1)
      } else {
        d.setDate(d.getDate() + 7)
      }
      return d
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSelectMonth = (newMonth: string | null) => {
    if (newMonth === null) return
    const m = Number(newMonth)
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setMonth(m)
      return d
    })
  }

  const handleSelectYear = (newYear: string | null) => {
    if (newYear === null) return
    const y = Number(newYear)
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setFullYear(y)
      return d
    })
  }

  const formatDateKey = (y: number, m: number, d: number) => {
    const monthStr = String(m + 1).padStart(2, "0")
    const dayStr = String(d).padStart(2, "0")
    return `${y}-${monthStr}-${dayStr}`
  }

  const now = new Date()
  const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate())

  // Generate calendar days for Month or Week view
  const calendarDays = React.useMemo(() => {
    if (viewMode === "week") {
      // 7 days around current week (starting Sunday)
      const list = []
      const start = new Date(currentDate)
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)

      for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        const dateStr = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
        list.push({
          day: d.getDate(),
          month: d.getMonth(),
          year: d.getFullYear(),
          dateStr,
          isCurrentMonth: d.getMonth() === month,
        })
      }
      return list
    }

    // Month view (full 35 or 42 grid cells)
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const list = []

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      const dateStr = formatDateKey(prevYear, prevMonth, day)
      list.push({
        day,
        month: prevMonth,
        year: prevYear,
        dateStr,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = formatDateKey(year, month, day)
      list.push({
        day,
        month,
        year,
        dateStr,
        isCurrentMonth: true,
      })
    }

    // Next month filler days (fill up to complete weeks)
    const totalCells = list.length <= 35 ? 35 : 42
    const remaining = totalCells - list.length
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const dateStr = formatDateKey(nextYear, nextMonth, day)
      list.push({
        day,
        month: nextMonth,
        year: nextYear,
        dateStr,
        isCurrentMonth: false,
      })
    }

    return list
  }, [currentDate, year, month, viewMode])

  const currentMonthTitle = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col gap-4 font-sans px-4 lg:px-6">
      {/* Calendar Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-[8px] border border-border shadow-xs">
        {/* Left: Title with Month & Year Selectors */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900 shrink-0">
            <CalendarIcon className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-foreground capitalize">
                {MONTH_NAMES[month]}
              </h3>

              {/* Year Dropdown */}
              <Select value={String(year)} onValueChange={handleSelectYear}>
                <SelectTrigger className="h-8 px-2.5 text-xs sm:text-sm font-extrabold rounded-[5px] border-border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shadow-2xs">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-xs font-semibold cursor-pointer">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground hidden sm:inline-flex">
                {viewMode === "month" ? "Tampilan Bulanan" : "Tampilan Mingguan"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Klik tanggal mana saja untuk membuka Workspace Harian (Kanban & Timeline Jam)
            </p>
          </div>
        </div>

        {/* Right: View switcher & Prev/Next Month/Week controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-[5px] bg-muted/60 p-1 border border-border/70">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bulan
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "week"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Minggu
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Today Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 px-3 text-xs font-bold rounded-[5px] border-border text-foreground hover:bg-muted cursor-pointer"
          >
            Hari Ini
          </Button>

          {/* Prev/Next Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="size-8 rounded-xl border-border hover:bg-muted cursor-pointer shadow-2xs"
              title={viewMode === "month" ? "Bulan Sebelumnya" : "Minggu Sebelumnya"}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="size-8 rounded-xl border-border hover:bg-muted cursor-pointer shadow-2xs"
              title={viewMode === "month" ? "Bulan Berikutnya" : "Minggu Berikutnya"}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Days Grid Card */}
      <div className="rounded-[8px] border border-border bg-card shadow-xs overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-extrabold py-3 text-muted-foreground">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx === 0 ? "text-red-500" : ""}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 border-b border-border divide-x divide-y divide-border">
          {calendarDays.map((cell) => {
            const isToday = cell.dateStr === todayKey

            // Match tasks by deadline_at or created_at
            const dayTasks = tasks.filter((t) => {
              const targetDate = t.deadline_at || t.created_at
              return targetDate ? targetDate.startsWith(cell.dateStr) : false
            })

            return (
              <div
                key={cell.dateStr}
                onClick={() => onSelectDate?.(cell.dateStr)}
                className={`min-h-[120px] sm:min-h-[135px] p-2 flex flex-col gap-1.5 transition-all group/cell cursor-pointer relative ${
                  !cell.isCurrentMonth
                    ? "bg-muted/15 opacity-50 hover:opacity-80"
                    : isToday
                    ? "bg-red-50/40 dark:bg-red-950/25 ring-1 ring-red-500/20"
                    : "bg-card hover:bg-muted/30"
                }`}
                title={`Klik untuk buka Workspace Harian ${cell.dateStr}`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`size-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover/cell:scale-110 ${
                      isToday
                        ? "bg-red-600 text-white font-extrabold shadow-sm"
                        : cell.isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayTasks.length > 0 ? (
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold bg-red-100/70 dark:bg-red-950/70 px-1.5 py-0.2 rounded-full border border-red-200 dark:border-red-900">
                      {dayTasks.length} tugas
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-semibold text-muted-foreground/0 group-hover/cell:text-muted-foreground/70 transition-colors">
                      Buka +
                    </span>
                  )}
                </div>

                {/* Day Tasks List (Visual overview only - clicking drills down into daily workspace) */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-24 scrollbar-none pt-0.5 pointer-events-none">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold truncate transition-all shadow-2xs border ${
                        t.status === "done"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          : t.status === "review"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                          : t.status === "in_progress"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                      }`}
                      title={`${t.ticket_code}: ${t.title}`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[9px] opacity-75 shrink-0">{t.ticket_code}</span>
                        <span className="truncate">{t.title}</span>
                      </div>
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
