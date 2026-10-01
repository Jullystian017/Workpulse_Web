"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  SearchIcon,
  SparklesIcon,
  PlusIcon,
  CheckSquareIcon,
  UsersIcon,
  FileSpreadsheetIcon,
  LayoutDashboardIcon,
  FileBarChartIcon,
  ActivityIcon,
  CalendarIcon,
  ArrowRightIcon,
  XIcon,
  CommandIcon,
} from "lucide-react"

import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import { getTasks, getChannels, getAllUsers, getActiveUserFromStorage } from "@/lib/api"
import { Task, Channel, User } from "@/types/database"

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenCreateTask?: () => void
}

export function CommandPalette({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onOpenCreateTask,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = externalOpen !== undefined
  const isOpen = isControlled ? externalOpen : internalOpen

  const setOpen = React.useCallback(
    (val: boolean) => {
      if (isControlled && externalOnOpenChange) {
        externalOnOpenChange(val)
      } else {
        setInternalOpen(val)
      }
    },
    [isControlled, externalOnOpenChange]
  )

  const router = useRouter()
  const pathname = usePathname()
  const aiPanel = useAiPanel()

  const [query, setQuery] = React.useState("")
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [activeUser, setActiveUser] = React.useState<User | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Global Keyboard shortcut: Ctrl+K or Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(!isOpen)
      } else if (e.key === "Escape" && isOpen) {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, setOpen])

  // Fetch contextual data on first open
  React.useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      const user = getActiveUserFromStorage()
      setActiveUser(user)
      Promise.all([getTasks(), getChannels(), getAllUsers()])
        .then(([t, c, u]) => {
          setTasks(t)
          setChannels(c)
          setUsers(u)
        })
        .catch(console.error)
    }
  }, [isOpen])

  // Detect whether current scope is Karyawan or Admin based on URL and user role
  const isKaryawan = React.useMemo(() => {
    if (pathname?.startsWith("/karyawan")) return true
    if (activeUser && activeUser.role !== "admin") return true
    return false
  }, [pathname, activeUser])

  const isAdmin = !isKaryawan

  // Filter tasks tailored for karyawan or admin
  const userFilteredTasks = React.useMemo(() => {
    if (isAdmin) {
      return tasks
    }

    if (!activeUser) return tasks

    if (activeUser.role === "staff") {
      return tasks.filter(
        (t) =>
          t.assigned_to === activeUser.id ||
          t.created_by === activeUser.id ||
          (t.status === "unassigned" && !t.assigned_to)
      )
    }

    // Officer, Manager, SGM: own tasks + subordinates' tasks
    const subordinateIds = users
      .filter((u) => u.supervisor_id === activeUser.id)
      .map((u) => u.id)

    return tasks.filter(
      (t) =>
        t.assigned_to === activeUser.id ||
        t.created_by === activeUser.id ||
        (t.status === "unassigned" && !t.assigned_to) ||
        (t.assigned_to && subordinateIds.includes(t.assigned_to))
    )
  }, [tasks, users, activeUser, isAdmin])

  // Build filterable items strictly matching sidebar pages
  const filteredActions = React.useMemo(() => {
    const q = query.toLowerCase().trim()

    // ── 1. AKSI CEPAT (Role-Aware, No Dark Mode) ──
    const quickActions = isAdmin
      ? [
          {
            id: "act-create-task",
            category: "Aksi Cepat",
            title: "Buat Penugasan Kantor Baru",
            subtitle: "Terbitkan tugas ke pool atau langsung delegasikan",
            icon: PlusIcon,
            iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400",
            action: () => {
              setOpen(false)
              if (onOpenCreateTask) {
                onOpenCreateTask()
              } else {
                router.push("/admin/tasks?action=create")
              }
            },
          },
          {
            id: "act-ai-assistant",
            category: "Aksi Cepat",
            title: "Buka WorkPulse AI Assistant",
            subtitle: "Analisis beban kerja, SLA, dan rekomendasi delegasi",
            icon: SparklesIcon,
            iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400",
            action: () => {
              setOpen(false)
              if (aiPanel) {
                aiPanel.openAiPanel()
              } else {
                router.push("/admin/ai")
              }
            },
          },
          {
            id: "act-export-report",
            category: "Aksi Cepat",
            title: "Export Rekap Laporan Kinerja & SLA",
            subtitle: "Buka halaman download CSV / Cetak PDF Resmi",
            icon: FileSpreadsheetIcon,
            iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
            action: () => {
              setOpen(false)
              router.push("/admin/laporan/kinerja")
            },
          },
        ]
      : [
          {
            id: "act-staff-ai",
            category: "Aksi Cepat",
            title: "Buka WorkPulse AI Assistant",
            subtitle: "Konsultasi cerdas dan ringkasan kerja tugas harian",
            icon: SparklesIcon,
            iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400",
            action: () => {
              setOpen(false)
              if (aiPanel) {
                aiPanel.openAiPanel()
              } else {
                router.push("/karyawan/ai")
              }
            },
          },
          {
            id: "act-staff-tasks",
            category: "Aksi Cepat",
            title: "Lihat Tugas Saya yang Sedang Berjalan",
            subtitle: "Buka daftar checklist penugasan aktif Anda",
            icon: CheckSquareIcon,
            iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
            action: () => {
              setOpen(false)
              router.push("/karyawan/tasks")
            },
          },
          {
            id: "act-staff-calendar",
            category: "Aksi Cepat",
            title: "Buka Kalender Agenda Kerja",
            subtitle: "Pantau deadline penugasan dalam tampilan kalender mingguan",
            icon: CalendarIcon,
            iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
            action: () => {
              setOpen(false)
              router.push("/karyawan/tasks?view=calendar")
            },
          },
        ]

    // ── 2. DAFTAR TUGAS AKTIF (Filtered strictly by Role) ──
    const taskCategory = isKaryawan ? "Tugas Saya yang Aktif" : "Penugasan Kantor Aktif"
    const taskItems = userFilteredTasks.map((t) => ({
      id: `task-${t.id}`,
      category: taskCategory,
      title: `[${t.ticket_code}] ${t.title}`,
      subtitle: `Status: ${t.status.toUpperCase()} • PIC: ${t.assignee?.nama || "Unassigned Pool"} • Prioritas: ${t.priority.toUpperCase()}`,
      icon: CheckSquareIcon,
      iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400",
      action: () => {
        setOpen(false)
        const baseTaskRoute = isKaryawan ? "/karyawan/tasks" : "/admin/tasks"
        router.push(`${baseTaskRoute}?task=${t.id}`)
      },
    }))

    // ── 3. NAVIGASI HALAMAN (STRICTLY matching each sidebar) ──
    // Admin Sidebar pages:
    // - Dashboard Utama (/admin/dashboard)
    // - Penugasan Kantor (/admin/tasks)
    // - Karyawan & Organogram (/admin/karyawan)
    // - Laporan Kinerja & SLA (/admin/laporan/kinerja)
    // - Log Aktivitas & Audit (/admin/log)
    // Staff Sidebar pages:
    // - Dashboard Saya (/karyawan/dashboard)
    // - Tugas Saya (/karyawan/tasks)
    // - AI Assistant (/karyawan/ai)
    const navItems = isAdmin
      ? [
          {
            id: "nav-dash",
            category: "Navigasi Halaman",
            title: "Dashboard Utama",
            subtitle: "Ringkasan KPI, Area Chart interaktif, dan status tugas kantor",
            icon: LayoutDashboardIcon,
            iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60",
            action: () => {
              setOpen(false)
              router.push("/admin/dashboard")
            },
          },
          {
            id: "nav-tasks",
            category: "Navigasi Halaman",
            title: "Penugasan Kantor",
            subtitle: "Kelola Kanban, Tabel, Timeline, dan Kapasitas Tim",
            icon: CheckSquareIcon,
            iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/60",
            action: () => {
              setOpen(false)
              router.push("/admin/tasks")
            },
          },
          {
            id: "nav-karyawan",
            category: "Navigasi Halaman",
            title: "Karyawan & Organogram",
            subtitle: "Struktur hierarki personil SGM, Manager, Officer, dan Staff",
            icon: UsersIcon,
            iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/60",
            action: () => {
              setOpen(false)
              router.push("/admin/karyawan")
            },
          },
          {
            id: "nav-laporan",
            category: "Navigasi Halaman",
            title: "Laporan Kinerja & SLA",
            subtitle: "Akuntabilitas pengerjaan tugas dan persentase SLA On-Time",
            icon: FileBarChartIcon,
            iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60",
            action: () => {
              setOpen(false)
              router.push("/admin/laporan/kinerja")
            },
          },
          {
            id: "nav-log",
            category: "Navigasi Halaman",
            title: "Log Aktivitas & Audit",
            subtitle: "Rekam jejak digital pengerjaan tugas dan perubahan sistem",
            icon: ActivityIcon,
            iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60",
            action: () => {
              setOpen(false)
              router.push("/admin/log")
            },
          },
        ]
      : [
          {
            id: "nav-staff-dash",
            category: "Navigasi Halaman",
            title: "Dashboard Saya",
            subtitle: "Rangkuman tugas harian, ringkasan shift, dan performa kerja",
            icon: LayoutDashboardIcon,
            iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60",
            action: () => {
              setOpen(false)
              router.push("/karyawan/dashboard")
            },
          },
          {
            id: "nav-staff-tasks",
            category: "Navigasi Halaman",
            title: "Tugas Saya",
            subtitle: "Daftar penugasan aktif, status pengerjaan, dan checklist",
            icon: CheckSquareIcon,
            iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/60",
            action: () => {
              setOpen(false)
              router.push("/karyawan/tasks")
            },
          },
          {
            id: "nav-staff-ai",
            category: "Navigasi Halaman",
            title: "WorkPulse AI Assistant",
            subtitle: "Konsultasi cerdas bantuan AI untuk panduan tugas kerja",
            icon: SparklesIcon,
            iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/60",
            action: () => {
              setOpen(false)
              if (aiPanel) {
                aiPanel.openAiPanel()
              } else {
                router.push("/karyawan/ai")
              }
            },
          },
        ]

    const all = [...quickActions, ...taskItems, ...navItems]

    if (!q) return all

    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [
    query,
    userFilteredTasks,
    isAdmin,
    isKaryawan,
    aiPanel,
    onOpenCreateTask,
    router,
    setOpen,
  ])

  // Keyboard navigation inside Command Palette (ArrowUp, ArrowDown, Enter)
  React.useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1 < filteredActions.length ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredActions.length - 1))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action()
        }
      }
    }

    window.addEventListener("keydown", handleNavigation)
    return () => window.removeEventListener("keydown", handleNavigation)
  }, [isOpen, filteredActions, selectedIndex])

  if (!isOpen) return null

  // Group items by category for rendering
  const grouped = filteredActions.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof filteredActions>)

  let runningIndex = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-background">
          <SearchIcon className="size-4.5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={
              isKaryawan
                ? "Cari tugas saya, agenda kerja, atau aksi cepat..."
                : "Ketik tugas kantor, personil, atau aksi cepat..."
            }
            className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-hidden"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/40 space-y-3">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-foreground">Tidak ada hasil ditemukan</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isKaryawan
                  ? "Coba cari judul tugas, tiket penugasan, atau kata kunci agenda Anda."
                  : "Coba cari judul tugas kantor, nama personil, atau modul laporan."}
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="pt-2 first:pt-0 space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {category}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const thisIndex = runningIndex++
                    const isSelected = selectedIndex === thisIndex
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        onClick={item.action}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold"
                            : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconColor}`}
                          >
                            <Icon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="truncate font-semibold text-xs text-foreground">
                              {item.title}
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground font-normal">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 shrink-0 font-medium">
                            <span>Buka</span>
                            <ArrowRightIcon className="size-3" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">↓</kbd>
              Pilih
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
              Buka
            </span>
          </div>
          <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
            <CommandIcon className="size-3" /> {isKaryawan ? "Portal Karyawan Navigator" : "WorkPulse Quick Navigator"}
          </span>
        </div>
      </div>
    </div>
  )
}
