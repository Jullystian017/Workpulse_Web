"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ClockIcon,
  ClipboardListIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getActiveUserFromStorage,
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api"
import { NotificationItem, User, NotificationType } from "@/types/database"
import { useRealtimeNotifications } from "@/hooks/use-realtime"

export function NotificationBellDropdown() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"all" | "unread">("all")

  const loadNotifications = React.useCallback(async () => {
    const user = getActiveUserFromStorage()
    if (!user) return
    setCurrentUser(user)
    try {
      const items = await getNotificationsForUser(user)
      setNotifications(items)
    } catch (e) {
      console.warn("Failed to load notifications:", e)
    }
  }, [])

  // Live real-time notification listener via Supabase WebSocket
  useRealtimeNotifications(currentUser?.id, (newNotif) => {
    setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)])
  })

  React.useEffect(() => {
    loadNotifications()
    // Background safety sync (every 60s)
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.is_read).length
  }, [notifications])

  const filteredNotifs = React.useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.is_read)
    }
    return notifications
  }, [notifications, activeTab])

  const handleItemClick = async (notif: NotificationItem) => {
    if (currentUser) {
      await markNotificationAsRead(notif.id, currentUser.id)
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    )
    setIsOpen(false)

    if (notif.link_url) {
      router.push(notif.link_url)
    }
  }

  const handleMarkAllRead = async () => {
    if (!currentUser) return
    const ids = notifications.map((n) => n.id)
    await markAllNotificationsAsRead(currentUser, ids)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "task_approved":
        return <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
      case "task_submitted":
        return <ClockIcon className="size-4 text-amber-600 dark:text-amber-400" />
      case "task_returned":
        return <AlertCircleIcon className="size-4 text-orange-600 dark:text-orange-400" />
      case "task_overdue":
        return <AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" />
      case "task_delegated":
      case "task_assigned":
        return <ClipboardListIcon className="size-4 text-blue-600 dark:text-blue-400" />
      case "system":
      default:
        return <ShieldCheckIcon className="size-4 text-purple-600 dark:text-purple-400" />
    }
  }

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Baru saja"
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Baru saja"
    if (diffMins < 60) return `${diffMins} mnt lalu`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} jam lalu`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} hari lalu`
  }

  const fullNotifPageUrl =
    currentUser?.role === "admin" ? "/admin/notifikasi" : "/karyawan/notifikasi"

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 cursor-pointer outline-none">
        <BellIcon className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-zinc-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span className="absolute right-1 top-1 flex size-1.5 rounded-full bg-zinc-400/40"></span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 rounded-2xl p-0 shadow-lg border border-border bg-popover overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Notifikasi</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              {currentUser?.role === "admin" ? "Superadmin" : "Portal Karyawan"}
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-600 text-white">
                {unreadCount} baru
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-muted-foreground hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckCheckIcon className="size-3.5" />
              <span>Tandai dibaca</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-border text-[11px] font-semibold bg-background">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "all"
                ? "border-red-600 text-red-600 dark:text-red-400 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "unread"
                ? "border-red-600 text-red-600 dark:text-red-400 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
        </div>

        {/* List Content */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {filteredNotifs.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <BellIcon className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs font-semibold text-foreground">Tidak ada notifikasi baru</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {activeTab === "unread"
                  ? "Semua pemberitahuan sudah Anda baca."
                  : "Belum ada agenda atau tugas baru yang memerlukan perhatian."}
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-muted/40 ${
                  !notif.is_read ? "bg-red-500/[0.03] dark:bg-red-500/[0.06]" : ""
                }`}
              >
                <div className="size-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs truncate ${
                        !notif.is_read ? "font-bold text-foreground" : "font-medium text-foreground/80"
                      }`}
                    >
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <span className="size-2 rounded-full bg-red-600 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 font-medium">
                    {formatRelativeTime(notif.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false)
              router.push(fullNotifPageUrl)
            }}
            className="w-full h-8 text-xs font-semibold text-muted-foreground hover:text-red-600 justify-center gap-1.5 cursor-pointer"
          >
            <span>Buka Halaman Notifikasi Lengkap</span>
            <ExternalLinkIcon className="size-3" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
