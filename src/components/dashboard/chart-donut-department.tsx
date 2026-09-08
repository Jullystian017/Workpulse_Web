"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts"

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

const chartConfig = {
  count: {
    label: "Task",
  },
  selesai: {
    label: "Tugas Selesai",
    color: "#dc2626", // Bold Telkom Red
  },
  proses: {
    label: "Dalam Proses",
    color: "#f87171", // Medium Rose Red
  },
  pending: {
    label: "Tertunda / Pending",
    color: "#fecaca", // Soft Light Pinkish
  },
} satisfies ChartConfig

export function ChartDonutDepartment({ initialTasks }: { initialTasks?: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks || [])

  React.useEffect(() => {
    if (!initialTasks || initialTasks.length === 0) {
      getTasks().then(setTasks).catch(console.error)
    } else {
      setTasks(initialTasks)
    }
  }, [initialTasks])

  const { chartData, completionRate, doneCount, inProgCount, pendingCount } = React.useMemo(() => {
    const done = tasks.filter((t) => t.status === "done").length
    const inProg = tasks.filter((t) => t.status === "in_progress" || t.status === "todo").length
    const pending = tasks.filter((t) => t.status === "review" || t.status === "unassigned").length
    const total = tasks.length || (done + inProg + pending) || 1

    const data = [
      { status: "selesai", name: "Selesai", count: done || 2, color: "#dc2626" },
      { status: "proses", name: "Dalam Proses", count: inProg || 3, color: "#f87171" },
      { status: "pending", name: "Tertunda", count: pending || 2, color: "#fecaca" },
    ]

    const rate = Math.round((done / total) * 100)
    return {
      chartData: data,
      completionRate: rate,
      doneCount: done,
      inProgCount: inProg,
      pendingCount: pending,
    }
  }, [tasks])

  return (
    <Card className="flex flex-col h-full rounded-[8px] border-border bg-card shadow-xs">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-base font-bold text-foreground">
          Status Penugasan Kantor
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Progres penyelesaian task karyawan hari ini
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-2 flex flex-col justify-between items-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
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
                          y={(viewBox.cy || 0) - 2}
                          className="fill-foreground text-3xl font-extrabold tabular-nums"
                        >
                          {completionRate}%
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
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-3 text-xs w-full">
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[#dc2626]" />
            <span className="font-medium text-foreground">Selesai ({doneCount})</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[#f87171]" />
            <span className="font-medium text-foreground">Proses ({inProgCount})</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5">
            <span className="size-2 rounded-full bg-[#fecaca] border border-red-300" />
            <span className="font-medium text-foreground">Pending ({pendingCount})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
