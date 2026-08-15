"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname()

  return (
    <SidebarGroup {...props} className={cn("p-0", className)}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive = pathname === item.url
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  className={`h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-red-50 text-red-700 font-semibold dark:bg-red-950/40 dark:text-red-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  render={<Link href={item.url} />}
                >
                  <Icon className={`size-3.5 shrink-0 ${isActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
