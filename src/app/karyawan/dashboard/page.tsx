"use client"

import * as React from "react"
import { KaryawanWelcome } from "@/components/karyawan/karyawan-welcome"
import { KaryawanSectionCards } from "@/components/karyawan/karyawan-section-cards"
import { KaryawanAiInsight } from "@/components/karyawan/karyawan-ai-insight"
import { DataTable } from "@/components/dashboard/data-table"
import { getTasks, getAllUsers, getActiveUserFromStorage, getTaskAssigneeIds } from "@/lib/api"
import { Task, User } from "@/types/database"
import { useRealtimeTasks } from "@/hooks/use-realtime"

export default function KaryawanDashboardPage() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)

  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const activeUser = getActiveUserFromStorage()
      setCurrentUser(activeUser)
      const [fetchedTasks, fetchedUsers] = await Promise.all([getTasks(), getAllUsers()])

      // Filter tasks based on role:
      // - staff: only their tasks (assigned to them, created by them, or as reviewer/delegator) or open unassigned pool
      // - officer+ (non-admin): their own tasks, reviewer/delegator tasks, direct subordinates' tasks, or open pool
      let userTasks: Task[] = []
      if (activeUser) {
        if (activeUser.role === 'staff') {
          userTasks = fetchedTasks.filter(
            (t) =>
              getTaskAssigneeIds(t).includes(activeUser.id) ||
              t.created_by === activeUser.id ||
              t.reviewer_id === activeUser.id ||
              t.delegated_by === activeUser.id ||
              (t.status === 'unassigned' && !t.assigned_to)
          )
        } else if (activeUser.role !== 'admin') {
          const subordinateIds = fetchedUsers
            .filter((u) => u.supervisor_id === activeUser.id)
            .map((u) => u.id)
          userTasks = fetchedTasks.filter(
            (t) =>
              getTaskAssigneeIds(t).includes(activeUser.id) ||
              t.created_by === activeUser.id ||
              t.reviewer_id === activeUser.id ||
              t.delegated_by === activeUser.id ||
              (t.status === 'unassigned' && !t.assigned_to) ||
              getTaskAssigneeIds(t).some((id) => subordinateIds.includes(id)) ||
              (t.assignee?.supervisor_id && t.assignee.supervisor_id === activeUser.id)
          )
        } else {
          userTasks = fetchedTasks
        }
      } else {
        userTasks = fetchedTasks
      }

      setTasks(userTasks)
    } catch (e) {
      console.error("Error loading karyawan dashboard data:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Live real-time tasks synchronization across all roles
  useRealtimeTasks(loadDashboardData)

  const isStaff = currentUser?.role === 'staff'

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 pb-10">
      <div className="flex flex-col gap-6 py-4 md:py-6">
        {/* Row 0: Personal Welcome Banner */}
        <KaryawanWelcome />

        {/* Row 1: 4 Unified Summary Cards with Live Performance Metrics */}
        <KaryawanSectionCards tasks={tasks} />

        {/* Row 2: AI WorkPulse Real-Time Insight Banner (Groq AI & Admin KPI Synced) */}
        <KaryawanAiInsight tasks={tasks} />

        {/* Row 3: Real-time Employee Task Table (Role-aware view) */}
        <DataTable
          tasks={tasks}
          onRefresh={loadDashboardData}
          className="px-4 lg:px-6"
          isStaff={isStaff}
        />
      </div>
    </div>
  )
}
