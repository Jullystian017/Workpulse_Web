import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import { ChartDonutDepartment } from "@/components/dashboard/chart-donut-department"
import { DataTable } from "@/components/dashboard/data-table"
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome"
import { SectionCards } from "@/components/dashboard/section-cards"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AiPanelProvider } from "@/components/dashboard/ai-panel-context"
import { AiIntegratedPanel } from "@/components/dashboard/ai-integrated-panel"
import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AiPanelProvider>
        <AppSidebar variant="inset" />
        <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
          <SiteHeader />
          <div className="flex flex-1 min-h-0 h-full flex-row overflow-hidden">
            {/* Main Center Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-6 py-4 md:py-6">
                  {/* Row 0: Welcome Banner */}
                  <DashboardWelcome />

                  {/* Row 1: 4 KPI Cards */}
                  <SectionCards />

                  {/* Row 2: Tren Task (8/12) + Donut Status (4/12) */}
                  <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-12 lg:px-6">
                    <div className="lg:col-span-8">
                      <ChartAreaInteractive />
                    </div>
                    <div className="lg:col-span-4">
                      <ChartDonutDepartment />
                    </div>
                  </div>

                  {/* Row 3: Full Task Management Table */}
                  <DataTable data={data} />
                </div>
              </div>
            </div>

            {/* Integrated Right AI Column Panel - Full Height */}
            <AiIntegratedPanel />
          </div>
        </SidebarInset>
      </AiPanelProvider>
    </SidebarProvider>
  )
}
