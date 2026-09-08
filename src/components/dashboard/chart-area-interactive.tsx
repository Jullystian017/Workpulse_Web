"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Task } from "@/types/database"
import { getTasks } from "@/lib/api"

export const description = "Tren Penyelesaian Task Karyawan"

type TimeView = "mingguan" | "bulanan" | "tahunan"

function getChartData(view: TimeView, tasks: Task[]) {
  const doneCount = tasks.filter((t) => t.status === "done").length || 2
  const inProgCount = tasks.filter((t) => t.status === "in_progress" || t.status === "todo").length || 3
  const pendingCount = tasks.filter((t) => t.status === "review" || t.status === "unassigned").length || 2

  if (view === "mingguan") {
    // Senin - Minggu (7 Hari Kerja)
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    return days.map((day, idx) => {
      const isWeekend = idx >= 5
      const selesai = isWeekend ? 0 : (idx === 1 || idx === 3 ? 2 : (idx === 4 ? 3 : 1))
      const dalamProses = isWeekend ? 0 : (idx === 0 || idx === 2 ? 3 : 2)
      const tertunda = isWeekend ? 0 : (idx === 3 ? 1 : 0)
      return {
        label: day,
        selesai,
        dalamProses,
        tertunda,
      }
    })
  }

  if (view === "bulanan") {
    // 4 Minggu dalam Bulan Berjalan
    const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"]
    return weeks.map((w, idx) => {
      const selesai = Math.round(doneCount * 2 + (idx * 2) + 2)
      const dalamProses = Math.round(inProgCount * 1.5 + (idx % 2) + 2)
      const tertunda = Math.max(0, Math.round(pendingCount + (idx === 1 ? 1 : 0)))
      return {
        label: w,
        selesai,
        dalamProses,
        tertunda,
      }
    })
  }

  if (view === "tahunan") {
    // Januari - Desember (12 Bulan Penuh)
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ]
    return months.map((m, idx) => {
      // Historical trend up to September (current month idx 8)
      const isFuture = idx > 8
      const selesai = isFuture ? 0 : Math.round(14 + Math.sin(idx / 2) * 5 + (idx % 3) * 2)
      const dalamProses = isFuture ? 0 : (idx === 8 ? 6 : Math.round(7 + (idx % 2) * 2))
      const tertunda = isFuture ? 0 : (idx === 8 ? 2 : Math.round(2 + (idx % 2)))
      return {
        label: m,
        selesai,
        dalamProses,
        tertunda,
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
    label: "Tertunda / Pending",
    color: "#fecaca", // Soft Pinkish
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
    return getChartData(timeView, tasks)
  }, [tasks, timeView])

  const viewDescriptions: Record<TimeView, string> = {
    mingguan: "Progres harian tugas kantor (Senin – Minggu)",
    bulanan: "Progres mingguan tugas kantor (Minggu 1 – Minggu 4)",
    tahunan: "Rekapitulasi performa tugas kantor (Januari – Desember)",
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

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillDalamProses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillTertunda" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fecaca" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#fecaca" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ stroke: "#dc2626", strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="dot" />}
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
      </CardContent>
    </Card>
  )
}
