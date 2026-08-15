"use client"

import * as React from "react"
import {
  CircleHelpIcon,
  SearchIcon,
  BookOpenIcon,
  MessageSquareIcon,
  MapPinIcon,
  CheckSquareIcon,
  UserCheckIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
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

const faqCategories = [
  {
    icon: MapPinIcon,
    title: "Presensi & Geofence",
    desc: "Cara clock-in, batas geofence 200m, kendala GPS & verifikasi posisi.",
  },
  {
    icon: CheckSquareIcon,
    title: "Task Management",
    desc: "Pembuatan tugas baru, pengikatan tim, batas deadline, & persetujuan hasil.",
  },
  {
    icon: UserCheckIcon,
    title: "Pengajuan Cuti & Izin",
    desc: "Form pengajuan cuti tahunan/sakit, mekanisme approval atasan, & quota.",
  },
  {
    icon: SparklesIcon,
    title: "Sistem WorkPulse AI",
    desc: "Cara kerja AI Insights, rekomendasi otomatis, & indeks risiko kelelahan.",
  },
]

const faqItems = [
  {
    q: "Mengapa clock-in presensi saya ditolak atau keluar status 'Di Luar Geofence'?",
    a: "Sistem WorkPulse menerapkan verifikasi lokasi Geofence dengan radius maksimum 200 meter dari titik koordinat kantor Telkom Akses. Pastikan GPS HP Anda aktif dengan akurasi tinggi dan Anda berada di area kantor.",
  },
  {
    q: "Bagaimana prosedur pengajuan cuti bagi karyawan Mitra (Non-Telkom)?",
    a: "Pengajuan cuti dapat dilakukan melalui menu 'Presensi & Kehadiran' > 'Ajukan Cuti Baru'. Pengajuan akan diteruskan ke Supervisor Telkom Akses dan Admin HR Mitra untuk persetujuan bersama.",
  },
  {
    q: "Bagaimana cara membaca skor rekomendasi WorkPulse AI Insights?",
    a: "Rekomendasi AI dihitung berdasarkan kombinasi tren beban kerja bulanan, durasi lembur harian, dan pencapaian SLA tiket. Rekomendasi berstatus 'Tinggi' sebaiknya segera ditindaklanjuti oleh Team Lead.",
  },
  {
    q: "Apakah data log aktivitas dapat diubah atau dihapus oleh user?",
    a: "Tidak. Log Aktivitas & Audit Trail sistem WorkPulse dirancang bersifat immutable (tidak dapat diubah atau dihapus) guna menjamin kepatuhan audit standar Telkom Akses.",
  },
  {
    q: "Ke mana saya harus menghubungi jika akun saya terkunci atau lupa password?",
    a: "Anda dapat menghubungi Layanan IT Helpdesk Telkom Akses via WhatsApp Hotline 0811-2233-4455 atau mengirim tiket bantuan melalui form di bawah ini.",
  },
]

export default function BantuanPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0)

  const filteredFaqs = React.useMemo(() => {
    return faqItems.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleSubmitTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast.success("Tiket bantuan Anda telah dikirim! Tim Support Telkom Akses akan merespon dalam 1x24 jam.")
    ;(e.target as HTMLFormElement).reset()
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
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-12">
          {/* Hero Banner Header */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-700 via-red-600 to-rose-600 p-6 sm:p-10 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md mb-3">
                WorkPulse Support Center
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Bagaimana Kami Bisa Membantu Anda?
              </h1>
              <p className="mt-2 text-sm text-red-100">
                Temukan jawaban cepat seputar penggunaan platform WorkPulse Telkom Akses, panduan fitur, atau hubungi Helpdesk resmi kami.
              </p>

              {/* Big Search Input */}
              <div className="relative mt-6">
                <SearchIcon className="absolute left-4 top-3.5 size-5 text-gray-400" />
                <Input
                  placeholder="Cari kata kunci masalah (misal: Geofence, Cuti, Password)..."
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
            {faqCategories.map((cat, idx) => {
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
            {/* FAQ Accordion Section (8 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BookOpenIcon className="size-5 text-red-600" />
                    Pertanyaan Yang Sering Diajukan (FAQ)
                  </CardTitle>
                  <CardDescription>
                    Jawaban cepat untuk pertanyaan teknis & operasional harian.
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
                    Kirim Tiket Bantuan Helpdesk
                  </CardTitle>
                  <CardDescription>
                    Tim teknis Telkom Akses siap membantu kendala Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmitTicket} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nama" className="text-xs font-semibold">Nama Lengkap</Label>
                      <Input id="nama" placeholder="Budi Admin" required className="h-9 text-xs rounded-xl" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="kategori" className="text-xs font-semibold">Kategori Masalah</Label>
                      <Select defaultValue="Presensi & Geofence">
                        <SelectTrigger className="h-9 text-xs rounded-xl">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Presensi & Geofence">Presensi & Geofence</SelectItem>
                          <SelectItem value="Akun & Password">Akun & Password</SelectItem>
                          <SelectItem value="Task & Shift">Task & Shift Management</SelectItem>
                          <SelectItem value="AI Insights">AI Insights & Analytics</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="subjek" className="text-xs font-semibold">Subjek Kendala</Label>
                      <Input id="subjek" placeholder="Contoh: Kendala GPS Geofence tidak terbaca" required className="h-9 text-xs rounded-xl" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pesan" className="text-xs font-semibold">Detail Pesan / Deskripsi</Label>
                      <Textarea
                        id="pesan"
                        placeholder="Jelaskan secara singkat kendala yang dialami beserta pesan error..."
                        required
                        className="text-xs rounded-xl min-h-[90px]"
                      />
                    </div>

                    <Button type="submit" className="w-full h-10 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl mt-1">
                      <SendIcon className="size-4" /> Kirim Tiket Helpdesk
                    </Button>
                  </form>

                  <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                    <span className="text-xs font-semibold text-foreground">Kontak Langsung Helpdesk:</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <PhoneIcon className="size-3.5 text-red-600" />
                      <span>WhatsApp Hotline: 0811-2233-4455</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MailIcon className="size-3.5 text-red-600" />
                      <span>Email Support: helpdesk@telkomakses.co.id</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
