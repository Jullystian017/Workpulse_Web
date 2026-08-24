"use client"

import * as React from "react"
import {
  ActivityIcon,
  SearchIcon,
  FilterIcon,
  ShieldCheckIcon,
  KeyIcon,
  UserCheckIcon,
  DatabaseIcon,
  FileCodeIcon,
  LaptopIcon,
  CalendarIcon,
  DownloadIcon,
} from "lucide-react"
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

const auditLogsData = [
  { id: "LOG-9921", timestamp: "2026-08-14 18:15:22", user: "Budi Admin (admin@telkomakses.co.id)", action: "UPDATE_TASK", module: "Task Management", level: "INFO", ip: "192.168.18.62", detail: "Mengubah status tugas 'Maintenance Core Fiber' dari In Progress menjadi Completed" },
  { id: "LOG-9920", timestamp: "2026-08-14 17:58:10", user: "Andi Pratama (andi@telkomakses.co.id)", action: "CLOCK_IN", module: "Presensi & Geofence", level: "INFO", ip: "192.168.18.102", detail: "Melakukan Clock-In Geofence OK (Radius 45m dari HQ Telkom Akses)" },
  { id: "LOG-9919", timestamp: "2026-08-14 17:42:01", user: "Budi Admin (admin@telkomakses.co.id)", action: "APPROVE_CUTI", module: "Presensi & Cuti", level: "AUDIT", ip: "192.168.18.62", detail: "Menyetujui pengajuan cuti tahunan ID CUTI-001 atas nama Mukhlis Amir" },
  { id: "LOG-9918", timestamp: "2026-08-14 16:30:15", user: "System AI Engine", action: "AI_RECOMMENDATION", module: "AI Insights", level: "INFO", ip: "127.0.0.1", detail: "Menghasilkan rekomendasi re-alokasi shift untuk 4 teknisi area Jakarta Barat" },
  { id: "LOG-9917", timestamp: "2026-08-14 15:10:04", user: "Oscar Budiman (oscar@mitra.com)", action: "GEOFENCE_ALERT", module: "Presensi & Geofence", level: "WARNING", ip: "114.125.40.12", detail: "Clock-In diluar batas geofence (Radius 180m dari zona lokasi)" },
  { id: "LOG-9916", timestamp: "2026-08-14 14:02:50", user: "Budi Admin (admin@telkomakses.co.id)", action: "CREATE_EMPLOYEE", module: "Karyawan Management", level: "AUDIT", ip: "192.168.18.62", detail: "Menambahkan profil karyawan baru NIK 10293857 (Nina Wahyuni - Marketing)" },
  { id: "LOG-9915", timestamp: "2026-08-14 12:00:11", user: "Siti Rahayu (siti@telkomakses.co.id)", action: "LOGIN_SUCCESS", module: "Authentication", level: "INFO", ip: "192.168.18.88", detail: "Berhasil login ke sistem via OAuth2 Single Sign-On Telkom" },
  { id: "LOG-9914", timestamp: "2026-08-14 09:15:33", user: "Unknown (Attacker IP)", action: "LOGIN_FAILED", module: "Authentication", level: "ERROR", ip: "103.44.12.99", detail: "Gagal login 3x berturut-turut pada akun user: manager@telkomakses.co.id" },
]

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedLevel, setSelectedLevel] = React.useState("Semua")
  const [selectedModule, setSelectedModule] = React.useState("Semua")

  const filteredLogs = React.useMemo(() => {
    return auditLogsData.filter((item) => {
      const matchSearch =
        item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchLevel = selectedLevel === "Semua" || item.level === selectedLevel
      const matchModule = selectedModule === "Semua" || item.module === selectedModule

      return matchSearch && matchLevel && matchModule
    })
  }, [searchQuery, selectedLevel, selectedModule])

  const handleExportLog = () => {
    toast.success("Berhasil mengekspor Audit Log Aktivitas ke file CSV.")
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
              <h1 className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                Log Aktivitas & Audit Trail Sistem
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Riwayat peristiwa keamanan, perubahan data, transaksi pengguna, dan log aktivitas real-time platform WorkPulse.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportLog}
                variant="outline"
                className="h-9 text-xs gap-1.5 font-semibold rounded-xl"
              >
                <DownloadIcon className="size-4" /> Export Log (CSV)
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ActivityIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Total Event Log</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Hari Ini
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  148
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Semua aktivitas sistem terrekam</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <UserCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">User Aktif</span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    Sessions
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  34
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Sesi login aktif saat ini</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <DatabaseIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Perubahan Data</span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    Audit
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  12
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Aktivitas update/create data</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ShieldCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Keamanan Alert</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Warning
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  2
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">1 Login Error & 1 Geofence</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari user, action, detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground shrink-0">Level Log:</span>
                <Select value={selectedLevel} onValueChange={(val) => val && setSelectedLevel(val)}>
                  <SelectTrigger className="h-9 text-xs w-32 rounded-xl">
                    <SelectValue placeholder="Semua Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Level</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="AUDIT">AUDIT</SelectItem>
                    <SelectItem value="WARNING">WARNING</SelectItem>
                    <SelectItem value="ERROR">ERROR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground shrink-0">Modul:</span>
                <Select value={selectedModule} onValueChange={(val) => val && setSelectedModule(val)}>
                  <SelectTrigger className="h-9 text-xs w-40 rounded-xl">
                    <SelectValue placeholder="Semua Modul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Modul</SelectItem>
                    <SelectItem value="Authentication">Authentication</SelectItem>
                    <SelectItem value="Task Management">Task Management</SelectItem>
                    <SelectItem value="Presensi & Geofence">Presensi & Geofence</SelectItem>
                    <SelectItem value="Presensi & Cuti">Presensi & Cuti</SelectItem>
                    <SelectItem value="AI Insights">AI Insights</SelectItem>
                    <SelectItem value="Karyawan Management">Karyawan Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Audit Trail Table */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Rincian Audit Trail Event</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {filteredLogs.length} Records
                </Badge>
              </CardTitle>
              <CardDescription>
                Catatan immutable dari seluruh event sistem untuk menjamin transparansi & kepatuhan tata kelola IT.
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-24">ID Log</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Pengguna / Aktor</TableHead>
                  <TableHead>Tindakan (Action)</TableHead>
                  <TableHead>Modul</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Rincian Event</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs font-semibold">{row.id}</TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">{row.timestamp}</TableCell>
                    <TableCell className="text-xs font-semibold max-w-[200px] truncate">{row.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] bg-muted">
                        {row.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.module}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          row.level === "INFO"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : row.level === "AUDIT"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : row.level === "WARNING"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200 font-semibold"
                        }
                      >
                        {row.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.ip}</TableCell>
                    <TableCell className="text-xs text-foreground max-w-[300px] truncate">{row.detail}</TableCell>
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
