"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: string
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="p-0 py-1">
      <SidebarGroupLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase px-2.5 mt-1 mb-1.5 h-auto">
        Menu Utama
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive = pathname === item.url
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  className={`h-8 px-2.5 rounded-[8px] text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-red-50 text-red-700 font-semibold dark:bg-red-950/40 dark:text-red-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  render={<Link href={item.url} />}
                >
                  <Icon className={`size-3.5 shrink-0 ${isActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} />
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded leading-none tabular-nums group-data-[collapsible=icon]:hidden ${
                        isActive
                          ? "bg-red-200/60 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
