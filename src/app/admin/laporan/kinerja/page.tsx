"use client"

import * as React from "react"
import {
  FileBarChartIcon,
  DownloadIcon,
  PrinterIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  SearchIcon,
  CheckCircle2Icon,
  ClockIcon,
  StarIcon,
  PaperclipIcon,
  TrendingUpIcon,
  FilterIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AiPanelProvider } from "@/components/dashboard/ai-panel-context"
import { AiIntegratedPanel } from "@/components/dashboard/ai-integrated-panel"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const laporanData = [
  { nik: "10293841", nama: "Andi Pratama", dept: "IT", totalTask: 12, selesai: 11, proses: 1, onTimeRate: "98.5%", skor: 98.5, buktiUploaded: 11 },
  { nik: "10293842", nama: "Bambang Susanto", dept: "Operations", totalTask: 15, selesai: 14, proses: 1, onTimeRate: "95.0%", skor: 95.2, buktiUploaded: 14 },
  { nik: "10293843", nama: "Irfan Maulana", dept: "IT", totalTask: 10, selesai: 8, proses: 2, onTimeRate: "92.0%", skor: 92.4, buktiUploaded: 8 },
  { nik: "10293844", nama: "Kevin Pratama", dept: "IT", totalTask: 11, selesai: 9, proses: 2, onTimeRate: "90.9%", skor: 91.0, buktiUploaded: 9 },
  { nik: "10293845", nama: "Siti Rahayu", dept: "Finance", totalTask: 8, selesai: 7, proses: 1, onTimeRate: "96.2%", skor: 96.5, buktiUploaded: 7 },
  { nik: "10293846", nama: "Rudi Hermawan", dept: "HR", totalTask: 9, selesai: 7, proses: 2, onTimeRate: "88.8%", skor: 89.2, buktiUploaded: 7 },
  { nik: "10293847", nama: "Oscar Budiman", dept: "Operations", totalTask: 14, selesai: 12, proses: 2, onTimeRate: "85.7%", skor: 86.0, buktiUploaded: 12 },
  { nik: "10293848", nama: "Julia Sari", dept: "Operations", totalTask: 10, selesai: 8, proses: 2, onTimeRate: "90.0%", skor: 90.5, buktiUploaded: 8 },
  { nik: "10293849", nama: "Qomar Siddiq", dept: "IT", totalTask: 13, selesai: 11, proses: 2, onTimeRate: "92.3%", skor: 92.8, buktiUploaded: 11 },
  { nik: "10293850", nama: "Fajar Nugroho", dept: "Finance", totalTask: 7, selesai: 6, proses: 1, onTimeRate: "94.0%", skor: 94.5, buktiUploaded: 6 },
]

export default function LaporanKinerjaPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDept, setSelectedDept] = React.useState("Semua")
  const [periode, setPeriode] = React.useState("agt")

  const filteredData = React.useMemo(() => {
    return laporanData.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nik.includes(searchQuery)
      const matchDept = selectedDept === "Semua" || item.dept === selectedDept
      return matchSearch && matchDept
    })
  }, [searchQuery, selectedDept])

  const handleExportPDF = () => {
    toast.success("Laporan Kinerja PDF sedang di-generate & di-download!")
  }

  const handleExportExcel = () => {
    toast.success("File Excel Laporan Kinerja (XLSX) berhasil di-download!")
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
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-12">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Laporan Kinerja & Rekap Lapangan
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dashboard rekapitulasi penyelesaian task & bukti pekerjaan karyawan
              </p>
            </div>

            {/* Action & Export Buttons */}
            <div className="flex items-center gap-2">
              <Link href="/admin/tasks">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-[8px] text-xs font-semibold hover:bg-muted hover:text-red-600 border-border/80 cursor-pointer shadow-2xs transition-colors"
                >
                  <ArrowLeftIcon className="size-3.5" /> Kelola Tasks
                </Button>
              </Link>
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5 font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-[8px]"
              >
                <FileSpreadsheetIcon className="size-4 text-emerald-600" /> Export Excel
              </Button>
              <Button
                onClick={handleExportPDF}
                size="sm"
                className="h-9 text-xs gap-1.5 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
              >
                <DownloadIcon className="size-4" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Quick Metrics (Red Theme) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Total Task Selesai</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Agustus 2026
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  124
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Dari 179 task yang ditugaskan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <TrendingUpIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Tingkat Penyelesaian</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                    +5.2%
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  92.4%
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Tingkat kepatuhan SLA sangat baik</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <PaperclipIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Bukti Foto / Nota</span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    Verified
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  118
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Terverifikasi oleh atasan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <StarIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Skor Performa Rata-rata</span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    Grade A
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  4.85 <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Berdasarkan 17 teknisi lapangan</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-[8px] border">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari NIK atau nama karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-[8px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Departemen:</span>
              {["Semua", "IT", "Operations", "Finance", "HR"].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1 rounded-[8px] text-xs font-medium transition-all ${selectedDept === dept
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Table */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Rekapitulasi Kinerja Karyawan (Bulan Agustus 2026)</span>
                <Badge variant="outline" className="text-xs font-medium">10 Teknisi Teratas</Badge>
              </CardTitle>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-24">NIK</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead className="text-center">Total Task</TableHead>
                  <TableHead className="text-center">Task Selesai</TableHead>
                  <TableHead className="text-center">Tepat Waktu</TableHead>
                  <TableHead className="text-center">Bukti Ter-upload</TableHead>
                  <TableHead className="text-right">Skor Kinerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow key={row.nik}>
                    <TableCell className="font-mono text-xs font-semibold">{row.nik}</TableCell>
                    <TableCell className="font-semibold text-sm text-foreground">{row.nama}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {row.dept}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold tabular-nums">{row.totalTask}</TableCell>
                    <TableCell className="text-center font-semibold tabular-nums text-emerald-600">
                      {row.selesai}
                    </TableCell>
                    <TableCell className="text-center font-semibold tabular-nums">{row.onTimeRate}</TableCell>
                    <TableCell className="text-center font-semibold tabular-nums">
                      <div className="inline-flex items-center gap-1 text-emerald-600">
                        <PaperclipIcon className="size-3.5" />
                        <span>{row.buktiUploaded} File</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1 font-bold text-foreground">
                        <StarIcon className="size-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{row.skor}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
