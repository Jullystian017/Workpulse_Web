"use client"

import * as React from "react"
import {
  CalendarRangeIcon,
  PlusIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  FileTextIcon,
  PaperclipIcon,
  UploadIcon,
  SendIcon,
  CalendarIcon
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeaveRequest {
  id: string
  jenis: string
  tglMulai: string
  tglSelesai: string
  durasi: string
  alasan: string
  lampiran?: string
  status: "Disetujui" | "Menunggu Approval" | "Ditolak"
  tglPengajuan: string
  catatanAtasan?: string
}

const initialLeaveHistory: LeaveRequest[] = [
  {
    id: "CUTI-2026-081",
    jenis: "Cuti Tahunan",
    tglMulai: "12 Jul 2026",
    tglSelesai: "14 Jul 2026",
    durasi: "3 Hari",
    alasan: "Keperluan keluarga di luar kota (Pulang Kampung).",
    status: "Disetujui",
    tglPengajuan: "05 Jul 2026",
    catatanAtasan: "Disetujui oleh Supervisor IT. Pekerjaan didelegasikan sementara.",
  },
  {
    id: "CUTI-2026-094",
    jenis: "Izin Sakit",
    tglMulai: "03 Agu 2026",
    tglSelesai: "03 Agu 2026",
    durasi: "1 Hari",
    alasan: "Demam dan flu berat, istirahat rawat jalan di rumah.",
    lampiran: "surat_keterangan_dokter_klinik_telkom.pdf",
    status: "Disetujui",
    tglPengajuan: "03 Agu 2026",
    catatanAtasan: "Surat dokter terverifikasi valid.",
  },
]

export default function KaryawanCutiPage() {
  const [leaveHistory, setLeaveHistory] = React.useState<LeaveRequest[]>(initialLeaveHistory)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [jenisCuti, setJenisCuti] = React.useState("Cuti Tahunan")
  const [tglMulai, setTglMulai] = React.useState("")
  const [tglSelesai, setTglSelesai] = React.useState("")
  const [alasan, setAlasan] = React.useState("")
  const [lampiranName, setLampiranName] = React.useState("")

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tglMulai || !tglSelesai || !alasan.trim()) {
      toast.error("Mohon lengkapi tanggal dan alasan cuti!")
      return
    }

    const newId = `CUTI-2026-${String(leaveHistory.length + 101).padStart(3, "0")}`
    const newRequest: LeaveRequest = {
      id: newId,
      jenis: jenisCuti,
      tglMulai,
      tglSelesai,
      durasi: "1-3 Hari",
      alasan,
      lampiran: lampiranName || undefined,
      status: "Menunggu Approval",
      tglPengajuan: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    }

    setLeaveHistory([newRequest, ...leaveHistory])
    setIsModalOpen(false)
    setAlasan("")
    setLampiranName("")
    toast.success(`Pengajuan ${jenisCuti} berhasil dikirim! Menunggu persetujuan atasan.`)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Header Title & Action Button (Always at the very top) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Pengajuan Cuti & Izin Pribadi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Kelola kuota cuti tahunan Anda, ajukan izin sakit, dan pantau status persetujuan atasan
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-4 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <PlusIcon className="size-3.5 mr-1.5" />
          Ajukan Cuti Baru
        </Button>
      </div>

      {/* 2. 4 Summary Metric Cards (Overview Style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CalendarRangeIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Sisa Kuota Cuti</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                Tahun 2026
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              9 <span className="text-lg font-normal text-muted-foreground">/ 12 Hari</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Hak cuti aktif s/d 31 Des 2026</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CalendarIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Cuti Terpakai</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                Terpakai
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              3 <span className="text-lg font-normal text-muted-foreground">Hari</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Terakhir cuti: 12-14 Juli 2026</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <AlertCircleIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Izin Sakit Tercatat</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                1 Hari
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              1 <span className="text-lg font-normal text-muted-foreground">Hari</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Surat dokter terverifikasi</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Menunggu Review</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                Review SPV
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              1 <span className="text-lg font-normal text-muted-foreground">Pengajuan</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Permohonan cuti 12 Sep 2026</p>
          </div>
        </div>
      </div>

      {/* 3. Tabel Riwayat Pengajuan Cuti Saya */}
      <div className="bg-white dark:bg-zinc-900 rounded-[8px] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Riwayat Permohonan Cuti & Izin Anda
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daftar seluruh pengajuan cuti yang pernah Anda ajukan dan status approval dari atasan
          </p>
        </div>

        <div className="overflow-x-auto rounded-[8px] border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-bold border-b">
              <tr>
                <th className="p-3.5 pl-4">ID & Jenis Cuti</th>
                <th className="p-3.5">Tanggal Pelaksanaan</th>
                <th className="p-3.5">Durasi</th>
                <th className="p-3.5">Alasan Permohonan</th>
                <th className="p-3.5">Dokumen Bukti</th>
                <th className="p-3.5">Tanggal Pengajuan</th>
                <th className="p-3.5 pr-4 text-right">Status Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
              {leaveHistory.map((leave) => {
                const isApproved = leave.status === "Disetujui"
                const isPending = leave.status === "Menunggu Approval"
                const isRejected = leave.status === "Ditolak"

                return (
                  <tr key={leave.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3.5 pl-4">
                      <span className="font-mono text-[11px] font-bold text-red-600 block">#{leave.id}</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{leave.jenis}</span>
                    </td>
                    <td className="p-3.5 text-zinc-700 dark:text-zinc-300">
                      {leave.tglMulai} s/d {leave.tglSelesai}
                    </td>
                    <td className="p-3.5 font-bold text-zinc-900 dark:text-white">{leave.durasi}</td>
                    <td className="p-3.5 text-zinc-600 dark:text-zinc-400 max-w-xs">{leave.alasan}</td>
                    <td className="p-3.5">
                      {leave.lampiran ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded text-[11px] font-medium border border-red-200">
                          <PaperclipIcon className="size-3" /> {leave.lampiran}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-zinc-500">{leave.tglPengajuan}</td>
                    <td className="p-3.5 pr-4 text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${isApproved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isPending
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                          }`}
                      >
                        {leave.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL POPUP DIALOG: FORM AJUKAN CUTI BARU */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[8px] p-6">
          <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">
                Form Pengajuan Cuti / Izin Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Permohonan cuti akan langsung diteruskan ke Supervisor / Admin untuk ditinjau.
              </DialogDescription>
            </DialogHeader>

            {/* Jenis Cuti */}
            <div className="space-y-1.5">
              <Label htmlFor="jenis" className="font-semibold text-zinc-900 dark:text-white">
                Jenis Cuti / Permohonan *
              </Label>
              <Select value={jenisCuti} onValueChange={(val) => setJenisCuti(val ?? "")}>
                <SelectTrigger className="h-9 text-xs rounded-[8px]">
                  <SelectValue placeholder="Pilih Jenis Cuti" />
                </SelectTrigger>
                <SelectContent className="rounded-[8px] text-xs">
                  <SelectItem value="Cuti Tahunan">Cuti Tahunan (Sisa: 9 Hari)</SelectItem>
                  <SelectItem value="Izin Sakit">Izin Sakit (Wajib Surat Dokter)</SelectItem>
                  <SelectItem value="Keperluan Mendesak">Izin Keperluan Mendesak</SelectItem>
                  <SelectItem value="Cuti Khusus">Cuti Khusus (Menikah / Melahirkan / Duka)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Mulai & Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tglMulai" className="font-semibold text-zinc-900 dark:text-white">
                  Tanggal Mulai *
                </Label>
                <Input
                  id="tglMulai"
                  type="date"
                  required
                  value={tglMulai}
                  onChange={(e) => setTglMulai(e.target.value)}
                  className="h-9 text-xs rounded-[8px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tglSelesai" className="font-semibold text-zinc-900 dark:text-white">
                  Tanggal Selesai *
                </Label>
                <Input
                  id="tglSelesai"
                  type="date"
                  required
                  value={tglSelesai}
                  onChange={(e) => setTglSelesai(e.target.value)}
                  className="h-9 text-xs rounded-[8px]"
                />
              </div>
            </div>

            {/* Alasan Cuti */}
            <div className="space-y-1.5">
              <Label htmlFor="alasan" className="font-semibold text-zinc-900 dark:text-white">
                Alasan Pengajuan Cuti *
              </Label>
              <Textarea
                id="alasan"
                required
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Tuliskan alasan izin/cuti dan delegasi pekerjaan jika ada..."
                className="text-xs rounded-[8px] min-h-[75px]"
              />
            </div>

            {/* Upload Dokumen Pendukung */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-zinc-900 dark:text-white">
                Unggah Surat Dokter / Dokumen Pendukung (Opsional)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const mock = `surat_izin_${Date.now().toString().slice(-4)}.pdf`
                    setLampiranName(mock)
                    toast.success(`Dokumen ${mock} berhasil dilampirkan!`)
                  }}
                  className="h-8.5 text-xs font-semibold rounded-[8px] gap-1.5 border-dashed"
                >
                  <UploadIcon className="size-3.5 text-red-600" />
                  {lampiranName ? "Ganti File Lampiran" : "Pilih File PDF / Foto"}
                </Button>
                {lampiranName && (
                  <span className="text-xs text-zinc-600 font-medium font-mono">{lampiranName}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-9 px-4 text-xs font-semibold rounded-[8px]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-9 px-5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
              >
                <SendIcon className="size-3.5 mr-1.5" />
                Kirim Pengajuan Cuti
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
