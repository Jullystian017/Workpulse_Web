"use client"

import * as React from "react"
import {
  SparklesIcon,
  SendIcon,
  ChevronRightIcon,
  ZapIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  MapPinIcon,
  FileTextIcon,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const smartActions = [
  {
    id: "overdue",
    title: "Task Overdue",
    desc: "3 Task butuh follow up",
    prompt: "Tunjukkan daftar task overdue yang belum selesai",
    icon: AlertCircleIcon,
    iconBg: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400",
    hoverBorder: "hover:border-red-500/40 hover:bg-red-50/50 dark:hover:bg-red-950/20",
  },
  {
    id: "kinerja",
    title: "Analisis Kinerja",
    desc: "Skor rata-rata 92.4%",
    prompt: "Bagaimana rekap kinerja tim minggu ini?",
    icon: TrendingUpIcon,
    iconBg: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400",
    hoverBorder: "hover:border-red-500/40 hover:bg-red-50/50 dark:hover:bg-red-950/20",
  },
  {
    id: "geofence",
    title: "Presensi Geofence",
    desc: "94.6% Hadir di lokasi",
    prompt: "Cek rekap presensi karyawan geofence hari ini",
    icon: MapPinIcon,
    iconBg: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400",
    hoverBorder: "hover:border-red-500/40 hover:bg-red-50/50 dark:hover:bg-red-950/20",
  },
  {
    id: "rekap",
    title: "Bukti Pekerjaan",
    desc: "118 File terverifikasi",
    prompt: "Berapa total bukti foto & nota yang sudah diverifikasi?",
    icon: FileTextIcon,
    iconBg: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400",
    hoverBorder: "hover:border-red-500/40 hover:bg-red-50/50 dark:hover:bg-red-950/20",
  },
]

export function AiAssistantSheet({
  trigger,
  hideFloating = false,
}: {
  trigger?: React.ReactElement
  hideFloating?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [chatInput, setChatInput] = React.useState("")
  const [showSmartActions, setShowSmartActions] = React.useState(true)
  const [chatMessages, setChatMessages] = React.useState([
    {
      sender: "ai",
      text: "Halo Admin! Saya AI Assistant Telkom Akses. Hari ini terdapat 124 task selesai (69.3%) dan 3 task overdue yang membutuhkan perhatian Anda.",
    },
  ])

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput
    if (!text.trim()) return

    // Hide smart actions grid so chat fills full height
    setShowSmartActions(false)

    setChatMessages((prev) => [...prev, { sender: "user", text }])
    if (!textToSend) setChatInput("")

    // Simulated smart AI reply
    setTimeout(() => {
      let replyText =
        "Berdasarkan analitik real-time, Divisi IT memiliki skor kinerja tertinggi (98.5). Terdapat 3 task overdue di area Depok & Cilandak yang perlu diselesaikan."
      const lower = text.toLowerCase()

      if (lower.includes("overdue") || lower.includes("task")) {
        replyText =
          "Terdapat 3 task overdue: Audit Jaringan Area Depok (TSK-006), Koordinasi Lapangan Proyek X (TSK-015), dan Perbaikan ODP."
      } else if (lower.includes("presensi") || lower.includes("geofence")) {
        replyText =
          "Presensi hari ini mencapai 94.6% (148 Karyawan tepat waktu). 3 Karyawan terlambat rata-rata 15 menit."
      } else if (lower.includes("bukti") || lower.includes("foto")) {
        replyText =
          "Total 118 file bukti pekerjaan (foto ODP & nota material) telah di-upload oleh 17 karyawan dan terverifikasi oleh atasan."
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: replyText }])
    }, 500)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage()
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <SheetTrigger render={trigger} />
      ) : !hideFloating ? (
        <SheetTrigger render={
          <button className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-linear-to-r from-red-600 to-rose-600 px-4 py-3 text-white font-bold text-xs shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-600/30 hover:ring-4 hover:ring-red-500/20 active:scale-95">
            <SparklesIcon className="size-4 fill-white text-white animate-pulse" />
            <span>AI Assistant</span>
          </button>
        } />
      ) : null}

      <SheetContent className="sm:max-w-md flex flex-col h-full p-0 border-l bg-background">
        {/* Top Header — Clean with pr-12 to prevent close button collision */}
        <div className="flex items-center gap-2.5 p-4 pr-12 border-b bg-muted/30 shrink-0">
          <div className="flex size-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
            <SparklesIcon className="size-4 fill-white" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Telkom AI Assistant Drawer</h3>
        </div>

        {/* Modern 2x2 Smart Action Cards Grid */}
        {showSmartActions && (
          <div className="p-3 border-b bg-muted/10 space-y-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <ZapIcon className="size-3 text-red-600" /> Smart Actions
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {smartActions.map((action) => {
                const ActionIcon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSendMessage(action.prompt)}
                    className={`flex flex-col justify-between p-2.5 rounded-xl border bg-card text-left transition-all duration-200 shadow-2xs group ${action.hoverBorder}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`size-6 rounded-lg flex items-center justify-center ${action.iconBg}`}>
                        <ActionIcon className="size-3.5" />
                      </div>
                      <ChevronRightIcon className="size-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-foreground block group-hover:text-red-600 transition-colors">
                        {action.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate block">
                        {action.desc}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex text-xs ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3.5 max-w-[88%] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-red-600 text-white rounded-2xl rounded-tr-xs font-medium shadow-xs"
                    : "bg-muted/60 text-foreground border border-border/60 rounded-2xl rounded-tl-xs shadow-2xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Input Section */}
        <div className="border-t bg-card flex flex-col gap-2 p-3 shrink-0">
          {!showSmartActions && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setShowSmartActions(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors shadow-2xs"
              >
                <ZapIcon className="size-3 text-red-600" /> Tampilkan Smart Actions
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Tanyakan analisis task atau kinerja..."
              className="text-xs h-9 rounded-xl flex-1"
            />
            <Button
              type="submit"
              size="icon"
              className="size-9 rounded-xl bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-xs"
            >
              <SendIcon className="size-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
