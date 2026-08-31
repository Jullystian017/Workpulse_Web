"use client"

import * as React from "react"
import { SparklesIcon, CheckCircle2Icon, XCircleIcon, ClockIcon, ShieldCheckIcon, UserCheckIcon, ArrowRightIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const initialActivities = [
  {
    id: 1,
    name: "Andi Pratama",
    role: "Senior Dev",
    dept: "IT",
    time: "07:58 WIB",
    status: "Hadir",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    action: null,
  },
  {
    id: 2,
    name: "Dewi Lestari",
    role: "Mkt. Specialist",
    dept: "Marketing",
    time: "08:21 WIB",
    status: "Terlambat",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    action: null,
  },
  {
    id: 3,
    name: "Gani Fauzan",
    role: "Recruiter",
    dept: "HR",
    time: "08:30 WIB",
    status: "Pending Cuti",
    badgeColor: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800",
    action: "approval",
  },
  {
    id: 4,
    name: "Rudi Hermawan",
    role: "HR Manager",
    dept: "HR",
    time: "07:55 WIB",
    status: "Hadir",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    action: null,
  },
]

export function AiRecentActivity() {
  const [activities, setActivities] = React.useState(initialActivities)

  const handleApprove = (id: number, name: string) => {
    setActivities(prev =>
      prev.map(act =>
        act.id === id
          ? {
              ...act,
              status: "Disetujui",
              badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
              action: null,
            }
          : act
      )
    )
    toast.success(`Pengajuan cuti ${name} telah disetujui!`)
  }

  const handleReject = (id: number, name: string) => {
    setActivities(prev =>
      prev.map(act =>
        act.id === id
          ? {
              ...act,
              status: "Ditolak",
              badgeColor: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
              action: null,
            }
          : act
      )
    )
    toast.error(`Pengajuan cuti ${name} ditolak.`)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        {/* AI Header Pill */}
        <div className="flex items-center gap-2 rounded-[8px] border border-red-200/80 bg-red-50/50 p-2.5 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-primary text-primary-foreground shadow-xs">
            <SparklesIcon className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-primary">AI Smart Insights</span>
            <span className="text-[11px] text-muted-foreground">
              98% kehadiran IT tepat waktu minggu ini
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-4 flex-1">
        <div>
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">
              Aktivitas Presensi Terbaru
            </h4>
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          {/* Activity Stream */}
          <div className="flex flex-col gap-2.5">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-[8px] border bg-card/60 p-2.5 transition-all hover:bg-muted/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {act.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground leading-tight">
                      {act.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {act.dept} • {act.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${act.badgeColor}`}>
                    {act.status}
                  </Badge>

                  {/* Action buttons if approval pending */}
                  {act.action === "approval" && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        onClick={() => handleApprove(act.id, act.name)}
                        title="Setujui Cuti"
                      >
                        <CheckCircle2Icon className="size-4" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        onClick={() => handleReject(act.id, act.name)}
                        title="Tolak Cuti"
                      >
                        <XCircleIcon className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
