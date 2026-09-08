"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FolderPlusIcon,
  HashIcon,
  LayersIcon,
  FileTextIcon,
  ShieldIcon,
  UsersIcon,
  BriefcaseIcon,
  FolderIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createChannel } from "@/lib/api"
import { Channel } from "@/types/database"

interface CreateChannelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (channel: Channel) => void
}

const iconOptions = [
  { id: "Layers", label: "Operasional", icon: LayersIcon },
  { id: "FileText", label: "Anggaran / SPJ", icon: FileTextIcon },
  { id: "Shield", label: "Audit & Kepatuhan", icon: ShieldIcon },
  { id: "Users", label: "SDM & Tim", icon: UsersIcon },
  { id: "Briefcase", label: "Proyek Khusus", icon: BriefcaseIcon },
  { id: "Folder", label: "Dokumen & Arsip", icon: FolderIcon },
]

export function CreateChannelModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateChannelModalProps) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedIcon, setSelectedIcon] = React.useState("Folder")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Nama Proyek / Channel wajib diisi.")
      return
    }

    setIsSubmitting(true)
    try {
      const newChannel = await createChannel({
        name: name.trim(),
        description: description.trim() || "Ruang kerja divisi & penugasan proyek kantor.",
        icon: selectedIcon,
      })

      if (newChannel) {
        toast.success(`Proyek / Channel #${newChannel.name} berhasil dibuat!`, {
          description: "Ruang kerja divisi siap digunakan untuk penugasan dan koordinasi.",
        })
        setName("")
        setDescription("")
        setSelectedIcon("Folder")
        onOpenChange(false)
        if (onSuccess) onSuccess(newChannel)
        router.push(`/admin/tasks?channel=${newChannel.id}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal membuat proyek / channel baru.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 font-sans">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <FolderPlusIcon className="size-5 text-red-600" />
            Buat Proyek / Ruang Kerja Divisi Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tambahkan channel workstream baru untuk mengelompokkan penugasan, memo, berkas, dan KPI divisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Channel Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nama Proyek / Divisi *
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                #
              </span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: logistik-pengadaan-q4"
                required
                className="h-10 pl-7 text-xs font-semibold rounded-xl"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Deskripsi & Ruang Lingkup
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan fokus kerja divisi atau proyek penugasan ini..."
              className="mt-1 text-xs rounded-xl resize-none h-18"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pilih Ikon Divisi
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {iconOptions.map((opt) => {
                const Icon = opt.icon
                const isSelected = selectedIcon === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedIcon(opt.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 shadow-2xs"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className={`size-3.5 shrink-0 ${isSelected ? "text-red-600 dark:text-red-400" : ""}`} />
                    <span className="truncate text-[11px]">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-semibold rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="h-9 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
            >
              {isSubmitting ? "Menyimpan..." : "Buat Proyek"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
