"use client"

import * as React from "react"
import {
  SparklesIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  AwardIcon,
  CheckCircle2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAiPanel } from "@/components/dashboard/ai-panel-context"

export function KaryawanAiInsight() {
  const aiPanel = useAiPanel()

  return (
    <div className="px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-red-200/80 dark:border-red-950/80 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-xs">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-red-500/10 blur-2xl dark:bg-red-500/20" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left section: Header & Badge */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                <SparklesIcon className="size-3.5 fill-white" />
                WorkPulse AI Assistant Insight
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Dianalisis otomatis dari aktivitas real-time Anda
              </span>
            </div>

            {/* 3 Insight Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Bullet 1: Score */}
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/80 p-2.5 backdrop-blur-xs">
                <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                  <AwardIcon className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">Skor Kinerja 94/100</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Masuk kategori <span className="font-semibold text-amber-600 dark:text-amber-400">Sangat Baik (Top 10%)</span> bulan ini.
                  </p>
                </div>
              </div>

              {/* Bullet 2: High Task Alert */}
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/80 p-2.5 backdrop-blur-xs">
                <div className="size-7 rounded-lg bg-red-50 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">Fokus Task Hari Ini</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Selesaikan <span className="font-semibold text-red-600 dark:text-red-400">#TASK-1029</span> sebelum 15:00 WIB untuk menjaga SLA.
                  </p>
                </div>
              </div>

              {/* Bullet 3: Attendance Streak */}
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/80 p-2.5 backdrop-blur-xs">
                <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                  <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">Disiplin Kerja 100%</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    18 hari berturut-turut hadir tepat waktu tanpa keterlambatan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right section: AI Panel CTA button */}
          <div className="flex items-center shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => aiPanel?.toggleAiPanel()}
              className="w-full sm:w-auto h-9 px-4 gap-1.5 rounded-xl text-xs font-bold border-red-200 dark:border-red-900 bg-background hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 cursor-pointer transition-all shadow-2xs"
            >
              <span>Konsultasi Kinerja AI</span>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
