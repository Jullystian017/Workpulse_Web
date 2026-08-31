"use client"

import * as React from "react"
import {
  FileTextIcon,
  DownloadIcon,
  SearchIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  UserCheckIcon,
  XCircleIcon,
  FilterIcon,
  FileSpreadsheetIcon,
  ArrowLeftIcon,
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
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const rekapKehadiranData = [
  { nik: "10293841", nama: "Andi Pratama", dept: "IT", totalHariKerja: 22, hadir: 22, terlambat: 0, izinSakit: 0, cuti: 0, mangkir: 0, totalJamKerja: "176 Jam", lembur: "12 Jam", skorPresensi: "100%" },
  { nik: "10293842", nama: "Bambang Susanto", dept: "Operations", totalHariKerja: 22, hadir: 21, terlambat: 1, izinSakit: 0, cuti: 1, mangkir: 0, totalJamKerja: "168 Jam", lembur: "18 Jam", skorPresensi: "95.4%" },
  { nik: "10293843", nama: "Irfan Maulana", dept: "IT", totalHariKerja: 22, hadir: 22, terlambat: 2, izinSakit: 0, cuti: 0, mangkir: 0, totalJamKerja: "184 Jam", lembur: "24 Jam", skorPresensi: "98.1%" },
  { nik: "10293844", nama: "Kevin Pratama", dept: "IT", totalHariKerja: 22, hadir: 20, terlambat: 0, izinSakit: 2, cuti: 0, mangkir: 0, totalJamKerja: "160 Jam", lembur: "8 Jam", skorPresensi: "90.9%" },
  { nik: "10293845", nama: "Siti Rahayu", dept: "Finance", totalHariKerja: 22, hadir: 22, terlambat: 1, izinSakit: 0, cuti: 0, mangkir: 0, totalJamKerja: "176 Jam", lembur: "4 Jam", skorPresensi: "99.0%" },
  { nik: "10293846", nama: "Rudi Hermawan", dept: "HR", totalHariKerja: 22, hadir: 21, terlambat: 0, izinSakit: 0, cuti: 1, mangkir: 0, totalJamKerja: "168 Jam", lembur: "0 Jam", skorPresensi: "95.4%" },
  { nik: "10293847", nama: "Oscar Budiman", dept: "Operations", totalHariKerja: 22, hadir: 19, terlambat: 4, izinSakit: 1, cuti: 1, mangkir: 1, totalJamKerja: "152 Jam", lembur: "10 Jam", skorPresensi: "81.8%" },
  { nik: "10293848", nama: "Julia Sari", dept: "Operations", totalHariKerja: 22, hadir: 21, terlambat: 3, izinSakit: 0, cuti: 1, mangkir: 0, totalJamKerja: "168 Jam", lembur: "15 Jam", skorPresensi: "92.0%" },
  { nik: "10293849", nama: "Qomar Siddiq", dept: "IT", totalHariKerja: 22, hadir: 22, terlambat: 0, izinSakit: 0, cuti: 0, mangkir: 0, totalJamKerja: "176 Jam", lembur: "16 Jam", skorPresensi: "100%" },
  { nik: "10293850", nama: "Fajar Nugroho", dept: "Finance", totalHariKerja: 22, hadir: 22, terlambat: 0, izinSakit: 0, cuti: 0, mangkir: 0, totalJamKerja: "176 Jam", lembur: "6 Jam", skorPresensi: "100%" },
]

export default function RekapKehadiranPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedBulan, setSelectedBulan] = React.useState("Agustus 2026")
  const [selectedDept, setSelectedDept] = React.useState("Semua")

  const filteredData = React.useMemo(() => {
    return rekapKehadiranData.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nik.includes(searchQuery)
      const matchDept = selectedDept === "Semua" || item.dept === selectedDept
      return matchSearch && matchDept
    })
  }, [searchQuery, selectedDept])

  const handleExportPDF = () => {
    toast.success(`Berhasil mengunduh Laporan Rekap Kehadiran PDF (${selectedBulan})`)
  }

  const handleExportExcel = () => {
    toast.success(`Berhasil mengunduh Laporan Rekap Kehadiran Excel CSV (${selectedBulan})`)
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
                Laporan Rekap Kehadiran Karyawan
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rekapitulasi bulanan presensi, akumulasi lembur, statistik keterlambatan, dan ekspor dokumen formal Telkom Akses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/presensi">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs gap-1.5 font-semibold rounded-[8px] hover:bg-muted hover:text-red-600 border-border/80 cursor-pointer shadow-2xs"
                >
                  <ArrowLeftIcon className="size-3.5" /> Live Presensi & Peta
                </Button>
              </Link>
              <Button
                onClick={handleExportExcel}
                variant="outline"
                className="h-9 text-xs gap-1.5 font-semibold rounded-[8px] border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <FileSpreadsheetIcon className="size-4" /> Export Excel
              </Button>
              <Button
                onClick={handleExportPDF}
                className="h-9 text-xs gap-1.5 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
              >
                <DownloadIcon className="size-4" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <UserCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Rata-rata Kehadiran</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                    Sangat Baik
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  96.4%
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Total 22 hari kerja efektif</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Akumulasi Lembur</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Overtime
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  113 <span className="text-xs font-normal text-muted-foreground">Jam</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Dari seluruh departemen</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CalendarIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Total Cuti & Sakit</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Disetujui
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  7 <span className="text-xs font-normal text-muted-foreground">Hari</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Termasuk izin resmi</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <XCircleIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Tingkat Mangkir</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    0.8%
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  1 <span className="text-xs font-normal text-muted-foreground">Kasus</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Membutuhkan SP-1</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-[8px] border">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari NIK / Nama karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-[8px]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground shrink-0">Periode Bulan:</span>
                <Select value={selectedBulan} onValueChange={(val) => val && setSelectedBulan(val)}>
                  <SelectTrigger className="h-9 text-xs w-36 rounded-[8px]">
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agustus 2026">Agustus 2026</SelectItem>
                    <SelectItem value="Juli 2026">Juli 2026</SelectItem>
                    <SelectItem value="Juni 2026">Juni 2026</SelectItem>
                    <SelectItem value="Mei 2026">Mei 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground shrink-0">Departemen:</span>
                <Select value={selectedDept} onValueChange={(val) => val && setSelectedDept(val)}>
                  <SelectTrigger className="h-9 text-xs w-36 rounded-[8px]">
                    <SelectValue placeholder="Semua Dept" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Dept</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Daftar Rekap Kehadiran Bulanan ({selectedBulan})</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {filteredData.length} Karyawan
                </Badge>
              </CardTitle>
              <CardDescription>
                Tabel akumulasi absensi formal untuk pertimbangan payroll & penilaian performa bulanan.
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-24">NIK</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead className="text-center">Hari Kerja</TableHead>
                  <TableHead className="text-center">Hadir</TableHead>
                  <TableHead className="text-center">Terlambat</TableHead>
                  <TableHead className="text-center">Izin/Cuti</TableHead>
                  <TableHead className="text-center">Mangkir</TableHead>
                  <TableHead className="text-center">Total Jam</TableHead>
                  <TableHead className="text-center">Lembur</TableHead>
                  <TableHead className="text-right">Skor Presensi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow key={row.nik}>
                    <TableCell className="font-mono text-xs font-semibold">{row.nik}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">{row.nama}</span>
                        <span className="text-[11px] text-muted-foreground">{row.dept}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.totalHariKerja}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold text-emerald-600">{row.hadir}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold text-amber-600">{row.terlambat}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-blue-600">{row.izinSakit + row.cuti}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold text-red-600">{row.mangkir}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.totalJamKerja}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold text-blue-700">{row.lembur}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          parseFloat(row.skorPresensi) >= 95
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                            : parseFloat(row.skorPresensi) >= 90
                              ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                              : "bg-amber-50 text-amber-700 border-amber-200 font-semibold"
                        }
                      >
                        {row.skorPresensi}
                      </Badge>
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
