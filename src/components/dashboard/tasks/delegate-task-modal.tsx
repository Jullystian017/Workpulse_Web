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
import { Textarea } from "@/components/ui/textarea"
import {
  SparklesIcon,
  CheckCircle2Icon,
  UserPlusIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ClockIcon,
  AlertCircleIcon,
  ZapIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Task, User, ROLE_LABELS } from "@/types/database"
import {
  getSmartDelegationRecommendations,
  delegateTask,
  getActiveUserFromStorage,
  type SubordinateRecommendation,
} from "@/lib/api"

interface DelegateTaskModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DelegateTaskModal({
  task,
  open,
  onOpenChange,
  onSuccess,
}: DelegateTaskModalProps) {
  const [recommendations, setRecommendations] = React.useState<SubordinateRecommendation[]>([])
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([])
  const [reasonNotes, setReasonNotes] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open || !task) return

    async function loadRecommendations() {
      setIsLoading(true)
      const currentUser = getActiveUserFromStorage()
      const supervisorId = currentUser?.id || "55555555-5555-4555-8555-111111111111"
      const supervisorRole = currentUser?.role || "manager"

      const recs = await getSmartDelegationRecommendations(task!.id, supervisorId, supervisorRole)
      setRecommendations(recs)
      if (recs.length > 0) {
        setSelectedUserIds([recs[0].user.id])
      } else {
        setSelectedUserIds([])
      }
      setIsLoading(false)
    }

    loadRecommendations()
  }, [open, task])

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      }
      if (prev.length >= 2) {
        // Swap secondary with new selection
        return [prev[0], userId]
      }
      return [...prev, userId]
    })
  }

  const handleConfirmDelegation = async () => {
    if (!task || selectedUserIds.length === 0) {
      toast.error("Silakan pilih minimal 1 pelaksana tugas.")
      return
    }

    const currentUser = getActiveUserFromStorage()
    const delegatorId = currentUser?.id || "55555555-5555-4555-8555-111111111111"
    const primaryId = selectedUserIds[0]
    const secondaryId = selectedUserIds.length > 1 ? selectedUserIds[1] : null

    const primaryRec = recommendations.find((r) => r.user.id === primaryId)
    const secondaryRec = secondaryId ? recommendations.find((r) => r.user.id === secondaryId) : null

    setIsSubmitting(true)
    try {
      const ok = await delegateTask(
        task.id,
        primaryId,
        delegatorId,
        reasonNotes,
        primaryRec?.matchScore || 90,
        secondaryId
      )

      if (ok) {
        const names = [primaryRec?.user.nama, secondaryRec?.user.nama].filter(Boolean).join(" & ")
        toast.success(`Tugas ${task.ticket_code} berhasil didelegasikan!`, {
          description: `Ditugaskan kepada: ${names}`,
        })
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error("Gagal mendelegasikan tugas.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Terjadi kendala saat menyimpan delegasi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl md:max-w-4xl rounded-2xl p-6 md:p-8 font-sans max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600">
            <SparklesIcon className="size-4 text-amber-500" />
            <span>Pendelegasian Hierarkis & Rekomendasi Beban Kerja Personil</span>
          </div>
          <DialogTitle className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Limpahkan Penugasan: <span className="text-red-600">{task.ticket_code}</span>
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-muted-foreground">
            Pilih 1 atau hingga 2 pelaksana tugas (Pelaksana Utama & Rekan) berdasarkan rekomendasi kapasitas dan keahlian.
          </DialogDescription>
        </DialogHeader>

        {/* Task Summary Banner */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between mt-3">
          <div className="space-y-0.5">
            <h4 className="text-xs md:text-sm font-bold text-foreground line-clamp-1">{task.title}</h4>
            <p className="text-[11px] md:text-xs text-muted-foreground">
              Prioritas: <span className="font-bold uppercase text-red-600">{task.priority}</span> • Estimasi: {task.estimated_hours || 2} Jam
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-background border text-foreground">
            {task.channel?.name ? `#${task.channel.name}` : "Operasional"}
          </span>
        </div>

        {/* Subordinate Recommendation List */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pilih Personil Pelaksana Tugas (Maksimal 2 Orang):
            </label>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 border border-red-200 dark:border-red-900">
              {selectedUserIds.length} dari 2 Dipilih
            </span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Menghitung skor kesesuaian personil...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border rounded-xl">
              Tidak ada bawahan aktif di bawah unit kerja ini.
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {recommendations.map((rec) => {
                const selIndex = selectedUserIds.indexOf(rec.user.id)
                const isSelected = selIndex !== -1
                const isPrimary = selIndex === 0
                const isSecondary = selIndex === 1

                return (
                  <div
                    key={rec.user.id}
                    onClick={() => toggleSelectUser(rec.user.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-red-50/70 dark:bg-red-950/40 border-red-500 shadow-xs ring-1 ring-red-500/40"
                        : "bg-card border-border hover:border-border/80 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={rec.user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                          alt={rec.user.nama}
                          className="size-11 rounded-full object-cover border border-border shrink-0"
                        />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                            {isPrimary ? "1" : "2"}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs md:text-sm font-bold text-foreground">{rec.user.nama}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 whitespace-nowrap ${ROLE_LABELS[rec.user.role]?.color}`}>
                            {ROLE_LABELS[rec.user.role]?.badge}
                          </span>
                          {isPrimary && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                              PIC Utama
                            </span>
                          )}
                          {isSecondary && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-2xs">
                              PIC Rekan (Pendamping)
                            </span>
                          )}
                          {rec.isRecommended && !isSelected && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                              <ZapIcon className="size-2.5 fill-white" /> Rekomendasi Utama
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Role: {ROLE_LABELS[rec.user.role]?.label}</p>
                        <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-muted-foreground">
                          <span>Beban Aktif: <strong className="text-foreground">{rec.activeTasksCount} tugas</strong></span>
                          <span>•</span>
                          <span>Ketepatan Waktu: <strong className="text-emerald-600">{rec.onTimeRate}%</strong></span>
                        </div>
                        {rec.reasons && rec.reasons.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {rec.reasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="inline-block text-[9.5px] font-medium bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded-md border border-border/60"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-base md:text-lg font-black text-red-600 dark:text-red-400">
                          {rec.matchScore}%
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">Skor Kesesuaian</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notes / Special Instructions */}
        <div className="space-y-1.5 mt-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Instruksi Khusus Pendelegasian (Opsional)
          </label>
          <Textarea
            value={reasonNotes}
            onChange={(e) => setReasonNotes(e.target.value)}
            placeholder="Contoh: Mohon prioritaskan verifikasi anggaran SPJ dan koordinasikan berkas lampiran dengan divisi keuangan."
            className="rounded-xl text-xs md:text-sm resize-none h-20 border-border bg-background"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-5 text-xs md:text-sm font-semibold rounded-xl"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelegation}
            disabled={selectedUserIds.length === 0 || isSubmitting}
            className="h-11 px-6 text-xs md:text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs gap-2"
          >
            {isSubmitting
              ? "Menyimpan Delegasi..."
              : selectedUserIds.length > 1
              ? `Konfirmasi & Delegasikan (2 Pelaksana)`
              : `Konfirmasi & Delegasikan (1 Pelaksana)`}
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
