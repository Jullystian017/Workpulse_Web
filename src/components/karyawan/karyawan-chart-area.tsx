"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

export const description = "Tren Jam Kerja & Penyelesaian Task Karyawan"

// Generate 90 days data for employee's daily work hours & completed tasks
function generateEmployeeData() {
  const data = []
  const ref = new Date("2026-08-24")
  for (let i = 89; i >= 0; i--) {
    const d = new Date(ref)
    d.setDate(d.getDate() - i)
    const dayOfWeek = d.getDay() // 0 = Sunday, 6 = Saturday

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const jamKerja = isWeekend ? 0 : Number((7.5 + Math.sin(i / 3) * 1.2 + (i % 3) * 0.2).toFixed(1))
    const taskSelesai = isWeekend ? 0 : Math.max(1, Math.floor(3 + Math.cos(i / 4) * 2 + (i % 2)))

    data.push({
      date: d.toISOString().split("T")[0],
      jamKerja,
      taskSelesai,
    })
  }
  return data
}

const chartData = generateEmployeeData()

const chartConfig = {
  jamKerja: {
    label: "Jam Kerja (Jam)",
    color: "var(--primary)", // Bold Telkom Red
  },
  taskSelesai: {
    label: "Task Selesai (Item)",
    color: "oklch(0.72 0.16 25)", // Soft Rose Red
  },
} satisfies ChartConfig

export function KaryawanChartArea() {
  const [timeRange, setTimeRange] = React.useState("7d")

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2026-08-24")
    let daysToSubtract = 7
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "90d") {
      daysToSubtract = 90
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [timeRange])

  return (
    <Card className="pt-0 h-full flex flex-col">
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 py-5 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle>Tren Jam Kerja & Output Task</CardTitle>
          <CardDescription>
            Rasio jam operasional harian vs jumlah tugas selesai per periode
          </CardDescription>
        </div>

        {/* Custom Segmented Control (Pill) for Time Range Selection */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1 text-muted-foreground self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeRange("7d")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              timeRange === "7d"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              timeRange === "30d"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("90d")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              timeRange === "90d"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            3 Bulan
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4 flex-1 flex flex-col justify-end">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillJamKerja" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-jamKerja)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-jamKerja)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTaskSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-taskSelesai)"
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-taskSelesai)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("id-ID", {
                  weekday: timeRange === "7d" ? "short" : undefined,
                  month: timeRange !== "7d" ? "short" : undefined,
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="taskSelesai"
              type="natural"
              fill="url(#fillTaskSelesai)"
              stroke="var(--color-taskSelesai)"
              strokeWidth={2}
            />
            <Area
              dataKey="jamKerja"
              type="natural"
              fill="url(#fillJamKerja)"
              stroke="var(--color-jamKerja)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>

        {/* Bottom indicator legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 pb-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[var(--primary)]" />
            <span className="font-medium text-muted-foreground">Jam Kerja Aktual (Rata-rata: 8.1 Jam/hari)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[oklch(0.72_0.16_25)]" />
            <span className="font-medium text-muted-foreground">Task Selesai Harian</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
