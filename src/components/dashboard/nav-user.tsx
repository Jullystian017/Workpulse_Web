"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, CircleUserRoundIcon, BellIcon, LogOutIcon, ShieldCheckIcon } from "lucide-react"
import { getActiveUserFromStorage, logout } from "@/lib/api"
import { User, ROLE_LABELS } from "@/types/database"
import { toast } from "sonner"

export function NavUser({
  user: fallbackUser,
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  const name = currentUser?.nama || fallbackUser?.name || "Budi Santoso"
  const email = currentUser?.email || fallbackUser?.email || "budi.santoso@telkomakses.co.id"
  const avatar = currentUser?.avatar_url || fallbackUser?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
  const role = currentUser?.role || "sgm"
  const roleMeta = ROLE_LABELS[role] || { label: "User", badge: "User", color: "bg-zinc-100" }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const handleLogout = () => {
    logout()
    toast.success("Berhasil keluar dari akun.")
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-12 px-2.5 rounded-xl hover:bg-muted/50 aria-expanded:bg-muted/50 transition-colors"
              />
            }
          >
            <Avatar className="size-8 rounded-lg bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-border">
              <AvatarImage src={avatar} alt={name} className="object-cover" />
              <AvatarFallback className="rounded-lg font-bold text-xs bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-bold text-foreground">{name.split(",")[0]}</span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${roleMeta.color}`}>
                  {roleMeta.badge}
                </span>
              </div>
              <span className="truncate text-[10px] text-muted-foreground mt-0.5">
                {currentUser?.position_title || email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-64 rounded-xl p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2.5 py-2 text-left text-xs bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <Avatar className="size-9 rounded-lg border border-border">
                    <AvatarImage src={avatar} alt={name} className="object-cover" />
                    <AvatarFallback className="rounded-lg font-bold text-xs bg-red-50 text-red-700">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-bold text-foreground">{name}</span>
                    <span className="truncate text-[11px] text-muted-foreground mt-0.5">
                      NIK: {currentUser?.nik || "10293801"}
                    </span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold truncate mt-0.5">
                      {roleMeta.label}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="text-xs gap-2 py-2 cursor-pointer font-medium rounded-lg"
              >
                <CircleUserRoundIcon className="size-4 text-muted-foreground" />
                <span>Profil Akun</span>
              </DropdownMenuItem>
              {currentUser?.role !== "staff" && (
                <DropdownMenuItem
                  onClick={() => router.push("/admin/karyawan")}
                  className="text-xs gap-2 py-2 cursor-pointer font-medium rounded-lg"
                >
                  <ShieldCheckIcon className="size-4 text-muted-foreground" />
                  <span>Struktur Organisasi (Organogram)</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer font-semibold rounded-lg"
            >
              <LogOutIcon className="size-4" />
              <span>Keluar (Log Out)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
