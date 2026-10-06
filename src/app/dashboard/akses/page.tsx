"use client"

import * as React from "react"
import {
  ShieldCheckIcon,
  UsersIcon,
  KeyRoundIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MoreVerticalIcon,
  LockIcon,
  UnlockIcon,
  FileSpreadsheetIcon,
  UserCheckIcon,
  HistoryIcon,
  SparklesIcon,
  ChevronRightIcon,
  SlidersHorizontalIcon,
  ChevronDownIcon,
  CheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AiPanelProvider } from "@/components/dashboard/ai-panel-context"
import { AiIntegratedPanel } from "@/components/dashboard/ai-integrated-panel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const roleData = [
  {
    id: "r1",
    name: "Super Admin",
    description: "Akses penuh tanpa batas ke seluruh modul operasional, audit, integrasi sistem, dan manajemen hak akses.",
    userCount: 4,
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/50",
    badgeColor: "bg-red-600 text-white",
  },
  {
    id: "r2",
    name: "Supervisor Wilayah (Ops Lead)",
    description: "Pengawasan tugas lapangan, persetujuan lembur, verifikasi nota material ODP, dan pemantauan SLA regional.",
    userCount: 18,
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50",
    badgeColor: "bg-blue-600 text-white",
  },
  {
    id: "r3",
    name: "Dispatcher & Helpdesk Lapangan",
    description: "Pembuatan tiket perbaikan, dispatch teknisi darurat, assign penugasan, dan pelacakan live geofence.",
    userCount: 26,
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50",
    badgeColor: "bg-amber-600 text-white",
  },
  {
    id: "r4",
    name: "Auditor HR & Compliance",
    description: "Akses baca dan unduh seluruh laporan kehadiran, kepatuhan geofencing, serta rekapitulasi kinerja karyawan.",
    userCount: 8,
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50",
    badgeColor: "bg-purple-600 text-white",
  },
  {
    id: "r5",
    name: "Teknisi Lapangan / Mitra",
    description: "Akses mobile app: input presensi swafoto geofence, submit bukti nota ODP, update progres tiket perbaikan.",
    userCount: 112,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/50",
    badgeColor: "bg-emerald-600 text-white",
  },
]

const modulesList = [
  {
    category: "Task Management & Tiket",
    permissions: [
      { id: "p_task_view", name: "Lihat Seluruh Daftar Task & Tiket", superAdmin: true, supervisor: true, dispatcher: true, auditor: true, teknisi: false },
      { id: "p_task_create", name: "Buat & Dispatch Penugasan Baru", superAdmin: true, supervisor: true, dispatcher: true, auditor: false, teknisi: false },
      { id: "p_task_reassign", name: "Re-assign Teknisi Lapangan / Mitra", superAdmin: true, supervisor: true, dispatcher: true, auditor: false, teknisi: false },
      { id: "p_task_delete", name: "Hapus / Batalkan Tiket Tugas", superAdmin: true, supervisor: false, dispatcher: false, auditor: false, teknisi: false },
    ],
  },
  {
    category: "Presensi, Geofence & Shift",
    permissions: [
      { id: "p_att_view", name: "Pantau Real-time Geofence Map", superAdmin: true, supervisor: true, dispatcher: true, auditor: true, teknisi: false },
      { id: "p_att_override", name: "Override / Koreksi Presensi Manual", superAdmin: true, supervisor: true, dispatcher: false, auditor: false, teknisi: false },
      { id: "p_att_export", name: "Export Rekap Kehadiran Excel/PDF", superAdmin: true, supervisor: true, dispatcher: false, auditor: true, teknisi: false },
    ],
  },
  {
    category: "Verifikasi Dokumen & Nota Material ODP",
    permissions: [
      { id: "p_doc_verify", name: "Verifikasi & Approve Nota / Foto ODP", superAdmin: true, supervisor: true, dispatcher: false, auditor: false, teknisi: false },
      { id: "p_doc_reject", name: "Tolak Bukti & Minta Upload Ulang", superAdmin: true, supervisor: true, dispatcher: false, auditor: false, teknisi: false },
    ],
  },
  {
    category: "WorkPulse AI Assistant & Analytics",
    permissions: [
      { id: "p_ai_chat", name: "Akses Penuh Chat AI Assistant", superAdmin: true, supervisor: true, dispatcher: true, auditor: true, teknisi: false },
      { id: "p_ai_export", name: "Export Rekomendasi Mitigasi SLA", superAdmin: true, supervisor: true, dispatcher: false, auditor: true, teknisi: false },
    ],
  },
  {
    category: "Konfigurasi Sistem, API & Hak Akses",
    permissions: [
      { id: "p_sys_roles", name: "Kelola Role & Hak Akses Staf", superAdmin: true, supervisor: false, dispatcher: false, auditor: false, teknisi: false },
      { id: "p_sys_api", name: "Kelola API Keys & Webhooks NMS", superAdmin: true, supervisor: false, dispatcher: false, auditor: false, teknisi: false },
    ],
  },
]

const usersList = [
  { id: "usr-1", name: "Budi Admin", nik: "TA-99021", email: "admin@telkomakses.co.id", role: "Super Admin", regional: "Kantor Pusat / Nasional", status: true, lastLogin: "Hari Ini, 20:05 WIB" },
  { id: "usr-2", name: "Hendra Wijaya", nik: "TA-88102", email: "hendra.w@telkomakses.co.id", role: "Supervisor Wilayah (Ops Lead)", regional: "Regional 2 - Jakarta Pusat", status: true, lastLogin: "Hari Ini, 19:40 WIB" },
  { id: "usr-3", name: "Siti Rahayu", nik: "TA-77291", email: "siti.rahayu@telkomakses.co.id", role: "Auditor HR & Compliance", regional: "Head Office HR", status: true, lastLogin: "Kemarin, 16:15 WIB" },
  { id: "usr-4", name: "Reza Pratama", nik: "TA-66381", email: "reza.dispatcher@telkomakses.co.id", role: "Dispatcher & Helpdesk Lapangan", regional: "Area Depok - Bogor", status: true, lastLogin: "Hari Ini, 18:22 WIB" },
  { id: "usr-5", name: "Andi Pratama", nik: "TA-55102", email: "andi.p@telkomakses.co.id", role: "Teknisi Lapangan / Mitra", regional: "STO Gambir", status: true, lastLogin: "Hari Ini, 17:10 WIB" },
  { id: "usr-6", name: "Kevin Sanjaya", nik: "TA-44910", email: "kevin.s@telkomakses.co.id", role: "Teknisi Lapangan / Mitra", regional: "STO Cilandak", status: false, lastLogin: "3 Hari Lalu" },
]

export default function AccessControlPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState("all")

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.nik.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter
    return matchesSearch && matchesRole
  })

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
            {/* Center Content Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-6 pb-12">
              
              {/* Page Title & Main Action */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
                    <ShieldCheckIcon className="size-7 text-red-600" />
                    Hak Akses & Role Management
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atur izin Role-Based Access Control (RBAC), matriks modul operasional, dan status akses akun staf Telkom Akses.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Membuka draf penambahan role baru...")}
                    className="h-9 gap-1.5 text-xs font-semibold rounded-[8px]"
                  >
                    <PlusIcon className="size-3.5" /> Tambah Role
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.info("Membuka form undangan pengguna baru...")}
                    className="h-9 gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                  >
                    <UserCheckIcon className="size-3.5" /> Tambah Pengguna
                  </Button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">Total Akun Terdaftar</span>
                    <UsersIcon className="size-4 text-red-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">168</span>
                    <span className="text-xs text-emerald-600 font-semibold">162 Aktif</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Tersebar di 5 Regional STO</p>
                </div>

                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">Tingkat Role Aktif</span>
                    <KeyRoundIcon className="size-4 text-blue-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">5 Role</span>
                    <span className="text-xs text-blue-600 font-semibold">Terstandar</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Role-Based Access Control</p>
                </div>

                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">Enforcement 2FA / SSO</span>
                    <LockIcon className="size-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">98.2%</span>
                    <span className="text-xs text-emerald-600 font-semibold">Aman</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Menggunakan Telkom SSO</p>
                </div>

                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">Audit Izin (7 Hari)</span>
                    <HistoryIcon className="size-4 text-amber-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">14 Log</span>
                    <span className="text-xs text-muted-foreground font-semibold">0 Anomali</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Seluruh perubahan tercatat</p>
                </div>
              </div>

              {/* Main Tabs Container */}
              <Tabs defaultValue="matrix" className="w-full space-y-4">
                <TabsList className="h-10 bg-muted/60 p-1 rounded-[8px]">
                  <TabsTrigger value="matrix" className="rounded-[8px] text-xs font-semibold px-4">
                    Matriks Izin Modul
                  </TabsTrigger>
                  <TabsTrigger value="users" className="rounded-[8px] text-xs font-semibold px-4">
                    Daftar Pengguna ({usersList.length})
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="rounded-[8px] text-xs font-semibold px-4">
                    Struktur Role ({roleData.length})
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: Matriks Izin Modul */}
                <TabsContent value="matrix" className="space-y-4">
                  <div className="rounded-[8px] border bg-card overflow-hidden shadow-2xs">
                    <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Matriks Hak Akses per Modul</h3>
                        <p className="text-xs text-muted-foreground">Daftar perizinan akses data dan eksekusi aksi di seluruh aplikasi.</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => toast.success("Konfigurasi hak akses matriks berhasil diperbarui!")}
                        className="h-8 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                      >
                        Simpan Perubahan
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                            <th className="p-3.5 pl-4 w-[38%]">Fitur & Modul Operasional</th>
                            <th className="p-3.5 text-center">Super Admin</th>
                            <th className="p-3.5 text-center">Supervisor</th>
                            <th className="p-3.5 text-center">Dispatcher</th>
                            <th className="p-3.5 text-center">Auditor</th>
                            <th className="p-3.5 text-center pr-4">Teknisi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {modulesList.map((mod, modIdx) => (
                            <React.Fragment key={modIdx}>
                              <tr className="bg-muted/15 font-bold text-[11px] text-foreground">
                                <td colSpan={6} className="p-2.5 pl-4 uppercase tracking-wider text-muted-foreground">
                                  {mod.category}
                                </td>
                              </tr>
                              {mod.permissions.map((perm) => (
                                <tr key={perm.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="p-3 pl-6 font-medium text-foreground">
                                    {perm.name}
                                  </td>
                                  <td className="p-3 text-center">
                                    <input type="checkbox" defaultChecked={perm.superAdmin} className="accent-red-600 size-4 rounded cursor-pointer" />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input type="checkbox" defaultChecked={perm.supervisor} className="accent-red-600 size-4 rounded cursor-pointer" />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input type="checkbox" defaultChecked={perm.dispatcher} className="accent-red-600 size-4 rounded cursor-pointer" />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input type="checkbox" defaultChecked={perm.auditor} className="accent-red-600 size-4 rounded cursor-pointer" />
                                  </td>
                                  <td className="p-3 text-center pr-4">
                                    <input type="checkbox" defaultChecked={perm.teknisi} className="accent-red-600 size-4 rounded cursor-pointer" />
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: Daftar Pengguna */}
                <TabsContent value="users" className="space-y-4">
                  <div className="rounded-[8px] border bg-card p-4 shadow-2xs flex flex-col gap-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari nama, NIK, atau email staf..."
                          className="w-full h-9 pl-9 pr-3 rounded-[8px] border bg-background text-xs outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="outline"
                                className="h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                              >
                                <FilterIcon className="size-3.5 text-muted-foreground" />
                                <span>
                                  {selectedRoleFilter === "all"
                                    ? `Semua Role (${usersList.length})`
                                    : selectedRoleFilter === "Supervisor Wilayah (Ops Lead)"
                                    ? "Supervisor Wilayah"
                                    : selectedRoleFilter === "Dispatcher & Helpdesk Lapangan"
                                    ? "Dispatcher Lapangan"
                                    : selectedRoleFilter === "Auditor HR & Compliance"
                                    ? "Auditor HR"
                                    : selectedRoleFilter === "Teknisi Lapangan / Mitra"
                                    ? "Teknisi Lapangan"
                                    : selectedRoleFilter}
                                </span>
                                <ChevronDownIcon className="size-3.5 text-muted-foreground opacity-60 ml-1" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
                            {[
                              { value: "all", label: `Semua Role (${usersList.length})` },
                              { value: "Super Admin", label: "Super Admin" },
                              { value: "Supervisor Wilayah (Ops Lead)", label: "Supervisor Wilayah" },
                              { value: "Dispatcher & Helpdesk Lapangan", label: "Dispatcher Lapangan" },
                              { value: "Auditor HR & Compliance", label: "Auditor HR" },
                              { value: "Teknisi Lapangan / Mitra", label: "Teknisi Lapangan" },
                            ].map((item) => (
                              <DropdownMenuItem
                                key={item.value}
                                onClick={() => setSelectedRoleFilter(item.value)}
                                className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                                  selectedRoleFilter === item.value
                                    ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold"
                                    : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                <span>{item.label}</span>
                                {selectedRoleFilter === item.value && (
                                  <CheckIcon className="size-3.5 text-red-600 dark:text-red-400 ml-2" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-[8px] border">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                            <th className="p-3.5 pl-4">Pengguna / NIK</th>
                            <th className="p-3.5">Role Terpasang</th>
                            <th className="p-3.5">Regional Penugasan</th>
                            <th className="p-3.5">Status Akses</th>
                            <th className="p-3.5">Aktivitas Terakhir</th>
                            <th className="p-3.5 text-right pr-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-3.5 pl-4">
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="size-8 rounded-[8px] bg-primary/10 text-primary font-bold text-xs">
                                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-bold text-foreground block">{user.name}</span>
                                    <span className="text-[11px] text-muted-foreground font-mono">{user.nik} • {user.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <Badge variant="outline" className="text-[11px] font-semibold">
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-3.5 text-muted-foreground font-medium">
                                {user.regional}
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <Switch defaultChecked={user.status} onCheckedChange={(val: boolean) => toast.info(`Status akun ${user.name} diubah menjadi ${val ? 'Aktif' : 'Non-aktif'}`)} />
                                  <span className={`text-[11px] font-semibold ${user.status ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                    {user.status ? "Aktif" : "Nonaktif"}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3.5 text-[11px] text-muted-foreground font-mono">
                                {user.lastLogin}
                              </td>
                              <td className="p-3.5 text-right pr-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toast.info(`Mengubah hak akses untuk ${user.name}...`)}
                                  className="h-7 text-xs font-semibold cursor-pointer"
                                >
                                  Kelola Izin
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 3: Struktur Role */}
                <TabsContent value="roles" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roleData.map((role) => (
                      <div key={role.id} className="rounded-[8px] border bg-card p-5 shadow-2xs flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs font-semibold px-2.5 py-0.5 rounded-[8px] ${role.badgeColor}`}>
                              {role.name}
                            </Badge>
                            <span className="text-xs font-mono font-bold text-muted-foreground">
                              {role.userCount} Pengguna
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {role.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info(`Mengedit perizinan role: ${role.name}`)}
                            className="h-7.5 text-xs font-semibold rounded-[8px]"
                          >
                            Edit Role
                          </Button>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2Icon className="size-3.5" /> Enforced
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Integrated AI Panel */}
            <AiIntegratedPanel />
          </div>
        </SidebarInset>
      </AiPanelProvider>
    </SidebarProvider>
  )
}
