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

export const description = "Tren Penyelesaian Task Karyawan"

// Generate 90 days of task completion data
function generateData() {
  const data = []
  const ref = new Date("2026-08-11")
  for (let i = 89; i >= 0; i--) {
    const d = new Date(ref)
    d.setDate(d.getDate() - i)

    // Simulate realistic task completion waves
    const selesai = 100 + Math.floor(Math.sin(i / 4) * 40) + (i % 7) * 3
    const dalamProses = 35 + Math.floor(Math.cos(i / 5) * 15) + (i % 5) * 2
    const tertunda = 10 + Math.floor(Math.sin(i / 7) * 5) + (i % 4)

    data.push({
      date: d.toISOString().split("T")[0],
      selesai,
      dalamProses,
      tertunda,
    })
  }
  return data
}

const chartData = generateData()

const chartConfig = {
  selesai: {
    label: "Task Selesai",
    color: "var(--primary)", // Bold Telkom Red
  },
  dalamProses: {
    label: "Dalam Proses",
    color: "oklch(0.8 0.12 25)", // Light Rose
  },
  tertunda: {
    label: "Tertunda / Pending",
    color: "oklch(0.94 0.03 25)", // Very Pale Pinkish White
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2026-08-11")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [timeRange])

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 py-5 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle>Tren Penyelesaian Task</CardTitle>
          <CardDescription>
            Progres task karyawan — Selesai, Dalam Proses & Tertunda
          </CardDescription>
        </div>

        {/* Custom Segmented Control (Pill) for Time Range Selection */}
        <div className="flex items-center gap-1 rounded-[8px] border bg-muted p-1 text-muted-foreground self-end sm:self-auto">
          <button
            onClick={() => setTimeRange("90d")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              timeRange === "90d"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            3 Bulan
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              timeRange === "30d"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            30 Hari
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              timeRange === "7d"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            7 Hari
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-selesai)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-selesai)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDalamProses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-dalamProses)"
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-dalamProses)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillTertunda" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tertunda)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tertunda)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("id-ID", {
                  month: "short",
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
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="tertunda"
              type="natural"
              fill="url(#fillTertunda)"
              stroke="var(--color-tertunda)"
              stackId="a"
            />
            <Area
              dataKey="dalamProses"
              type="natural"
              fill="url(#fillDalamProses)"
              stroke="var(--color-dalamProses)"
              stackId="a"
            />
            <Area
              dataKey="selesai"
              type="natural"
              fill="url(#fillSelesai)"
              stroke="var(--color-selesai)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
