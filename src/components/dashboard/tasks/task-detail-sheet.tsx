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
  MessageSquareQuoteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HistoryIcon,
  FileCheckIcon,
  MoreHorizontalIcon,
  CheckIcon,
  EyeIcon,
  DownloadIcon,
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
  canUserApproveTask,
  toggleSubtask,
  addSubtask,
  deleteSubtask,
  addSubtaskAttachment,
  deleteSubtaskAttachment,
  submitTaskForReview,
  withdrawTaskSubmission,
  clearTaskReviewNotes,
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
  getTaskAssigneeIds,
} from "@/lib/api"
import { TaskDeadlinePicker } from "@/components/dashboard/tasks/task-deadline-picker"
import { useRealtimeTaskDetail } from "@/hooks/use-realtime"

export type { Task as TaskItem } from "@/types/database"

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function PdfIconBadge() {
  return (
    <div className="size-11 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="size-10" fill="none">
        <path
          d="M10 6C7.79 6 6 7.79 6 10V34C6 36.21 7.79 38 10 38H34C36.21 38 38 36.21 38 34V16L28 6H10Z"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="fill-red-50/70 dark:fill-red-950/30"
        />
        <path
          d="M28 6V16H38"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 30C15.8 24.5 19 19.5 22.5 19.5C26 19.5 27 22.5 25 24.8C23.2 26.8 19 27 14 30ZM14 30C16.5 31.2 19 31.8 21 30M25 24.8C27.5 26.5 30 28.2 32 29.5"
          stroke="#DC2626"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function PptIconBadge() {
  return (
    <div className="size-11 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="size-10" fill="none">
        <rect x="14" y="7" width="23" height="30" rx="3" fill="#D04423" />
        <circle cx="25.5" cy="18" r="5" fill="#FFC9B6" />
        <path d="M25.5 13A5 5 0 0 1 30.5 18H25.5V13Z" fill="#FFF" />
        <rect x="18" y="26.5" width="14" height="2.2" rx="1" fill="#FFF" opacity="0.9" />
        <rect x="18" y="30.5" width="9" height="2.2" rx="1" fill="#FFF" opacity="0.9" />
        <rect x="7" y="10" width="14" height="24" rx="2.5" fill="#EA580C" />
        <text x="10.5" y="26.5" fill="white" fontSize="15" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">P</text>
      </svg>
    </div>
  )
}

function XlsIconBadge() {
  return (
    <div className="size-11 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="size-10" fill="none">
        <rect x="14" y="7" width="23" height="30" rx="3" fill="#107C41" />
        <rect x="18" y="13" width="14" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="18" y="17.5" width="14" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="18" y="22" width="14" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="18" y="26.5" width="14" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="7" y="10" width="14" height="24" rx="2.5" fill="#16A34A" />
        <text x="10" y="26.5" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">X</text>
      </svg>
    </div>
  )
}

function DocIconBadge() {
  return (
    <div className="size-11 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="size-10" fill="none">
        <rect x="14" y="7" width="23" height="30" rx="3" fill="#185ABD" />
        <rect x="18" y="13.5" width="14" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="18" y="18" width="14" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="18" y="22.5" width="14" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="18" y="27" width="9" height="2.2" rx="0.5" fill="#FFF" opacity="0.9" />
        <rect x="7" y="10" width="14" height="24" rx="2.5" fill="#2563EB" />
        <text x="8.5" y="26.5" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">W</text>
      </svg>
    </div>
  )
}

function ImageIconBadge() {
  return (
    <div className="size-11 rounded-xl bg-sky-50 border border-sky-200/90 dark:bg-sky-950/40 dark:border-sky-800/60 shrink-0 flex items-center justify-center shadow-2xs">
      <svg viewBox="0 0 24 24" className="size-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="3.5" ry="3.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  )
}

function ZipIconBadge() {
  return (
    <div className="size-11 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-900/60 shrink-0 flex items-center justify-center shadow-2xs">
      <svg viewBox="0 0 32 32" className="size-6 text-purple-600" fill="none" stroke="currentColor">
        <path d="M8 4a2 2 0 00-2 2v20a2 2 0 002 2h16a2 2 0 002-2V10.828a2 2 0 00-.586-1.414l-6.828-6.828A2 2 0 0017.172 4H8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z" fill="currentColor" />
      </svg>
    </div>
  )
}

function GenericFileBadge({ ext }: { ext: string }) {
  return (
    <div className="size-11 rounded-lg bg-slate-100 border border-slate-200 dark:bg-neutral-800 dark:border-neutral-700 shrink-0 flex flex-col items-center justify-center shadow-2xs">
      <FileTextIcon className="size-4.5 text-slate-600 dark:text-neutral-400" />
      {ext && (
        <span className="text-[8.5px] font-bold uppercase text-slate-500 dark:text-neutral-400 mt-0.5 leading-none">
          {ext.slice(0, 4)}
        </span>
      )}
    </div>
  )
}

function getFileExtension(fileName: string = "", fileUrl: string = ""): string {
  const cleanUrl = (fileUrl || "").split("?")[0].split("#")[0]

  // 1. Check extension from fileName
  if (fileName && fileName.includes(".")) {
    const ext = fileName.split(".").pop()?.toLowerCase().trim()
    if (ext && ext.length <= 5) return ext
  }
  // 2. Check extension from fileUrl
  if (cleanUrl && cleanUrl.includes(".")) {
    const ext = cleanUrl.split(".").pop()?.toLowerCase().trim()
    if (ext && ext.length <= 5) return ext
  }
  // 3. Fallback keywords in fileName or fileUrl
  const combined = `${fileName} ${cleanUrl}`.toLowerCase()
  if (combined.includes(".pdf") || combined.includes("pdf")) return "pdf"
  if (
    combined.includes(".jpg") ||
    combined.includes(".jpeg") ||
    combined.includes(".png") ||
    combined.includes(".webp") ||
    combined.includes(".gif") ||
    combined.includes("foto") ||
    combined.includes("gambar") ||
    combined.includes("image") ||
    combined.includes("bukti")
  ) {
    return "jpg"
  }
  if (combined.includes(".ppt") || combined.includes(".pptx")) return "pptx"
  if (combined.includes(".xls") || combined.includes(".xlsx") || combined.includes(".csv")) return "xlsx"
  if (combined.includes(".doc") || combined.includes(".docx")) return "docx"
  if (combined.includes(".zip") || combined.includes(".rar")) return "zip"
  return ""
}

function FileTypeBadge({ fileName, fileUrl }: { fileName: string; fileUrl?: string }) {
  const ext = getFileExtension(fileName, fileUrl)
  if (["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "heic", "heif", "tiff"].includes(ext)) {
    return <ImageIconBadge />
  }
  if (ext === "pdf") return <PdfIconBadge />
  if (["ppt", "pptx", "key", "odp"].includes(ext)) return <PptIconBadge />
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return <XlsIconBadge />
  if (["doc", "docx", "rtf", "odt", "txt"].includes(ext)) return <DocIconBadge />
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <ZipIconBadge />
  return <GenericFileBadge ext={ext} />
}

interface AttachmentCardProps {
  fileName: string
  fileUrl: string
  fileSizeBytes?: number | null
  onPreview: () => void
  onDelete?: () => void
  canDelete?: boolean
}

function AttachmentCard({
  fileName,
  fileUrl,
  fileSizeBytes,
  onPreview,
  onDelete,
  canDelete,
}: AttachmentCardProps) {
  const sizeText = formatFileSize(fileSizeBytes)

  return (
    <div
      onClick={onPreview}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onPreview()
        }
      }}
      className="p-2.5 sm:p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/30 hover:border-border transition-all flex items-center justify-between gap-3 shadow-2xs cursor-pointer group text-left"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <FileTypeBadge fileName={fileName} fileUrl={fileUrl} />
        <div className="min-w-0 flex-1">
          <p
            className="text-xs sm:text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors"
            title={fileName}
          >
            {fileName}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            {sizeText && <span>{sizeText}</span>}
            {sizeText && <span>•</span>}
            <span className="text-muted-foreground group-hover:text-primary font-medium inline-flex items-center gap-1 transition-colors">
              <EyeIcon className="size-3" />
              Preview
            </span>
          </div>
        </div>
      </div>

      {canDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 p-1.5 rounded-lg hover:bg-background transition-all cursor-pointer shrink-0 ml-1"
          title="Hapus Lampiran"
        >
          <Trash2Icon className="size-3.5" />
        </button>
      )}
    </div>
  )
}

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
  const [editReviewerId, setEditReviewerId] = React.useState("")
  const [editDeadline, setEditDeadline] = React.useState<Date>(() => new Date())
  const [availableChannels, setAvailableChannels] = React.useState<Channel[]>([])
  const [availableUsers, setAvailableUsers] = React.useState<User[]>([])
  const [allUsersList, setAllUsersList] = React.useState<User[]>([])
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

  // Subtask comments state
  const [subtaskCommentInputs, setSubtaskCommentInputs] = React.useState<Record<string, string>>({})
  const [subtaskCommentsExpanded, setSubtaskCommentsExpanded] = React.useState<Record<string, boolean>>({})
  const [isSubmittingSubtaskComment, setIsSubmittingSubtaskComment] = React.useState<Record<string, boolean>>({})

  // Per-subtask file upload state (Supports multiple files/photos)
  const subtaskFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploadTargetSubtaskId, setUploadTargetSubtaskId] = React.useState<string | null>(null)
  const [subtaskSelectedFiles, setSubtaskSelectedFiles] = React.useState<File[]>([])
  const [isSubtaskUploadOpen, setIsSubtaskUploadOpen] = React.useState(false)
  const [isSubtaskUploading, setIsSubtaskUploading] = React.useState(false)

  // Attachment preview modal
  const [previewAttachment, setPreviewAttachment] = React.useState<{ url: string; name: string } | null>(null)


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

  // Real-time synchronization for subtasks, comments, and task modifications
  useRealtimeTaskDetail(
    open ? taskId : null,
    React.useCallback(() => {
      loadTaskData(true)
      onTaskUpdated?.()
    }, [loadTaskData, onTaskUpdated])
  )

  // Load Channels & Users when entering edit mode
  const handleStartEdit = async () => {
    if (!task) return
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditChannelId(task.channel_id || "")
    setEditPriority(task.priority)
    setEditAssignedTo(task.assigned_to || "")
    setEditSecondaryAssignedTo(task.secondary_assigned_to || "")
    setEditReviewerId(task.reviewer_id || "")
    setEditDeadline(task.deadline_at ? new Date(task.deadline_at) : new Date())

    try {
      const [chs, usrs] = await Promise.all([getChannels(), getAllUsers()])
      setAvailableChannels(chs)
      setAllUsersList(usrs)

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

  // Reviewer candidates eligible based on hierarchy and assignee exclusion
  const eligibleReviewers = React.useMemo(() => {
    if (allUsersList.length === 0) return []
    const currentAssigneeIds = [editAssignedTo, editSecondaryAssignedTo].filter(Boolean)

    const selectedAssignees = currentAssigneeIds
      .map((id) => allUsersList.find((u) => u.id === id))
      .filter((u): u is User => Boolean(u))

    let requiredLevel = 1
    if (selectedAssignees.length > 0) {
      const maxAssigneeLevel = Math.max(
        ...selectedAssignees.map((u) => ROLE_HIERARCHY_LEVEL[u.role] ?? 1)
      )
      requiredLevel = maxAssigneeLevel
    }

    const candidates = allUsersList.filter((u) => {
      if (currentAssigneeIds.includes(u.id)) return false
      if (u.role === "admin") return true
      const uLevel = ROLE_HIERARCHY_LEVEL[u.role] ?? 1
      return uLevel > requiredLevel
    })

    const result =
      candidates.length > 0
        ? candidates
        : allUsersList.filter((u) => (u.role === "admin" || u.role === "manager") && !currentAssigneeIds.includes(u.id))

    return result.sort((a, b) => {
      const diff = (ROLE_HIERARCHY_LEVEL[a.role] ?? 1) - (ROLE_HIERARCHY_LEVEL[b.role] ?? 1)
      if (diff !== 0) return diff
      return a.nama.localeCompare(b.nama)
    })
  }, [allUsersList, editAssignedTo, editSecondaryAssignedTo])

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
          reviewer_id: editReviewerId || null,
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

    // 1. Validasi review ke done: Hanya atasan/reviewer
    if (newStatus === "done" && task.status === "review" && !canApprove) {
      toast.error("Hanya atasan atau delegator tugas yang berhak menyetujui tugas ini.")
      return
    }

    // 2. Validasi kelengkapan subtask: Semua tahapan wajib dicentang selesai sebelum diajukan review / selesai
    const uncompletedSubtasks = (task.subtasks || []).filter((s) => !s.is_completed)
    if ((newStatus === "review" || newStatus === "done") && uncompletedSubtasks.length > 0 && currentUser?.role !== "admin") {
      toast.error("Seluruh tahapan subtask belum selesai!", {
        description: `Masih ada ${uncompletedSubtasks.length} tahapan pekerjaan yang belum dicentang. Selesaikan seluruh tahapan sebelum melanjutkan.`,
      })
      return
    }

    // 3. Validasi alur: Tidak bisa langsung lompat ke done tanpa melalui review
    if (newStatus === "done" && task.status !== "review" && currentUser?.role !== "admin") {
      toast.error("Tugas tidak dapat langsung diselesaikan!", {
        description: "Ajukan ke status 'Review Atasan' terlebih dahulu agar pekerjaan dapat diverifikasi.",
      })
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

  // Hak menyetujui (Approve / Reject):
  // Diberikan kepada PIC Review (reviewer_id), Delegator, Atasan Langsung, atau Admin/SGM.
  // Pelaksana tugas MUTLAK dilarang menyetujui tugasnya sendiri.
  // Hak menyetujui (Approve / Reject):
  // Menggunakan helper terpusat canUserApproveTask
  const canApprove = React.useMemo(() => {
    return canUserApproveTask(task, currentUser)
  }, [currentUser, task])

  // Memeriksa apakah user saat ini adalah pelaksana tugas (yang mengerjakan)
  const isAssignee = React.useMemo(() => {
    if (!currentUser || !task) return false
    return getTaskAssigneeIds(task).includes(currentUser.id)
  }, [currentUser, task])

  // Memeriksa apakah user berhak mengajukan review (Pelaksana, Pembuat tugas, atau Admin)
  const canSubmitReview = React.useMemo(() => {
    if (!currentUser || !task) return false
    if (currentUser.role === "admin") return true
    if (task.created_by === currentUser.id) return true
    return getTaskAssigneeIds(task).includes(currentUser.id)
  }, [currentUser, task])

  // Nama atasan / reviewer yang berhak me-review
  const reviewerName = React.useMemo(() => {
    if (!task) return "Atasan Penilai"
    const assigneeIds = getTaskAssigneeIds(task)

    // 1. PIC Review resmi yang ditunjuk (jika bukan pelaksana)
    if (task.reviewer?.nama && !assigneeIds.includes(task.reviewer.id)) {
      return task.reviewer.nama
    }
    // 2. Delegator tugas (jika bukan pelaksana)
    if (task.delegator?.nama && !assigneeIds.includes(task.delegator.id)) {
      return task.delegator.nama
    }
    // 3. Atasan langsung si pelaksana tugas (jika bukan pelaksana)
    if (task.assignee?.supervisor?.nama && !assigneeIds.includes(task.assignee.supervisor.id)) {
      return task.assignee.supervisor.nama
    }
    // 4. Pembuat tugas (hanya jika pembuat bukan pelaksana)
    if (task.creator?.nama && !assigneeIds.includes(task.creator.id)) {
      return task.creator.nama
    }
    return "Atasan Penilai"
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

  // Cek apakah review_notes berasal dari atasan (revisi) atau dari pelaksana sendiri (ditarik mandiri / draft)
  const isSupervisorRevision = React.useMemo(() => {
    if (!task?.review_notes || task.status !== "in_progress") return false
    const comments = task.comments || []
    const lastReviewAction = [...comments].reverse().find(
      (c) =>
        c.comment.includes("dikembalikan untuk revisi") ||
        c.comment.includes("ditarik kembali") ||
        c.comment.includes("disubmit untuk review")
    )
    if (!lastReviewAction) return false
    return lastReviewAction.comment.includes("dikembalikan untuk revisi")
  }, [task?.review_notes, task?.status, task?.comments])

  // Sinkronisasi otomatis submitNotes saat modal pengajuan dibuka jika sudah ada catatan sebelumnya
  React.useEffect(() => {
    if (isSubmitReviewOpen && !submitNotes && task?.review_notes) {
      setSubmitNotes(task.review_notes)
    }
  }, [isSubmitReviewOpen, submitNotes, task?.review_notes])

  const totalSubtaskAttachmentsCount = React.useMemo(() => {
    return (task?.subtasks || []).reduce((acc, st) => acc + (st.attachments || []).length, 0)
  }, [task?.subtasks])

  const totalAttachmentsCount = React.useMemo(() => {
    return totalSubtaskAttachmentsCount + (task?.attachments || []).length
  }, [totalSubtaskAttachmentsCount, task?.attachments])

  // Helper untuk mengecek apakah tugas sudah memiliki bukti yang diunggah
  const hasUploadedEvidence = totalAttachmentsCount > 0

  // Subtask Toggle Handler
  const handleToggleSubtask = async (st: Subtask) => {
    if (!task) return
    const nextState = !st.is_completed

    // Auto-transisi status: Jika tugas masih unassigned/todo dan dikerjakan/diisi subtask-nya,
    // langsung ubah status menjadi 'in_progress' (Sedang Dikerjakan)
    const shouldAutoStart = (task.status === "todo" || task.status === "unassigned") && nextState

    const ok = await toggleSubtask(st.id, nextState)
    if (ok) {
      if (shouldAutoStart) {
        await updateTaskStatus(task.id, "in_progress", currentUser?.id)
        toast.info("Tugas otomatis dipindahkan ke 'Dalam Pengerjaan' karena Anda mulai mengisi subtask!")
      }

      setTask((prev) => {
        if (!prev) return null
        return {
          ...prev,
          status: shouldAutoStart ? "in_progress" : prev.status,
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
        // Auto-transisi status: Jika subtask baru ditambahkan saat status masih todo/unassigned,
        // otomatis ubah status tiket jadi 'in_progress'
        const shouldAutoStart = task.status === "todo" || task.status === "unassigned"
        if (shouldAutoStart) {
          await updateTaskStatus(task.id, "in_progress", currentUser?.id)
          toast.info("Tugas otomatis dipindahkan ke 'Dalam Pengerjaan' karena Anda menambahkan tahapan subtask!")
        }

        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            status: shouldAutoStart ? "in_progress" : prev.status,
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
      const { uploadFileToStorage } = await import("@/lib/api")
      const uploadedAttachments: SubtaskAttachment[] = []

      for (const file of subtaskSelectedFiles) {
        const fileUrl = await uploadFileToStorage(file, `subtask-attachments/${uploadTargetSubtaskId}`)

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
        // Auto-transisi status: Jika bukti diunggah saat status masih todo/unassigned,
        // otomatis ubah status tiket jadi 'in_progress'
        const shouldAutoStart = task.status === "todo" || task.status === "unassigned"
        if (shouldAutoStart) {
          await updateTaskStatus(task.id, "in_progress", currentUser.id)
          toast.info("Tugas otomatis dipindahkan ke 'Dalam Pengerjaan' karena Anda mengunggah bukti!")
        }

        setTask((prev) => {
          if (!prev) return null
          return {
            ...prev,
            status: shouldAutoStart ? "in_progress" : prev.status,
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
  const handleDeleteSubtaskAttachment = async (attachId: string, subtaskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
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

    // VALIDASI WAJIB: Seluruh tahapan subtask harus diselesaikan jika ada subtask
    const uncompletedSubtasks = (task.subtasks || []).filter((s) => !s.is_completed)
    if (uncompletedSubtasks.length > 0 && currentUser.role !== "admin") {
      toast.error("Seluruh tahapan subtask belum selesai!", {
        description: `Masih ada ${uncompletedSubtasks.length} tahapan pekerjaan yang belum dicentang. Selesaikan seluruh tahapan sebelum mengajukan review ke atasan.`,
      })
      setIsSubmitReviewOpen(false)
      return
    }

    // VALIDASI WAJIB: Ringkasan hasil kerja wajib diisi (minimal 10 karakter)
    const trimmedNotes = submitNotes.trim()
    if ((!trimmedNotes || trimmedNotes.length < 10) && currentUser.role !== "admin") {
      toast.error("Ringkasan hasil kerja wajib diisi!", {
        description: "Tuliskan ringkasan hasil pekerjaan minimal 10 karakter agar atasan memahami apa yang telah diselesaikan.",
      })
      return
    }

    const prevStatus = task.status
    const prevNotes = task.review_notes

    // Optimistic Update
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: "review",
            review_notes: trimmedNotes,
          }
        : null
    )
    setIsSubmitReviewOpen(false)
    setIsActionLoading(true)
    try {
      const ok = await submitTaskForReview(task.id, currentUser.id, trimmedNotes)
      if (ok) {
        toast.success("Tugas diajukan untuk review atasan! ⏳")
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

  // Pelaksana membatalkan / menarik kembali pengajuan review sebelum di-ACC atasan
  const handleCancelReview = async () => {
    if (!task || !currentUser) return

    const prevStatus = task.status
    const prevReviewNotes = task.review_notes

    // Instant optimistic update (pertahankan review_notes sebagai draft agar tidak hilang)
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: "in_progress",
          }
        : null
    )
    setIsActionLoading(true)
    try {
      const ok = await withdrawTaskSubmission(task.id, currentUser.id)
      if (ok) {
        toast.info("Pengajuan review berhasil ditarik kembali ke 'Dalam Pengerjaan'. Silakan lengkapi berkas atau tahapan Anda.")
        onTaskUpdated?.()
        loadTaskData(true)
      } else {
        throw new Error("Gagal menarik pengajuan review.")
      }
    } catch (err) {
      setTask((prev) =>
        prev
          ? { ...prev, status: prevStatus, review_notes: prevReviewNotes }
          : null
      )
      toast.error("Terjadi kendala saat menarik pengajuan review.")
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
        const { uploadFileToStorage } = await import("@/lib/api")
        fileUrl = await uploadFileToStorage(selectedFile, `task-attachments/${task.id}`)
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
        // Auto-transisi status: Jika berkas bukti diunggah saat status masih todo/unassigned,
        // otomatis ubah status tiket jadi 'in_progress'
        const shouldAutoStart = task.status === "todo" || task.status === "unassigned"
        if (shouldAutoStart) {
          await updateTaskStatus(task.id, "in_progress", currentUser.id)
          toast.info("Tugas otomatis dipindahkan ke 'Dalam Pengerjaan' karena Anda mengunggah berkas bukti!")
        }

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
        className="!inset-y-auto !top-1.5 !bottom-1.5 !right-1.5 sm:!top-2 sm:!bottom-2 sm:!right-2 !h-[calc(100vh-0.75rem)] sm:!h-[calc(100vh-1rem)] !w-[calc(100vw-0.75rem)] sm:!w-[calc(100vw-1rem)] sm:!max-w-lg md:!max-w-xl lg:!max-w-[620px] xl:!max-w-[660px] p-0 !border border-border/80 !rounded-xl sm:!rounded-2xl bg-background font-sans shadow-2xl shadow-black/20 dark:shadow-black/60 overflow-hidden flex flex-col focus:outline-none ring-1 ring-black/5 dark:ring-white/10"
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
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Navigation Bar (Clean, Minimalist & Spacious) */}
            <div className="shrink-0 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-5 py-3 gap-3">
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

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto min-h-0">

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
                              <div className="flex items-center justify-between gap-2 w-full min-w-0">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <img
                                    src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                                    alt={u.nama}
                                    className="size-4.5 rounded-full object-cover shrink-0"
                                  />
                                  <span className="font-medium text-foreground truncate min-w-0 flex-1">{u.nama}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">({ROLE_LABELS[u.role]?.badge || u.role})</span>
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
                                <div className="flex items-center justify-between gap-2 w-full min-w-0">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <img
                                      src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                                      alt={u.nama}
                                      className="size-4.5 rounded-full object-cover shrink-0"
                                    />
                                    <span className="font-medium text-foreground truncate min-w-0 flex-1">{u.nama}</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">({ROLE_LABELS[u.role]?.badge || u.role})</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* PIC Review (Atasan Penilai) */}
                  <div className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                        <ShieldCheckIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
                        PIC Review (Atasan Penilai)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        Atasan yang berwenang mengevaluasi & menyetujui
                      </span>
                    </div>

                    <Select
                      value={editReviewerId || "none"}
                      onValueChange={(val) => setEditReviewerId(val === "none" ? "" : (val || ""))}
                    >
                      <SelectTrigger className="w-full h-8.5 rounded-lg border-border bg-background px-2.5 text-xs font-medium">
                        <div className="flex items-center gap-2 truncate min-w-0">
                          {(() => {
                            const selected = allUsersList.find((u) => u.id === editReviewerId)
                            if (!selected) {
                              return <span className="text-muted-foreground font-medium truncate">Gunakan Default (Atasan Langsung / Delegator)</span>
                            }
                            return (
                              <>
                                <img
                                  src={selected.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                                  alt={selected.nama}
                                  className="size-4.5 rounded-full object-cover shrink-0"
                                />
                                <span className="font-semibold text-foreground truncate min-w-0">{selected.nama}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">({ROLE_LABELS[selected.role]?.badge || selected.role})</span>
                              </>
                            )
                          })()}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="w-full max-h-56">
                        <SelectItem value="none">
                          <span className="text-muted-foreground font-medium">Default (Atasan Langsung / Delegator)</span>
                        </SelectItem>
                        {eligibleReviewers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center justify-between gap-2 w-full min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <img
                                  src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                                  alt={u.nama}
                                  className="size-4.5 rounded-full object-cover shrink-0"
                                />
                                <span className="font-medium text-foreground truncate min-w-0 flex-1">{u.nama}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">({ROLE_LABELS[u.role]?.badge || u.role})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      {(task.assignees && task.assignees.length > 0
                        ? task.assignees
                        : task.assignee
                          ? [task.assignee]
                          : []
                      ).map((u, idx) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60"
                        >
                          <img
                            src={
                              u.avatar_url ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                            }
                            alt={u.nama}
                            className="size-4 rounded-full object-cover shrink-0"
                          />
                          <span className="font-bold text-foreground text-xs">{u.nama}</span>
                          {idx === 0 ? (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">
                              Utama
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20">
                              Rekan
                            </span>
                          )}
                        </div>
                      ))}
                      {!(task.assignees && task.assignees.length > 0) && !task.assignee && (
                        <span className="font-semibold text-amber-600 text-[11px]">
                          Belum Ditugaskan
                        </span>
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

                  {/* PIC Review (Atasan Penilai) */}
                  <div className="flex items-center justify-between py-1.5 gap-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
                      <ShieldCheckIcon className="size-3.5 text-muted-foreground/70" />
                      PIC Review (Atasan)
                    </span>
                    <div className="flex items-center gap-1.5">
                      {task.reviewer ? (
                        <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                          <img
                            src={
                              task.reviewer.avatar_url ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                            }
                            alt={task.reviewer.nama}
                            className="size-4 rounded-full object-cover shrink-0"
                          />
                          <span className="font-bold text-foreground text-xs">{task.reviewer.nama}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                            Penilai
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-foreground text-xs">
                          {reviewerName}
                        </span>
                      )}
                    </div>
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
                  <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3 shadow-xs">
                    {/* Header Baris Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <ShieldCheckIcon className="size-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-xs sm:text-sm">
                              {canApprove
                                ? "Pemeriksaan Akhir Tugas"
                                : "Menunggu Persetujuan Atasan"}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              In Review
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            {canApprove
                              ? "Periksa kelengkapan hasil kerja & berkas bukti pengerjaan sebelum memberikan persetujuan."
                              : task.assigned_to === currentUser?.id
                              ? `Laporan Anda telah diserahkan dan sedang menunggu review dari ${reviewerName}.`
                              : `Tugas sedang menunggu verifikasi dari ${reviewerName}.`}
                          </span>
                        </div>
                      </div>

                      {/* Action Button untuk Atasan/Reviewer atau Pelaksana Tugas (Assignee) */}
                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                        {canApprove && (
                          <>
                            <Button
                              size="sm"
                              onClick={handleApprove}
                              disabled={isActionLoading}
                              className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-xs gap-1.5"
                            >
                              <CheckCircle2Icon className="size-3.5" />
                              <span>Setujui Tugas</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsRevisionOpen(true)}
                              disabled={isActionLoading}
                              className="h-8 px-3 text-xs font-bold text-amber-900 dark:text-amber-200 border-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 rounded-lg cursor-pointer gap-1.5"
                            >
                              <RotateCcwIcon className="size-3.5 text-amber-600" />
                              <span>Minta Revisi</span>
                            </Button>
                          </>
                        )}
                        {isAssignee && !canApprove && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleCancelReview}
                            disabled={isActionLoading}
                            className="h-8 px-3 text-xs font-semibold text-amber-800 dark:text-amber-300 border-amber-300/80 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 rounded-lg cursor-pointer shadow-2xs gap-1.5"
                            title="Tarik kembali pengajuan untuk melengkapi pekerjaan"
                          >
                            <RotateCcwIcon className="size-3.5 text-amber-600" />
                            <span>Tarik Pengajuan</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Card Ringkasan Hasil Kerja Pelaksana */}
                    {task.review_notes && (
                      <div className="rounded-lg bg-background p-3 border border-border/70 shadow-2xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <FileTextIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="text-[11px] font-bold text-foreground">
                            Ringkasan Hasil Kerja Pelaksana
                          </span>
                        </div>
                        <div className="border-l-2 border-amber-500/70 dark:border-amber-400/70 pl-3 py-0.5">
                          <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-normal">
                            {task.review_notes}
                          </p>
                        </div>
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
                          : isAssignee
                          ? "Tugas Ditugaskan Kepada Anda"
                          : `Antrean To Do (PIC: ${task.assignee?.nama || "Karyawan"})`}
                      </span>
                      <span className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                        {!task.assigned_to
                          ? "Ambil tugas ini untuk langsung memulai pengerjaan."
                          : isAssignee
                          ? "Klik untuk mulai mengerjakan tugas ini."
                          : "Menunggu pelaksana memulai pengerjaan tugas."}
                      </span>
                    </div>
                    {/* Tombol Ambil Tugas / Mulai Kerjakan hanya untuk yang mengerjakan */}
                    {(!task.assigned_to || isAssignee) && (
                      <Button
                        size="sm"
                        onClick={handleTakeTask}
                        disabled={isActionLoading}
                        className="h-7 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5 cursor-pointer shrink-0 shadow-xs"
                      >
                        <PlayIcon className="size-3.5 fill-current" />
                        {!task.assigned_to ? "Ambil Tugas" : "Mulai Kerjakan"}
                      </Button>
                    )}
                  </div>
                )}

                {/* Banner 2: In Progress -> Submit Review (Khusus untuk Pelaksana Tugas / Admin) */}
                {task.status === "in_progress" && (
                  <div className="space-y-2">
                    {task.review_notes && (
                      isSupervisorRevision ? (
                        <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-950/40 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                              <AlertTriangleIcon className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Catatan Evaluasi / Permintaan Revisi dari Atasan:</span>
                            </div>
                            {canSubmitReview && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await clearTaskReviewNotes(task.id)
                                  setTask((prev) => (prev ? { ...prev, review_notes: null } : null))
                                  toast.success("Catatan revisi ditandai selesai.")
                                }}
                                className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline font-medium cursor-pointer"
                              >
                                Tandai Selesai
                              </button>
                            )}
                          </div>
                          <div className="italic text-amber-950 dark:text-amber-100 font-medium bg-background/80 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 leading-relaxed">
                            &ldquo;{task.review_notes}&rdquo;
                          </div>
                          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                            Silakan perbaiki tahapan atau berkas terkait di bawah, kemudian klik tombol &quot;Ajukan Ulang Review&quot; setelah selesai.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-sky-950 dark:text-sky-200">
                              <MessageSquareQuoteIcon className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                              <span>Ringkasan Hasil Kerja Anda (Ditarik Mandiri):</span>
                            </div>
                            <span className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold bg-sky-100/90 dark:bg-sky-900/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                              Tersimpan
                            </span>
                          </div>
                          <div className="italic text-foreground font-medium bg-background/90 p-2.5 rounded-lg border border-sky-200 dark:border-sky-800/60 leading-relaxed whitespace-pre-line">
                            &ldquo;{task.review_notes}&rdquo;
                          </div>
                          <p className="text-[11px] text-sky-800 dark:text-sky-300">
                            Catatan ini tersimpan dari pengajuan Anda sebelumnya dan akan otomatis terisi saat Anda mengklik &quot;Ajukan Review ke Atasan&quot;.
                          </p>
                        </div>
                      )
                    )}
                    <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="font-bold text-foreground block">
                          {isAssignee ? "Sedang Anda Kerjakan" : `Sedang Dikerjakan oleh ${task.assignee?.nama || "Pelaksana"}`}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {canSubmitReview
                            ? isSupervisorRevision && task.review_notes
                              ? "Revisi telah selesai dikerjakan? Ajukan kembali untuk direview atasan."
                              : "Lengkapi checklist tahapan & bukti pengerjaan, lalu ajukan review jika telah siap."
                            : "Pelaksana sedang mengerjakan seluruh tahapan & bukti pengerjaan. Menunggu pelaksana mengajukan review akhir."}
                        </span>
                      </div>
                      {/* Tombol Ajukan Review HANYA muncul untuk Pelaksana Tugas / Admin / Pembuat */}
                      {canSubmitReview && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const uncompleted = (task.subtasks || []).filter((s) => !s.is_completed)
                            if (uncompleted.length > 0 && currentUser?.role !== "admin") {
                              toast.error("Tahapan pekerjaan belum selesai!", {
                                description: `Masih ada ${uncompleted.length} tahapan subtask yang belum dicentang selesai. Selesaikan seluruh tahapan terlebih dahulu.`,
                              })
                              return
                            }
                            if (!hasUploadedEvidence && currentUser?.role !== "admin") {
                              toast.error("Wajib mengunggah bukti pengerjaan!", {
                                description: "Lampirkan minimal 1 foto/berkas bukti sebelum mengajukan review ke atasan.",
                              })
                              return
                            }
                            if (!submitNotes && task.review_notes) {
                              setSubmitNotes(task.review_notes)
                            }
                            setIsSubmitReviewOpen(true)
                          }}
                          disabled={isActionLoading}
                          className="h-7 px-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg gap-1.5 cursor-pointer shrink-0 shadow-xs"
                        >
                          <CheckCircle2Icon className="size-3.5" />
                          {task.review_notes ? (isSupervisorRevision ? "Ajukan Ulang Review" : "Ajukan Review") : "Ajukan Review"}
                        </Button>
                      )}
                    </div>
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
                    {/* Pengerjaan (Submission / Checklist) Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab("subtasks")}
                      className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer -mb-px shrink-0 ${
                        activeDetailTab === "subtasks"
                          ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                      }`}
                    >
                      <span>Pengerjaan</span>
                      {subtasks.length === 0 ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
                          0
                        </span>
                      ) : (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums leading-none ${
                            completedSubtasks === subtasks.length
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200"
                              : activeDetailTab === "subtasks"
                              ? "bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-300 border border-red-100 dark:border-red-900/50"
                              : "bg-muted text-muted-foreground border border-border/40"
                          }`}
                        >
                          {completedSubtasks}/{subtasks.length}
                        </span>
                      )}
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
                      TAB 1: TAHAPAN (SUBTASK) — Optional Multi-step Checklist
                      ───────────────────────────────────────────────────────────── */}
                  {activeDetailTab === "subtasks" && (
                    <div className="space-y-3.5 pt-3">
                      {/* Workflow summary & guide: Hanya tampil jika tugas memiliki tahapan subtask */}
                      {subtasks.length > 0 && (
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-2">
                          <div className="text-xs">
                            <span className="font-bold text-foreground block">
                              Daftar Tahapan Pekerjaan
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Progres: {completedSubtasks} dari {subtasks.length} tahap selesai ({progressPercent}%). Selesaikan semua tahapan sebelum mengajukan review akhir.
                            </span>
                          </div>
                        <div className="flex items-center gap-2 shrink-0">
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
                    )}

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
                          const isCompleted = Boolean(st.is_completed)
                          const isPIC = currentUser ? getTaskAssigneeIds(task).includes(currentUser.id) : false
                          const canActAsPIC = isPIC || (!task.assigned_to) || currentUser?.role === "admin"
                          const isExpanded =
                            subtaskExpandedMap[st.id] !== undefined
                              ? subtaskExpandedMap[st.id]
                              : !isCompleted
                          const attachmentsCount = (st.attachments || []).length
                          const commentsCount = (st.comments || []).length

                          return (
                            <div
                              key={st.id}
                              className={`rounded-xl border transition-all overflow-hidden ${
                                isCompleted
                                  ? "bg-emerald-50/30 border-emerald-200/70 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                                  : "bg-card border-border shadow-xs hover:border-blue-300 dark:hover:border-blue-900"
                              }`}
                            >
                              {/* Header Card (Clickable to Collapse / Expand) */}
                              <div
                                onClick={() => toggleSubtaskCard(st.id, isExpanded)}
                                className="flex items-center justify-between gap-2 p-3 sm:p-3.5 cursor-pointer select-none hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Step Circle / Interactive Toggle Checkbox */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (canActAsPIC || !isStaff) handleToggleSubtask(st)
                                    }}
                                    className={`flex items-center justify-center size-6.5 rounded-full shrink-0 text-[11px] font-bold border-2 transition-colors cursor-pointer ${
                                      isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
                                        : "bg-background border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-950/40"
                                    }`}
                                    title={
                                      isCompleted
                                        ? "Klik untuk tandai belum selesai"
                                        : "Klik untuk tandai selesai"
                                    }
                                  >
                                    {isCompleted ? (
                                      <CheckIcon className="size-3.5 stroke-[3]" />
                                    ) : (
                                      <span>{idx + 1}</span>
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Tahap {idx + 1}
                                      </span>
                                      {/* Status Badges */}
                                      {isCompleted ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                          <CheckCircle2Icon className="size-3" /> Selesai
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                          ⚡ Sedang Dikerjakan
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                      <h4
                                        className={`text-xs font-bold ${
                                          isCompleted
                                            ? "text-foreground line-through decoration-muted-foreground/60 opacity-80"
                                            : "text-foreground"
                                        }`}
                                      >
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
                                  {!isStaff && task.status !== "done" && (
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



                              {/* Dedicated Per-Subtask Attachments Section */}
                              <div className="space-y-1.5 pt-1.5 border-t border-border/40">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                                    <PaperclipIcon className="size-3 text-muted-foreground" />
                                    Lampiran Bukti Tahap Ini ({(st.attachments || []).length})
                                  </span>
                                  {/* Upload button (enabled as long as task is not done) */}
                                  {task.status !== "done" && (canActAsPIC || !isStaff) && (
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
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(st.attachments || []).map((att) => (
                                      <AttachmentCard
                                        key={att.id}
                                        fileName={att.file_name}
                                        fileUrl={att.file_url}
                                        fileSizeBytes={att.file_size_bytes}
                                        onPreview={() => setPreviewAttachment({ url: att.file_url, name: att.file_name })}
                                        canDelete={task.status !== "done"}
                                        onDelete={() => handleDeleteSubtaskAttachment(att.id, st.id)}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-muted-foreground italic bg-muted/20 p-2.5 rounded-lg border border-dashed border-border/60 text-center">
                                    Belum ada bukti lampiran. Unggah foto atau dokumen pengerjaan tahap ini.
                                  </div>
                                )}
                              </div>

                              {/* Status Pengerjaan & Toggle Bar */}
                              {(canActAsPIC || !isStaff) && task.status !== "done" && (
                                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 flex-wrap">
                                  {isCompleted ? (
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                                        <CheckCircle2Icon className="size-3.5" />
                                        <span>Tahap Selesai</span>
                                        {st.completed_at && (
                                          <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                                            • {new Date(st.completed_at).toLocaleString("id-ID", {
                                              day: "numeric",
                                              month: "short",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        )}
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleSubtask(st)}
                                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer"
                                      >
                                        Batalkan
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => handleToggleSubtask(st)}
                                      className="h-7.5 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer gap-1.5"
                                    >
                                      <CheckIcon className="size-3.5 stroke-[3]" />
                                      <span>Tandai Selesai</span>
                                    </Button>
                                  )}
                                </div>
                              )}

                              {/* Subtask-Specific Comments Thread */}
                              <div className="pt-2.5 border-t border-border/40 space-y-2">
                                <button
                                  type="button"
                                  onClick={() => toggleSubtaskComments(st.id)}
                                  className="flex items-center justify-between w-full text-[11px] font-bold text-foreground/80 hover:text-foreground cursor-pointer py-0.5 group"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <MessageSquareIcon className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span>Catatan Khusus Tahap Ini</span>
                                    {(st.comments || []).length > 0 ? (
                                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                                        {(st.comments || []).length}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground font-normal">(0)</span>
                                    )}
                                  </span>
                                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground text-[11px] font-normal">
                                    <span>{subtaskCommentsExpanded[st.id] ? "Sembunyikan" : "Buka Catatan"}</span>
                                    {subtaskCommentsExpanded[st.id] ? (
                                      <ChevronUpIcon className="size-3.5" />
                                    ) : (
                                      <ChevronDownIcon className="size-3.5" />
                                    )}
                                  </div>
                                </button>

                                {/* Banner dashed interaktif jika belum ada catatan dan belum dibuka */}
                                {!subtaskCommentsExpanded[st.id] && (st.comments || []).length === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setSubtaskCommentsExpanded((prev) => ({ ...prev, [st.id]: true }))}
                                    className="w-full py-2 px-3 rounded-lg border border-dashed border-border/80 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-muted-foreground hover:text-blue-600 text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                                  >
                                    <PlusIcon className="size-3 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                    <span>Klik di sini untuk menulis catatan atau kendala tahap ini</span>
                                  </button>
                                )}

                                {/* Container komentar & input box */}
                                {subtaskCommentsExpanded[st.id] && (
                                  <div className="space-y-2 pt-1">
                                    {(st.comments || []).length > 0 ? (
                                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                        {(st.comments || []).map((c) => (
                                          <div
                                            key={c.id}
                                            className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-1 group hover:border-border/80 transition-colors"
                                          >
                                            <div className="flex items-center justify-between gap-1">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="font-semibold text-xs text-foreground truncate">
                                                  {c.user?.nama || "User"}
                                                </span>
                                                {c.user?.role && (
                                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground uppercase border border-border/40 shrink-0">
                                                    {ROLE_LABELS[c.user.role]?.label || c.user.role}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-[10px] text-muted-foreground font-mono">
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
                                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 p-0.5 rounded transition-all cursor-pointer"
                                                    title="Hapus catatan"
                                                  >
                                                    <Trash2Icon className="size-3" />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                            <p className="text-foreground/90 text-xs leading-relaxed whitespace-pre-line pl-0.5">
                                              {c.comment}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-muted-foreground italic text-center py-1">
                                        Belum ada catatan khusus pada tahap ini. Tulis catatan pertama di bawah.
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
                                        placeholder="Tulis catatan atau arahan tahap ini... (Tekan Enter)"
                                        className="h-8 rounded-lg text-xs bg-background border-border/80"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleSendSubtaskComment(st.id)}
                                        disabled={
                                          isSubmittingSubtaskComment[st.id] ||
                                          !(subtaskCommentInputs[st.id] || "").trim()
                                        }
                                        className="h-8 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer gap-1 shadow-2xs"
                                      >
                                        {isSubmittingSubtaskComment[st.id] ? (
                                          <Loader2Icon className="size-3 animate-spin" />
                                        ) : (
                                          <>
                                            <SendIcon className="size-3" />
                                            <span>Kirim</span>
                                          </>
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

                        {/* Area Pengerjaan Tugas Mandiri: Opsi Kerjakan Tugas Langsung ATAU Tambah Tahapan */}
                        {subtasks.length === 0 && !isAddSubtaskExpanded && (
                          <div className="p-5 sm:p-6 text-center rounded-2xl border border-dashed border-border/80 bg-muted/15 space-y-4">
                            <div className="size-11 rounded-2xl bg-muted/70 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground shadow-2xs">
                              <CheckSquareIcon className="size-5.5 text-primary" />
                            </div>
                            <div className="max-w-md mx-auto space-y-1">
                              <h4 className="text-sm font-bold text-foreground">
                                {task.status === "in_progress"
                                  ? "Tugas Sedang Dikerjakan Langsung"
                                  : task.status === "review"
                                  ? "Tugas Sedang Dalam Review Atasan"
                                  : task.status === "done"
                                  ? "Tugas Telah Selesai & Disetujui"
                                  : "Pengerjaan Tugas Mandiri"}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {task.status === "in_progress"
                                  ? "Pekerjaan ini dikerjakan langsung tanpa tahapan checklist. Anda dapat melampirkan berkas bukti (opsional) atau langsung mengajukan review jika sudah selesai."
                                  : task.status === "review"
                                  ? "Tugas telah diajukan dan sedang menunggu pemeriksaan atasan/reviewer."
                                  : task.status === "done"
                                  ? "Seluruh pekerjaan telah diselesaikan dan disetujui resmi oleh atasan."
                                  : "Tugas ini dapat langsung dikerjakan tanpa tahapan checklist, atau Anda dapat memecahnya menjadi beberapa tahapan di bawah."}
                              </p>
                            </div>

                            {/* Tombol Aksi: Kerjakan Tugas ATAU Tambah Tahapan */}
                            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                              {/* 1. Opsi Kerjakan Tugas (Sesuai Status) */}
                              {(task.status === "todo" || task.status === "unassigned") && (!task.assigned_to || isAssignee) && (
                                <Button
                                  type="button"
                                  onClick={handleTakeTask}
                                  disabled={isActionLoading}
                                  className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <PlayIcon className="size-3.5 fill-current" />
                                  <span>Mulai Kerjakan Tugas</span>
                                </Button>
                              )}

                              {task.status === "in_progress" && canSubmitReview && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsUploadOpen(true)}
                                  className="h-8 px-3.5 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-border/80 hover:bg-muted"
                                >
                                  <PaperclipIcon className="size-3.5 text-muted-foreground" />
                                  <span>Unggah Bukti (Opsional)</span>
                                </Button>
                              )}

                              {task.status === "review" && isAssignee && !canApprove && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleCancelReview}
                                  disabled={isActionLoading}
                                  className="h-8 px-3.5 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
                                >
                                  <RotateCcwIcon className="size-3.5" />
                                  <span>Tarik Pengajuan Review</span>
                                </Button>
                              )}

                              {/* 2. Opsi Tambah Tahapan / Checklist */}
                              {canSubmitReview && task.status !== "done" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsAddSubtaskExpanded(true)}
                                  className="h-8 px-3.5 text-xs font-semibold rounded-xl gap-1.5 border-dashed border-border/90 hover:border-foreground/40 cursor-pointer"
                                >
                                  <PlusIcon className="size-3.5 text-red-600" />
                                  <span>Tambah Tahapan / Subtask</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Add Subtask Form — Menggantikan empty state secara langsung */}
                      {canSubmitReview && (
                        <div>
                          {isAddSubtaskExpanded ? (
                            <form onSubmit={handleAddSubtask} className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-3">
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
                                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
                                  autoFocus
                                  className="h-8.5 rounded-lg text-xs bg-background"
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
                                  className="text-xs rounded-lg min-h-[65px] bg-background"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsAddSubtaskExpanded(false)}
                                  className="h-8 px-3 text-xs rounded-lg cursor-pointer"
                                >
                                  Batal
                                </Button>
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                                  className="h-8 px-3.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs gap-1"
                                >
                                  {isAddingSubtask ? (
                                    <>
                                      <Loader2Icon className="size-3 animate-spin mr-1" />
                                      <span>Menyimpan...</span>
                                    </>
                                  ) : (
                                    <>
                                      <PlusIcon className="size-3 mr-1" />
                                      <span>Tambahkan Tahap</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          ) : subtasks.length > 0 ? (
                            <div className="pt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddSubtaskExpanded(true)}
                                className="w-full h-8 text-xs font-bold border-dashed border-border hover:border-red-400 text-muted-foreground hover:text-foreground rounded-lg gap-1.5 cursor-pointer"
                              >
                                <PlusIcon className="size-3.5 text-red-600" />
                                <span>Tambah Tahapan Baru (Tahap {subtasks.length + 1})</span>
                              </Button>
                            </div>
                          ) : null}
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
                      TAB 3: LAMPIRAN (Bukti Pengerjaan Tugas & Subtask)
                      ───────────────────────────────────────────────────────────── */}
                  {activeDetailTab === "attachments" && (
                    <div className="space-y-4 pt-1">
                      {/* 1. Berkas Lampiran Tugas Utama (Langsung pada Tugas) */}
                      {(task.attachments || []).length > 0 && (
                        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 min-w-0">
                              <PaperclipIcon className="size-3.5 text-blue-600 shrink-0" />
                              <span>Lampiran Tugas</span>
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
                              {(task.attachments || []).length} berkas
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(task.attachments || []).map((att) => (
                              <AttachmentCard
                                key={att.id}
                                fileName={att.file_name}
                                fileUrl={att.file_url}
                                fileSizeBytes={att.file_size_bytes}
                                onPreview={() => setPreviewAttachment({ url: att.file_url, name: att.file_name })}
                                canDelete={canSubmitReview}
                                onDelete={() => handleDeleteAttachment(att.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Lampiran Berdasarkan Tahapan Subtask (Jika ada) */}
                      {subtasks.filter((st) => (st.attachments || []).length > 0).length > 0 && (
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

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(st.attachments || []).map((att) => (
                                      <AttachmentCard
                                        key={att.id}
                                        fileName={att.file_name}
                                        fileUrl={att.file_url}
                                        fileSizeBytes={att.file_size_bytes}
                                        onPreview={() => setPreviewAttachment({ url: att.file_url, name: att.file_name })}
                                        canDelete={false}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}

                      {/* 3. Empty State: Hanya jika TIDAK ada lampiran sama sekali */}
                      {totalAttachmentsCount === 0 && (
                        <div className="text-[11px] text-muted-foreground italic bg-muted/20 p-6 rounded-lg border border-dashed text-center space-y-1">
                          <PaperclipIcon className="size-6 mx-auto text-muted-foreground/40" />
                          <p className="font-semibold text-foreground">Belum Ada Bukti Lampiran</p>
                          <p className="text-[11px] text-muted-foreground">
                            Belum ada foto atau dokumen bukti yang diunggah untuk penugasan ini.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DIALOG: PREVIEW LAMPIRAN */}
            <Dialog open={!!previewAttachment} onOpenChange={(o) => { if (!o) setPreviewAttachment(null) }}>
              <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl p-4 sm:p-5 font-sans flex flex-col gap-3">
                <DialogHeader className="flex flex-row items-center justify-between gap-3 pb-3 border-b border-border/60 text-left">
                  <div className="min-w-0 flex-1 pr-2">
                    <DialogTitle className="text-sm sm:text-base font-bold truncate text-foreground flex items-center gap-2">
                      <FileTypeBadge fileName={previewAttachment?.name || ""} fileUrl={previewAttachment?.url} />
                      <span className="truncate">{previewAttachment?.name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Pratinjau berkas lampiran
                    </DialogDescription>
                  </div>
                  {previewAttachment && (
                    <div className="flex items-center gap-2 shrink-0 pr-8">
                      <a
                        href={previewAttachment.url}
                        download={previewAttachment.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-colors"
                      >
                        <DownloadIcon className="size-3.5" />
                        <span>Unduh Berkas</span>
                      </a>
                    </div>
                  )}
                </DialogHeader>
                {previewAttachment && (() => {
                  const isImg = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(previewAttachment.url) || /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(previewAttachment.name)
                  const isPdf = /\.pdf(\?.*)?$/i.test(previewAttachment.url) || /\.pdf$/i.test(previewAttachment.name)
                  const isOffice = /\.(docx?|xlsx?|pptx?)$/i.test(previewAttachment.name) && /^https?:/i.test(previewAttachment.url)
                  return (
                    <div className="flex items-center justify-center rounded-xl bg-muted/40 border border-border/50 overflow-auto max-h-[80vh] min-h-[300px]">
                      {isImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewAttachment.url} alt={previewAttachment.name} className="max-w-full max-h-[80vh] object-contain rounded-lg p-2" />
                      ) : isPdf ? (
                        <iframe src={previewAttachment.url} title={previewAttachment.name} className="w-full h-[80vh] rounded-lg" />
                      ) : isOffice ? (
                        <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewAttachment.url)}`} title={previewAttachment.name} className="w-full h-[80vh] rounded-lg" />
                      ) : (
                        <div className="p-8 text-center text-xs text-muted-foreground space-y-3">
                          <FileTextIcon className="size-10 mx-auto text-muted-foreground/50" />
                          <p className="font-medium text-foreground">Pratinjau tidak tersedia langsung untuk tipe berkas ini.</p>
                          <p className="text-[11px] text-muted-foreground">Silakan klik tombol unduh di atas untuk membuka berkas di perangkat Anda.</p>
                          <a
                            href={previewAttachment.url}
                            download={previewAttachment.name}
                            className="inline-flex items-center gap-1.5 text-primary font-semibold underline hover:text-primary/80"
                          >
                            <DownloadIcon className="size-3.5" />
                            Unduh berkas secara langsung
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </DialogContent>
            </Dialog>

            {/* DIALOG: APPROVE SUBTASK (Atasan) */}

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
              <DialogContent className="max-w-md rounded-xl p-5 font-sans">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2Icon className="size-4 text-red-600" />
                    Ajukan Review ke Atasan
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Sertakan ringkasan hasil kerja untuk diperiksa dan disetujui atasan.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-foreground">
                        Ringkasan Hasil Kerja <span className="text-red-600">* (Wajib)</span>
                      </label>
                      <span className={`text-[10px] font-mono ${submitNotes.trim().length >= 10 ? 'text-emerald-600 font-bold' : 'text-muted-foreground'}`}>
                        {submitNotes.trim().length}/10 karakter min.
                      </span>
                    </div>
                    <Textarea
                      value={submitNotes}
                      onChange={(e) => setSubmitNotes(e.target.value)}
                      placeholder="Jelaskan ringkas apa saja yang telah dikerjakan, kendala, atau hal penting yang perlu dicek atasan..."
                      className="text-xs min-h-[90px] rounded-lg"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitReviewOpen(false)}
                      className="h-8 text-xs rounded-lg cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleSubmitForReview}
                      disabled={isActionLoading || submitNotes.trim().length < 10}
                      className="h-8 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs cursor-pointer"
                    >
                      {isActionLoading ? "Mengajukan..." : "Kirim Pengajuan Review"}
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

