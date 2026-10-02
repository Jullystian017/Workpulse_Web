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
  CheckCircle2Icon,
  ClipboardListIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "lucide-react"
import { toast } from "sonner"

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
import { TaskDetailSheet } from "@/components/dashboard/tasks/task-detail-sheet"
import { CreateTaskModal } from "@/components/dashboard/tasks/create-task-modal"
import { DelegateTaskModal } from "@/components/dashboard/tasks/delegate-task-modal"
import {
  getTasks,
  getChannels,
  getAllUsers,
  getActiveUserFromStorage,
  updateTaskStatus,
  claimTask,
} from "@/lib/api"
import { Task, Channel, User, TaskStatus } from "@/types/database"

function KaryawanTasksContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [tasks, setTasks] = React.useState<Task[]>([])
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)

  // Filter & Sort States
  const urlTask = searchParams.get("task") || searchParams.get("selected")
  const urlAction = searchParams.get("action")
  const urlView = searchParams.get("view")

  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all")

  // Primary Macro Views: "calendar" (default) or "table"
  const [activeTab, setActiveTab] = React.useState<"calendar" | "table">("calendar")

  // Daily Workspace Drill-Down State
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
      const activeUser = getActiveUserFromStorage()
      setCurrentUser(activeUser)
      const [fetchedTasks, fetchedChannels, fetchedUsers] = await Promise.all([
        getTasks(),
        getChannels(),
        getAllUsers(),
      ])

      // Filter tasks based on role:
      // - staff: only their assigned tasks, unassigned pool, or tasks they created
      // - officer_1/2/3, manager, sgm: their own tasks + tasks assigned to subordinates
      let userTasks: Task[] = []
      if (activeUser) {
        if (activeUser.role === 'staff') {
          userTasks = fetchedTasks.filter(
            (t) => t.assigned_to === activeUser.id || t.created_by === activeUser.id || (t.status === 'unassigned' && !t.assigned_to)
          )
        } else if (activeUser.role !== 'admin') {
          // Officer+ can see their own + their direct subordinates' tasks
          const subordinateIds = fetchedUsers
            .filter((u) => u.supervisor_id === activeUser.id)
            .map((u) => u.id)
          userTasks = fetchedTasks.filter(
            (t) =>
              t.assigned_to === activeUser.id ||
              t.created_by === activeUser.id ||
              (t.status === 'unassigned' && !t.assigned_to) ||
              (t.assigned_to && subordinateIds.includes(t.assigned_to))
          )
        } else {
          userTasks = fetchedTasks
        }
      } else {
        userTasks = fetchedTasks
      }

      setTasks(userTasks)
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

  // Track handled URL query triggers so they only fire once on initial navigation and never loop
  const handledUrlTaskRef = React.useRef<string | null>(null)
  const handledUrlActionRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (urlAction === "create") {
      if (handledUrlActionRef.current !== "create") {
        handledUrlActionRef.current = "create"
        setIsCreateOpen(true)
      }
    } else {
      handledUrlActionRef.current = null
    }
  }, [urlAction])

  React.useEffect(() => {
    if (urlTask && tasks.length > 0) {
      if (handledUrlTaskRef.current !== urlTask) {
        const t = tasks.find((item) => item.id === urlTask || item.ticket_code === urlTask)
        if (t) {
          handledUrlTaskRef.current = urlTask
          setSelectedTask(t)
          setIsDetailOpen(true)
        }
      }
    } else if (!urlTask) {
      handledUrlTaskRef.current = null
    }
  }, [urlTask, tasks])

  // Daily Workspace Handlers
  const handleSelectDateFromCalendar = (dateStr: string) => {
    setDailyDate(dateStr)
    setDailyMode("kanban")
  }

  const handlePrevDailyDate = () => {
    if (!dailyDate) return
    const current = new Date(dailyDate)
    current.setDate(current.getDate() - 1)
    setDailyDate(current.toISOString().split("T")[0])
  }

  const handleNextDailyDate = () => {
    if (!dailyDate) return
    const current = new Date(dailyDate)
    current.setDate(current.getDate() + 1)
    setDailyDate(current.toISOString().split("T")[0])
  }

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  const handleOpenCreate = (defaultStatus: TaskStatus = "unassigned") => {
    setCreateDefaultStatus(defaultStatus)
    setIsCreateOpen(true)
  }

  const handleOpenDelegate = (task: Task) => {
    setTaskToDelegate(task)
    setIsDelegateOpen(true)
  }

  const handleCloseDetail = React.useCallback(
    (open: boolean) => {
      setIsDetailOpen(open)
      if (!open) {
        setSelectedTask(null)
        handledUrlTaskRef.current = null
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          if (params.has("task") || params.has("selected")) {
            params.delete("task")
            params.delete("selected")
            const newSearch = params.toString() ? `?${params.toString()}` : ""
            const newUrl = `${window.location.pathname}${newSearch}`
            window.history.replaceState(null, "", newUrl)
            router.replace(newUrl, { scroll: false })
          }
        }
        loadAllData()
      }
    },
    [router, loadAllData]
  )

  const handleCloseCreate = React.useCallback(
    (open: boolean) => {
      setIsCreateOpen(open)
      if (!open) {
        handledUrlActionRef.current = null
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          if (params.has("action")) {
            params.delete("action")
            const newSearch = params.toString() ? `?${params.toString()}` : ""
            const newUrl = `${window.location.pathname}${newSearch}`
            window.history.replaceState(null, "", newUrl)
            router.replace(newUrl, { scroll: false })
          }
        }
      }
    },
    [router]
  )

  // Filter Logic
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchCode = task.ticket_code.toLowerCase().includes(q)
        const matchAssignee = task.assignee?.nama.toLowerCase().includes(q)
        if (!matchTitle && !matchCode && !matchAssignee) return false
      }
      if (selectedStatus !== "all" && task.status !== selectedStatus) {
        return false
      }
      if (selectedPriority !== "all" && task.priority !== selectedPriority) {
        return false
      }
      return true
    })
  }, [tasks, searchQuery, selectedStatus, selectedPriority])

  // Daily Filtered Tasks
  const dailyFilteredTasks = React.useMemo(() => {
    if (!dailyDate) return []
    return filteredTasks.filter((task) => {
      if (task.deadline_at && task.deadline_at.startsWith(dailyDate)) return true
      if (task.created_at && task.created_at.startsWith(dailyDate)) return true
      return false
    })
  }, [filteredTasks, dailyDate])

  // Metrics
  const isStaff = currentUser?.role === 'staff'
  const canDelegate = currentUser && currentUser.role !== 'staff' && currentUser.role !== 'admin'

  const totalTasksCount = tasks.length
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length
  const underReviewCount = tasks.filter((t) => t.status === "review").length
  const doneCount = tasks.filter((t) => t.status === "done").length

  const getStatusDisplay = () => {
    if (selectedStatus === "all") return "Semua Status"
    if (selectedStatus === "todo") return "Ditugaskan (To-Do)"
    if (selectedStatus === "in_progress") return "Dalam Pengerjaan"
    if (selectedStatus === "review") return "Review Atasan"
    if (selectedStatus === "done") return "Selesai"
    if (selectedStatus === "unassigned") return "Belum Ditugaskan"
    return selectedStatus
  }

  const getPriorityDisplay = () => {
    if (selectedPriority === "all") return "Semua Prioritas"
    if (selectedPriority === "urgent") return "Darurat"
    if (selectedPriority === "high") return "Tinggi"
    if (selectedPriority === "medium") return "Sedang"
    if (selectedPriority === "low") return "Rendah"
    return selectedPriority
  }

  const formattedDailyDate = React.useMemo(() => {
    if (!dailyDate) return ""
    try {
      return new Date(dailyDate + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return dailyDate
    }
  }, [dailyDate])

  return (
    <div className="flex flex-1 flex-col pb-12 overflow-x-hidden min-w-0 max-w-full">
      <div className="flex flex-1 flex-col gap-5 py-4 lg:py-6 overflow-x-hidden min-w-0 max-w-full">
        {/* Header Title & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Penugasan & Agenda Kerja Saya
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar penugasan kantor yang didelegasikan kepada Anda, monitoring deadline, dan update progres kerja.
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
              onClick={() => {
                setCreateDefaultStatus("todo")
                setIsCreateOpen(true)
              }}
              className="h-9 px-3.5 rounded-[8px] text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer transition-all"
            >
              <PlusIcon className="size-3.5" />
              <span>Tambah Tugas</span>
            </Button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
          <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <ClipboardListIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Total Penugasan Saya</span>
                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                  {totalTasksCount} Tugas
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                {totalTasksCount}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Tugas aktif & riwayat kantor</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <ClockIcon className="absolute -right-2 -top-2 size-20 text-blue-100 dark:text-blue-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Dalam Pengerjaan</span>
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  Proses
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                {inProgressCount}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Sedang Anda kerjakan hari ini</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-purple-100 dark:text-purple-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
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
              <p className="mt-1 text-[11px] text-muted-foreground">Sudah diserahkan untuk diverifikasi</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CheckCircle2Icon className="absolute -right-2 -top-2 size-20 text-emerald-100 dark:text-emerald-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Selesai Disetujui</span>
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
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDailyDate(null)}
                  className="h-8 px-2.5 rounded-xl border-border hover:bg-muted font-semibold text-xs gap-1.5 cursor-pointer shrink-0"
                >
                  <ArrowLeftIcon className="size-3.5" />
                  <span>Kembali ke Kalender</span>
                </Button>

                <div className="h-4 w-px bg-border hidden sm:block shrink-0" />

                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-8 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <CalendarIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {formattedDailyDate}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {dailyFilteredTasks.length} agenda tugas terjadwal pada tanggal ini
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Controls: Mode Switcher + Navigation */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
                <div className="flex items-center p-1 bg-muted/60 dark:bg-zinc-800/60 rounded-xl border border-border">
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
            <div className="px-4 lg:px-6 border-b border-border">
              <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("calendar")}
                  className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "calendar"
                      ? "border-red-600 text-red-600 dark:text-red-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarIcon className="size-4" />
                  <span>Kalender Agenda Bulanan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("table")}
                  className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "table"
                      ? "border-red-600 text-red-600 dark:text-red-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TableIcon className="size-4" />
                  <span>Daftar (Semua Tugas)</span>
                </button>
              </div>
            </div>

            {/* Filter & Sort Toolbar Row (For Macro Views) */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between gap-3 p-2 bg-card dark:bg-zinc-900 border border-border rounded-xl shadow-2xs">
                <div className="flex items-center gap-2 shrink-0">
                  {/* Search Box */}
                  <div className="relative w-44 sm:w-56 lg:w-64 shrink-0">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari data, tugas..."
                      className="h-8.5 pl-8 pr-3 text-xs rounded-lg bg-background border-border shadow-2xs placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="h-4 w-px bg-border shrink-0" />

                  {/* Status Filter */}
                  <Select
                    value={selectedStatus}
                    onValueChange={(v) => setSelectedStatus(v || "all")}
                  >
                    <SelectTrigger
                      className={`h-8.5 text-xs rounded-lg border px-2.5 gap-1.5 shrink-0 transition-colors shadow-2xs ${
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
                        <span className="font-medium">To-Do (Ditugaskan)</span>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <span className="font-medium">Dalam Pengerjaan</span>
                      </SelectItem>
                      <SelectItem value="review">
                        <span className="font-medium">Menunggu Review</span>
                      </SelectItem>
                      <SelectItem value="done">
                        <span className="font-medium">Selesai</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority Filter */}
                  <Select
                    value={selectedPriority}
                    onValueChange={(v) => setSelectedPriority(v || "all")}
                  >
                    <SelectTrigger
                      className={`h-8.5 text-xs rounded-lg border px-2.5 gap-1.5 shrink-0 transition-colors shadow-2xs ${
                        selectedPriority !== "all"
                          ? "border-red-400/80 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold"
                          : "border-border bg-background hover:bg-muted/50 text-foreground font-medium"
                      }`}
                    >
                      <span className="truncate">{getPriorityDisplay()}</span>
                    </SelectTrigger>
                    <SelectContent align="start" className="w-44">
                      <SelectItem value="all">
                        <span className="font-medium">Semua Prioritas</span>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <span className="font-medium">Darurat (2 Jam)</span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className="font-medium">Tinggi (4 Jam)</span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="font-medium">Sedang (8 Jam)</span>
                      </SelectItem>
                      <SelectItem value="low">
                        <span className="font-medium">Rendah (24 Jam)</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  const movingTask = tasks.find((t) => t.id === taskId)
                  if (status === "in_progress" && movingTask && !movingTask.assigned_to && currentUser) {
                    await claimTask(taskId, currentUser.id)
                  } else {
                    await updateTaskStatus(taskId, status, currentUser?.id)
                  }
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
                isStaff={isStaff}
              />
            )
          )}
        </div>
      </div>

      {/* Modals & Sheets */}
      <TaskDetailSheet
        taskId={selectedTask?.id || null}
        initialTask={selectedTask}
        open={isDetailOpen}
        onOpenChange={handleCloseDetail}
        onTaskUpdated={() => loadAllData()}
        onOpenDelegate={handleOpenDelegate}
      />

      <CreateTaskModal
        open={isCreateOpen}
        onOpenChange={handleCloseCreate}
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
    </div>
  )
}

export default function KaryawanTasksPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <KaryawanTasksContent />
    </React.Suspense>
  )
}
