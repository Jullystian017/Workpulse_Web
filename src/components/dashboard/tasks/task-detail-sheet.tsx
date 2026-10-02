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
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  deleteTask,
  getChannels,
  getAllUsers,
} from "@/lib/api"

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
  const [availableChannels, setAvailableChannels] = React.useState<Channel[]>([])
  const [availableUsers, setAvailableUsers] = React.useState<User[]>([])
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)

  // Subtask creation state
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("")
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false)

  // Subtask approval/rejection dialog state
  const [approvalTargetSubtask, setApprovalTargetSubtask] = React.useState<Subtask | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = React.useState(false)
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = React.useState(false)
  const [rejectionNote, setRejectionNote] = React.useState("")
  const [isSubtaskActionLoading, setIsSubtaskActionLoading] = React.useState(false)

  // Per-subtask file upload state
  const subtaskFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploadTargetSubtaskId, setUploadTargetSubtaskId] = React.useState<string | null>(null)
  const [subtaskSelectedFile, setSubtaskSelectedFile] = React.useState<File | null>(null)
  const [isSubtaskUploadOpen, setIsSubtaskUploadOpen] = React.useState(false)
  const [isSubtaskUploading, setIsSubtaskUploading] = React.useState(false)

  // Tab Navigation State
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
  const loadTaskData = React.useCallback(async () => {
    if (!taskId) return
    // Only show full loading spinner if we don't have task data yet
    if (!task && !initialTask) {
      setIsLoading(true)
    }
    setLoadError(null)
    try {
      const activeUser = getActiveUserFromStorage()
      setCurrentUser(activeUser)
      const data = await getTaskById(taskId)
      if (data) {
        setTask(data)
      } else {
        if (!task && !initialTask) {
          setLoadError("Data penugasan tidak ditemukan.")
        }
      }
    } catch (err: any) {
      console.error(err)
      if (!task && !initialTask) {
        setLoadError(err?.message || "Terjadi kesalahan saat memuat tugas.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [taskId, task, initialTask])

  React.useEffect(() => {
    if (open && taskId) {
      if (initialTask && initialTask.id === taskId) {
        setTask(initialTask)
      }
      setLoadError(null)
      loadTaskData()
      setIsEditing(false)
    } else if (!open) {
      setTask(null)
      setLoadError(null)
    }
  }, [open, taskId, initialTask, loadTaskData])

  // Load Channels & Users when entering edit mode
  const handleStartEdit = async () => {
    if (!task) return
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditChannelId(task.channel_id || "")
    setEditPriority(task.priority)
    setEditAssignedTo(task.assigned_to || "")

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

  // Quick Status Changer
  const handleQuickStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return
    if (newStatus === "done" && task.status === "review" && !canApprove) {
      toast.error("Hanya atasan atau delegator tugas yang berhak menyetujui tugas ini.")
      return
    }
    const ok = await updateTaskStatus(task.id, newStatus, currentUser?.id)
    if (ok) {
      setTask((prev) => (prev ? { ...prev, status: newStatus } : null))
      toast.success(`Status diubah ke ${TASK_STATUS_LABELS[newStatus]?.label || newStatus}`)
      onTaskUpdated?.()
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

  // Hanya atasan (supervisor langsung), delegator, pembuat tugas, atau Admin/SGM yang berhak Approve / Setujui
  const canApprove = React.useMemo(() => {
    if (!currentUser || !task) return false
    // Pelaksana dilarang approve tugasnya sendiri
    if (task.assigned_to && currentUser.id === task.assigned_to) return false

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

  // Add Subtask Handler
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !newSubtaskTitle.trim()) return
    setIsAddingSubtask(true)
    try {
      const created = await addSubtask(task.id, newSubtaskTitle.trim())
      if (created) {
        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            subtasks: [...(prev.subtasks || []), created],
          }
        })
        setNewSubtaskTitle("")
        toast.success("Subtask ditambahkan")
        onTaskUpdated?.()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menambahkan subtask")
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
      toast.info("Subtask dihapus")
      onTaskUpdated?.()
    }
  }

  // ── Approve Subtask Handler (atasan) ──
  const handleApproveSubtask = async () => {
    if (!approvalTargetSubtask || !currentUser) return
    setIsSubtaskActionLoading(true)
    try {
      const ok = await approveSubtask(approvalTargetSubtask.id, currentUser.id)
      if (ok) {
        toast.success(`Tahap "${approvalTargetSubtask.title}" disetujui!`)
        setIsApprovalDialogOpen(false)
        setApprovalTargetSubtask(null)
        loadTaskData()
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
        loadTaskData()
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

  // ── Upload file bukti per subtask (karyawan) ──
  const handleSubtaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSubtaskSelectedFile(file)
      setIsSubtaskUploadOpen(true)
    }
  }

  const handleSubtaskUploadConfirm = async () => {
    if (!subtaskSelectedFile || !uploadTargetSubtaskId || !task || !currentUser) return
    setIsSubtaskUploading(true)
    try {
      const { supabase } = await import("@/lib/api").then(m => ({ supabase: m.supabase }))
      // Use a signed storage path
      const ext = subtaskSelectedFile.name.split(".").pop() || "bin"
      const path = `subtask-attachments/${uploadTargetSubtaskId}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(path, subtaskSelectedFile, { upsert: false })

      if (uploadError) {
        // Fallback: Store the object URL so files can still be previewed locally
        const localUrl = URL.createObjectURL(subtaskSelectedFile)
        const created = await addSubtaskAttachment({
          task_id: task.id,
          subtask_id: uploadTargetSubtaskId,
          uploaded_by: currentUser.id,
          file_name: subtaskSelectedFile.name,
          file_url: localUrl,
          file_type: subtaskSelectedFile.type,
          file_size_bytes: subtaskSelectedFile.size,
        })
        if (created) {
          setTask((prev) => {
            if (!prev) return null
            return {
              ...prev,
              subtasks: (prev.subtasks || []).map((st) =>
                st.id === uploadTargetSubtaskId
                  ? { ...st, attachments: [...(st.attachments || []), created] }
                  : st
              ),
            }
          })
          toast.success("Bukti tahapan berhasil diunggah!")
        } else {
          toast.error("Gagal mengunggah bukti tahapan.")
        }
      } else {
        const { data: { publicUrl } } = supabase.storage.from("task-attachments").getPublicUrl(path)
        const created = await addSubtaskAttachment({
          task_id: task.id,
          subtask_id: uploadTargetSubtaskId,
          uploaded_by: currentUser.id,
          file_name: subtaskSelectedFile.name,
          file_url: publicUrl,
          file_type: subtaskSelectedFile.type,
          file_size_bytes: subtaskSelectedFile.size,
        })
        if (created) {
          setTask((prev) => {
            if (!prev) return null
            return {
              ...prev,
              subtasks: (prev.subtasks || []).map((st) =>
                st.id === uploadTargetSubtaskId
                  ? { ...st, attachments: [...(st.attachments || []), created] }
                  : st
              ),
            }
          })
          toast.success("Bukti tahapan berhasil diunggah!")
        } else {
          toast.error("Gagal menyimpan metadata bukti.")
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengunggah file.")
    } finally {
      setIsSubtaskUploading(false)
      setIsSubtaskUploadOpen(false)
      setSubtaskSelectedFile(null)
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
    setIsActionLoading(true)
    try {
      const ok = await submitTaskForReview(task.id, currentUser.id, submitNotes)
      if (ok) {
        toast.success("Tugas diajukan untuk review atasan!")
        setIsSubmitReviewOpen(false)
        loadTaskData()
        onTaskUpdated?.()
      }
    } catch (err) {
      toast.error("Gagal mengajukan review")
    } finally {
      setIsActionLoading(false)
    }
  }

  // Supervisor Approve Task
  const handleApprove = async () => {
    if (!task || !currentUser) return
    if (!canApprove) {
      toast.error("Hanya atasan atau delegator tugas yang berhak menyetujui tugas ini.")
      return
    }
    setIsActionLoading(true)
    try {
      const ok = await approveTask(task.id, currentUser.id)
      if (ok) {
        toast.success("Tugas Disetujui & Selesai!")
        loadTaskData()
        onTaskUpdated?.()
      }
    } catch (err) {
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
    setIsActionLoading(true)
    try {
      const ok = await returnTaskForRevision(task.id, currentUser.id, revisionNotes)
      if (ok) {
        toast.warning("Tugas dikembalikan untuk revisi.")
        setIsRevisionOpen(false)
        setRevisionNotes("")
        loadTaskData()
        onTaskUpdated?.()
      }
    } catch (err) {
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
        loadTaskData()
        onTaskUpdated?.()
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
    setIsActionLoading(true)
    try {
      if (!task.assigned_to) {
        const ok = await claimTask(task.id, currentUser.id)
        if (ok) {
          toast.success("Tugas berhasil diambil & mulai dikerjakan!")
          loadTaskData()
          onTaskUpdated?.()
        } else {
          toast.error("Gagal mengambil tugas.")
        }
      } else {
        const ok = await updateTaskStatus(task.id, "in_progress", currentUser.id)
        if (ok) {
          toast.success("Tugas mulai dikerjakan (Dalam Pengerjaan)!")
          loadTaskData()
          onTaskUpdated?.()
        } else {
          toast.error("Gagal memperbarui status tugas.")
        }
      }
    } catch (err) {
      console.error(err)
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
              <Button size="sm" variant="outline" onClick={loadTaskData}>
                Coba Lagi
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-full">
            {/* Top Navigation Bar (Clean & Minimalist) */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-5 py-3">
              {/* Left: Clean Ticket Code */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                  {task.ticket_code}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {task.channel?.name || "Divisi Operasional"}
                </span>
              </div>

              {/* Right: Clean Compact Action Buttons */}
              <div className="flex items-center gap-1.5">
                {!isEditing && !isStaff && task.status !== "done" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenDelegate?.(task)}
                    className="h-7 px-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg gap-1 cursor-pointer"
                  >
                    <CornerDownRightIcon className="size-3.5" />
                    <span>Delegasikan</span>
                  </Button>
                )}

                {!isEditing && !isStaff && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEdit}
                    className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg gap-1 cursor-pointer"
                  >
                    <PencilIcon className="size-3.5" />
                    <span>Edit</span>
                  </Button>
                )}

                {!isEditing && !isStaff && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDeleteTaskOpen(true)}
                    className="size-7 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    title="Hapus Penugasan"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
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

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Pelaksana Tugas (PIC)
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
                {/* 1. Task Title */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
                    {task.title}
                  </h2>
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
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <UserCheckIcon className="size-3.5 text-muted-foreground/70" />
                      Pelaksana (PIC)
                    </span>
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <img
                          src={
                            task.assignee.avatar_url ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                          }
                          alt={task.assignee.nama}
                          className="size-4.5 rounded-full object-cover"
                        />
                        <span className="font-bold text-foreground">
                          {task.assignee.nama}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-amber-600 text-[11px]">
                        Belum Ditugaskan
                      </span>
                    )}
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
                  <div className="flex items-center justify-between py-1.5 last:pb-0">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
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

                {/* 5. TAB BAR: Subtasks [ count ] | Comments [ count ] | Lampiran [ count ] */}
                <div className="pt-2">
                  <div className="flex items-center border-b border-border/80 gap-6">
                    {/* Subtasks Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab("subtasks")}
                      className={`flex items-center gap-2 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer -mb-px ${
                        activeDetailTab === "subtasks"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <span>Subtasks</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums leading-none ${
                          activeDetailTab === "subtasks"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-300 border border-red-100 dark:border-red-900/50"
                            : "bg-muted text-muted-foreground border border-border/40"
                        }`}
                      >
                        {subtasks.length}
                      </span>
                    </button>

                    {/* Comments Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab("comments")}
                      className={`flex items-center gap-2 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer -mb-px ${
                        activeDetailTab === "comments"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <span>Comments</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums leading-none ${
                          activeDetailTab === "comments"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-300 border border-red-100 dark:border-red-900/50"
                            : "bg-muted text-muted-foreground border border-border/40"
                        }`}
                      >
                        {(task.comments || []).length}
                      </span>
                    </button>

                    {/* Lampiran Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab("attachments")}
                      className={`flex items-center gap-2 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer -mb-px ${
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
                        {(task.attachments || []).length}
                      </span>
                    </button>
                  </div>

                  {/* TAB CONTENT: SUBTASKS — Sequential Approval Workflow */}
                  {activeDetailTab === "subtasks" && (
                    <div className="space-y-3 pt-3">
                      {/* Progress header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Progres: {completedSubtasks}/{subtasks.length} Disetujui ({progressPercent}%)
                        </span>
                        {subtasks.some(s => s.approval_status === 'rejected') && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                            <XCircleIcon className="size-3" />
                            Ada tahap yang dikembalikan
                          </span>
                        )}
                      </div>

                      {/* Hidden file input for subtask attachment */}
                      <input
                        ref={subtaskFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleSubtaskFileChange}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />

                      {/* Stepper Items */}
                      <div className="space-y-2">
                        {subtasks.map((st, idx) => {
                          // A subtask is "unlocked" if:
                          // - It's the first step, OR
                          // - All previous steps are approved
                          const allPrevApproved = subtasks
                            .slice(0, idx)
                            .every(s => s.approval_status === 'approved')
                          const isUnlocked = idx === 0 || allPrevApproved
                          const isApproved = st.approval_status === 'approved'
                          const isRejected = st.approval_status === 'rejected'
                          const isPending = !isApproved && !isRejected

                          return (
                            <div
                              key={st.id}
                              className={`rounded-xl border transition-all ${
                                isApproved
                                  ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50"
                                  : isRejected
                                  ? "bg-red-50/60 border-red-200 dark:bg-red-950/30 dark:border-red-800/50"
                                  : !isUnlocked
                                  ? "bg-muted/20 border-border/40 opacity-60"
                                  : "bg-card border-border"
                              }`}
                            >
                              {/* Step Header */}
                              <div className="flex items-center gap-2.5 px-3 py-2.5">
                                {/* Step number / status icon */}
                                <div className={`flex items-center justify-center size-6 rounded-full shrink-0 text-[10px] font-bold border-2 ${
                                  isApproved
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : isRejected
                                    ? "bg-red-500 border-red-500 text-white"
                                    : !isUnlocked
                                    ? "bg-muted border-border/60 text-muted-foreground"
                                    : "bg-background border-red-400 text-red-600 dark:border-red-600 dark:text-red-400"
                                }`}>
                                  {isApproved ? (
                                    <ShieldCheckIcon className="size-3.5" />
                                  ) : isRejected ? (
                                    <XCircleIcon className="size-3.5" />
                                  ) : !isUnlocked ? (
                                    <LockIcon className="size-3" />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-semibold truncate ${
                                    isApproved ? "text-emerald-700 dark:text-emerald-400 line-through"
                                    : isRejected ? "text-red-700 dark:text-red-400"
                                    : !isUnlocked ? "text-muted-foreground"
                                    : "text-foreground"
                                  }`}>
                                    {st.title}
                                  </p>
                                  {isApproved && st.approved_at && (
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                                      ✓ Disetujui {new Date(st.approved_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                  )}
                                  {isRejected && st.rejection_note && (
                                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 italic">
                                      ↩ {st.rejection_note}
                                    </p>
                                  )}
                                  {!isUnlocked && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      Selesaikan tahap sebelumnya terlebih dahulu
                                    </p>
                                  )}
                                </div>

                                {/* Approval status badge */}
                                {isApproved && (
                                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    Disetujui
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800">
                                    Ditolak
                                  </span>
                                )}
                                {isPending && isUnlocked && (
                                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    Menunggu
                                  </span>
                                )}

                                {/* Action buttons */}
                                {!isStaff && isUnlocked && !isApproved && canApprove && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      title="Setujui tahap ini"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setApprovalTargetSubtask(st)
                                        setIsApprovalDialogOpen(true)
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      <ThumbsUpIcon className="size-3" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Kembalikan untuk revisi"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setApprovalTargetSubtask(st)
                                        setIsRejectionDialogOpen(true)
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      <ThumbsDownIcon className="size-3" />
                                    </button>
                                  </div>
                                )}

                                {/* Delete button (admin/non-staff only, not if approved) */}
                                {!isStaff && !isApproved && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteSubtask(st.id, e)}
                                    className="shrink-0 text-muted-foreground hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Hapus tahap"
                                  >
                                    <Trash2Icon className="size-3" />
                                  </button>
                                )}
                              </div>

                              {/* File attachments per step — only show when unlocked */}
                              {isUnlocked && (
                                <div className="border-t border-border/40 px-3 py-2 space-y-1.5">
                                  {/* Existing attachments */}
                                  {(st.attachments || []).length > 0 && (
                                    <div className="space-y-1">
                                      {(st.attachments || []).map((att) => (
                                        <div key={att.id} className="flex items-center gap-1.5 text-[11px] group">
                                          {att.file_name.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                            <ImageIcon className="size-3 text-emerald-600 shrink-0" />
                                          ) : (
                                            <FileTextIcon className="size-3 text-blue-600 shrink-0" />
                                          )}
                                          <a
                                            href={att.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="truncate flex-1 text-blue-600 hover:underline"
                                            title={att.file_name}
                                          >
                                            {att.file_name}
                                          </a>
                                          {!isApproved && (
                                            <button
                                              type="button"
                                              onClick={(e) => handleDeleteSubtaskAttachment(att.id, st.id, e)}
                                              className="shrink-0 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                              <Trash2Icon className="size-3" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Upload button — only for assignee or staff when step is not approved */}
                                  {!isApproved && (currentUser?.id === task?.assigned_to || isStaff) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUploadTargetSubtaskId(st.id)
                                        subtaskFileInputRef.current?.click()
                                      }}
                                      className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors"
                                    >
                                      <UploadIcon className="size-3" />
                                      {(st.attachments || []).length > 0 ? "Tambah bukti" : "Lampirkan bukti tahap ini"}
                                    </button>
                                  )}

                                  {(st.attachments || []).length === 0 && isApproved && (
                                    <p className="text-[10px] text-muted-foreground italic">Tidak ada lampiran.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {subtasks.length === 0 && (
                          <p className="text-xs text-muted-foreground italic py-1">
                            {isStaff ? "Belum ada tahapan yang ditentukan." : "Belum ada tahapan. Tambahkan di bawah."}
                          </p>
                        )}
                      </div>

                      {/* Add Stage Form — hidden for staff */}
                      {!isStaff && (
                        <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 pt-1">
                          <Input
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            placeholder="Tambah tahapan baru..."
                            className="h-8 rounded-lg text-xs bg-muted/20"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold bg-foreground text-background shrink-0 cursor-pointer"
                          >
                            <PlusIcon className="size-3" />
                          </Button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: COMMENTS */}
                  {activeDetailTab === "comments" && (
                    <div className="space-y-2.5 pt-3">
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {(task.comments || []).map((cmt) => (
                          <div
                            key={cmt.id}
                            className="group p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-foreground">
                                {cmt.user?.nama || "User"}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">
                                  {cmt.created_at
                                    ? new Date(cmt.created_at).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                                {!isStaff && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(cmt.id)}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 p-0.5 transition-opacity cursor-pointer"
                                    title="Hapus komentar"
                                  >
                                    <Trash2Icon className="size-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground text-[11px] leading-relaxed">
                              {cmt.comment}
                            </p>
                          </div>
                        ))}
                        {(task.comments || []).length === 0 && (
                          <p className="text-xs text-muted-foreground italic py-1">
                            Belum ada komentar.
                          </p>
                        )}
                      </div>

                      <form onSubmit={handleSendComment} className="flex items-center gap-1.5 pt-1">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Tulis pesan atau catatan..."
                          className="h-8 rounded-lg text-xs bg-muted/20"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingComment || !commentText.trim()}
                          className="h-8 px-3 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shrink-0 cursor-pointer"
                        >
                          <SendIcon className="size-3" />
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* TAB CONTENT: ATTACHMENTS / LAMPIRAN */}
                  {activeDetailTab === "attachments" && (
                    <div className="space-y-2.5 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">
                          Berkas & Bukti Terlampir
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedFile(null)
                            setUploadFileName("")
                            setUploadAmount("")
                            setIsUploadOpen(true)
                          }}
                          className="h-6 px-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded gap-1 cursor-pointer"
                        >
                          <UploadIcon className="size-3" /> Unggah File
                        </Button>
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {(task.attachments || []).map((att) => (
                          <div
                            key={att.id}
                            className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between text-xs group hover:border-blue-300 transition-colors"
                          >
                            <a
                              href={att.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 min-w-0 flex-1 hover:text-blue-600 transition-colors"
                              title="Buka / lihat file"
                            >
                              {att.attachment_type === "receipt_nota" ? (
                                <ReceiptIcon className="size-4 text-amber-600 shrink-0" />
                              ) : att.file_name.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                <ImageIcon className="size-4 text-emerald-600 shrink-0" />
                              ) : (
                                <FileTextIcon className="size-4 text-blue-600 shrink-0" />
                              )}
                              <span className="truncate font-medium text-foreground">
                                {att.file_name}
                              </span>
                              <ExternalLinkIcon className="size-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>

                            <div className="flex items-center gap-2 shrink-0 pl-2">
                              {att.amount && (
                                <span className="text-[11px] font-bold text-emerald-600">
                                  Rp {att.amount.toLocaleString("id-ID")}
                                </span>
                              )}
                              {!isStaff && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttachment(att.id)}
                                  className="text-muted-foreground hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Hapus lampiran"
                                >
                                  <Trash2Icon className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {(task.attachments || []).length === 0 && (
                          <p className="text-xs text-muted-foreground italic py-1">
                            Belum ada lampiran file atau foto.
                          </p>
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

            {/* DIALOG: SUBTASK FILE UPLOAD CONFIRMATION */}
            <Dialog open={isSubtaskUploadOpen} onOpenChange={(o) => { if (!o) { setIsSubtaskUploadOpen(false); setSubtaskSelectedFile(null); if (subtaskFileInputRef.current) subtaskFileInputRef.current.value = "" } }}>
              <DialogContent className="max-w-sm rounded-xl p-4 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <UploadIcon className="size-4 text-blue-600" />
                    Unggah Bukti Tahapan
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    File ini akan dilampirkan ke tahap yang sedang dikerjakan.
                  </DialogDescription>
                </DialogHeader>

                {subtaskSelectedFile && (
                  <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
                    <p className="font-semibold text-foreground truncate">{subtaskSelectedFile.name}</p>
                    <p className="text-muted-foreground">
                      {(subtaskSelectedFile.size / 1024).toFixed(1)} KB — {subtaskSelectedFile.type || "File"}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => { setIsSubtaskUploadOpen(false); setSubtaskSelectedFile(null); if (subtaskFileInputRef.current) subtaskFileInputRef.current.value = "" }}
                    disabled={isSubtaskUploading}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    onClick={handleSubtaskUploadConfirm}
                    disabled={isSubtaskUploading}
                  >
                    {isSubtaskUploading ? (
                      <><Loader2Icon className="size-3 animate-spin" /> Mengunggah...</>
                    ) : (
                      <><UploadIcon className="size-3" /> Unggah</>
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

