"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  SparklesIcon,
} from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TaskDeadlinePickerProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
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

const DAY_NAMES = [
  { short: "Min", full: "Minggu" },
  { short: "Sen", full: "Senin" },
  { short: "Sel", full: "Selasa" },
  { short: "Rab", full: "Rabu" },
  { short: "Kam", full: "Kamis" },
  { short: "Jum", full: "Jumat" },
  { short: "Sab", full: "Sabtu" },
]

const PRESETS = [
  { label: "Hari Ini", days: 0, hour: 18 },
  { label: "Besok", days: 1, hour: 18 },
  { label: "3 Hari", days: 3, hour: 18 },
  { label: "5 Hari Kerja", days: 5, hour: 18 },
  { label: "1 Minggu", days: 7, hour: 18 },
  { label: "2 Minggu", days: 14, hour: 18 },
]

export function TaskDeadlinePicker({
  value,
  onChange,
  className,
}: TaskDeadlinePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Current view year & month in calendar
  const [viewYear, setViewYear] = React.useState<number>(() => value.getFullYear())
  const [viewMonth, setViewMonth] = React.useState<number>(() => value.getMonth())
  const [selectedHour, setSelectedHour] = React.useState<number>(() => value.getHours() || 18)
  const [selectedMinute, setSelectedMinute] = React.useState<number>(() => value.getMinutes() || 0)

  // Sync calendar view month when value changes
  React.useEffect(() => {
    setViewYear(value.getFullYear())
    setViewMonth(value.getMonth())
    setSelectedHour(value.getHours())
    setSelectedMinute(value.getMinutes())
  }, [value])

  const today = new Date()
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Generate calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sunday
  const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate()

  const handleSelectDay = (day: number, monthOffset = 0) => {
    const targetMonth = viewMonth + monthOffset
    const newDate = new Date(viewYear, targetMonth, day, selectedHour, selectedMinute, 0)
    onChange(newDate)
    setIsOpen(false)
  }

  const handleApplyPreset = (daysOffset: number, defaultHour = 18) => {
    const base = new Date()
    base.setDate(base.getDate() + daysOffset)
    base.setHours(defaultHour, 0, 0, 0)
    onChange(base)
    setViewYear(base.getFullYear())
    setViewMonth(base.getMonth())
    setSelectedHour(defaultHour)
    setSelectedMinute(0)
    setIsOpen(false)
  }

  const handleTimeChange = (newHour: number, newMin: number) => {
    setSelectedHour(newHour)
    setSelectedMinute(newMin)
    const updated = new Date(value)
    updated.setHours(newHour, newMin, 0, 0)
    onChange(updated)
  }

  // Relative label calculation
  const getRelativeText = (date: Date) => {
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffTime = target.getTime() - todayDateOnly.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hari Ini"
    if (diffDays === 1) return "Besok"
    if (diffDays === 2) return "2 Hari Lagi"
    if (diffDays === 7) return "1 Minggu"
    if (diffDays > 0) return `${diffDays} Hari Lagi`
    if (diffDays === -1) return "Kemarin"
    return `${Math.abs(diffDays)} Hari Lalu`
  }

  const isSelectedDate = (year: number, month: number, day: number) => {
    return (
      value.getFullYear() === year &&
      value.getMonth() === month &&
      value.getDate() === day
    )
  }

  const isTodayDate = (year: number, month: number, day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  const formattedDate = value.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const formattedTime = `${String(value.getHours()).padStart(2, "0")}:${String(
    value.getMinutes()
  ).padStart(2, "0")} WIB`

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        type="button"
        className={cn(
          "w-full h-10 px-3 rounded-xl bg-background border border-border flex items-center justify-between text-left transition-all hover:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="size-4 text-red-600 dark:text-red-400 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs md:text-sm text-foreground truncate">
              {formattedDate}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">
              ({formattedTime})
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 shrink-0">
          {getRelativeText(value)}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[320px] sm:w-[340px] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl"
      >
        {/* Calendar Red Header - Telkom Signature Style */}
        <div className="bg-gradient-to-r from-[#d31920] to-[#b01016] text-white p-3 flex items-center justify-between shadow-md">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="size-7 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            title="Bulan sebelumnya"
          >
            <ChevronLeftIcon className="size-4" />
          </button>

          <div className="flex items-center gap-1.5 text-center">
            <span className="font-extrabold text-sm tracking-wide">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="size-7 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            title="Bulan berikutnya"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 px-3 pt-3 pb-1 text-center bg-muted/30 border-b border-border/50">
          {DAY_NAMES.map((d, i) => (
            <div
              key={d.short}
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider py-0.5",
                i === 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
              )}
            >
              {d.short}
            </div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous month filler days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const day = prevMonthLastDate - firstDayIndex + 1 + i
              return (
                <button
                  key={`prev-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day, -1)}
                  className="h-8 rounded-lg text-xs text-muted-foreground/30 hover:bg-muted/50 transition-colors flex items-center justify-center"
                >
                  {day}
                </button>
              )
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const selected = isSelectedDate(viewYear, viewMonth, day)
              const isToday = isTodayDate(viewYear, viewMonth, day)
              const cellDate = new Date(viewYear, viewMonth, day)
              const isPast = cellDate < todayDateOnly

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day, 0)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-semibold transition-all relative flex items-center justify-center",
                    selected
                      ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30 ring-2 ring-red-600/20"
                      : isToday
                      ? "border border-red-500 font-bold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50"
                      : isPast
                      ? "text-muted-foreground/45 hover:bg-muted hover:text-foreground"
                      : "text-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{day}</span>
                  {isToday && !selected && (
                    <span className="absolute bottom-0.5 size-1 rounded-full bg-red-600" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Presets Chips */}
          <div className="mt-3 pt-2.5 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <SparklesIcon className="size-3 text-red-500" />
                Pilihan Cepat:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p.days, p.hour)}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-muted hover:bg-red-600 hover:text-white transition-colors text-foreground border border-border/60 text-center truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker Bar */}
          <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <ClockIcon className="size-3 text-muted-foreground" />
              Batas Jam:
            </span>
            <div className="flex items-center gap-1">
              <select
                value={selectedHour}
                onChange={(e) => handleTimeChange(Number(e.target.value), selectedMinute)}
                className="h-7 px-1.5 rounded-md bg-muted text-xs font-bold border border-border focus:outline-none"
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="font-bold">:</span>
              <select
                value={selectedMinute}
                onChange={(e) => handleTimeChange(selectedHour, Number(e.target.value))}
                className="h-7 px-1.5 rounded-md bg-muted text-xs font-bold border border-border focus:outline-none"
              >
                {[0, 15, 30, 45, 59].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="text-[10px] font-bold text-muted-foreground ml-0.5">WIB</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
