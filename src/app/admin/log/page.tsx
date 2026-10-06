"use client"

import * as React from "react"
import {
  ActivityIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  DatabaseIcon,
  DownloadIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  EyeIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  XIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Load real logs from database & persistent storage
  const loadLogs = React.useCallback(async (showToast = false) => {
    setIsRefreshing(true)
    try {
      const realLogs = await fetchRealActivityLogs()
      setLogs(realLogs)
      if (showToast) {
        toast.success("Log aktivitas berhasil diperbarui.")
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
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.user.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)

      const matchLevel = selectedLevel === "Semua" || item.level === selectedLevel
      const matchModule = selectedModule === "Semua" || item.module === selectedModule

      return matchSearch && matchLevel && matchModule
    })
  }, [logs, searchQuery, selectedLevel, selectedModule])

  // Reset page to 1 whenever filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleLevelChange = (val: string | null) => {
    if (val) {
      setSelectedLevel(val)
      setCurrentPage(1)
    }
  }

  const handleModuleChange = (val: string | null) => {
    if (val) {
      setSelectedModule(val)
      setCurrentPage(1)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedLevel("Semua")
    setSelectedModule("Semua")
    setCurrentPage(1)
  }

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

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const paginatedLogs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredLogs.slice(startIndex, startIndex + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  const startRecord = filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, filteredLogs.length)

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
        <div className="flex flex-1 flex-col gap-3.5 sm:gap-4 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full pb-12 font-sans">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Log Aktivitas & Audit Trail Sistem
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                Riwayat transaksi pengguna, perubahan status penugasan, berkas SPJ, dan keamanan secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                onClick={() => loadLogs(true)}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="h-8 sm:h-9 text-xs gap-1.5 font-semibold rounded-[8px]"
              >
                <RefreshCwIcon className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Segarkan
              </Button>
              <Button
                onClick={handleExportLog}
                variant="default"
                size="sm"
                className="h-8 sm:h-9 text-xs gap-1.5 font-semibold rounded-[8px] bg-red-600 hover:bg-red-700 text-white shadow-2xs"
              >
                <DownloadIcon className="size-3.5" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Stats Summary - Compact & Balanced (Overview Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Event Log */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-[8px] flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 shrink-0">
                    <ActivityIcon className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground truncate">
                    Total Event
                  </span>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-900/60">
                  Aktif
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                {isLoading ? "..." : stats.totalEvents}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                Semua log tercatat
              </p>
            </div>

            {/* Card 2: User Aktif */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-[8px] flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
                    <UserCheckIcon className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground truncate">
                    User Aktif
                  </span>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60">
                  Akun
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                {isLoading ? "..." : stats.uniqueUsers}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                Akun beraktivitas
              </p>
            </div>

            {/* Card 3: Perubahan Data */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-[8px] flex items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
                    <DatabaseIcon className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground truncate">
                    Mutasi Data
                  </span>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60">
                  Audit
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                {isLoading ? "..." : stats.dataChanges}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                Perubahan data sistem
              </p>
            </div>

            {/* Card 4: Peringatan Keamanan */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-[8px] flex items-center justify-center bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shrink-0">
                    <ShieldAlertIcon className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground truncate">
                    Peringatan
                  </span>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-900/60">
                  Alert
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                {isLoading ? "..." : stats.securityAlerts}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                Warning & insiden login
              </p>
            </div>
          </div>

          {/* Filter Bar - Responsive & Compact (Overview Style) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-[8px] border border-border shadow-2xs">
            <div className="relative flex-1 min-w-[200px] max-w-full md:max-w-xs">
              <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari user, aksi, detail aktivitas..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8.5 h-9 text-xs rounded-[8px] bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <span className="text-xs font-medium text-muted-foreground shrink-0 hidden sm:inline">
                  Level:
                </span>
                <Select value={selectedLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger className="h-9 text-xs w-full sm:w-32 rounded-[8px] bg-background">
                    <SelectValue placeholder="Semua Level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[8px]">
                    <SelectItem value="Semua">Semua Level</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="AUDIT">AUDIT</SelectItem>
                    <SelectItem value="WARNING">WARNING</SelectItem>
                    <SelectItem value="ERROR">ERROR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <span className="text-xs font-medium text-muted-foreground shrink-0 hidden sm:inline">
                  Modul:
                </span>
                <Select value={selectedModule} onValueChange={handleModuleChange}>
                  <SelectTrigger className="h-9 text-xs w-full sm:w-44 rounded-[8px] bg-background">
                    <SelectValue placeholder="Semua Modul" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[8px]">
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
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 text-xs px-3 font-semibold text-muted-foreground hover:text-foreground shrink-0 rounded-[8px]"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Audit Trail Table Card */}
          <Card className="overflow-hidden border border-border shadow-2xs rounded-[8px]">
            <CardHeader className="py-3 px-4 border-b bg-muted/20">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold">
                    Rincian Audit Trail Event Real-Time
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Catatan peristiwa sistem dari database Supabase dan sesi pengguna aktif WorkPulse.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 rounded-[8px]">
                    {filteredLogs.length} Records
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearLogs}
                    className="h-8 text-xs text-muted-foreground hover:text-red-600 gap-1.5 px-2.5 rounded-[8px]"
                    title="Setel ulang log lokal"
                  >
                    <Trash2Icon className="size-3.5" />
                    <span className="hidden sm:inline">Reset Cache</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Responsive Table with Horizontal Scroll */}
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[760px] text-xs">
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-24 text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      ID Log
                    </TableHead>
                    <TableHead className="w-36 text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      Waktu
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      Pengguna / Aktor
                    </TableHead>
                    <TableHead className="w-32 text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      Tindakan
                    </TableHead>
                    <TableHead className="w-36 text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      Modul
                    </TableHead>
                    <TableHead className="w-24 text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      Level
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      Rincian Event
                    </TableHead>
                    <TableHead className="w-14 text-center text-xs font-bold uppercase tracking-wider py-3 px-3.5">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                        <RefreshCwIcon className="size-4 animate-spin mx-auto mb-2 text-red-600" />
                        Memuat data audit log real-time...
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                        Tidak ada log yang sesuai dengan filter pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLogs.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-b last:border-0"
                        onClick={() => setSelectedLog(row)}
                      >
                        <TableCell className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 py-3 px-3.5">
                          {row.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground py-3 px-3.5">
                          {row.timestamp}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground max-w-[180px] truncate py-3 px-3.5">
                          {row.user}
                        </TableCell>
                        <TableCell className="py-3 px-3.5">
                          <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-muted/60 font-semibold rounded-[8px]">
                            {row.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-3 px-3.5 font-medium">
                          {row.module}
                        </TableCell>
                        <TableCell className="py-3 px-3.5">
                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-0.5 rounded-[8px] font-bold ${
                              row.level === "INFO"
                                ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400"
                                : row.level === "AUDIT"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : row.level === "WARNING"
                                    ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/40 dark:text-red-400"
                            }`}
                          >
                            {row.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground max-w-[320px] truncate py-3 px-3.5">
                          {row.detail}
                        </TableCell>
                        <TableCell className="text-center py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-[8px]"
                            onClick={() => setSelectedLog(row)}
                            title="Lihat Detail Log"
                          >
                            <EyeIcon className="size-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {filteredLogs.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t bg-muted/10 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span>
                    Menampilkan <strong className="text-foreground">{startRecord}</strong> - <strong className="text-foreground">{endRecord}</strong> dari <strong className="text-foreground">{filteredLogs.length}</strong> log
                  </span>
                  <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l pl-3">
                    <span>Per halaman:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(val: string | null) => {
                        if (val) {
                          setPageSize(Number(val))
                          setCurrentPage(1)
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-18 text-xs rounded-[8px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[8px]">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-[8px]"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    title="Halaman Pertama"
                  >
                    <ChevronsLeftIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-[8px]"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <span className="text-xs px-2 text-muted-foreground">
                    Hal <strong className="text-foreground">{currentPage}</strong> dari <strong className="text-foreground">{totalPages}</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-[8px]"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-[8px]"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Halaman Terakhir"
                  >
                    <ChevronsRightIcon className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Modal Detail Log Event - Overview Consistent Style */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="w-[95vw] sm:max-w-lg rounded-[8px] p-5 sm:p-6 max-h-[85vh] overflow-y-auto font-sans shadow-xl border-border">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-600" />
                <span className="font-mono text-xs text-muted-foreground">{selectedLog?.id}</span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Rincian Event Audit Log
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Detail teknis dan payload transaksi yang tercatat dalam audit trail sistem.
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-3.5 mt-2 text-xs">
                <div className="p-3.5 rounded-[8px] bg-muted/40 border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Tindakan (Action):</span>
                    <Badge variant="outline" className="font-mono text-xs font-bold bg-background rounded-[8px]">
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Level & Modul:</span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-bold rounded-[8px] ${
                          selectedLog.level === "INFO"
                            ? "bg-blue-50 text-blue-700"
                            : selectedLog.level === "AUDIT"
                              ? "bg-emerald-50 text-emerald-700"
                              : selectedLog.level === "WARNING"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700 font-bold"
                        }`}
                      >
                        {selectedLog.level}
                      </Badge>
                      <span className="text-foreground font-semibold">{selectedLog.module}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Waktu Tercatat:</span>
                    <span className="font-mono text-foreground font-semibold">{selectedLog.timestamp}</span>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-semibold block mb-1 text-xs">Aktor / Pengguna:</label>
                  <div className="p-3 rounded-[8px] bg-background border border-border font-semibold text-foreground text-xs">
                    {selectedLog.user}
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-semibold block mb-1 text-xs">Deskripsi Lengkap Event:</label>
                  <div className="p-3 rounded-[8px] bg-background border border-border leading-relaxed text-foreground text-xs">
                    {selectedLog.detail}
                  </div>
                </div>

                {selectedLog.meta && (
                  <div>
                    <label className="text-muted-foreground font-semibold block mb-1 text-xs">Metadata Tambahan:</label>
                    <pre className="p-3 rounded-[8px] bg-muted text-xs font-mono overflow-x-auto text-foreground">
                      {JSON.stringify(selectedLog.meta, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8.5 px-4 text-xs font-semibold rounded-[8px]"
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
