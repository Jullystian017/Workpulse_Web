"use client"

import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

const dateRanges = [
  { label: "Jun 01 – Jun 29, 2026", value: "jun" },
  { label: "Jul 01 – Jul 31, 2026", value: "jul" },
  { label: "Ags 01 – Ags 12, 2026", value: "aug" },
  { label: "7 Hari Terakhir", value: "7d" },
  { label: "30 Hari Terakhir", value: "30d" },
]

export function DashboardWelcome() {
  const [selected, setSelected] = React.useState("aug")
  const [open, setOpen] = React.useState(false)
  const current = dateRanges.find(r => r.value === selected) ?? dateRanges[2]

  return (
    <div className="flex flex-col gap-3 px-4 pt-2 sm:flex-row sm:items-start sm:justify-between lg:px-6">
      {/* Left: Welcome message */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Selamat Datang, Budi Admin!
        </h2>
        <p className="text-sm text-muted-foreground">
          Terdapat <span className="font-semibold text-red-600">3 task overdue</span>, 9 task dalam proses, dan 124 task selesai hari ini.
        </p>
      </div>

      {/* Right: Date Range Selector */}
      <div className="relative shrink-0">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span>{current.label}</span>
          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-20 mt-1.5 w-52 rounded-xl border border-border bg-card shadow-lg py-1">
            {dateRanges.map(r => (
              <button
                key={r.value}
                onClick={() => { setSelected(r.value); setOpen(false) }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${r.value === selected ? "font-semibold text-red-600" : "text-foreground"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
