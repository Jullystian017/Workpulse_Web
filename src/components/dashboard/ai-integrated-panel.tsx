"use client"

import * as React from "react"
import Link from "next/link"
import {
  SparklesIcon,
  SendIcon,
  XIcon,
  Maximize2Icon,
  TrendingUpIcon,
  AlertCircleIcon,
  MapPinIcon,
  FileTextIcon,
  BotIcon,
  RotateCcwIcon,
  ZapIcon,
} from "lucide-react"

import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import { Button } from "@/components/ui/button"

const smartActions = [
  {
    id: "kinerja",
    title: "Analisis Kinerja Tim",
    prompt: "Bagaimana analisis dan rekap kinerja karyawan minggu ini?",
    icon: TrendingUpIcon,
    iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
  },
  {
    id: "overdue",
    title: "Cek Task Overdue & SLA",
    prompt: "Tunjukkan daftar task overdue yang berisiko melanggar SLA",
    icon: AlertCircleIcon,
    iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400",
  },
  {
    id: "geofence",
    title: "Presensi Geofence Hari Ini",
    prompt: "Berapa persentase presensi geofence dan siapa saja yang terlambat?",
    icon: MapPinIcon,
    iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  {
    id: "dokumen",
    title: "Verifikasi Dokumen & Bukti",
    prompt: "Berapa total bukti nota material & foto ODP yang terverifikasi?",
    icon: FileTextIcon,
    iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
  },
]

export function AiIntegratedPanel() {
  const aiPanel = useAiPanel()
  const [inputValue, setInputValue] = React.useState("")
  const [showSmartActions, setShowSmartActions] = React.useState(true)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const isOpen = aiPanel?.isOpen ?? false
  const messages = aiPanel?.messages ?? []

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  if (!aiPanel || !isOpen) return null

  const { closeAiPanel, sendMessage, resetChat } = aiPanel

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim()) return
    setShowSmartActions(false)
    sendMessage(inputValue)
    setInputValue("")
  }

  const handleActionClick = (prompt: string) => {
    setShowSmartActions(false)
    sendMessage(prompt)
  }

  const handleReset = () => {
    setShowSmartActions(true)
    resetChat()
  }

  return (
    <aside
      aria-label="AI Assistant Integrated Panel"
      className="w-80 lg:w-[350px] shrink-0 border-l bg-card flex flex-col h-full min-h-full self-stretch animate-in slide-in-from-right-4 duration-300 z-20 shadow-xs"
    >
      {/* Panel Top Header */}
      <div className="flex items-center justify-between p-3 px-4 border-b bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground tracking-tight">WorkPulse AI</span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/ai"
            title="Buka Halaman Penuh"
            className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Maximize2Icon className="size-3.5" />
          </Link>
          <button
            onClick={handleReset}
            title="Reset Chat"
            className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <RotateCcwIcon className="size-3.5" />
          </button>
          <button
            onClick={closeAiPanel}
            title="Tutup Panel AI"
            className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {showSmartActions ? (
          /* Initial Hero & Smart Actions Mode */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Cute AI Hero Greeting Box with Sparkle Logo */}
            <div className="flex flex-col items-center text-center p-3.5 rounded-[8px] bg-muted/30 border border-border/50">
              <div className="relative mb-2">
                <div className="flex size-11 items-center justify-center rounded-[8px] bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-sm shadow-red-500/30">
                  <SparklesIcon className="size-5.5 fill-white text-white" />
                </div>
                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Halo Budi! 👋</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px] leading-relaxed">
                Saya <span className="font-semibold text-foreground">WorkPulse AI</span>. Ada yang bisa saya bantu analisis hari ini?
              </p>
            </div>

            {/* Smart Actions List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block px-1">
                Smart Actions
              </span>
              <div className="space-y-1.5">
                {smartActions.map((action) => {
                  const ActionIcon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action.prompt)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-[8px] border bg-background hover:bg-muted/50 hover:border-primary/40 text-left transition-all text-xs group shadow-2xs cursor-pointer"
                    >
                      <div className={`size-6 rounded-[8px] flex items-center justify-center shrink-0 ${action.iconColor}`}>
                        <ActionIcon className="size-3.5" />
                      </div>
                      <span className="flex-1 font-medium text-foreground text-[11px] truncate group-hover:text-primary transition-colors">
                        {action.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Restore Smart Actions Bar when in full chat mode */
          <div className="flex items-center justify-between pb-1 border-b">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              Obrolan Langsung
            </span>
            <button
              onClick={() => setShowSmartActions(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              <ZapIcon className="size-3" /> Smart Actions
            </button>
          </div>
        )}

        {/* Chat Stream (Takes Full Height when Smart Actions are hidden) */}
        <div className={`flex-1 space-y-2.5 ${showSmartActions ? "pt-2 border-t" : "pt-1"}`}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex text-xs ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 max-w-[90%] leading-relaxed text-[11px] ${
                  msg.sender === "user"
                    ? "bg-red-600 text-white rounded-[8px] rounded-tr-xs font-medium shadow-xs"
                    : "bg-muted/70 text-foreground border border-border/60 rounded-[8px] rounded-tl-xs shadow-2xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Bottom Input */}
      <div className="p-3 border-t bg-card shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tanyakan ke WorkPulse AI..."
            className="flex-1 h-9 rounded-[8px] border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
            className="size-9 rounded-[8px] bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-xs cursor-pointer"
          >
            <SendIcon className="size-3.5" />
          </Button>
        </form>
      </div>
    </aside>
  )
}
