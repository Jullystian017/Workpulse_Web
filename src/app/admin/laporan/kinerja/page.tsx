"use client"

import * as React from "react"
import {
  FileBarChartIcon,
  DownloadIcon,
  PrinterIcon,
  FileSpreadsheetIcon,
  SearchIcon,
  CheckCircle2Icon,
  ClockIcon,
  StarIcon,
  TrendingUpIcon,
  FilterIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getEmployeePerformanceReport,
  EmployeePerformanceReport,
} from "@/lib/api"
import { ROLE_LABELS } from "@/types/database"

export default function LaporanKinerjaPage() {
  const [data, setData] = React.useState<EmployeePerformanceReport[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState("Semua")

  const loadReportData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getEmployeePerformanceReport()
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadReportData()
  }, [loadReportData])

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.nik.includes(searchQuery) ||
        (item.user.position_title && item.user.position_title.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchRole = selectedRole === "Semua" || item.user.role === selectedRole
      return matchSearch && matchRole
    })
  }, [data, searchQuery, selectedRole])

  // Summary Metrics
  const totalTasks = data.reduce((acc, curr) => acc + curr.totalAssigned, 0)
  const totalDone = data.reduce((acc, curr) => acc + curr.completed, 0)
  const totalReview = data.reduce((acc, curr) => acc + curr.reviewPending, 0)
  const avgSla = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.onTimeRate, 0) / data.length) : 96

  // Functional CSV Export
  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diekspor")
      return
    }

    const headers = [
      "NIK",
      "Nama Karyawan",
      "Tingkat Jabatan",
      "Posisi",
      "Total Tugas",
      "Selesai",
      "Proses",
      "Review",
      "Tepat Waktu (%)",
      "Skor Nilai",
      "Rating Bintang",
      "Predikat Kinerja",
    ]
    const rows = filteredData.map((d) => [
      d.user.nik,
      `"${d.user.nama}"`,
      d.user.role,
      `"${d.user.position_title || "-"}"`,
      d.totalAssigned,
      d.completed,
      d.inProgress,
      d.reviewPending,
      `${d.onTimeRate}%`,
      d.score,
      d.stars,
      `"${d.predicate}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Laporan_Kinerja_Karyawan_TelkomAkses_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("File Rekap Kinerja & Bintang Karyawan berhasil di-download (.CSV / Excel)!")
  }

  // Functional Print / PDF
  const handlePrintPDF = () => {
    window.print()
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-12 font-sans">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Laporan Kinerja & Penilaian Bintang Karyawan
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900">
                  Live Database
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rekapitulasi resmi penyelesaian tugas kantor, tingkat ketepatan waktu, dan rating bintang kinerja personil Telkom Akses.
              </p>
            </div>

            {/* Action & Export Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadReportData}
                className="h-9 px-3 text-xs font-semibold rounded-xl gap-1.5"
              >
                <RefreshCwIcon className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl"
              >
                <FileSpreadsheetIcon className="size-4 text-emerald-600" /> Export Excel/CSV
              </Button>
              <Button
                onClick={handlePrintPDF}
                size="sm"
                className="h-9 text-xs gap-1.5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                <PrinterIcon className="size-4" /> Cetak Dokumen / PDF
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Total Tugas Selesai</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                  {totalDone}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Dari {totalTasks} seluruh penugasan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <TrendingUpIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Rata-rata SLA On-Time</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-emerald-600">
                  {avgSla}%
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Kepatuhan standar operasional</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Menunggu Validasi</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-amber-600">
                  {totalReview}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Dalam antrean verifikasi atasan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <StarIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Total Personil Terdaftar</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                  {data.length}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Seluruh jajaran hierarki aktif</p>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 bg-card rounded-2xl border border-border">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              <div className="relative w-full sm:w-72">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIK / Nama / Posisi..."
                  className="h-9 w-full pl-8 rounded-xl text-xs bg-muted/40"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-9 px-3 rounded-xl text-xs font-semibold bg-background border border-border text-foreground"
              >
                <option value="Semua">Semua Jabatan</option>
                <option value="staff">Staff Teknisi</option>
                <option value="officer_1">Officer 1</option>
                <option value="officer_2">Officer 2</option>
                <option value="officer_3">Officer 3</option>
                <option value="manager">Manager Divisi</option>
                <option value="sgm">SGM</option>
              </select>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Menampilkan {filteredData.length} data karyawan
            </span>
          </div>

          {/* Performance Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-bold text-foreground">Karyawan</TableHead>
                  <TableHead className="text-xs font-bold text-foreground">Jabatan & Posisi</TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">Total Tugas</TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">Selesai</TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">Proses</TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">Review</TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">Tepat Waktu</TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">Bintang & Predikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => {
                  const roleMeta = ROLE_LABELS[row.user.role] || { badge: "User", color: "bg-zinc-100" }
                  return (
                    <TableRow key={row.user.id} className="hover:bg-muted/30">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={row.user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                            alt={row.user.nama}
                            className="size-8 rounded-lg object-cover border border-border shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-foreground block">{row.user.nama}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">NIK: {row.user.nik}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${roleMeta.color}`}>
                          {roleMeta.badge}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{row.user.position_title}</p>
                      </TableCell>

                      <TableCell className="py-3 text-center font-bold text-xs tabular-nums">
                        {row.totalAssigned}
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          {row.completed}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center font-semibold text-xs tabular-nums text-blue-600">
                        {row.inProgress}
                      </TableCell>

                      <TableCell className="py-3 text-center font-semibold text-xs tabular-nums text-amber-600">
                        {row.reviewPending}
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="font-extrabold text-xs text-foreground tabular-nums">
                          {row.onTimeRate}%
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
                            <StarIcon className="size-3 fill-amber-500 text-amber-500" />
                            <span>{row.stars}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">/ 5.0</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              row.score >= 90
                                ? "text-emerald-600 dark:text-emerald-400"
                                : row.score >= 75
                                ? "text-blue-600 dark:text-blue-400"
                                : row.score >= 60
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {row.predicate}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
