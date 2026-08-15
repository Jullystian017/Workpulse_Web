"use client"

import * as React from "react"
import {
  PlusIcon,
  MoreHorizontalIcon,
  ClockIcon,
  PaperclipIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TaskItem } from "./task-detail-sheet"

interface KanbanViewProps {
  tasks: TaskItem[]
  onSelectTask: (task: TaskItem) => void
  onUpdateStatus?: (taskId: string, newStatus: string) => void
}

const columns = [
  { id: "Tertunda", label: "Tertunda / Pending", color: "bg-orange-500" },
  { id: "Dalam Proses", label: "Dalam Proses", color: "bg-blue-500" },
  { id: "Selesai", label: "Selesai / Done", color: "bg-emerald-500" },
]

const prioritasColor: Record<string, string> = {
  Tinggi: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200",
  Sedang: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400 border-yellow-200",
  Rendah: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200",
}

export function KanbanView({ tasks, onSelectTask }: KanbanViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-4 lg:px-6 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        return (
          <div
            key={col.id}
            className="flex flex-col gap-3 rounded-2xl border bg-muted/40 p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className={`size-2.5 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold text-foreground">
                  {col.label}
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:bg-background"
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>

            {/* Task Cards Stack */}
            <div className="flex flex-col gap-3">
              {colTasks.map((task) => {
                const isOverdue =
                  task.status !== "Selesai" &&
                  new Date(task.deadline) < new Date("2026-08-12")

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group relative flex flex-col gap-2.5 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        >
                          {task.departemen}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 font-medium ${
                            prioritasColor[task.prioritas] || ""
                          }`}
                        >
                          {task.prioritas}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {task.id}
                      </span>
                    </div>

                    {/* Task Title */}
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {task.judulTask}
                    </h4>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            task.status === "Selesai"
                              ? "bg-emerald-500"
                              : "bg-primary"
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {task.progress}%
                      </span>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="size-5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold text-[10px] flex items-center justify-center uppercase">
                          {task.assignee.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-foreground truncate max-w-[90px]">
                          {task.assignee}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.bukti && (
                          <PaperclipIcon className="size-3.5 text-emerald-600" />
                        )}
                        <div
                          className={`flex items-center gap-1 text-[11px] ${
                            isOverdue
                              ? "text-red-600 font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          <ClockIcon className="size-3" />
                          <span>
                            {new Date(task.deadline).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {colTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  <span className="text-xs">Tidak ada task</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
