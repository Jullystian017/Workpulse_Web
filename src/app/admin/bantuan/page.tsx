"use client"

import * as React from "react"
import {
  InboxIcon,
  BookOpenIcon,
  SearchIcon,
  CircleHelpIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  KeyRoundIcon,
  MapPinIcon,
  CheckSquareIcon,
  CalendarCheckIcon,
  SparklesIcon,
  ShieldCheckIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  FilterIcon,
  CheckIcon,
  RefreshCwIcon
} from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface HelpTicket {
  id: string
  nama: string
  nik: string
  roleType: "Telkom Organik" | "Mitra Non-Telkom"
  department: string
  kategori: string
  subjek: string
  pesan: string
  waktu: string
  status: "pending" | "in_progress" | "resolved"
  adminReply?: string
}

const initialTickets: HelpTicket[] = [
  {
    id: "TKT-8921",
    nama: "Andi Pratama",
    nik: "10293841",
    roleType: "Telkom Organik",
    department: "IT & Network Infrastructure",
    kategori: "Presensi & Geofence",
    subjek: "GPS presensi tidak terbaca di lantai 2 gedung barat",
    pesan: "Selamat pagi admin, saat presensi jam 08:00 tadi GPS terdeteksi jarak 215m padahal saya sudah berada di lantai 2 gedung. Mohon bantuannya untuk verifikasi dispensasi hadir tepat waktu.",
    waktu: "10 menit yang lalu",
    status: "pending",
  },
  {
    id: "TKT-8920",
    nama: "Siti Rahmawati",
    nik: "10293843",
    roleType: "Mitra Non-Telkom",
    department: "Customer Service & Field Support",
    kategori: "Akun & Password",
    subjek: "Permintaan reset password akun terkunci",
    pesan: "Kata sandi saya salah input 3x saat mau login pagi ini dan sekarang akun terkunci. Mohon diresetkan password ke format default NIK. Terima kasih.",
    waktu: "25 menit yang lalu",
    status: "pending",
  },
  {
    id: "TKT-8918",
    nama: "Budi Santoso",
    nik: "10293842",
    roleType: "Telkom Organik",
    department: "Teknisi Pemeliharaan Jaringan",
    kategori: "Tugas & Bukti Fisik",
    subjek: "Kendala upload nota material fiber optic di Task #1029",
    pesan: "File foto nota pengerjaan berukuran 4.5MB gagal terunggah dengan pesan timeout. Mohon solusinya atau konfirmasi penerimaan manual.",
    waktu: "1 jam yang lalu",
    status: "in_progress",
    adminReply: "Sedang dicek oleh tim IT. Anda bisa mencoba kompres foto di bawah 2MB terlebih dahulu.",
  },
  {
    id: "TKT-8915",
    nama: "Dedi Kurniawan",
    nik: "10293845",
    roleType: "Mitra Non-Telkom",
    department: "Instalasi & Aktivasi Lapangan",
    kategori: "Pengajuan Cuti & Izin",
    subjek: "Koreksi tanggal pengajuan cuti tahunan",
    pesan: "Saya salah memilih tanggal selesai cuti yang seharusnya tanggal 28 Agustus bukan 29 Agustus. Mohon bantuan revisi tanggalnya min.",
    waktu: "Kemarin, 16:30 WIB",
    status: "resolved",
    adminReply: "Tanggal cuti tahunan telah disesuaikan menjadi 28 Agustus 2026. Pengajuan telah disetujui atasan.",
  },
]

const adminFaqCategories = [
  {
    icon: UserIcon,
    title: "Manajemen Akun & Role",
    desc: "Pendaftaran karyawan, reset password NIK, pemetaan Organik vs Mitra, & nonaktivasi akun.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Approval Cuti & Presensi",
    desc: "Mekanisme setujui/tolak pengajuan cuti, validasi bukti surat dokter, & koreksi absensi.",
  },
  {
    icon: CheckSquareIcon,
    title: "Delegasi Tugas & Verifikasi",
    desc: "Pembuatan tiket, penugasan teknisi, verifikasi nota fisik, & approval status 'Done'.",
  },
  {
    icon: SparklesIcon,
    title: "AI Hub & Rekap Laporan",
    desc: "Analisis performa Gemini AI, monitoring risiko kelelahan, & ekspor dokumen PDF/Excel.",
  },
]

const adminFaqItems = [
  {
    category: "Akun",
    q: "Bagaimana cara mereset password akun karyawan yang terkunci atau lupa kata sandi?",
    a: "Admin dapat membuka menu 'Karyawan' > cari nama/NIK karyawan terkait > klik tombol titik tiga (⋮) atau 'Lihat Detail Log' > pilih 'Reset Password'. Password akan otomatis dikembalikan ke format default NIK.",
  },
  {
    category: "Presensi",
    q: "Bagaimana alur persetujuan (Approval) atau penolakan pengajuan cuti & izin sakit karyawan?",
    a: "Buka menu 'Presensi & Kehadiran' > lihat tab 'Persetujuan Cuti Pending'. Admin dapat meninjau lampiran surat izin/dokter, membaca alasan pengajuan, lalu menekan tombol hijau 'Setujui' atau merah 'Tolak'. Status akan langsung terupdate ke portal karyawan secara real-time.",
  },
  {
    category: "Presensi",
    q: "Bagaimana jika ada karyawan yang bertugas dinas luar sehingga di luar radius 200m?",
    a: "Sistem presensi GPS mencatat status 'Di Luar Area Valid'. Admin/Supervisor dapat melakukan verifikasi manual pada log kehadiran karyawan tersebut dengan membuka Detail Log presensi dan menambahkan catatan dispensasi 'Dinas Luar Terverifikasi'.",
  },
  {
    category: "Tasks",
    q: "Bagaimana prosedur verifikasi bukti fisik / nota operasional sebelum menyelesaikan tugas ('Done')?",
    a: "Ketika karyawan memindahkan tugas ke kolom 'Review', buka detail tugas untuk memeriksa checklist sub-tugas dan dokumen/foto nota lampiran yang diunggah. Jika pekerjaan telah valid, klik tombol 'Setujui & Selesaikan Tugas' untuk merubah status menjadi 'Done'.",
  },
  {
    category: "Laporan",
    q: "Bagaimana cara mengunduh laporan rekapitulasi kinerja bulanan untuk audit manajemen?",
    a: "Buka menu 'Laporan' > 'Laporan Kinerja' atau 'Rekap Kehadiran'. Tentukan rentang periode bulan yang diinginkan, lalu klik tombol 'Ekspor Data' di pojok kanan atas untuk mengunduh rekap berformat Excel (.xlsx) atau PDF rekapitulasi resmi Telkom Akses.",
  },
  {
    category: "AI",
    q: "Bagaimana cara kerja Gemini AI dalam memberikan rekomendasi pembagian beban kerja tim?",
    a: "WorkPulse AI menganalisis akumulasi jam kerja, tingkat ketepatan waktu presensi, persentase penyelesaian tugas, dan jumlah tiket aktif per individu (17 akun). Jika terdapat teknisi dengan indikator kelebihan beban (overload), AI akan menyarankan rotasi tugas atau rekomendasi penyesuaian shift kerja.",
  },
]

export default function AdminBantuanPage() {
  const [tickets, setTickets] = React.useState<HelpTicket[]>(initialTickets)
  const [selectedTicket, setSelectedTicket] = React.useState<HelpTicket | null>(null)
  const [replyText, setReplyText] = React.useState("")
  const [replyStatus, setReplyStatus] = React.useState<"pending" | "in_progress" | "resolved">("resolved")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchTicket, setSearchTicket] = React.useState("")
  const [searchFaq, setSearchFaq] = React.useState("")
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0)

  // Filtered Tickets
  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = statusFilter === "all" || t.status === statusFilter
      const matchSearch =
        t.nama.toLowerCase().includes(searchTicket.toLowerCase()) ||
        t.nik.includes(searchTicket) ||
        t.subjek.toLowerCase().includes(searchTicket.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTicket.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [tickets, statusFilter, searchTicket])

  // Filtered FAQs
  const filteredFaqs = React.useMemo(() => {
    return adminFaqItems.filter(
      (item) =>
        item.q.toLowerCase().includes(searchFaq.toLowerCase()) ||
        item.a.toLowerCase().includes(searchFaq.toLowerCase()) ||
        item.category.toLowerCase().includes(searchFaq.toLowerCase())
    )
  }, [searchFaq])

  const pendingCount = tickets.filter((t) => t.status === "pending").length

  const handleOpenTicket = (ticket: HelpTicket) => {
    setSelectedTicket(ticket)
    setReplyText(ticket.adminReply || "")
    setReplyStatus(ticket.status === "pending" ? "resolved" : ticket.status)
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, status: replyStatus, adminReply: replyText }
          : t
      )
    )

    toast.success(`Balasan untuk tiket #${selectedTicket.id} (${selectedTicket.nama}) berhasil dikirim!`)
    setSelectedTicket(null)
  }

  const handleQuickResetPassword = (ticket: HelpTicket) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              status: "resolved",
              adminReply: `Password akun NIK ${ticket.nik} telah berhasil direset ke format default. Silakan login kembali.`,
            }
          : t
      )
    )
    toast.success(`Password akun ${ticket.nama} (NIK: ${ticket.nik}) berhasil direset ke format default! Tiket otomatis diselesaikan.`)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
        <SiteHeader />
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-[8px] bg-linear-to-r from-red-700 via-red-600 to-rose-600 p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md text-xs font-semibold">
                  Helpdesk & Bantuan Admin
                </Badge>
                {pendingCount > 0 && (
                  <Badge className="bg-amber-400 text-zinc-950 font-bold border-amber-300 text-xs">
                    {pendingCount} Tiket Karyawan Menunggu Respon
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pusat Bantuan & Kotak Masuk Helpdesk
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-red-100 leading-relaxed">
                Kelola dan tanggapi pesan kendala presensi, tugas, dan akun dari 17 karyawan kantor, serta akses panduan operasional administrator Telkom Akses.
              </p>
            </div>
            <CircleHelpIcon className="absolute -right-6 -bottom-6 size-64 text-white/10 pointer-events-none" />
          </div>

          {/* Main Tabs Navigation */}
          <Tabs defaultValue="inbox" className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <TabsList className="bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-[8px] h-11 border border-zinc-200 dark:border-zinc-700">
                <TabsTrigger
                  value="inbox"
                  className="rounded-[8px] px-5 text-xs font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-red-600 data-[state=active]:shadow-xs transition-all"
                >
                  <InboxIcon className="size-4" />
                  <span>Kotak Masuk Tiket Karyawan</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="panduan"
                  className="rounded-[8px] px-5 text-xs font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-red-600 data-[state=active]:shadow-xs transition-all"
                >
                  <BookOpenIcon className="size-4" />
                  <span>Panduan & FAQ Administrator</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: KOTAK MASUK TIKET KARYAWAN */}
            <TabsContent value="inbox" className="space-y-6 mt-0">
              {/* 4 Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-[8px] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-xs font-semibold text-zinc-500">Total Tiket Masuk</span>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                    {tickets.length} <span className="text-xs font-normal text-zinc-400">Tiket</span>
                  </p>
                  <span className="text-[11px] text-zinc-400 mt-2 block">Seluruh riwayat pesan karyawan</span>
                </div>

                <div className="bg-amber-50/60 dark:bg-amber-950/20 p-5 rounded-[8px] border border-amber-200 dark:border-amber-900/60 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">Menunggu Respon</span>
                    <AlertCircleIcon className="size-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                    {tickets.filter((t) => t.status === "pending").length} <span className="text-xs font-normal text-amber-600/70">Perlu Tindakan</span>
                  </p>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 block">Prioritas respon &lt; 1 jam</span>
                </div>

                <div className="bg-blue-50/60 dark:bg-blue-950/20 p-5 rounded-[8px] border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Sedang Ditangani</span>
                    <ClockIcon className="size-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                    {tickets.filter((t) => t.status === "in_progress").length} <span className="text-xs font-normal text-blue-600/70">Tiket</span>
                  </p>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 block">Dalam koordinasi tim teknis</span>
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-5 rounded-[8px] border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Selesai Ditangani</span>
                    <CheckCircle2Icon className="size-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    {tickets.filter((t) => t.status === "resolved").length} <span className="text-xs font-normal text-emerald-600/70">Tiket</span>
                  </p>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 block">100% terselesaikan</span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-[8px] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <div className="relative w-full sm:w-80">
                  <SearchIcon className="absolute left-3.5 top-2.5 size-4 text-zinc-400" />
                  <Input
                    placeholder="Cari NIK, nama, atau subjek tiket..."
                    value={searchTicket}
                    onChange={(e) => setSearchTicket(e.target.value)}
                    className="pl-10 h-9 text-xs rounded-[8px]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <FilterIcon className="size-4 text-zinc-400 hidden sm:block" />
                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
                    <SelectTrigger className="h-9 text-xs rounded-[8px] w-full sm:w-48">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[8px] text-xs">
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu Respon ({pendingCount})</SelectItem>
                      <SelectItem value="in_progress">Sedang Ditangani</SelectItem>
                      <SelectItem value="resolved">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ticket Cards List */}
              <div className="space-y-3">
                {filteredTickets.map((ticket) => {
                  const isPending = ticket.status === "pending"
                  const isInProgress = ticket.status === "in_progress"
                  const isResolved = ticket.status === "resolved"

                  return (
                    <div
                      key={ticket.id}
                      className={`p-5 rounded-[8px] border transition-all bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPending
                          ? "border-amber-300 dark:border-amber-900/80 shadow-xs ring-1 ring-amber-200/50 dark:ring-amber-900/30"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                      }`}
                    >
                      <div className="space-y-2 max-w-3xl">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900">
                            #{ticket.id}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              isPending
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : isInProgress
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {isPending ? "Menunggu Respon" : isInProgress ? "Sedang Ditangani" : "Selesai"}
                          </Badge>
                          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            {ticket.kategori}
                          </span>
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <ClockIcon className="size-3" /> {ticket.waktu}
                          </span>
                        </div>

                        {/* Title & Employee Info */}
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                            {ticket.subjek}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Pengirim: <strong>{ticket.nama}</strong> (NIK: {ticket.nik}) &bull; {ticket.roleType} &bull; {ticket.department}
                          </p>
                        </div>

                        {/* Message Preview */}
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-[8px] border border-zinc-100 dark:border-zinc-800/80 leading-relaxed">
                          &quot;{ticket.pesan}&quot;
                        </p>

                        {/* Admin Reply Preview if any */}
                        {ticket.adminReply && (
                          <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-[8px] border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2">
                            <CheckCircle2Icon className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Respon Admin:</strong> {ticket.adminReply}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0">
                        {/* Quick Reset Action if Category is Password */}
                        {ticket.kategori === "Akun & Password" && isPending && (
                          <Button
                            size="sm"
                            onClick={() => handleQuickResetPassword(ticket)}
                            className="h-8 px-3 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-[8px] shadow-xs"
                          >
                            <KeyRoundIcon className="size-3.5 mr-1 text-amber-400" />
                            Reset Password NIK
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => handleOpenTicket(ticket)}
                          className={`h-8 px-4 text-xs font-semibold rounded-[8px] shadow-xs ${
                            isPending
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          <MessageSquareIcon className="size-3.5 mr-1.5" />
                          {isPending ? "Respon & Balas" : "Lihat / Edit Respon"}
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {filteredTickets.length === 0 && (
                  <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-[8px] border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
                    Tidak ada tiket bantuan yang sesuai dengan filter.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: PANDUAN & FAQ ADMINISTRATOR */}
            <TabsContent value="panduan" className="space-y-6 mt-0">
              {/* 4 Admin Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {adminFaqCategories.map((cat, idx) => {
                  const Icon = cat.icon
                  return (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs hover:shadow-md hover:border-red-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="size-10 rounded-[8px] bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-3">
                          <Icon className="size-5" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-red-600 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Main FAQ Accordion */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-[8px] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <BookOpenIcon className="size-5 text-red-600" />
                      Panduan Operasional & FAQ Administrator
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Prosedur tata kelola 17 akun karyawan, approval presensi/cuti, dan verifikasi tugas
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <SearchIcon className="absolute left-3.5 top-2.5 size-4 text-zinc-400" />
                    <Input
                      placeholder="Cari SOP / panduan admin..."
                      value={searchFaq}
                      onChange={(e) => setSearchFaq(e.target.value)}
                      className="pl-10 h-9 text-xs rounded-[8px]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index
                    return (
                      <div
                        key={index}
                        className={`rounded-[8px] border transition-all overflow-hidden bg-white dark:bg-zinc-900 ${
                          isOpen
                            ? "border-red-200 dark:border-red-900/60 shadow-xs"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full p-4 flex items-center justify-between text-left gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 mt-0.5">
                              {faq.category}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                              {faq.q}
                            </span>
                          </div>
                          {isOpen ? (
                            <ChevronUpIcon className="size-4 text-red-600 shrink-0" />
                          ) : (
                            <ChevronDownIcon className="size-4 text-zinc-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 mt-1">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* DIALOG MODAL: RESPON & BALAS TIKET BANTUAN */}
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-lg rounded-[8px] p-6">
            {selectedTicket && (
              <form onSubmit={handleSendReply} className="space-y-4">
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      #{selectedTicket.id}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {selectedTicket.kategori}
                    </Badge>
                  </div>
                  <DialogTitle className="text-lg font-bold text-zinc-900 mt-1">
                    {selectedTicket.subjek}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-500">
                    Pengirim: <strong>{selectedTicket.nama}</strong> (NIK: {selectedTicket.nik}) &bull; {selectedTicket.department}
                  </DialogDescription>
                </DialogHeader>

                {/* Original Message Box */}
                <div className="p-3.5 rounded-[8px] bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Pesan Kendala Karyawan:
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                    &quot;{selectedTicket.pesan}&quot;
                  </p>
                </div>

                {/* Status Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="replyStatus" className="text-xs font-semibold">
                    Ubah Status Tiket
                  </Label>
                  <Select
                    value={replyStatus}
                    onValueChange={(val) => val && setReplyStatus(val as "pending" | "in_progress" | "resolved")}
                  >
                    <SelectTrigger className="h-9 text-xs rounded-[8px]">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[8px] text-xs">
                      <SelectItem value="pending">Menunggu Respon (Pending)</SelectItem>
                      <SelectItem value="in_progress">Sedang Ditangani (In Progress)</SelectItem>
                      <SelectItem value="resolved">Selesai (Resolved)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Reply Textarea */}
                <div className="space-y-1.5">
                  <Label htmlFor="replyText" className="text-xs font-semibold">
                    Tulis Balasan / Tindakan Admin:
                  </Label>
                  <Textarea
                    id="replyText"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tuliskan instruksi, konfirmasi perbaikan, atau respon kepada karyawan..."
                    required
                    className="text-xs rounded-[8px] min-h-[90px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedTicket(null)}
                    className="h-9 px-4 text-xs font-semibold rounded-[8px]"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                  >
                    <SendIcon className="size-3.5 mr-1.5" />
                    Kirim Balasan ke Karyawan
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
