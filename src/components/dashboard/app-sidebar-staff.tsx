"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
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
  CalendarCheckIcon,
  CalendarRangeIcon,
  CheckSquareIcon,
  BookOpenIcon,
  ActivityIcon,
  SparklesIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Budi Santoso",
    email: "budi.santoso@telkomakses.co.id",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/karyawan/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Presensi GPS",
      url: "/karyawan/presensi",
      icon: CalendarCheckIcon,
    },
    {
      title: "Task Management",
      url: "/karyawan/tasks",
      icon: CheckSquareIcon,
    },
    {
      title: "Pengajuan Cuti",
      url: "/karyawan/cuti",
      icon: CalendarRangeIcon,
    },
  ],
  navSecondary: [
    {
      title: "Bantuan",
      url: "/karyawan/bantuan",
      icon: BookOpenIcon,
    },
  ],
}

export function AppSidebarStaff({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const aiPanel = useAiPanel()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2.5 pb-1 group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="WorkPulse"
              className="h-9 px-2 rounded-xl hover:bg-muted/50 transition-colors"
              render={<a href="/karyawan/dashboard" />}
            >
              <ActivityIcon className="size-5! text-red-600 shrink-0 stroke-[2.2]" />
              <span className="text-base font-semibold tracking-tight text-foreground">
                WorkPulse
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2.5 pt-2 gap-2">
        <SidebarGroup className="p-0">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-1.5">
              <SidebarMenuButton
                tooltip="AI Assistant"
                className="h-8.5 px-2.5 flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl duration-200 shadow-xs active:scale-[0.98] transition-all cursor-pointer group-data-[collapsible=icon]:size-8.5 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                render={<Link href="/karyawan/dashboard" />}
              >
                <SparklesIcon className="size-4 shrink-0 text-white" />
                <span className="text-xs font-semibold group-data-[collapsible=icon]:hidden">
                  AI Assistant
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter className="p-2.5 pt-1.5 flex flex-col gap-1.5">
        <NavSecondary items={data.navSecondary} />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
