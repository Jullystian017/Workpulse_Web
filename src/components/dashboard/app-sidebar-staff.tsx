"use client"

import * as React from "react"
import Link from "next/link"

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
  Users2Icon,
  FileBarChartIcon,
} from "lucide-react"
import { getActiveUserFromStorage } from "@/lib/api"
import { ROLE_LABELS, UserRole } from "@/types/database"

// Base nav items for all karyawan roles
const baseNavItems = [
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

// Additional items for officers and above (non-staff)
const officerNavItems = [
  {
    title: "Tim & Bawahan",
    url: "/karyawan/tim",
    icon: Users2Icon,
  },
  {
    title: "Laporan Kinerja",
    url: "/karyawan/laporan",
    icon: FileBarChartIcon,
  },
]

export function AppSidebarStaff({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const aiPanel = useAiPanel()
  const [userRole, setUserRole] = React.useState<UserRole>("staff")
  const [roleLabel, setRoleLabel] = React.useState("Portal Karyawan")

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (user) {
      setUserRole(user.role)
      setRoleLabel(`Portal ${ROLE_LABELS[user.role]?.badge || "Karyawan"}`)
    }
  }, [])

  const isStaff = userRole === "staff"
  const navItems = isStaff ? baseNavItems : [...baseNavItems, ...officerNavItems]

  const handleOpenAi = () => {
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
              tooltip="WorkPulse Telkom Akses"
              className="h-10 px-2 rounded-xl hover:bg-muted/50 transition-colors"
              render={<Link href="/karyawan/dashboard" />}
            >
              <div className="size-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
                <ActivityIcon className="size-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-extrabold tracking-tight text-foreground">
                  WorkPulse <span className="text-red-600">TA</span>
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
                tooltip="AI Assistant Karyawan"
                onClick={handleOpenAi}
                className="h-8.5 px-2.5 flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl duration-200 shadow-xs active:scale-[0.98] transition-all cursor-pointer group-data-[collapsible=icon]:size-8.5 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
              >
                <SparklesIcon className="size-4 shrink-0 text-white" />
                <span className="text-xs font-semibold group-data-[collapsible=icon]:hidden">
                  AI Assistant Karyawan
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="p-2.5 pt-1.5 flex flex-col gap-1.5">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
