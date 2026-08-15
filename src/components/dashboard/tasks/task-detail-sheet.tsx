"use client"

import * as React from "react"
import {
  XIcon,
  PencilIcon,
  Trash2Icon,
  PaperclipIcon,
  FileTextIcon,
  ImageIcon,
  SendIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  UserIcon,
  CalendarIcon,
  ChevronRightIcon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export interface TaskItem {
  id: string
  judulTask: string
  assignee: string
  departemen: string
  prioritas: string
  deadline: string
  status: string
  progress: number
  bukti: boolean
  deskripsi?: string
  lokasi?: string
  kategori?: string
}

interface TaskDetailSheetProps {
  task: TaskItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus?: (taskId: string, newStatus: string) => void
}

const steps = ["Tertunda", "Dalam Proses", "Review Atasan", "Selesai"]

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onUpdateStatus,
}: TaskDetailSheetProps) {
  const [commentText, setCommentText] = React.useState("")
  const [history, setHistory] = React.useState([
    {
      id: "h1",
      time: "08:30 AM",
      date: "12 Ags 2026",
      user: "Budi Admin",
      action: "Task Dibuat",
      note: "Task ditugaskan untuk penanganan perbaikan jaringan di lapangan.",
    },
    {
      id: "h2",
      time: "10:15 AM",
      date: "12 Ags 2026",
      user: task?.assignee || "Teknisi",
      action: "Mulai Pengerjaan",
      note: "Karyawan sudah berada di lokasi dan mulai proses pengecekan ODP.",
      attachment: "foto-lokasi-awal.jpg",
    },
  ])

  if (!task) return null

  const handleSendUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newLog = {
      id: `h-${Date.now()}`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      date: "Hari ini",
      user: "Budi Admin",
      action: "Progress Update",
      note: commentText,
    }

    setHistory((prev) => [newLog, ...prev])
    setCommentText("")
    toast.success("Update progress berhasil ditambahkan!")
  }

  const currentStepIndex = steps.indexOf(
    task.status === "Tertunda"
      ? "Tertunda"
      : task.status === "Selesai"
      ? "Selesai"
      : "Dalam Proses"
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto p-0 border-l bg-background">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400">
              {task.departemen}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                task.prioritas === "Tinggi"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : task.prioritas === "Sedang"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Prioritas {task.prioritas}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <PencilIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:bg-red-50">
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* Title & Info */}
          <div>
            <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
            <h2 className="text-xl font-bold text-foreground mt-0.5">{task.judulTask}</h2>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <UserIcon className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">{task.assignee}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5" />
                <span>Deadline: {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Status Progress Stepper */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
              Alur Status Pekerjaan
            </span>
            <div className="flex items-center justify-between text-xs">
              {steps.map((st, idx) => {
                const isCurrent = idx === currentStepIndex
                const isPast = idx < currentStepIndex
                return (
                  <React.Fragment key={st}>
                    <button
                      onClick={() => onUpdateStatus?.(task.id, st)}
                      className={`flex flex-col items-center gap-1 transition-all ${
                        isCurrent
                          ? "text-primary font-bold scale-105"
                          : isPast
                          ? "text-emerald-600 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`size-6 rounded-full flex items-center justify-center text-[10px] ${
                          isCurrent
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : isPast
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground border"
                        }`}
                      >
                        {isPast ? "✓" : idx + 1}
                      </div>
                      <span>{st}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <ChevronRightIcon className="size-3.5 text-muted-foreground/50 shrink-0" />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">Deskripsi Tugas</h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-card p-3 rounded-lg border">
              {task.deskripsi ||
                `Pelaksanaan tugas ${task.judulTask} oleh teknisi ${task.assignee}. Pastikan mengambil foto lokasi ODP sebelum & sesudah pengerjaan serta menyimpan bukti nota material yang digunakan.`}
            </p>
          </div>

          {/* Attachments Section (Bukti Foto / Nota) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <PaperclipIcon className="size-3.5" /> Lampiran & Bukti Pekerjaan
              </h4>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <UploadIcon className="size-3" /> Upload Bukti
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors">
                <div className="size-8 rounded bg-red-50 dark:bg-red-950 flex items-center justify-center shrink-0">
                  <ImageIcon className="size-4 text-red-600" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium truncate">foto_odp_selesai.jpg</span>
                  <span className="text-[10px] text-muted-foreground">1.2 MB · Lapangan</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors">
                <div className="size-8 rounded bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <FileTextIcon className="size-4 text-blue-600" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium truncate">nota_material_kabel.pdf</span>
                  <span className="text-[10px] text-muted-foreground">340 KB · Material</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Progress Activity Log */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase flex items-center gap-1.5">
              <ClockIcon className="size-3.5" /> Riwayat & Progress Timeline
            </h4>

            <div className="relative pl-4 space-y-4 border-l-2 border-muted">
              {history.map((log) => (
                <div key={log.id} className="relative group">
                  <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{log.action}</span>
                    <span className="text-[11px] text-muted-foreground">{log.time}</span>
                  </div>
                  <span className="text-[11px] font-medium text-primary block">{log.user}</span>
                  <p className="text-xs text-muted-foreground mt-1 bg-card p-2.5 rounded-lg border">
                    {log.note}
                  </p>
                  {log.attachment && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 mt-1 font-medium">
                      <PaperclipIcon className="size-3" /> {log.attachment}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Progress Comment Form */}
          <form onSubmit={handleSendUpdate} className="flex flex-col gap-2 pt-2 border-t">
            <label className="text-xs font-semibold text-foreground">Update Status / Catatan Lapangan</label>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis update pengerjaan atau kendala di lokasi..."
              className="text-xs min-h-[70px] resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <Button type="button" variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground">
                <PaperclipIcon className="size-3.5" /> Lampirkan Foto
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground">
                <SendIcon className="size-3" /> Kirim Update
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
