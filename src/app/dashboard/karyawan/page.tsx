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
  XCircleIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  MoreVerticalIcon,
  UserCheckIcon,
  KeyRoundIcon,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  statusPresensi: "Hadir" | "Terlambat" | "Izin/Cuti" | "Absen"
  taskAktif: number
  clockIn: string | null
}

const initialKaryawan: KaryawanItem[] = [
  { nik: "10293841", nama: "Andi Pratama", email: "andi.pratama@telkomakses.co.id", telepon: "0812-3456-7890", departemen: "IT", jabatan: "Senior Fiber Engineer", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 3, clockIn: "07:58" },
  { nik: "10293842", nama: "Bambang Susanto", email: "bambang.s@mitra.telkom.co.id", telepon: "0813-9876-5432", departemen: "Operations", jabatan: "Teknisi Lapangan", tipeUser: "Non-Telkom (Mitra)", statusPresensi: "Hadir", taskAktif: 2, clockIn: "08:02" },
  { nik: "10293843", nama: "Irfan Maulana", email: "irfan.m@telkomakses.co.id", telepon: "0811-2233-4455", departemen: "IT", jabatan: "Backend Network Specialist", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 2, clockIn: "08:10" },
  { nik: "10293844", nama: "Kevin Pratama", email: "kevin.p@telkomakses.co.id", telepon: "0815-6677-8899", departemen: "IT", jabatan: "Hardware & OLT Technician", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 2, clockIn: "07:59" },
  { nik: "10293845", nama: "Siti Rahayu", email: "siti.rahayu@telkomakses.co.id", telepon: "0817-1122-3344", departemen: "Finance", jabatan: "Financial Analyst", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 1, clockIn: "08:02" },
  { nik: "10293846", nama: "Rudi Hermawan", email: "rudi.h@telkomakses.co.id", telepon: "0818-5544-3322", departemen: "HR", jabatan: "HR & Field Supervisor", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 2, clockIn: "07:55" },
  { nik: "10293847", nama: "Oscar Budiman", email: "oscar.b@mitra.telkom.co.id", telepon: "0819-9988-7766", departemen: "Operations", jabatan: "Teknisi Tower & ODP", tipeUser: "Non-Telkom (Mitra)", statusPresensi: "Terlambat", taskAktif: 2, clockIn: "09:10" },
  { nik: "10293848", nama: "Julia Sari", email: "julia.sari@telkomakses.co.id", telepon: "0821-3344-5566", departemen: "Operations", jabatan: "Operations Coordinator", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 2, clockIn: "08:45" },
  { nik: "10293849", nama: "Qomar Siddiq", email: "qomar.s@telkomakses.co.id", telepon: "0822-7788-9900", departemen: "IT", jabatan: "DevOps & Infrastructure", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 2, clockIn: "08:15" },
  { nik: "10293850", nama: "Fajar Nugroho", email: "fajar.n@telkomakses.co.id", telepon: "0823-1111-2222", departemen: "Finance", jabatan: "Budget Analyst", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 1, clockIn: "07:50" },
  { nik: "10293851", nama: "Dewi Lestari", email: "dewi.l@telkomakses.co.id", telepon: "0856-3333-4444", departemen: "Marketing", jabatan: "Marketing Officer", tipeUser: "Telkom", statusPresensi: "Terlambat", taskAktif: 1, clockIn: "08:21" },
  { nik: "10293852", nama: "Citra Dewi", email: "citra.d@mitra.telkom.co.id", telepon: "0857-5555-6666", departemen: "IT", jabatan: "QA Field Tester", tipeUser: "Non-Telkom (Mitra)", statusPresensi: "Absen", taskAktif: 0, clockIn: null },
  { nik: "10293853", nama: "Gani Fauzan", email: "gani.f@telkomakses.co.id", telepon: "0858-7777-8888", departemen: "HR", jabatan: "Recruitment Coordinator", tipeUser: "Telkom", statusPresensi: "Izin/Cuti", taskAktif: 0, clockIn: null },
  { nik: "10293854", nama: "Hana Pertiwi", email: "hana.p@telkomakses.co.id", telepon: "0812-9900-1122", departemen: "Marketing", jabatan: "Content Specialist", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 1, clockIn: "08:05" },
  { nik: "10293855", nama: "Lia Andriani", email: "lia.a@telkomakses.co.id", telepon: "0813-2233-4455", departemen: "Finance", jabatan: "Finance Staff", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 1, clockIn: "08:01" },
  { nik: "10293856", nama: "Mukhlis Amir", email: "mukhlis.a@mitra.telkom.co.id", telepon: "0814-5566-7788", departemen: "HR", jabatan: "Field Trainer", tipeUser: "Non-Telkom (Mitra)", statusPresensi: "Izin/Cuti", taskAktif: 1, clockIn: null },
  { nik: "10293857", nama: "Nina Wahyuni", email: "nina.w@telkomakses.co.id", telepon: "0815-8899-0011", departemen: "Marketing", jabatan: "Graphic Designer", tipeUser: "Telkom", statusPresensi: "Hadir", taskAktif: 1, clockIn: "08:00" },
]

export default function KaryawanPage() {
  const [karyawanList, setKaryawanList] = React.useState<KaryawanItem[]>(initialKaryawan)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDept, setSelectedDept] = React.useState("Semua")
  const [selectedTipe, setSelectedTipe] = React.useState("Semua")
  const [selectedUser, setSelectedUser] = React.useState<KaryawanItem | null>(null)
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  const filteredKaryawan = React.useMemo(() => {
    return karyawanList.filter((k) => {
      const matchSearch =
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.nik.includes(searchQuery) ||
        k.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.jabatan.toLowerCase().includes(searchQuery.toLowerCase())

      const matchDept = selectedDept === "Semua" || k.departemen === selectedDept
      const matchTipe =
        selectedTipe === "Semua"
          ? true
          : selectedTipe === "Telkom"
          ? k.tipeUser === "Telkom"
          : k.tipeUser === "Non-Telkom (Mitra)"

      return matchSearch && matchDept && matchTipe
    })
  }, [karyawanList, searchQuery, selectedDept, selectedTipe])

  const handleAddKaryawan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nama = formData.get("nama") as string
    const nik = formData.get("nik") as string
    const email = formData.get("email") as string
    const telepon = formData.get("telepon") as string
    const departemen = formData.get("departemen") as KaryawanItem["departemen"]
    const jabatan = formData.get("jabatan") as string
    const tipeUser = formData.get("tipeUser") as KaryawanItem["tipeUser"]

    const newKaryawan: KaryawanItem = {
      nik: nik || `102938${String(karyawanList.length + 1).padStart(2, "0")}`,
      nama,
      email,
      telepon: telepon || "0812-0000-0000",
      departemen,
      jabatan,
      tipeUser,
      statusPresensi: "Hadir",
      taskAktif: 0,
      clockIn: "08:00",
    }

    setKaryawanList((prev) => [newKaryawan, ...prev])
    setIsAddOpen(false)
    toast.success(`Akun karyawan ${nama} (NIK: ${newKaryawan.nik}) berhasil didaftarkan!`)
  }

  const handleResetPassword = (nik: string, nama: string) => {
    toast.success(`Link reset password telah dikirim ke email karyawan ${nama}!`)
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
          {/* Header & Page Title */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Manajemen Karyawan
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daftar akun Karyawan Telkom & Mitra Non-Telkom terregistrasi
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <Button
                  onClick={() => setIsAddOpen(true)}
                  className="h-9 text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs"
                >
                  <PlusIcon className="size-4" /> Tambah Karyawan Baru
                </Button>
                <SheetContent className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Pendaftaran Akun Karyawan</SheetTitle>
                    <SheetDescription>
                      Daftarkan NIK karyawan. Karyawan dapat langsung login menggunakan NIK ini.
                    </SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleAddKaryawan} className="flex flex-col gap-4 p-4 pt-0">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nik" className="text-xs font-semibold">
                        NIK (Nomor Induk Karyawan)
                      </Label>
                      <Input id="nik" name="nik" placeholder="Contoh: 10293858" required className="h-9" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nama" className="text-xs font-semibold">
                        Nama Lengkap
                      </Label>
                      <Input id="nama" name="nama" placeholder="Contoh: Rizky Febrian" required className="h-9" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Email Resmi
                      </Label>
                      <Input id="email" name="email" type="email" placeholder="karyawan@telkomakses.co.id" required className="h-9" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="departemen" className="text-xs font-semibold">
                          Departemen
                        </Label>
                        <Select name="departemen" defaultValue="IT">
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Departemen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tipeUser" className="text-xs font-semibold">
                          Tipe User
                        </Label>
                        <Select name="tipeUser" defaultValue="Telkom">
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tipe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Telkom">Karyawan Telkom</SelectItem>
                            <SelectItem value="Non-Telkom (Mitra)">Non-Telkom (Mitra)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="jabatan" className="text-xs font-semibold">
                        Jabatan Pekerjaan
                      </Label>
                      <Input id="jabatan" name="jabatan" placeholder="Contoh: Senior Network Specialist" required className="h-9" />
                    </div>
                    <Button type="submit" className="mt-2 w-full h-10 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                      Daftarkan Akun
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Quick Metrics Bar (Matching Telkom Red Design System) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <UsersIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Akun Kantor</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-400">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  {karyawanList.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Terdaftar di sistem presensi</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <ShieldCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Karyawan Telkom</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-400">
                    Organik
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  {karyawanList.filter((k) => k.tipeUser === "Telkom").length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Pegawai tetap Telkom Akses</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <Building2Icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Mitra Non-Telkom</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-400">
                    Partner
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  {karyawanList.filter((k) => k.tipeUser === "Non-Telkom (Mitra)").length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Teknisi & staf mitra lapangan</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <UserCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Hadir Hari Ini</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-400">
                    Presensi
                  </span>
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                  {karyawanList.filter((k) => k.statusPresensi === "Hadir" || k.statusPresensi === "Terlambat").length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Tercatat clock-in hari ini</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari NIK, nama, jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-muted-foreground mr-1">Tipe:</span>
                {["Semua", "Telkom", "Non-Telkom"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTipe(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedTipe === t
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKaryawan.map((karyawan) => (
              <Card key={karyawan.nik} className="group relative overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar Initials */}
                    <div className="size-11 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-xs">
                      {karyawan.nama
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {karyawan.nama}
                      </h3>
                      <span className="text-[11px] font-mono text-muted-foreground block">
                        NIK: {karyawan.nik}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 text-muted-foreground" />}>
                      <MoreVerticalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => setSelectedUser(karyawan)}>
                        Lihat Detail Profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(karyawan.nik, karyawan.nama)}>
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">Nonaktifkan Akun</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 text-xs">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                      {karyawan.departemen}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        karyawan.tipeUser === "Telkom"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                      }
                    >
                      {karyawan.tipeUser}
                    </Badge>
                  </div>

                  {/* Role */}
                  <span className="font-semibold text-foreground">{karyawan.jabatan}</span>

                  {/* Info list */}
                  <div className="flex flex-col gap-1.5 text-muted-foreground pt-1 border-t">
                    <div className="flex items-center gap-2">
                      <MailIcon className="size-3.5 text-primary" />
                      <span className="truncate">{karyawan.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="size-3.5 text-primary" />
                      <span>{karyawan.telepon}</span>
                    </div>
                  </div>

                  {/* Bottom Bar: Clock in & Task count */}
                  <div className="flex items-center justify-between pt-2 border-t font-medium">
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        Clock In: <strong className="text-foreground">{karyawan.clockIn || "—"}</strong>
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {karyawan.taskAktif} Task Aktif
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail Dialog */}
          {selectedUser && (
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Profil Karyawan - NIK {selectedUser.nik}</DialogTitle>
                  <DialogDescription>Detail informasi akun presensi & pekerjaan.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                    <div className="size-12 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center">
                      {selectedUser.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{selectedUser.nama}</h4>
                      <span className="text-muted-foreground">{selectedUser.jabatan}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-xl">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">NIK</span>
                      <span className="font-mono font-bold text-sm text-foreground">{selectedUser.nik}</span>
                    </div>
                    <div className="p-3 border rounded-xl">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Tipe User</span>
                      <span className="font-bold text-sm text-foreground">{selectedUser.tipeUser}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 border rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-semibold">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No. Telepon:</span>
                      <span className="font-semibold">{selectedUser.telepon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departemen:</span>
                      <span className="font-semibold">{selectedUser.departemen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Presensi Hari Ini:</span>
                      <span className="font-semibold text-emerald-600">{selectedUser.statusPresensi} ({selectedUser.clockIn || "—"})</span>
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
                    <Button size="sm" onClick={() => setSelectedUser(null)} className="text-xs">
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
