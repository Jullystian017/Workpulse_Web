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
  HistoryIcon,
  XIcon,
  BookmarkCheckIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
} from "lucide-react"
import { toast } from "sonner"
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

const staffSuggestedPrompts = [
  { id: "p1", icon: CalendarIcon, label: "Jadwal Shift & Jam Kerja Saya", query: "Bagaimana jadwal shift dan jam kerja saya untuk minggu ini?" },
  { id: "p2", icon: MapPinIcon, label: "Status Presensi GPS Hari Ini", query: "Cek apakah presensi GPS saya hari ini sudah tercatat valid dan dalam radius kantor?" },
  { id: "p3", icon: AlertTriangleIcon, label: "Tugas Mendekati Deadline SLA", query: "Tunjukkan daftar tugas saya yang mendekati deadline SLA hari ini." },
  { id: "p4", icon: ZapIcon, label: "Sisa Kuota Cuti & Prosedur Izin", query: "Berapa sisa kuota cuti tahunan saya dan bagaimana alur pengajuan izin kerja?" },
]

const initialKaryawanSessions: ChatSession[] = [
  {
    id: "ksession-1",
    title: "Konsultasi Target SLA Tugas Mandiri",
    dateGroup: "Hari Ini",
    updatedAt: "09:15 WIB",
    messages: [
      {
        id: "ku-1",
        sender: "user",
        text: "Tunjukkan daftar tugas saya yang mendekati deadline SLA hari ini",
      },
      {
        id: "ka-1",
        sender: "ai",
        title: "Analisis Penugasan Prioritas Anda Hari Ini",
        contextCard: {
          title: "Fokus Penugasan Mandiri",
          time: "Batas Waktu: Hari Ini, 15:00 WIB",
          subtext: "Tiket #TASK-1029 • Divisi Operasional",
          participants: [
            { name: "Anda", role: "Pelaksana Tugas" },
            { name: "Hendro Kusumo", role: "Supervisor" },
          ],
          tags: ["Prioritas Tinggi", "Sisa SLA: 4 Jam", "Menunggu Berkas"],
          statusColor: "border-l-red-500",
        },
        points: [
          {
            title: "1. #TASK-1029: Verifikasi Rekapitulasi SPJ",
            desc: "Segera unggah berkas nota pendukung sebelum pukul 15:00 WIB untuk menghindari penalti kepatuhan SLA.",
          },
          {
            title: "2. #TASK-1044: Koordinasi Laporan Mingguan",
            desc: "Deadline besok pukul 11:00 WIB. Progres saat ini tercatat 65%.",
          },
        ],
        followUpPrompt: "Apakah Anda ingin saya membuka langsung detail tiket #TASK-1029?",
      },
    ],
  },
]

export default function KaryawanAIPage() {
  const [sessions, setSessions] = React.useState<ChatSession[]>(initialKaryawanSessions)
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false)
  const [searchHistoryQuery, setSearchHistoryQuery] = React.useState("")
  const [inputQuery, setInputQuery] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const currentMessages = activeSession ? activeSession.messages : []

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("workpulse_karyawan_ai_sessions")
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

  React.useEffect(() => {
    try {
      localStorage.setItem("workpulse_karyawan_ai_sessions", JSON.stringify(sessions))
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
    toast.info("Memulai sesi obrolan baru.")
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
    toast.success("Riwayat obrolan dihapus.")
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
        console.error("Staff AI error:", err)
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
    toast.success("Respons AI disalin ke clipboard!")
  }

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchHistoryQuery.toLowerCase())
  )

  const dateGroups: Array<"Hari Ini" | "Kemarin" | "7 Hari Terakhir"> = ["Hari Ini", "Kemarin", "7 Hari Terakhir"]

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-background">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-7 items-center justify-center rounded-[8px] bg-red-600 text-white shadow-xs">
            <SparklesIcon className="size-4" />
          </div>
          <div className="truncate">
            <h2 className="text-xs font-bold text-foreground truncate">
              {activeSession ? activeSession.title : "AI Assistant Portal Karyawan"}
            </h2>
            <p className="text-[10px] text-muted-foreground">Didukung WorkPulse AI Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="h-8 gap-1.5 rounded-[8px] text-xs font-semibold hover:bg-muted/70 cursor-pointer"
          >
            <HistoryIcon className="size-3.5 text-red-600" />
            <span className="hidden sm:inline">Riwayat</span>
            <Badge variant="secondary" className="px-1 py-0 text-[10px] h-4 font-mono font-bold bg-muted">
              {sessions.length}
            </Badge>
          </Button>

          <Button
            onClick={handleCreateNewChat}
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs cursor-pointer"
          >
            <PlusIcon className="size-3.5" />
            <span>Obrolan Baru</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-16 flex flex-col justify-between max-w-4xl mx-auto w-full">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col gap-6 my-auto py-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Halo, Ada yang bisa dibantu?
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Tanyakan seputar tugas harian, presensi GPS, kuota cuti, atau panduan SOP Telkom Akses.
              </p>
            </div>

            {/* Input Box */}
            <div className="rounded-[8px] border-2 border-primary/20 bg-card p-4 shadow-xs focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
              <textarea
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ketik pertanyaan atau kebutuhan tugas Anda..."
                rows={2}
                className="w-full resize-none bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/40">
                <Badge variant="outline" className="text-[11px] font-medium bg-muted/60 text-muted-foreground gap-1 py-0.5">
                  <SparklesIcon className="size-3 text-red-600" /> AI Assistant
                </Badge>
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
              {staffSuggestedPrompts.map((p) => {
                const IconComp = p.icon
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSend(p.query)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground cursor-pointer"
                  >
                    <IconComp className="size-3.5 text-red-600" />
                    <span>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            {currentMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-2">
                {msg.sender === "user" ? (
                  <div className="flex justify-end">
                    <div className="rounded-[8px] bg-muted/80 px-4 py-2.5 text-xs text-foreground max-w-[85%] font-medium">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-xs max-w-full">
                    {msg.title && (
                      <h3 className="text-sm font-bold tracking-tight text-foreground">
                        {msg.title}
                      </h3>
                    )}

                    {msg.contextCard && (
                      <div className={`rounded-[8px] border border-l-4 ${msg.contextCard.statusColor} bg-card p-3.5 shadow-xs flex flex-col gap-2`}>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{msg.contextCard.title}</h4>
                            <p className="text-[11px] text-muted-foreground">{msg.contextCard.time}</p>
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

                    {msg.followUpPrompt && (
                      <p className="text-xs font-semibold text-foreground mt-1">
                        {msg.followUpPrompt}
                      </p>
                    )}

                    <div className="flex items-center gap-1 pt-1 text-muted-foreground">
                      <button
                        onClick={() => handleCopy(msg.title || msg.text)}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                        title="Copy"
                      >
                        <CopyIcon className="size-3.5" />
                      </button>
                      <button
                        onClick={() => toast.success("Terima kasih atas feedback Anda!")}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                        title="Helpful"
                      >
                        <ThumbsUpIcon className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleSend("Jelaskan lebih detail")}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                        title="Ulangi"
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
                <span>AI sedang memeriksa data sistem...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Input Bar in conversation mode */}
      {currentMessages.length > 0 && (
        <div className="border-t bg-card/80 backdrop-blur-md p-4 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-2 rounded-[8px] border bg-background px-3 py-2 shadow-xs focus-within:border-primary/60">
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
            <Button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isGenerating}
              size="icon"
              className="size-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer shrink-0"
            >
              <ArrowUpIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[8px] border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-[8px] bg-red-600 text-white shadow-xs">
                  <SparklesIcon className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Riwayat Obrolan AI</h3>
                  <p className="text-[11px] text-muted-foreground">Pilih sesi lampau atau mulai percakapan baru</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="p-3 border-b bg-background/50 flex items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  placeholder="Cari topik obrolan..."
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
                              {isActive && <CheckCircle2Icon className="size-3.5 text-red-600 mr-1" />}
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
                  Tidak ada sesi obrolan yang cocok.
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookmarkCheckIcon className="size-3.5 text-emerald-600" />
                <span>Memori tersimpan di perangkat</span>
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
    </div>
  )
}
