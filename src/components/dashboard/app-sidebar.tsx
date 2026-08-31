"use client"

import * as React from "react"
import Link from "next/link"

import { NavDocuments } from "@/components/dashboard/nav-documents"
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  CalendarCheckIcon,
  CheckSquareIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  BookOpenIcon,
  FileBarChartIcon,
  FileTextIcon,
  ActivityIcon,
  SparklesIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Budi Admin",
    email: "admin@telkomakses.co.id",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Presensi & Kehadiran",
      url: "/admin/presensi",
      icon: CalendarCheckIcon,
    },
    {
      title: "Task Management",
      url: "/admin/tasks",
      icon: CheckSquareIcon,
    },
    {
      title: "Karyawan",
      url: "/admin/karyawan",
      icon: UsersIcon,
    },

  ],
  documents: [
    {
      name: "Laporan Kinerja",
      url: "/admin/laporan/kinerja",
      icon: FileBarChartIcon,
    },
    {
      name: "Rekap Kehadiran",
      url: "/admin/laporan/kehadiran",
      icon: FileTextIcon,
    },
    {
      name: "Log Aktivitas",
      url: "/admin/log",
      icon: ActivityIcon,
    },
  ],
  navSecondary: [
    {
      title: "Pengaturan",
      url: "/admin/settings",
      icon: Settings2Icon,
    },
    {
      title: "Dokumentasi SOP",
      url: "/admin/bantuan",
      icon: BookOpenIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const aiPanel = useAiPanel()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2.5 pb-1 group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="WorkPulse"
              className="h-9 px-2 rounded-xl hover:bg-muted/50 transition-colors"
              render={<a href="/dashboard" />}
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
                className="h-8.5 px-2.5 flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-[8px] duration-200 shadow-xs active:scale-[0.98] transition-all cursor-pointer group-data-[collapsible=icon]:size-8.5 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                render={<Link href="/dashboard/ai" />}
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
        <SidebarSeparator className="hidden group-data-[collapsible=icon]:block my-1 mx-1 opacity-50" />
        <NavDocuments items={data.documents} />
      </SidebarContent>

      <SidebarFooter className="p-2.5 pt-1.5 flex flex-col gap-1.5">
        <NavSecondary items={data.navSecondary} />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
