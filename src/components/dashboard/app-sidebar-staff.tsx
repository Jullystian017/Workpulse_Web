"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import { useAiPanel } from "@/components/dashboard/ai-panel-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  CheckSquareIcon,
  SparklesIcon,
  ActivityIcon,
  FileBarChartIcon,
} from "lucide-react"
import { getActiveUserFromStorage } from "@/lib/api"
import { ROLE_LABELS, UserRole } from "@/types/database"

export function AppSidebarStaff({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const aiPanel = useAiPanel()
  const pathname = usePathname()
  const [userRole, setUserRole] = React.useState<UserRole>("staff")
  const [roleLabel, setRoleLabel] = React.useState("Portal Karyawan")

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (user) {
      setUserRole(user.role)
      setRoleLabel(`Portal ${ROLE_LABELS[user.role]?.badge || "Karyawan"}`)
    }
  }, [])

  const dynamicNavItems = React.useMemo(() => {
    const items = [
      {
        title: "Dashboard Saya",
        url: "/karyawan/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Tugas Saya",
        url: "/karyawan/tasks",
        icon: CheckSquareIcon,
      },
    ]

    if (userRole === "manager" || userRole === "sgm") {
      items.push({
        title: "Laporan Kinerja & SLA",
        url: "/karyawan/laporan/kinerja",
        icon: FileBarChartIcon,
      })
    }

    return items
  }, [userRole])
  const isAiPanelOpen = aiPanel?.isOpen ?? false
  const isAiPage = pathname === "/karyawan/ai"
  const isAiActive = isAiPanelOpen || isAiPage

  const handleToggleAi = () => {
    if (aiPanel) {
      aiPanel.toggleAiPanel()
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2.5 pb-1 group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="WorkPulse"
              className="h-10 px-2 rounded-xl hover:bg-muted/50 transition-colors"
              render={<Link href="/karyawan/dashboard" />}
            >
              <div className="size-7 rounded-lg bg-white dark:bg-zinc-800 p-0.5 flex items-center justify-center shadow-xs border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0">
                <Image
                  src="/workpulse.png"
                  alt="WorkPulse"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-extrabold tracking-tight text-foreground">
                  WorkPulse
                </span>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  {roleLabel}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2.5 pt-2 gap-2">
        <SidebarGroup className="p-0">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-1.5">
              <SidebarMenuButton
                tooltip={isAiActive ? "Tutup AI Assistant" : "Buka AI Assistant (Panel Samping)"}
                onClick={handleToggleAi}
                className={`h-8 px-2.5 flex-1 rounded-[8px] duration-200 active:scale-[0.98] transition-all cursor-pointer group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:rounded-[8px] ${isAiActive
                    ? "!bg-gradient-to-r !from-red-600 !to-rose-600 !text-white font-bold shadow-sm shadow-red-600/30 ring-2 ring-red-400 ring-offset-1 ring-offset-background"
                    : "bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
                  }`}
              >
                <SparklesIcon className={`size-3.5 shrink-0 text-white ${isAiActive ? "fill-white/30 drop-shadow-xs animate-pulse" : ""}`} />
                <span className="text-xs font-semibold group-data-[collapsible=icon]:hidden">
                  AI Assistant
                </span>
                {isAiActive && (
                  <span className="ml-auto flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                    <span className="size-1.5 rounded-full bg-white shadow-xs animate-pulse ring-2 ring-white/40" />
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={dynamicNavItems} />
      </SidebarContent>

      <SidebarFooter className="p-2.5 pt-1.5 flex flex-col gap-1.5">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
