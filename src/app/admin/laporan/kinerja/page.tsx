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
  HistoryIcon,
  AlertCircleIcon,
  InfoIcon,
  HelpCircleIcon,
  SparklesIcon,
  ChevronDownIcon,
  CheckIcon,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  getEmployeePerformanceReport,
  EmployeePerformanceReport,
  PerformanceHistoryItem,
} from "@/lib/api"
import { ROLE_LABELS, TASK_PRIORITY_LABELS } from "@/types/database"

export default function LaporanKinerjaPage() {
  const [data, setData] = React.useState<EmployeePerformanceReport[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState("Semua")
  const [selectedReport, setSelectedReport] = React.useState<EmployeePerformanceReport | null>(null)

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
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
              <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Total Tugas Selesai</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                  {totalDone}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Dari {totalTasks} seluruh penugasan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
              <TrendingUpIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Rata-rata SLA On-Time</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-emerald-600">
                  {avgSla}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Kepatuhan standar operasional</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
              <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Menunggu Validasi</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-amber-600">
                  {totalReview}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Dalam antrean verifikasi atasan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
              <StarIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-xs font-bold text-muted-foreground">Total Personil Terdaftar</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                  {data.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Seluruh jajaran hierarki aktif</p>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 bg-card rounded-[8px] border border-border">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              <div className="relative w-full sm:w-72">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIK / Nama / Posisi..."
                  className="h-9 w-full pl-8 rounded-[8px] text-xs bg-muted/40"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 rounded-[8px] text-xs font-semibold bg-background border border-border hover:bg-muted/40 gap-2 cursor-pointer shadow-2xs"
                    >
                      <span className="text-muted-foreground font-normal">Jabatan:</span>
                      <span className="font-bold text-foreground">
                        {selectedRole === "Semua"
                          ? "Semua Jabatan"
                          : selectedRole === "sgm"
                          ? "Senior General Manager (SGM)"
                          : selectedRole === "manager"
                          ? "Manager"
                          : selectedRole === "officer_3"
                          ? "Officer 3"
                          : selectedRole === "officer_2"
                          ? "Officer 2"
                          : selectedRole === "officer_1"
                          ? "Officer 1"
                          : "Staff"}
                      </span>
                      <ChevronDownIcon className="size-3.5 text-muted-foreground opacity-70" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="w-56 p-1.5 rounded-[8px] shadow-xl border-border bg-card">
                  <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Filter Jabatan
                  </div>
                  <DropdownMenuItem
                    onClick={() => setSelectedRole("Semua")}
                    className={`cursor-pointer text-xs py-2 px-2.5 rounded-[6px] flex items-center justify-between ${
                      selectedRole === "Semua" ? "bg-muted font-bold" : ""
                    }`}
                  >
                    <span>Semua Jabatan</span>
                    {selectedRole === "Semua" && <CheckIcon className="size-3.5 text-red-600" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  {[
                    { key: "sgm", label: "Senior General Manager (SGM)" },
                    { key: "manager", label: "Manager" },
                    { key: "officer_3", label: "Officer 3" },
                    { key: "officer_2", label: "Officer 2" },
                    { key: "officer_1", label: "Officer 1" },
                    { key: "staff", label: "Staff" },
                  ].map((item) => (
                    <DropdownMenuItem
                      key={item.key}
                      onClick={() => setSelectedRole(item.key)}
                      className={`cursor-pointer text-xs py-2 px-2.5 rounded-[6px] flex items-center justify-between ${
                        selectedRole === item.key ? "bg-muted font-bold" : ""
                      }`}
                    >
                      <span>{item.label}</span>
                      {selectedRole === item.key && <CheckIcon className="size-3.5 text-red-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Menampilkan {filteredData.length} data karyawan
            </span>
          </div>

          {/* Performance Table */}
          <div className="rounded-[8px] border border-border bg-card overflow-hidden">
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
                  <TableHead className="text-xs font-bold text-foreground text-center">Riwayat & Alasan</TableHead>
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

                      <TableCell className="py-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(row)}
                          className="h-7 px-2.5 text-xs font-semibold rounded-lg border-border hover:bg-muted text-foreground inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <HistoryIcon className="size-3.5 text-red-600 dark:text-red-400" />
                          <span>Detail Poin</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Modal Dialog Detail & Riwayat Penilaian Kinerja */}
          <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
            <DialogContent className="w-[95vw] sm:max-w-5xl md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-[8px] shadow-2xl">
              {selectedReport && (
                <div className="space-y-6">
                  {/* Header Dialog */}
                  <div className="flex items-start justify-between border-b border-border pb-4 gap-4 pr-8 sm:pr-10">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          selectedReport.user.avatar_url ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                        }
                        alt={selectedReport.user.nama}
                        className="size-14 rounded-[8px] object-cover border border-border shadow-xs shrink-0"
                      />
                      <div>
                        <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
                          <span>{selectedReport.user.nama}</span>
                          <span className="text-xs font-mono text-muted-foreground font-normal">
                            (NIK: {selectedReport.user.nik})
                          </span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                          {selectedReport.user.position_title || "Karyawan"} •{" "}
                          <span className="font-bold text-foreground uppercase text-xs tracking-wider">
                            {selectedReport.user.role}
                          </span>
                        </DialogDescription>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                        <StarIcon className="size-4.5 fill-amber-500 text-amber-500" />
                        <span className="text-base font-extrabold">{selectedReport.stars}</span>
                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          selectedReport.score >= 90
                            ? "text-emerald-600"
                            : selectedReport.score >= 75
                            ? "text-blue-600"
                            : selectedReport.score >= 60
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        Predikat: {selectedReport.predicate} (Skor {selectedReport.score})
                      </span>
                    </div>
                  </div>

                  {/* Breakdown Komponen Penilaian */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground">Skor Dasar Awal</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-foreground">100</span>
                        <span className="text-[10px] text-muted-foreground">Poin Standar</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        Total Bonus Didapat
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          +{selectedReport.bonusPoints}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Poin On-time & Subtasks</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-red-700 dark:text-red-400">
                        Total Penalti Terkena
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                          -{selectedReport.penaltyPoints}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Poin Keterlambatan</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">
                        Tingkat Tepat Waktu (SLA)
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {selectedReport.onTimeRate}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">Dari tugas terbit</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner Penjelasan Formula Transparan */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/80 text-xs space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <InfoIcon className="size-4 text-primary shrink-0" />
                      <span>Transparansi Rumus Penilaian Kinerja Karyawan:</span>
                    </div>
                    <p className="font-mono text-[11px] bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border text-foreground">
                      Skor Akhir ({selectedReport.score}) = 100 Poin Dasar - {selectedReport.penaltyPoints} Poin Penalti +{" "}
                      {selectedReport.bonusPoints} Poin Bonus
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                      <div>
                        <span className="font-semibold text-foreground">• Toleransi 15 Menit & Bonus:</span> Keterlambatan
                        ≤ 15 menit tetap dianggap tepat waktu (faktor teknis upload/sync). Bonus +2 poin tugas on-time (+1
                        jika subtask 100% lengkap).
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">• Penalti Proporsional:</span> Keterlambatan
                        ringan (15m–2j) dipotong ringan (-1 s/d -4), keterlambatan sedang &amp; berat (di atas 24 jam) dikenakan penalti
                        sesuai skala prioritas tugas.
                      </div>
                    </div>
                  </div>

                  {/* Tabel History Detail Tugas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <HistoryIcon className="size-3.5 text-primary" />
                        <span>Log Riwayat Tugas & Detail Alasan Skor ({selectedReport.history.length} Tugas)</span>
                      </h4>
                    </div>

                    <div className="rounded-[8px] border border-border overflow-x-auto bg-card">
                      <Table>
                        <TableHeader className="bg-muted/50 text-xs">
                          <TableRow>
                            <TableHead className="py-2.5 px-3 min-w-[180px]">Tugas & Tiket</TableHead>
                            <TableHead className="py-2.5 px-3 min-w-[90px]">Prioritas</TableHead>
                            <TableHead className="py-2.5 px-3 min-w-[160px]">Batas vs Kumpul</TableHead>
                            <TableHead className="py-2.5 px-3 text-center min-w-[120px]">Status Ketepatan</TableHead>
                            <TableHead className="py-2.5 px-3 text-center min-w-[110px]">Dampak Poin</TableHead>
                            <TableHead className="py-2.5 px-3 min-w-[260px]">Alasan Penilaian</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs">
                          {selectedReport.history.length > 0 ? (
                            selectedReport.history.map((h) => {
                              const pMeta = TASK_PRIORITY_LABELS[h.priority] || { label: h.priority }
                              return (
                                <TableRow key={h.taskId} className="hover:bg-muted/20">
                                  <TableCell className="py-2.5 px-3">
                                    <span className="font-bold text-foreground block line-clamp-1">{h.title}</span>
                                    <span className="font-mono text-xs text-muted-foreground">{h.ticketCode}</span>
                                  </TableCell>

                                  <TableCell className="py-2.5 px-3">
                                    <span className="inline-block px-2 py-0.5 rounded-[6px] text-xs font-bold border border-border bg-muted/60">
                                      {pMeta.label}
                                    </span>
                                  </TableCell>

                                  <TableCell className="py-2.5 px-3 font-mono text-xs">
                                    <div className="text-muted-foreground">
                                      Batas:{" "}
                                      {h.deadlineAt
                                        ? new Date(h.deadlineAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "-"}
                                    </div>
                                    {h.completedAt && (
                                      <div className="font-semibold text-foreground">
                                        Kumpul:{" "}
                                        {new Date(h.completedAt).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </div>
                                    )}
                                  </TableCell>

                                  <TableCell className="py-2.5 px-3 text-center">
                                    {h.outcome === "on_time" ? (
                                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                                        Tepat Waktu
                                      </Badge>
                                    ) : h.outcome === "late" ? (
                                      <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold">
                                        Terlambat
                                      </Badge>
                                    ) : h.outcome === "overdue" ? (
                                      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                        Lewat Batas
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px]">
                                        Berjalan
                                      </Badge>
                                    )}
                                  </TableCell>

                                  <TableCell className="py-2.5 px-3 text-center font-bold font-mono">
                                    {h.pointsChange > 0 ? (
                                      <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-xs">
                                        +{h.pointsChange} Poin
                                      </span>
                                    ) : h.pointsChange < 0 ? (
                                      <span className="text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded text-xs">
                                        {h.pointsChange} Poin
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">0 Poin</span>
                                    )}
                                  </TableCell>

                                  <TableCell className="py-2.5 px-3 text-muted-foreground text-[11px] leading-relaxed">
                                    {h.reason}
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="py-6 text-center text-muted-foreground text-xs">
                                Belum ada riwayat penugasan yang tercatat untuk karyawan ini.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Footer Dialog */}
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                      className="h-8 px-4 text-xs cursor-pointer"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
