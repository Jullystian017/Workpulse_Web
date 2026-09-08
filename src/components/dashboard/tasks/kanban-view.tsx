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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Task, TaskStatus } from "@/types/database"
import { toast } from "sonner"

interface KanbanViewProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => void
  onOpenDelegate?: (task: Task) => void
  onOpenCreate?: (defaultStatus?: TaskStatus) => void
}

const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string; badgeColor: string }[] = [
  {
    id: "todo",
    label: "To Do / Antrean Tugas",
    color: "bg-amber-500",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900",
  },
  {
    id: "in_progress",
    label: "Dalam Pengerjaan",
    color: "bg-blue-500",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900",
  },
  {
    id: "review",
    label: "Review Atasan",
    color: "bg-purple-500",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900",
  },
  {
    id: "done",
    label: "Selesai",
    color: "bg-emerald-500",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900",
  },
]

const priorityBadge: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900 font-bold",
  high: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-900 font-semibold",
  medium: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900",
  low: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
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
      toast.success(`[${movingTask.ticket_code}] dipindahkan ke "${colMeta?.label || targetColId}"`)
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
      toast.success(`[${movingTask.ticket_code}] dipindahkan ke "${colMeta?.label || targetColId}"`)
      onUpdateStatus?.(movingTaskId, targetColId)
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
            className={`flex flex-col gap-3 rounded-2xl border p-4 min-h-[640px] transition-all duration-200 ${
              isDropTargetCol
                ? "bg-red-50/40 dark:bg-red-950/20 border-red-500/80 ring-2 ring-red-400/40 shadow-md"
                : "bg-muted/30 border-border"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 px-1 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className={`size-3 rounded-full ${col.color} shadow-xs`} />
                <h3 className="text-xs font-bold text-foreground">
                  {col.label}
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums border ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
              </div>
              {onOpenCreate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenCreate(col.id)}
                  className="size-7 text-muted-foreground hover:bg-background rounded-lg hover:text-foreground"
                  title={`Tambah tugas ke kolom ${col.label}`}
                >
                  <PlusIcon className="size-4" />
                </Button>
              )}
            </div>

            {/* Task Cards Vertical Stack */}
            <div className="flex flex-col gap-2.5 flex-1">
              {colTasks.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-36 rounded-2xl border border-dashed text-xs transition-colors ${
                  isDropTargetCol
                    ? "border-red-400 bg-red-100/30 text-red-600 font-bold animate-pulse"
                    : "border-border/60 text-muted-foreground"
                }`}>
                  <span>{isDropTargetCol ? "Lepaskan tugas di sini" : "Tidak ada tugas"}</span>
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
                        <div className="h-1.5 w-full bg-red-600 dark:bg-red-500 rounded-full shadow-sm my-1 animate-pulse flex items-center justify-between px-1">
                          <div className="size-2 rounded-full bg-white ring-2 ring-red-600" />
                          <div className="size-2 rounded-full bg-white ring-2 ring-red-600" />
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
                        className={`group relative flex flex-col gap-2.5 rounded-2xl border bg-card p-4 shadow-xs transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged
                            ? "opacity-30 border-dashed border-red-500 scale-95"
                            : isTargetedCard
                            ? "border-red-400 dark:border-red-600 shadow-md ring-1 ring-red-400/40"
                            : "border-border hover:shadow-md hover:border-red-500/50 hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Top Row: Ticket Code & Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <GripVerticalIcon className="size-3.5 text-muted-foreground/40 group-hover:text-red-500 transition-colors shrink-0" />
                            <span className="font-mono text-[11px] font-extrabold text-red-600 dark:text-red-400">
                              {task.ticket_code}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold rounded-md ${
                              priorityBadge[task.priority] || ""
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {task.title}
                          </h4>
                          {task.channel && (
                            <span className="inline-block text-[10px] font-semibold text-muted-foreground mt-1">
                              {task.channel.name}
                            </span>
                          )}
                        </div>

                        {/* Subtask Progress Bar */}
                        {totalSubtasks > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                              <span>Subtasks</span>
                              <span>{completedSubtasks}/{totalSubtasks} ({progressPct}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  progressPct === 100 ? "bg-emerald-500" : "bg-red-600"
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {task.location_name && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium truncate pt-0.5">
                            <MapPinIcon className="size-3 text-red-500 shrink-0" />
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
                              className={`flex items-center justify-between text-[10px] px-2.5 py-1 rounded-lg border font-semibold ${
                                isOverdue
                                  ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                                  : isToday
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                                  : "bg-muted/60 text-muted-foreground border-border/60"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <ClockIcon className="size-3 shrink-0" />
                                <span className="truncate">
                                  {isOverdue ? "⚠️ Lewat Target • " : isToday ? "⏰ Hari Ini • " : "📅 Target • "}
                                  {formattedDate}
                                </span>
                              </div>
                              <span className="tabular-nums shrink-0">{formattedTime}</span>
                            </div>
                          )
                        })() : task.created_at ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium pt-0.5">
                            <CalendarIcon className="size-3 shrink-0 text-muted-foreground/60" />
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
                        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                          {task.assignee ? (
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={
                                  task.assignee.avatar_url ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                                }
                                alt={task.assignee.nama}
                                className="size-6 rounded-full object-cover border border-border shrink-0"
                              />
                              <span className="text-[11px] font-bold text-foreground truncate max-w-[90px]">
                                {task.assignee.nama.split(" ")[0]}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <UserPlusIcon className="size-3" />
                              <span>Unassigned</span>
                            </div>
                          )}

                          {/* Quick Delegate Button */}
                          {onOpenDelegate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onOpenDelegate(task)
                              }}
                              className="h-6 px-2 text-[10px] font-bold gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                            >
                              <SparklesIcon className="size-2.5 text-amber-500" />
                              Delegasikan
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Insertion Indicator Line (BOTTOM) */}
                      {isTargetedCard && dropTarget.position === "bottom" && (
                        <div className="h-1.5 w-full bg-red-600 dark:bg-red-500 rounded-full shadow-sm my-1 animate-pulse flex items-center justify-between px-1">
                          <div className="size-2 rounded-full bg-white ring-2 ring-red-600" />
                          <div className="size-2 rounded-full bg-white ring-2 ring-red-600" />
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
    </div>
  )
}
