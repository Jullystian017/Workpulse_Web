"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  TableIcon,
  KanbanIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  RefreshCwIcon,
  UsersIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  ArrowUpDownIcon,
  LayersIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

import { KanbanView } from "@/components/dashboard/tasks/kanban-view"
import { TimelineView } from "@/components/dashboard/tasks/timeline-view"
import { CalendarView } from "@/components/dashboard/tasks/calendar-view"
import { DataTable } from "@/components/dashboard/data-table"
import { DateStripNavigator } from "@/components/dashboard/tasks/date-strip-navigator"
import { TaskDetailSheet } from "@/components/dashboard/tasks/task-detail-sheet"
import { CreateTaskModal } from "@/components/dashboard/tasks/create-task-modal"
import { DelegateTaskModal } from "@/components/dashboard/tasks/delegate-task-modal"
import {
  getTasks,
  getChannels,
  getAllUsers,
  updateTaskStatus,
} from "@/lib/api"
import { Task, Channel, User, TaskStatus } from "@/types/database"

function AdminTasksContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [tasks, setTasks] = React.useState<Task[]>([])
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Filter & Sort States
  const urlTask = searchParams.get("task")
  const urlAction = searchParams.get("action")
  const urlView = searchParams.get("view")

  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all")
  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("deadline_asc")

  // Primary Macro Views: "calendar" (default) or "table"
  const [activeTab, setActiveTab] = React.useState<"calendar" | "table">("calendar")

  // Daily Workspace Drill-Down State (When a date is clicked on Calendar)
  const [dailyDate, setDailyDate] = React.useState<string | null>(null)
  const [dailyMode, setDailyMode] = React.useState<"kanban" | "timeline">("kanban")

  // Modal States
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isDelegateOpen, setIsDelegateOpen] = React.useState(false)
  const [taskToDelegate, setTaskToDelegate] = React.useState<Task | null>(null)
  const [createDefaultStatus, setCreateDefaultStatus] = React.useState<TaskStatus>("unassigned")

  const loadAllData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedTasks, fetchedChannels, fetchedUsers] = await Promise.all([
        getTasks(),
        getChannels(),
        getAllUsers(),
      ])
      setTasks(fetchedTasks)
      setChannels(fetchedChannels)
      setUsers(fetchedUsers)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadAllData()
  }, [loadAllData])

  React.useEffect(() => {
    if (urlView) {
      if (urlView === "table") {
        setActiveTab("table")
        setDailyDate(null)
      } else if (urlView === "calendar") {
        setActiveTab("calendar")
        setDailyDate(null)
      } else if (urlView === "kanban") {
        const today = new Date().toISOString().split("T")[0]
        setDailyDate(today)
        setDailyMode("kanban")
      } else if (urlView === "timeline") {
        const today = new Date().toISOString().split("T")[0]
        setDailyDate(today)
        setDailyMode("timeline")
      }
    }
  }, [urlView])

  React.useEffect(() => {
    if (urlAction === "create") {
      setIsCreateOpen(true)
    }
  }, [urlAction])

  React.useEffect(() => {
    if (urlTask && tasks.length > 0) {
      const t = tasks.find((item) => item.id === urlTask || item.ticket_code === urlTask)
      if (t) {
        setSelectedTask(t)
        setIsDetailOpen(true)
      }
    }
  }, [urlTask, tasks])

  // Daily Workspace Handlers
  const handleSelectDateFromCalendar = (dateStr: string) => {
    setDailyDate(dateStr)
    setDailyMode("kanban")
  }

  const handlePrevDailyDate = () => {
    if (!dailyDate) return
    const d = new Date(dailyDate + "T00:00:00")
    d.setDate(d.getDate() - 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    setDailyDate(`${y}-${m}-${day}`)
  }

  const handleNextDailyDate = () => {
    if (!dailyDate) return
    const d = new Date(dailyDate + "T00:00:00")
    d.setDate(d.getDate() + 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    setDailyDate(`${y}-${m}-${day}`)
  }

  const formattedDailyDateTitle = React.useMemo(() => {
    if (!dailyDate) return ""
    const d = new Date(dailyDate + "T00:00:00")
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }, [dailyDate])

  const isDailyDateToday = React.useMemo(() => {
    if (!dailyDate) return false
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}` === dailyDate
  }, [dailyDate])

  // Priority weight for sorting
  const priorityWeight: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  // Filtered & Sorted Tasks for Macro Views (Calendar & Master Table)
  const filteredTasks = React.useMemo(() => {
    const result = tasks.filter((t) => {
      const matchPriority = selectedPriority === "all" || t.priority === selectedPriority
      const matchStatus =
        selectedStatus === "all"
          ? true
          : selectedStatus === "todo"
          ? t.status === "todo" || t.status === "unassigned"
          : t.status === selectedStatus
      const matchAssignee =
        selectedAssignee === "all"
          ? true
          : selectedAssignee === "unassigned"
          ? !t.assigned_to
          : t.assigned_to === selectedAssignee
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.assignee?.nama && t.assignee.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.location_name && t.location_name.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchPriority && matchStatus && matchAssignee && matchSearch
    })

    // Sorting Logic
    result.sort((a, b) => {
      if (sortBy === "deadline_asc") {
        const dateA = a.deadline_at ? new Date(a.deadline_at).getTime() : Infinity
        const dateB = b.deadline_at ? new Date(b.deadline_at).getTime() : Infinity
        return dateA - dateB
      }
      if (sortBy === "deadline_desc") {
        const dateA = a.deadline_at ? new Date(a.deadline_at).getTime() : 0
        const dateB = b.deadline_at ? new Date(b.deadline_at).getTime() : 0
        return dateB - dateA
      }
      if (sortBy === "priority_desc") {
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
      }
      if (sortBy === "priority_asc") {
        return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0)
      }
      if (sortBy === "title_asc") {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === "title_desc") {
        return b.title.localeCompare(a.title)
      }
      if (sortBy === "ticket_asc") {
        return a.ticket_code.localeCompare(b.ticket_code)
      }
      return 0
    })

    return result
  }, [tasks, selectedPriority, selectedStatus, selectedAssignee, searchQuery, sortBy])

  // Daily Filtered Tasks for Workspace Drill-Down (Kanban & Timeline)
  const dailyFilteredTasks = React.useMemo(() => {
    if (!dailyDate) return []
    return filteredTasks.filter((t) => {
      const taskDate = t.deadline_at || t.created_at
      if (!taskDate) return false
      const d = new Date(taskDate)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}` === dailyDate
    })
  }, [filteredTasks, dailyDate])

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all"

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedStatus("all")
    setSelectedPriority("all")
    setSelectedAssignee("all")
  }

  // Display helpers for Select Trigger values
  const getStatusDisplay = () => {
    if (selectedStatus === "all") return "Semua Status"
    if (selectedStatus === "todo") return "To-Do / Antrean"
    if (selectedStatus === "in_progress") return "Dalam Pengerjaan"
    if (selectedStatus === "review") return "Review Atasan"
    if (selectedStatus === "done") return "Selesai"
    return "Status"
  }

  const getPriorityDisplay = () => {
    if (selectedPriority === "all") return "Semua Prioritas"
    if (selectedPriority === "urgent") return "Mendesak (Urgent)"
    if (selectedPriority === "high") return "Tinggi (High)"
    if (selectedPriority === "medium") return "Standar (Medium)"
    if (selectedPriority === "low") return "Rendah (Low)"
    return "Prioritas"
  }


  const getAssigneeDisplay = () => {
    if (selectedAssignee === "all") return "Semua Personil"
    if (selectedAssignee === "unassigned") return "Unassigned Pool"
    const u = users.find((item) => item.id === selectedAssignee)
    return u ? u.nama.split(" ")[0] : "Personil"
  }

  const getSortDisplay = () => {
    if (sortBy === "deadline_asc") return "Deadline Terdekat"
    if (sortBy === "deadline_desc") return "Deadline Terlama"
    if (sortBy === "priority_desc") return "Prioritas Tertinggi"
    if (sortBy === "priority_asc") return "Prioritas Terendah"
    if (sortBy === "title_asc") return "Judul (A–Z)"
    if (sortBy === "title_desc") return "Judul (Z–A)"
    if (sortBy === "ticket_asc") return "No. Tiket"
    return "Urutkan"
  }

  // KPI Calculations
  const totalTasksCount = tasks.length
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length
  const underReviewCount = tasks.filter((t) => t.status === "review").length
  const doneCount = tasks.filter((t) => t.status === "done").length

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  const handleOpenDelegate = (task: Task) => {
    setTaskToDelegate(task)
    setIsDelegateOpen(true)
  }

  const handleOpenCreate = (status?: TaskStatus) => {
    setCreateDefaultStatus(status || "unassigned")
    setIsCreateOpen(true)
  }

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
      <SidebarInset className="overflow-x-hidden min-w-0 max-w-full">
        <SiteHeader />
        <div className="flex flex-1 flex-col pb-12 overflow-x-hidden min-w-0 max-w-full">
          <div className="flex flex-1 flex-col gap-5 py-4 lg:py-6 overflow-x-hidden min-w-0 max-w-full">
            {/* Header Title & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Penugasan & Agenda Kerja Kantor
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pengawasan pengerjaan tugas divisi kantor, pendelegasian wewenang hierarkis, dan target waktu pengerjaan.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAllData}
                  className="h-9 px-3 rounded-[8px] text-xs font-semibold gap-1.5 cursor-pointer"
                  title="Muat Ulang Data"
                >
                  <RefreshCwIcon className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleOpenCreate()}
                  className="h-9 px-4 rounded-[8px] text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="size-4" />
                  Buat Tugas Baru
                </Button>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
              <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <ClipboardListIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Total Penugasan Kantor</span>
                    <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                      {totalTasksCount} Tugas
                    </span>
                  </div>
                  <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                    {totalTasksCount}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Total agenda penugasan divisi</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <ClockIcon className="absolute -right-2 -top-2 size-20 text-blue-100 dark:text-blue-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Sedang Dikerjakan</span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      In Progress
                    </span>
                  </div>
                  <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                    {inProgressCount}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Dikerjakan oleh staf pelaksana</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <AlertCircleIcon className="absolute -right-2 -top-2 size-20 text-purple-100 dark:text-purple-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Menunggu Review Atasan</span>
                    <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                      Review
                    </span>
                  </div>
                  <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                    {underReviewCount}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Siap diverifikasi & disetujui</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-emerald-100 dark:text-emerald-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Selesai Terverifikasi</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      Done
                    </span>
                  </div>
                  <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                    {doneCount}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Tingkat penyelesaian: {totalTasksCount > 0 ? Math.round((doneCount / totalTasksCount) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {dailyDate ? (
              /* DAILY WORKSPACE DRILL-DOWN HEADER */
              <div className="px-4 lg:px-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
                  {/* Left: Back to Calendar Button & Active Day Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDailyDate(null)}
                      className="h-9 px-3 rounded-xl gap-2 font-bold hover:bg-red-50 dark:hover:bg-red-950/40 text-foreground border-border cursor-pointer shadow-2xs shrink-0"
                    >
                      <ArrowLeftIcon className="size-4 text-red-600" />
                      <span>Kembali ke Kalender</span>
                    </Button>

                    <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-foreground capitalize truncate">
                          {formattedDailyDateTitle}
                        </h3>
                        {isDailyDateToday && (
                          <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            Hari Ini
                          </Badge>
                        )}
                        <span className="text-[11px] font-bold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border/70">
                          {dailyFilteredTasks.length} Tugas
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                        Workspace operasional harian Telkom Akses (Kanban workflow & Jadwal per jam)
                      </p>
                    </div>
                  </div>

                  {/* Right: Prev/Next Day + Kanban/Timeline Mode Switcher + Add Task */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    {/* Sub-mode Switcher: Kanban vs Timeline */}
                    <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/70">
                      <button
                        type="button"
                        onClick={() => setDailyMode("kanban")}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          dailyMode === "kanban"
                            ? "bg-card text-red-600 dark:text-red-400 shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <KanbanIcon className="size-3.5" />
                        <span>Kanban</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDailyMode("timeline")}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          dailyMode === "timeline"
                            ? "bg-card text-red-600 dark:text-red-400 shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ClockIcon className="size-3.5" />
                        <span>Timeline Jam</span>
                      </button>
                    </div>

                    <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

                    {/* Day Navigation (Prev / Next) */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevDailyDate}
                        className="size-8 rounded-xl border-border hover:bg-muted cursor-pointer shadow-2xs"
                        title="Hari Sebelumnya"
                      >
                        <ChevronLeftIcon className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextDailyDate}
                        className="size-8 rounded-xl border-border hover:bg-muted cursor-pointer shadow-2xs"
                        title="Hari Berikutnya"
                      >
                        <ChevronRightIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* MACRO LEVEL NAVIGATION (KALENDER VS DAFTAR) */
              <>
                {/* View Switcher Tabs Bar */}
                <div className="px-4 lg:px-6 border-b border-border mt-5">
                  <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("calendar")
                        setDailyDate(null)
                      }}
                      className={`flex items-center gap-2 pb-3 pt-1 text-xs font-bold transition-colors relative cursor-pointer -mb-px shrink-0 ${
                        activeTab === "calendar"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <CalendarIcon className="size-3.5" />
                      <span>Kalender Penugasan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("table")
                        setDailyDate(null)
                      }}
                      className={`flex items-center gap-2 pb-3 pt-1 text-xs font-bold transition-colors relative cursor-pointer -mb-px shrink-0 ${
                        activeTab === "table"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <TableIcon className="size-3.5" />
                      <span>Daftar (Semua Tugas)</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Sort Toolbar Row (For Macro Views) */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between gap-3 p-2 bg-card dark:bg-zinc-900 border border-border rounded-[6px] shadow-2xs">
                    {/* Left Controls: Search + Styled Select Dropdowns in 1 Row */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Search Box */}
                      <div className="relative w-44 sm:w-56 lg:w-64 shrink-0">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari data, tugas, personil..."
                          className="h-8.5 pl-8 pr-3 text-xs rounded-[5px] bg-background border-border shadow-2xs placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="h-4 w-px bg-border shrink-0" />

                      {/* Status Filter */}
                      <Select
                        value={selectedStatus}
                        onValueChange={(v) => setSelectedStatus(v || "all")}
                      >
                        <SelectTrigger
                          className={`h-8.5 text-xs rounded-[5px] border px-2.5 gap-1.5 shrink-0 transition-colors shadow-2xs ${
                            selectedStatus !== "all"
                              ? "border-red-400/80 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold"
                              : "border-border bg-background hover:bg-muted/50 text-foreground font-medium"
                          }`}
                        >
                          <SlidersHorizontalIcon className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{getStatusDisplay()}</span>
                        </SelectTrigger>
                        <SelectContent align="start" className="w-48">
                          <SelectItem value="all">
                            <span className="font-medium">Semua Status</span>
                          </SelectItem>
                          <SelectItem value="todo">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                              <span>To-Do / Antrean</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                              <span>Dalam Pengerjaan</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="review">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-purple-500 shrink-0" />
                              <span>Review Atasan</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="done">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                              <span>Selesai (Done)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Priority Filter */}
                      <Select
                        value={selectedPriority}
                        onValueChange={(v) => setSelectedPriority(v || "all")}
                      >
                        <SelectTrigger
                          className={`h-8.5 text-xs rounded-[5px] border px-2.5 gap-1.5 shrink-0 transition-colors shadow-2xs ${
                            selectedPriority !== "all"
                              ? "border-red-400/80 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold"
                              : "border-border bg-background hover:bg-muted/50 text-foreground font-medium"
                          }`}
                        >
                          <AlertCircleIcon className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{getPriorityDisplay()}</span>
                        </SelectTrigger>
                        <SelectContent align="start" className="w-48">
                          <SelectItem value="all">
                            <span className="font-medium">Semua Prioritas</span>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-red-600 shrink-0" />
                              <span>Mendesak (Urgent)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-orange-500 shrink-0" />
                              <span>Tinggi (High)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-yellow-500 shrink-0" />
                              <span>Standar (Medium)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-zinc-400 shrink-0" />
                              <span>Rendah (Low)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Assignee Filter */}
                      <Select
                        value={selectedAssignee}
                        onValueChange={(v) => setSelectedAssignee(v || "all")}
                      >
                        <SelectTrigger
                          className={`h-8.5 text-xs rounded-[5px] border px-2.5 gap-1.5 shrink-0 transition-colors shadow-2xs ${
                            selectedAssignee !== "all"
                              ? "border-red-400/80 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold"
                              : "border-border bg-background hover:bg-muted/50 text-foreground font-medium"
                          }`}
                        >
                          <UsersIcon className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{getAssigneeDisplay()}</span>
                        </SelectTrigger>
                        <SelectContent align="start" className="w-52">
                          <SelectItem value="all">
                            <span className="font-medium">Semua Pelaksana</span>
                          </SelectItem>
                          <SelectItem value="unassigned">
                            <span className="font-medium text-amber-600">Belum Ditugaskan (Pool)</span>
                          </SelectItem>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    u.avatar_url ||
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                                  }
                                  alt={u.nama}
                                  className="size-4 rounded-full object-cover"
                                />
                                <span className="truncate">{u.nama}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Reset Filter Button */}
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetFilters}
                          className="h-8.5 px-2.5 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[5px] gap-1.5 shrink-0 font-semibold cursor-pointer"
                        >
                          <RotateCcwIcon className="size-3.5" />
                          <span>Reset</span>
                        </Button>
                      )}
                    </div>

                    {/* Right: Filtered Result Count Badge */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[5px] bg-muted/70 dark:bg-zinc-800 text-[11px] font-medium text-muted-foreground border border-border/60 shrink-0">
                        Menampilkan <strong className="text-foreground mx-1 font-bold">{filteredTasks.length}</strong> dari {tasks.length} tugas
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Active View Container */}
            <div className="flex-1">
              {dailyDate ? (
                /* DAILY WORKSPACE CONTAINER */
                dailyMode === "kanban" ? (
                  <KanbanView
                    tasks={dailyFilteredTasks}
                    onSelectTask={handleOpenDetail}
                    onOpenDelegate={handleOpenDelegate}
                    onOpenCreate={handleOpenCreate}
                    onUpdateStatus={async (taskId, status) => {
                      await updateTaskStatus(taskId, status)
                      loadAllData()
                    }}
                  />
                ) : (
                  <TimelineView
                    tasks={dailyFilteredTasks}
                    onSelectTask={handleOpenDetail}
                    onOpenDelegate={handleOpenDelegate}
                    selectedDate={dailyDate}
                    onSelectDate={(d) => setDailyDate(d)}
                    onOpenCreate={handleOpenCreate}
                  />
                )
              ) : (
                /* MACRO VIEWS CONTAINER */
                activeTab === "calendar" ? (
                  <CalendarView
                    tasks={filteredTasks}
                    onSelectDate={handleSelectDateFromCalendar}
                    onOpenCreate={handleOpenCreate}
                  />
                ) : (
                  <DataTable
                    tasks={filteredTasks}
                    onRefresh={loadAllData}
                    hideTitle
                    hideToolbar
                    className="px-4 lg:px-6"
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Modals & Sheets */}
        <TaskDetailSheet
          taskId={selectedTask?.id || null}
          open={isDetailOpen}
          onOpenChange={(open) => {
            setIsDetailOpen(open)
            if (!open) {
              setSelectedTask(null)
              loadAllData()
            }
          }}
          onTaskUpdated={() => loadAllData()}
          onOpenDelegate={handleOpenDelegate}
        />

        <CreateTaskModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          defaultStatus={createDefaultStatus}
          onSuccess={() => loadAllData()}
        />

        <DelegateTaskModal
          task={taskToDelegate}
          open={isDelegateOpen}
          onOpenChange={(open) => {
            setIsDelegateOpen(open)
            if (!open) setTaskToDelegate(null)
          }}
          onSuccess={() => loadAllData()}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminTasksPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <AdminTasksContent />
    </React.Suspense>
  )
}
