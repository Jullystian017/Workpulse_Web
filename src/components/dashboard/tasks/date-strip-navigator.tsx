"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Task } from "@/types/database"

import { CustomDatePickerModal } from "@/components/dashboard/tasks/custom-date-picker-modal"

interface DateStripNavigatorProps {
  selectedDate: string | null // YYYY-MM-DD or null for all
  onSelectDate: (date: string | null) => void
  dateFilterMode: "all" | "today" | "week" | "specific"
  onDateFilterModeChange: (mode: "all" | "today" | "week" | "specific") => void
  tasks: Task[]
}

export function DateStripNavigator({
  selectedDate,
  onSelectDate,
  dateFilterMode,
  onDateFilterModeChange,
  tasks,
}: DateStripNavigatorProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [isPickerModalOpen, setIsPickerModalOpen] = React.useState(false)

  // Anchor date (defaults to today)
  const [anchorDate, setAnchorDate] = React.useState<Date>(() => new Date())

  // Generate 28 days (14 days past + today + 13 days future)
  const days = React.useMemo(() => {
    const list: Date[] = []
    const start = new Date(anchorDate)
    start.setDate(start.getDate() - 14)

    for (let i = 0; i < 28; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      list.push(d)
    }
    return list
  }, [anchorDate])

  const formatDateKey = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const todayKey = formatDateKey(new Date())

  // Calculate task counts per date
  const taskCountByDate = React.useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      const targetDate = t.deadline_at || t.created_at
      if (targetDate) {
        const key = formatDateKey(new Date(targetDate))
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return counts
  }, [tasks])

  // Smooth scroll left & right by 320px
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  // Shift anchor date forward/back by 2 weeks
  const handleShiftWeeks = (deltaDays: number) => {
    setAnchorDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + deltaDays)
      return d
    })
  }

  const handleTodayClick = () => {
    const now = new Date()
    setAnchorDate(now)
    onSelectDate(formatDateKey(now))
    onDateFilterModeChange("today")

    // Scroll to center
    if (scrollRef.current) {
      const todayEl = scrollRef.current.querySelector(`[data-date="${todayKey}"]`)
      todayEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }
  }

  const handleAllClick = () => {
    onSelectDate(null)
    onDateFilterModeChange("all")
  }

  const handleWeekClick = () => {
    onSelectDate(null)
    onDateFilterModeChange("week")
  }

  const handleDaySelect = (d: Date) => {
    const key = formatDateKey(d)
    if (selectedDate === key && dateFilterMode === "specific") {
      onSelectDate(null)
      onDateFilterModeChange("all")
    } else {
      onSelectDate(key)
      onDateFilterModeChange("specific")
    }
  }


  // Format month text from anchor
  const currentMonthText = anchorDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  })

  // Selected date formatted text
  const selectedDateText = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs space-y-3 min-w-0 max-w-full overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 max-w-full">
        {/* Left: Month info & active focus indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900 shrink-0">
            <CalendarDaysIcon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-foreground capitalize">
                {currentMonthText}
              </span>
              {dateFilterMode === "all" ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                  Semua Agenda ({tasks.length} tugas)
                </span>
              ) : dateFilterMode === "week" ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  Minggu Ini
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                  {selectedDate === todayKey ? "Hari Ini • " : ""}
                  {selectedDateText}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Geser tanggal atau klik kalender untuk menyaring jadwal penugasan harian
            </p>
          </div>
        </div>

        {/* Right: Presets + Interactive Date Picker Button + Scroll Controls */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap self-end sm:self-auto shrink-0">
          {/* Quick Filters */}
          <Button
            variant={dateFilterMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={handleAllClick}
            className={`h-8 px-2.5 text-xs rounded-xl font-semibold cursor-pointer ${
              dateFilterMode === "all"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua
          </Button>

          <Button
            variant={dateFilterMode === "today" ? "default" : "outline"}
            size="sm"
            onClick={handleTodayClick}
            className={`h-8 px-2.5 text-xs rounded-xl font-semibold cursor-pointer ${
              dateFilterMode === "today"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Hari Ini
          </Button>

          <Button
            variant={dateFilterMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={handleWeekClick}
            className={`h-8 px-2.5 text-xs rounded-xl font-semibold cursor-pointer ${
              dateFilterMode === "week"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Minggu Ini
          </Button>

          {/* Custom Styled Date Picker Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPickerModalOpen(true)}
            className={`h-8 px-2.5 text-xs rounded-xl border gap-1.5 font-semibold transition-colors cursor-pointer ${
              selectedDate && dateFilterMode === "specific"
                ? "border-red-400/80 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CalendarIcon className="size-3.5 text-red-600" />
            <span>{selectedDate && dateFilterMode === "specific" ? "Ubah Tanggal" : "Pilih Tanggal"}</span>
          </Button>

          {/* Custom Date Picker Modal */}
          <CustomDatePickerModal
            open={isPickerModalOpen}
            onOpenChange={setIsPickerModalOpen}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              onSelectDate(date)
              if (date) {
                const picked = new Date(date + "T00:00:00")
                setAnchorDate(picked)
                onDateFilterModeChange("specific")
              } else {
                onDateFilterModeChange("all")
              }
            }}
            tasks={tasks}
          />

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Carousel Slider Controls (< >) */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleScrollLeft}
              className="size-8 rounded-xl border-border hover:bg-muted cursor-pointer shadow-2xs"
              title="Geser Kalender ke Kiri"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleScrollRight}
              className="size-8 rounded-xl border-border hover:bg-muted cursor-pointer shadow-2xs"
              title="Geser Kalender ke Kanan"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Horizontal Swipeable Date Carousel Strip */}
      <div className="relative group min-w-0 max-w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-smooth select-none min-w-0 max-w-full w-full"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {days.map((d) => {
            const key = formatDateKey(d)
            const isToday = key === todayKey
            const isSelected = selectedDate === key && dateFilterMode === "specific"
            const count = taskCountByDate[key] || 0
            const dayName = d.toLocaleDateString("id-ID", { weekday: "short" })
            const dayNum = d.getDate()
            const monthShort = d.toLocaleDateString("id-ID", { month: "short" })

            return (
              <button
                key={key}
                data-date={key}
                type="button"
                onClick={() => handleDaySelect(d)}
                style={{ scrollSnapAlign: "start" }}
                className={`group/btn relative flex flex-col items-center justify-center min-w-[76px] sm:min-w-[84px] py-2.5 px-2 rounded-2xl border transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-600/30 scale-105 z-10"
                    : isToday
                    ? "bg-red-50/70 dark:bg-red-950/40 text-foreground border-red-400 dark:border-red-800 hover:border-red-500 hover:shadow-xs"
                    : "bg-background hover:bg-muted/60 border-border text-foreground hover:border-red-300 dark:hover:border-zinc-700 hover:shadow-2xs"
                }`}
              >
                {/* Is Today indicator */}
                {isToday && !isSelected && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-600 animate-pulse" />
                )}

                {/* Day Name (SEN, SEL, ...) */}
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isSelected ? "text-red-100" : isToday ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                  }`}
                >
                  {dayName}
                </span>

                {/* Date Number */}
                <span
                  className={`text-lg sm:text-xl font-black tracking-tight tabular-nums mt-0.5 leading-none ${
                    isSelected ? "text-white" : "text-foreground"
                  }`}
                >
                  {dayNum}
                </span>

                {/* Month Short */}
                <span
                  className={`text-[9px] font-semibold mt-0.5 ${
                    isSelected ? "text-red-200" : "text-muted-foreground/70"
                  }`}
                >
                  {monthShort}
                </span>

                {/* Task Count Badge */}
                <div className="mt-1.5">
                  {count > 0 ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tabular-nums ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
                      }`}
                    >
                      {count} tugas
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-medium ${
                        isSelected ? "text-red-200" : "text-muted-foreground/30"
                      }`}
                    >
                      -
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
