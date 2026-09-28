"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  PlusIcon,
  Trash2Icon,
  ClockIcon,
  TagIcon,
  UserIcon,
  Settings2Icon,
} from "lucide-react"
import { toast } from "sonner"
import { Task, TaskPriority, TaskStatus, Channel, User, ROLE_LABELS, ROLE_HIERARCHY_LEVEL } from "@/types/database"
import {
  createTask,
  getChannels,
  getAllUsers,
  getActiveUserFromStorage,
} from "@/lib/api"
import { ManageChannelsModal } from "@/components/dashboard/tasks/manage-channels-modal"

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaultStatus?: TaskStatus
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string }> = {
  urgent: { label: "Mendesak (Urgent)", dot: "bg-red-600" },
  high: { label: "Tinggi (High)", dot: "bg-amber-500" },
  medium: { label: "Sedang (Medium)", dot: "bg-blue-500" },
  low: { label: "Rendah (Low)", dot: "bg-emerald-500" },
}

const DEADLINE_LABELS: Record<number, string> = {
  0: "Hari Ini (Selesai Hari Ini)",
  1: "Besok (1 Hari / 24 Jam)",
  2: "2 Hari ke Depan",
  3: "3 Hari ke Depan",
  5: "5 Hari Kerja",
  7: "1 Minggu (7 Hari)",
  14: "2 Minggu",
}

export function CreateTaskModal({
  open,
  onOpenChange,
  onSuccess,
  defaultStatus = "unassigned",
}: CreateTaskModalProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [channelId, setChannelId] = React.useState("")
  const [priority, setPriority] = React.useState<TaskPriority>("high")
  const [assignedTo, setAssignedTo] = React.useState("")
  const [deadlineDays, setDeadlineDays] = React.useState(0)
  const [estimatedHours, setEstimatedHours] = React.useState(2.5)
  const [subtaskInputs, setSubtaskInputs] = React.useState<string[]>([])
  const [newSubtaskText, setNewSubtaskText] = React.useState("")
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isManageChannelsOpen, setIsManageChannelsOpen] = React.useState(false)
  const activeUser = React.useMemo(() => (open ? getActiveUserFromStorage() : null), [open])

  const loadData = React.useCallback(async () => {
    const [chList, uList] = await Promise.all([getChannels(), getAllUsers()])
    setChannels(chList)
    if (chList.length > 0 && !channelId) setChannelId(chList[0].id)
    setUsers(uList)
  }, [channelId])

  React.useEffect(() => {
    if (!open) return
    loadData()
    const currentUser = getActiveUserFromStorage()
    if (currentUser && currentUser.role !== "admin" && !assignedTo) {
      setAssignedTo(currentUser.id)
    }
  }, [open, loadData, assignedTo])

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return
    setSubtaskInputs([...subtaskInputs, newSubtaskText.trim()])
    setNewSubtaskText("")
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtaskInputs(subtaskInputs.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Judul tugas wajib diisi.")
      return
    }
    if (!channelId) {
      toast.error("Silakan pilih kategori tugas.")
      return
    }

    const currentUser = getActiveUserFromStorage()
    const createdBy = currentUser?.id || "55555555-5555-4555-8555-111111111111"
    const selectedChannel = channels.find((c) => c.id === channelId)
    const departmentId = selectedChannel?.department_id || "11111111-1111-4111-8111-111111111111"

    let deadline: string
    if (deadlineDays === 0) {
      const today = new Date()
      today.setHours(18, 0, 0, 0)
      deadline = today.toISOString()
    } else {
      const target = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000)
      target.setHours(18, 0, 0, 0)
      deadline = target.toISOString()
    }

    setIsSubmitting(true)
    try {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim(),
        channel_id: channelId,
        department_id: departmentId,
        priority,
        created_by: createdBy,
        assigned_to: assignedTo || null,
        deadline_at: deadline,
        estimated_hours: estimatedHours,
        subtask_titles: subtaskInputs.filter((s) => s.trim().length > 0),
      })

      if (newTask) {
        toast.success(`Penugasan baru berhasil dibuat!`, {
          description: `Tugas [${newTask.ticket_code}] berhasil didaftarkan.`,
        })
        setTitle("")
        setDescription("")
        setAssignedTo("")
        setSubtaskInputs([])
        setNewSubtaskText("")
        onOpenChange(false)
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal membuat tugas baru.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedChannelObj = channels.find((c) => c.id === channelId)
  const selectedUserObj = users.find((u) => u.id === assignedTo)

  // Filter assignable users based on Chain of Command:
  // - Admin (Level 99): can assign to anyone
  // - Non-admin: can only assign to themselves (tugas mandiri) or subordinates (level < currentUser.level)
  //   Bawahan TIDAK BISA memberikan tugas ke atasan atau level yang lebih tinggi!
  const assignableUsers = React.useMemo(() => {
    if (!activeUser) return users
    if (activeUser.role === "admin") return users

    const myLevel = ROLE_HIERARCHY_LEVEL[activeUser.role] ?? 1

    return users.filter((u) => {
      // Boleh menugaskan ke diri sendiri (tugas mandiri)
      if (u.id === activeUser.id) return true
      // Tidak boleh menugaskan ke admin
      if (u.role === "admin") return false
      // Hanya boleh menugaskan ke bawahan (level target harus lebih rendah dari level saya)
      const targetLevel = ROLE_HIERARCHY_LEVEL[u.role] ?? 1
      return targetLevel < myLevel
    })
  }, [users, activeUser])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl md:max-w-3xl rounded-2xl p-6 md:p-7 font-sans max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 border-b border-border pb-4">
          <DialogTitle className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            Buat Penugasan Baru
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-muted-foreground">
            Formulir pendaftaran tiket dan penugasan kerja. Isi detail tugas dan delegasikan ke personil yang bertugas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Section 1: Judul Tugas */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Judul Penugasan / Agenda Kerja *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penyusunan Proposal Pengadaan Perangkat & Jasa B2B Q4"
              required
              className="h-10 rounded-xl text-xs md:text-sm font-semibold bg-background"
            />
          </div>

          {/* Section 2: Kategori & Prioritas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kategori / Divisi *
                </label>
                <button
                  type="button"
                  onClick={() => setIsManageChannelsOpen(true)}
                  className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Settings2Icon className="size-3" />
                  <span>Kelola Divisi</span>
                </button>
              </div>
              <Select value={channelId} onValueChange={(val) => setChannelId(val || "")}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border text-xs md:text-sm font-medium">
                  <span className="font-semibold text-foreground truncate">
                    {selectedChannelObj ? selectedChannelObj.name : "Pilih Kategori / Divisi"}
                  </span>
                </SelectTrigger>
                <SelectContent className="w-full max-h-56">
                  {channels.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Tingkat Prioritas *
              </label>
              <Select value={priority} onValueChange={(val) => setPriority((val as TaskPriority) || "high")}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`size-2 rounded-full shrink-0 ${PRIORITY_CONFIG[priority]?.dot || "bg-amber-500"}`} />
                    <span className="font-semibold text-foreground truncate">
                      {PRIORITY_CONFIG[priority]?.label || "Pilih Prioritas"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-red-600 shrink-0" />
                      <span>Mendesak (Urgent)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                      <span>Tinggi (High)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                      <span>Sedang (Medium)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Rendah (Low)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 3: Pelaksana & Target Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Pelaksana Tugas (PIC)
              </label>
              <Select
                value={assignedTo || "unassigned"}
                onValueChange={(val) => setAssignedTo(val === "unassigned" ? "" : (val || ""))}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border text-xs md:text-sm font-medium">
                  {selectedUserObj ? (
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={
                          selectedUserObj.avatar_url ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"
                        }
                        alt={selectedUserObj.nama}
                        className="size-5 rounded-full object-cover shrink-0"
                      />
                      <span className="font-semibold text-foreground truncate">{selectedUserObj.nama}</span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        ({ROLE_LABELS[selectedUserObj.role]?.badge || selectedUserObj.role})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 truncate text-muted-foreground font-medium">
                      <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                        ?
                      </div>
                      <span className="truncate">Belum Ditentukan (Unassigned Pool)</span>
                    </div>
                  )}
                </SelectTrigger>
                <SelectContent className="w-full max-h-60">
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                        ?
                      </div>
                      <span className="font-semibold text-muted-foreground">Belum Ditentukan (Unassigned)</span>
                    </div>
                  </SelectItem>
                  {assignableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            u.avatar_url ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"
                          }
                          alt={u.nama}
                          className="size-5 rounded-full object-cover shrink-0"
                        />
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-semibold text-foreground truncate">
                            {u.nama} {u.id === activeUser?.id ? "(Saya Sendiri)" : ""}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            ({ROLE_LABELS[u.role]?.badge || u.role})
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Target Selesai
              </label>
              <Select
                value={String(deadlineDays)}
                onValueChange={(val) => setDeadlineDays(Number(val || "1"))}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <ClockIcon className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground truncate">
                      {DEADLINE_LABELS[deadlineDays] || `${deadlineDays} Hari`}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="0">Hari Ini (Selesai Hari Ini)</SelectItem>
                  <SelectItem value="1">Besok (1 Hari / 24 Jam)</SelectItem>
                  <SelectItem value="2">2 Hari ke Depan</SelectItem>
                  <SelectItem value="3">3 Hari ke Depan</SelectItem>
                  <SelectItem value="5">5 Hari Kerja</SelectItem>
                  <SelectItem value="7">1 Minggu (7 Hari)</SelectItem>
                  <SelectItem value="14">2 Minggu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 4: Deskripsi & Instruksi */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Deskripsi & Instruksi Pengerjaan
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan rincian penugasan atau instruksi kerja..."
              className="rounded-xl text-xs md:text-sm resize-none h-20 bg-background"
            />
          </div>

          {/* Section 5: Subtasks Checklist */}
          <div className="space-y-2.5 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tahapan Pengerjaan (Checklist Subtasks)
              </label>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {subtaskInputs.length} Tahapan
              </span>
            </div>

            <div className="space-y-1.5">
              {subtaskInputs.length === 0 && (
                <div className="py-2.5 px-3 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    Belum ada tahapan subtask. Tambahkan di bawah jika diperlukan (opsional).
                  </p>
                </div>
              )}

              {subtaskInputs.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/70">
                  <span className="size-5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-foreground flex-1 font-medium truncate">
                    {st}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="size-6 text-muted-foreground hover:text-red-600 rounded-md cursor-pointer"
                    title="Hapus tahapan ini"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Ketik tahapan pengerjaan baru..."
                  className="h-9 rounded-xl text-xs bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSubtask()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddSubtask}
                  className="h-9 px-3.5 text-xs font-bold rounded-xl shrink-0 bg-zinc-800 text-white hover:bg-zinc-900 cursor-pointer shadow-xs"
                >
                  <PlusIcon className="size-3.5 mr-1" /> Tambah
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9.5 px-4 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9.5 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Mendaftarkan Tugas..." : "Terbitkan Penugasan"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Manage Channels Modal */}
      <ManageChannelsModal
        open={isManageChannelsOpen}
        onOpenChange={setIsManageChannelsOpen}
        onChannelsUpdated={loadData}
      />
    </Dialog>
  )
}
