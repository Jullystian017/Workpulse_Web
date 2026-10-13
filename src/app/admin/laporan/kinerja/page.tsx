"use client"

import * as React from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LaporanKinerjaView } from "@/components/dashboard/reports/laporan-kinerja-view"

export default function AdminLaporanKinerjaPage() {
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
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-12 font-sans">
          <LaporanKinerjaView />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
