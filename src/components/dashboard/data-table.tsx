"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SearchIcon,
  PlusIcon,
  MoreVerticalIcon,
  ClockIcon,
  CheckCircle2Icon,
  PauseCircleIcon,
  AlertCircleIcon,
  EyeIcon,
  UserPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  XIcon,
  Trash2Icon,
  ArrowRightLeftIcon,
  BarChart3Icon,
  FolderIcon,
  UsersIcon,
  ActivityIcon,
} from "lucide-react"
import { Task, TaskPriority, TaskStatus, User } from "@/types/database"
import { deleteTask, updateTaskStatus, getActiveUserFromStorage, getTaskAssigneeIds } from "@/lib/api"
import { toast } from "sonner"
import { TaskDetailSheet } from "@/components/dashboard/tasks/task-detail-sheet"
import { DelegateTaskModal } from "@/components/dashboard/tasks/delegate-task-modal"
import { CreateTaskModal } from "@/components/dashboard/tasks/create-task-modal"

const statusMeta: Record<TaskStatus, { label: string; icon: React.ReactNode; className: string }> = {
  done: {
    label: "Selesai",
    icon: <CheckCircle2Icon className="size-3" />,
    className: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400",
  },
  review: {
    label: "Review Atasan",
    icon: <PauseCircleIcon className="size-3" />,
    className: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400",
  },
  in_progress: {
    label: "Dalam Proses",
    icon: <ClockIcon className="size-3" />,
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
  },
  todo: {
    label: "To-Do / Antrean",
    icon: <ClockIcon className="size-3" />,
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
  },
  unassigned: {
    label: "Belum Ditugaskan",
    icon: <AlertCircleIcon className="size-3" />,
    className: "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
}

const prioritasConfig: Record<TaskPriority, { label: string; className: string }> = {
  urgent: { label: "Mendesak", className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400" },
  high: { label: "Tinggi", className: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400" },
  medium: { label: "Sedang", className: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400" },
  low: { label: "Rendah", className: "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400" },
}

function renderChannelIcon(iconStr?: string | null) {
  if (!iconStr) return <FolderIcon className="size-3 text-muted-foreground shrink-0" />
  // Jika berupa emoji unicode asli
  if (/\p{Extended_Pictographic}/u.test(iconStr)) {
    return <span className="text-xs shrink-0">{iconStr}</span>
  }
  const lower = iconStr.toLowerCase()
  if (lower.includes("barchart") || lower.includes("chart") || lower.includes("kinerja")) {
    return <BarChart3Icon className="size-3 text-red-600 dark:text-red-400 shrink-0" />
  }
  if (lower.includes("user") || lower.includes("team") || lower.includes("karyawan")) {
    return <UsersIcon className="size-3 text-blue-600 dark:text-blue-400 shrink-0" />
  }
  if (lower.includes("activity") || lower.includes("log") || lower.includes("pulse")) {
    return <ActivityIcon className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
  }
  return <FolderIcon className="size-3 text-muted-foreground shrink-0" />
}

interface TaskTableRowProps {
  task: Task
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onOpenDetail: (task: Task) => void
  onOpenDelegate: (task: Task) => void
  onQuickStatus: (taskId: string, status: TaskStatus) => void
  isStaff?: boolean
}

function TaskTableRow({
  task,
  isSelected,
  onToggleSelect,
  onOpenDetail,
  onOpenDelegate,
  onQuickStatus,
  isStaff = false,
}: TaskTableRowProps) {
  const sMeta = statusMeta[task.status] || statusMeta.in_progress
  const pMeta = prioritasConfig[task.priority] || prioritasConfig.medium
  const GRACE_PERIOD_MS = 15 * 60 * 1000
  const isCompleted = task.status === "done" || Boolean(task.completed_at)
  const isOverdue =
    task.status !== "done" &&
    task.deadline_at &&
    new Date(task.deadline_at).getTime() + GRACE_PERIOD_MS < Date.now()
  const delayMs =
    task.completed_at && task.deadline_at
      ? new Date(task.completed_at).getTime() - new Date(task.deadline_at).getTime()
      : 0
  const isCompletedLate = Boolean(task.completed_at && task.deadline_at && delayMs > GRACE_PERIOD_MS)
  const isCompletedOnTime = isCompleted && !isCompletedLate

  const activeUser = React.useMemo(() => getActiveUserFromStorage(), [])
  const canApprove = React.useMemo(() => {
    if (!activeUser || !task) return false
    if (getTaskAssigneeIds(task).includes(activeUser.id)) return false
    if (activeUser.role === "admin" || activeUser.role === "sgm") return true
    if (task.reviewer_id && task.reviewer_id === activeUser.id) return true
    if (task.reviewer && task.reviewer.id === activeUser.id) return true
    if (task.delegated_by && task.delegated_by === activeUser.id) return true
    if (task.delegator && task.delegator.id === activeUser.id) return true
    if (task.assignee?.supervisor_id && task.assignee.supervisor_id === activeUser.id) return true
    if (!task.reviewer_id && task.created_by && task.created_by === activeUser.id) return true
    return false
  }, [activeUser, task])

  return (
    <TableRow
      data-state={isSelected && "selected"}
      onClick={() => onOpenDetail(task)}
      className="cursor-pointer hover:bg-muted/30 transition-colors group"
    >
      {/* Selection Checkbox Column */}
      <TableCell className="w-[36px] px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(task.id)}
            aria-label="Select row"
          />
        </div>
      </TableCell>

      {/* 1. Judul Task & Kode Tiket */}
      <TableCell className="py-3 px-4">
        <div className="flex flex-col gap-0.5 min-w-[200px] max-w-[320px]">
          <span className="text-sm font-semibold text-foreground group-hover:text-red-600 transition-colors truncate">
            {task.title}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">{task.ticket_code}</span>
        </div>
      </TableCell>

      {/* 2. Kategori / Divisi */}
      <TableCell className="py-3 pl-1.5 pr-4 text-left">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-border/80 w-fit">
          {renderChannelIcon(task.channel?.icon)}
          <span className="truncate max-w-[130px]">{task.channel?.name || "Administrasi"}</span>
        </span>
      </TableCell>

      {/* 3. Pelaksana & Delegasi */}
      <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        {(() => {
          const allAssignees = task.assignees && task.assignees.length > 0
            ? task.assignees
            : [task.assignee, task.secondary_assignee].filter(Boolean) as User[]

          if (allAssignees.length > 0) {
            const primary = allAssignees[0]
            const extraCount = allAssignees.length - 1
            return (
              <div className="flex flex-col gap-1 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                    {allAssignees.slice(0, 3).map((u, i) => (
                      <img
                        key={u.id || i}
                        src={
                          u.avatar_url ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                        }
                        alt={u.nama}
                        title={u.nama}
                        className="size-6 rounded-full object-cover border-2 border-background ring-1 ring-border shrink-0"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                      {primary.nama}
                      {extraCount > 0 ? ` +${extraCount}` : ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                      {extraCount > 0 ? `${allAssignees.length} Pelaksana (Tim)` : (primary.position_title || "Pelaksana")}
                    </span>
                  </div>
                </div>
                {task.delegator && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded w-fit border border-amber-200/60 font-medium">
                    <ArrowRightLeftIcon className="size-2.5 shrink-0 text-amber-600" />
                    <span className="truncate max-w-[130px]">
                      Delegasi: {task.delegator.nama.split(" ")[0]}
                    </span>
                  </div>
                )}
              </div>
            )
          }

          if (isStaff) {
            return (
              <span className="text-[11px] text-muted-foreground font-mono italic">
                Belum Ditugaskan
              </span>
            )
          }

          return (
            <button
              type="button"
              onClick={() => onOpenDelegate(task)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 rounded-md border border-red-200 dark:border-red-900/50 cursor-pointer transition-colors"
            >
              <UserPlusIcon className="size-3" />
              <span>Tugaskan</span>
            </button>
          )
        })()}
      </TableCell>

      {/* 4. Prioritas */}
      <TableCell className="py-3 px-4">
        <Badge variant="outline" className={`px-2 py-0.5 text-[11px] font-semibold w-fit ${pMeta.className}`}>
          {pMeta.label}
        </Badge>
      </TableCell>

      {/* 5. Deadline & Waktu Pengumpulan */}
      <TableCell className="py-3 px-4">
        {task.deadline_at || task.completed_at ? (
          <div className="flex flex-col gap-1 text-xs min-w-[130px]">
            {task.deadline_at && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-medium">Batas:</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {new Date(task.deadline_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  {new Date(task.deadline_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {isCompleted ? (
              <div className="flex items-center gap-1 flex-wrap">
                {isCompletedOnTime ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2Icon className="size-2.5" />
                    Tepat Waktu
                  </span>
                ) : isCompletedLate ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 px-1.5 py-0.5 rounded border border-red-200">
                    <AlertCircleIcon className="size-2.5" />
                    Terlambat
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Selesai
                  </span>
                )}
                {task.completed_at && (
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    ({new Date(task.completed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}{" "}
                    {new Date(task.completed_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })})
                  </span>
                )}
              </div>
            ) : isOverdue ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 px-1.5 py-0.5 rounded border border-red-200 w-fit">
                <AlertCircleIcon className="size-2.5" />
                Lewat Deadline
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs font-mono">-</span>
        )}
      </TableCell>

      {/* 6. Status */}
      <TableCell className="py-3 px-4">
        <Badge variant="outline" className={`flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${sMeta.className}`}>
          {sMeta.icon}
          <span>{sMeta.label}</span>
        </Badge>
      </TableCell>

      {/* 7. Aksi Dropdown */}
      <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="flex size-8 text-muted-foreground data-open:bg-muted cursor-pointer"
              />
            }
          >
            <MoreVerticalIcon className="size-4" />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-[8px]">
            <DropdownMenuItem
              onClick={() => onOpenDetail(task)}
              className="text-xs cursor-pointer"
            >
              <EyeIcon className="size-3.5 mr-2 text-muted-foreground" />
              Lihat Detail & SPJ
            </DropdownMenuItem>
            {!isStaff && (
              <DropdownMenuItem
                onClick={() => onOpenDelegate(task)}
                className="text-xs cursor-pointer"
              >
                <UserPlusIcon className="size-3.5 mr-2 text-muted-foreground" />
                Delegasikan
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isStaff ? (
              <>
                {(task.status === "todo" || task.status === "unassigned") && (
                  <DropdownMenuItem
                    onClick={() => onQuickStatus(task.id, "in_progress")}
                    className="text-xs cursor-pointer text-blue-700 dark:text-blue-400 font-semibold"
                  >
                    <ClockIcon className="size-3.5 mr-2" />
                    Mulai Pengerjaan
                  </DropdownMenuItem>
                )}
                {task.status === "in_progress" && (
                  <DropdownMenuItem
                    onClick={() => onQuickStatus(task.id, "review")}
                    className="text-xs cursor-pointer text-purple-700 dark:text-purple-400 font-semibold"
                  >
                    <CheckCircle2Icon className="size-3.5 mr-2" />
                    Ajukan Review ke Atasan
                  </DropdownMenuItem>
                )}
              </>
            ) : (
              <>
                {task.status === "review" && canApprove && (
                  <DropdownMenuItem
                    onClick={() => onQuickStatus(task.id, "done")}
                    className="text-xs cursor-pointer text-purple-700 dark:text-purple-400 font-semibold"
                  >
                    <CheckCircle2Icon className="size-3.5 mr-2" />
                    Approve Hasil Kerja
                  </DropdownMenuItem>
                )}
                {task.status !== "done" && task.status !== "review" && (
                  <DropdownMenuItem
                    onClick={() => onQuickStatus(task.id, "done")}
                    className="text-xs cursor-pointer text-emerald-700 dark:text-emerald-400"
                  >
                    <CheckCircle2Icon className="size-3.5 mr-2" />
                    Tandai Selesai
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

interface DataTableProps {
  tasks: Task[]
  onRefresh?: () => void
  hideTitle?: boolean
  hideToolbar?: boolean
  className?: string
  isStaff?: boolean
}

export function DataTable({
  tasks: initialTasks,
  onRefresh,
  hideTitle = false,
  hideToolbar = false,
  className = "",
  isStaff,
}: DataTableProps) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const activeUser = React.useMemo(() => getActiveUserFromStorage(), [])
  const isStaffUser = isStaff !== undefined ? isStaff : activeUser?.role === "staff"

  React.useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [channelFilter, setChannelFilter] = React.useState<string>("all")

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [delegatingTask, setDelegatingTask] = React.useState<Task | null>(null)
  const [isDelegateOpen, setIsDelegateOpen] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  // Unique channels from tasks
  const channels = React.useMemo(() => {
    const map = new Map<string, string>()
    tasks.forEach((t) => {
      if (t.channel_id && t.channel?.name) {
        map.set(t.channel_id, t.channel.name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [tasks])

  // Filtered tasks
  const filteredTasks = React.useMemo(() => {
    if (hideToolbar) return tasks

    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchTicket = task.ticket_code.toLowerCase().includes(q)
        const allAssignees = task.assignees && task.assignees.length > 0
          ? task.assignees
          : [task.assignee, task.secondary_assignee].filter(Boolean) as User[]
        const matchAssignee = allAssignees.some((u) => u?.nama.toLowerCase().includes(q))
        if (!matchTitle && !matchTicket && !matchAssignee) return false
      }

      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false
      }

      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false
      }

      if (channelFilter !== "all" && task.channel_id !== channelFilter) {
        return false
      }

      return true
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, channelFilter, hideToolbar])

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1
  const paginatedTasks = React.useMemo(() => {
    const start = pageIndex * pageSize
    return filteredTasks.slice(start, start + pageSize)
  }, [filteredTasks, pageIndex, pageSize])

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || priorityFilter !== "all" || channelFilter !== "all"

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setChannelFilter("all")
    setPageIndex(0)
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedTasks.length && paginatedTasks.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedTasks.map((t) => t.id)))
    }
  }

  const handleOpenDetail = (task: Task) => {
    setSelectedTaskId(task.id)
    setIsDetailOpen(true)
  }

  const handleOpenDelegate = (task: Task) => {
    setDelegatingTask(task)
    setIsDelegateOpen(true)
  }

  const handleQuickStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const targetTask = tasks.find((t) => t.id === taskId)
      const currentUser = getActiveUserFromStorage()

      // Validasi wajib bukti dan kelengkapan subtask sebelum review atau done
      if ((newStatus === "review" || newStatus === "done") && currentUser?.role !== "admin") {
        if (newStatus === "review") {
          toast.info("Gunakan tombol 'Ajukan Review' di dalam detail tugas!", {
            description: "Pelaksana wajib mengisi Ringkasan Hasil Kerja (minimal 10 karakter) sebelum mengajukan review ke atasan.",
          })
          return
        }

        const uncompletedSubtasks = (targetTask?.subtasks || []).filter((st) => !st.is_completed)
        if (uncompletedSubtasks.length > 0) {
          toast.error("Seluruh tahapan subtask belum selesai!", {
            description: `Masih ada ${uncompletedSubtasks.length} tahapan subtask yang belum dicentang. Buka detail tugas untuk menyelesaikannya.`,
          })
          return
        }

        const totalEvidence =
          (targetTask?.attachments || []).length +
          (targetTask?.subtasks || []).reduce((acc, st) => acc + (st.attachments || []).length, 0)

        if (totalEvidence === 0) {
          toast.error("Wajib mengunggah bukti pengerjaan!", {
            description: "Buka detail tugas dan lampirkan minimal 1 bukti foto/dokumen sebelum mengubah status.",
          })
          return
        }
      }

      const ok = await updateTaskStatus(taskId, newStatus, currentUser?.id)
      if (ok) {
        toast.success(`Status tugas berhasil diubah ke ${statusMeta[newStatus]?.label}!`)
        if (onRefresh) onRefresh()
      } else {
        toast.error("Gagal memperbarui status tugas.")
      }
    } catch {
      toast.error("Terjadi kendala saat memperbarui status.")
    }
  }

  const isAllSelected = paginatedTasks.length > 0 && selectedIds.size === paginatedTasks.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < paginatedTasks.length

  const getStatusDisplay = () => {
    if (statusFilter === "all") return "Semua Status"
    return statusMeta[statusFilter as TaskStatus]?.label || statusFilter
  }

  const getPriorityDisplay = () => {
    if (priorityFilter === "all") return "Semua Prioritas"
    if (priorityFilter === "high" || priorityFilter === "urgent") return "Prioritas Tinggi"
    if (priorityFilter === "medium") return "Prioritas Sedang"
    if (priorityFilter === "low") return "Prioritas Rendah"
    return priorityFilter
  }

  const getChannelDisplay = () => {
    if (channelFilter === "all") return "Semua Departemen"
    const ch = channels.find((c) => c.id === channelFilter)
    return ch ? ch.name : "Departemen"
  }

  if (hideToolbar && hideTitle) {
    return (
      <div className={`relative space-y-3.5 ${className}`}>
        {/* Inner Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent text-xs text-muted-foreground font-semibold">
                <TableHead className="w-[36px] px-3 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onCheckedChange={handleToggleSelectAll}
                      aria-label="Select all"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-3 px-4 min-w-[200px]">Tugas & No. Tiket</TableHead>
                <TableHead className="py-3 pl-1.5 pr-4 min-w-[130px] text-left">Kategori / Divisi</TableHead>
                <TableHead className="py-3 px-4 min-w-[160px]">Pelaksana & Delegasi</TableHead>
                <TableHead className="py-3 px-4 min-w-[110px]">Prioritas</TableHead>
                <TableHead className="py-3 px-4 min-w-[140px]">Deadline & Pengumpulan</TableHead>
                <TableHead className="py-3 px-4 min-w-[130px]">Status</TableHead>
                <TableHead className="py-3 px-4 text-right min-w-[60px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((t) => (
                  <TaskTableRow
                    key={t.id}
                    task={t}
                    isSelected={selectedIds.has(t.id)}
                    onToggleSelect={handleToggleSelect}
                    onOpenDetail={handleOpenDetail}
                    onOpenDelegate={handleOpenDelegate}
                    onQuickStatus={handleQuickStatus}
                    isStaff={isStaffUser}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-xs">
                    Tidak ada task yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Row Selection Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-1">
          <div className="text-muted-foreground text-xs font-mono">
            {selectedIds.size} dari {filteredTasks.length} baris dipilih.
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Baris per halaman</span>
              <Select
                value={`${pageSize}`}
                onValueChange={(val) => {
                  setPageSize(Number(val))
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((s) => (
                    <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-xl"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeftIcon className="size-4" />
                <span className="sr-only">Halaman pertama</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-xl"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeftIcon className="size-4" />
                <span className="sr-only">Sebelumnya</span>
              </Button>
              <span className="text-xs px-2 font-mono font-medium">
                Hal. {pageIndex + 1} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-xl"
                onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronRightIcon className="size-4" />
                <span className="sr-only">Berikutnya</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-xl"
                onClick={() => setPageIndex(totalPages - 1)}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronsRightIcon className="size-4" />
                <span className="sr-only">Halaman terakhir</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Task Detail Sheet */}
        <TaskDetailSheet
          taskId={selectedTaskId}
          initialTask={selectedTaskId ? tasks.find((t: Task) => t.id === selectedTaskId) || null : null}
          open={isDetailOpen}
          onOpenChange={(open) => {
            setIsDetailOpen(open)
            if (!open) setSelectedTaskId(null)
          }}
          onTaskUpdated={() => {
            if (onRefresh) onRefresh()
          }}
          onOpenDelegate={handleOpenDelegate}
        />

        {/* Delegate Task Modal */}
        <DelegateTaskModal
          task={delegatingTask}
          open={isDelegateOpen}
          onOpenChange={setIsDelegateOpen}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
        />

        {/* Create Task Modal */}
        <CreateTaskModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Standalone Card Container */}
      <div className="rounded-[8px] border border-border bg-card p-4 space-y-4 shadow-2xs">
        {/* Header Title / Total Tasks */}
        {!hideTitle && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isStaffUser ? "Daftar Penugasan Kerja Saya" : "Daftar Tugas & Agenda Kerja"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isStaffUser
                  ? "Kelola status progress pengerjaan tugas, unggah berkas SPJ, dan ajukan review ke atasan."
                  : "Monitoring status, prioritas target, penanggung jawab pelaksana tugas, dan instruksi pendelegasian."}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground w-fit">
              Total {filteredTasks.length} Tugas
            </span>
          </div>
        )}

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-[8px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs animate-in fade-in duration-150">
            <span className="font-semibold text-red-700 dark:text-red-400">
              {selectedIds.size} tugas dipilih
            </span>
            <div className="flex items-center gap-2">
              {isStaffUser ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        for (const id of Array.from(selectedIds)) {
                          await updateTaskStatus(id, "review")
                        }
                        toast.success(`${selectedIds.size} tugas diajukan untuk review ke atasan!`)
                        setSelectedIds(new Set())
                        if (onRefresh) onRefresh()
                      } catch {
                        toast.error("Gagal mengajukan review tugas")
                      }
                    }}
                    className="h-7 px-2.5 text-xs border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/50 rounded-[8px]"
                  >
                    <PauseCircleIcon className="size-3 mr-1" />
                    Ajukan Review Massal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Batal
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        for (const id of Array.from(selectedIds)) {
                          await updateTaskStatus(id, "done")
                        }
                        toast.success(`${selectedIds.size} tugas ditandai selesai!`)
                        setSelectedIds(new Set())
                        if (onRefresh) onRefresh()
                      } catch {
                        toast.error("Gagal memperbarui status tugas")
                      }
                    }}
                    className="h-7 px-2 text-xs border-red-300 text-red-700 hover:bg-red-100 rounded-[8px]"
                  >
                    <CheckCircle2Icon className="size-3 mr-1" />
                    Tandai Selesai
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (confirm(`Yakin ingin menghapus ${selectedIds.size} tugas terpilih?`)) {
                        try {
                          for (const id of Array.from(selectedIds)) {
                            await deleteTask(id)
                          }
                          toast.success(`${selectedIds.size} tugas berhasil dihapus!`)
                          setSelectedIds(new Set())
                          if (onRefresh) onRefresh()
                        } catch {
                          toast.error("Gagal menghapus tugas")
                        }
                      }
                    }}
                    className="h-7 px-2 text-xs rounded-[8px]"
                  >
                    <Trash2Icon className="size-3 mr-1" />
                    Hapus
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Toolbar: Search & Filters */}
        {!hideToolbar && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input & Select Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPageIndex(0)
                  }}
                  placeholder="Cari data, tugas..."
                  className="h-8 pl-8 pr-3 text-xs rounded-[8px] bg-zinc-50 dark:bg-zinc-800/60 border-border"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v || "all")
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-zinc-50 dark:bg-zinc-800/60 border-border min-w-[125px] w-auto">
                  <span className="truncate">{getStatusDisplay()}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="in_progress">Dalam Proses</SelectItem>
                  <SelectItem value="review">Review Atasan</SelectItem>
                  <SelectItem value="done">Selesai</SelectItem>
                  <SelectItem value="todo">To-Do</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select
                value={priorityFilter}
                onValueChange={(v) => {
                  setPriorityFilter(v || "all")
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-zinc-50 dark:bg-zinc-800/60 border-border min-w-[130px] w-auto">
                  <span className="truncate">{getPriorityDisplay()}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="urgent">Mendesak</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>

              {/* Channel / Departemen Filter */}
              <Select
                value={channelFilter}
                onValueChange={(v) => {
                  setChannelFilter(v || "all")
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-zinc-50 dark:bg-zinc-800/60 border-border min-w-[145px] w-auto max-w-[190px]">
                  <span className="truncate">{getChannelDisplay()}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Departemen</SelectItem>
                  {channels.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Reset Filter Button if active */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-[8px] gap-1"
                >
                  <XIcon className="size-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>

            {/* Right Controls: Buat Task Button (Only for Management/Admin) */}
            {!isStaffUser && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 px-3 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] gap-1.5 shadow-xs cursor-pointer"
                >
                  <PlusIcon className="size-3.5" />
                  <span>Buat Task</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Inner Table Container */}
        <div className="overflow-x-auto rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-card shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent text-xs text-muted-foreground font-semibold">
                <TableHead className="w-[36px] px-3 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onCheckedChange={handleToggleSelectAll}
                      aria-label="Select all"
                    />
                  </div>
                </TableHead>
                <TableHead className="py-3 px-4 min-w-[200px]">Tugas & No. Tiket</TableHead>
                <TableHead className="py-3 pl-1.5 pr-4 min-w-[130px] text-left">Kategori / Divisi</TableHead>
                <TableHead className="py-3 px-4 min-w-[160px]">Pelaksana & Delegasi</TableHead>
                <TableHead className="py-3 px-4 min-w-[110px]">Prioritas</TableHead>
                <TableHead className="py-3 px-4 min-w-[140px]">Deadline & Pengumpulan</TableHead>
                <TableHead className="py-3 px-4 min-w-[130px]">Status</TableHead>
                <TableHead className="py-3 px-4 text-right min-w-[60px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((t) => (
                  <TaskTableRow
                    key={t.id}
                    task={t}
                    isSelected={selectedIds.has(t.id)}
                    onToggleSelect={handleToggleSelect}
                    onOpenDetail={handleOpenDetail}
                    onOpenDelegate={handleOpenDelegate}
                    onQuickStatus={handleQuickStatus}
                    isStaff={isStaffUser}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-xs">
                    Tidak ada task yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Row Selection Count */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="text-muted-foreground text-xs font-mono">
            {selectedIds.size} dari {filteredTasks.length} baris dipilih.
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Baris per halaman</span>
              <Select
                value={`${pageSize}`}
                onValueChange={(val) => {
                  setPageSize(Number(val))
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs rounded-[8px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((s) => (
                    <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-[8px]"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeftIcon className="size-4" />
                <span className="sr-only">Halaman pertama</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-[8px]"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeftIcon className="size-4" />
                <span className="sr-only">Sebelumnya</span>
              </Button>
              <span className="text-xs px-2 font-mono font-medium">
                Hal. {pageIndex + 1} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-[8px]"
                onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronRightIcon className="size-4" />
                <span className="sr-only">Berikutnya</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-[8px]"
                onClick={() => setPageIndex(totalPages - 1)}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronsRightIcon className="size-4" />
                <span className="sr-only">Halaman terakhir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        taskId={selectedTaskId}
        initialTask={selectedTaskId ? tasks.find((t: Task) => t.id === selectedTaskId) || null : null}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setSelectedTaskId(null)
        }}
        onTaskUpdated={() => {
          if (onRefresh) onRefresh()
        }}
        onOpenDelegate={handleOpenDelegate}
      />

      {/* Delegate Task Modal */}
      <DelegateTaskModal
        task={delegatingTask}
        open={isDelegateOpen}
        onOpenChange={setIsDelegateOpen}
        onSuccess={() => {
          if (onRefresh) onRefresh()
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          if (onRefresh) onRefresh()
        }}
      />
    </div>
  )
}
