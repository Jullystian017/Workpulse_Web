"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SearchIcon,
  SparklesIcon,
  PlusIcon,
  HashIcon,
  CheckSquareIcon,
  UsersIcon,
  FileSpreadsheetIcon,
  LayoutDashboardIcon,
  FileBarChartIcon,
  ActivityIcon,
  Settings2Icon,
  ShieldIcon,
  MoonIcon,
  SunIcon,
  ArrowRightIcon,
  XIcon,
  CommandIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import { getTasks, getChannels, getAllUsers, setActiveUser, getActiveUserFromStorage } from "@/lib/api"
import { Task, Channel, User, ROLE_LABELS } from "@/types/database"

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
  const { setTheme, theme } = useTheme()
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
      setActiveUser(getActiveUserFromStorage())
      Promise.all([getTasks(), getChannels(), getAllUsers()])
        .then(([t, c, u]) => {
          setTasks(t)
          setChannels(c)
          setUsers(u)
        })
        .catch(console.error)
    }
  }, [isOpen])

  // Build filterable items
  const filteredActions = React.useMemo(() => {
    const q = query.toLowerCase().trim()

    const isAdmin = activeUser?.role === "admin"

    const quickActions = [
      ...(isAdmin
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
          ]
        : []),
      {
        id: "act-ai-assistant",
        category: "Aksi Cepat",
        title: "Buka WorkPulse AI Assistant",
        subtitle: "Analisis beban kerja, SLA, dan rekomendasi delegasi",
        icon: SparklesIcon,
        iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400",
        action: () => {
          setOpen(false)
          aiPanel?.openAiPanel()
        },
      },
      ...(isAdmin
        ? [
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
        : []),
      {
        id: "act-toggle-theme",
        category: "Aksi Cepat",
        title: theme === "dark" ? "Beralih ke Light Mode" : "Beralih ke Dark Mode",
        subtitle: "Ubah tema tampilan antarmuka",
        icon: theme === "dark" ? SunIcon : MoonIcon,
        iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
        action: () => {
          setTheme(theme === "dark" ? "light" : "dark")
          toast.success(`Tema diubah ke ${theme === "dark" ? "Light" : "Dark"} Mode`)
          setOpen(false)
        },
      },
    ]

    const taskItems = tasks.map((t) => ({
      id: `task-${t.id}`,
      category: "Penugasan Kantor Aktif",
      title: `[${t.ticket_code}] ${t.title}`,
      subtitle: `Status: ${t.status.toUpperCase()} • PIC: ${t.assignee?.nama || "Unassigned Pool"} • Prioritas: ${t.priority.toUpperCase()}`,
      icon: CheckSquareIcon,
      iconColor: "text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400",
      action: () => {
        setOpen(false)
        const baseTaskRoute = isAdmin ? "/admin/tasks" : "/karyawan/tasks"
        router.push(`${baseTaskRoute}?task=${t.id}`)
      },
    }))

    const navItems = isAdmin
      ? [
          {
            id: "nav-dash",
            category: "Navigasi Halaman",
            title: "Executive Dashboard",
            subtitle: "Ringkasan KPI, Area Chart interaktif, dan tabel tugas utama",
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
            title: "Penugasan Kerja Kantor",
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
            title: "Karyawan & Rantai Komando",
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
            title: "Laporan Kinerja & Rekap SLA",
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
            title: "Log Aktivitas & Audit Trail",
            subtitle: "Rekam jejak digital pengerjaan tugas kantor",
            icon: ActivityIcon,
            iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60",
            action: () => {
              setOpen(false)
              router.push("/admin/log")
            },
          },
          {
            id: "nav-akses",
            category: "Navigasi Halaman",
            title: "Hak Akses & Role Matrix",
            subtitle: "Matriks perizinan modul dan wewenang delegasi",
            icon: ShieldIcon,
            iconColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60",
            action: () => {
              setOpen(false)
              router.push("/admin/akses")
            },
          },
        ]
      : [
          {
            id: "nav-staff-dash",
            category: "Navigasi Halaman",
            title: "Dashboard Saya",
            subtitle: "Statistik tugas harian, kalender agenda kerja, dan rangkuman",
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
        ]

    const all = [...quickActions, ...taskItems, ...navItems]

    if (!q) return all

    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [query, channels, tasks, users, activeUser, theme, setTheme, aiPanel, onOpenCreateTask, router, setOpen])

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
            placeholder="Ketik tugas, channel, personil, atau aksi cepat..."
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
                Coba gunakan kata kunci lain seperti &quot;SPJ&quot;, &quot;Operasional&quot;, atau nama personil.
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
            <CommandIcon className="size-3" /> WorkPulse Quick Navigator
          </span>
        </div>
      </div>
    </div>
  )
}
