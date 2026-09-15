"use client"

import * as React from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import { ChartDonutDepartment } from "@/components/dashboard/chart-donut-department"
import { DataTable } from "@/components/dashboard/data-table"
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome"
import { SectionCards } from "@/components/dashboard/section-cards"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CreateTaskModal } from "@/components/dashboard/tasks/create-task-modal"
import { Task } from "@/types/database"
import { getTasks, getExecutiveKpiStats } from "@/lib/api"

export default function AdminDashboardPage() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [stats, setStats] = React.useState<{
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    reviewTasks: number
    unassignedTasks: number
    overdueTasks: number
    completionRate: number
    activeStaffCount: number
    totalEmployees: number
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false)

  const loadDashboardData = React.useCallback(async () => {
    try {
      const [fetchedTasks, fetchedStats] = await Promise.all([
        getTasks(),
        getExecutiveKpiStats(),
      ])
      setTasks(fetchedTasks || [])
      setStats(fetchedStats || null)
    } catch (e) {
      console.error("Error loading dashboard data:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

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
      <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
        <SiteHeader />
        <div className="flex flex-1 min-h-0 h-full flex-row overflow-hidden">
          {/* Main Center Content */}
          <div className="flex-1 min-h-0 overflow-y-auto pb-10">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-6 py-4 md:py-6">
                {/* Row 0: Dynamic Welcome Banner */}
                <DashboardWelcome onOpenCreateTask={() => setIsCreateTaskOpen(true)} />

                {/* Row 1: 4 Executive KPI Cards (Real live stats) */}
                <SectionCards stats={stats} />

                {/* Row 2: Live Tren Task Area Chart (8/12) + Donut Status Distribution (4/12) */}
                <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-12 lg:px-6">
                  <div className="lg:col-span-8">
                    <ChartAreaInteractive initialTasks={tasks} />
                  </div>
                  <div className="lg:col-span-4">
                    <ChartDonutDepartment initialTasks={tasks} />
                  </div>
                </div>

                {/* Row 3: Full Functional Task Management Table */}
                <DataTable
                  tasks={tasks}
                  onRefresh={loadDashboardData}
                  className="px-4 lg:px-6"
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Global Create Task Modal Triggered from Welcome Banner */}
      <CreateTaskModal
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onSuccess={loadDashboardData}
      />
    </SidebarProvider>
  )
}
