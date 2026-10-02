"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getTasks,
  getTaskById,
  getAllUsers,
  getChannels,
  getDepartments,
  updateTaskStatus,
  claimTask,
  TaskFilters,
} from "@/lib/api"
import { Task, User, Channel, Department, TaskStatus } from "@/types/database"

export const queryKeys = {
  tasks: (filters?: TaskFilters) => ["tasks", filters ?? {}] as const,
  taskDetail: (taskId: string | null) => ["task", taskId] as const,
  users: () => ["users"] as const,
  channels: () => ["channels"] as const,
  departments: () => ["departments"] as const,
}

export function useTasksQuery(filters?: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks(filters),
    queryFn: () => getTasks(filters),
    staleTime: 1000 * 20, // 20s fresh
  })
}

export function useTaskDetailQuery(taskId: string | null, initialTask?: Task | null) {
  return useQuery({
    queryKey: queryKeys.taskDetail(taskId),
    queryFn: () => (taskId ? getTaskById(taskId) : Promise.resolve(null)),
    enabled: !!taskId,
    initialData: initialTask || undefined,
    staleTime: 1000 * 15, // 15s fresh
  })
}

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => getAllUsers(),
    staleTime: 1000 * 60, // 1 min fresh
  })
}

export function useChannelsQuery() {
  return useQuery({
    queryKey: queryKeys.channels(),
    queryFn: () => getChannels(),
    staleTime: 1000 * 60 * 2, // 2 min fresh
  })
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: queryKeys.departments(),
    queryFn: () => getDepartments(),
    staleTime: 1000 * 60 * 5, // 5 min fresh
  })
}
