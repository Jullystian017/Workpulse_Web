"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SparklesIcon,
  SendIcon,
  XIcon,
  Maximize2Icon,
  TrendingUpIcon,
  AlertCircleIcon,
  FileTextIcon,
  BotIcon,
  RotateCcwIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AiFormattedText } from "@/components/dashboard/ai-formatted-text"

const smartActions = [
  {
    id: "pulse",
    title: "Ringkasan Pulse Tugas",
    prompt: "Berikan ringkasan cepat status tugas hari ini: berapa yang sedang berjalan, selesai, dan tertunda?",
    icon: TrendingUpIcon,
    iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400",
  },
  {
    id: "urgent",
    title: "Tugas Prioritas & Deadline",
    prompt: "Tampilkan daftar tugas berprioritas tinggi atau yang paling mendesak diselesaikan saat ini.",
    icon: AlertCircleIcon,
    iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
  },
  {
    id: "allocation",
    title: "Rekomendasi Alokasi Tim",
    prompt: "Siapa personil yang kapasitas kerjanya paling longgar untuk menerima tugas baru?",
    icon: SparklesIcon,
    iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
  },
  {
    id: "pool",
    title: "Cek Tiket Pool Tanpa PIC",
    prompt: "Tugas apa saja yang saat ini masih berada di Pool dan belum memiliki PIC penanggung jawab?",
    icon: FileTextIcon,
    iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
]

export function AiIntegratedPanel() {
  const pathname = usePathname()
  const aiPanel = useAiPanel()
  const [inputValue, setInputValue] = React.useState("")
  const [showSmartActions, setShowSmartActions] = React.useState(true)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const isOpen = aiPanel?.isOpen ?? false
  const messages = aiPanel?.messages ?? []
  const closeAiPanel = aiPanel?.closeAiPanel

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  // Close panel on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeAiPanel) {
        closeAiPanel()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeAiPanel])

  // Don't render floating panel if on full-page AI Assistant or closed
  if (!aiPanel || !isOpen || pathname === "/admin/ai" || pathname === "/karyawan/ai") return null

  const { sendMessage, resetChat } = aiPanel

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
    <>
      {/* Semi-transparent backdrop to close on click outside */}
      <div
        onClick={closeAiPanel}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] animate-in fade-in duration-200"
      />

      <aside
        aria-label="AI Assistant Integrated Panel"
        className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[390px] lg:w-[410px] border-l border-border bg-card/98 backdrop-blur-md flex flex-col shadow-2xl animate-in slide-in-from-right-4 duration-300 font-sans"
      >
        {/* Panel Top Header */}
        <div className="flex items-center justify-between p-3 px-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground tracking-tight">
              WorkPulse AI
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Maximize to full page */}
            <Link
              href="/admin/ai"
              onClick={closeAiPanel}
              title="Buka Halaman Penuh"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Maximize2Icon className="size-3.5" />
            </Link>
            <button
              onClick={handleReset}
              title="Reset Chat"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCcwIcon className="size-3.5" />
            </button>
            <button
              onClick={closeAiPanel}
              title="Tutup Panel AI (Esc)"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
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
              <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-muted/30 border border-border">
                <div className="relative mb-2">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-xs">
                    <SparklesIcon className="size-5.5 fill-white text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-foreground">WorkPulse AI Copilot</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px] leading-relaxed">
                  Asisten cerdas pendamping operasional dan analisis data penugasan kantor.
                </p>
              </div>

              {/* Smart Actions List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
                  Pintasan Cepat WorkPulse
                </span>
                <div className="space-y-1.5">
                  {smartActions.map((action) => {
                    const ActionIcon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action.prompt)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-red-400 text-left transition-all text-xs group shadow-xs cursor-pointer"
                      >
                        <div
                          className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${action.iconColor}`}
                        >
                          <ActionIcon className="size-3.5" />
                        </div>
                        <span className="font-semibold text-foreground truncate group-hover:text-red-600 transition-colors">
                          {action.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Stream View */
            <div className="space-y-3.5 flex-1">
              {messages.map((msg, index) => {
                const isUser = msg.sender === "user"
                return (
                  <div
                    key={index}
                    className={`flex flex-col gap-1 ${
                      isUser ? "items-end" : "items-start"
                    } animate-in fade-in duration-200`}
                  >
                    <div className="flex items-center gap-1.5 px-1">
                      {!isUser && (
                        <div className="size-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                          <BotIcon className="size-2.5" />
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {isUser ? "Anda" : "WorkPulse AI"}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[92%] shadow-xs ${
                        isUser
                          ? "bg-red-600 text-white font-medium rounded-br-none whitespace-pre-line"
                          : "bg-muted/50 text-foreground border border-border rounded-bl-none"
                      }`}
                    >
                      {msg.isStreaming ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="size-2 rounded-full bg-red-600 animate-ping" />
                          <span>{msg.text}</span>
                        </div>
                      ) : isUser ? (
                        msg.text
                      ) : (
                        <AiFormattedText content={msg.text} />
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Field */}
        <div className="p-3 border-t border-border bg-card shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tanya AI seputar agenda tugas, SOP, atau personil..."
              className="h-9 pr-10 pl-3 rounded-xl text-xs bg-muted/40 font-medium"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim()}
              className="absolute right-1 size-7 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
            >
              <SendIcon className="size-3.5" />
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
