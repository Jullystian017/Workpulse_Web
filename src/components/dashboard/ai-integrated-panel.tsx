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
  FileTextIcon,
  BotIcon,
  RotateCcwIcon,
  ZapIcon,
  KeyRoundIcon,
  CheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const smartActions = [
  {
    id: "review",
    title: "Cek Antrean Verifikasi Atasan",
    prompt: "Tunjukkan tugas apa saja yang siap untuk diverifikasi dan disetujui atasan?",
    icon: FileTextIcon,
    iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
  },
  {
    id: "overdue",
    title: "Cek Pelanggaran SLA & Deadline",
    prompt: "Tunjukkan daftar tugas kantor yang mendekati deadline atau berisiko melanggar SLA",
    icon: AlertCircleIcon,
    iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400",
  },
  {
    id: "delegasi",
    title: "Rekomendasi Delegasi Wewenang",
    prompt: "Siapa personil dengan beban kerja paling optimal untuk didelegasikan tugas baru?",
    icon: SparklesIcon,
    iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
  },
  {
    id: "kinerja",
    title: "Ringkasan Output & Kinerja Divisi",
    prompt: "Berapa persentase penyelesaian tugas kantor dan skor performa tim saat ini?",
    icon: TrendingUpIcon,
    iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
]

export function AiIntegratedPanel() {
  const aiPanel = useAiPanel()
  const [inputValue, setInputValue] = React.useState("")
  const [showSmartActions, setShowSmartActions] = React.useState(true)
  const [isKeyDialogOpen, setIsKeyDialogOpen] = React.useState(false)
  const [tempKey, setTempKey] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const isOpen = aiPanel?.isOpen ?? false
  const messages = aiPanel?.messages ?? []

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  if (!aiPanel || !isOpen) return null

  const { closeAiPanel, sendMessage, resetChat, groqApiKey, setGroqApiKey } = aiPanel

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

  const handleOpenKeyDialog = () => {
    setTempKey(groqApiKey)
    setIsKeyDialogOpen(true)
  }

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault()
    setGroqApiKey(tempKey.trim())
    setIsKeyDialogOpen(false)
    toast.success("Groq API Key berhasil disimpan!")
  }

  return (
    <>
      <aside
        aria-label="AI Assistant Integrated Panel"
        className="w-80 lg:w-[350px] shrink-0 border-l border-border bg-card flex flex-col h-full min-h-full self-stretch animate-in slide-in-from-right-4 duration-300 z-20 shadow-xs font-sans"
      >
        {/* Panel Top Header */}
        <div className="flex items-center justify-between p-3 px-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground tracking-tight">
              WorkPulse AI
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-[9px] font-extrabold flex items-center gap-0.5 border border-orange-200 dark:border-orange-900">
              <ZapIcon className="size-2.5 fill-orange-500 text-orange-500" />
              Groq Llama 3.3
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenKeyDialog}
              title="Konfigurasi Groq API Key"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <KeyRoundIcon className="size-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset Chat"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCcwIcon className="size-3.5" />
            </button>
            <button
              onClick={closeAiPanel}
              title="Tutup Panel AI"
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
                  Didukung model berkecepatan tinggi <span className="font-bold text-foreground">Groq Llama 3.3 70B</span> untuk analisis operasional instan.
                </p>
              </div>

              {/* Smart Actions List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
                  Pintasan Analisis Cepat
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
                        {isUser ? "Anda" : "WorkPulse AI (Groq)"}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[92%] whitespace-pre-line shadow-xs ${
                        isUser
                          ? "bg-red-600 text-white font-medium rounded-br-none"
                          : "bg-muted/50 text-foreground border border-border rounded-bl-none"
                      }`}
                    >
                      {msg.isStreaming ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="size-2 rounded-full bg-red-600 animate-ping" />
                          <span>{msg.text}</span>
                        </div>
                      ) : (
                        msg.text
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
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted-foreground">
            <span>Powered by Groq • Llama 3.3 70B</span>
            <button
              onClick={() => setShowSmartActions(!showSmartActions)}
              className="font-bold text-red-600 hover:underline cursor-pointer"
            >
              {showSmartActions ? "Tutup Pintasan" : "Buka Pintasan"}
            </button>
          </div>
        </div>
      </aside>

      {/* Groq API Key Config Dialog */}
      <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <ZapIcon className="size-5 text-orange-500 fill-orange-500" />
              Konfigurasi Groq API Key
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Masukkan API Key Groq Anda (`gsk_...`) untuk mengaktifkan pemrosesan AI super cepat menggunakan Llama 3.3.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveKey} className="space-y-3 mt-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Groq API Key
              </label>
              <Input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="gsk_..."
                className="mt-1 h-10 rounded-xl text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Kunci ini disimpan aman secara lokal di browser Anda atau bisa diatur di file `.env.local` server.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsKeyDialogOpen(false)}
                className="h-9 text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-1.5"
              >
                <CheckIcon className="size-3.5" /> Simpan API Key
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
