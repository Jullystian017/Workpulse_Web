"use client"

import * as React from "react"
import Link from "next/link"
import {
  TableIcon,
  KanbanIcon,
  CalendarIcon,
  ClockIcon,
  SearchIcon,
  PlusIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  PaperclipIcon,
  UploadIcon,
  SendIcon,
  FileTextIcon,
  CheckSquareIcon,
  SlidersHorizontalIcon,
  XIcon,
  FilterIcon,
  MapPinIcon,
  TrendingUpIcon,
  ClipboardListIcon,
  ArrowRightIcon,
  PauseCircleIcon,
  MoreVerticalIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface MyTask {
  id: string
  judul: string
  prioritas: "Tinggi" | "Sedang" | "Rendah"
  deadline: string
  deadlineTime: string
  lokasi: string
  status: "Tertunda" | "Dalam Proses" | "Review Atasan" | "Selesai"
  progress: number
  pemberiTugas: string
  departemen: string
  deskripsi: string
  subtasks: { id: string; text: string; done: boolean }[]
  buktiLampiran?: string[]
  isToday: boolean
}

const initialMyTasks: MyTask[] = [
  {
    id: "TASK-1029",
    judul: "Optimasi Latency Switch Sentral & Konfigurasi Core Gateway",
    prioritas: "Tinggi",
    deadline: "2026-08-24",
    deadlineTime: "15:00 WIB",
    lokasi: "STO Gambir - Lt. 3 Rack Core B",
    status: "Dalam Proses",
    progress: 75,
    pemberiTugas: "Bambang Wijaya",
    departemen: "IT Core & Network",
    deskripsi: "Lakukan upgrade firmware switch distribusi dan cek redaman kabel patch cord ke router sentral.",
    subtasks: [
      { id: "st1", text: "Backup konfigurasi running switch eksisting", done: true },
      { id: "st2", text: "Pembersihan konektor fiber optik & ukur optical power", done: true },
      { id: "st3", text: "Routing ulang VLAN trunk & uji latency ping gateway", done: true },
      { id: "st4", text: "Dokumentasikan foto kabel rapih & label port", done: false },
    ],
    buktiLampiran: ["foto_rack_before.jpg", "hasil_ping_latency.pdf"],
    isToday: true,
  },
  {
    id: "TASK-1030",
    judul: "Rekap Audit Uptime Server Fiber & Dokumen Backup Mingguan",
    prioritas: "Sedang",
    deadline: "2026-08-24",
    deadlineTime: "17:00 WIB",
    lokasi: "Data Center Telkom Akses Lt. 2",
    status: "Review Atasan",
    progress: 100,
    pemberiTugas: "Hendro Susilo",
    departemen: "Operasional",
    deskripsi: "Pengecekan log server fiber optic mingguan dan ekspor rekapitulasi uptime ke storage backup.",
    subtasks: [
      { id: "st1", text: "Ekspor log server cluster 1 s/d 4", done: true },
      { id: "st2", text: "Verifikasi checksum backup mingguan", done: true },
      { id: "st3", text: "Upload file rekapitulasi audit", done: true },
    ],
    buktiLampiran: ["audit_uptime_minggu3_agu.xlsx"],
    isToday: true,
  },
  {
    id: "TASK-1031",
    judul: "Instalasi Access Point Baru & Migrasi SSID Gedung B",
    prioritas: "Sedang",
    deadline: "2026-08-28",
    deadlineTime: "16:00 WIB",
    lokasi: "Gedung B Lantai 3",
    status: "Dalam Proses",
    progress: 10,
    pemberiTugas: "Dewi Lestari",
    departemen: "Infrastruktur",
    deskripsi: "Pemasangan 3 unit AP Cisco Enterprise di Lantai 3 Gedung B dan verifikasi signal coverage.",
    subtasks: [
      { id: "st1", text: "Tarik kabel UTP Cat6 ke ceiling bracket", done: true },
      { id: "st2", text: "Pasang mounting unit access point", done: false },
      { id: "st3", text: "Konfigurasi SSID Telkom-Employee & uji roaming", done: false },
    ],
    isToday: false,
  },
  {
    id: "TASK-1032",
    judul: "Pemeriksaan Redaman Kabel Drop Fiber Optic Segmen Cimanuk",
    prioritas: "Tinggi",
    deadline: "2026-08-26",
    deadlineTime: "14:00 WIB",
    lokasi: "ODP-CMK-04 Jakarta",
    status: "Tertunda",
    progress: 0,
    pemberiTugas: "Rudi Hermawan",
    departemen: "Field Operations",
    deskripsi: "Pelanggan melaporkan redaman drop -26dBm. Lakukan splicing ulang pada konektor ODP.",
    subtasks: [
      { id: "st1", text: "Ukur redaman awal menggunakan OTDR", done: false },
      { id: "st2", text: "Splicing ulang core fiber yang bending", done: false },
      { id: "st3", text: "Foto bukti redaman akhir di bawah -18dBm", done: false },
    ],
    isToday: false,
  },
  {
    id: "TASK-1025",
    judul: "Pemasangan IndiHome High Speed & Konfigurasi ONT Baru",
    prioritas: "Rendah",
    deadline: "2026-08-21",
    deadlineTime: "17:00 WIB",
    lokasi: "STO Cikini Area 1",
    status: "Selesai",
    progress: 100,
    pemberiTugas: "Supervisor Wilayah 1",
    departemen: "Maintenance",
    deskripsi: "Instalasi perangkat ONT dual band baru dan pengujian kecepatan download/upload 100Mbps.",
    subtasks: [
      { id: "st1", text: "Tarik kabel drop core ke STO", done: true },
      { id: "st2", text: "Aktivasi serial number ONT di sistem Telkom", done: true },
      { id: "st3", text: "Speedtest bersama pelanggan dan tanda tangan BAST", done: true },
    ],
    buktiLampiran: ["bast_berita_acara_1025.pdf", "speedtest_hasil.jpg"],
    isToday: false,
  },
]

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  "Selesai": {
    label: "Selesai",
    icon: <CheckCircle2Icon className="size-3" />,
    className: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400",
  },
  "Dalam Proses": {
    label: "Dalam Proses",
    icon: <ClockIcon className="size-3" />,
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
  },
  "Review Atasan": {
    label: "Review Atasan",
    icon: <ClockIcon className="size-3" />,
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
  },
  "Tertunda": {
    label: "Tertunda",
    icon: <PauseCircleIcon className="size-3" />,
    className: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400",
  },
}

const prioritasConfig: Record<string, { className: string }> = {
  "Tinggi": { className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400" },
  "Sedang": { className: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400" },
  "Rendah": { className: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value === 100
      ? "bg-green-500"
      : value >= 50
      ? "bg-red-600"
      : value > 0
      ? "bg-yellow-500"
      : "bg-gray-300"

  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  )
}

function isOverdue(deadline: string, status: string) {
  if (status === "Selesai") return false
  return new Date(deadline) < new Date("2026-08-24")
}

export default function KaryawanTasksPage() {
  const [tasks, setTasks] = React.useState<MyTask[]>(initialMyTasks)
  const [viewMode, setViewMode] = React.useState<"tabel" | "kanban" | "timeline" | "kalender">("tabel")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [prioritasFilter, setPrioritasFilter] = React.useState("Semua")
  const [statusFilter, setStatusFilter] = React.useState("Semua")

  const [selectedTask, setSelectedTask] = React.useState<MyTask | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)
  const [progressValue, setProgressValue] = React.useState<number>(0)
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([])

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.pemberiTugas.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false
      if (prioritasFilter !== "Semua" && t.prioritas !== prioritasFilter) return false
      if (statusFilter !== "Semua" && t.status !== statusFilter) return false
      return true
    })
  }, [tasks, searchQuery, prioritasFilter, statusFilter])

  const handleOpenTask = (task: MyTask) => {
    setSelectedTask(task)
    setProgressValue(task.progress)
    setUploadedFiles(task.buktiLampiran || [])
    setIsDetailModalOpen(true)
  }

  const handleToggleSubtask = (subtaskId: string) => {
    if (!selectedTask) return

    const updatedSubtasks = selectedTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    )

    const completedCount = updatedSubtasks.filter((st) => st.done).length
    const calculatedProgress = Math.round((completedCount / updatedSubtasks.length) * 100)

    const updatedTask = {
      ...selectedTask,
      subtasks: updatedSubtasks,
      progress: calculatedProgress,
    }

    setSelectedTask(updatedTask)
    setProgressValue(calculatedProgress)
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
  }

  const handleUploadMock = () => {
    const mockFileName = `lampiran_bukti_${Date.now().toString().slice(-4)}.jpg`
    const newFiles = [...uploadedFiles, mockFileName]
    setUploadedFiles(newFiles)
    if (selectedTask) {
      const updated = { ...selectedTask, buktiLampiran: newFiles }
      setSelectedTask(updated)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    }
    toast.success(`Foto bukti ${mockFileName} berhasil dilampirkan!`)
  }

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return

    let newStatus = selectedTask.status
    if (progressValue === 100 && selectedTask.status !== "Selesai") {
      newStatus = "Review Atasan"
    } else if (progressValue > 0 && selectedTask.status === "Tertunda") {
      newStatus = "Dalam Proses"
    }

    const updated = {
      ...selectedTask,
      progress: progressValue,
      status: newStatus,
      buktiLampiran: uploadedFiles,
    }

    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    toast.success(`Progress tugas #${selectedTask.id} berhasil diperbarui (${progressValue}%)!`)
    setIsDetailModalOpen(false)
  }

  const handleSubmitForReview = () => {
    if (!selectedTask) return

    const updated = {
      ...selectedTask,
      progress: 100,
      status: "Review Atasan" as const,
      buktiLampiran: uploadedFiles,
    }

    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    toast.success(`Tugas #${selectedTask.id} berhasil disubmit ke atasan untuk approval!`)
    setIsDetailModalOpen(false)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-6 py-4 md:py-6">
        
        {/* Row 0: Header Welcome & Controls */}
        <div className="flex flex-col gap-4 px-4 pt-1 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Tugas Saya (Task Management)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Kelola tugas yang didelegasikan ke Anda: update progres, checklist subtask, dan submit bukti pengerjaan
            </p>
          </div>

          {/* View Switcher & Action */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* View Switcher Tabs (Segmented Control) */}
            <div className="flex items-center gap-1 rounded-xl border bg-muted p-1 text-muted-foreground shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("tabel")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "tabel"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:bg-background/50 hover:text-foreground"
                }`}
              >
                <TableIcon className="size-3.5" />
                <span>Tabel</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:bg-background/50 hover:text-foreground"
                }`}
              >
                <KanbanIcon className="size-3.5" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "timeline"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:bg-background/50 hover:text-foreground"
                }`}
              >
                <ClockIcon className="size-3.5" />
                <span>Timeline</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kalender")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "kalender"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:bg-background/50 hover:text-foreground"
                }`}
              >
                <CalendarIcon className="size-3.5" />
                <span>Kalender</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 1: 4 KPI Cards (Matching Admin SectionCards style) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <ClipboardListIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Total Tugas Ditugaskan</span>
                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                  {tasks.length} Tiket
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                {tasks.length}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Tugas operasional aktif</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Sedang Dikerjakan</span>
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  In Progress
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                {tasks.filter((t) => t.status === "Dalam Proses").length}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Target selesai hari ini</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <AlertCircleIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Review & Tertunda</span>
                <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                  Perhatian
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                {tasks.filter((t) => t.status === "Review Atasan" || t.status === "Tertunda").length}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Menunggu persetujuan atasan</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Selesai Disetujui</span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  Done
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                {tasks.filter((t) => t.status === "Selesai").length}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Kepatuhan SLA 100%</p>
            </div>
          </div>
        </div>

        {/* Row 2: Main Tasks Canvas (Tabel / Kanban / Kalender) */}
        {viewMode === "tabel" && (
          <div className="relative px-4 lg:px-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              {/* Table Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    Tabel Penugasan Tugas Saya
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Klik baris tugas untuk memperbarui checklist subtask atau mengunggah bukti pengerjaan
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-full sm:w-60">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                    <Input
                      placeholder="Cari task, PIC, lokasi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8.5 pl-8 text-xs rounded-xl"
                    />
                  </div>

                  <Select value={prioritasFilter} onValueChange={(val) => setPrioritasFilter(val ?? "Semua")}>
                    <SelectTrigger className="h-8.5 text-xs rounded-xl w-32">
                      <SelectValue placeholder="Prioritas" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="Semua">Semua Prioritas</SelectItem>
                      <SelectItem value="Tinggi">Tinggi</SelectItem>
                      <SelectItem value="Sedang">Sedang</SelectItem>
                      <SelectItem value="Rendah">Rendah</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "Semua")}>
                    <SelectTrigger className="h-8.5 text-xs rounded-xl w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="Semua">Semua Status</SelectItem>
                      <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      <SelectItem value="Review Atasan">Review Atasan</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                      <SelectItem value="Tertunda">Tertunda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Shadcn Table */}
              <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card shadow-2xs">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px] text-xs font-bold text-foreground">Judul Task</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Pemberi Tugas</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Prioritas</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Deadline</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
                      <TableHead className="w-[120px] text-xs font-bold text-foreground">Progress</TableHead>
                      <TableHead className="w-[60px] text-right text-xs font-bold text-foreground">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-xs">
                          Tidak ada tugas ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => {
                        const overdue = isOverdue(task.deadline, task.status)
                        const cfgStatus = statusConfig[task.status] ?? statusConfig["Dalam Proses"]
                        const cfgPrioritas = prioritasConfig[task.prioritas] ?? prioritasConfig["Rendah"]

                        return (
                          <TableRow
                            key={task.id}
                            className="hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleOpenTask(task)}
                          >
                            <TableCell>
                              <div className="flex flex-col gap-0.5 max-w-[280px]">
                                <div className="flex items-center gap-1.5">
                                  {overdue && <AlertCircleIcon className="size-3 shrink-0 text-red-500" />}
                                  <span className="text-sm font-medium text-foreground truncate">{task.judul}</span>
                                </div>
                                <span className="text-[11px] text-muted-foreground font-mono">#{task.id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-foreground">{task.pemberiTugas}</span>
                                <Badge variant="outline" className="w-fit px-1.5 text-[10px] text-muted-foreground">{task.departemen}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`px-2 text-xs font-medium ${cfgPrioritas.className}`}>
                                {task.prioritas}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className={`text-xs tabular-nums ${overdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                                  {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                  {overdue && " ⚠️"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{task.deadlineTime}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`flex w-fit items-center gap-1 px-2 text-xs ${cfgStatus.className}`}>
                                {cfgStatus.icon}
                                {cfgStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <ProgressBar value={task.progress} />
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      className="flex size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                      size="icon"
                                    />
                                  }
                                >
                                  <MoreVerticalIcon className="size-4" />
                                  <span className="sr-only">Buka menu aksi</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 text-xs rounded-xl">
                                  <DropdownMenuItem onClick={() => handleOpenTask(task)} className="cursor-pointer">
                                    <SlidersHorizontalIcon className="size-3.5 mr-2" /> Kelola & Checklist
                                  </DropdownMenuItem>
                                  {task.status !== "Selesai" && task.status !== "Review Atasan" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleOpenTask(task)} className="cursor-pointer text-emerald-600 font-medium">
                                        <CheckCircle2Icon className="size-3.5 mr-2" /> Ajukan Review Selesai
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Table Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-1 text-xs text-muted-foreground">
                <p>Menampilkan <strong className="text-foreground">{filteredTasks.length}</strong> dari <strong className="text-foreground">{tasks.length}</strong> total tugas.</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <span className="size-2 rounded-full bg-blue-500" /> Aktif: <strong>{tasks.filter((t) => t.status === "Dalam Proses").length}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] ml-2">
                    <span className="size-2 rounded-full bg-emerald-500" /> Selesai: <strong>{tasks.filter((t) => t.status === "Selesai").length}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["Tertunda", "Dalam Proses", "Review Atasan", "Selesai"] as const).map((columnStatus) => {
                const columnTasks = filteredTasks.filter((t) => t.status === columnStatus)
                return (
                  <div key={columnStatus} className="space-y-3">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/60 border border-border">
                      <span className="text-xs font-bold text-foreground">{columnStatus}</span>
                      <span className="size-5 rounded-full bg-background border text-[11px] font-bold flex items-center justify-center text-foreground">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[300px]">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleOpenTask(task)}
                          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-red-300 dark:hover:border-red-800 transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-red-600">#{task.id}</span>
                            <Badge variant="outline" className={`text-[10px] ${prioritasConfig[task.prioritas]?.className}`}>
                              {task.prioritas}
                            </Badge>
                          </div>
                          <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2">{task.judul}</h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <span>{task.pemberiTugas} &bull; {task.departemen}</span>
                          </p>
                          <div className="space-y-1 pt-1 border-t border-border/60">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Checklist: {task.subtasks.filter((st) => st.done).length}/{task.subtasks.length}</span>
                              <span className="font-bold text-foreground">{task.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  task.progress === 100 ? "bg-green-500" : "bg-red-600"
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === "timeline" && (
          <div className="px-4 lg:px-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Timeline & Jadwal Eksekusi Tugas</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Pantau estimasi durasi dan batas deadline pengerjaan harian</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
                {/* Timeline Header Row (Dates) */}
                <div className="grid grid-cols-12 min-w-[900px] border-b bg-muted/50 text-xs font-semibold">
                  <div className="col-span-4 p-3.5 border-r flex items-center gap-2">
                    <CalendarIcon className="size-4 text-red-600" />
                    <span>Daftar Tugas Karyawan</span>
                  </div>
                  <div className="col-span-8 grid grid-cols-8">
                    {[
                      { dayNum: 24, dayName: "Sen", isToday: true },
                      { dayNum: 25, dayName: "Sel" },
                      { dayNum: 26, dayName: "Rab" },
                      { dayNum: 27, dayName: "Kam" },
                      { dayNum: 28, dayName: "Jum" },
                      { dayNum: 29, dayName: "Sab" },
                      { dayNum: 30, dayName: "Min" },
                      { dayNum: 31, dayName: "Sen" },
                    ].map((d) => (
                      <div
                        key={d.dayNum}
                        className={`p-2.5 text-center border-r last:border-r-0 flex flex-col items-center justify-center ${
                          d.isToday ? "bg-red-50/80 dark:bg-red-950/40 text-red-600 font-bold border-b-2 border-b-red-600" : "text-muted-foreground"
                        }`}
                      >
                        <span className="text-sm leading-none font-bold">{d.dayNum}</span>
                        <span className="text-[10px] uppercase font-medium mt-0.5">{d.dayName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Rows */}
                <div className="divide-y divide-border min-w-[900px]">
                  {filteredTasks.map((task, idx) => {
                    const colStart = Math.min(8, Math.max(1, (idx % 6) + 1))
                    const colSpan = Math.min(8 - colStart + 1, task.prioritas === "Tinggi" ? 2 : 3)

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTask(task)}
                        className="grid grid-cols-12 items-center hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        <div className="col-span-4 p-3.5 border-r flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[11px] font-bold text-red-600">#{task.id}</span>
                            <span className="text-xs font-bold text-foreground group-hover:text-red-600 truncate">{task.judul}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{task.departemen}</span>
                            <span>&bull;</span>
                            <Badge variant="outline" className={`px-1 py-0 text-[9px] ${prioritasConfig[task.prioritas]?.className}`}>
                              {task.prioritas}
                            </Badge>
                          </div>
                        </div>

                        <div className="col-span-8 grid grid-cols-8 h-full items-center px-1 relative min-h-[56px]">
                          {/* Background grid lines */}
                          <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                              <div key={c} className="border-r last:border-r-0" />
                            ))}
                          </div>

                          {/* Task Bar */}
                          <div
                            className="relative z-10 transition-all duration-200"
                            style={{
                              gridColumnStart: colStart,
                              gridColumnEnd: `span ${colSpan}`,
                            }}
                          >
                            <div className={`p-2 rounded-xl border text-xs shadow-xs flex items-center justify-between gap-2 ${
                              task.status === "Selesai"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                : task.status === "Review Atasan"
                                ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
                            }`}>
                              <span className="font-semibold text-[11px] truncate flex items-center gap-1">
                                <ClockIcon className="size-3 shrink-0" /> {task.deadlineTime}
                              </span>
                              <span className="text-[10px] font-bold tabular-nums shrink-0">{task.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kalender View */}
        {viewMode === "kalender" && (
          <div className="px-4 lg:px-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Agenda Kalender Tugas Agustus 2026</h3>
                <span className="text-xs text-muted-foreground">Sinkron dengan jadwal shift</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {["24 Agu (Senin)", "25 Agu (Selasa)", "26 Agu (Rabu)", "27 Agu (Kamis)", "28 Agu (Jumat)"].map((day, idx) => {
                  const dayTasks = tasks.filter((t, i) => i === idx)
                  return (
                    <div key={day} className="p-3.5 rounded-2xl border border-border bg-card/60 min-h-[160px] space-y-2">
                      <span className="text-xs font-bold text-foreground block border-b pb-1.5">{day}</span>
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleOpenTask(t)}
                          className="p-2.5 rounded-xl bg-red-50/60 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs cursor-pointer space-y-1"
                        >
                          <span className="font-mono text-[10px] font-bold text-red-600">#{t.id}</span>
                          <p className="font-semibold text-foreground line-clamp-1">{t.judul}</p>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <ClockIcon className="size-2.5" /> {t.deadlineTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL: KELOLA SUBTASK & BUKTI PENGERJAAN ─────────────── */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[540px] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center justify-between">
              <span>Kelola & Pengerjaan Tugas</span>
              {selectedTask && <span className="font-mono text-xs font-bold text-red-600">#{selectedTask.id}</span>}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Centang subtask yang selesai dan lampirkan foto bukti pengerjaan di lapangan.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{selectedTask.judul}</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedTask.deskripsi}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Pemberi Tugas</span>
                  <span className="font-semibold text-foreground">{selectedTask.pemberiTugas} ({selectedTask.departemen})</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Deadline SLA</span>
                  <span className="font-semibold text-foreground">{selectedTask.deadline} ({selectedTask.deadlineTime})</span>
                </div>
              </div>

              {/* Checklist Subtasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckSquareIcon className="size-3.5 text-red-600" />
                    Checklist Langkah Pekerjaan
                  </Label>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {selectedTask.subtasks.filter((s) => s.done).length} dari {selectedTask.subtasks.length} Selesai
                  </span>
                </div>

                <div className="space-y-2 rounded-xl border border-border p-3 bg-muted/20">
                  {selectedTask.subtasks.map((st) => (
                    <label
                      key={st.id}
                      className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-foreground p-1 rounded hover:bg-muted/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="size-4 mt-0.5 accent-red-600 cursor-pointer rounded"
                      />
                      <span className={st.done ? "line-through text-muted-foreground" : "font-medium"}>
                        {st.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Upload Foto Bukti */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <PaperclipIcon className="size-3.5 text-red-600" />
                    Lampiran Bukti Lapangan / Foto BAST
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadMock}
                    className="h-7 text-[11px] font-semibold rounded-lg gap-1 border-red-200 dark:border-red-900 text-red-600 cursor-pointer"
                  >
                    <UploadIcon className="size-3" />
                    + Upload Foto / Dokumen
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {uploadedFiles.length === 0 ? (
                    <div className="p-3 text-center rounded-xl border border-dashed text-muted-foreground text-[11px]">
                      Belum ada lampiran. Klik tombol upload untuk menambahkan bukti pengerjaan.
                    </div>
                  ) : (
                    uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border text-[11px]">
                        <span className="flex items-center gap-1.5 font-mono truncate">
                          <FileTextIcon className="size-3 text-red-600" /> {file}
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[9px]">Terupload</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Kalkulasi Progres:</span>
                  <span className="font-bold text-red-600 tabular-nums">{progressValue}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progressValue === 100 ? "bg-green-500" : "bg-red-600"
                    }`}
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDetailModalOpen(false)}
              className="text-xs rounded-xl cursor-pointer"
            >
              Tutup
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveProgress}
              className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Perubahan
            </Button>
            {selectedTask && selectedTask.status !== "Selesai" && (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitForReview}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Submit Review Atasan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
