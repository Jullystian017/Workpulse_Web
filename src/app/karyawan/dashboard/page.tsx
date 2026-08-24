"use client"

import * as React from "react"
import { KaryawanWelcome } from "@/components/karyawan/karyawan-welcome"
import { KaryawanSectionCards } from "@/components/karyawan/karyawan-section-cards"
import { KaryawanAiInsight } from "@/components/karyawan/karyawan-ai-insight"
import { KaryawanTaskTable } from "@/components/karyawan/karyawan-task-table"

export default function KaryawanDashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-6 py-4 md:py-6">
        {/* Row 0: Personal Welcome Banner */}
        <KaryawanWelcome />

        {/* Row 1: 4 Unified Summary Cards (Placed at the top) */}
        <KaryawanSectionCards />

        {/* Row 2: AI WorkPulse Real-Time Insight Banner */}
        <KaryawanAiInsight />

        {/* Row 3: Full Shadcn UI Task Management Table */}
        <KaryawanTaskTable />
      </div>
    </div>
  )
}
