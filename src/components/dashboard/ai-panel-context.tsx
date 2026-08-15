"use client"

import * as React from "react"
import { useSidebar } from "@/components/ui/sidebar"

export interface AiPanelContextType {
  isOpen: boolean
  openAiPanel: () => void
  closeAiPanel: () => void
  toggleAiPanel: () => void
  messages: { sender: "user" | "ai"; text: string }[]
  sendMessage: (text: string) => void
  resetChat: () => void
}

const AiPanelContext = React.createContext<AiPanelContextType | null>(null)

export function AiPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const sidebar = useSidebar()
  const isSidebarOpen = sidebar?.open ?? false
  const setSidebarOpen = sidebar?.setOpen ?? (() => {})
  const prevSidebarOpenRef = React.useRef(isSidebarOpen)

  const [messages, setMessages] = React.useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "Halo Budi! 👋 Saya AI Assistant Telkom Akses. Hari ini terdapat 124 task selesai dan 3 task overdue yang butuh follow up.",
    },
  ])

  // Automatically close right AI panel whenever user expands the left sidebar!
  React.useEffect(() => {
    if (isSidebarOpen && !prevSidebarOpenRef.current && isOpen) {
      setIsOpen(false)
    }
    prevSidebarOpenRef.current = isSidebarOpen
  }, [isSidebarOpen, isOpen])

  const openAiPanel = React.useCallback(() => {
    setIsOpen(true)
    setSidebarOpen(false)
  }, [setSidebarOpen])

  const closeAiPanel = React.useCallback(() => {
    setIsOpen(false)
    setSidebarOpen(true)
  }, [setSidebarOpen])

  const toggleAiPanel = React.useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
      setSidebarOpen(true)
    } else {
      setIsOpen(true)
      setSidebarOpen(false)
    }
  }, [isOpen, setSidebarOpen])

  const sendMessage = React.useCallback((text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [...prev, { sender: "user", text }])

    setTimeout(() => {
      let reply = "Berdasarkan analitik real-time Telkom Akses, seluruh indikator operasional dalam rentang aman."
      const lower = text.toLowerCase()

      if (lower.includes("overdue") || lower.includes("task") || lower.includes("sla")) {
        reply = "Terdapat 3 task overdue: Audit Jaringan Area Depok (TSK-006), Koordinasi Lapangan (TSK-015), dan Perbaikan ODP Gambir."
      } else if (lower.includes("kinerja") || lower.includes("skor")) {
        reply = "Skor rata-rata kinerja karyawan minggu ini mencapai 92.4% (+3.2% dari target SLA)."
      } else if (lower.includes("presensi") || lower.includes("geofence")) {
        reply = "94.6% (148 teknisi) telah clock-in tepat waktu dalam radius geofence STO/wilayah kerja."
      } else if (lower.includes("anggaran") || lower.includes("biaya") || lower.includes("material")) {
        reply = "118 bukti nota material dan foto ODP telah terverifikasi secara otomatis oleh sistem."
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }])
    }, 450)
  }, [])

  const resetChat = React.useCallback(() => {
    setMessages([
      {
        sender: "ai",
        text: "Sesi percakapan baru dimulai. Tanyakan apa saja seputar operasional Telkom Akses.",
      },
    ])
  }, [])

  return (
    <AiPanelContext.Provider
      value={{
        isOpen,
        openAiPanel,
        closeAiPanel,
        toggleAiPanel,
        messages,
        sendMessage,
        resetChat,
      }}
    >
      {children}
    </AiPanelContext.Provider>
  )
}

export function useAiPanel(): AiPanelContextType | null {
  return React.useContext(AiPanelContext)
}
