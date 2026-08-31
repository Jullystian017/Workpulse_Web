"use client"

import * as React from "react"
import {
  UsersIcon,
  SearchIcon,
  PlusIcon,
  MailIcon,
  PhoneIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  ShieldCheckIcon,
  MoreVerticalIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  ListIcon,
  AlertTriangleIcon,
  MapPinOffIcon,
  CheckCircleIcon
} from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface KaryawanItem {
  nik: string
  nama: string
  email: string
  telepon: string
  departemen: "IT" | "Operations" | "Finance" | "HR" | "Marketing"
  jabatan: string
  tipeUser: "Telkom" | "Non-Telkom (Mitra)"
  unit: string
  role: "Staff" | "Admin"
  avatarUrl?: string
  avatarInitials: string
  avatarBgColor?: string
  score: number
  scoreTitle: string
  scoreSubtitle: string
  scoreVariant: "high" | "low" | "good" | "medium"
  geofenceStatus: "valid_telkom" | "outside_area" | "remote_verified" | "late_checkin"
  geofenceText: string
  tasksDone: number
  lateMinutes: number
}

const initialKaryawan: KaryawanItem[] = [
  {
    nik: "948102",
    nama: "Ahmad Fauzi",
    email: "ahmad.fauzi@telkomakses.co.id",
    telepon: "0812-3456-7890",
    departemen: "IT",
    jabatan: "Senior Network Engineer",
    tipeUser: "Telkom",
    unit: "Area 1",
    role: "Staff",
    avatarInitials: "AF",
    avatarBgColor: "bg-blue-100 text-blue-700",
    score: 94,
    scoreTitle: "Kinerja Sangat Baik",
    scoreSubtitle: "Top 10% bulan ini",
    scoreVariant: "high",
    geofenceStatus: "valid_telkom",
    geofenceText: "Valid Area Telkom • 07:45 AM",
    tasksDone: 24,
    lateMinutes: 0,
  },
  {
    nik: "881204",
    nama: "Budi Santoso",
    email: "budi.s@mitra.telkom.co.id",
    telepon: "0813-9876-5432",
    departemen: "Operations",
    jabatan: "Staff Support Operasional",
    tipeUser: "Non-Telkom (Mitra)",
    unit: "Support",
    role: "Staff",
    avatarInitials: "BS",
    avatarBgColor: "bg-indigo-100 text-indigo-700",
    score: 58,
    scoreTitle: "Perlu Intervensi",
    scoreSubtitle: "Penurunan berturut-turut",
    scoreVariant: "low",
    geofenceStatus: "outside_area",
    geofenceText: "Di Luar Area Valid • 08:15 AM",
    tasksDone: 5,
    lateMinutes: 45,
  },
  {
    nik: "910283",
    nama: "Siti Rahma",
    email: "siti.rahma@telkomakses.co.id",
    telepon: "0817-1122-3344",
    departemen: "HR",
    jabatan: "HR & Talent Admin",
    tipeUser: "Telkom",
    unit: "Non-Telkom",
    role: "Admin",
    avatarInitials: "SR",
    avatarBgColor: "bg-amber-100 text-amber-700",
    score: 88,
    scoreTitle: "Kinerja Baik",
    scoreSubtitle: "Stabil 3 bulan terakhir",
    scoreVariant: "good",
    geofenceStatus: "remote_verified",
    geofenceText: "Remote Terverifikasi • 08:02 AM",
    tasksDone: 18,
    lateMinutes: 0,
  },
  {
    nik: "773192",
    nama: "Dedi Kurniawan",
    email: "dedi.k@telkomakses.co.id",
    telepon: "0818-5544-3322",
    departemen: "IT",
    jabatan: "Staff Hardware & Server",
    tipeUser: "Telkom",
    unit: "Area 2",
    role: "Staff",
    avatarInitials: "DK",
    avatarBgColor: "bg-purple-100 text-purple-700",
    score: 79,
    scoreTitle: "Kinerja Cukup",
    scoreSubtitle: "Mendekati batas target",
    scoreVariant: "medium",
    geofenceStatus: "late_checkin",
    geofenceText: "Terlambat Check-in • 08:35 AM",
    tasksDone: 11,
    lateMinutes: 35,
  },
  {
    nik: "10293841",
    nama: "Andi Pratama",
    email: "andi.pratama@telkomakses.co.id",
    telepon: "0811-2233-4455",
    departemen: "IT",
    jabatan: "Infrastructure Specialist",
    tipeUser: "Telkom",
    unit: "Area 1",
    role: "Staff",
    avatarInitials: "AP",
    avatarBgColor: "bg-emerald-100 text-emerald-700",
    score: 95,
    scoreTitle: "Kinerja Sangat Baik",
    scoreSubtitle: "Konsisten tepat waktu",
    scoreVariant: "high",
    geofenceStatus: "valid_telkom",
    geofenceText: "Valid Area Telkom • 07:50 AM",
    tasksDone: 22,
    lateMinutes: 0,
  },
  {
    nik: "10293846",
    nama: "Rudi Hermawan",
    email: "rudi.h@telkomakses.co.id",
    telepon: "0815-6677-8899",
    departemen: "Operations",
    jabatan: "Operations Lead",
    tipeUser: "Telkom",
    unit: "Area 1",
    role: "Admin",
    avatarInitials: "RH",
    avatarBgColor: "bg-rose-100 text-rose-700",
    score: 91,
    scoreTitle: "Kinerja Sangat Baik",
    scoreSubtitle: "Target sprint tercapai",
    scoreVariant: "high",
    geofenceStatus: "valid_telkom",
    geofenceText: "Valid Area Telkom • 07:40 AM",
    tasksDone: 26,
    lateMinutes: 0,
  },
  {
    nik: "10293847",
    nama: "Oscar Budiman",
    email: "oscar.b@mitra.telkom.co.id",
    telepon: "0819-9988-7766",
    departemen: "Operations",
    jabatan: "Field Mitra Coordinator",
    tipeUser: "Non-Telkom (Mitra)",
    unit: "Support",
    role: "Staff",
    avatarInitials: "OB",
    avatarBgColor: "bg-amber-100 text-amber-700",
    score: 62,
    scoreTitle: "Perlu Intervensi",
    scoreSubtitle: "3x terlambat minggu ini",
    scoreVariant: "low",
    geofenceStatus: "late_checkin",
    geofenceText: "Terlambat Check-in • 09:10 AM",
    tasksDone: 8,
    lateMinutes: 70,
  },
  {
    nik: "10293848",
    nama: "Julia Sari",
    email: "julia.sari@telkomakses.co.id",
    telepon: "0821-3344-5566",
    departemen: "Finance",
    jabatan: "Financial Controller",
    tipeUser: "Telkom",
    unit: "Area 2",
    role: "Staff",
    avatarInitials: "JS",
    avatarBgColor: "bg-teal-100 text-teal-700",
    score: 89,
    scoreTitle: "Kinerja Baik",
    scoreSubtitle: "Laporan anggaran selesai",
    scoreVariant: "good",
    geofenceStatus: "valid_telkom",
    geofenceText: "Valid Area Telkom • 07:55 AM",
    tasksDone: 17,
    lateMinutes: 0,
  },
  {
    nik: "10293849",
    nama: "Qomar Siddiq",
    email: "qomar.s@telkomakses.co.id",
    telepon: "0822-7788-9900",
    departemen: "IT",
    jabatan: "DevOps Engineer",
    tipeUser: "Telkom",
    unit: "Area 1",
    role: "Staff",
    avatarInitials: "QS",
    avatarBgColor: "bg-cyan-100 text-cyan-700",
    score: 87,
    scoreTitle: "Kinerja Baik",
    scoreSubtitle: "Uptime sistem 99.9%",
    scoreVariant: "good",
    geofenceStatus: "valid_telkom",
    geofenceText: "Valid Area Telkom • 08:00 AM",
    tasksDone: 19,
    lateMinutes: 0,
  },
  {
    nik: "10293850",
    nama: "Fajar Nugroho",
    email: "fajar.n@telkomakses.co.id",
    telepon: "0823-1111-2222",
    departemen: "Finance",
    jabatan: "Budget Analyst",
    tipeUser: "Telkom",
    unit: "Area 2",
    role: "Staff",
    avatarInitials: "FN",
    avatarBgColor: "bg-blue-100 text-blue-700",
    score: 93,
    scoreTitle: "Kinerja Sangat Baik",
    scoreSubtitle: "Efisiensi biaya 12%",
    scoreVariant: "high",
    geofenceStatus: "valid_telkom",
    geofenceText: "Valid Area Telkom • 07:48 AM",
    tasksDone: 21,
    lateMinutes: 0,
  },
  {
    nik: "10293851",
    nama: "Dewi Lestari",
    email: "dewi.l@telkomakses.co.id",
    telepon: "0856-3333-4444",
    departemen: "Marketing",
    jabatan: "Corporate Relations",
    tipeUser: "Telkom",
    unit: "Non-Telkom",
    role: "Staff",
    avatarInitials: "DL",
    avatarBgColor: "bg-pink-100 text-pink-700",
    score: 78,
    scoreTitle: "Kinerja Cukup",
    scoreSubtitle: "Progress deal klien B2B",
    scoreVariant: "medium",
    geofenceStatus: "remote_verified",
    geofenceText: "Remote Terverifikasi • 08:21 AM",
    tasksDone: 13,
    lateMinutes: 21,
  },
  {
    nik: "10293852",
    nama: "Citra Dewi",
    email: "citra.d@mitra.telkom.co.id",
    telepon: "0857-5555-6666",
    departemen: "Operations",
    jabatan: "Quality Assurance Mitra",
    tipeUser: "Non-Telkom (Mitra)",
    unit: "Support",
    role: "Staff",
    avatarInitials: "CD",
    avatarBgColor: "bg-orange-100 text-orange-700",
    score: 55,
    scoreTitle: "Perlu Intervensi",
    scoreSubtitle: "Task pending melebihi batas",
    scoreVariant: "low",
    geofenceStatus: "outside_area",
    geofenceText: "Di Luar Area Valid • 08:40 AM",
    tasksDone: 4,
    lateMinutes: 40,
  },
]

export default function Page() {
  const [karyawanList, setKaryawanList] = React.useState<KaryawanItem[]>(initialKaryawan)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFilterPill, setSelectedFilterPill] = React.useState("Semua Sub-Unit")
  const [selectedUser, setSelectedUser] = React.useState<KaryawanItem | null>(null)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")

  // Filter Logic
  const filteredKaryawan = React.useMemo(() => {
    return karyawanList.filter((k) => {
      // Search
      const matchSearch =
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.unit.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter Pill
      let matchPill = true
      if (selectedFilterPill === "Teknisi Area 1") {
        matchPill = k.unit === "Area 1"
      } else if (selectedFilterPill === "Support Offline") {
        matchPill = k.unit === "Support"
      } else if (selectedFilterPill === "Non-Telkom") {
        matchPill = k.tipeUser === "Non-Telkom (Mitra)" || k.unit === "Non-Telkom"
      } else if (selectedFilterPill === "Perlu Intervensi") {
        matchPill = k.scoreVariant === "low" || k.score < 70
      }

      return matchSearch && matchPill
    })
  }, [karyawanList, searchQuery, selectedFilterPill])

  const handleResetPassword = (nik: string, nama: string) => {
    toast.success(`Password untuk ${nama} (NIK: ${nik}) berhasil di-reset ke default!`)
  }

  const handleAddKaryawan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const nama = formData.get("nama") as string
    const nik = formData.get("nik") as string
    const email = formData.get("email") as string
    const telepon = formData.get("telepon") as string
    const departemen = formData.get("departemen") as KaryawanItem["departemen"]
    const jabatan = formData.get("jabatan") as string
    const tipeUser = formData.get("tipeUser") as KaryawanItem["tipeUser"]
    const unit = (formData.get("unit") as string) || "Area 1"

    const initials = nama
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

    const newK: KaryawanItem = {
      nik,
      nama,
      email,
      telepon,
      departemen,
      jabatan,
      tipeUser,
      unit,
      role: "Staff",
      avatarInitials: initials,
      avatarBgColor: "bg-blue-100 text-blue-700",
      score: 85,
      scoreTitle: "Kinerja Baik",
      scoreSubtitle: "Akun baru terdaftar",
      scoreVariant: "good",
      geofenceStatus: "valid_telkom",
      geofenceText: "Valid Area Telkom • 08:00 AM",
      tasksDone: 0,
      lateMinutes: 0,
    }

    setKaryawanList([newK, ...karyawanList])
    setIsAddOpen(false)
    toast.success(`Akun karyawan baru ${nama} berhasil didaftarkan!`)
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
            {/* Main Center Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">

              {/* Header Title & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    Manajemen Karyawan Telkom Akses
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Monitoring kinerja, kehadiran GPS geofencing, dan log aktivitas 17 akun kantor
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative hidden md:block w-56">
                    <SearchIcon className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Cari karyawan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8.5 h-9 text-xs rounded-[8px]"
                    />
                  </div>

                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <Button
                      onClick={() => setIsAddOpen(true)}
                      className="h-9 gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                    >
                      <PlusIcon className="size-4" />
                      Tambah Karyawan
                    </Button>
                    <DialogContent className="sm:max-w-lg p-6 rounded-[8px] border bg-card shadow-lg">
                      <DialogHeader className="pb-2 border-b border-border/60">
                        <DialogTitle className="text-base font-bold text-foreground">
                          Daftarkan Karyawan Baru
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                          Tambahkan akun pegawai tetap Telkom Akses atau mitra operasional ke sistem.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleAddKaryawan} className="flex flex-col gap-4 pt-3 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="nama" className="text-xs font-semibold text-foreground">
                            Nama Lengkap <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="nama"
                            name="nama"
                            placeholder="Contoh: Rian Hidayat"
                            required
                            className="h-9 text-xs rounded-[8px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="nik" className="text-xs font-semibold text-foreground">
                              NIK Unik <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="nik"
                              name="nik"
                              placeholder="Contoh: 10293858"
                              required
                              className="h-9 text-xs font-mono rounded-[8px]"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="telepon" className="text-xs font-semibold text-foreground">
                              No. Telepon / WhatsApp <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="telepon"
                              name="telepon"
                              placeholder="0812-xxxx-xxxx"
                              required
                              className="h-9 text-xs rounded-[8px]"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                            Email Kantor <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nama@telkomakses.co.id"
                            required
                            className="h-9 text-xs rounded-[8px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-foreground">Departemen</Label>
                            <Select name="departemen" defaultValue="IT">
                              <SelectTrigger className="h-9 text-xs rounded-[8px]">
                                <SelectValue placeholder="Pilih Departemen" />
                              </SelectTrigger>
                              <SelectContent className="rounded-[8px] text-xs">
                                <SelectItem value="IT">IT & Network</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="HR">HR & GA</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-foreground">Tipe Akun</Label>
                            <Select name="tipeUser" defaultValue="Telkom">
                              <SelectTrigger className="h-9 text-xs rounded-[8px]">
                                <SelectValue placeholder="Tipe Karyawan" />
                              </SelectTrigger>
                              <SelectContent className="rounded-[8px] text-xs">
                                <SelectItem value="Telkom">Telkom Organik</SelectItem>
                                <SelectItem value="Non-Telkom (Mitra)">Mitra Non-Telkom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="jabatan" className="text-xs font-semibold text-foreground">
                              Jabatan Pekerjaan
                            </Label>
                            <Input
                              id="jabatan"
                              name="jabatan"
                              placeholder="Contoh: Staff Operasional"
                              required
                              className="h-9 text-xs rounded-[8px]"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-foreground">Sub-Unit Area</Label>
                            <Select name="unit" defaultValue="Area 1">
                              <SelectTrigger className="h-9 text-xs rounded-[8px]">
                                <SelectValue placeholder="Pilih Sub-Unit" />
                              </SelectTrigger>
                              <SelectContent className="rounded-[8px] text-xs">
                                <SelectItem value="Area 1">Teknisi Area 1</SelectItem>
                                <SelectItem value="Area 2">Teknisi Area 2</SelectItem>
                                <SelectItem value="Support">Support Offline</SelectItem>
                                <SelectItem value="Non-Telkom">Non-Telkom Partner</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3 mt-1 border-t border-border/60">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddOpen(false)}
                            className="h-9 px-4 text-xs font-semibold rounded-[8px]"
                          >
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            className="h-9 px-5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                          >
                            Simpan & Daftarkan Akun
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Quick Metrics Bar (Matching Telkom Red Design System) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <UsersIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Total Akun Kantor</span>
                      <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                        17 Akun
                      </span>
                    </div>
                    <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                      {karyawanList.length}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Terdaftar di sistem kantor</p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <ShieldCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Telkom Organik</span>
                      <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                        Pegawai Tetap
                      </span>
                    </div>
                    <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                      {karyawanList.filter((k) => k.tipeUser === "Telkom").length}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Pegawai tetap Telkom Akses</p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <Building2Icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Mitra Non-Telkom</span>
                      <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                        Partner
                      </span>
                    </div>
                    <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                      {karyawanList.filter((k) => k.tipeUser === "Non-Telkom (Mitra)").length}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Staff & teknisi mitra</p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Hadir Hari Ini</span>
                      <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                        Presensi GPS
                      </span>
                    </div>
                    <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                      {karyawanList.filter((k) => k.geofenceStatus !== "outside_area").length}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Tercatat clock-in kantor</p>
                  </div>
                </div>
              </div>

              {/* Top Filter Pills Bar (Matching Screenshot Exactly) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                {/* Pills List */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pill 1: Semua Sub-Unit (Active Red) */}
                  <button
                    type="button"
                    onClick={() => setSelectedFilterPill("Semua Sub-Unit")}
                    className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${selectedFilterPill === "Semua Sub-Unit"
                        ? "bg-red-600 text-white shadow-xs"
                        : "border border-zinc-200 dark:border-zinc-800 bg-card text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                  >
                    Semua Sub-Unit ({karyawanList.length})
                  </button>

                  {/* Pill 2: Teknisi Area 1 */}
                  <button
                    type="button"
                    onClick={() => setSelectedFilterPill("Teknisi Area 1")}
                    className={`px-4 py-1.5 rounded-[8px] text-xs font-medium transition-all ${selectedFilterPill === "Teknisi Area 1"
                        ? "bg-red-600 text-white shadow-xs"
                        : "border border-zinc-200 dark:border-zinc-800 bg-card text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                  >
                    Teknisi Area 1
                  </button>

                  {/* Pill 3: Support Offline */}
                  <button
                    type="button"
                    onClick={() => setSelectedFilterPill("Support Offline")}
                    className={`px-4 py-1.5 rounded-[8px] text-xs font-medium transition-all ${selectedFilterPill === "Support Offline"
                        ? "bg-red-600 text-white shadow-xs"
                        : "border border-zinc-200 dark:border-zinc-800 bg-card text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                  >
                    Support Offline
                  </button>

                  {/* Pill 4: Non-Telkom */}
                  <button
                    type="button"
                    onClick={() => setSelectedFilterPill("Non-Telkom")}
                    className={`px-4 py-1.5 rounded-[8px] text-xs font-medium transition-all ${selectedFilterPill === "Non-Telkom"
                        ? "bg-red-600 text-white shadow-xs"
                        : "border border-zinc-200 dark:border-zinc-800 bg-card text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                  >
                    Non-Telkom
                  </button>

                  {/* Pill 5: Perlu Intervensi / Low Score (Red Highlighted with Alert Icon) */}
                  <button
                    type="button"
                    onClick={() => setSelectedFilterPill("Perlu Intervensi")}
                    className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition-all ${selectedFilterPill === "Perlu Intervensi"
                        ? "bg-red-700 text-white shadow-xs ring-2 ring-red-400"
                        : "bg-red-100/70 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-200/60"
                      }`}
                  >
                    <AlertTriangleIcon className="size-3.5 text-red-600" />
                    <span>Perlu Intervensi / Low Score</span>
                  </button>
                </div>

                {/* View Mode Toggle (Grid / List) */}
                <div className="flex items-center rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-card p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    title="Tampilan Grid"
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "grid"
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        : "text-zinc-400 hover:text-zinc-700"
                      }`}
                  >
                    <LayoutGridIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    title="Tampilan List"
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "list"
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        : "text-zinc-400 hover:text-zinc-700"
                      }`}
                  >
                    <ListIcon className="size-4" />
                  </button>
                </div>
              </div>

              {/* View Mode: GRID vs LIST */}
              {viewMode === "grid" ? (
                /* Employee Cards Grid (Exact Design from Screenshot) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
                  {filteredKaryawan.map((karyawan) => {
                    const isLowScore = karyawan.scoreVariant === "low" || karyawan.score < 70
                    const isHighScore = karyawan.scoreVariant === "high" || karyawan.score >= 90
                    const isGoodScore = karyawan.scoreVariant === "good" || (karyawan.score >= 80 && karyawan.score < 90)

                    return (
                      <div
                        key={karyawan.nik}
                        className="rounded-[8px] border border-zinc-200/90 dark:border-zinc-800 bg-card p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        {/* 1. Header: Avatar + Name + NIK & Unit Badge + 3-dots */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {/* Avatar Circle with Initials */}
                            <div
                              className={`size-10.5 rounded-full ${karyawan.avatarBgColor || "bg-indigo-100 text-indigo-700"
                                } font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {karyawan.avatarInitials}
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                {karyawan.nama}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11px] font-mono text-zinc-500">
                                  NIK: {karyawan.nik}
                                </span>
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none">
                                  {karyawan.unit}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Options Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger render={
                              <Button variant="ghost" size="icon" className="size-7 text-zinc-400 hover:text-zinc-700 -mr-2">
                                <MoreVerticalIcon className="size-4" />
                              </Button>
                            } />
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => setSelectedUser(karyawan)}>
                                Lihat Detail Log
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(karyawan.nik, karyawan.nama)}>
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">Nonaktifkan Akun</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* 2. Performance Ring & Score Description */}
                        <div className="flex items-center gap-3.5">
                          {/* Circular Ring Badge */}
                          <div
                            className={`size-11.5 rounded-full border-[2.5px] flex items-center justify-center font-bold text-sm shrink-0 ${isHighScore
                                ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                                : isLowScore
                                  ? "border-red-700 text-red-800 dark:text-red-400 dark:border-red-600"
                                  : isGoodScore
                                    ? "border-emerald-600 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                                    : "border-amber-600 text-amber-800 dark:text-amber-400 dark:border-amber-500"
                              }`}
                          >
                            {karyawan.score}
                          </div>

                          {/* Text Title & Subtitle */}
                          <div>
                            <p
                              className={`text-xs font-bold leading-snug ${isLowScore ? "text-red-700 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
                                }`}
                            >
                              {karyawan.scoreTitle}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {karyawan.scoreSubtitle}
                            </p>
                          </div>
                        </div>

                        {/* 3. Geofence / Presence Status Banner */}
                        <div>
                          {karyawan.geofenceStatus === "valid_telkom" && (
                            <div className="rounded-[8px] bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 p-2.5 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                              <CheckCircleIcon className="size-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-[11px] truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}

                          {karyawan.geofenceStatus === "outside_area" && (
                            <div className="rounded-[8px] bg-red-50/80 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 p-2.5 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
                              <MapPinOffIcon className="size-4 text-red-600 shrink-0" />
                              <span className="font-semibold text-[11px] truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}

                          {karyawan.geofenceStatus === "remote_verified" && (
                            <div className="rounded-[8px] bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 p-2.5 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                              <CheckCircleIcon className="size-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-[11px] truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}

                          {karyawan.geofenceStatus === "late_checkin" && (
                            <div className="rounded-[8px] bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-2.5 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
                              <ClockIcon className="size-4 text-amber-600 shrink-0" />
                              <span className="font-semibold text-[11px] truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 4. Stats Footer: Tasks Done | Late (Min) | Role Badge */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex items-center justify-between text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {karyawan.tasksDone}
                            </span>
                            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                              Tasks Done
                            </span>
                          </div>

                          <div className="flex flex-col items-center">
                            <span
                              className={`text-sm font-bold ${karyawan.lateMinutes > 0
                                  ? isLowScore
                                    ? "text-red-600"
                                    : "text-amber-600"
                                  : "text-zinc-900 dark:text-zinc-100"
                                }`}
                            >
                              {karyawan.lateMinutes}
                            </span>
                            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                              Late (Min)
                            </span>
                          </div>

                          <div>
                            {karyawan.role === "Admin" ? (
                              <span className="bg-red-600 text-white font-bold px-2.5 py-0.5 rounded text-[10px]">
                                Admin
                              </span>
                            ) : (
                              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold px-2 py-0.5 rounded text-[10px]">
                                Staff
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 5. Bottom Action Button: Lihat Detail Log */}
                        <div>
                          {isLowScore ? (
                            <button
                              type="button"
                              onClick={() => setSelectedUser(karyawan)}
                              className="w-full h-9 rounded-[8px] border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/50 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-2xs"
                            >
                              Lihat Detail Log
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedUser(karyawan)}
                              className="w-full h-9 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                            >
                              Lihat Detail Log
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Employee Cards LIST View */
                <div className="flex flex-col gap-3">
                  {filteredKaryawan.map((karyawan) => {
                    const isLowScore = karyawan.scoreVariant === "low" || karyawan.score < 70
                    const isHighScore = karyawan.scoreVariant === "high" || karyawan.score >= 90
                    const isGoodScore = karyawan.scoreVariant === "good" || (karyawan.score >= 80 && karyawan.score < 90)

                    return (
                      <div
                        key={karyawan.nik}
                        className="rounded-[8px] border border-zinc-200/90 dark:border-zinc-800 bg-card p-4 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        {/* Left: Avatar + Name + NIK + Unit */}
                        <div className="flex items-center gap-3.5 min-w-[220px]">
                          <div
                            className={`size-11 rounded-full ${karyawan.avatarBgColor || "bg-indigo-100 text-indigo-700"
                              } font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            {karyawan.avatarInitials}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {karyawan.nama}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-mono text-zinc-500">
                                NIK: {karyawan.nik}
                              </span>
                              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none">
                                {karyawan.unit}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 block mt-0.5">
                              {karyawan.jabatan}
                            </span>
                          </div>
                        </div>

                        {/* Middle 1: Score Badge */}
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div
                            className={`size-10.5 rounded-full border-[2.5px] flex items-center justify-center font-bold text-xs shrink-0 ${isHighScore
                                ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                                : isLowScore
                                  ? "border-red-700 text-red-800 dark:text-red-400 dark:border-red-600"
                                  : isGoodScore
                                    ? "border-emerald-600 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500"
                                    : "border-amber-600 text-amber-800 dark:text-amber-400 dark:border-amber-500"
                              }`}
                          >
                            {karyawan.score}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold ${isLowScore ? "text-red-700 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
                                }`}
                            >
                              {karyawan.scoreTitle}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {karyawan.scoreSubtitle}
                            </p>
                          </div>
                        </div>

                        {/* Middle 2: Geofence Status */}
                        <div className="min-w-[210px]">
                          {karyawan.geofenceStatus === "valid_telkom" && (
                            <div className="rounded-[8px] bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 px-3 py-2 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                              <CheckCircleIcon className="size-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-xs truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}

                          {karyawan.geofenceStatus === "outside_area" && (
                            <div className="rounded-[8px] bg-red-50/80 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 px-3 py-2 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
                              <MapPinOffIcon className="size-4 text-red-600 shrink-0" />
                              <span className="font-semibold text-xs truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}

                          {karyawan.geofenceStatus === "remote_verified" && (
                            <div className="rounded-[8px] bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 px-3 py-2 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                              <CheckCircleIcon className="size-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-xs truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}

                          {karyawan.geofenceStatus === "late_checkin" && (
                            <div className="rounded-[8px] bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 px-3 py-2 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
                              <ClockIcon className="size-4 text-amber-600 shrink-0" />
                              <span className="font-semibold text-xs truncate">
                                {karyawan.geofenceText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right Stats & Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-5">
                          <div className="flex items-center gap-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {karyawan.tasksDone}
                              </span>
                              <span className="text-[9px] font-semibold text-zinc-400 uppercase">
                                Tasks
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-xs font-bold ${karyawan.lateMinutes > 0
                                    ? isLowScore
                                      ? "text-red-600"
                                      : "text-amber-600"
                                    : "text-zinc-900 dark:text-zinc-100"
                                  }`}
                              >
                                {karyawan.lateMinutes}m
                              </span>
                              <span className="text-[9px] font-semibold text-zinc-400 uppercase">
                                Late
                              </span>
                            </div>
                            <div>
                              {karyawan.role === "Admin" ? (
                                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                                  Admin
                                </span>
                              ) : (
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold px-2 py-0.5 rounded text-[10px]">
                                  Staff
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLowScore ? (
                              <button
                                type="button"
                                onClick={() => setSelectedUser(karyawan)}
                                className="h-8.5 px-3.5 rounded-[8px] border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/50 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 transition-colors shadow-2xs"
                              >
                                Lihat Detail Log
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedUser(karyawan)}
                                className="h-8.5 px-3.5 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors shadow-2xs"
                              >
                                Lihat Detail Log
                              </button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger render={
                                <Button variant="ghost" size="icon" className="size-8 text-zinc-400 hover:text-zinc-700">
                                  <MoreVerticalIcon className="size-4" />
                                </Button>
                              } />
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => setSelectedUser(karyawan)}>
                                  Lihat Detail Log
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(karyawan.nik, karyawan.nama)}>
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive">Nonaktifkan Akun</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Detail Log Modal / Dialog */}
              {selectedUser && (
                <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Detail Log Karyawan - {selectedUser.nama}</DialogTitle>
                      <DialogDescription>
                        NIK: {selectedUser.nik} &bull; Unit: {selectedUser.unit} &bull; {selectedUser.tipeUser}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2 text-xs">
                      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-[8px]">
                        <div
                          className={`size-12 rounded-[8px] ${selectedUser.avatarBgColor || "bg-primary text-primary-foreground"
                            } font-bold text-base flex items-center justify-center shadow-xs`}
                        >
                          {selectedUser.avatarInitials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{selectedUser.nama}</h4>
                          <span className="text-muted-foreground">{selectedUser.jabatan}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border rounded-[8px]">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Skor Kinerja</span>
                          <span className="font-mono font-bold text-base text-foreground">{selectedUser.score} / 100</span>
                          <span className="text-[10px] text-muted-foreground block">{selectedUser.scoreTitle}</span>
                        </div>
                        <div className="p-3 border rounded-[8px]">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Status Presensi</span>
                          <span className="font-semibold text-xs text-foreground block mt-1">{selectedUser.geofenceText}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 p-3 border rounded-[8px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-semibold">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">No. Telepon:</span>
                          <span className="font-semibold">{selectedUser.telepon}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tugas Selesai:</span>
                          <span className="font-semibold">{selectedUser.tasksDone} Tugas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Keterlambatan:</span>
                          <span className="font-semibold text-red-600">{selectedUser.lateMinutes} Menit</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(selectedUser.nik, selectedUser.nama)}
                          className="gap-1 text-xs"
                        >
                          <KeyRoundIcon className="size-3.5" /> Reset Password
                        </Button>
                        <Button size="sm" onClick={() => setSelectedUser(null)} className="text-xs bg-red-600 hover:bg-red-700 text-white">
                          Tutup
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

            </div>

            {/* Integrated Right AI Column */}
            <AiIntegratedPanel />
          </div>
        </SidebarInset>
      </AiPanelProvider>
    </SidebarProvider>
  )
}
