"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/api"
import { NotificationItem, Task } from "@/types/database"

/**
 * Hook to listen for live incoming notifications for the current user.
 * Displays an instant Sonner toast notification and invokes callback.
 */
export function useRealtimeNotifications(
  userId?: string | null,
  onNotification?: (notif: NotificationItem) => void
) {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (!userId) return

    const channelName = `realtime_notifications_${userId}`
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem
          if (!newNotif) return

          // Show immediate visual toast
          toast.info(newNotif.title, {
            description: newNotif.message,
            duration: 6000,
          })

          // Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] })

          // Invoke custom component handler
          onNotification?.(newNotif)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onNotification, queryClient])
}

/**
 * Hook to listen for live task additions, edits, submissions, and approvals across the board.
 */
export function useRealtimeTasks(onTaskChange?: () => void) {
  const queryClient = useQueryClient()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Debounced change handler to prevent UI thrashing if multiple updates fire in milliseconds
  const handleDebouncedChange = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      onTaskChange?.()
    }, 300)
  }, [queryClient, onTaskChange])

  React.useEffect(() => {
    const channel = supabase
      .channel("realtime_tasks_broadcast")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          handleDebouncedChange()
        }
      )
      .subscribe()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [handleDebouncedChange])
}

/**
 * Hook to listen for live updates on a specific task (subtasks, comments, status).
 */
export function useRealtimeTaskDetail(
  taskId?: string | null,
  onDetailChange?: () => void
) {
  const queryClient = useQueryClient()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleDebouncedChange = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      }
      onDetailChange?.()
    }, 250)
  }, [taskId, queryClient, onDetailChange])

  React.useEffect(() => {
    if (!taskId) return

    const channelName = `realtime_task_detail_${taskId}`
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `id=eq.${taskId}`,
        },
        () => handleDebouncedChange()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subtasks",
          filter: `task_id=eq.${taskId}`,
        },
        () => handleDebouncedChange()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_comments",
          filter: `task_id=eq.${taskId}`,
        },
        () => handleDebouncedChange()
      )
      .subscribe()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [taskId, handleDebouncedChange])
}
