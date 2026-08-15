"use client"

import * as React from "react"
import { CalendarIcon, ClockIcon, AlertCircleIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TaskItem } from "./task-detail-sheet"

interface TimelineViewProps {
  tasks: TaskItem[]
  onSelectTask: (task: TaskItem) => void
}

const dates = [
  { dayNum: 11, dayName: "Sel", fullDate: "2026-08-11" },
  { dayNum: 12, dayName: "Rab", fullDate: "2026-08-12", isToday: true },
  { dayNum: 13, dayName: "Kam", fullDate: "2026-08-13" },
  { dayNum: 14, dayName: "Jum", fullDate: "2026-08-14" },
  { dayNum: 15, dayName: "Sab", fullDate: "2026-08-15" },
  { dayNum: 16, dayName: "Ming", fullDate: "2026-08-16" },
  { dayNum: 17, dayName: "Sen", fullDate: "2026-08-17" },
  { dayNum: 18, dayName: "Sel", fullDate: "2026-08-18" },
  { dayNum: 19, dayName: "Rab", fullDate: "2026-08-19" },
  { dayNum: 20, dayName: "Kam", fullDate: "2026-08-20" },
]

export function TimelineView({ tasks, onSelectTask }: TimelineViewProps) {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        {/* Timeline Header Row (Dates) */}
        <div className="grid grid-cols-12 min-w-[900px] border-b bg-muted/50 text-xs font-semibold">
          <div className="col-span-3 p-4 border-r flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <span>Task & Assignee</span>
          </div>
          <div className="col-span-9 grid grid-cols-10">
            {dates.map((d) => (
              <div
                key={d.fullDate}
                className={`p-3 text-center border-r last:border-r-0 flex flex-col items-center justify-center ${
                  d.isToday
                    ? "bg-primary/10 text-primary font-bold border-b-2 border-b-primary"
                    : "text-muted-foreground"
                }`}
              >
                <span className="text-base leading-none font-bold">{d.dayNum}</span>
                <span className="text-[10px] uppercase font-medium mt-0.5">{d.dayName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="divide-y min-w-[900px]">
          {tasks.map((task) => {
            const taskDeadlineDate = task.deadline
            const targetIdx = dates.findIndex((d) => d.fullDate === taskDeadlineDate)
            const colIndex = targetIdx !== -1 ? targetIdx : 1 // default column

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="grid grid-cols-12 items-center hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                {/* Left Column: Task Name & Person */}
                <div className="col-span-3 p-3.5 border-r flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary truncate">
                      {task.judulTask}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{task.assignee}</span>
                    <span>·</span>
                    <Badge variant="outline" className="px-1 py-0 text-[9px] bg-red-50 text-red-700">
                      {task.departemen}
                    </Badge>
                  </div>
                </div>

                {/* Right 10 Columns: Timeline Bar Grid */}
                <div className="col-span-9 grid grid-cols-10 h-full items-center px-1 relative">
                  {/* Grid column line backgrounds */}
                  <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                    {dates.map((d) => (
                      <div
                        key={d.fullDate}
                        className={`border-r last:border-r-0 ${
                          d.isToday ? "bg-primary/5" : ""
                        }`}
                      />
                    ))}
                  </div>

                  {/* Task Timeline Bar Pill */}
                  <div
                    className="relative z-10 transition-all duration-200"
                    style={{
                      gridColumnStart: Math.max(1, colIndex),
                      gridColumnEnd: Math.min(11, colIndex + 3),
                    }}
                  >
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs shadow-sm border font-medium ${
                        task.status === "Selesai"
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : task.status === "Tertunda"
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-primary text-primary-foreground border-red-700"
                      }`}
                    >
                      <span className="truncate pr-2">{task.judulTask}</span>
                      <span className="text-[10px] shrink-0 font-bold bg-black/20 px-1.5 py-0.5 rounded">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
