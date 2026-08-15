"use client"

import * as React from "react"
import { AlertCircleIcon, ClockIcon, ArrowRightIcon, CheckCircle2Icon, PauseCircleIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const urgentTasks = [
  {
    id: "TSK-006",
    judulTask: "Audit Jaringan Area Depok",
    assignee: "Qomar Siddiq",
    departemen: "IT",
    deadline: "2026-08-11",
    status: "Tertunda",
    prioritas: "Tinggi",
    daysOverdue: 1,
  },
  {
    id: "TSK-015",
    judulTask: "Koordinasi Tim Lapangan Proyek X",
    assignee: "Rudi Hermawan",
    departemen: "HR",
    deadline: "2026-08-11",
    status: "Tertunda",
    prioritas: "Sedang",
    daysOverdue: 1,
  },
  {
    id: "TSK-003",
    judulTask: "Perbaikan Splitter Node Cilandak",
    assignee: "Irfan Maulana",
    departemen: "IT",
    deadline: "2026-08-13",
    status: "Dalam Proses",
    prioritas: "Tinggi",
    daysOverdue: 0,
  },
  {
    id: "TSK-016",
    judulTask: "Penyusunan Anggaran Operasional Q3",
    assignee: "Fajar Nugroho",
    departemen: "Finance",
    deadline: "2026-08-13",
    status: "Dalam Proses",
    prioritas: "Tinggi",
    daysOverdue: 0,
  },
  {
    id: "TSK-011",
    judulTask: "Survey Lokasi Pemasangan Baru Blok F",
    assignee: "Bambang Susanto",
    departemen: "Operations",
    deadline: "2026-08-16",
    status: "Tertunda",
    prioritas: "Sedang",
    daysOverdue: 0,
  },
]

const statusConfig: Record<string, { icon: React.ReactNode; className: string }> = {
  "Tertunda": {
    icon: <PauseCircleIcon className="size-3" />,
    className: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400",
  },
  "Dalam Proses": {
    icon: <ClockIcon className="size-3" />,
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
  },
  "Selesai": {
    icon: <CheckCircle2Icon className="size-3" />,
    className: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400",
  },
}

const prioritasConfig: Record<string, string> = {
  "Tinggi": "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
  "Sedang": "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
  "Rendah": "border-gray-200 bg-gray-50 text-gray-600",
}

export function UrgentTasksTable() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircleIcon className="size-4 text-red-600" />
            Task Mendesak & Overdue
          </CardTitle>
          <CardDescription className="mt-0.5">
            Task prioritas tinggi & melewati deadline
          </CardDescription>
        </div>
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-primary gap-1"
          render={<a href="/dashboard/tasks" />}
        >
          Lihat Semua
          <ArrowRightIcon className="size-3" />
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        <div className="divide-y">
          {urgentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
            >
              {/* Left: Task Info */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {task.daysOverdue > 0 && (
                    <AlertCircleIcon className="size-3 shrink-0 text-red-500" />
                  )}
                  <span className="text-sm font-medium truncate">{task.judulTask}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{task.assignee}</span>
                  <span>·</span>
                  <span className={`font-medium ${task.daysOverdue > 0 ? "text-red-600" : ""}`}>
                    {task.daysOverdue > 0
                      ? `Overdue ${task.daysOverdue} hari`
                      : `Deadline ${new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`}
                  </span>
                </div>
              </div>

              {/* Right: Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`px-1.5 text-[10px] hidden sm:flex ${prioritasConfig[task.prioritas]}`}>
                  {task.prioritas}
                </Badge>
                <Badge variant="outline" className={`flex items-center gap-1 px-1.5 text-[10px] ${statusConfig[task.status].className}`}>
                  {statusConfig[task.status].icon}
                  {task.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
