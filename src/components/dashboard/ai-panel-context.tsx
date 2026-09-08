"use client"

import * as React from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { getActiveUserFromStorage, getExecutiveKpiStats, getTasks } from "@/lib/api"

export interface AiPanelContextType {
  isOpen: boolean
  openAiPanel: () => void
  closeAiPanel: () => void
  toggleAiPanel: () => void
  messages: { sender: "user" | "ai"; text: string; isStreaming?: boolean }[]
  sendMessage: (text: string) => Promise<void>
  resetChat: () => void
  groqApiKey: string
  setGroqApiKey: (key: string) => void
}

const GROQ_KEY_STORAGE = "workpulse_groq_api_key"
const AiPanelContext = React.createContext<AiPanelContextType | null>(null)

export function AiPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const sidebar = useSidebar()
  const isSidebarOpen = sidebar?.open ?? false
  const setSidebarOpen = sidebar?.setOpen ?? (() => {})
  const prevSidebarOpenRef = React.useRef(isSidebarOpen)
  const [groqApiKey, setGroqApiKeyState] = React.useState("")

  const [messages, setMessages] = React.useState<{ sender: "user" | "ai"; text: string; isStreaming?: boolean }[]>([
    {
      sender: "ai",
      text: "Halo! 👋 Saya Smart AI Assistant WorkPulse Telkom Akses (Powered by **Groq Llama 3.3**). Saya siap membantu Anda menganalisa agenda tugas kantor, memantau antrean verifikasi atasan, dan memberikan rekomendasi delegasi personil terbaik.",
    },
  ])

  // Load custom key from storage if present
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem(GROQ_KEY_STORAGE) || ""
      setGroqApiKeyState(savedKey)
    }
  }, [])

  const setGroqApiKey = React.useCallback((key: string) => {
    setGroqApiKeyState(key)
    if (typeof window !== "undefined") {
      localStorage.setItem(GROQ_KEY_STORAGE, key)
    }
  }, [])

  // Initial personalized greeting from live data
  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    getExecutiveKpiStats()
      .then((stats) => {
        if (user && stats) {
          setMessages([
            {
              sender: "ai",
              text: `Halo **${user.nama}**! 👋 Saya Smart AI Assistant WorkPulse Telkom Akses (Powered by **Groq Llama 3.3 ⚡**).\n\nSaat ini terdapat **${stats.totalTasks} penugasan** di sistem, dengan **${stats.reviewTasks} tugas** menunggu verifikasi atasan dan **${stats.unassignedTasks} tugas** di Unassigned Pool. Ada yang bisa saya bantu analisa hari ini?`,
            },
          ])
        }
      })
      .catch(console.error)
  }, [])

  // Automatically close right AI panel whenever user expands the left sidebar
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

  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!text.trim()) return

      const userMsg = { sender: "user" as const, text }
      const thinkingMsg = {
        sender: "ai" as const,
        text: "Menghubungi Groq Llama 3.3 & menganalisa data Telkom Akses...",
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, thinkingMsg])

      try {
        const historyForApi = messages.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.text,
        }))

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historyForApi,
            customApiKey: groqApiKey || undefined,
          }),
        })

        const json = await res.json()

        setMessages((prev) => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
            updated[lastIdx] = {
              sender: "ai",
              text: json.reply || json.error || "Tidak ada respon dari model AI.",
              isStreaming: false,
            }
          }
          return updated
        })
      } catch (err: any) {
        console.error("AI Fetch Error:", err)
        setMessages((prev) => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
            updated[lastIdx] = {
              sender: "ai",
              text: `⚠️ Kendala koneksi AI: ${err?.message || "Gagal menghubungi server"}.`,
              isStreaming: false,
            }
          }
          return updated
        })
      }
    },
    [messages, groqApiKey]
  )

  const resetChat = React.useCallback(() => {
    setMessages([
      {
        sender: "ai",
        text: "Sesi percakapan baru dimulai. Tanyakan apa saja seputar agenda tugas kantor, SLA, dan delegasi wewenang personil Telkom Akses.",
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
        groqApiKey,
        setGroqApiKey,
      }}
    >
      {children}
    </AiPanelContext.Provider>
  )
}

export function useAiPanel(): AiPanelContextType | null {
  return React.useContext(AiPanelContext)
}
