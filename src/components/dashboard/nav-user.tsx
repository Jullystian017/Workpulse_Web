"use client"

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

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

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
            <Avatar className="size-8 rounded-lg bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg font-bold text-xs bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="truncate font-semibold text-foreground">{user.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-2 text-left text-xs">
                  <Avatar className="size-8 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg font-bold text-xs bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold text-foreground">{user.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-xs gap-2 py-2 cursor-pointer">
                <CircleUserRoundIcon className="size-4 text-muted-foreground" />
                <span>Profil Akun</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2 py-2 cursor-pointer">
                <ShieldCheckIcon className="size-4 text-muted-foreground" />
                <span>Hak Akses Admin</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2 py-2 cursor-pointer">
                <BellIcon className="size-4 text-muted-foreground" />
                <span>Pengaturan Notifikasi</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer">
              <LogOutIcon className="size-4" />
              <span>Keluar (Log Out)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
