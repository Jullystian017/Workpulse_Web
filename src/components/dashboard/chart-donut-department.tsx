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
  { status: "selesai", count: 124, fill: "var(--color-selesai)" },
  { status: "proses", count: 42, fill: "var(--color-proses)" },
  { status: "pending", count: 13, fill: "var(--color-pending)" },
]

const chartConfig = {
  count: {
    label: "Task",
  },
  selesai: {
    label: "Tugas Selesai",
    color: "var(--primary)", // Bold Telkom Red
  },
  proses: {
    label: "Dalam Proses",
    color: "oklch(0.72 0.16 25)", // Medium Rose Red
  },
  pending: {
    label: "Tertunda / Pending",
    color: "oklch(0.9 0.05 25)", // Soft Light Pinkish White
  },
} satisfies ChartConfig

export function ChartDonutDepartment() {
  const totalTasks = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle>Status Penugasan Lapangan</CardTitle>
        <CardDescription>Progres penyelesaian task teknisi hari ini</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
                          69.3%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs font-medium"
                        >
                          Task Selesai
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
            <span className="font-medium text-foreground">Selesai (124)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[oklch(0.72_0.16_25)]" />
            <span className="font-medium text-foreground">Proses (42)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[oklch(0.9_0.05_25)]" />
            <span className="font-medium text-foreground">Pending (13)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
