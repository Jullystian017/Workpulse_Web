"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ActivityIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { Task } from "@/types/database"
import { getTasks } from "@/lib/api"

export const description = "Tren Penyelesaian Task Karyawan"

type TimeView = "mingguan" | "bulanan" | "tahunan"

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

const MONTH_SHORT_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
]

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function getTaskDate(t: Task): Date | null {
  // Gunakan tanggal target pelaksanaan tugas (deadline) atau tanggal dibuat
  if (t.deadline_at) {
    const d = new Date(t.deadline_at)
    if (!isNaN(d.getTime())) return d
  }
  if (t.created_at) {
    const d = new Date(t.created_at)
    if (!isNaN(d.getTime())) return d
  }
  if (t.completed_at) {
    const d = new Date(t.completed_at)
    if (!isNaN(d.getTime())) return d
  }
  return null
}

function getRealChartData(view: TimeView, tasks: Task[]) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  if (view === "mingguan") {
    // 7 Hari dalam Minggu Berjalan (Senin 00:00:00 s/d Minggu 23:59:59)
    const currentDay = now.getDay()
    const diffToMonday = (currentDay + 6) % 7 // 0 jika Senin, ..., 6 jika Minggu
    const monday = new Date(now)
    monday.setDate(now.getDate() - diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    // FILTER KETAT: Hanya tugas yang jadwal/tanggalnya BENAR-BENAR BERADA DI MINGGU INI
    const thisWeekTasks = tasks.filter((t) => {
      const taskDate = getTaskDate(t)
      if (!taskDate) return false
      return taskDate.getTime() >= monday.getTime() && taskDate.getTime() <= sunday.getTime()
    })

    const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

    return daysOrder.map((dayName, idx) => {
      const targetDate = new Date(monday)
      targetDate.setDate(monday.getDate() + idx)

      const isToday = isSameDay(targetDate, now)
      const isFuture = targetDate.getTime() > now.getTime() && !isToday
      const dateFormatted = `${targetDate.getDate()} ${MONTH_SHORT_ID[targetDate.getMonth()]}`


      let selesai = 0
      let dalamProses = 0
      let tertunda = 0

      thisWeekTasks.forEach((t) => {
        const taskDate = getTaskDate(t)
        if (!taskDate || !isSameDay(taskDate, targetDate)) return

        if (t.status === "done") {
          selesai++
        } else if (t.status === "in_progress" || t.status === "todo") {
          dalamProses++
        } else if (t.status === "review" || t.status === "unassigned") {
          tertunda++
        }
      })

      return {
        label: dayName,
        dateFormatted,
        selesai,
        dalamProses,
        tertunda,
        total: selesai + dalamProses + tertunda,
        isFuture,
      }
    })
  }

  if (view === "bulanan") {
    // 4 Blok Minggu dalam Bulan Berjalan
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const weeks = [
      { label: "Minggu 1", start: 1, end: 7 },
      { label: "Minggu 2", start: 8, end: 14 },
      { label: "Minggu 3", start: 15, end: 21 },
      { label: "Minggu 4", start: 22, end: lastDayOfMonth },
    ]

    const todayDateNum = now.getDate()

    // FILTER KETAT: Hanya tugas yang jadwal/tanggalnya BENAR-BENAR BERADA DI BULAN INI
    const thisMonthTasks = tasks.filter((t) => {
      const taskDate = getTaskDate(t)
      if (!taskDate) return false
      return taskDate.getFullYear() === currentYear && taskDate.getMonth() === currentMonth
    })

    return weeks.map((w) => {
      const isFuture = w.start > todayDateNum
      const dateFormatted = `${w.start}-${w.end} ${MONTH_SHORT_ID[currentMonth]}`


      let selesai = 0
      let dalamProses = 0
      let tertunda = 0

      thisMonthTasks.forEach((t) => {
        const taskDate = getTaskDate(t)
        if (!taskDate) return
        const dayNum = taskDate.getDate()
        if (dayNum >= w.start && dayNum <= w.end) {
          if (t.status === "done") selesai++
          else if (t.status === "in_progress" || t.status === "todo") dalamProses++
          else if (t.status === "review" || t.status === "unassigned") tertunda++
        }
      })

      return {
        label: w.label,
        dateFormatted,
        selesai,
        dalamProses,
        tertunda,
        total: selesai + dalamProses + tertunda,
        isFuture,
      }
    })
  }

  if (view === "tahunan") {
    // 12 Bulan Penuh dalam Tahun Berjalan
    // FILTER KETAT: Hanya tugas yang jadwal/tanggalnya BENAR-BENAR BERADA DI TAHUN INI
    const thisYearTasks = tasks.filter((t) => {
      const taskDate = getTaskDate(t)
      if (!taskDate) return false
      return taskDate.getFullYear() === currentYear
    })

    return MONTH_SHORT_ID.map((mShort, mIdx) => {
      const isFuture = mIdx > currentMonth
      const dateFormatted = `${MONTH_NAMES_ID[mIdx]} ${currentYear}`


      let selesai = 0
      let dalamProses = 0
      let tertunda = 0

      thisYearTasks.forEach((t) => {
        const taskDate = getTaskDate(t)
        if (!taskDate) return
        if (taskDate.getMonth() === mIdx) {
          if (t.status === "done") selesai++
          else if (t.status === "in_progress" || t.status === "todo") dalamProses++
          else if (t.status === "review" || t.status === "unassigned") tertunda++
        }
      })

      return {
        label: mShort,
        dateFormatted,
        selesai,
        dalamProses,
        tertunda,
        total: selesai + dalamProses + tertunda,
        isFuture,
      }
    })
  }

  return []
}

const chartConfig = {
  selesai: {
    label: "Task Selesai",
    color: "#dc2626", // Telkom Red
  },
  dalamProses: {
    label: "Dalam Proses",
    color: "#f87171", // Rose
  },
  tertunda: {
    label: "Review / Tertunda",
    color: "#fca5a5", // Soft Rose
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ initialTasks }: { initialTasks?: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks || [])
  const [timeView, setTimeView] = React.useState<TimeView>("mingguan")

  React.useEffect(() => {
    if (!initialTasks || initialTasks.length === 0) {
      getTasks().then(setTasks).catch(console.error)
    } else {
      setTasks(initialTasks)
    }
  }, [initialTasks])

  const chartData = React.useMemo(() => {
    return getRealChartData(timeView, tasks)
  }, [tasks, timeView])

  // Summary counts for currently selected timeView
  const totals = React.useMemo(() => {
    const totalSelesai = chartData.reduce((acc, c) => acc + c.selesai, 0)
    const totalProses = chartData.reduce((acc, c) => acc + c.dalamProses, 0)
    const totalTertunda = chartData.reduce((acc, c) => acc + c.tertunda, 0)
    return { totalSelesai, totalProses, totalTertunda }
  }, [chartData])

  const currentWeekDateRange = React.useMemo(() => {
    const now = new Date()
    const currentDay = now.getDay()
    const diffToMonday = (currentDay + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - diffToMonday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return `${monday.getDate()} ${MONTH_SHORT_ID[monday.getMonth()]} – ${sunday.getDate()} ${MONTH_SHORT_ID[sunday.getMonth()]} ${sunday.getFullYear()}`
  }, [])

  const viewDescriptions: Record<TimeView, string> = {
    mingguan: "Progres harian tugas kantor (Senin – Minggu)",
    bulanan: "Progres mingguan tugas kantor (Minggu 1 – Minggu 4)",
    tahunan: "Rekapitulasi performa tugas kantor (Januari – Desember)",
  }

  // Max value to determine YAxis domain
  const maxVal = Math.max(...chartData.map((d) => d.selesai + d.dalamProses + d.tertunda), 4)
  const isEmpty = totals.totalSelesai + totals.totalProses + totals.totalTertunda === 0
  const emptyHints: Record<TimeView, string> = {
    mingguan: "Tidak ada tugas pada minggu ini.",
    bulanan: "Tidak ada tugas pada bulan ini.",
    tahunan: "Tidak ada tugas pada tahun ini.",
  }

  return (
    <Card className="rounded-[8px] border-border bg-card shadow-xs pt-0">
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 py-5 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base font-bold text-foreground">
            Tren Penyelesaian Task
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {viewDescriptions[timeView]}
          </CardDescription>
        </div>

        {/* Segmented Control for Time Range Selection */}
        <div className="flex items-center gap-1 rounded-[8px] border bg-muted p-1 text-muted-foreground self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeView("mingguan")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              timeView === "mingguan"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            Mingguan
          </button>
          <button
            type="button"
            onClick={() => setTimeView("bulanan")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              timeView === "bulanan"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            Bulanan
          </button>
          <button
            type="button"
            onClick={() => setTimeView("tahunan")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              timeView === "tahunan"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            Tahunan
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        <div className="relative">
        {isEmpty && (
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8 z-10 flex flex-col items-center justify-center gap-2 text-center">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="relative flex size-11 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/60">
                <ActivityIcon className="size-5" />
              </div>
            </div>
            <p className="text-sm font-bold text-foreground">Belum ada aktivitas</p>
            <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
              {emptyHints[timeView]} Grafik akan terisi otomatis saat ada tugas yang dijadwalkan.
            </p>
          </div>
        )}
        <ChartContainer
          config={chartConfig}
          className={cn("aspect-auto h-[260px] w-full", isEmpty && "opacity-60")}
        >
          <AreaChart data={chartData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.75} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="fillDalamProses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillTertunda" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs font-semibold"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              allowDecimals={false}
              domain={[0, maxVal]}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              cursor={{ stroke: "#dc2626", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                const dataPoint = payload[0]?.payload
                return (
                  <div className="rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs space-y-1.5 min-w-36">
                    <div className="border-b border-border pb-1">
                      <p className="font-bold text-foreground">{dataPoint.label}</p>
                      <p className="text-[10px] text-muted-foreground">{dataPoint.dateFormatted}</p>
                    </div>
                    {dataPoint.isFuture && dataPoint.total === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic">
                        Belum ada aktivitas (Periode mendatang)
                      </p>
                    ) : (
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between gap-3 text-red-600 dark:text-red-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-[#dc2626]" />
                            Task Selesai:
                          </span>
                          <strong>{dataPoint.selesai}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-rose-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-[#f87171]" />
                            Dalam Proses:
                          </span>
                          <strong>{dataPoint.dalamProses}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-amber-600 dark:text-amber-400 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-[#fca5a5]" />
                            Review / Tertunda:
                          </span>
                          <strong>{dataPoint.tertunda}</strong>
                        </div>
                        <div className="border-t border-border pt-1 flex items-center justify-between font-bold text-foreground">
                          <span>Total:</span>
                          <span>{dataPoint.total} task</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }}
            />
            <Area
              dataKey="tertunda"
              type="monotone"
              fill="url(#fillTertunda)"
              stroke="#fca5a5"
              strokeWidth={1.5}
              stackId="a"
            />
            <Area
              dataKey="dalamProses"
              type="monotone"
              fill="url(#fillDalamProses)"
              stroke="#f87171"
              strokeWidth={1.5}
              stackId="a"
            />
            <Area
              dataKey="selesai"
              type="monotone"
              fill="url(#fillSelesai)"
              stroke="#dc2626"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
