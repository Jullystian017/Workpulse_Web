"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ShiftDay {
  day: string
  date: string
  shift: string
  hours: string
  location: string
  status: "active_today" | "upcoming" | "off"
}

const weeklyShifts: ShiftDay[] = [
  {
    day: "SEN",
    date: "24/08",
    shift: "Shift Pagi",
    hours: "08:00 - 17:00",
    location: "STO Gambir (Sentral)",
    status: "active_today",
  },
  {
    day: "SEL",
    date: "25/08",
    shift: "Shift Pagi",
    hours: "08:00 - 17:00",
    location: "STO Gambir (Sentral)",
    status: "upcoming",
  },
  {
    day: "RAB",
    date: "26/08",
    shift: "Penugasan Lapangan",
    hours: "08:30 - 17:30",
    location: "Sub-Unit Bekasi Timur",
    status: "upcoming",
  },
  {
    day: "KAM",
    date: "27/08",
    shift: "Shift Pagi",
    hours: "08:00 - 17:00",
    location: "STO Gambir (Sentral)",
    status: "upcoming",
  },
  {
    day: "JUM",
    date: "28/08",
    shift: "Shift Pagi",
    hours: "08:00 - 16:30",
    location: "STO Gambir (Sentral)",
    status: "upcoming",
  },
  {
    day: "SAB",
    date: "29/08",
    shift: "Libur Mingguan",
    hours: "Off Duty",
    location: "Rumah / Day Off",
    status: "off",
  },
  {
    day: "MIN",
    date: "30/08",
    shift: "Libur Mingguan",
    hours: "Off Duty",
    location: "Rumah / Day Off",
    status: "off",
  },
]

export function KaryawanShiftStrip() {
  return (
    <div className="rounded-[8px] border border-border bg-card shadow-xs overflow-hidden h-full flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-[8px] bg-red-50 dark:bg-red-950/60 flex items-center justify-center">
              <CalendarDaysIcon className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-sm font-bold text-foreground">
              Jadwal Shift Kerja Minggu Ini
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Periode 24 - 30 Agustus 2026 &bull; Witel Jakarta Pusat
          </p>
        </div>

        <Link href="/karyawan/cuti">
          <Button variant="outline" size="sm" className="h-7.5 px-3 text-[11px] font-semibold rounded-[8px] cursor-pointer">
            <span>Tukar Shift / Izin</span>
            <ChevronRightIcon className="size-3 ml-0.5" />
          </Button>
        </Link>
      </div>

      {/* 7 Days Strip Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {weeklyShifts.map((s) => {
          const isToday = s.status === "active_today"
          const isOff = s.status === "off"

          return (
            <div
              key={s.date}
              className={`relative rounded-[8px] p-3 border transition-all duration-200 flex flex-col justify-between min-h-[110px] ${
                isToday
                  ? "bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-800 shadow-xs ring-1 ring-red-500/20"
                  : isOff
                  ? "bg-muted/30 border-border/60 opacity-80"
                  : "bg-background border-border hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {/* Day & Date Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isToday ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                  }`}>
                    {s.day}
                  </span>
                  <p className="text-xs font-bold text-foreground">{s.date}</p>
                </div>

                {isToday && (
                  <span className="size-2 rounded-full bg-red-600 animate-pulse" title="Hari Ini" />
                )}
              </div>

              {/* Shift info */}
              <div className="space-y-1 my-2">
                <p className={`text-[11px] font-bold leading-tight ${
                  isToday
                    ? "text-red-700 dark:text-red-300"
                    : isOff
                    ? "text-muted-foreground"
                    : "text-foreground"
                }`}>
                  {s.shift}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <ClockIcon className="size-2.5 shrink-0" />
                  <span className="truncate">{s.hours}</span>
                </div>
              </div>

              {/* Location Badge */}
              <div className="pt-1 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <MapPinIcon className="size-2.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{s.location}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-red-600" />
            <strong className="text-foreground">5 Hari</strong> Kerja Aktif (40 Jam)
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-zinc-400" />
            <strong className="text-foreground">2 Hari</strong> Libur
          </span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <ShieldCheckIcon className="size-3.5" /> Jadwal Terverifikasi Atasan
        </span>
      </div>
    </div>
  )
}
