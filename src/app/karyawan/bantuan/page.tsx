"use client"

import * as React from "react"
import {
  CircleHelpIcon,
  SearchIcon,
  BookOpenIcon,
  MessageSquareIcon,
  MapPinIcon,
  CheckSquareIcon,
  CalendarCheckIcon,
  ShieldCheckIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const karyawanFaqCategories = [
  {
    icon: MapPinIcon,
    title: "Presensi GPS (200m)",
    desc: "Izin lokasi HP/Laptop, radius 200m kantor Telkom Akses, & cara absen tepat waktu.",
  },
  {
    icon: CheckSquareIcon,
    title: "Tugas & Bukti Fisik",
    desc: "Update progress task, checklist pekerjaan, upload foto nota/pekerjaan, & review atasan.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Pengajuan Cuti & Izin",
    desc: "Form cuti tahunan, izin sakit dokter, cek kuota sisa cuti, & status approval.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Akun & Standar K3",
    desc: "Bantuan reset password NIK, penanganan akun terkunci, & pedoman keselamatan kerja.",
  },
]

const karyawanFaqItems = [
  {
    q: "Mengapa muncul notifikasi 'Di Luar Area Valid (Geofence)' saat saya klik Clock In?",
    a: "Sistem WorkPulse memverifikasi titik koordinat GPS perangkat Anda terhadap area kantor Telkom Akses (maksimal radius 200 meter). Pastikan izin GPS perangkat Anda aktif dalam mode Akurasi Tinggi (High Accuracy) dan Anda sudah berada di lingkungan kantor Telkom Akses.",
  },
  {
    q: "Bagaimana jika saya sedang dinas luar / meeting eksternal sehingga tidak berada di kantor?",
    a: "Lakukan Clock In seperti biasa, sistem akan mencatat status 'Di Luar Area Valid'. Segera konfirmasikan tugas dinas Anda kepada atasan/supervisor agar ditambahkan catatan dispensasi 'Dinas Luar Terverifikasi'.",
  },
  {
    q: "Bagaimana cara mengunggah foto nota material fisik atau bukti pekerjaan tugas?",
    a: "Buka menu 'Tugas Saya' > pilih kartu tugas yang sedang dikerjakan > buka bagian 'Lampiran & Bukti Fisik' > klik 'Upload Foto/Nota'. Anda dapat melampirkan file foto JPG/PNG atau dokumen PDF nota pembelian material.",
  },
  {
    q: "Kapan status tugas saya berubah menjadi selesai ('Done')?",
    a: "Setelah Anda menyelesaikan sub-tugas dan menekan tombol 'Submit for Review', tugas akan masuk ke antrean verifikasi atasan. Status akan otomatis berubah menjadi 'Selesai (Done)' setelah disetujui oleh atasan.",
  },
  {
    q: "Bagaimana prosedur pengajuan izin sakit mendadak jika tidak sempat mengajukan cuti sebelumnya?",
    a: "Buka menu 'Pengajuan Cuti' > pilih tipe 'Izin Sakit' > masukkan tanggal dan lampirkan foto surat istirahat dari dokter atau klinik. Pengajuan akan langsung masuk ke atasan untuk disetujui.",
  },
  {
    q: "Apa yang harus saya lakukan jika lupa kata sandi atau akun terkunci?",
    a: "Anda dapat meminta Admin / Supervisor kantor Telkom Akses untuk mereset kata sandi akun Anda kembali ke format default NIK.",
  },
]

export default function KaryawanBantuanPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0)

  const filteredFaqs = React.useMemo(() => {
    return karyawanFaqItems.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleSubmitTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast.success("Pesan kendala Anda telah dikirim ke Tim Support & Admin Kantor Telkom Akses!")
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-700 via-red-600 to-rose-600 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md mb-3">
            WorkPulse Support Center &bull; Karyawan
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Bagaimana Kami Bisa Membantu Anda?
          </h1>
          <p className="mt-2 text-sm text-red-100">
            Temukan panduan cepat presensi GPS 200m, alur pengerjaan tugas kantor, pengajuan cuti, atau hubungi Helpdesk Admin resmi kami.
          </p>

          {/* Big Search Input */}
          <div className="relative mt-6">
            <SearchIcon className="absolute left-4 top-3.5 size-5 text-gray-400" />
            <Input
              placeholder="Cari kata kunci masalah (misal: Geofence, Cuti, Upload Nota, Password)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-sm rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 shadow-md border-0 focus-visible:ring-2 focus-visible:ring-white"
            />
          </div>
        </div>
        <CircleHelpIcon className="absolute -right-6 -bottom-6 size-64 text-white/10 pointer-events-none" />
      </div>

      {/* Quick Categories */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {karyawanFaqCategories.map((cat, idx) => {
          const IconComponent = cat.icon
          return (
            <Card key={idx} className="hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
              <CardHeader className="p-5 pb-3">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300 w-fit mb-2">
                  <IconComponent className="size-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">{cat.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {cat.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Main Content: FAQ + Ticket Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* FAQ Accordion Section (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BookOpenIcon className="size-5 text-red-600" />
                Pertanyaan Yang Sering Diajukan (FAQ Karyawan)
              </CardTitle>
              <CardDescription>
                Jawaban cepat untuk kendala presensi GPS, tugas, dan pengajuan cuti harian.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index
                return (
                  <div
                    key={index}
                    className="rounded-2xl border bg-card overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 font-semibold text-sm hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-foreground">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUpIcon className="size-4 shrink-0 text-red-600" />
                      ) : (
                        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t pt-3 bg-muted/20">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredFaqs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  Tidak ditemukan FAQ yang sesuai dengan pencarian &quot;{searchQuery}&quot;.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Ticket Form Section (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquareIcon className="size-5 text-red-600" />
                Kirim Pesan Bantuan ke Admin Kantor
              </CardTitle>
              <CardDescription>
                Sampaikan kendala presensi atau permintaan izin darurat kepada admin kantor.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSubmitTicket} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nama" className="text-xs font-semibold">Nama Lengkap</Label>
                  <Input id="nama" defaultValue="Andi Pratama" required className="h-9 text-xs rounded-xl" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="kategori" className="text-xs font-semibold">Kategori Kendala</Label>
                  <Select defaultValue="Presensi & Geofence">
                    <SelectTrigger className="h-9 text-xs rounded-xl">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presensi & Geofence">Presensi & Geofence GPS</SelectItem>
                      <SelectItem value="Tugas & Bukti Fisik">Tugas & Bukti Fisik</SelectItem>
                      <SelectItem value="Pengajuan Cuti & Izin">Pengajuan Cuti & Izin</SelectItem>
                      <SelectItem value="Akun & Password">Akun & Password NIK</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="subjek" className="text-xs font-semibold">Subjek Kendala</Label>
                  <Input id="subjek" placeholder="Contoh: GPS presensi tidak terbaca di lantai 2" required className="h-9 text-xs rounded-xl" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pesan" className="text-xs font-semibold">Detail Pesan / Deskripsi</Label>
                  <Textarea
                    id="pesan"
                    placeholder="Jelaskan secara singkat kendala yang Anda alami..."
                    required
                    className="text-xs rounded-xl min-h-[90px]"
                  />
                </div>

                <Button type="submit" className="w-full h-10 font-semibold bg-red-600 hover:bg-red-700 text-white gap-2 rounded-xl mt-1 shadow-xs">
                  <SendIcon className="size-4" /> Kirim Pesan Bantuan
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                <span className="text-xs font-semibold text-foreground">Kontak Langsung HR & Helpdesk:</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <PhoneIcon className="size-3.5 text-red-600" />
                  <span>WhatsApp Hotline HR: 0812-3456-7890</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MailIcon className="size-3.5 text-red-600" />
                  <span>Email HR: admin-hr@telkomakses.co.id</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
