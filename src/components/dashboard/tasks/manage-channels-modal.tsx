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
import {
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  CheckIcon,
  XIcon,
  LayersIcon,
  FileTextIcon,
  ShieldIcon,
  UsersIcon,
  BriefcaseIcon,
  FolderIcon,
  HashIcon,
  TagIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Channel } from "@/types/database"
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  getTasks,
} from "@/lib/api"

interface ManageChannelsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChannelsUpdated?: () => void
}

const ICON_MAP: Record<string, React.ElementType> = {
  Layers: LayersIcon,
  FileText: FileTextIcon,
  Shield: ShieldIcon,
  Users: UsersIcon,
  Briefcase: BriefcaseIcon,
  Folder: FolderIcon,
  Hash: HashIcon,
}

const AVAILABLE_ICONS = ["Layers", "FileText", "Shield", "Users", "Briefcase", "Folder", "Hash"]

export function ManageChannelsModal({
  open,
  onOpenChange,
  onChannelsUpdated,
}: ManageChannelsModalProps) {
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [taskCounts, setTaskCounts] = React.useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = React.useState(false)

  // New Channel Form State
  const [newName, setNewName] = React.useState("")
  const [newDesc, setNewDesc] = React.useState("")
  const [newIcon, setNewIcon] = React.useState("Layers")
  const [isCreating, setIsCreating] = React.useState(false)

  // Editing State
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editDesc, setEditDesc] = React.useState("")
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [chs, ts] = await Promise.all([getChannels(), getTasks()])
      setChannels(chs)
      const counts: Record<string, number> = {}
      ts.forEach((t) => {
        if (t.channel_id) counts[t.channel_id] = (counts[t.channel_id] || 0) + 1
      })
      setTaskCounts(counts)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      loadData()
      setEditingId(null)
      setDeleteConfirmId(null)
    }
  }, [open, loadData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      toast.error("Nama kategori/divisi wajib diisi.")
      return
    }

    setIsCreating(true)
    try {
      const created = await createChannel({
        name: newName.trim(),
        description: newDesc.trim() || "Ruang kerja divisi & penugasan kantor.",
        icon: newIcon,
      })

      if (created) {
        toast.success(`Kategori "${created.name}" berhasil ditambahkan!`)
        setNewName("")
        setNewDesc("")
        await loadData()
        onChannelsUpdated?.()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menambahkan kategori.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartEdit = (ch: Channel) => {
    setEditingId(ch.id)
    setEditName(ch.name)
    setEditDesc(ch.description || "")
  }

  const handleSaveEdit = async (channelId: string) => {
    if (!editName.trim()) {
      toast.error("Nama kategori tidak boleh kosong.")
      return
    }

    setIsSavingEdit(true)
    try {
      const updated = await updateChannel(channelId, {
        name: editName.trim(),
        description: editDesc.trim(),
      })

      if (updated) {
        toast.success(`Kategori berhasil diperbarui!`)
        setEditingId(null)
        await loadData()
        onChannelsUpdated?.()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal memperbarui kategori.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDelete = async (channelId: string, channelName: string) => {
    setIsDeleting(true)
    try {
      const ok = await deleteChannel(channelId)
      if (ok) {
        toast.success(`Kategori "${channelName}" berhasil dihapus.`)
        setDeleteConfirmId(null)
        await loadData()
        onChannelsUpdated?.()
      } else {
        toast.error("Gagal menghapus kategori.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghapus kategori.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:max-w-2xl rounded-2xl p-6 font-sans max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1 border-b border-border pb-3.5">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <div className="size-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <TagIcon className="size-4" />
            </div>
            Kelola Kategori & Divisi Kantor
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tambah divisi baru, edit nama kategori, atau hapus kategori penugasan yang sudah tidak digunakan.
          </DialogDescription>
        </DialogHeader>

        {/* Section 1: Form Tambah Kategori Baru */}
        <form onSubmit={handleCreate} className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <PlusIcon className="size-3.5" />
              Tambah Kategori / Divisi Baru
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Nama Kategori / Divisi *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="misal: Logistik & Gudang"
                required
                className="h-8.5 text-xs rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Deskripsi Singkat (Opsional)
              </label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="misal: Pengelolaan stok & suplai material"
                className="h-8.5 text-xs rounded-lg bg-background"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Icon picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Ikon:</span>
              {AVAILABLE_ICONS.map((iconName) => {
                const Icon = ICON_MAP[iconName] || HashIcon
                const isSelected = newIcon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setNewIcon(iconName)}
                    className={`size-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600 shadow-xs"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                    }`}
                    title={iconName}
                  >
                    <Icon className="size-3.5" />
                  </button>
                )
              })}
            </div>

            <Button
              type="submit"
              disabled={isCreating || !newName.trim()}
              className="h-8 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
            >
              {isCreating ? "Menyimpan..." : "+ Tambah Kategori"}
            </Button>
          </div>
        </form>

        {/* Section 2: Daftar Kategori Yang Ada */}
        <div className="space-y-2 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Daftar Kategori Saat Ini ({channels.length})
            </span>
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
              Memuat data kategori...
            </div>
          ) : channels.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground border rounded-xl">
              Belum ada kategori yang terdaftar.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {channels.map((ch) => {
                const Icon = (ch.icon && ICON_MAP[ch.icon]) || HashIcon
                const count = taskCounts[ch.id] || 0
                const isEditingThis = editingId === ch.id
                const isConfirmingDelete = deleteConfirmId === ch.id

                return (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl border border-border bg-card flex flex-col gap-2 transition-all hover:border-border/80"
                  >
                    {isEditingThis ? (
                      /* EDIT MODE INLINE */
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nama kategori"
                            className="h-8 text-xs font-semibold bg-background"
                          />
                          <Input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Deskripsi kategori"
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
                          >
                            <XIcon className="size-3.5 mr-1" /> Batal
                          </Button>
                          <Button
                            size="sm"
                            disabled={isSavingEdit}
                            onClick={() => handleSaveEdit(ch.id)}
                            className="h-7 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                          >
                            <CheckIcon className="size-3.5 mr-1" /> Simpan
                          </Button>
                        </div>
                      </div>
                    ) : isConfirmingDelete ? (
                      /* DELETE CONFIRMATION INLINE */
                      <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/60">
                        <div className="flex items-center gap-2">
                          <AlertTriangleIcon className="size-4 text-red-600 shrink-0" />
                          <span className="text-xs font-semibold text-red-900 dark:text-red-200">
                            Yakin hapus kategori <strong>&ldquo;{ch.name}&rdquo;</strong>?
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(null)}
                            className="h-7 px-2 text-xs rounded cursor-pointer"
                          >
                            Batal
                          </Button>
                          <Button
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => handleDelete(ch.id, ch.name)}
                            className="h-7 px-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                          >
                            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* NORMAL VIEW */
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0 border border-border/60">
                            <Icon className="size-4 text-red-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-foreground truncate">
                                {ch.name}
                              </h4>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground tabular-nums">
                                {count} Tugas
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {ch.description || "Kategori operasional kantor"}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEdit(ch)}
                            className="size-7 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                            title="Ubah nama / deskripsi"
                          >
                            <PencilIcon className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(ch.id)}
                            className="size-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg cursor-pointer"
                            title="Hapus kategori ini"
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8.5 px-4 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
