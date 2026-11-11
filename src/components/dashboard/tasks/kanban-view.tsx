"use client"

import * as React from "react"
import {
  PlusIcon,
  SparklesIcon,
  UserPlusIcon,
  MapPinIcon,
  GripVerticalIcon,
  ArrowUpDownIcon,
  ClockIcon,
  CalendarIcon,
  ShieldCheckIcon,
  LockIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileCheckIcon,
  Loader2Icon,
  InboxIcon,
  ArrowDownIcon,
  PaperclipIcon,
  CheckSquareIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Task, TaskStatus, User } from "@/types/database"
import { toast } from "sonner"
import {
  getActiveUserFromStorage,
  canUserApproveTask,
  getTaskAssigneeIds,
  submitTaskForReview,
} from "@/lib/api"

interface KanbanViewProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus, reviewNotes?: string) => void
  onOpenDelegate?: (task: Task) => void
  onOpenCreate?: (defaultStatus?: TaskStatus) => void
}

const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string; badgeColor: string }[] = [
  {
    id: "todo",
    label: "To Do / Antrean Tugas",
    color: "bg-amber-500",
    badgeColor: "bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 border-amber-300/80 dark:border-amber-800/80",
  },
  {
    id: "in_progress",
    label: "Dalam Pengerjaan",
    color: "bg-blue-500",
    badgeColor: "bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 border-blue-300/80 dark:border-blue-800/80",
  },
  {
    id: "review",
    label: "Review Atasan",
    color: "bg-purple-500",
    badgeColor: "bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-400 border-purple-300/80 dark:border-purple-800/80",
  },
  {
    id: "done",
    label: "Selesai",
    color: "bg-emerald-500",
    badgeColor: "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border-emerald-300/80 dark:border-emerald-800/80",
  },
]

const priorityBadge: Record<string, string> = {
  urgent: "bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-bold",
  high: "bg-amber-50 text-amber-700 border-amber-200/90 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-semibold",
  medium: "bg-blue-50 text-blue-700 border-blue-200/90 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-medium",
  low: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 font-normal",
}

export function KanbanView({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onOpenDelegate,
  onOpenCreate,
}: KanbanViewProps) {
  // Local list state for instant vertical reordering & cross-column movements
  const [localTasks, setLocalTasks] = React.useState<Task[]>(tasks)
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = React.useState<TaskStatus | null>(null)
  const [dropTarget, setDropTarget] = React.useState<{ taskId: string; position: "top" | "bottom" } | null>(null)

  // Alert modal for blocked transitions
  const [blockedAlert, setBlockedAlert] = React.useState<{ title: string; reason: string } | null>(null)

  // Review submission dialog state when dragging to 'review'
  const [pendingReviewTask, setPendingReviewTask] = React.useState<{
    task: Task
    targetPos?: "top" | "bottom"
    targetTaskId?: string
  } | null>(null)
  const [reviewNotesInput, setReviewNotesInput] = React.useState("")
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false)

  const currentUser = React.useMemo(() => getActiveUserFromStorage(), [])

  // Strict Validation: Cannot bypass review to done, and review -> done requires supervisor approval
  const validateStatusTransition = (
    movingTask: Task,
    targetColId: TaskStatus
  ): { allowed: boolean; title?: string; reason?: string } => {
    const fromStatus = movingTask.status === "unassigned" ? "todo" : movingTask.status
    if (fromStatus === targetColId) return { allowed: true }

    // 1. Moving to 'done':
    if (targetColId === "done") {
      // Must come through 'review' first (cannot jump from todo or in_progress directly to done)
      if (fromStatus !== "review" && currentUser?.role !== "admin") {
        return {
          allowed: false,
          title: "Tidak Dapat Menyelesaikan Tugas Langsung",
          reason:
            "Tugas yang sedang dalam pengerjaan tidak dapat langsung dipindahkan ke 'Selesai'. Setiap tugas wajib diajukan ke kolom 'Review Atasan' terlebih dahulu agar hasil pekerjaan dan berkas bukti dapat diverifikasi dan disetujui oleh atasan.",
        }
      }

      // Validasi kelengkapan subtask:
      const uncompletedSubtasks = (movingTask.subtasks || []).filter((st) => !st.is_completed)
      if (uncompletedSubtasks.length > 0 && currentUser?.role !== "admin") {
        return {
          allowed: false,
          title: "Tahapan Subtask Belum Selesai",
          reason: `Masih ada ${uncompletedSubtasks.length} tahapan subtask yang belum diselesaikan. Selesaikan semua tahapan sebelum tugas diselesaikan.`,
        }
      }

      // Moving from 'review' to 'done' requires supervisor/reviewer/admin approval
      if (fromStatus === "review") {
        const canApprove = canUserApproveTask(movingTask, currentUser)
        if (!canApprove) {
          return {
            allowed: false,
            title: "Persetujuan Atasan Diperlukan",
            reason:
              "Hanya Atasan atau Reviewer yang berwenang menyetujui tugas ini menjadi Selesai. Pelaksana tugas dilarang menyetujui dan menyelesaikan tugasnya sendiri.",
          }
        }
      }
    }

    // 1.5 Moving to 'review':
    if (targetColId === "review") {
      // Validasi kelengkapan subtask sebelum diajukan review:
      const uncompletedSubtasks = (movingTask.subtasks || []).filter((st) => !st.is_completed)
      if (uncompletedSubtasks.length > 0 && currentUser?.role !== "admin") {
        return {
          allowed: false,
          title: "Tahapan Subtask Belum Lengkap",
          reason: `Masih ada ${uncompletedSubtasks.length} tahapan subtask yang belum selesai. Selesaikan seluruh tahapan checklist sebelum mengajukan review ke atasan.`,
        }
      }
    }

    // 2. Moving out of 'review' to another status (e.g. back to in_progress or todo):
    if (fromStatus === "review" && targetColId !== "done") {
      const isTaskAssignee = currentUser && getTaskAssigneeIds(movingTask).includes(currentUser.id)

      // Pelaksana tugas berhak menarik kembali tugas dari Review ke Dalam Pengerjaan jika ada yang ingin diperbaiki
      if (targetColId === "in_progress" && isTaskAssignee) {
        return { allowed: true }
      }

      const canApprove = canUserApproveTask(movingTask, currentUser)
      if (!canApprove && currentUser?.role !== "admin") {
        return {
          allowed: false,
          title: "Tugas Sedang Dalam Review",
          reason:
            "Tugas sedang dalam proses review atasan dan terkunci sampai atasan memberikan persetujuan atau catatan evaluasi/revisi.",
        }
      }
    }

    return { allowed: true }
  }

  // Sync with incoming tasks prop
  React.useEffect(() => {
    setLocalTasks((prev) => {
      // Preserve custom order where possible, update contents
      const taskMap = new Map(tasks.map((t) => [t.id, t]))
      const existingIds = new Set(prev.map((t) => t.id))
      
      const updatedExisting = prev
        .filter((t) => taskMap.has(t.id))
        .map((t) => taskMap.get(t.id)!)
      
      const newTasks = tasks.filter((t) => !existingIds.has(t.id))
      return [...updatedExisting, ...newTasks]
    })
  }, [tasks])

  // Drag Start
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", task.id)
    e.dataTransfer.effectAllowed = "move"
    setDraggedTaskId(task.id)
  }

  // Drag End
  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverCol(null)
    setDropTarget(null)
  }

  // Hovering over a specific card (top vs bottom detection for vertical drop)
  const handleDragOverCard = (e: React.DragEvent, targetTask: Task, colId: TaskStatus) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"

    if (!draggedTaskId || draggedTaskId === targetTask.id) {
      setDropTarget(null)
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: "top" | "bottom" = e.clientY < midY ? "top" : "bottom"

    setDropTarget({ taskId: targetTask.id, position })
    setDragOverCol(colId)
  }

  // Hovering over general column container
  const handleDragOverColumn = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverCol !== colId) {
      setDragOverCol(colId)
    }
  }

  // Drop on a specific card position (above or below)
  const handleDropOnCard = async (e: React.DragEvent, targetTask: Task, targetColId: TaskStatus) => {
    e.preventDefault()
    e.stopPropagation()

    const movingTaskId = e.dataTransfer.getData("text/plain") || draggedTaskId
    const currentDropTarget = dropTarget

    setDraggedTaskId(null)
    setDragOverCol(null)
    setDropTarget(null)

    if (!movingTaskId || movingTaskId === targetTask.id) return

    const movingTask = localTasks.find((t) => t.id === movingTaskId)
    if (!movingTask) return

    const targetPos = currentDropTarget?.position || "bottom"
    const isStatusChanging =
      (movingTask.status === "unassigned" ? "todo" : movingTask.status) !== targetColId

    // Enforce approval & transition validation
    if (isStatusChanging) {
      const validation = validateStatusTransition(movingTask, targetColId)
      if (!validation.allowed) {
        setBlockedAlert({
          title: validation.title || "Aksi Tidak Diizinkan",
          reason: validation.reason || "Status tugas tidak dapat dipindahkan.",
        })
        toast.error(validation.title || "Aksi Tidak Diizinkan", {
          description: validation.reason,
        })
        return
      }

      // Khusus perpindahan ke 'review': Jangan otomatis, munculkan pop-up ringkasan kerja!
      if (targetColId === "review") {
        setPendingReviewTask({
          task: movingTask,
        })
        setReviewNotesInput(movingTask.review_notes || "")
        return
      }
    }

    // Reorder local state
    setLocalTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== movingTaskId)
      const targetIndex = filtered.findIndex((t) => t.id === targetTask.id)
      if (targetIndex === -1) return prev

      const insertIndex = targetPos === "top" ? targetIndex : targetIndex + 1
      const updatedMovingTask: Task = {
        ...movingTask,
        status: isStatusChanging ? targetColId : movingTask.status,
      }

      const copy = [...filtered]
      copy.splice(insertIndex, 0, updatedMovingTask)
      return copy
    })

    if (isStatusChanging) {
      const colMeta = KANBAN_COLUMNS.find((c) => c.id === targetColId)
      if (movingTask.status === "review" && targetColId === "done") {
        toast.success(`[${movingTask.ticket_code}] disetujui & diselesaikan resmi! ✅`)
      } else if (movingTask.status === "review" && targetColId === "in_progress") {
        const isAssignee = currentUser && getTaskAssigneeIds(movingTask).includes(currentUser.id)
        if (isAssignee) {
          toast.info(`[${movingTask.ticket_code}] berhasil ditarik kembali ke Dalam Pengerjaan. ↩`)
        } else {
          toast.warning(`[${movingTask.ticket_code}] dikembalikan ke Dalam Pengerjaan untuk evaluasi/revisi. ⚠️`)
        }
      } else {
        toast.success(`[${movingTask.ticket_code}] dipindahkan ke "${colMeta?.label || targetColId}"`)
      }
      onUpdateStatus?.(movingTaskId, targetColId)
    } else {
      toast.info(`Urutan [${movingTask.ticket_code}] berhasil disesuaikan`)
    }
  }

  // Drop into column empty area / bottom
  const handleDropOnColumn = async (e: React.DragEvent, targetColId: TaskStatus) => {
    e.preventDefault()

    const movingTaskId = e.dataTransfer.getData("text/plain") || draggedTaskId
    setDraggedTaskId(null)
    setDragOverCol(null)
    setDropTarget(null)

    if (!movingTaskId) return

    const movingTask = localTasks.find((t) => t.id === movingTaskId)
    if (!movingTask) return

    const isStatusChanging =
      (movingTask.status === "unassigned" ? "todo" : movingTask.status) !== targetColId

    // Enforce approval & transition validation
    if (isStatusChanging) {
      const validation = validateStatusTransition(movingTask, targetColId)
      if (!validation.allowed) {
        setBlockedAlert({
          title: validation.title || "Aksi Tidak Diizinkan",
          reason: validation.reason || "Status tugas tidak dapat dipindahkan.",
        })
        toast.error(validation.title || "Aksi Tidak Diizinkan", {
          description: validation.reason,
        })
        return
      }

      // Khusus perpindahan ke 'review': Jangan otomatis, munculkan pop-up ringkasan kerja!
      if (targetColId === "review") {
        setPendingReviewTask({
          task: movingTask,
        })
        setReviewNotesInput(movingTask.review_notes || "")
        return
      }
    }

    setLocalTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== movingTaskId)
      const updatedMovingTask: Task = {
        ...movingTask,
        status: isStatusChanging ? targetColId : movingTask.status,
      }
      return [...filtered, updatedMovingTask]
    })

    if (isStatusChanging) {
      const colMeta = KANBAN_COLUMNS.find((c) => c.id === targetColId)
      if (movingTask.status === "review" && targetColId === "done") {
        toast.success(`[${movingTask.ticket_code}] disetujui & diselesaikan resmi! ✅`)
      } else if (movingTask.status === "review" && targetColId === "in_progress") {
        const isAssignee = currentUser && getTaskAssigneeIds(movingTask).includes(currentUser.id)
        if (isAssignee) {
          toast.info(`[${movingTask.ticket_code}] berhasil ditarik kembali ke Dalam Pengerjaan. ↩`)
        } else {
          toast.warning(`[${movingTask.ticket_code}] dikembalikan ke Dalam Pengerjaan untuk evaluasi/revisi. ⚠️`)
        }
      } else {
        toast.success(`[${movingTask.ticket_code}] dipindahkan ke "${colMeta?.label || targetColId}"`)
      }
      onUpdateStatus?.(movingTaskId, targetColId)
    }
  }

  // Handle confirm submit review from modal
  const handleConfirmReviewSubmission = async () => {
    if (!pendingReviewTask) return
    const { task } = pendingReviewTask
    const notes = reviewNotesInput.trim()

    if (!notes) {
      toast.error("Harap isi ringkasan hasil kerja terlebih dahulu.")
      return
    }

    setIsSubmittingReview(true)
    try {
      if (currentUser) {
        await submitTaskForReview(task.id, currentUser.id, notes)
      }

      setLocalTasks((prev) => {
        const filtered = prev.filter((t) => t.id !== task.id)
        const updatedTask: Task = {
          ...task,
          status: "review",
          review_notes: notes,
        }
        return [...filtered, updatedTask]
      })

      onUpdateStatus?.(task.id, "review", notes)
      toast.success(`[${task.ticket_code}] berhasil diajukan untuk review atasan! 📋`)
      setPendingReviewTask(null)
      setReviewNotesInput("")
    } catch (err) {
      console.error("Gagal submit review:", err)
      toast.error("Terjadi kesalahan saat mengajukan review tugas.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 lg:px-6 items-start pb-10">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = localTasks.filter((t) => {
          if (col.id === "todo") {
            return t.status === "todo" || t.status === "unassigned"
          }
          return t.status === col.id
        })

        const isDropTargetCol = dragOverCol === col.id

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOverColumn(e, col.id)}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                if (dragOverCol === col.id) setDragOverCol(null)
              }
            }}
            onDrop={(e) => handleDropOnColumn(e, col.id)}
            className={`flex flex-col gap-3 rounded-2xl border p-3.5 min-h-[660px] transition-all duration-200 ${
              isDropTargetCol
                ? "bg-zinc-200/70 dark:bg-zinc-700/60 border-primary/70 ring-2 ring-primary/30 shadow-md"
                : "bg-zinc-50/90 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-700/50 shadow-2xs"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2.5 px-1 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${col.color} shadow-xs ring-2 ring-white dark:ring-zinc-900`} />
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                  {col.label}
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums border shadow-2xs ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
              </div>
              {onOpenCreate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenCreate(col.id)}
                  className="size-7 text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg shadow-2xs transition-all cursor-pointer"
                  title={`Tambah tugas ke kolom ${col.label}`}
                >
                  <PlusIcon className="size-4" />
                </Button>
              )}
            </div>

            {/* Task Cards Vertical Stack */}
            <div className="flex flex-col gap-2.5 flex-1">
              {colTasks.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed text-center transition-all ${
                    isDropTargetCol
                      ? "border-primary bg-primary/5 text-primary font-semibold animate-pulse"
                      : "border-zinc-300/80 dark:border-zinc-700/80 bg-white/40 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  <div className="size-9 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 flex items-center justify-center mb-2">
                    {isDropTargetCol ? (
                      <ArrowDownIcon className="size-4 text-primary animate-bounce" />
                    ) : (
                      <InboxIcon className="size-4 text-zinc-400 dark:text-zinc-500" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {isDropTargetCol ? "Lepaskan tugas di sini" : "Tidak ada tugas"}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {isDropTargetCol
                      ? `Tugas akan dipindahkan ke ${col.label}`
                      : "Belum ada tugas pada status ini"}
                  </p>
                </div>
              ) : (
                colTasks.map((task) => {
                  const completedSubtasks = (task.subtasks || []).filter((s) => s.is_completed).length
                  const totalSubtasks = (task.subtasks || []).length
                  const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
                  const isBeingDragged = draggedTaskId === task.id
                  const isTargetedCard = dropTarget?.taskId === task.id

                  return (
                    <div key={task.id} className="relative flex flex-col">
                      {/* Insertion Indicator Line (TOP) */}
                      {isTargetedCard && dropTarget.position === "top" && (
                        <div className="h-1.5 w-full bg-primary rounded-full shadow-sm my-1 animate-pulse flex items-center justify-between px-1">
                          <div className="size-2 rounded-full bg-white ring-2 ring-primary" />
                          <div className="size-2 rounded-full bg-white ring-2 ring-primary" />
                        </div>
                      )}

                      {/* Draggable Card */}
                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOverCard(e, task, col.id)}
                        onDrop={(e) => handleDropOnCard(e, task, col.id)}
                        onClick={() => onSelectTask(task)}
                        className={`group relative flex flex-col gap-2 rounded-xl border bg-white dark:bg-zinc-900 p-3 shadow-xs transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged
                            ? "opacity-30 border-dashed border-primary scale-95"
                            : isTargetedCard
                            ? "border-primary dark:border-primary shadow-md ring-1 ring-primary/40"
                            : "border-zinc-200/60 dark:border-zinc-800/70 hover:shadow-sm hover:border-zinc-300/80 dark:hover:border-zinc-700 hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Top Row: Ticket Code & Priority */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVerticalIcon className="size-3.5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />
                            <span className="font-mono text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                              {task.ticket_code}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-2 py-0.5 uppercase tracking-wider rounded-md shrink-0 ${
                              priorityBadge[task.priority] || ""
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Title & Category */}
                        <div className="space-y-0.5">
                          <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                            {task.title}
                          </h4>
                          {task.channel && (
                            <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                              <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                              <span className="truncate">{task.channel.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Review Status Indicator */}
                        {task.status === "review" && (
                          <div
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium ${
                              canUserApproveTask(task, currentUser)
                                ? "bg-amber-50 border-amber-200/80 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300"
                                : "bg-zinc-50 border-zinc-200/80 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700/60 dark:text-zinc-400"
                            }`}
                          >
                            {canUserApproveTask(task, currentUser) ? (
                              <>
                                <ShieldCheckIcon className="size-3 text-amber-500 shrink-0" />
                                <span className="truncate">Perlu Persetujuan Anda</span>
                              </>
                            ) : (
                              <>
                                <LockIcon className="size-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                <span className="truncate">Menunggu Review Atasan</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Subtask Progress Bar */}
                        {totalSubtasks > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                              <span className="flex items-center gap-1">
                                <CheckSquareIcon className="size-3" />
                                <span>{completedSubtasks}/{totalSubtasks} subtask</span>
                              </span>
                              <span className="tabular-nums font-semibold text-zinc-500 dark:text-zinc-400">
                                {progressPct}%
                              </span>
                            </div>
                            <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  progressPct === 100
                                    ? "bg-emerald-400"
                                    : "bg-primary/70"
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {task.location_name && (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                            <MapPinIcon className="size-3 text-rose-500 shrink-0" />
                            <span className="truncate">{task.location_name}</span>
                          </div>
                        )}

                        {/* Date, Month, Year & SLA Deadline Badge */}
                        {task.deadline_at ? (() => {
                          const d = new Date(task.deadline_at)
                          const isOverdue = d.getTime() < Date.now() && task.status !== "done"
                          const isToday = d.toDateString() === new Date().toDateString()
                          const formattedDate = d.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          const formattedTime = d.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })

                          return (
                            <div
                              className={`flex items-center justify-between text-[10.5px] px-2.5 py-1 rounded-md border font-medium ${
                                isOverdue
                                  ? "bg-rose-50/80 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/70 dark:border-rose-900/50"
                                  : "bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 border-zinc-200/70 dark:border-zinc-700/60"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <CalendarIcon className="size-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                <span className="truncate">
                                  {isOverdue ? (
                                    <span className="font-semibold text-rose-600 dark:text-rose-400">Lewat Target · </span>
                                  ) : isToday ? (
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Hari Ini · </span>
                                  ) : (
                                    <span className="text-zinc-500 dark:text-zinc-400">Target · </span>
                                  )}
                                  {formattedDate}
                                </span>
                              </div>
                              <span className="tabular-nums font-semibold text-zinc-500 dark:text-zinc-400 shrink-0 pl-1">
                                {formattedTime}
                              </span>
                            </div>
                          )
                        })() : task.created_at ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium pt-0.5">
                            <CalendarIcon className="size-3 shrink-0 text-zinc-400/70" />
                            <span>
                              Dibuat:{" "}
                              {new Date(task.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        ) : null}

                        {/* Card Footer: Assignee & Action */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                          {(() => {
                            const allAssignees = task.assignees && task.assignees.length > 0
                              ? task.assignees
                              : [task.assignee, task.secondary_assignee].filter(Boolean) as User[]
                            if (allAssignees.length > 0) {
                              return (
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                                    {allAssignees.slice(0, 3).map((u, i) => (
                                      <img
                                        key={u.id || i}
                                        src={
                                          u.avatar_url ||
                                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                                        }
                                        alt={u.nama}
                                        title={u.nama}
                                        className="size-5 rounded-full object-cover border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0"
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[85px]">
                                    {allAssignees[0].nama.split(" ")[0]}
                                    {allAssignees.length > 1 ? ` +${allAssignees.length - 1}` : ""}
                                  </span>
                                </div>
                              )
                            }
                            return (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                <UserPlusIcon className="size-3" />
                                <span>Unassigned</span>
                              </div>
                            )
                          })()}

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Attachment Count Indicator */}
                            {(() => {
                              const totalAttachments =
                                (task.attachments?.length || 0) +
                                (task.subtasks || []).reduce(
                                  (acc, st) => acc + (st.attachments?.length || 0),
                                  0
                                )
                              if (totalAttachments === 0) return null
                              return (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60"
                                  title={`${totalAttachments} Lampiran / Bukti`}
                                >
                                  <PaperclipIcon className="size-2.5 text-zinc-400" />
                                  <span>{totalAttachments}</span>
                                </span>
                              )
                            })()}

                            {/* Quick Delegate Button */}
                            {onOpenDelegate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onOpenDelegate(task)
                                }}
                                className="h-6 px-1.5 text-[10px] font-bold gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                              >
                                <SparklesIcon className="size-2.5 text-amber-500" />
                                <span>Delegasikan</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Insertion Indicator Line (BOTTOM) */}
                      {isTargetedCard && dropTarget.position === "bottom" && (
                        <div className="h-1.5 w-full bg-primary rounded-full shadow-sm my-1 animate-pulse flex items-center justify-between px-1">
                          <div className="size-2 rounded-full bg-white ring-2 ring-primary" />
                          <div className="size-2 rounded-full bg-white ring-2 ring-primary" />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}

      {/* DIALOG: BLOCKED ACTION ALERT */}
      <Dialog open={!!blockedAlert} onOpenChange={(open) => { if (!open) setBlockedAlert(null) }}>
        <DialogContent className="max-w-md rounded-2xl p-6 font-sans">
          <DialogHeader className="space-y-2 text-left">
            <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center mb-1">
              <AlertTriangleIcon className="size-6" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {blockedAlert?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {blockedAlert?.reason}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="default"
              onClick={() => setBlockedAlert(null)}
              className="w-full sm:w-auto h-9 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Saya Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: POP-UP ISI RINGKASAN KERJA (Saat Pindah ke Review) */}
      <Dialog
        open={!!pendingReviewTask}
        onOpenChange={(open) => {
          if (!open && !isSubmittingReview) {
            setPendingReviewTask(null)
            setReviewNotesInput("")
          }
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl p-6 font-sans">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FileCheckIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                  Ajukan Review Hasil Pekerjaan
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Lengkapi ringkasan hasil kerja untuk diserahkan ke atasan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {pendingReviewTask && (
            <div className="space-y-4 py-2">
              {/* Task Preview Card */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[11px] font-extrabold text-red-600 dark:text-red-400 block">
                    {pendingReviewTask.task.ticket_code}
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                    {pendingReviewTask.task.title}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0">
                  {pendingReviewTask.task.priority}
                </Badge>
              </div>

              {/* Input Ringkasan Kerja */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Ringkasan Hasil Kerja / Catatan untuk Atasan</span>
                  <span className="text-[10px] text-red-500 font-semibold">* Wajib diisi</span>
                </label>
                <Textarea
                  value={reviewNotesInput}
                  onChange={(e) => setReviewNotesInput(e.target.value)}
                  placeholder="Tuliskan ringkasan pekerjaan yang telah diselesaikan, hasil pencapaian, atau catatan penting untuk atasan..."
                  rows={4}
                  className="text-xs rounded-xl resize-none"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  Catatan ini akan langsung diperiksa oleh atasan sebelum menyetujui tugas menjadi selesai.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingReview}
              onClick={() => {
                setPendingReviewTask(null)
                setReviewNotesInput("")
              }}
              className="h-9 px-4 text-xs font-semibold rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isSubmittingReview || !reviewNotesInput.trim()}
              onClick={handleConfirmReviewSubmission}
              className="h-9 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-2xs"
            >
              {isSubmittingReview ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                  <span>Mengajukan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="size-3.5 mr-1.5" />
                  <span>Ajukan Review Selesai</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
