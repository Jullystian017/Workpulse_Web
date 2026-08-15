"use client"

import * as React from "react"
import {
  CalendarCheckIcon,
  ClockIcon,
  SearchIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CircleCheckIcon,
  XCircleIcon,
  CalendarOffIcon,
  FilterIcon,
  FileTextIcon,
  PlusIcon,
  ArrowUpRightIcon,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialPresensiData = [
  { nik: "10293841", nama: "Andi Pratama", dept: "IT", tipe: "Telkom", clockIn: "07:58", clockOut: "17:05", status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "45m" },
  { nik: "10293842", nama: "Bambang Susanto", dept: "Operations", tipe: "Non-Telkom (Mitra)", clockIn: "08:02", clockOut: "17:00", status: "Hadir", lokasi: "Area Telkom Akses (Geofence OK)", radius: "120m" },
  { nik: "10293843", nama: "Irfan Maulana", dept: "IT", tipe: "Telkom", clockIn: "08:10", clockOut: null, status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "30m" },
  { nik: "10293844", nama: "Kevin Pratama", dept: "IT", tipe: "Telkom", clockIn: "07:59", clockOut: "17:15", status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "50m" },
  { nik: "10293845", nama: "Siti Rahayu", dept: "Finance", tipe: "Telkom", clockIn: "08:02", clockOut: null, status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "60m" },
  { nik: "10293846", nama: "Rudi Hermawan", dept: "HR", tipe: "Telkom", clockIn: "07:55", clockOut: "17:30", status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "25m" },
  { nik: "10293847", nama: "Oscar Budiman", dept: "Operations", tipe: "Non-Telkom (Mitra)", clockIn: "09:10", clockOut: null, status: "Terlambat", lokasi: "Area Telkom Akses (Geofence OK)", radius: "180m" },
  { nik: "10293848", nama: "Julia Sari", dept: "Operations", tipe: "Telkom", clockIn: "08:45", clockOut: null, status: "Terlambat", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "85m" },
  { nik: "10293849", nama: "Qomar Siddiq", dept: "IT", tipe: "Telkom", clockIn: "08:15", clockOut: null, status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "40m" },
  { nik: "10293850", nama: "Fajar Nugroho", dept: "Finance", tipe: "Telkom", clockIn: "07:50", clockOut: "17:00", status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "15m" },
  { nik: "10293851", nama: "Dewi Lestari", dept: "Marketing", tipe: "Telkom", clockIn: "08:21", clockOut: null, status: "Terlambat", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "90m" },
  { nik: "10293852", nama: "Citra Dewi", dept: "IT", tipe: "Non-Telkom (Mitra)", clockIn: null, clockOut: null, status: "Absen", lokasi: "—", radius: "—" },
  { nik: "10293853", nama: "Gani Fauzan", dept: "HR", tipe: "Telkom", clockIn: null, clockOut: null, status: "Izin", lokasi: "—", radius: "—" },
  { nik: "10293854", nama: "Hana Pertiwi", dept: "Marketing", tipe: "Telkom", clockIn: "08:05", clockOut: null, status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "35m" },
  { nik: "10293855", nama: "Lia Andriani", dept: "Finance", tipe: "Telkom", clockIn: "08:01", clockOut: null, status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "55m" },
  { nik: "10293856", nama: "Mukhlis Amir", dept: "HR", tipe: "Non-Telkom (Mitra)", clockIn: null, clockOut: null, status: "Cuti", lokasi: "—", radius: "—" },
  { nik: "10293857", nama: "Nina Wahyuni", dept: "Marketing", tipe: "Telkom", clockIn: "08:00", clockOut: null, status: "Hadir", lokasi: "Kantor Telkom Akses (Geofence OK)", radius: "40m" },
]

const initialPendingCuti = [
  { id: "CUTI-001", nik: "10293856", nama: "Mukhlis Amir", dept: "HR", tipeCuti: "Cuti Tahunan", tglMulai: "2026-08-14", tglSelesai: "2026-08-16", durasi: "3 Hari", alasan: "Acara keluarga di kampung halaman", dokumen: "surat-pengajuan.pdf" },
  { id: "CUTI-002", nik: "10293853", nama: "Gani Fauzan", dept: "HR", tipeCuti: "Izin Sakit", tglMulai: "2026-08-13", tglSelesai: "2026-08-14", durasi: "2 Hari", alasan: "Demam tinggi & butuh istirahat dokter", dokumen: "surat-dokter-klinik.pdf" },
]

export default function PresensiPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("Semua")
  const [pendingCuti, setPendingCuti] = React.useState(initialPendingCuti)
  const [isSubmitCutiOpen, setIsSubmitCutiOpen] = React.useState(false)

  const filteredData = React.useMemo(() => {
    return initialPresensiData.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nik.includes(searchQuery)
      const matchStatus = statusFilter === "Semua" || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [searchQuery, statusFilter])

  const handleApproveCuti = (id: string, nama: string) => {
    setPendingCuti((prev) => prev.filter((c) => c.id !== id))
    toast.success(`Pengajuan cuti karyawan ${nama} berhasil disetujui!`)
  }

  const handleRejectCuti = (id: string, nama: string) => {
    setPendingCuti((prev) => prev.filter((c) => c.id !== id))
    toast.error(`Pengajuan cuti karyawan ${nama} ditolak.`)
  }

  const handleSubmitCutiForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nama = formData.get("nama") as string
    const nik = formData.get("nik") as string
    const tipeCuti = formData.get("tipeCuti") as string
    const tglMulai = formData.get("tglMulai") as string
    const tglSelesai = formData.get("tglSelesai") as string
    const alasan = formData.get("alasan") as string

    const newRequest = {
      id: `CUTI-00${pendingCuti.length + 3}`,
      nik: nik || "10293841",
      nama,
      dept: "IT",
      tipeCuti,
      tglMulai,
      tglSelesai,
      durasi: "2 Hari",
      alasan,
      dokumen: "surat-pengajuan.pdf",
    }

    setPendingCuti((prev) => [newRequest, ...prev])
    setIsSubmitCutiOpen(false)
    toast.success(`Pengajuan cuti atas nama ${nama} berhasil dikirim ke Admin!`)
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
      <AiPanelProvider>
        <AppSidebar variant="inset" />
        <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
          <SiteHeader />
          <div className="flex flex-1 min-h-0 h-full flex-row overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 p-4 lg:p-6 pb-12">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Presensi & Persetujuan Cuti Karyawan
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitoring log Clock In/Out Geofence 200m & Manajemen Persetujuan Cuti / Izin
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/laporan/kehadiran">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl text-xs font-semibold hover:bg-muted hover:text-red-600 border-border/80 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileTextIcon className="size-3.5 text-red-600" />
                  <span>Rekap Kehadiran</span>
                  <ArrowUpRightIcon className="size-3 text-muted-foreground" />
                </Button>
              </Link>
              <Sheet open={isSubmitCutiOpen} onOpenChange={setIsSubmitCutiOpen}>
                <SheetTrigger render={<Button className="h-9 text-xs gap-1.5 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"><PlusIcon className="size-4" /> Ajukan Cuti Baru</Button>} />
                <SheetContent className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Form Pengajuan Cuti / Izin Karyawan</SheetTitle>
                    <SheetDescription>
                      Isi form pengajuan cuti atau izin untuk dikirim ke persetujuan Atasan.
                    </SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleSubmitCutiForm} className="flex flex-col gap-4 p-4 pt-0">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nik" className="text-xs font-semibold">NIK Karyawan</Label>
                      <Input id="nik" name="nik" placeholder="10293841" required className="h-9 font-mono" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nama" className="text-xs font-semibold">Nama Lengkap</Label>
                      <Input id="nama" name="nama" placeholder="Contoh: Andi Pratama" required className="h-9" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="tipeCuti" className="text-xs font-semibold">Tipe Pengajuan</Label>
                      <Select name="tipeCuti" defaultValue="Cuti Tahunan">
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Pilih Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cuti Tahunan">Cuti Tahunan</SelectItem>
                          <SelectItem value="Izin Sakit">Izin Sakit</SelectItem>
                          <SelectItem value="Cuti Melahirkan">Cuti Melahirkan</SelectItem>
                          <SelectItem value="Izin Keperluan Mendesak">Izin Keperluan Mendesak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tglMulai" className="text-xs font-semibold">Tanggal Mulai</Label>
                        <Input id="tglMulai" name="tglMulai" type="date" required className="h-9" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tglSelesai" className="text-xs font-semibold">Tanggal Selesai</Label>
                        <Input id="tglSelesai" name="tglSelesai" type="date" required className="h-9" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="alasan" className="text-xs font-semibold">Alasan Pengajuan</Label>
                      <Input id="alasan" name="alasan" placeholder="Alasan cuti..." required className="h-9" />
                    </div>
                    <Button type="submit" className="mt-2 w-full h-10 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                      Kirim Pengajuan Cuti
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>

              <Badge variant="outline" className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold hidden sm:flex">
                Geofence Active: 200m
              </Badge>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <CircleCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Tepat Waktu</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    On-time
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  11
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Clock-in sebelum jam 08:15</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Terlambat</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    Late
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  3
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Rata-rata keterlambatan 15m</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <CalendarOffIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Pengajuan Cuti Pending</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {pendingCuti.length} Pending
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  {pendingCuti.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Butuh persetujuan atasan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <XCircleIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Absen (Mangkir)</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    Absent
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  1
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Tanpa keterangan hadir</p>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="log" className="w-full flex-col gap-4">
            <div className="flex items-center justify-between">
              <TabsList className="h-9 bg-muted p-1 rounded-xl">
                <TabsTrigger value="log" className="text-xs gap-1.5 px-3">
                  <ClockIcon className="size-3.5" /> Log Presensi & Geofence
                </TabsTrigger>
                <TabsTrigger value="cuti" className="text-xs gap-1.5 px-3">
                  <CalendarOffIcon className="size-3.5" /> Persetujuan Cuti & Izin ({pendingCuti.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: Log Presensi */}
            <TabsContent value="log" className="m-0 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border">
                <div className="relative w-full sm:w-72">
                  <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari NIK / Nama karyawan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                  {["Semua", "Hadir", "Terlambat", "Absen", "Izin", "Cuti"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        statusFilter === st
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-24">NIK</TableHead>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Tipe Account</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verifikasi Geofence</TableHead>
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
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.tipe === "Telkom"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }
                          >
                            {row.tipe}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular-nums font-semibold">{row.clockIn || "—"}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{row.clockOut || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.status === "Hadir"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : row.status === "Terlambat"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            {row.lokasi !== "—" ? (
                              <>
                                <MapPinIcon className="size-3.5 shrink-0" />
                                <span>{row.lokasi} ({row.radius})</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* TAB 2: Pengajuan Cuti & Persetujuan Atasan */}
            <TabsContent value="cuti" className="m-0 flex flex-col gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-bold flex items-center justify-between">
                    <span>Daftar Pengajuan Cuti Menunggu Persetujuan Atasan</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs font-semibold">
                      {pendingCuti.length} Pengajuan Pending
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Persetujuan izin / cuti harian karyawan Telkom & Mitra Non-Telkom.
                  </CardDescription>
                </CardHeader>
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-24">ID Cuti</TableHead>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Tipe Cuti</TableHead>
                      <TableHead>Periode Tanggal</TableHead>
                      <TableHead>Alasan / Keterangan</TableHead>
                      <TableHead>Dokumen</TableHead>
                      <TableHead className="text-right">Keputusan Atasan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCuti.map((cuti) => (
                      <TableRow key={cuti.id}>
                        <TableCell className="font-mono text-xs font-semibold">{cuti.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground">{cuti.nama}</span>
                            <span className="text-[11px] font-mono text-muted-foreground">NIK: {cuti.nik} ({cuti.dept})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {cuti.tipeCuti}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold text-foreground">{cuti.tglMulai}</span> s/d <span className="font-semibold text-foreground">{cuti.tglSelesai}</span>
                          <span className="block text-[10px] text-muted-foreground">({cuti.durasi})</span>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{cuti.alasan}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <FileTextIcon className="size-3.5" />
                            <span>{cuti.dokumen}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleRejectCuti(cuti.id, cuti.nama)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Tolak
                            </Button>
                            <Button
                              onClick={() => handleApproveCuti(cuti.id, cuti.nama)}
                              size="sm"
                              className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Setujui (Approve)
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {pendingCuti.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                          Tidak ada pengajuan cuti yang pending saat ini. Semua sudah diproses!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
            </div>

            {/* Integrated Right AI Column */}
            <AiIntegratedPanel />
          </div>
        </SidebarInset>
      </AiPanelProvider>
    </SidebarProvider>
  )
}
