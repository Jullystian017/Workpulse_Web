"use client"

import * as React from "react"
import {
  SparklesIcon,
  ArrowUpIcon,
  CopyIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RotateCcwIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  Link2Icon,
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ZapIcon,
  PlusIcon,
  MessageSquareIcon,
  Trash2Icon,
  SearchIcon,
  BrainCircuitIcon,
  HistoryIcon,
  XIcon,
  BookmarkCheckIcon,
  CheckCircle2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AiFormattedText } from "@/components/dashboard/ai-formatted-text"

interface Message {
  id: string
  sender: "user" | "ai"
  text?: string
  title?: string
  contextCard?: {
    title: string
    time: string
    subtext: string
    participants: { name: string; role: string; avatar?: string }[]
    tags: string[]
    statusColor: string
  }
  points?: { title: string; desc: string }[]
  followUpPrompt?: string
}

interface ChatSession {
  id: string
  title: string
  dateGroup: "Hari Ini" | "Kemarin" | "7 Hari Terakhir"
  updatedAt: string
  messages: Message[]
}

const suggestedPrompts = [
  { id: "p1", icon: CalendarIcon, label: "Rekomendasi Delegasi Proposal Q4", query: "Siapa personil yang paling tepat untuk didelegasikan penyusunan proposal pengadaan B2B Q4?" },
  { id: "p2", icon: AlertTriangleIcon, label: "Analisis Task Overdue & SLA", query: "Tunjukkan daftar penugasan kantor yang mendekati deadline SLA hari ini." },
  { id: "p3", icon: MapPinIcon, label: "Kapasitas & Beban Kerja Tim", query: "Bagaimana sebaran beban kerja staf saat ini? Siapa yang sedang overcapacity atau siaga?" },
  { id: "p4", icon: ZapIcon, label: "Drafting Nota Dinas & Berkas SPJ", query: "Buatkan draf nota dinas permohonan justifikasi anggaran pengadaan perangkat IT kantor." },
]

const todaySchedule = [
  {
    id: "sch-1",
    title: "Penyusunan Proposal Pengadaan B2B Q4",
    time: "10:00 - 11:30 WIB",
    status: "active",
    statusColor: "bg-amber-500",
    details: "Penyusunan berkas proposal teknis dan justifikasi anggaran kebutuhan kantor untuk pengadaan perangkat pendukung enterprise.",
    link: "/admin/tasks",
    participants: [
      { name: "Dimas Wicaksono", role: "Officer 3 Pengadaan", avatar: "" },
      { name: "Hendro Kusumo", role: "Manager Operasional", avatar: "" },
    ],
  },
  {
    id: "sch-2",
    title: "Audit Kepatuhan Nota Dinas & Verifikasi SPJ",
    time: "13:00 - 14:00 WIB",
    status: "upcoming",
    statusColor: "bg-zinc-400",
    details: "Review kelengkapan bukti nota pengeluaran operasional dan verifikasi approval berjenjang.",
    link: "/admin/tasks",
    participants: [
      { name: "Siti Rahayu", role: "Officer 2 Keuangan", avatar: "" },
      { name: "Budi Santoso", role: "SGM Regional III", avatar: "" },
    ],
  },
  {
    id: "sch-3",
    title: "Evaluasi SLA & Beban Kerja Divisi Kantor",
    time: "15:00 - 17:00 WIB",
    status: "critical",
    statusColor: "bg-emerald-500",
    details: "Rapat koordinasi mingguan monitoring akuntabilitas pengerjaan tugas dan pencapaian target SLA divisi.",
    link: "/admin/tasks",
    participants: [
      { name: "Hendro Kusumo", role: "Manager Operasional", avatar: "" },
      { name: "Rian Pratama", role: "Staff Administrasi", avatar: "" },
    ],
  },
]

const initialMemorySessions: ChatSession[] = [
  {
    id: "session-1",
    title: "Rekomendasi Delegasi Proposal Pengadaan B2B",
    dateGroup: "Hari Ini",
    updatedAt: "10:30 WIB",
    messages: [
      {
        id: "u-1",
        sender: "user",
        text: "Siapa personil yang paling tepat untuk didelegasikan penyusunan proposal pengadaan B2B Q4?",
      },
      {
        id: "a-1",
        sender: "ai",
        title: "Rekomendasi Pendelegasian Berdasarkan Analisis AI",
        contextCard: {
          title: "Divisi Operasional & Pengadaan",
          time: "Target SLA: 24 Jam Kerja",
          subtext: "Tiket #TLK-KNT-101 • Kantor Regional III Bandung",
          participants: [
            { name: "Hendro Kusumo", role: "Manager Operasional" },
            { name: "Dimas Wicaksono", role: "Officer 3 (Beban: 2 Tugas Aktif)" },
          ],
          tags: ["Personil Tersedia", "Keahlian Sesuai", "Skor Efisiensi: 94%"],
          statusColor: "border-l-emerald-500",
        },
        points: [
          {
            title: "1. Rekomendasi Utama: Dimas Wicaksono (Officer 3)",
            desc: "Memiliki riwayat penyelesaian proposal pengadaan serupa dengan skor on-time SLA 96% dan kapasitas saat ini sedang optimal (2 tugas aktif).",
          },
          {
            title: "2. Estimasi Waktu Pengerjaan",
            desc: "Penyusunan draf justifikasi teknis dan rincian RAB diperkirakan memakan waktu 4–6 jam kerja.",
          },
          {
            title: "3. Jalur Verifikasi & Rantai Komando",
            desc: "Setelah disubmit oleh Dimas Wicaksono, berkas akan diteruskan otomatis ke Hendro Kusumo (Manager) untuk review dan persetujuan.",
          },
        ],
        followUpPrompt: "Apakah Anda ingin saya langsung menerbitkan delegasi tugas ini ke Dimas Wicaksono?",
      },
    ],
  },
  {
    id: "session-2",
    title: "Analisis Ketercapaian SLA & Penugasan Mendekati Deadline",
    dateGroup: "Hari Ini",
    updatedAt: "08:45 WIB",
    messages: [
      {
        id: "u-2",
        sender: "user",
        text: "Tunjukkan daftar penugasan kantor yang mendekati deadline SLA hari ini",
      },
      {
        id: "a-2",
        sender: "ai",
        title: "Daftar Tugas Kritis Berdasarkan SLA Monitor",
        points: [
          {
            title: "1. TLK-KNT-103: Rekonsiliasi SPJ Operasional Kantor",
            desc: "Sisa SLA: 3 Jam. Pelaksana: Siti Rahayu. Status: Menunggu upload nota kelengkapan.",
          },
          {
            title: "2. TLK-KNT-108: Evaluasi Kinerja Vendor Layanan IT",
            desc: "Sisa SLA: 5 Jam. Pelaksana: Rian Pratama. Status: Dalam tahap review kuesioner evaluasi.",
          },
        ],
        followUpPrompt: "Ingin saya kirimkan alert pengingat otomatis ke PIC tugas?",
      },
    ],
  },
  {
    id: "session-3",
    title: "Rekap Akuntabilitas Kerja & Kepatuhan SOP Kantor",
    dateGroup: "Kemarin",
    updatedAt: "Kemarin, 16:20",
    messages: [
      {
        id: "u-3",
        sender: "user",
        text: "Berapa persentase presensi geofence karyawan kemarin?",
      },
      {
        id: "a-3",
        sender: "ai",
        title: "Rekapitulasi Geofence Harian",
        points: [
          {
            title: "1. Tingkat Kehadiran Tepat Waktu",
            desc: "94.6% dari total 156 teknisi tercatat berada dalam radius zona geofence STO masing-masing.",
          },
        ],
      },
    ],
  },
  {
    id: "session-4",
    title: "Perencanaan Shift & Lembur Tim Lapangan",
    dateGroup: "7 Hari Terakhir",
    updatedAt: "10 Agt 2026",
    messages: [
      {
        id: "u-4",
        sender: "user",
        text: "Bagaimana alokasi jam lembur teknisi minggu lalu?",
      },
      {
        id: "a-4",
        sender: "ai",
        title: "Laporan Akumulasi Jam Lembur",
        points: [
          {
            title: "1. Total Jam Lembur",
            desc: "Tercatat 142 jam lembur terverifikasi dengan utilisasi tertinggi pada penanganan darurat fiber backbone.",
          },
        ],
      },
    ],
  },
]

export default function AIAssistantPage() {
  const [sessions, setSessions] = React.useState<ChatSession[]>(initialMemorySessions)
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false)
  const [searchHistoryQuery, setSearchHistoryQuery] = React.useState("")

  const [inputQuery, setInputQuery] = React.useState("")
  const [selectedTask, setSelectedTask] = React.useState(todaySchedule[2])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Active session & messages getter
  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const currentMessages = activeSession ? activeSession.messages : []

  // Load from localStorage on client mount if available
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("workpulse_ai_memory_sessions")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Save to localStorage whenever sessions change
  React.useEffect(() => {
    try {
      localStorage.setItem("workpulse_ai_memory_sessions", JSON.stringify(sessions))
    } catch {
      // ignore
    }
  }, [sessions])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [currentMessages, isGenerating])

  const handleCreateNewChat = () => {
    setActiveSessionId(null)
    setInputQuery("")
    setIsHistoryModalOpen(false)
    toast.info("Memulai sesi obrolan baru dengan memori bersih.")
  }

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    setInputQuery("")
    setIsHistoryModalOpen(false)
  }

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      setActiveSessionId(null)
    }
    toast.success("Riwayat percakapan berhasil dihapus dari memori.")
  }

  const handleSend = (queryText?: string) => {
    const text = queryText || inputQuery
    if (!text.trim() || isGenerating) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    }

    let targetSessionId = activeSessionId

    // If no active session, create a new one automatically
    if (!targetSessionId) {
      const newId = `session-${Date.now()}`
      const newTitle = text.length > 38 ? text.substring(0, 38) + "..." : text
      const newSession: ChatSession = {
        id: newId,
        title: newTitle,
        dateGroup: "Hari Ini",
        updatedAt: "Baru saja",
        messages: [userMessage],
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSessionId(newId)
      targetSessionId = newId
    } else {
      // Add to existing session
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: [...s.messages, userMessage], updatedAt: "Baru saja" }
            : s
        )
      )
    }

    if (!queryText) setInputQuery("")
    setIsGenerating(true)

    // Call real Groq AI backend API
    const historyForApi = (activeSession?.messages || []).slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text || m.title || "",
    }))

    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: historyForApi,
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        const aiReply = data.reply || "Maaf, sistem tidak menerima respons dari AI."
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiReply,
        }
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? { ...s, messages: [...s.messages, aiResponse] }
              : s
          )
        )
      })
      .catch((err) => {
        console.error("AI Assistant API error:", err)
        const fallbackResponse: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Terjadi kendala saat menghubungi AI Assistant. Pastikan server aktif dan \`GROQ_API_KEY\` telah diisi di file \`.env.local\`.`,
        }
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? { ...s, messages: [...s.messages, fallbackResponse] }
              : s
          )
        )
      })
      .finally(() => {
        setIsGenerating(false)
      })
  }

  const handleCopy = (text?: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success("Respons AI berhasil disalin ke clipboard!")
  }

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchHistoryQuery.toLowerCase())
  )

  const dateGroups: Array<"Hari Ini" | "Kemarin" | "7 Hari Terakhir"> = ["Hari Ini", "Kemarin", "7 Hari Terakhir"]

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
      <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
        
        {/* Single Integrated Clean Header (Zero double borders, 1 single header bar) */}
        <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b rounded-tl-2xl rounded-tr-2xl bg-white px-4 lg:px-6 dark:bg-zinc-950 transition-[width,height] ease-linear">
          {/* Left: SidebarTrigger + Breadcrumbs & Session Title */}
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 text-zinc-500 hover:text-red-600" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium truncate">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-semibold text-foreground truncate">
                {activeSession ? activeSession.title : "AI Assistant"}
              </span>
            </div>
          </div>

          {/* Right: History & New Chat Actions directly in Main Header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* History & Memory Modal Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="h-8 gap-1.5 rounded-[8px] text-xs font-semibold hover:bg-muted/70 cursor-pointer"
            >
              <HistoryIcon className="size-3.5 text-red-600" />
              <span className="hidden sm:inline">Riwayat Obrolan</span>
              <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] h-4 font-mono font-bold bg-muted">
                {sessions.length}
              </Badge>
            </Button>

            {/* New Chat Button */}
            <Button
              onClick={handleCreateNewChat}
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs cursor-pointer"
            >
              <PlusIcon className="size-3.5" />
              <span>Obrolan Baru</span>
            </Button>
          </div>
        </header>

        {/* Clean, Full-Width Single Canvas Layout */}
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-background">

          {/* Center Scrollable Canvas (Full Width & Spacious) */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-16 flex flex-col justify-between max-w-4xl mx-auto w-full">
            {currentMessages.length === 0 ? (
              /* WELCOME / INITIAL STATE */
              <div className="flex flex-col gap-8 my-auto py-6 animate-in fade-in duration-300">
                {/* Greeting */}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Selamat Pagi, Budi
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Tanyakan analisis kinerja, tugas operasional, presensi karyawan, atau simulasi jadwal Telkom Akses.
                  </p>
                </div>

                {/* Big Search Input Box */}
                <div className="rounded-[8px] border-2 border-primary/20 bg-card p-4 shadow-sm focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <textarea
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Tanyakan apa saja seputar operasional..."
                    rows={2}
                    className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[11px] font-medium bg-muted/60 text-muted-foreground gap-1 py-0.5">
                        <SparklesIcon className="size-3 text-red-600" /> WorkPulse AI 3.0
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">Enter ↵ untuk kirim</span>
                    </div>
                    <Button
                      onClick={() => handleSend()}
                      disabled={!inputQuery.trim() || isGenerating}
                      size="icon"
                      className="size-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-xs cursor-pointer"
                    >
                      <ArrowUpIcon className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Suggested Pills */}
                <div className="flex flex-wrap gap-2 items-center">
                  {suggestedPrompts.map((p) => {
                    const IconComponent = p.icon
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSend(p.query)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground cursor-pointer"
                      >
                        <IconComponent className="size-3.5 text-red-600" />
                        <span>{p.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Today's Context & Agenda Section */}
                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Agenda Tugas & Insiden Lapangan
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <span>Hari Ini, 14 Agt</span>
                      <div className="flex items-center gap-0.5 ml-2">
                        <button className="p-1 hover:bg-muted rounded"><ChevronLeftIcon className="size-3.5" /></button>
                        <button className="p-1 hover:bg-muted rounded"><ChevronRightIcon className="size-3.5" /></button>
                      </div>
                    </div>
                  </div>

                  {/* Task Timeline Selector */}
                  <div className="divide-y rounded-[8px] border bg-card overflow-hidden shadow-2xs">
                    {todaySchedule.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedTask(item)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedTask.id === item.id ? "bg-muted/60" : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`size-2 rounded-full ${item.statusColor}`} />
                          <span className={`text-xs font-medium ${selectedTask.id === item.id ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                            {item.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Selected Task Details Expanded Card */}
                  {selectedTask && (
                    <div className="rounded-[8px] border-l-4 border-l-emerald-500 border bg-card p-4 shadow-sm flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            {selectedTask.title}
                          </h4>
                          <span className="text-xs font-mono text-muted-foreground">{selectedTask.time}</span>
                        </div>
                        <Button
                          onClick={() => handleSend(`Analisis dan beri rekomendasi untuk: ${selectedTask.title}`)}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1 rounded-[8px] text-primary font-semibold cursor-pointer"
                        >
                          <SparklesIcon className="size-3" /> Analisis AI
                        </Button>
                      </div>

                      <div className="text-xs">
                        <span className="text-muted-foreground font-semibold block mb-0.5">Deskripsi:</span>
                        <p className="text-foreground leading-relaxed">{selectedTask.details}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-blue-600 font-mono">
                        <Link2Icon className="size-3.5" />
                        <span className="truncate">{selectedTask.link}</span>
                      </div>

                      <div className="pt-2 border-t flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Personil Ditugaskan ({selectedTask.participants.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedTask.participants.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 p-1.5 rounded-[8px] bg-muted/40 text-xs">
                              <Avatar className="size-6 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                                <AvatarFallback>{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="truncate">
                                <span className="font-semibold text-foreground block truncate">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground block truncate">{p.role}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CONVERSATION STREAM */
              <div className="flex flex-col gap-6 py-4">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-2">
                    {msg.sender === "user" ? (
                      <div className="flex justify-end">
                        <div className="rounded-[8px] rounded-tr-xs bg-muted/80 px-4 py-2.5 text-xs text-foreground max-w-[85%] font-medium">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 text-xs max-w-full">
                        {/* Title Header */}
                        {msg.title && (
                          <h3 className="text-base font-bold tracking-tight text-foreground">
                            {msg.title}
                          </h3>
                        )}

                        {/* Rich Context Card */}
                        {msg.contextCard && (
                          <div className={`rounded-[8px] border border-l-4 ${msg.contextCard.statusColor} bg-card p-3.5 shadow-xs flex flex-col gap-2`}>
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-foreground">{msg.contextCard.title}</h4>
                                <p className="text-[11px] text-muted-foreground">{msg.contextCard.time}</p>
                              </div>
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {msg.contextCard.participants.map((p, idx) => (
                                  <div
                                    key={idx}
                                    title={`${p.name} - ${p.role}`}
                                    className="inline-flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary ring-2 ring-background font-bold text-[9px]"
                                  >
                                    {p.name.substring(0, 1)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {msg.contextCard.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px] py-0 px-2 font-normal bg-muted/40">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bullet Points with Bold Headers */}
                        {msg.points && (
                          <div className="flex flex-col gap-2.5 leading-relaxed">
                            {msg.points.map((pt, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-bold text-foreground block">{pt.title}:</span>
                                <span className="text-muted-foreground">{pt.desc}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Real AI Response Text */}
                        {msg.text && (
                          <div className="text-xs text-foreground leading-relaxed rounded-[8px] bg-muted/30 p-3.5 border border-border/60">
                            <AiFormattedText content={msg.text} />
                          </div>
                        )}

                        {/* Follow Up Prompt */}
                        {msg.followUpPrompt && (
                          <p className="text-xs font-semibold text-foreground mt-1">
                            {msg.followUpPrompt}
                          </p>
                        )}

                        {/* Action Bar (Copy, Thumbs Up/Down, Regenerate) */}
                        <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                          <button
                            onClick={() => handleCopy(msg.title || msg.text)}
                            className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                            title="Copy Response"
                          >
                            <CopyIcon className="size-3.5" />
                          </button>
                          <button
                            onClick={() => toast.success("Terima kasih atas feedback positif Anda!")}
                            className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                            title="Helpful"
                          >
                            <ThumbsUpIcon className="size-3.5" />
                          </button>
                          <button
                            onClick={() => toast.info("Feedback telah dicatat untuk peningkatan akurasi model.")}
                            className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                            title="Not Helpful"
                          >
                            <ThumbsDownIcon className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleSend("Tolong elaborasi lebih rinci lagi langkah tindak lanjutnya")}
                            className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                            title="Regenerate"
                          >
                            <RotateCcwIcon className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-3 rounded-[8px] bg-muted/30">
                    <SparklesIcon className="size-4 text-red-600 animate-spin" />
                    <span>WorkPulse AI sedang menganalisis data riwayat tugas & log kinerja...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Sticky Bottom Input Bar when in conversation mode */}
          {currentMessages.length > 0 && (
            <div className="border-t bg-card/80 backdrop-blur-md p-4">
              <div className="max-w-4xl mx-auto flex items-center gap-2 rounded-[8px] border bg-background px-3 py-2 shadow-sm focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10">
                <textarea
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Tanyakan pertanyaan lanjutan..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none max-h-24"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-medium hidden sm:inline-flex py-0.5">
                    Auto
                  </Badge>
                  <Button
                    onClick={() => handleSend()}
                    disabled={!inputQuery.trim() || isGenerating}
                    size="icon"
                    className="size-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                  >
                    <ArrowUpIcon className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Riwayat & Memori Dropdown Modal (Sleek, Clean, No Sidebar Clutter) */}
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-[8px] border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-[8px] bg-red-600 text-white shadow-xs">
                    <SparklesIcon className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Riwayat Obrolan & Memori AI</h3>
                    <p className="text-[11px] text-muted-foreground">Pilih sesi lampau atau mulai obrolan baru</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Search Bar & Action in Modal */}
              <div className="p-3 border-b bg-background/50 flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchHistoryQuery}
                    onChange={(e) => setSearchHistoryQuery(e.target.value)}
                    placeholder="Cari topik obrolan lampau..."
                    className="w-full h-8.5 pl-8.5 pr-3 rounded-[8px] border bg-background text-xs placeholder:text-muted-foreground outline-none focus:border-red-500"
                  />
                </div>
                <Button
                  onClick={handleCreateNewChat}
                  size="sm"
                  className="h-8.5 px-3 text-xs gap-1.5 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs cursor-pointer shrink-0"
                >
                  <PlusIcon className="size-3.5" />
                  <span>Obrolan Baru</span>
                </Button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {dateGroups.map((group) => {
                  const groupSessions = filteredSessions.filter((s) => s.dateGroup === group)
                  if (groupSessions.length === 0) return null

                  return (
                    <div key={group} className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider px-2 block">
                        {group}
                      </span>
                      <div className="space-y-1">
                        {groupSessions.map((session) => {
                          const isActive = activeSessionId === session.id
                          return (
                            <div
                              key={session.id}
                              onClick={() => handleSelectSession(session.id)}
                              className={`group flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium cursor-pointer transition-all border ${
                                isActive
                                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/50 font-semibold"
                                  : "border-transparent text-foreground hover:bg-muted/60 hover:border-border/60"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                                <MessageSquareIcon className={`size-4 shrink-0 ${isActive ? "text-red-600" : "text-muted-foreground"}`} />
                                <div className="truncate">
                                  <span className="block truncate text-xs">{session.title}</span>
                                  <span className="block text-[10px] text-muted-foreground">{session.updatedAt} • {session.messages.length} pesan</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isActive && (
                                  <CheckCircle2Icon className="size-3.5 text-red-600 mr-1" />
                                )}
                                <button
                                  onClick={(e) => handleDeleteSession(e, session.id)}
                                  title="Hapus Sesi"
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 rounded transition-all cursor-pointer"
                                >
                                  <Trash2Icon className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {filteredSessions.length === 0 && (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ditemukan sesi obrolan yang cocok dengan kata kunci.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookmarkCheckIcon className="size-3.5 text-emerald-600" />
                  <span>Memori tersimpan otomatis di perangkat</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="h-7 text-xs cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
