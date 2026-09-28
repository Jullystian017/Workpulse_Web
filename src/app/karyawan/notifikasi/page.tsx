"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  CheckCheckIcon,
  SearchIcon,
  Trash2Icon,
  AlertTriangleIcon,
  CheckSquareIcon,
  ClockIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  AlertCircleIcon,
  RefreshCwIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  getActiveUserFromStorage,
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api"
import { NotificationItem, User, NotificationType } from "@/types/database"

export default function KaryawanNotifikasiPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [searchQuery, setSearchQuery] = setSearchQueryState("")
  const [isLoading, setIsLoading] = React.useState(true)

  function setSearchQueryState(initial: string) {
    return React.useState(initial)
  }

  const loadData = React.useCallback(async () => {
    const user = getActiveUserFromStorage()
    if (!user) return
    setCurrentUser(user)
    setIsLoading(true)
    try {
      const items = await getNotificationsForUser(user)
      setNotifications(items)
    } catch (e) {
      console.warn("Error loading employee notifications:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAllRead = async () => {
    if (!currentUser) return
    const ids = notifications.map((n) => n.id)
    await markAllNotificationsAsRead(currentUser, ids)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    toast.success("Semua notifikasi berhasil ditandai sebagai dibaca!")
  }

  const handleMarkAsRead = async (id: string) => {
    if (!currentUser) return
    await markNotificationAsRead(id, currentUser.id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  const handleDeleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success("Notifikasi dihapus dari daftar tampilan.")
  }

  const handleItemClick = async (notif: NotificationItem) => {
    await handleMarkAsRead(notif.id)
    if (notif.link_url) {
      router.push(notif.link_url)
    }
  }

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "task_approved":
        return <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
      case "task_returned":
        return <AlertCircleIcon className="size-4 text-orange-600 dark:text-orange-400" />
      case "task_overdue":
        return <AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" />
      case "task_submitted":
        return <ClockIcon className="size-4 text-amber-600 dark:text-amber-400" />
      case "task_delegated":
      case "task_assigned":
      default:
        return <CheckSquareIcon className="size-4 text-blue-600 dark:text-blue-400" />
    }
  }

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Baru saja"
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Baru saja"
    if (diffMins < 60) return `${diffMins} menit lalu`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} jam lalu`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} hari lalu`
  }

  const filterNotifications = (tabValue: string) => {
    return notifications.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false

      if (tabValue === "unread") return !n.is_read
      if (tabValue === "approved") return n.type === "task_approved"
      if (tabValue === "revision") return n.type === "task_returned"
      if (tabValue === "overdue") return n.type === "task_overdue"
      return true
    })
  }

  const renderNotifList = (tabValue: string) => {
    const list = filterNotifications(tabValue)

    if (list.length === 0) {
      return (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BellIcon className="size-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-bold text-foreground">Tidak Ada Pemberitahuan</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Tidak ada notifikasi dalam kategori ini. Agenda tugas Anda berjalan lancar.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="flex flex-col gap-2.5">
        {list.map((notif) => (
          <Card
            key={notif.id}
            className={`rounded-xl border transition-all hover:border-red-500/40 shadow-xs ${
              !notif.is_read
                ? "bg-red-500/[0.03] dark:bg-red-500/[0.05] border-red-200/80 dark:border-red-950/80"
                : "bg-card"
            }`}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div
                onClick={() => handleItemClick(notif)}
                className="flex items-start gap-3.5 flex-1 cursor-pointer"
              >
                <div className="size-9 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-xs ${
                        !notif.is_read ? "font-bold text-foreground" : "font-semibold text-foreground/80"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <Badge className="bg-red-600 text-white text-[9px] px-1.5 py-0.2">
                        Baru
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium">
                      • {formatRelativeTime(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {notif.link_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleItemClick(notif)}
                    className="h-8 px-2.5 text-[11px] gap-1.5 font-bold rounded-lg cursor-pointer"
                  >
                    <span>Buka Tugas</span>
                    <ExternalLinkIcon className="size-3" />
                  </Button>
                )}
                {!notif.is_read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Tandai Dibaca
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteNotif(notif.id)}
                  className="size-8 text-muted-foreground hover:text-red-600 cursor-pointer"
                  title="Hapus"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Notifikasi Saya
            </h1>
            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 text-[10px] font-bold">
              Portal Karyawan
            </Badge>
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white font-semibold">
                {unreadCount} Belum Dibaca
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pemberitahuan tugas yang didelegasikan, persetujuan atasan, catatan revisi, dan pengingat batas waktu kerja.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 font-semibold rounded-[8px] cursor-pointer"
          >
            <RefreshCwIcon className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 font-semibold rounded-[8px] cursor-pointer"
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
          placeholder="Cari notifikasi tugas atau informasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 text-xs rounded-[8px]"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full flex flex-col gap-4">
        <TabsList className="h-9 bg-muted p-1 rounded-[8px] w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="all" className="text-xs gap-1.5 px-3">
            Semua ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="text-xs gap-1.5 px-3">
            Belum Dibaca ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs gap-1.5 px-3">
            Tugas Disetujui
          </TabsTrigger>
          <TabsTrigger value="revision" className="text-xs gap-1.5 px-3">
            Catatan Revisi
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs gap-1.5 px-3">
            Peringatan Deadline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderNotifList("all")}</TabsContent>
        <TabsContent value="unread">{renderNotifList("unread")}</TabsContent>
        <TabsContent value="approved">{renderNotifList("approved")}</TabsContent>
        <TabsContent value="revision">{renderNotifList("revision")}</TabsContent>
        <TabsContent value="overdue">{renderNotifList("overdue")}</TabsContent>
      </Tabs>
    </div>
  )
}
