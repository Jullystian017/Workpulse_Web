"use client"

import * as React from "react"
import {
  BellIcon,
  CheckCheckIcon,
  SearchIcon,
  Trash2Icon,
  CalendarCheckIcon,
  AlertTriangleIcon,
  CheckSquareIcon,
  SparklesIcon,
  InfoIcon,
  ClockIcon,
  FilterIcon,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const initialNotifications = [
  {
    id: "NOTIF-001",
    type: "pengajuan_cuti",
    title: "Pengajuan Cuti Baru: Mukhlis Amir",
    desc: "Karyawan Mukhlis Amir (HR) mengajukan Cuti Tahunan selama 3 hari (14-16 Agt 2026). Membutuhkan persetujuan Atasan.",
    time: "10 menit yang lalu",
    read: false,
    priority: "Tinggi",
  },
  {
    id: "NOTIF-002",
    type: "ai_insight",
    title: "AI Detection Alert: Overload Workload Tim IT",
    desc: "WorkPulse AI mendeteksi 3 karyawan IT bekerja melebihi 10 jam/hari. Buka AI Insights untuk melihat opsi rekomendasi.",
    time: "45 menit yang lalu",
    read: false,
    priority: "Tinggi",
  },
  {
    id: "NOTIF-003",
    type: "task",
    title: "Tugas Baru Ditugaskan: Maintenance Core Fiber OLT",
    desc: "Tugas 'Maintenance Core Fiber OLT Jabar-3' telah ditetapkan untuk Tim Operations Jakarta Barat. Deadline: Besok 17:00.",
    time: "2 jam yang lalu",
    read: false,
    priority: "Sedang",
  },
  {
    id: "NOTIF-004",
    type: "geofence",
    title: "Peringatan Geofence: Clock-in Luar Area",
    desc: "Karyawan Oscar Budiman melakukan Clock-In pada jarak 180m di luar geofence utama kantor. Verifikasi lokasi telah dicatat.",
    time: "3 jam yang lalu",
    read: true,
    priority: "Sedang",
  },
  {
    id: "NOTIF-005",
    type: "system",
    title: "Pemberitahuan Sistem: Pemeliharaan Server Rutin",
    desc: "Sistem WorkPulse akan melakukan pemeliharaan database rutin pada Sabtu jam 01:00 - 03:00 WIB. Layanan tetap berjalan normal.",
    time: "1 hari yang lalu",
    read: true,
    priority: "Rendah",
  },
  {
    id: "NOTIF-006",
    type: "task",
    title: "Tugas Selesai: Audit Kinerja SDM Q2 Telkom Akses",
    desc: "Siti Rahayu telah menyelesaikan tugas rekapitulasi audit SDM Q2 dan melampirkan berkas laporan akhir.",
    time: "2 hari yang lalu",
    read: true,
    priority: "Rendah",
  },
]

export default function NotifikasiPage() {
  const [notifications, setNotifications] = React.useState(initialNotifications)
  const [searchQuery, setSearchQuery] = React.useState("")

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("Semua notifikasi berhasil ditandai sebagai dibaca!")
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleDeleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success("Notifikasi berhasil dihapus.")
  }

  const filterNotifications = (tabValue: string) => {
    return notifications.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.desc.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false

      if (tabValue === "unread") return !n.read
      if (tabValue === "cuti") return n.type === "pengajuan_cuti"
      if (tabValue === "ai") return n.type === "ai_insight"
      if (tabValue === "task") return n.type === "task"
      return true
    })
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
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Pusat Notifikasi & Alert WorkPulse
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-red-600 text-white font-semibold">
                    {unreadCount} Belum Dibaca
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitoring update tugas, pengajuan cuti, peringatan geofence, dan alert otomatis dari AI.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleMarkAllRead}
                variant="outline"
                className="h-9 text-xs gap-1.5 font-semibold rounded-xl"
                disabled={unreadCount === 0}
              >
                <CheckCheckIcon className="size-4" /> Tandai Semua Dibaca
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <SearchIcon className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari notifikasi berdasarkan kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs rounded-xl"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full flex-col gap-4">
            <TabsList className="h-9 bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start">
              <TabsTrigger value="all" className="text-xs gap-1.5 px-3">
                Semua ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs gap-1.5 px-3">
                Belum Dibaca ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="cuti" className="text-xs gap-1.5 px-3">
                Pengajuan Cuti
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs gap-1.5 px-3">
                AI & System Alert
              </TabsTrigger>
              <TabsTrigger value="task" className="text-xs gap-1.5 px-3">
                Tugas & Shift
              </TabsTrigger>
            </TabsList>

            {["all", "unread", "cuti", "ai", "task"].map((tab) => {
              const list = filterNotifications(tab)
              return (
                <TabsContent key={tab} value={tab} className="m-0">
                  <Card>
                    <CardContent className="p-0 divide-y">
                      {list.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleMarkAsRead(item.id)}
                          className={`p-4 flex items-start gap-4 transition-colors cursor-pointer ${
                            item.read ? "bg-card opacity-75" : "bg-red-50/40 dark:bg-red-950/20"
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              item.type === "pengajuan_cuti"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                : item.type === "ai_insight"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : item.type === "task"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {item.type === "pengajuan_cuti" ? (
                              <CalendarCheckIcon className="size-5" />
                            ) : item.type === "ai_insight" ? (
                              <SparklesIcon className="size-5" />
                            ) : item.type === "task" ? (
                              <CheckSquareIcon className="size-5" />
                            ) : (
                              <AlertTriangleIcon className="size-5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-semibold ${item.read ? "text-foreground" : "text-foreground font-bold"}`}>
                                  {item.title}
                                </h4>
                                {!item.read && (
                                  <span className="size-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.desc}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-center">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNotif(item.id)
                              }}
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-red-600 rounded-lg"
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {list.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                          <BellIcon className="size-10 mx-auto opacity-30 mb-2" />
                          <p className="text-sm font-medium">Tidak ada notifikasi dalam kategori ini.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
