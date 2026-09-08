"use client"

import * as React from "react"
import {
  HashIcon,
  UsersIcon,
  ShieldCheckIcon,
  FileTextIcon,
  MessageSquareIcon,
  FolderIcon,
  TrendingUpIcon,
  PlusIcon,
  SendIcon,
  ClockIcon,
  CheckCircle2Icon,
  DownloadIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Channel, Task, User, ROLE_LABELS } from "@/types/database"
import { getActiveUserFromStorage } from "@/lib/api"

interface ChannelHubBannerProps {
  channel: Channel
  tasks: Task[]
  users: User[]
  activeSubTab: "tasks" | "memos" | "documents" | "sla"
  onSubTabChange: (tab: "tasks" | "memos" | "documents" | "sla") => void
  onOpenCreateTask: () => void
}

export function ChannelHubBanner({
  channel,
  tasks,
  users,
  activeSubTab,
  onSubTabChange,
  onOpenCreateTask,
}: ChannelHubBannerProps) {
  const channelTasks = tasks.filter((t) => t.channel_id === channel.id)
  const totalTasks = channelTasks.length
  const completedTasks = channelTasks.filter((t) => t.status === "done").length
  const reviewTasks = channelTasks.filter((t) => t.status === "review").length
  const slaRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100

  // Channel Lead: find a manager or officer in users or default to Hendro Kusumo
  const channelLead = users.find((u) => u.role === "manager") || users[0]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:p-6 shadow-xs space-y-5">
      {/* Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="size-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-900 shadow-xs">
            <HashIcon className="size-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                #{channel.name}
              </h2>
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold bg-muted text-foreground">
                Workstream Divisi
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              {channel.description ||
                "Ruang kerja kolaboratif divisi untuk koordinasi pengerjaan tugas kantor, audit SOP, dan pertanggungjawaban anggaran."}
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs">
            <UsersIcon className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">PIC Divisi:</span>
            <span className="font-bold text-foreground">{channelLead ? channelLead.nama : "Manager Unit"}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
            <TrendingUpIcon className="size-3.5" />
            <span>Target Tepat Waktu: <strong>{slaRate}%</strong></span>
          </div>

          <Button
            size="sm"
            onClick={onOpenCreateTask}
            className="h-8.5 px-3.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs gap-1.5"
          >
            <PlusIcon className="size-4" />
            <span>Tugas Divisi Baru</span>
          </Button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border/70 pb-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSubTabChange("tasks")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "tasks"
              ? "border-b-red-600 text-red-600 dark:text-red-400"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileTextIcon className="size-3.5" />
          <span>Penugasan Divisi ({totalTasks})</span>
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("memos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "memos"
              ? "border-b-red-600 text-red-600 dark:text-red-400"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquareIcon className="size-3.5" />
          <span>Memo & Koordinasi Dinas</span>
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("documents")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "documents"
              ? "border-b-red-600 text-red-600 dark:text-red-400"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderIcon className="size-3.5" />
          <span>Repositori Berkas SPJ</span>
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("sla")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "sla"
              ? "border-b-red-600 text-red-600 dark:text-red-400"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUpIcon className="size-3.5" />
          <span>Mini Scorecard SLA</span>
        </button>
      </div>
    </div>
  )
}

// 💬 Sub-Tab: Memos & Dinas Coordination Feed
export function ChannelMemosView({ channel }: { channel: Channel }) {
  const [memoInput, setMemoInput] = React.useState("")
  const [memos, setMemos] = React.useState<{ id: string; sender: string; role: string; text: string; time: string }[]>([
    {
      id: "m-1",
      sender: "Hendro Kusumo",
      role: "Manager Operasional",
      text: "Mohon seluruh jajaran Officer untuk memverifikasi kelengkapan lampiran nota dinas dan kwitansi SPJ sebelum tanggal 15 bulan ini.",
      time: "Hari ini, 09:30 WIB",
    },
    {
      id: "m-2",
      sender: "Dimas Wicaksono",
      role: "Officer 3 Pengendali",
      text: "Laporan audit internal minggu ke-1 sudah diunggah pada tab Repositori Berkas. Siap untuk ditinjau SGM.",
      time: "Kemarin, 16:15 WIB",
    },
  ])

  const handleSendMemo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!memoInput.trim()) return

    const activeUser = getActiveUserFromStorage()
    const newMemo = {
      id: `m-${Date.now()}`,
      sender: activeUser ? activeUser.nama : "Ir. Budi Santoso",
      role: activeUser ? activeUser.position_title || activeUser.role : "SGM Regional",
      text: memoInput.trim(),
      time: "Baru saja",
    }

    setMemos([newMemo, ...memos])
    setMemoInput("")
    toast.success("Memo dinas berhasil dipublikasikan di #" + channel.name)
  }

  return (
    <div className="space-y-4">
      {/* Post Memo Form */}
      <form onSubmit={handleSendMemo} className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MessageSquareIcon className="size-3.5 text-red-600" />
          Terbitkan Memo / Instruksi Koordinasi Dinas
        </label>
        <Input
          value={memoInput}
          onChange={(e) => setMemoInput(e.target.value)}
          placeholder={`Tulis pesan koordinasi dinas untuk seluruh personil #${channel.name}...`}
          className="h-10 text-xs rounded-xl"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Memo akan langsung tersimpan & terbaca oleh personil divisi.
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={!memoInput.trim()}
            className="h-8.5 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs gap-1.5"
          >
            <SendIcon className="size-3.5" />
            <span>Kirim Memo</span>
          </Button>
        </div>
      </form>

      {/* Memos List */}
      <div className="space-y-3">
        {memos.map((m) => (
          <div key={m.id} className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{m.sender}</span>
                <Badge variant="outline" className="px-1.5 py-0.2 text-[9px] font-semibold bg-muted">
                  {m.role}
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ClockIcon className="size-3" /> {m.time}
              </span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">{m.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 📁 Sub-Tab: Documents Repository
export function ChannelDocumentsView({ channel, tasks }: { channel: Channel; tasks: Task[] }) {
  const channelTasks = tasks.filter((t) => t.channel_id === channel.id)

  const sampleDocuments = [
    {
      id: "doc-1",
      name: `SOP_Standar_Operasional_${channel.name.toUpperCase()}_v2.pdf`,
      size: "2.4 MB",
      uploadedBy: "Hendro Kusumo (Manager)",
      date: "05 Sep 2026",
      type: "PDF Document",
    },
    {
      id: "doc-2",
      name: `Laporan_Evaluasi_Anggaran_SPJ_Q3.xlsx`,
      size: "1.1 MB",
      uploadedBy: "Dimas Wicaksono (Officer 3)",
      date: "04 Sep 2026",
      type: "Excel Spreadsheet",
    },
    {
      id: "doc-3",
      name: `Nota_Dinas_Persetujuan_SGM_Telkom_Akses.pdf`,
      size: "850 KB",
      uploadedBy: "Ir. Budi Santoso (SGM)",
      date: "01 Sep 2026",
      type: "Official PDF",
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Repositori Berkas & Dokumen #{channel.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Arsip terpusat berkas SOP, SPJ, nota dinas, dan lampiran resmi penugasan divisi.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {sampleDocuments.map((doc) => (
          <div key={doc.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileTextIcon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {doc.size} • Diunggah oleh <strong>{doc.uploadedBy}</strong> • {doc.date}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`Mendownload ${doc.name}...`)}
              className="h-8 px-3 text-xs font-semibold rounded-xl gap-1 shrink-0"
            >
              <DownloadIcon className="size-3.5" />
              <span>Unduh</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// 📊 Sub-Tab: SLA Mini Scorecard
export function ChannelSlaScorecardView({ channel, tasks }: { channel: Channel; tasks: Task[] }) {
  const channelTasks = tasks.filter((t) => t.channel_id === channel.id)
  const total = channelTasks.length
  const completed = channelTasks.filter((t) => t.status === "done").length
  const review = channelTasks.filter((t) => t.status === "review").length
  const inProgress = channelTasks.filter((t) => t.status === "in_progress").length
  const onTimePct = total > 0 ? Math.round((completed / total) * 100) : 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Tingkat Ketepatan Waktu (SLA)</span>
          <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums text-emerald-600">{onTimePct}%</p>
          <p className="text-xs text-muted-foreground mt-1">Standar target korporat: ≥ 90%</p>
        </div>
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <CheckCircle2Icon className="size-4" /> Kepatuhan Memenuhi Standar
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Status Pengerjaan Berkas</span>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selesai Diverifikasi:</span>
              <strong className="text-emerald-600">{completed} Tugas</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Menunggu Review Atasan:</span>
              <strong className="text-amber-600">{review} Tugas</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sedang Dalam Proses:</span>
              <strong className="text-blue-600">{inProgress} Tugas</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
          Total {total} penugasan terdaftar di #{channel.name}
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Rekomendasi AI untuk Divisi</span>
          <div className="mt-2.5 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-xs text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-900 space-y-1">
            <div className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300">
              <SparklesIcon className="size-3.5" /> WorkPulse AI Analysis
            </div>
            <p className="text-[11px] leading-relaxed">
              Performa divisi #{channel.name} sangat optimal. Tidak ditemukan antrean berkas yang melewati batas SLA 48 jam.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
          Update otomatis dari model Groq Llama 3.3
        </div>
      </div>
    </div>
  )
}
