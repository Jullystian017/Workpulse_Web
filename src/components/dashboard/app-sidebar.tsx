"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
  CheckSquareIcon,
  UsersIcon,
  Settings2Icon,
  FileBarChartIcon,
  ActivityIcon,
  SparklesIcon,
} from "lucide-react"

const sidebarData = {
  navMain: [
    {
      title: "Dashboard Utama",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Penugasan Kantor",
      url: "/admin/tasks",
      icon: CheckSquareIcon,
    },
    {
      title: "Karyawan & Organogram",
      url: "/admin/karyawan",
      icon: UsersIcon,
    },
  ],
  documents: [
    {
      name: "Laporan Kinerja & SLA",
      url: "/admin/laporan/kinerja",
      icon: FileBarChartIcon,
    },
    {
      name: "Log Aktivitas & Audit",
      url: "/admin/log",
      icon: ActivityIcon,
    },
  ],
  navSecondary: [
    {
      title: "Pengaturan & Master Data",
      url: "/admin/settings",
      icon: Settings2Icon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const aiPanel = useAiPanel()
  const pathname = usePathname()
  const isAiPanelOpen = aiPanel?.isOpen ?? false
  const isAiPage = pathname === "/admin/ai" || pathname === "/dashboard/ai"
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
              tooltip="WorkPulse Telkom Akses"
              className="h-10 px-2 rounded-xl hover:bg-muted/50 transition-colors"
              render={<Link href="/admin/dashboard" />}
            >
              <div className="size-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
                <ActivityIcon className="size-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-extrabold tracking-tight text-foreground">
                  WorkPulse <span className="text-red-600">TA</span>
                </span>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  Task Management System
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
                className={`h-8 px-2.5 flex-1 rounded-[8px] duration-200 active:scale-[0.98] transition-all cursor-pointer group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:rounded-[8px] ${
                  isAiActive
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

        <NavMain items={sidebarData.navMain} />
        <SidebarSeparator className="hidden group-data-[collapsible=icon]:block my-1 mx-1 opacity-50" />
        <NavDocuments items={sidebarData.documents} />
      </SidebarContent>

      <SidebarFooter className="p-2.5 pt-1.5 flex flex-col gap-1.5">
        <NavSecondary items={sidebarData.navSecondary} />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
