"use client"

import * as React from "react"
import {
  XIcon,
  PaperclipIcon,
  FileTextIcon,
  SendIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  UserIcon,
  UploadIcon,
  CheckSquareIcon,
  SquareIcon,
  PlusIcon,
  RotateCcwIcon,
  CornerDownRightIcon,
  ReceiptIcon,
  PencilIcon,
  TagIcon,
  UserCheckIcon,
  CalendarIcon,
  Trash2Icon,
  ExternalLinkIcon,
  ImageIcon,
  FileIcon,
  AlertTriangleIcon,
  PlayIcon,
  LockIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShieldCheckIcon,
  XCircleIcon,
  Loader2Icon,
  MessageSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HistoryIcon,
  FileCheckIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Task,
  Subtask,
  SubtaskAttachment,
  User,
  Channel,
  TaskPriority,
  TaskStatus,
  TaskAttachment,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  ROLE_LABELS,
  ROLE_HIERARCHY_LEVEL,
} from "@/types/database"
import {
  getTaskById,
  getActiveUserFromStorage,
  toggleSubtask,
  addSubtask,
  deleteSubtask,
  approveSubtask,
  rejectSubtask,
  submitSubtaskForApproval,
  addSubtaskAttachment,
  deleteSubtaskAttachment,
  submitTaskForReview,
  approveTask,
  returnTaskForRevision,
  addComment,
  deleteComment,
  addAttachment,
  deleteAttachment,
  claimTask,
  updateTask,
  updateTaskStatus,
  updateTaskDeadline,
  updateTaskAssignees,
  deleteTask,
  getChannels,
  getAllUsers,
} from "@/lib/api"
import { TaskDeadlinePicker } from "@/components/dashboard/tasks/task-deadline-picker"

export type { Task as TaskItem } from "@/types/database"

interface TaskDetailSheetProps {
  taskId: string | null
  initialTask?: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated?: () => void
  onOpenDelegate?: (task: Task) => void
}

export function TaskDetailSheet({
  taskId,
  initialTask,
  open,
  onOpenChange,
  onTaskUpdated,
  onOpenDelegate,
}: TaskDetailSheetProps) {
  const [task, setTask] = React.useState<Task | null>(initialTask || null)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  // Edit Mode States
  const [isEditing, setIsEditing] = React.useState(false)
  const [editTitle, setEditTitle] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editChannelId, setEditChannelId] = React.useState("")
  const [editPriority, setEditPriority] = React.useState<TaskPriority>("high")
  const [editAssignedTo, setEditAssignedTo] = React.useState("")
  const [editSecondaryAssignedTo, setEditSecondaryAssignedTo] = React.useState("")
  const [editDeadline, setEditDeadline] = React.useState<Date>(() => new Date())
  const [availableChannels, setAvailableChannels] = React.useState<Channel[]>([])
  const [availableUsers, setAvailableUsers] = React.useState<User[]>([])
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)

  // Subtask creation state
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("")
  const [newSubtaskDesc, setNewSubtaskDesc] = React.useState("")
  const [isAddSubtaskExpanded, setIsAddSubtaskExpanded] = React.useState(false)
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false)

  // Subtask accordion collapse/expand state (allows collapsing cards to minimize height)
  const [subtaskExpandedMap, setSubtaskExpandedMap] = React.useState<Record<string, boolean>>({})

  const toggleSubtaskCard = (subtaskId: string, currentExpanded: boolean) => {
    setSubtaskExpandedMap((prev) => ({
      ...prev,
      [subtaskId]: !currentExpanded,
    }))
  }

  // Subtask comments and approval submission state
  const [subtaskCommentInputs, setSubtaskCommentInputs] = React.useState<Record<string, string>>({})
  const [subtaskCommentsExpanded, setSubtaskCommentsExpanded] = React.useState<Record<string, boolean>>({})
  const [isSubmittingSubtaskComment, setIsSubmittingSubtaskComment] = React.useState<Record<string, boolean>>({})
  const [isSubmittingSubtaskApproval, setIsSubmittingSubtaskApproval] = React.useState<Record<string, boolean>>({})

  // Subtask approval/rejection dialog state
  const [approvalTargetSubtask, setApprovalTargetSubtask] = React.useState<Subtask | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = React.useState(false)
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = React.useState(false)
  const [rejectionNote, setRejectionNote] = React.useState("")
  const [isSubtaskActionLoading, setIsSubtaskActionLoading] = React.useState(false)

  // Per-subtask file upload state (Supports multiple files/photos)
  const subtaskFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploadTargetSubtaskId, setUploadTargetSubtaskId] = React.useState<string | null>(null)
  const [subtaskSelectedFiles, setSubtaskSelectedFiles] = React.useState<File[]>([])
  const [isSubtaskUploadOpen, setIsSubtaskUploadOpen] = React.useState(false)
  const [isSubtaskUploading, setIsSubtaskUploading] = React.useState(false)

  // Tab Navigation State: subtasks | comments | attachments
  const [activeDetailTab, setActiveDetailTab] = React.useState<"subtasks" | "comments" | "attachments">("subtasks")

  // Comment state
  const [commentText, setCommentText] = React.useState("")
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)

  // Verification Dialog States
  const [isSubmitReviewOpen, setIsSubmitReviewOpen] = React.useState(false)
  const [submitNotes, setSubmitNotes] = React.useState("")
  const [isRevisionOpen, setIsRevisionOpen] = React.useState(false)
  const [revisionNotes, setRevisionNotes] = React.useState("")

  // Real Upload Modal States
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isUploadOpen, setIsUploadOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploadFileName, setUploadFileName] = React.useState("")
  const [uploadType, setUploadType] = React.useState<"evidence" | "receipt_nota" | "document">("evidence")
  const [uploadAmount, setUploadAmount] = React.useState("")
  const [isActionLoading, setIsActionLoading] = React.useState(false)

  // Delete Task Confirmation Modal State
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = React.useState(false)
  const [isDeletingTask, setIsDeletingTask] = React.useState(false)

  // Fetch Full Task Data
  const loadTaskData = React.useCallback(async (forceRefresh = true) => {
    if (!taskId) return
    setLoadError(null)
    try {
      const activeUser = getActiveUserFromStorage()
      setCurrentUser(activeUser)
      const data = await getTaskById(taskId, forceRefresh)
      if (data) {
        setTask(data)
      } else {
        setLoadError("Data penugasan tidak ditemukan.")
      }
    } catch (err: any) {
      console.error(err)
      setLoadError(err?.message || "Terjadi kesalahan saat memuat tugas.")
    } finally {
      setIsLoading(false)
    }
  }, [taskId])

  // Sync initialTask when opened or when initialTask updates from parent
  React.useEffect(() => {
    if (!open || !taskId) return
    if (initialTask && initialTask.id === taskId) {
      setTask((prev) => {
        if (!prev) return initialTask
        return {
          ...prev,
          ...initialTask,
          status: initialTask.status || prev.status,
          subtasks: initialTask.subtasks && initialTask.subtasks.length > 0 ? initialTask.subtasks : prev.subtasks,
          attachments: initialTask.attachments && initialTask.attachments.length > 0 ? initialTask.attachments : prev.attachments,
          comments: initialTask.comments && initialTask.comments.length > 0 ? initialTask.comments : prev.comments,
        }
      })
    }
  }, [initialTask, open, taskId])

  // Initial load when sheet opens or taskId changes
  React.useEffect(() => {
    if (open && taskId) {
      if (initialTask && initialTask.id === taskId) {
        setTask(initialTask)
      } else {
        setIsLoading(true)
      }
      setLoadError(null)
      setIsEditing(false)
      loadTaskData(true)
    } else if (!open) {
      setTask(null)
      setLoadError(null)
      setIsEditing(false)
    }
  }, [open, taskId, loadTaskData])

  // Load Channels & Users when entering edit mode
  const handleStartEdit = async () => {
    if (!task) return
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditChannelId(task.channel_id || "")
    setEditPriority(task.priority)
    setEditAssignedTo(task.assigned_to || "")
    setEditSecondaryAssignedTo(task.secondary_assigned_to || "")
    setEditDeadline(task.deadline_at ? new Date(task.deadline_at) : new Date())

    try {
      const [chs, usrs] = await Promise.all([getChannels(), getAllUsers()])
      setAvailableChannels(chs)

      let filteredUsers = usrs
      const activeUser = getActiveUserFromStorage()
      if (activeUser && activeUser.role !== "admin") {
        const myLevel = ROLE_HIERARCHY_LEVEL[activeUser.role] ?? 1
        filteredUsers = usrs.filter((u) => {
          if (u.id === activeUser.id) return true
          if (u.role === "admin") return false
          const targetLevel = ROLE_HIERARCHY_LEVEL[u.role] ?? 1
          return targetLevel < myLevel
        })
      }

      setAvailableUsers(filteredUsers)
      setIsEditing(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !editTitle.trim()) {
      toast.error("Judul penugasan wajib diisi.")
      return
    }

    setIsSavingEdit(true)
    try {
      const updated = await updateTask(
        task.id,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          channel_id: editChannelId || undefined,
          priority: editPriority,
          assigned_to: editAssignedTo || null,
          secondary_assigned_to: editSecondaryAssignedTo || null,
          deadline_at: editDeadline.toISOString(),
        },
        currentUser?.id
      )

      if (updated) {
        setTask(updated)
        setIsEditing(false)
        toast.success("Penugasan berhasil diperbarui!")
        onTaskUpdated?.()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal memperbarui penugasan.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Quick Deadline Changer (Instant Optimistic Update)
  const handleQuickDeadlineChange = async (newDate: Date) => {
    if (!task) return
    const prevDeadline = task.deadline_at
    const newIso = newDate.toISOString()
    // Optimistic
    setTask((prev) => (prev ? { ...prev, deadline_at: newIso } : null))
    try {
      const ok = await updateTaskDeadline(task.id, newIso, currentUser?.id)
      if (ok) {
        toast.success("Target batas selesai berhasil diperbarui!")
        onTaskUpdated?.()
        loadTaskData(true)
      } else {
        setTask((prev) => (prev ? { ...prev, deadline_at: prevDeadline } : null))
        toast.error("Gagal memperbarui batas waktu.")
      }
    } catch {
      setTask((prev) => (prev ? { ...prev, deadline_at: prevDeadline } : null))
      toast.error("Terjadi kendala saat memperbarui deadline.")
    }
  }

  // Quick Status Changer (Instant Optimistic Update - Zero Lag)
  const handleQuickStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return
    if (newStatus === "done" && task.status === "review" && !canApprove) {
      toast.error("Hanya atasan atau delegator tugas yang berhak menyetujui tugas ini.")
      return
    }

    const previousStatus = task.status
    const previousCompletedAt = task.completed_at
    const nowIso = new Date().toISOString()

    // 1. INSTANT OPTIMISTIC UPDATE: Change status immediately so UI and banners update instantly
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            completed_at: newStatus === "done" ? nowIso : prev.completed_at,
          }
        : null
    )

    try {
      const ok = await updateTaskStatus(task.id, newStatus, currentUser?.id)
      if (ok) {
        toast.success(`Status diubah ke ${TASK_STATUS_LABELS[newStatus]?.label || newStatus}`)
        onTaskUpdated?.()
        loadTaskData(true)
      } else {
        // Rollback on failure
        setTask((prev) =>
          prev
            ? { ...prev, status: previousStatus, completed_at: previousCompletedAt }
            : null
        )
        toast.error("Gagal mengubah status tugas.")
      }
    } catch (err) {
      console.error(err)
      setTask((prev) =>
        prev
          ? { ...prev, status: previousStatus, completed_at: previousCompletedAt }
          : null
      )
      toast.error("Terjadi kesalahan saat mengubah status tugas.")
    }
  }

  // Delete Task Handler
  const handleDeleteTask = async () => {
    if (!task) return
    setIsDeletingTask(true)
    try {
      const ok = await deleteTask(task.id)
      if (ok) {
        toast.success(`Penugasan [${task.ticket_code}] berhasil dihapus.`)
        setIsDeleteTaskOpen(false)
        onOpenChange(false)
        onTaskUpdated?.()
      } else {
        toast.error("Gagal menghapus penugasan.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat menghapus penugasan.")
    } finally {
      setIsDeletingTask(false)
    }
  }

  const priorityMeta = task ? TASK_PRIORITY_LABELS[task.priority] : null
  const statusMeta = task ? TASK_STATUS_LABELS[task.status] : null
  const subtasks = task?.subtasks || []
  const completedSubtasks = subtasks.filter((s) => s.is_completed).length
  const isStaff = currentUser?.role === "staff"

  // Quick accordion helper for all subtasks
  const areAllSubtasksExpanded = React.useMemo(() => {
    if (subtasks.length === 0) return false
    return subtasks.every((st) => {
      const isApproved = st.approval_status === "approved"
      return subtaskExpandedMap[st.id] !== undefined ? subtaskExpandedMap[st.id] : !isApproved
    })
  }, [subtasks, subtaskExpandedMap])

  const toggleAllSubtasks = () => {
    const nextState = !areAllSubtasksExpanded
    const newMap: Record<string, boolean> = {}
    subtasks.forEach((st) => {
      newMap[st.id] = nextState
    })
    setSubtaskExpandedMap(newMap)
  }

  // Hanya atasan (supervisor langsung), delegator, pembuat tugas, atau Admin/SGM yang berhak Approve / Setujui
  const canApprove = React.useMemo(() => {
    if (!currentUser || !task) return false
    // Pelaksana dilarang approve tugasnya sendiri
    if (task.assigned_to && currentUser.id === task.assigned_to) return false
    if (task.secondary_assigned_to && currentUser.id === task.secondary_assigned_to) return false

    // 1. Admin & SGM selalu memiliki wewenang override
    if (currentUser.role === "admin" || currentUser.role === "sgm") return true

    // 2. Delegator tugas
    if (task.delegated_by && task.delegated_by === currentUser.id) return true
    if (task.delegator && task.delegator.id === currentUser.id) return true

    // 3. Pembuat tugas (inisiator)
    if (task.created_by && task.created_by === currentUser.id) return true
    if (task.creator && task.creator.id === currentUser.id) return true

    // 4. Atasan langsung si pelaksana tugas
    if (task.assignee?.supervisor_id && task.assignee.supervisor_id === currentUser.id) return true

    return false
  }, [currentUser, task])

  // Nama atasan / delegator yang berhak me-review
  const reviewerName = React.useMemo(() => {
    if (!task) return "Atasan"
    return (
      task.delegator?.nama ||
      task.creator?.nama ||
      task.assignee?.supervisor?.nama ||
      "Atasan / Delegator"
    )
  }, [task])
  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : task?.status === "done"
      ? 100
      : task?.status === "review"
      ? 85
      : 20

  // ── Human comments across task and all subtasks (excludes system audit logs) ──
  const humanComments = React.useMemo(() => {
    return (task?.comments || []).filter((c) => !c.is_system_log)
  }, [task?.comments])

  const totalSubtaskAttachmentsCount = React.useMemo(() => {
    return (task?.subtasks || []).reduce((acc, st) => acc + (st.attachments || []).length, 0)
  }, [task?.subtasks])

  const totalAttachmentsCount = totalSubtaskAttachmentsCount

  // Subtask Toggle Handler
  const handleToggleSubtask = async (st: Subtask) => {
    if (!task) return
    const nextState = !st.is_completed
    const ok = await toggleSubtask(st.id, nextState)
    if (ok) {
      setTask((prev) => {
        if (!prev) return null
        return {
          ...prev,
          subtasks: (prev.subtasks || []).map((item) =>
            item.id === st.id ? { ...item, is_completed: nextState } : item
          ),
        }
      })
      onTaskUpdated?.()
    }
  }

  // Add Subtask Handler (With Title & Optional Description)
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !newSubtaskTitle.trim()) return
    setIsAddingSubtask(true)
    try {
      const created = await addSubtask(
        task.id,
        newSubtaskTitle.trim(),
        newSubtaskDesc.trim() || undefined
      )
      if (created) {
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            subtasks: [
              ...(prev.subtasks || []),
              { ...created, attachments: [], comments: [] },
            ],
          }
        })
        setNewSubtaskTitle("")
        setNewSubtaskDesc("")
        setIsAddSubtaskExpanded(false)
        toast.success("Tahapan baru berhasil ditambahkan!")
        onTaskUpdated?.()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menambahkan tahapan.")
    } finally {
      setIsAddingSubtask(false)
    }
  }

  // Delete Subtask Handler
  const handleDeleteSubtask = async (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task) return
    const ok = await deleteSubtask(subtaskId)
    if (ok) {
      setTask((prev) => {
        if (!prev) return null
        return {
          ...prev,
          subtasks: (prev.subtasks || []).filter((item) => item.id !== subtaskId),
        }
      })
      toast.info("Tahapan berhasil dihapus.")
      onTaskUpdated?.()
    }
  }

  // ── Staff Submits Subtask Step for Approval ──
  const handleSubmitSubtaskApproval = async (subtaskId: string) => {
    if (!task || !currentUser) return
    setIsSubmittingSubtaskApproval((prev) => ({ ...prev, [subtaskId]: true }))
    try {
      const ok = await submitSubtaskForApproval(subtaskId, currentUser.id)
      if (ok) {
        toast.success("Tahapan berhasil diajukan untuk persetujuan atasan!")
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            subtasks: (prev.subtasks || []).map((s) =>
              s.id === subtaskId
                ? { ...s, approval_status: "pending", rejection_note: null }
                : s
            ),
          }
        })
        onTaskUpdated?.()
      } else {
        toast.error("Gagal mengajukan tahapan.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat mengajukan tahapan.")
    } finally {
      setIsSubmittingSubtaskApproval((prev) => ({ ...prev, [subtaskId]: false }))
    }
  }

  // ── Send Subtask-Specific Comment/Note ──
  const handleSendSubtaskComment = async (subtaskId: string) => {
    const text = (subtaskCommentInputs[subtaskId] || "").trim()
    if (!task || !currentUser || !text) return
    setIsSubmittingSubtaskComment((prev) => ({ ...prev, [subtaskId]: true }))
    try {
      const c = await addComment(task.id, currentUser.id, text, subtaskId)
      if (c) {
        const fullComment = { ...c, user: currentUser }
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            comments: [...(prev.comments || []), fullComment],
            subtasks: (prev.subtasks || []).map((st) =>
              st.id === subtaskId
                ? { ...st, comments: [...(st.comments || []), fullComment] }
                : st
            ),
          }
        })
        setSubtaskCommentInputs((prev) => ({ ...prev, [subtaskId]: "" }))
        toast.success("Catatan tahapan terkirim!")
      } else {
        toast.error("Gagal mengirim catatan tahapan.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kendala saat mengirim catatan.")
    } finally {
      setIsSubmittingSubtaskComment((prev) => ({ ...prev, [subtaskId]: false }))
    }
  }

  const toggleSubtaskComments = (subtaskId: string) => {
    setSubtaskCommentsExpanded((prev) => ({ ...prev, [subtaskId]: !prev[subtaskId] }))
  }

  // ── Approve Subtask Handler (atasan) ──
  const handleApproveSubtask = async () => {
    if (!approvalTargetSubtask || !currentUser) return
    setIsSubtaskActionLoading(true)
    try {
      const ok = await approveSubtask(approvalTargetSubtask.id, currentUser.id)
      if (ok) {
        toast.success(`Tahap "${approvalTargetSubtask.title}" disetujui! Tahap selanjutnya terbuka.`)
        setIsApprovalDialogOpen(false)
        setApprovalTargetSubtask(null)
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            subtasks: (prev.subtasks || []).map((st) =>
              st.id === approvalTargetSubtask.id
                ? {
                    ...st,
                    approval_status: "approved",
                    is_completed: true,
                    approved_by: currentUser.id,
                    approver: currentUser,
                    approved_at: new Date().toISOString(),
                    rejection_note: null,
                  }
                : st
            ),
          }
        })
        onTaskUpdated?.()
      } else {
        toast.error("Gagal menyetujui tahap ini.")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan.")
    } finally {
      setIsSubtaskActionLoading(false)
    }
  }

  // ── Reject Subtask Handler (atasan) ──
  const handleRejectSubtask = async () => {
    if (!approvalTargetSubtask || !currentUser || !rejectionNote.trim()) {
      toast.error("Harap isi catatan penolakan.")
      return
    }
    setIsSubtaskActionLoading(true)
    try {
      const ok = await rejectSubtask(approvalTargetSubtask.id, currentUser.id, rejectionNote.trim())
      if (ok) {
        toast.warning(`Tahap "${approvalTargetSubtask.title}" dikembalikan untuk diperbaiki.`)
        setIsRejectionDialogOpen(false)
        setApprovalTargetSubtask(null)
        setRejectionNote("")
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            subtasks: (prev.subtasks || []).map((st) =>
              st.id === approvalTargetSubtask.id
                ? {
                    ...st,
                    approval_status: "rejected",
                    is_completed: false,
                    rejection_note: rejectionNote.trim(),
                  }
                : st
            ),
          }
        })
        onTaskUpdated?.()
      } else {
        toast.error("Gagal menolak tahap ini.")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan.")
    } finally {
      setIsSubtaskActionLoading(false)
    }
  }

  // ── Upload file bukti per subtask (karyawan) (Mendukung upload banyak foto/berkas) ──
  const handleSubtaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSubtaskSelectedFiles(files)
      setIsSubtaskUploadOpen(true)
    }
  }

  const handleSubtaskUploadConfirm = async () => {
    if (subtaskSelectedFiles.length === 0 || !uploadTargetSubtaskId || !task || !currentUser) return
    setIsSubtaskUploading(true)
    try {
      const { supabase } = await import("@/lib/api").then(m => ({ supabase: m.supabase }))
      const uploadedAttachments: SubtaskAttachment[] = []

      for (const file of subtaskSelectedFiles) {
        const ext = file.name.split(".").pop() || "bin"
        const path = `subtask-attachments/${uploadTargetSubtaskId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("task-attachments")
          .upload(path, file, { upsert: false })

        let fileUrl = ""
        if (uploadError) {
          fileUrl = URL.createObjectURL(file)
        } else {
          fileUrl = supabase.storage.from("task-attachments").getPublicUrl(path).data.publicUrl
        }

        const created = await addSubtaskAttachment({
          task_id: task.id,
          subtask_id: uploadTargetSubtaskId,
          uploaded_by: currentUser.id,
          file_name: file.name,
          file_url: fileUrl,
          file_type: file.type,
          file_size_bytes: file.size,
        })
        if (created) {
          uploadedAttachments.push(created)
        }
      }

      if (uploadedAttachments.length > 0) {
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            subtasks: (prev.subtasks || []).map((st) =>
              st.id === uploadTargetSubtaskId
                ? { ...st, attachments: [...(st.attachments || []), ...uploadedAttachments] }
                : st
            ),
          }
        })
        toast.success(`${uploadedAttachments.length} berkas bukti tahapan berhasil diunggah!`)
        onTaskUpdated?.()
        loadTaskData(true)
      } else {
        toast.error("Gagal mengunggah berkas bukti.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengunggah berkas.")
    } finally {
      setIsSubtaskUploading(false)
      setIsSubtaskUploadOpen(false)
      setSubtaskSelectedFiles([])
      setUploadTargetSubtaskId(null)
      if (subtaskFileInputRef.current) subtaskFileInputRef.current.value = ""
    }
  }

  // ── Delete subtask attachment ──
  const handleDeleteSubtaskAttachment = async (attachId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await deleteSubtaskAttachment(attachId)
    if (ok) {
      setTask((prev) => {
        if (!prev) return null
        return {
          ...prev,
          subtasks: (prev.subtasks || []).map((st) =>
            st.id === subtaskId
              ? { ...st, attachments: (st.attachments || []).filter((a) => a.id !== attachId) }
              : st
          ),
        }
      })
      toast.info("Lampiran dihapus.")
    }
  }

  // Submit Task For Review
  const handleSubmitForReview = async () => {
    if (!task || !currentUser) return
    const prevStatus = task.status
    const prevNotes = task.review_notes

    // Optimistic Update
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: "review",
            review_notes: submitNotes,
          }
        : null
    )
    setIsSubmitReviewOpen(false)
    setIsActionLoading(true)
    try {
      const ok = await submitTaskForReview(task.id, currentUser.id, submitNotes)
      if (ok) {
        toast.success("Tugas diajukan untuk review atasan!")
        setSubmitNotes("")
        onTaskUpdated?.()
        loadTaskData(true)
      } else {
        setTask((prev) =>
          prev
            ? { ...prev, status: prevStatus, review_notes: prevNotes }
            : null
        )
        toast.error("Gagal mengajukan review")
      }
    } catch (err) {
      setTask((prev) =>
        prev
          ? { ...prev, status: prevStatus, review_notes: prevNotes }
          : null
      )
      toast.error("Gagal mengajukan review")
    } finally {
      setIsActionLoading(false)
    }
  }

  // Supervisor Approve Task (Instant Optimistic - Eliminates banner instantly)
  const handleApprove = async () => {
    if (!task || !currentUser) return
    if (!canApprove) {
      toast.error("Hanya atasan atau delegator tugas yang berhak menyetujui tugas ini.")
      return
    }

    const prevStatus = task.status
    const prevCompletedAt = task.completed_at
    const nowIso = new Date().toISOString()

    // 1. INSTANT OPTIMISTIC UPDATE: status becomes 'done', banner disappears instantly
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: "done",
            completed_at: nowIso,
          }
        : null
    )

    setIsActionLoading(true)
    try {
      const ok = await approveTask(task.id, currentUser.id)
      if (ok) {
        toast.success("Tugas Disetujui & Selesai! ✅")
        onTaskUpdated?.()
        loadTaskData(true)
      } else {
        setTask((prev) =>
          prev
            ? { ...prev, status: prevStatus, completed_at: prevCompletedAt }
            : null
        )
        toast.error("Gagal menyetujui tugas")
      }
    } catch (err) {
      setTask((prev) =>
        prev
          ? { ...prev, status: prevStatus, completed_at: prevCompletedAt }
          : null
      )
      toast.error("Gagal menyetujui tugas")
    } finally {
      setIsActionLoading(false)
    }
  }

  // Supervisor Return for Revision
  const handleReturnRevision = async () => {
    if (!task || !currentUser || !revisionNotes.trim()) {
      toast.error("Harap isi catatan revisi.")
      return
    }
    if (!canApprove) {
      toast.error("Hanya atasan atau delegator tugas yang berhak mengembalikan tugas ini.")
      return
    }

    const prevStatus = task.status
    const prevReviewNotes = task.review_notes

    // Instant optimistic update
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: "in_progress",
            review_notes: revisionNotes,
          }
        : null
    )
    setIsRevisionOpen(false)
    setIsActionLoading(true)
    try {
      const ok = await returnTaskForRevision(task.id, currentUser.id, revisionNotes)
      if (ok) {
        toast.warning("Tugas dikembalikan untuk revisi.")
        setRevisionNotes("")
        onTaskUpdated?.()
        loadTaskData(true)
      } else {
        setTask((prev) =>
          prev
            ? { ...prev, status: prevStatus, review_notes: prevReviewNotes }
            : null
        )
        toast.error("Gagal mengembalikan tugas")
      }
    } catch (err) {
      setTask((prev) =>
        prev
          ? { ...prev, status: prevStatus, review_notes: prevReviewNotes }
          : null
      )
      toast.error("Gagal mengembalikan tugas")
    } finally {
      setIsActionLoading(false)
    }
  }

  // Claim Task
  const handleClaim = async () => {
    if (!task || !currentUser) return
    setIsActionLoading(true)
    try {
      const ok = await claimTask(task.id, currentUser.id)
      if (ok) {
        toast.success("Tugas berhasil Anda klaim!")
        onTaskUpdated?.()
        loadTaskData(true)
      }
    } catch (err) {
      toast.error("Gagal mengklaim tugas")
    } finally {
      setIsActionLoading(false)
    }
  }

  // Ambil Tugas / Mulai Kerjakan (To Do -> Dalam Pengerjaan)
  const handleTakeTask = async () => {
    if (!task || !currentUser) return

    const prevStatus = task.status
    const prevAssignee = task.assignee
    const prevAssignedTo = task.assigned_to

    // Instant optimistic update
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: "in_progress",
            assigned_to: currentUser.id,
            assignee: currentUser,
          }
        : null
    )

    setIsActionLoading(true)
    try {
      if (!task.assigned_to) {
        const ok = await claimTask(task.id, currentUser.id)
        if (ok) {
          toast.success("Tugas berhasil diambil & mulai dikerjakan!")
          onTaskUpdated?.()
          loadTaskData(true)
        } else {
          throw new Error("Gagal mengambil tugas.")
        }
      } else {
        const ok = await updateTaskStatus(task.id, "in_progress", currentUser.id)
        if (ok) {
          toast.success("Tugas mulai dikerjakan (Dalam Pengerjaan)!")
          onTaskUpdated?.()
          loadTaskData(true)
        } else {
          throw new Error("Gagal memperbarui status tugas.")
        }
      }
    } catch (err) {
      console.error(err)
      setTask((prev) =>
        prev
          ? { ...prev, status: prevStatus, assigned_to: prevAssignedTo, assignee: prevAssignee }
          : null
      )
      toast.error("Terjadi kendala saat mengambil tugas.")
    } finally {
      setIsActionLoading(false)
    }
  }

  // File Picker Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadFileName(file.name)
      if (file.type.startsWith("image/")) {
        setUploadType("evidence")
      } else if (file.type === "application/pdf") {
        setUploadType("document")
      }
    }
  }

  // Upload Evidence/Receipt/File
  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !currentUser) return
    if (!uploadFileName.trim()) {
      toast.error("Harap beri nama berkas.")
      return
    }

    setIsActionLoading(true)
    try {
      let fileUrl = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80"

      if (selectedFile) {
        fileUrl = URL.createObjectURL(selectedFile)
      }

      const att = await addAttachment({
        task_id: task.id,
        uploaded_by: currentUser.id,
        file_name: uploadFileName.trim(),
        file_url: fileUrl,
        attachment_type: uploadType,
        amount: uploadAmount ? parseFloat(uploadAmount) : undefined,
      })

      if (att) {
        toast.success("Berkas berhasil diunggah!")
        setIsUploadOpen(false)
        setSelectedFile(null)
        setUploadFileName("")
        setUploadAmount("")
        loadTaskData()
        onTaskUpdated?.()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengunggah lampiran")
    } finally {
      setIsActionLoading(false)
    }
  }

  // Delete Attachment Handler
  const handleDeleteAttachment = async (attId: string) => {
    if (!task) return
    const ok = await deleteAttachment(attId)
    if (ok) {
      setTask((prev) => {
        if (!prev) return null
        return {
          ...prev,
          attachments: (prev.attachments || []).filter((a) => a.id !== attId),
        }
      })
      toast.info("Lampiran berhasil dihapus.")
      onTaskUpdated?.()
    }
  }

  // Send Comment
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !currentUser || !commentText.trim()) return
    setIsSubmittingComment(true)
    try {
      const c = await addComment(task.id, currentUser.id, commentText.trim())
      if (c) {
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            comments: [...(prev.comments || []), { ...c, user: currentUser }],
          }
        })
        setCommentText("")
        toast.success("Komentar terkirim!")
      }
    } catch (err) {
      toast.error("Gagal mengirim komentar")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Delete Comment Handler
  const handleDeleteComment = async (commentId: string) => {
    if (!task) return
    const ok = await deleteComment(commentId)
    if (ok) {
      setTask((prev) => {
        if (!prev) return null
        return {
          ...prev,
          comments: (prev.comments || []).filter((c) => c.id !== commentId),
        }
      })
      toast.info("Komentar dihapus.")
    }
  }

  // Role-based access control (isStaff is already declared above from currentUser)
  // canDelegate: Officer+, Manager, SGM, and Admin can delegate
  const canDelegate = currentUser?.role !== 'staff'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-0 border-l border-border bg-background font-sans shadow-2xl"
      >
        {isLoading && !task ? (
          <div className="flex h-full items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="size-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              <p className="text-xs text-muted-foreground">Memuat data penugasan...</p>
            </div>
          </div>
        ) : !task ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="size-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 mb-3">
              <AlertCircleIcon className="size-6" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Gagal Memuat Detail Tugas</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {loadError || "Data penugasan tidak ditemukan atau terjadi kendala jaringan."}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => loadTaskData(true)}>
                Coba Lagi
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-full">
            {/* Top Navigation Bar (Clean, Minimalist & Spacious) */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-5 py-3 gap-3">
              {/* Left: Clean Ticket Code & Divisi Pill */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900 shrink-0">
                  {task.ticket_code}
                </span>
                <span className="text-xs text-muted-foreground font-semibold truncate max-w-[180px] sm:max-w-[260px]">
                  {task.channel?.name || "Divisi Operasional"}
                </span>
              </div>

              {/* Right: Close Button */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  title="Tutup Panel"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* EDIT MODE CONTAINER */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <PencilIcon className="size-3.5 text-red-600" />
                    Edit Penugasan
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Judul Tugas *
                    </label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      className="h-9 rounded-lg text-xs font-semibold bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Kategori / Divisi
                      </label>
                      <Select value={editChannelId} onValueChange={(val) => setEditChannelId(val || "")}>
                        <SelectTrigger className="w-full h-8.5 rounded-lg border-border bg-background px-2.5 text-xs font-medium">
                          <span className="truncate font-semibold text-foreground">
                            {availableChannels.find((c) => c.id === editChannelId)?.name || "Pilih Kategori"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="w-full max-h-52">
                          {availableChannels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Prioritas
                      </label>
                      <Select value={editPriority} onValueChange={(val) => setEditPriority((val as TaskPriority) || "high")}>
                        <SelectTrigger className="w-full h-8.5 rounded-lg border-border bg-background px-2.5 text-xs font-medium">
                          <span className="truncate font-semibold text-foreground">
                            {TASK_PRIORITY_LABELS[editPriority]?.label || editPriority}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectItem value="urgent">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-red-600 shrink-0" />
                              <span>Mendesak (Urgent)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                              <span>Tinggi (High)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                              <span>Standar (Medium)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                              <span>Rendah (Low)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Deskripsi Tugas
                    </label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="rounded-lg text-xs resize-none bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Pelaksana Utama (PIC 1)
                      </label>
                      <Select
                        value={editAssignedTo || "unassigned"}
                        onValueChange={(val) => setEditAssignedTo(val === "unassigned" ? "" : (val || ""))}
                      >
                        <SelectTrigger className="w-full h-8.5 rounded-lg border-border bg-background px-2.5 text-xs font-medium">
                          <span className="truncate font-semibold text-foreground">
                            {availableUsers.find((u) => u.id === editAssignedTo)?.nama || "Belum Ditugaskan"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="w-full max-h-52">
                          <SelectItem value="unassigned">
                            <span className="text-muted-foreground font-medium">Belum Ditugaskan</span>
                          </SelectItem>
                          {availableUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              <div className="flex items-center gap-2">
                                <img
                                  src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                                  alt={u.nama}
                                  className="size-4.5 rounded-full object-cover shrink-0"
                                />
                                <span className="font-medium text-foreground">{u.nama}</span>
                                <span className="text-[10px] text-muted-foreground">({ROLE_LABELS[u.role]?.badge || u.role})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Pelaksana Rekan (PIC 2 - Opsional)
                      </label>
                      <Select
                        value={editSecondaryAssignedTo || "none"}
                        onValueChange={(val) => setEditSecondaryAssignedTo(val === "none" ? "" : (val || ""))}
                      >
                        <SelectTrigger className="w-full h-8.5 rounded-lg border-border bg-background px-2.5 text-xs font-medium">
                          <span className="truncate font-semibold text-foreground">
                            {availableUsers.find((u) => u.id === editSecondaryAssignedTo)?.nama || "Tidak Ada (Hanya 1 PIC)"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="w-full max-h-52">
                          <SelectItem value="none">
                            <span className="text-muted-foreground font-medium">Tidak Ada (Hanya 1 PIC)</span>
                          </SelectItem>
                          {availableUsers
                            .filter((u) => u.id !== editAssignedTo)
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                                    alt={u.nama}
                                    className="size-4.5 rounded-full object-cover shrink-0"
                                  />
                                  <span className="font-medium text-foreground">{u.nama}</span>
                                  <span className="text-[10px] text-muted-foreground">({ROLE_LABELS[u.role]?.badge || u.role})</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Target Batas Waktu Selesai (Deadline)
                    </label>
                    <TaskDeadlinePicker
                      value={editDeadline}
                      onChange={setEditDeadline}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="h-8 px-3 text-xs rounded-lg cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingEdit}
                    className="h-8 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                  >
                    {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            ) : (
              /* VIEW MODE (Clean, Linear / Notion Style with Subtasks & Comments Tabs) */
              <div className="flex flex-col gap-4 p-5">
                {/* 1. Task Title & Quick Action Toolbar */}
                <div className="space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
                    {task.title}
                  </h2>

                  {/* Actions Toolbar - Spacious, Modern & Clean (Moved from the crowded top bar) */}
                  {!isStaff && task.status !== "done" && (
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenDelegate?.(task)}
                        className="h-7.5 px-3 text-xs font-semibold text-blue-600 border-blue-200 bg-blue-50/40 hover:bg-blue-100/60 dark:border-blue-900/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 rounded-lg gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <CornerDownRightIcon className="size-3.5" />
                        <span>Delegasikan</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEdit}
                        className="h-7.5 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <PencilIcon className="size-3.5" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDeleteTaskOpen(true)}
                        className="h-7.5 px-2.5 text-xs font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg gap-1.5 cursor-pointer ml-auto"
                      >
                        <Trash2Icon className="size-3.5" />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* 2. Clean Key-Value Properties Table */}
                <div className="rounded-xl border border-border/70 bg-card p-3 divide-y divide-border/60 text-xs">
                  {/* Status */}
                  <div className="flex items-center justify-between py-1.5 first:pt-0">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <TagIcon className="size-3.5 text-muted-foreground/70" />
                      Status
                    </span>
                    {isStaff ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border text-xs font-semibold">
                        <span
                          className={`size-2 rounded-full shrink-0 ${
                            task.status === "done"
                              ? "bg-emerald-500"
                              : task.status === "in_progress"
                              ? "bg-blue-500"
                              : task.status === "review"
                              ? "bg-purple-500"
                              : task.status === "todo"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <span className="truncate">{TASK_STATUS_LABELS[task.status]?.label || task.status}</span>
                      </div>
                    ) : (
                      <Select
                        value={task.status}
                        onValueChange={(val) => handleQuickStatusChange((val as TaskStatus) || task.status)}
                      >
                        <SelectTrigger className="h-7 text-xs font-semibold rounded-lg bg-muted/60 border-border px-2 py-0 gap-1.5 shadow-2xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`size-2 rounded-full shrink-0 ${
                                task.status === "done"
                                  ? "bg-emerald-500"
                                  : task.status === "in_progress"
                                  ? "bg-blue-500"
                                  : task.status === "review"
                                  ? "bg-purple-500"
                                  : task.status === "todo"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            <span className="truncate">{TASK_STATUS_LABELS[task.status]?.label || task.status}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent align="end" className="w-48">
                          <SelectItem value="unassigned">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-slate-400 shrink-0" />
                              <span>Unassigned (Pool)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="todo">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                              <span>To Do (Antrean)</span>
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
                    )}
                  </div>

                  {/* Prioritas */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <AlertCircleIcon className="size-3.5 text-muted-foreground/70" />
                      Prioritas
                    </span>
                    <span className="font-bold text-foreground">
                      {priorityMeta?.label || task.priority}
                    </span>
                  </div>

                  {/* Pelaksana (PIC) */}
                  <div className="flex items-center justify-between py-1.5 gap-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
                      <UserCheckIcon className="size-3.5 text-muted-foreground/70" />
                      Pelaksana (PIC)
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                          <img
                            src={
                              task.assignee.avatar_url ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                            }
                            alt={task.assignee.nama}
                            className="size-4 rounded-full object-cover shrink-0"
                          />
                          <span className="font-bold text-foreground text-xs">
                            {task.assignee.nama}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">
                            Utama
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-amber-600 text-[11px]">
                          Belum Ditugaskan
                        </span>
                      )}

                      {task.secondary_assignee && (
                        <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                          <img
                            src={
                              task.secondary_assignee.avatar_url ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                            }
                            alt={task.secondary_assignee.nama}
                            className="size-4 rounded-full object-cover shrink-0"
                          />
                          <span className="font-bold text-foreground text-xs">
                            {task.secondary_assignee.nama}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20">
                            Rekan
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pemberi Delegasi */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <UserIcon className="size-3.5 text-muted-foreground/70" />
                      Delegator
                    </span>
                    <span className="font-medium text-foreground">
                      {task.delegator?.nama || task.creator?.nama || "Atasan"}
                    </span>
                  </div>

                  {/* Deadline SLA */}
                  <div className="flex items-center justify-between py-1.5 last:pb-0 gap-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
                      <CalendarIcon className="size-3.5 text-muted-foreground/70" />
                      Target Selesai
                    </span>
                    <span className="font-bold text-red-600 dark:text-red-400 font-mono">
                      {task.deadline_at
                        ? new Date(task.deadline_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Tidak ditentukan"}
                    </span>
                  </div>

                  {/* Waktu Pengumpulan / Penyelesaian */}
                  {task.completed_at && (() => {
                    const GRACE_PERIOD_MS = 15 * 60 * 1000
                    const delayMs = task.deadline_at
                      ? new Date(task.completed_at).getTime() - new Date(task.deadline_at).getTime()
                      : 0
                    const isLate = Boolean(task.deadline_at && delayMs > GRACE_PERIOD_MS)
                    const isGrace = Boolean(task.deadline_at && delayMs > 0 && delayMs <= GRACE_PERIOD_MS)
                    return (
                      <div className="flex items-center justify-between py-1.5 border-t border-border/50 pt-2">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                          <CheckCircle2Icon className="size-3.5 text-muted-foreground/70" />
                          Waktu Dikumpulkan
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isLate
                                ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}
                          >
                            {isLate ? "Terlambat" : isGrace ? "Tepat Waktu (Toleransi)" : "Tepat Waktu"}
                          </span>
                          <span className="font-mono text-foreground font-semibold">
                            {new Date(task.completed_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* 3. Action Workflow Banner (If Actionable) */}
                {task.status === "review" && (
                  <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200 block">
                        {canApprove
                          ? "Menunggu Persetujuan Anda (Atasan / Delegator)"
                          : "Menunggu Persetujuan Atasan"}
                      </span>
                      {task.review_notes ? (
                        <span className="text-[11px] text-amber-800 dark:text-amber-300 italic line-clamp-1">
                          &ldquo;{task.review_notes}&rdquo;
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                          {canApprove
                            ? "Silakan periksa berkas SPJ & bukti pengerjaan sebelum menyetujui."
                            : task.assigned_to === currentUser?.id
                            ? `Laporan pekerjaan Anda sedang diverifikasi oleh ${reviewerName}.`
                            : `Tugas sedang menunggu verifikasi & persetujuan dari ${reviewerName}.`}
                        </span>
                      )}
                    </div>
                    {canApprove && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={handleApprove}
                          disabled={isActionLoading}
                          className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-xs"
                        >
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsRevisionOpen(true)}
                          disabled={isActionLoading}
                          className="h-7 px-2.5 text-xs font-bold text-amber-800 dark:text-amber-300 border-amber-300 rounded-lg cursor-pointer"
                        >
                          Revisi
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Banner 1: To Do / Unassigned -> Ambil Tugas / Mulai Kerjakan */}
                {(task.status === "todo" || task.status === "unassigned") && (
                  <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-blue-900 dark:text-blue-200 block">
                        {!task.assigned_to
                          ? "Antrean To Do (Belum Ada Pelaksana)"
                          : task.assigned_to === currentUser?.id
                          ? "Tugas Ditugaskan Kepada Anda"
                          : `Antrean To Do (PIC: ${task.assignee?.nama || "Karyawan"})`}
                      </span>
                      <span className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                        {!task.assigned_to
                          ? "Ambil tugas ini untuk langsung memulai pengerjaan."
                          : "Klik untuk mulai mengerjakan tugas ini."}
                      </span>
                    </div>
                    {(!isStaff || !task.assigned_to || task.assigned_to === currentUser?.id) && (
                      <Button
                        size="sm"
                        onClick={handleTakeTask}
                        disabled={isActionLoading}
                        className="h-7 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5 cursor-pointer shrink-0"
                      >
                        <PlayIcon className="size-3.5 fill-current" />
                        {!task.assigned_to ? "Ambil Tugas" : "Mulai Kerjakan"}
                      </Button>
                    )}
                  </div>
                )}

                {/* Banner 2: In Progress -> Submit Review */}
                {task.status === "in_progress" && (
                  <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-foreground block">
                        Sedang Dalam Pengerjaan
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Pekerjaan telah selesai? Ajukan untuk direview atasan.
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsSubmitReviewOpen(true)}
                      disabled={isActionLoading}
                      className="h-7 px-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg gap-1.5 cursor-pointer shrink-0"
                    >
                      <CheckCircle2Icon className="size-3.5" />
                      Submit Review
                    </Button>
                  </div>
                )}

                {/* Banner 3: Done -> Selesai & Disetujui */}
                {task.status === "done" && (
                  <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center gap-2.5">
                    <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                        Tugas Selesai & Disetujui
                      </span>
                      <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                        Seluruh hasil kerja dan SPJ telah disetujui.
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Deskripsi */}
                {task.description && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Deskripsi
                    </span>
                    <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* 5. TAB BAR: Tahapan | Catatan | Lampiran */}
                <div className="pt-2">
                  <div className="flex items-center border-b border-border/80 gap-6">
                    {/* Tahapan Subtask Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab("subtasks")}
                      className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer -mb-px shrink-0 ${
                        activeDetailTab === "subtasks"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <span>Tahapan</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums leading-none ${
                          activeDetailTab === "subtasks"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-300 border border-red-100 dark:border-red-900/50"
                            : "bg-muted text-muted-foreground border border-border/40"
                        }`}
                      >
                        {completedSubtasks}/{subtasks.length}
                      </span>
                    </button>

                    {/* Catatan Tab (All human notes across task & subtasks) */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab("comments")}
                      className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer -mb-px shrink-0 ${
                        activeDetailTab === "comments"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <span>Catatan</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums leading-none ${
                          activeDetailTab === "comments"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-300 border border-red-100 dark:border-red-900/50"
                            : "bg-muted text-muted-foreground border border-border/40"
                        }`}
                      >
                        {humanComments.length}
                      </span>
                    </button>

                    {/* Lampiran Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab("attachments")}
                      className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer -mb-px shrink-0 ${
                        activeDetailTab === "attachments"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <span>Lampiran</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums leading-none ${
                          activeDetailTab === "attachments"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-300 border border-red-100 dark:border-red-900/50"
                            : "bg-muted text-muted-foreground border border-border/40"
                        }`}
                      >
                        {totalAttachmentsCount}
                      </span>
                    </button>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      TAB 1: TAHAPAN (SUBTASK) — Strict Sequential Approval Workflow
                      ───────────────────────────────────────────────────────────── */}
                  {activeDetailTab === "subtasks" && (
                    <div className="space-y-3.5 pt-3">
                      {/* Workflow summary & guide */}
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className="font-bold text-foreground block">
                            Alur Tahapan Terstruktur (Sequential)
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Progres: {completedSubtasks} dari {subtasks.length} tahap disetujui ({progressPercent}%). Setiap tahap harus disetujui atasan sebelum membuka tahap selanjutnya.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {subtasks.some((s) => s.approval_status === "rejected") && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-md">
                              <XCircleIcon className="size-3" />
                              Perlu Perbaikan
                            </span>
                          )}
                          {subtasks.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={toggleAllSubtasks}
                              className="h-6.5 px-2 text-[10px] font-bold rounded-md border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                            >
                              {areAllSubtasksExpanded ? (
                                <>
                                  <ChevronUpIcon className="size-3" />
                                  <span>Tutup Semua</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="size-3" />
                                  <span>Buka Semua</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Hidden file input for subtask evidence attachment (supports multiple files/photos) */}
                      <input
                        ref={subtaskFileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleSubtaskFileChange}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                      />

                      {/* Stepper Cards */}
                      <div className="space-y-3">
                        {subtasks.map((st, idx) => {
                          // Strict sequential rule:
                          // Step at index idx is unlocked ONLY IF idx === 0 OR all steps prior to idx are approved
                          const prevSteps = subtasks.slice(0, idx)
                          const allPrevApproved = prevSteps.every((s) => s.approval_status === "approved")
                          const isUnlocked = idx === 0 || allPrevApproved
                          const isApproved = st.approval_status === "approved"
                          const isRejected = st.approval_status === "rejected"
                          const isPending = st.approval_status === "pending"
                          const prevStep = idx > 0 ? subtasks[idx - 1] : null
                          const isPIC =
                            currentUser?.id === task.assigned_to ||
                            currentUser?.id === task.secondary_assigned_to
                          const canActAsPIC = isPIC || isStaff || currentUser?.role === "admin"

                          // 1. LOCKED STAGE (Tahap Sebelumnya Belum Disetujui)
                          if (!isUnlocked) {
                            return (
                              <div
                                key={st.id}
                                className="rounded-xl border border-border/50 bg-muted/15 p-3.5 space-y-2 opacity-75 select-none transition-all"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex items-center justify-center size-6.5 rounded-full bg-muted border border-border/80 text-muted-foreground text-[11px] font-bold shrink-0">
                                      <LockIcon className="size-3 text-muted-foreground/70" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                          Tahap {idx + 1}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/60">
                                          <LockIcon className="size-2.5" /> Terkunci
                                        </span>
                                      </div>
                                      <h4 className="text-xs font-semibold text-muted-foreground">
                                        {st.title}
                                      </h4>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/40 flex items-center gap-2">
                                  <AlertCircleIcon className="size-3.5 text-muted-foreground/80 shrink-0" />
                                  <span>
                                    Tahap ini terkunci. Tunggu persetujuan resmi atasan pada{" "}
                                    <strong>Tahap {idx} ({prevStep?.title})</strong> sebelum dapat dikerjakan.
                                  </span>
                                </div>

                                {st.description && (
                                  <div className="text-[11px] text-muted-foreground/80 pl-9 italic line-clamp-2">
                                    Instruksi: {st.description}
                                  </div>
                                )}
                              </div>
                            )
                          }

                          const isExpanded =
                            subtaskExpandedMap[st.id] !== undefined
                              ? subtaskExpandedMap[st.id]
                              : !isApproved
                          const attachmentsCount = (st.attachments || []).length
                          const commentsCount = (st.comments || []).length

                          // 2. UNLOCKED STAGE (Sedang Dikerjakan / Menunggu Review / Disetujui / Perlu Revisi)
                          return (
                            <div
                              key={st.id}
                              className={`rounded-xl border transition-all overflow-hidden ${
                                isApproved
                                  ? "bg-emerald-50/40 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                                  : isRejected
                                  ? "bg-red-50/40 border-red-200 dark:bg-red-950/25 dark:border-red-800/60 shadow-xs"
                                  : isPending
                                  ? "bg-amber-50/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/60 shadow-xs"
                                  : "bg-card border-border shadow-xs hover:border-blue-300 dark:hover:border-blue-900"
                              }`}
                            >
                              {/* Header Card (Clickable to Collapse / Expand) */}
                              <div
                                onClick={() => toggleSubtaskCard(st.id, isExpanded)}
                                className="flex items-center justify-between gap-2 p-3 sm:p-3.5 cursor-pointer select-none hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Step Circle */}
                                  <div
                                    className={`flex items-center justify-center size-6.5 rounded-full shrink-0 text-[11px] font-bold border-2 ${
                                      isApproved
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : isRejected
                                        ? "bg-red-500 border-red-500 text-white"
                                        : isPending
                                        ? "bg-amber-500 border-amber-500 text-white"
                                        : "bg-background border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300"
                                    }`}
                                  >
                                    {isApproved ? (
                                      <ShieldCheckIcon className="size-3.5" />
                                    ) : isRejected ? (
                                      <XCircleIcon className="size-3.5" />
                                    ) : isPending ? (
                                      <ClockIcon className="size-3.5" />
                                    ) : (
                                      <span>{idx + 1}</span>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Tahap {idx + 1}
                                      </span>
                                      {/* Status Badges */}
                                      {isApproved && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                          <ShieldCheckIcon className="size-3" /> Disetujui Atasan
                                        </span>
                                      )}
                                      {isRejected && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                                          <XCircleIcon className="size-3" /> Perlu Revisi
                                        </span>
                                      )}
                                      {isPending && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                          <ClockIcon className="size-3 animate-pulse" /> Menunggu Review Atasan
                                        </span>
                                      )}
                                      {!isApproved && !isRejected && !isPending && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                          ⚡ Sedang Dikerjakan
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                      <h4 className="text-xs font-bold text-foreground">
                                        {st.title}
                                      </h4>
                                      {/* Collapsed summary badges */}
                                      {!isExpanded && (
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                          {attachmentsCount > 0 && (
                                            <span className="inline-flex items-center gap-0.5 bg-muted/80 px-1.5 py-0.2 rounded border border-border/50">
                                              <PaperclipIcon className="size-2.5" /> {attachmentsCount} berkas
                                            </span>
                                          )}
                                          {commentsCount > 0 && (
                                            <span className="inline-flex items-center gap-0.5 bg-muted/80 px-1.5 py-0.2 rounded border border-border/50">
                                              <MessageSquareIcon className="size-2.5" /> {commentsCount} catatan
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Quick Delete Button & Collapse/Expand Toggle */}
                                <div className="flex items-center gap-1 shrink-0">
                                  {!isStaff && !isApproved && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteSubtask(st.id, e)
                                      }}
                                      className="text-muted-foreground hover:text-red-600 p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                                      title="Hapus tahap ini"
                                    >
                                      <Trash2Icon className="size-3.5" />
                                    </button>
                                  )}

                                  <div
                                    className={`size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-transform duration-200 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                    title={isExpanded ? "Tutup detail tahapan" : "Buka detail tahapan"}
                                  >
                                    <ChevronDownIcon className="size-4" />
                                  </div>
                                </div>
                              </div>

                              {/* Collapsible Body (Rendered when expanded) */}
                              {isExpanded && (
                                <div className="p-3.5 pt-1 space-y-3 border-t border-border/40">
                                  {/* Subtask Description / Detailed Instructions */}
                              {st.description && (
                                <div className="bg-muted/30 p-2.5 rounded-lg border border-border/40 text-xs space-y-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                    📋 Detail & Instruksi Pengerjaan
                                  </span>
                                  <p className="text-foreground/90 text-xs leading-relaxed whitespace-pre-line">
                                    {st.description}
                                  </p>
                                </div>
                              )}

                              {/* Approved Banner */}
                              {isApproved && (
                                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between flex-wrap gap-2">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <ShieldCheckIcon className="size-3.5 text-emerald-600" />
                                    Disetujui oleh: <strong>{st.approver?.nama || "Atasan"}</strong>
                                  </span>
                                  {st.approved_at && (
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                      {new Date(st.approved_at).toLocaleString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Rejection Note Alert Banner */}
                              {isRejected && (
                                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-[11px] text-red-900 dark:text-red-200 space-y-1.5">
                                  <span className="font-bold flex items-center gap-1.5 text-red-700 dark:text-red-400">
                                    <AlertTriangleIcon className="size-3.5" />
                                    Catatan Revisi dari Atasan:
                                  </span>
                                  <div className="italic bg-background/80 p-2 rounded border border-red-200 dark:border-red-900/60 font-medium">
                                    &ldquo;{st.rejection_note}&rdquo;
                                  </div>
                                  <p className="text-[10px] text-red-700/80">
                                    Silakan perbaiki hasil kerja, unggah bukti tambahan di bawah, lalu klik tombol &ldquo;Ajukan Ulang&rdquo;.
                                  </p>
                                </div>
                              )}

                              {/* Dedicated Per-Subtask Attachments Section */}
                              <div className="space-y-1.5 pt-1 border-t border-border/40">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                                    <PaperclipIcon className="size-3 text-muted-foreground" />
                                    Lampiran Bukti Tahap Ini ({(st.attachments || []).length})
                                  </span>
                                  {/* Upload button (only if not yet approved) */}
                                  {!isApproved && (canActAsPIC || !isStaff) && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setUploadTargetSubtaskId(st.id)
                                        subtaskFileInputRef.current?.click()
                                      }}
                                      className="h-6 px-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded gap-1 cursor-pointer"
                                    >
                                      <UploadIcon className="size-3" />
                                      <span>Unggah Bukti</span>
                                    </Button>
                                  )}
                                </div>

                                {/* List of attachments for this subtask */}
                                {(st.attachments || []).length > 0 ? (
                                  <div className="grid grid-cols-1 gap-1.5">
                                    {(st.attachments || []).map((att) => (
                                      <div
                                        key={att.id}
                                        className="flex items-center justify-between p-2 rounded-lg border border-border/70 bg-background hover:bg-muted/30 text-xs group transition-colors"
                                      >
                                        <a
                                          href={att.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 min-w-0 flex-1 hover:text-blue-600 transition-colors"
                                          title={att.file_name}
                                        >
                                          {att.file_name.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                            <ImageIcon className="size-3.5 text-emerald-600 shrink-0" />
                                          ) : (
                                            <FileTextIcon className="size-3.5 text-blue-600 shrink-0" />
                                          )}
                                          <span className="truncate font-medium text-foreground">
                                            {att.file_name}
                                          </span>
                                          {att.file_size_bytes && (
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                              ({(att.file_size_bytes / 1024).toFixed(0)} KB)
                                            </span>
                                          )}
                                          <ExternalLinkIcon className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </a>
                                        {!isApproved && (
                                          <button
                                            type="button"
                                            onClick={(e) => handleDeleteSubtaskAttachment(att.id, st.id, e)}
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 p-1 transition-opacity cursor-pointer shrink-0 ml-1"
                                            title="Hapus lampiran bukti"
                                          >
                                            <Trash2Icon className="size-3" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-muted-foreground italic bg-muted/20 p-2 rounded-lg border border-dashed border-border/60 text-center">
                                    {!isApproved
                                      ? "Belum ada bukti lampiran. Unggah foto atau dokumen pengerjaan tahap ini."
                                      : "Tidak ada lampiran untuk tahap ini."}
                                  </div>
                                )}
                              </div>

                              {/* Action Bar (Submit Approval by Staff & Approve/Reject by Atasan) */}
                              {!isApproved && (
                                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                                  {/* Staff Submission */}
                                  {!isPending ? (
                                    (canActAsPIC || isStaff) && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleSubmitSubtaskApproval(st.id)}
                                        disabled={isSubmittingSubtaskApproval[st.id]}
                                        className="h-7.5 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5 cursor-pointer shadow-xs"
                                      >
                                        {isSubmittingSubtaskApproval[st.id] ? (
                                          <Loader2Icon className="size-3 animate-spin" />
                                        ) : (
                                          <SendIcon className="size-3" />
                                        )}
                                        {isRejected ? "Ajukan Ulang Persetujuan Tahap" : "Ajukan Persetujuan Tahap"}
                                      </Button>
                                    )
                                  ) : (
                                    <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                                      <ClockIcon className="size-3 text-amber-600 animate-pulse" />
                                      <span>Menunggu verifikasi atasan ({reviewerName})</span>
                                    </div>
                                  )}

                                  {/* Supervisor Approval Actions */}
                                  {canApprove && (
                                    <div className="flex items-center gap-1.5 ml-auto">
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setApprovalTargetSubtask(st)
                                          setIsApprovalDialogOpen(true)
                                        }}
                                        className="h-7.5 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 cursor-pointer shadow-xs"
                                      >
                                        <ShieldCheckIcon className="size-3.5" />
                                        Setujui Tahap
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setApprovalTargetSubtask(st)
                                          setIsRejectionDialogOpen(true)
                                        }}
                                        className="h-7.5 px-2.5 text-xs font-bold text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg gap-1 cursor-pointer"
                                      >
                                        <XCircleIcon className="size-3.5" />
                                        Minta Revisi
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Subtask-Specific Comments Thread Accordion */}
                              <div className="pt-2 border-t border-border/40">
                                <button
                                  type="button"
                                  onClick={() => toggleSubtaskComments(st.id)}
                                  className="flex items-center justify-between w-full text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer py-1"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <MessageSquareIcon className="size-3 text-muted-foreground" />
                                    Catatan Khusus Tahap Ini ({(st.comments || []).length})
                                  </span>
                                  {subtaskCommentsExpanded[st.id] ? (
                                    <ChevronUpIcon className="size-3.5" />
                                  ) : (
                                    <ChevronDownIcon className="size-3.5" />
                                  )}
                                </button>

                                {subtaskCommentsExpanded[st.id] && (
                                  <div className="mt-2 space-y-2 bg-muted/20 p-2.5 rounded-lg border border-border/50">
                                    {(st.comments || []).length > 0 ? (
                                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                        {(st.comments || []).map((c) => (
                                          <div
                                            key={c.id}
                                            className="p-2 rounded-lg bg-background border border-border/60 text-xs space-y-0.5 group"
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-[11px] text-foreground">
                                                  {c.user?.nama || "User"}
                                                </span>
                                                {c.user?.role && (
                                                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-muted text-muted-foreground uppercase">
                                                    {ROLE_LABELS[c.user.role]?.label || c.user.role}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground">
                                                  {c.created_at
                                                    ? new Date(c.created_at).toLocaleTimeString("id-ID", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                      })
                                                    : ""}
                                                </span>
                                                {(!isStaff || c.user_id === currentUser?.id) && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleDeleteComment(c.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 p-0.5 transition-opacity cursor-pointer"
                                                    title="Hapus"
                                                  >
                                                    <Trash2Icon className="size-2.5" />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                            <p className="text-foreground/90 text-[11px] leading-relaxed whitespace-pre-line">
                                              {c.comment}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-muted-foreground italic text-center py-1">
                                        Belum ada catatan khusus pada tahap ini.
                                      </p>
                                    )}

                                    {/* Input to write subtask-specific comment */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <Input
                                        value={subtaskCommentInputs[st.id] || ""}
                                        onChange={(e) =>
                                          setSubtaskCommentInputs((prev) => ({ ...prev, [st.id]: e.target.value }))
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendSubtaskComment(st.id)
                                          }
                                        }}
                                        placeholder="Tulis catatan arahan tahap ini..."
                                        className="h-7.5 rounded-lg text-xs bg-background"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleSendSubtaskComment(st.id)}
                                        disabled={
                                          isSubmittingSubtaskComment[st.id] ||
                                          !(subtaskCommentInputs[st.id] || "").trim()
                                        }
                                        className="h-7.5 px-2.5 rounded-lg text-xs font-bold bg-foreground text-background shrink-0 cursor-pointer"
                                      >
                                        {isSubmittingSubtaskComment[st.id] ? (
                                          <Loader2Icon className="size-3 animate-spin" />
                                        ) : (
                                          <SendIcon className="size-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                        })}

                        {subtasks.length === 0 && (
                          <div className="p-6 text-center rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-1">
                            <CheckSquareIcon className="size-7 mx-auto text-muted-foreground/50" />
                            <p className="text-xs font-semibold text-foreground">Belum Ada Tahapan Pengerjaan</p>
                            <p className="text-[11px] text-muted-foreground">
                              {isStaff
                                ? "Atasan belum menentukan tahapan pekerjaan untuk tugas ini."
                                : "Tambahkan tahapan di bawah agar pekerjaan tersusun rapi dan terverifikasi berurutan."}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Add Subtask Form — for atasan / admin / non-staff */}
                      {!isStaff && (
                        <div className="pt-2">
                          {!isAddSubtaskExpanded ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAddSubtaskExpanded(true)}
                              className="w-full h-8 text-xs font-bold border-dashed border-border hover:border-red-400 text-muted-foreground hover:text-foreground rounded-lg gap-1.5 cursor-pointer"
                            >
                              <PlusIcon className="size-3.5" />
                              Tambah Tahapan (Subtask) Baru
                            </Button>
                          ) : (
                            <form onSubmit={handleAddSubtask} className="p-3 rounded-xl border border-border bg-muted/20 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  <PlusIcon className="size-3.5 text-red-600" />
                                  Tambah Tahapan Baru (Tahap {subtasks.length + 1})
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsAddSubtaskExpanded(false)}
                                  className="h-6 px-1.5 text-xs text-muted-foreground cursor-pointer"
                                >
                                  Batal
                                </Button>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-muted-foreground block">
                                  Judul Tahapan *
                                </label>
                                <Input
                                  value={newSubtaskTitle}
                                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                  placeholder="Contoh: Pengecekan Lapangan & Pengukuran Redaman ODP"
                                  required
                                  className="h-8 rounded-lg text-xs bg-background"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-muted-foreground block">
                                  Detail / Instruksi Tahap (Opsional)
                                </label>
                                <Textarea
                                  value={newSubtaskDesc}
                                  onChange={(e) => setNewSubtaskDesc(e.target.value)}
                                  placeholder="Tuliskan instruksi detail, standar operasional, atau bukti apa yang wajib dilampirkan pelaksana..."
                                  className="text-xs rounded-lg min-h-[60px] bg-background"
                                />
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                                  className="h-7.5 px-3 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                >
                                  {isAddingSubtask ? (
                                    <><Loader2Icon className="size-3 animate-spin mr-1" /> Menyimpan...</>
                                  ) : (
                                    <><PlusIcon className="size-3 mr-1" /> Tambahkan Tahap</>
                                  )}
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      TAB 2: CATATAN (Human Comments & Subtask Notes)
                      ───────────────────────────────────────────────────────────── */}
                  {activeDetailTab === "comments" && (
                    <div className="space-y-3 pt-3">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <MessageSquareIcon className="size-3.5 text-red-600" />
                            Catatan
                          </h4>
                          <p className="text-[10px] text-muted-foreground">
                            Ruang catatan, instruksi, dan diskusi tim dari seluruh tahapan pekerjaan.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {humanComments.map((cmt) => {
                          const targetSt = cmt.subtask_id
                            ? (task.subtasks || []).find((s) => s.id === cmt.subtask_id)
                            : null
                          const stIdx = cmt.subtask_id
                            ? (task.subtasks || []).findIndex((s) => s.id === cmt.subtask_id)
                            : -1

                          return (
                            <div
                              key={cmt.id}
                              className="group p-3 rounded-xl bg-card border border-border/70 text-xs space-y-1.5 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <img
                                    src={
                                      cmt.user?.avatar_url ||
                                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                                    }
                                    alt={cmt.user?.nama || "User"}
                                    className="size-5 rounded-full object-cover"
                                  />
                                  <span className="font-bold text-[11px] text-foreground">
                                    {cmt.user?.nama || "User"}
                                  </span>
                                  {cmt.user?.role && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase border border-border/40">
                                      {ROLE_LABELS[cmt.user.role]?.label || cmt.user.role}
                                    </span>
                                  )}
                                  {targetSt ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                      <TagIcon className="size-2.5" />
                                      Tahap {stIdx >= 0 ? stIdx + 1 : ""}: {targetSt.title}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/40">
                                      Umum
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-muted-foreground">
                                    {cmt.created_at
                                      ? new Date(cmt.created_at).toLocaleString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : ""}
                                  </span>
                                  {(!isStaff || cmt.user_id === currentUser?.id) && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(cmt.id)}
                                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 p-0.5 transition-opacity cursor-pointer"
                                      title="Hapus catatan"
                                    >
                                      <Trash2Icon className="size-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-foreground text-[12px] leading-relaxed whitespace-pre-line pl-7">
                                {cmt.comment}
                              </p>
                            </div>
                          )
                        })}

                        {humanComments.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground space-y-1">
                            <MessageSquareIcon className="size-8 mx-auto text-muted-foreground/30" />
                            <p className="text-xs font-semibold">Belum Ada Catatan</p>
                            <p className="text-[11px] text-muted-foreground">
                              Catatan atau instruksi pada tugas maupun di tiap tahapan akan tampil di sini.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Comment Input */}
                      <form onSubmit={handleSendComment} className="flex items-center gap-1.5 pt-1">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Tulis catatan atau pesan..."
                          className="h-8.5 rounded-lg text-xs bg-muted/20"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingComment || !commentText.trim()}
                          className="h-8.5 px-3 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shrink-0 cursor-pointer shadow-xs gap-1"
                        >
                          {isSubmittingComment ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : (
                            <>
                              <SendIcon className="size-3" />
                              <span>Kirim</span>
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      TAB 3: LAMPIRAN (Bukti Pengerjaan Per-Tahapan Subtask)
                      ───────────────────────────────────────────────────────────── */}
                  {activeDetailTab === "attachments" && (
                    <div className="space-y-4 pt-3">
                      <div className="border-b border-border/50 pb-2">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <PaperclipIcon className="size-3.5 text-blue-600" />
                          Lampiran Bukti Pengerjaan
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Seluruh berkas foto atau dokumen bukti pengerjaan dari setiap tahapan penugasan.
                        </p>
                      </div>

                      {/* Lampiran Berdasarkan Tahapan Subtask */}
                      <div className="space-y-2.5">
                        {subtasks.filter((st) => (st.attachments || []).length > 0).length > 0 ? (
                          <div className="space-y-2.5">
                            {subtasks
                              .filter((st) => (st.attachments || []).length > 0)
                              .map((st) => {
                                const stepNumber =
                                  st.sort_order && st.sort_order > 0
                                    ? st.sort_order
                                    : subtasks.findIndex((s) => s.id === st.id) + 1
                                return (
                                  <div key={st.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5 min-w-0">
                                        <span className="size-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] flex items-center justify-center font-bold shrink-0">
                                          {stepNumber}
                                        </span>
                                        <span className="truncate">Tahap {stepNumber}: {st.title}</span>
                                      </span>
                                      <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
                                        {(st.attachments || []).length} berkas
                                      </span>
                                    </div>

                                  <div className="space-y-1.5">
                                    {(st.attachments || []).map((att) => (
                                      <div
                                        key={att.id}
                                        className="p-2 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-xs group hover:border-blue-300 transition-colors"
                                      >
                                        <a
                                          href={att.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 min-w-0 flex-1 hover:text-blue-600 transition-colors"
                                        >
                                          {att.file_name.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                            <ImageIcon className="size-3.5 text-emerald-600 shrink-0" />
                                          ) : (
                                            <FileTextIcon className="size-3.5 text-blue-600 shrink-0" />
                                          )}
                                          <span className="truncate font-medium text-foreground">
                                            {att.file_name}
                                          </span>
                                          {att.file_size_bytes && (
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                              ({(att.file_size_bytes / 1024).toFixed(0)} KB)
                                            </span>
                                          )}
                                          <ExternalLinkIcon className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground italic bg-muted/20 p-6 rounded-lg border border-dashed text-center space-y-1">
                            <PaperclipIcon className="size-6 mx-auto text-muted-foreground/40" />
                            <p className="font-semibold text-foreground">Belum Ada Bukti Lampiran</p>
                            <p className="text-[11px] text-muted-foreground">
                              Bukti pengerjaan dilampirkan langsung pada masing-masing tahapan di tab Tahapan.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DIALOG: APPROVE SUBTASK (Atasan) */}
            <Dialog open={isApprovalDialogOpen} onOpenChange={(o) => { setIsApprovalDialogOpen(o); if (!o) setApprovalTargetSubtask(null) }}>
              <DialogContent className="max-w-sm rounded-xl p-4 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheckIcon className="size-4 text-emerald-600" />
                    Setujui Tahapan Ini
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Anda akan menyetujui tahapan berikut dan membuka tahap selanjutnya.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    {approvalTargetSubtask?.title}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => { setIsApprovalDialogOpen(false); setApprovalTargetSubtask(null) }}
                    disabled={isSubtaskActionLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    onClick={handleApproveSubtask}
                    disabled={isSubtaskActionLoading}
                  >
                    {isSubtaskActionLoading ? (
                      <Loader2Icon className="size-3 animate-spin" />
                    ) : (
                      <><ShieldCheckIcon className="size-3" /> Ya, Setujui</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* DIALOG: REJECT SUBTASK (Atasan) */}
            <Dialog open={isRejectionDialogOpen} onOpenChange={(o) => { setIsRejectionDialogOpen(o); if (!o) { setApprovalTargetSubtask(null); setRejectionNote("") } }}>
              <DialogContent className="max-w-sm rounded-xl p-4 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <XCircleIcon className="size-4 text-red-600" />
                    Kembalikan untuk Revisi
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Tahapan ini akan dikembalikan ke karyawan dengan catatan perbaikan.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                    {approvalTargetSubtask?.title}
                  </p>
                </div>

                <div className="mt-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Catatan Revisi <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="Apa yang perlu diperbaiki dari tahapan ini?"
                    className="text-xs rounded-lg min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => { setIsRejectionDialogOpen(false); setApprovalTargetSubtask(null); setRejectionNote("") }}
                    disabled={isSubtaskActionLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    onClick={handleRejectSubtask}
                    disabled={isSubtaskActionLoading || !rejectionNote.trim()}
                  >
                    {isSubtaskActionLoading ? (
                      <Loader2Icon className="size-3 animate-spin" />
                    ) : (
                      <><XCircleIcon className="size-3" /> Kembalikan</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* DIALOG: SUBTASK FILE UPLOAD CONFIRMATION (Supports Multiple Photos/Files) */}
            <Dialog
              open={isSubtaskUploadOpen}
              onOpenChange={(o) => {
                if (!o) {
                  setIsSubtaskUploadOpen(false)
                  setSubtaskSelectedFiles([])
                  if (subtaskFileInputRef.current) subtaskFileInputRef.current.value = ""
                }
              }}
            >
              <DialogContent className="max-w-md rounded-2xl p-5 font-sans border-border shadow-xl">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <UploadIcon className="size-4" />
                    </div>
                    <span>Unggah Berkas Bukti Tahapan</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Unggah satu atau banyak foto / berkas dokumen untuk melengkapi bukti tahap ini.
                  </DialogDescription>
                </DialogHeader>

                {subtaskSelectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold px-0.5 text-muted-foreground">
                      <span>Daftar Berkas Terpilih ({subtaskSelectedFiles.length})</span>
                      <span>
                        Total: {(subtaskSelectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {subtaskSelectedFiles.map((file, idx) => {
                        const isImg = file.type.startsWith("image/")
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 border border-border/70 text-xs hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="size-6 rounded bg-background flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 border border-border">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate max-w-[220px]">
                                  {file.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB • {isImg ? "Foto / Gambar" : file.type || "Dokumen"}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSubtaskSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                              }}
                              className="size-6 text-muted-foreground hover:text-red-600 rounded-md cursor-pointer shrink-0"
                              title="Hapus berkas ini"
                            >
                              <XIcon className="size-3.5" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2.5 mt-4 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => {
                      setIsSubtaskUploadOpen(false)
                      setSubtaskSelectedFiles([])
                      if (subtaskFileInputRef.current) subtaskFileInputRef.current.value = ""
                    }}
                    disabled={isSubtaskUploading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm gap-1.5"
                    onClick={handleSubtaskUploadConfirm}
                    disabled={isSubtaskUploading || subtaskSelectedFiles.length === 0}
                  >
                    {isSubtaskUploading ? (
                      <>
                        <Loader2Icon className="size-3.5 animate-spin" />
                        <span>Mengunggah ({subtaskSelectedFiles.length})...</span>
                      </>
                    ) : (
                      <>
                        <UploadIcon className="size-3.5" />
                        <span>Unggah {subtaskSelectedFiles.length} Berkas</span>
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* DIALOG 1: SUBMIT FOR REVIEW */}
            <Dialog open={isSubmitReviewOpen} onOpenChange={setIsSubmitReviewOpen}>
              <DialogContent className="max-w-sm rounded-xl p-4 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2Icon className="size-4 text-red-600" />
                    Ajukan Review ke Atasan
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Kirimkan penugasan ini untuk diperiksa dan disetujui atasan.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2.5 mt-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Catatan (Opsional)
                    </label>
                    <Textarea
                      value={submitNotes}
                      onChange={(e) => setSubmitNotes(e.target.value)}
                      placeholder="Contoh: Seluruh pekerjaan dan berkas telah selesai."
                      className="mt-1 text-xs min-h-[60px] rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitReviewOpen(false)}
                      className="h-7.5 text-xs rounded-lg"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleSubmitForReview}
                      disabled={isActionLoading}
                      className="h-7.5 px-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      {isActionLoading ? "Mengirim..." : "Kirim"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* DIALOG 2: RETURN FOR REVISION */}
            <Dialog open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
              <DialogContent className="max-w-sm rounded-xl p-4 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <RotateCcwIcon className="size-4 text-amber-600" />
                    Kembalikan untuk Revisi
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Berikan catatan bagian mana yang perlu diperbaiki.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2.5 mt-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Catatan Revisi *
                    </label>
                    <Textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Contoh: Mohon lengkapi berkas lampiran."
                      required
                      className="mt-1 text-xs min-h-[70px] rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsRevisionOpen(false)}
                      className="h-7.5 text-xs rounded-lg"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleReturnRevision}
                      disabled={isActionLoading || !revisionNotes.trim()}
                      className="h-7.5 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                    >
                      {isActionLoading ? "Memproses..." : "Kembalikan"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* DIALOG 3: REAL FILE & PHOTO UPLOAD */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogContent className="max-w-sm rounded-xl p-4 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <UploadIcon className="size-4 text-blue-600" />
                    Unggah Berkas / Foto / Nota
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Pilih file PDF, foto bukti, atau nota biaya dari perangkat Anda.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUploadAttachment} className="space-y-3 mt-2">
                  {/* File Picker Button Area */}
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Pilih File / Foto Dari Perangkat *
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.zip"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-border hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-foreground">
                          {selectedFile.type.startsWith("image/") ? (
                            <ImageIcon className="size-4 text-emerald-600" />
                          ) : (
                            <FileTextIcon className="size-4 text-blue-600" />
                          )}
                          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <UploadIcon className="size-5 text-blue-500" />
                          <span className="text-xs font-semibold text-foreground">
                            Klik untuk cari file (PDF, Foto, Dokumen)
                          </span>
                          <span className="text-[10px]">Mendukung PDF, JPG, PNG, DOCX, ZIP</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Jenis Lampiran
                    </label>
                    <Select
                      value={uploadType}
                      onValueChange={(val) => setUploadType((val as any) || "evidence")}
                    >
                      <SelectTrigger className="w-full h-8.5 rounded-lg border-border bg-background px-2 text-xs font-medium">
                        <span className="truncate">
                          {uploadType === "evidence"
                            ? "Foto Bukti / Hasil Pengerjaan"
                            : uploadType === "document"
                            ? "Dokumen Laporan / Proposal (PDF)"
                            : "Kwitansi / Nota Biaya SPJ"}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="evidence">Foto Bukti / Hasil Pengerjaan</SelectItem>
                        <SelectItem value="document">Dokumen Laporan / Proposal (PDF)</SelectItem>
                        <SelectItem value="receipt_nota">Kwitansi / Nota Biaya SPJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Nama File / Keterangan *
                    </label>
                    <Input
                      value={uploadFileName}
                      onChange={(e) => setUploadFileName(e.target.value)}
                      placeholder="Contoh: Foto_Hasil_Pekerjaan.jpg"
                      required
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>

                  {uploadType === "receipt_nota" && (
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Nominal Kwitansi (Rp)
                      </label>
                      <Input
                        type="number"
                        value={uploadAmount}
                        onChange={(e) => setUploadAmount(e.target.value)}
                        placeholder="Contoh: 150000"
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadOpen(false)}
                      className="h-7.5 text-xs rounded-lg cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isActionLoading || !uploadFileName.trim()}
                      className="h-7.5 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                    >
                      {isActionLoading ? "Mengunggah..." : "Simpan Lampiran"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* DIALOG 4: DELETE TASK CONFIRMATION */}
            <Dialog open={isDeleteTaskOpen} onOpenChange={setIsDeleteTaskOpen}>
              <DialogContent className="max-w-sm rounded-xl p-4 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                    <AlertTriangleIcon className="size-4" />
                    Hapus Penugasan?
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Penugasan <strong>[{task.ticket_code}] {task.title}</strong> beserta subtask dan lampirannya akan dihapus secara permanen dari sistem.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteTaskOpen(false)}
                    className="h-8 text-xs rounded-lg cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    disabled={isDeletingTask}
                    onClick={handleDeleteTask}
                    className="h-8 px-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                  >
                    {isDeletingTask ? "Menghapus..." : "Ya, Hapus Penugasan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

