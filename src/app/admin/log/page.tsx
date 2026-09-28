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
  RefreshCwIcon,
  ShieldAlertIcon,
  InfoIcon,
  AlertTriangleIcon,
  EyeIcon,
  CheckCircle2Icon,
  Trash2Icon,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ActivityLogItem,
  fetchRealActivityLogs,
  exportActivityLogsToCSV,
  clearStoredActivityLogs,
} from "@/lib/activity-logger"

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState<ActivityLogItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedLevel, setSelectedLevel] = React.useState("Semua")
  const [selectedModule, setSelectedModule] = React.useState("Semua")
  const [selectedLog, setSelectedLog] = React.useState<ActivityLogItem | null>(null)

  // Load real logs from database & persistent storage
  const loadLogs = React.useCallback(async (showToast = false) => {
    setIsRefreshing(true)
    try {
      const realLogs = await fetchRealActivityLogs()
      setLogs(realLogs)
      if (showToast) {
        toast.success("Log aktivitas berhasil diperbarui secara real-time.")
      }
    } catch (err) {
      console.error("Gagal memuat log aktivitas:", err)
      toast.error("Gagal memuat log aktivitas.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    loadLogs()

    // Listen to real-time events triggered anywhere across the application
    const handleNewLog = () => {
      loadLogs(false)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("workpulse_log_added", handleNewLog)
      window.addEventListener("storage", handleNewLog)
      return () => {
        window.removeEventListener("workpulse_log_added", handleNewLog)
        window.removeEventListener("storage", handleNewLog)
      }
    }
  }, [loadLogs])

  // Filter logs based on search and selectors
  const filteredLogs = React.useMemo(() => {
    return logs.filter((item) => {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        item.user.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.ip.toLowerCase().includes(q)

      const matchLevel = selectedLevel === "Semua" || item.level === selectedLevel
      const matchModule = selectedModule === "Semua" || item.module === selectedModule

      return matchSearch && matchLevel && matchModule
    })
  }, [logs, searchQuery, selectedLevel, selectedModule])

  // Real Dynamic Metrics
  const stats = React.useMemo(() => {
    const totalEvents = logs.length
    const uniqueUsers = new Set(logs.map((l) => l.user.split(" (")[0])).size
    const dataChanges = logs.filter((l) => l.level === "AUDIT").length
    const securityAlerts = logs.filter((l) => l.level === "WARNING" || l.level === "ERROR").length

    return {
      totalEvents,
      uniqueUsers,
      dataChanges,
      securityAlerts,
    }
  }, [logs])

  // Real CSV export
  const handleExportLog = () => {
    try {
      if (filteredLogs.length === 0) {
        toast.warning("Tidak ada log untuk diekspor pada filter ini.")
        return
      }
      exportActivityLogsToCSV(filteredLogs)
      toast.success(`Berhasil mengekspor ${filteredLogs.length} audit log aktivitas ke format CSV.`)
    } catch (err: any) {
      toast.error(err.message || "Gagal mengekspor file CSV.")
    }
  }

  // Clear local logs
  const handleClearLogs = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang log aktivitas lokal? Log bawaan sistem akan di-refresh.")) {
      clearStoredActivityLogs()
      loadLogs(true)
    }
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
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Live Audit Trail Engine
                </span>
              </div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-foreground">
                Log Aktivitas & Audit Trail Sistem
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Riwayat transaksi pengguna, perubahan status penugasan, berkas SPJ, dan keamanan secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => loadLogs(true)}
                variant="outline"
                disabled={isRefreshing}
                className="h-9 text-xs gap-1.5 font-semibold rounded-[8px]"
              >
                <RefreshCwIcon className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Segarkan
              </Button>
              <Button
                onClick={handleExportLog}
                variant="default"
                className="h-9 text-xs gap-1.5 font-semibold rounded-[8px] bg-red-600 hover:bg-red-700 text-white"
              >
                <DownloadIcon className="size-4" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Stats Summary (Calculated from Real Data) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ActivityIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Total Event Log</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Aktif
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  {isLoading ? "..." : stats.totalEvents}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Semua aktivitas sistem terrekam</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <UserCheckIcon className="absolute -right-2 -top-2 size-20 text-blue-100 dark:text-blue-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Aktor / User Aktif</span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    Akun
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  {isLoading ? "..." : stats.uniqueUsers}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Akun karyawan dengan riwayat aktif</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <DatabaseIcon className="absolute -right-2 -top-2 size-20 text-amber-100 dark:text-amber-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Perubahan Data (Audit)</span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    Mutasi
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  {isLoading ? "..." : stats.dataChanges}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Perubahan tugas, SPJ, & akun</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ShieldCheckIcon className="absolute -right-2 -top-2 size-20 text-purple-100 dark:text-purple-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Peringatan / Alert</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Keamanan
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  {isLoading ? "..." : stats.securityAlerts}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Login gagal, lockout & peringatan</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-[8px] border">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari user, action, detail, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-[8px]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground shrink-0">Level:</span>
                <Select value={selectedLevel} onValueChange={(val) => val && setSelectedLevel(val)}>
                  <SelectTrigger className="h-9 text-xs w-32 rounded-[8px]">
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
                  <SelectTrigger className="h-9 text-xs w-44 rounded-[8px]">
                    <SelectValue placeholder="Semua Modul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Modul</SelectItem>
                    <SelectItem value="Authentication">Authentication</SelectItem>
                    <SelectItem value="Task Management">Task Management</SelectItem>
                    <SelectItem value="SPJ & Keuangan">SPJ & Keuangan</SelectItem>
                    <SelectItem value="Karyawan Management">Karyawan Management</SelectItem>
                    <SelectItem value="Presensi & Geofence">Presensi & Geofence</SelectItem>
                    <SelectItem value="Security & System">Security & System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || selectedLevel !== "Semua" || selectedModule !== "Semua") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedLevel("Semua")
                    setSelectedModule("Semua")
                  }}
                  className="h-9 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </div>

          {/* Audit Trail Table */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Rincian Audit Trail Event Real-Time</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Catatan peristiwa sistem dari database Supabase dan sesi pengguna aktif WorkPulse.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {filteredLogs.length} Records
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearLogs}
                    className="h-7 text-[11px] text-muted-foreground hover:text-red-600 gap-1"
                    title="Setel ulang log lokal"
                  >
                    <Trash2Icon className="size-3" /> Reset Cache
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-24">ID Log</TableHead>
                    <TableHead className="w-36">Timestamp</TableHead>
                    <TableHead className="w-48">Pengguna / Aktor</TableHead>
                    <TableHead className="w-36">Tindakan (Action)</TableHead>
                    <TableHead className="w-36">Modul</TableHead>
                    <TableHead className="w-24">Level</TableHead>
                    <TableHead className="w-28">Alamat IP</TableHead>
                    <TableHead>Rincian Event</TableHead>
                    <TableHead className="w-16 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-xs">
                        <RefreshCwIcon className="size-5 animate-spin mx-auto mb-2 text-red-600" />
                        Memuat data audit log real-time...
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-xs">
                        Tidak ada log yang sesuai dengan filter pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => setSelectedLog(row)}
                      >
                        <TableCell className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {row.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                          {row.timestamp}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground max-w-[200px] truncate">
                          {row.user}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px] bg-muted/60 font-semibold">
                            {row.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {row.module}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.level === "INFO"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
                                : row.level === "AUDIT"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : row.level === "WARNING"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 font-bold"
                            }
                          >
                            {row.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {row.ip}
                        </TableCell>
                        <TableCell className="text-xs text-foreground max-w-[320px] truncate">
                          {row.detail}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setSelectedLog(row)}
                            title="Lihat Detail Log"
                          >
                            <EyeIcon className="size-3.5 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Modal Detail Log Event */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-md rounded-2xl p-6 font-sans">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-600" />
                <span className="font-mono text-xs text-muted-foreground">{selectedLog?.id}</span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Rincian Event Audit Log
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Detail teknis dan payload transaksi yang tercatat dalam audit trail sistem.
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-3.5 mt-2 text-xs">
                <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Tindakan (Action):</span>
                    <Badge variant="outline" className="font-mono text-xs font-bold bg-background">
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Level & Modul:</span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={
                          selectedLog.level === "INFO"
                            ? "bg-blue-50 text-blue-700"
                            : selectedLog.level === "AUDIT"
                              ? "bg-emerald-50 text-emerald-700"
                              : selectedLog.level === "WARNING"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700 font-bold"
                        }
                      >
                        {selectedLog.level}
                      </Badge>
                      <span className="text-foreground font-medium">{selectedLog.module}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Timestamp:</span>
                    <span className="font-mono text-foreground font-bold">{selectedLog.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Alamat IP:</span>
                    <span className="font-mono text-foreground">{selectedLog.ip}</span>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Aktor / Pengguna:</label>
                  <div className="p-2.5 rounded-lg bg-background border border-border font-medium text-foreground">
                    {selectedLog.user}
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Deskripsi Lengkap Event:</label>
                  <div className="p-2.5 rounded-lg bg-background border border-border leading-relaxed text-foreground">
                    {selectedLog.detail}
                  </div>
                </div>

                {selectedLog.meta && (
                  <div>
                    <label className="text-muted-foreground font-semibold block mb-1">Metadata Tambahan:</label>
                    <pre className="p-2.5 rounded-lg bg-muted text-[11px] font-mono overflow-x-auto text-foreground">
                      {JSON.stringify(selectedLog.meta, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs rounded-lg"
                    onClick={() => setSelectedLog(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
