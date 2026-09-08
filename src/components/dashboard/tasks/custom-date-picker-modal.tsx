"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  RotateCcwIcon,
  XIcon,
  CheckIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Task } from "@/types/database"

interface CustomDatePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string | null // YYYY-MM-DD
  onSelectDate: (date: string | null) => void
  tasks: Task[]
}

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

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export function CustomDatePickerModal({
  open,
  onOpenChange,
  selectedDate,
  onSelectDate,
  tasks,
}: CustomDatePickerModalProps) {
  // Calendar view state (year & month)
  const initialDate = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date()
  const [viewYear, setViewYear] = React.useState<number>(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = React.useState<number>(initialDate.getMonth()) // 0-11

  // Synchronize view state when modal opens or selectedDate changes
  React.useEffect(() => {
    if (open) {
      const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date()
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [open, selectedDate])

  const formatDateKey = (year: number, month: number, day: number) => {
    const y = year
    const m = String(month + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  // Calculate task counts by date
  const taskCountByDate = React.useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      const targetDate = t.deadline_at || t.created_at
      if (targetDate) {
        const d = new Date(targetDate)
        const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return counts
  }, [tasks])

  // Generate calendar grid cells (42 cells)
  const calendarCells = React.useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay() // 0 is Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const cells: {
      year: number
      month: number
      day: number
      dateKey: string
      isCurrentMonth: boolean
    }[] = []

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear
      cells.push({
        year: prevYear,
        month: prevMonth,
        day,
        dateKey: formatDateKey(prevYear, prevMonth, day),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        year: viewYear,
        month: viewMonth,
        day,
        dateKey: formatDateKey(viewYear, viewMonth, day),
        isCurrentMonth: true,
      })
    }

    // Next month filler days (to fill up to 42 cells or full weeks)
    const remaining = 42 - cells.length
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear
      cells.push({
        year: nextYear,
        month: nextMonth,
        day,
        dateKey: formatDateKey(nextYear, nextMonth, day),
        isCurrentMonth: false,
      })
    }

    return cells
  }, [viewYear, viewMonth])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  const handleSelectDay = (cell: { year: number; month: number; day: number; dateKey: string }) => {
    onSelectDate(cell.dateKey)
    onOpenChange(false)
  }

  const handleTodayClick = () => {
    onSelectDate(todayKey)
    onOpenChange(false)
  }

  const handleClearClick = () => {
    onSelectDate(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] sm:max-w-[400px] p-5 rounded-3xl border border-border bg-card shadow-xl space-y-4">
        <DialogHeader className="pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900">
                <CalendarIcon className="size-4" />
              </div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Pilih Tanggal Penugasan
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Month & Year Navigation Bar */}
        <div className="flex items-center justify-between bg-muted/40 dark:bg-zinc-800/40 p-1.5 rounded-2xl border border-border/70">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="size-8 rounded-xl hover:bg-background cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>

          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span className="text-red-600 dark:text-red-400 font-extrabold text-xs">
              {MONTH_NAMES[viewMonth]}
            </span>

            <Select
              value={String(viewYear)}
              onValueChange={(val) => {
                if (val !== null && val !== undefined) {
                  setViewYear(Number(val))
                }
              }}
            >
              <SelectTrigger className="h-7 px-2 text-xs font-bold rounded-lg border-border bg-background hover:bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs font-medium cursor-pointer">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="size-8 rounded-xl hover:bg-background cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((name, i) => (
            <div
              key={name}
              className={`text-[10px] font-extrabold uppercase py-1 ${
                i === 0 ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell) => {
            const isSelected = selectedDate === cell.dateKey
            const isToday = todayKey === cell.dateKey
            const taskCount = taskCountByDate[cell.dateKey] || 0

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => handleSelectDay(cell)}
                className={`group relative flex flex-col items-center justify-center h-10 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer select-none ${
                  isSelected
                    ? "bg-red-600 text-white font-bold shadow-md ring-2 ring-red-600/30 scale-105 z-10"
                    : isToday
                    ? "border border-red-400 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30 text-foreground font-bold hover:bg-red-100/60"
                    : cell.isCurrentMonth
                    ? "text-foreground hover:bg-muted/70 hover:text-red-600"
                    : "text-muted-foreground/30 hover:bg-muted/40 hover:text-muted-foreground"
                }`}
              >
                <span>{cell.day}</span>

                {/* Task Count Dot Indicator */}
                {taskCount > 0 && (
                  <span
                    className={`size-1.5 rounded-full mt-0.5 ${
                      isSelected
                        ? "bg-white"
                        : "bg-red-600 dark:bg-red-400"
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Footer Actions */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearClick}
            className="h-8 px-3 text-xs rounded-xl border-border text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
          >
            Semua Tanggal
          </Button>

          <Button
            size="sm"
            onClick={handleTodayClick}
            className="h-8 px-4 text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-xs"
          >
            Hari Ini
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
