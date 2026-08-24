"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

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

const chartData = [
  { status: "selesai", count: 24, fill: "var(--color-selesai)" },
  { status: "proses", count: 3, fill: "var(--color-proses)" },
  { status: "review", count: 1, fill: "var(--color-review)" },
]

const chartConfig = {
  count: {
    label: "Task",
  },
  selesai: {
    label: "Selesai",
    color: "var(--primary)", // Bold Telkom Red
  },
  proses: {
    label: "Dalam Proses",
    color: "oklch(0.72 0.16 25)", // Medium Rose Red
  },
  review: {
    label: "Review Atasan",
    color: "oklch(0.9 0.05 25)", // Soft Pale Pinkish White
  },
} satisfies ChartConfig

export function KaryawanChartDonut() {
  const totalTasks = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle>Distribusi Status Tugas</CardTitle>
        <CardDescription>Rangkuman 28 tugas saya bulan Agustus 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex flex-col justify-between">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          85.7%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs font-medium"
                        >
                          Tugas Selesai
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Task Status Legend Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[var(--primary)]" />
            <span className="font-medium text-foreground">Selesai (24)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[oklch(0.72_0.16_25)]" />
            <span className="font-medium text-foreground">Dalam Proses (3)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[oklch(0.9_0.05_25)]" />
            <span className="font-medium text-foreground">Review (1)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
