"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ChevronRightIcon,
  CalendarRangeIcon,
  SparklesIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function KaryawanQuickStatus() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Geofence Live Radar Card */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center">
              <ShieldCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Status Geofence GPS</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                is_within_radius = Valid (45m)
              </p>
            </div>
          </div>
          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="space-y-1.5 text-[11px] pt-1 border-t border-emerald-200/60 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Lokasi Sentral:</span>
            <span className="font-semibold text-foreground">STO Gambir Jakarta</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Radius Maksimal:</span>
            <span className="font-semibold text-foreground">200 meter</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Clock In Tercatat:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">07:58 WIB (Tepat Waktu)</span>
          </div>
        </div>
      </div>

      {/* 2. Status Tracking Pengajuan Terakhir */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CalendarRangeIcon className="size-3.5 text-red-600" />
              Status Pengajuan Terkini
            </p>
            <Link
              href="/karyawan/cuti"
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center"
            >
              Semua <ChevronRightIcon className="size-3" />
            </Link>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground">Cuti Tahunan (1 Hari)</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                Menunggu Review SPV
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Periode: 12 September 2026 &bull; Alasan: Acara Keluarga
            </p>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-muted-foreground flex items-center gap-1">
          <ClockIcon className="size-3 text-zinc-400" />
          <span>Biasanya disetujui dalam 1x24 jam kerja</span>
        </div>
      </div>
    </div>
  )
}
