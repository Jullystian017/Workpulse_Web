"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ClockIcon,
  PauseCircleIcon,
  AlertCircleIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  SlidersHorizontalIcon,
  UploadCloudIcon,
  MapPinIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  CheckSquareIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export interface KaryawanTask {
  id: string
  judulTask: string
  pemberiTugas: string
  departemen: string
  prioritas: "Tinggi" | "Sedang" | "Rendah"
  lokasi: string
  deadline: string
  deadlineTime: string
  status: "Dalam Proses" | "Review Atasan" | "Selesai" | "Tertunda"
  progress: number
  deskripsi: string
  isToday: boolean
}

const initialTasks: KaryawanTask[] = [
  {
    id: "TASK-1029",
    judulTask: "Rekonsiliasi Anggaran & Berkas SPJ Divisi Operasional Q3",
    pemberiTugas: "Hendro Kusumo, S.T.",
    departemen: "Operasional & Pemeliharaan",
    prioritas: "Tinggi",
    lokasi: "Kantor Telkom Akses Regional Lt. 4",
    deadline: "2026-08-24",
    deadlineTime: "15:00 WIB",
    status: "Dalam Proses",
    progress: 75,
    deskripsi: "Penyusunan kelengkapan nota belanja operasional, validasi kwitansi, dan upload rekapitulasi SPJ ke sistem keuangan SAP.",
    isToday: true,
  },
  {
    id: "TASK-1030",
    judulTask: "Penyusunan Draft Memo Dinas & Notulen Rapat Koordinasi SGM",
    pemberiTugas: "Ir. Budi Santoso, M.T.",
    departemen: "Sekretariat & Regulasi",
    prioritas: "Sedang",
    lokasi: "Ruang Rapat Utama Lt. 5",
    deadline: "2026-08-24",
    deadlineTime: "17:00 WIB",
    status: "Review Atasan",
    progress: 100,
    deskripsi: "Notulensi rapat koordinasi anggaran bulanan, ringkasan arahan pimpinan, dan penerbitan nota dinas elektronik.",
    isToday: true,
  },
  {
    id: "TASK-1031",
    judulTask: "Verifikasi Kelengkapan Dokumen Proposal Tender Pengadaan",
    pemberiTugas: "Dimas Wicaksono",
    departemen: "Perencanaan & Optimasi",
    prioritas: "Sedang",
    lokasi: "Kantor Pusat Telkom Akses",
    deadline: "2026-08-28",
    deadlineTime: "16:00 WIB",
    status: "Dalam Proses",
    progress: 25,
    deskripsi: "Pemeriksaan legalitas vendor, spesifikasi teknis penawaran, dan penyesuaian dokumen Rencana Kerja dan Syarat (RKS).",
    isToday: false,
  },
  {
    id: "TASK-1032",
    judulTask: "Audit Dokumen Pengadaan & Rekonsiliasi Aset Kantor",
    pemberiTugas: "Rian Pratama",
    departemen: "Logistik & Aset",
    prioritas: "Rendah",
    lokasi: "Gudang Logistik & Arsip",
    deadline: "2026-09-02",
    deadlineTime: "14:00 WIB",
    status: "Tertunda",
    progress: 40,
    deskripsi: "Inventarisasi berkas berita acara serah terima (BAST) perangkat kantor dan pencocokan nomor seri inventaris.",
    isToday: false,
  },
  {
    id: "TASK-1025",
    judulTask: "Laporan Rekapitulasi Kinerja Personil & KPI Bulanan",
    pemberiTugas: "Siti Rahayu",
    departemen: "Human Capital",
    prioritas: "Tinggi",
    lokasi: "Kantor Telkom Akses Lt. 2",
    deadline: "2026-08-21",
    deadlineTime: "17:00 WIB",
    status: "Selesai",
    progress: 100,
    deskripsi: "Rekap data kehadiran, evaluasi pencapaian target kerja unit, dan generate sertifikat apresiasi kinerja.",
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

export function KaryawanTaskTable() {
  const [tasks, setTasks] = React.useState<KaryawanTask[]>(initialTasks)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [prioritasFilter, setPrioritasFilter] = React.useState("all")
  const [selectedTask, setSelectedTask] = React.useState<KaryawanTask | null>(null)
  const [detailTask, setDetailTask] = React.useState<KaryawanTask | null>(null)
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [progressInput, setProgressInput] = React.useState(0)
  const [catatanInput, setCatatanInput] = React.useState("")

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        task.judulTask.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.pemberiTugas.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false
      if (statusFilter !== "all" && task.status !== statusFilter) return false
      if (prioritasFilter !== "all" && task.prioritas !== prioritasFilter) return false
      return true
    })
  }, [tasks, searchQuery, statusFilter, prioritasFilter])

  const handleOpenUpdate = (task: KaryawanTask) => {
    setSelectedTask(task)
    setProgressInput(task.progress)
    setCatatanInput("")
    setIsUpdateOpen(true)
  }

  const handleOpenDetail = (task: KaryawanTask) => {
    setDetailTask(task)
    setIsDetailOpen(true)
  }

  const handleSaveProgress = () => {
    if (!selectedTask) return
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === selectedTask.id) {
          const newStatus = progressInput >= 100 ? "Review Atasan" : progressInput > 0 ? "Dalam Proses" : t.status
          return {
            ...t,
            progress: progressInput,
            status: newStatus,
          }
        }
        return t
      })
    )
    setIsUpdateOpen(false)
    toast.success(`Progress tugas #${selectedTask.id} berhasil disimpan (${progressInput}%)!`)
  }

  const handleSubmitReview = (task: KaryawanTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, progress: 100, status: "Review Atasan" } : t))
    )
    toast.success(`Tugas #${task.id} telah disubmit untuk Review Atasan!`)
  }

  return (
    <div className="relative px-4 lg:px-6">
      <div className="bg-white dark:bg-zinc-900 rounded-[8px] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        
        {/* Clean Table Header without Icons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Daftar Tugas Saya Hari Ini
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Ringkasan penugasan tugas kantor yang harus diselesaikan, batas target waktu selesai, dan progres pengerjaan
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari task, PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-[8px] bg-background border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
              <SelectTrigger className="h-9 text-xs rounded-[8px] border-zinc-200 dark:border-zinc-800 bg-background w-full sm:w-36">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                <SelectItem value="Review Atasan">Review Atasan</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Tertunda">Tertunda</SelectItem>
              </SelectContent>
            </Select>

            {/* Prioritas Filter */}
            <Select value={prioritasFilter} onValueChange={(val) => setPrioritasFilter(val ?? "all")}>
              <SelectTrigger className="h-9 text-xs rounded-[8px] border-zinc-200 dark:border-zinc-800 bg-background w-full sm:w-36">
                <SelectValue placeholder="Semua Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Prioritas</SelectItem>
                <SelectItem value="Tinggi">Tinggi</SelectItem>
                <SelectItem value="Sedang">Sedang</SelectItem>
                <SelectItem value="Rendah">Rendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inner Table Container - matching Admin DataTable style */}
        <div className="overflow-hidden rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-card shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] text-xs font-bold text-foreground">
                  Judul Task
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground">
                  Pemberi Tugas
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground">
                  Prioritas
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground">
                  Deadline
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground">
                  Status
                </TableHead>
                <TableHead className="w-[120px] text-xs font-bold text-foreground">
                  Progress
                </TableHead>
                <TableHead className="w-[60px] text-right text-xs font-bold text-foreground">
                  Aksi
                </TableHead>
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
                      onClick={() => handleOpenDetail(task)}
                    >
                      {/* Judul Task & ID */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5 max-w-[280px]">
                          <div className="flex items-center gap-1.5">
                            {overdue && (
                              <AlertCircleIcon className="size-3 shrink-0 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-foreground truncate">
                              {task.judulTask}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            #{task.id}
                          </span>
                        </div>
                      </TableCell>

                      {/* Pemberi Tugas */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {task.pemberiTugas}
                          </span>
                          <Badge variant="outline" className="w-fit px-1.5 text-[10px] text-muted-foreground">
                            {task.departemen}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Prioritas */}
                      <TableCell>
                        <Badge variant="outline" className={`px-2 text-xs font-medium ${cfgPrioritas.className}`}>
                          {task.prioritas}
                        </Badge>
                      </TableCell>

                      {/* Deadline */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`text-xs tabular-nums ${overdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                            {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            {overdue && " ⚠️"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {task.deadlineTime}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant="outline" className={`flex w-fit items-center gap-1 px-2 text-xs ${cfgStatus.className}`}>
                          {cfgStatus.icon}
                          {cfgStatus.label}
                        </Badge>
                      </TableCell>

                      {/* Progress */}
                      <TableCell>
                        <ProgressBar value={task.progress} />
                      </TableCell>

                      {/* Aksi Dropdown (Karyawan View: Lihat Detail, Update Progres, Submit Review) */}
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
                            <EllipsisVerticalIcon className="size-4" />
                            <span className="sr-only">Buka menu aksi</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs rounded-[8px]">
                            <DropdownMenuItem onClick={() => handleOpenDetail(task)} className="cursor-pointer">
                              <EyeIcon className="size-3.5 mr-2" /> Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenUpdate(task)} className="cursor-pointer">
                              <SlidersHorizontalIcon className="size-3.5 mr-2" /> Update Progres Saya
                            </DropdownMenuItem>
                            {task.status !== "Selesai" && task.status !== "Review Atasan" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleSubmitReview(task)} className="cursor-pointer text-emerald-600 font-medium">
                                  <CheckCircle2Icon className="size-3.5 mr-2" /> Submit Review Selesai
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

        {/* Pagination & Footer summary - matching Admin DataTable style */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-1">
          <div className="text-muted-foreground text-xs">
            Menampilkan <strong className="text-foreground">{filteredTasks.length}</strong> dari <strong className="text-foreground">{tasks.length}</strong> tugas aktif Anda.
          </div>

          <div className="flex items-center gap-2">
            <Link href="/karyawan/tasks">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-[8px] cursor-pointer">
                Buka Semua Task (Kanban & Log) &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: UPDATE PROGRES KARYAWAN ─────────────────────── */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[8px] p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Update Progres Pengerjaan Task
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Perbarui persentase tugas Anda dan tuliskan ringkasan aktivitas di lapangan.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-[8px] bg-muted/40 border border-border space-y-1">
                <span className="font-mono text-xs font-bold text-red-600">#{selectedTask.id}</span>
                <p className="text-xs font-bold text-foreground">{selectedTask.judulTask}</p>
                <p className="text-[11px] text-muted-foreground">Pemberi: {selectedTask.pemberiTugas} ({selectedTask.departemen})</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Persentase Selesai</Label>
                  <span className="text-sm font-bold text-red-600 tabular-nums">{progressInput}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressInput}
                  onChange={(e) => setProgressInput(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0% (Belum Mulai)</span>
                  <span>50%</span>
                  <span>100% (Selesai)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catatan" className="text-xs font-semibold">
                  Catatan Progres Lapangan
                </Label>
                <Textarea
                  id="catatan"
                  placeholder="Contoh: Konfigurasi routing selesai, redaman kabel optical -18 dBm..."
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  className="text-xs min-h-[75px] rounded-[8px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUpdateOpen(false)}
              className="text-xs rounded-[8px] cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveProgress}
              className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs cursor-pointer"
            >
              Simpan Progres
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: LIHAT DETAIL TASK (READ ONLY) ────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[8px] p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center justify-between">
              <span>Detail Penugasan Tugas</span>
              {detailTask && <span className="font-mono text-xs text-red-600 font-bold">#{detailTask.id}</span>}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Informasi instruksi penugasan dari atasan dan target waktu penyelesaian.
            </DialogDescription>
          </DialogHeader>

          {detailTask && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{detailTask.judulTask}</h3>
                <p className="text-muted-foreground leading-relaxed">{detailTask.deskripsi}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-[8px] bg-muted/40 border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Pemberi Tugas</span>
                  <span className="font-semibold text-foreground">{detailTask.pemberiTugas}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Departemen</span>
                  <span className="font-semibold text-foreground">{detailTask.departemen}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Lokasi STO</span>
                  <span className="font-semibold text-foreground">{detailTask.lokasi}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Target Selesai</span>
                  <span className="font-semibold text-foreground">{detailTask.deadline} ({detailTask.deadlineTime})</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Progres Pengerjaan</span>
                  <span className="font-bold text-red-600 tabular-nums">{detailTask.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600"
                    style={{ width: `${detailTask.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDetailOpen(false)}
              className="text-xs rounded-[8px] cursor-pointer"
            >
              Tutup
            </Button>
            {detailTask && detailTask.status !== "Selesai" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setIsDetailOpen(false)
                  handleOpenUpdate(detailTask)
                }}
                className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs cursor-pointer"
              >
                Update Progres
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
