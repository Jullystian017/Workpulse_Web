"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import {
  HashIcon,
  ChevronDownIcon,
  LayersIcon,
  PlusIcon,
  FolderPlusIcon,
  BriefcaseIcon,
  FolderIcon,
  FileTextIcon,
  ShieldIcon,
  UsersIcon,
  CheckSquareIcon,
  ActivityIcon,
  Trash2Icon,
  Settings2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CreateChannelModal } from "@/components/dashboard/tasks/create-channel-modal"
import { ManageChannelsModal } from "@/components/dashboard/tasks/manage-channels-modal"
import { getChannels, getTasks, deleteChannel } from "@/lib/api"
import { Channel, Task } from "@/types/database"

const iconMap: Record<string, React.ElementType> = {
  Layers: LayersIcon,
  FileText: FileTextIcon,
  Shield: ShieldIcon,
  Users: UsersIcon,
  Briefcase: BriefcaseIcon,
  Folder: FolderIcon,
  Hash: HashIcon,
}

export function NavChannels() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentChannel = searchParams.get("channel") || "all"
  const currentView = searchParams.get("view")
  const router = useRouter()

  const [channels, setChannels] = React.useState<Channel[]>([])
  const [taskCounts, setTaskCounts] = React.useState<Record<string, number>>({})
  const [isOpen, setIsOpen] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isManageOpen, setIsManageOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
    Promise.all([getChannels(), getTasks()])
      .then(([chs, ts]) => {
        setChannels(chs)
        const counts: Record<string, number> = { all: ts.length }
        ts.forEach((t) => {
          if (t.channel_id) {
            counts[t.channel_id] = (counts[t.channel_id] || 0) + 1
          }
        })
        setTaskCounts(counts)
      })
      .catch(console.error)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData, pathname, currentChannel])

  const isTasksPage = pathname === "/admin/tasks"
  const isWorkloadActive = isTasksPage && currentView === "workload"
  const isAllTasksActive = isTasksPage && (!currentView || currentView !== "workload") && currentChannel === "all"

  const handleChannelCreated = (newChannel: Channel) => {
    setChannels((prev) => {
      if (prev.some((c) => c.id === newChannel.id)) return prev
      return [...prev, newChannel]
    })
    loadData()
  }

  const handleDeleteChannel = async (e: React.MouseEvent, channelId: string, channelName: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Hapus kategori/ruang kerja "${channelName}"?`)) return
    try {
      const ok = await deleteChannel(channelId)
      if (ok) {
        toast.success(`Kategori "${channelName}" berhasil dihapus.`)
        setChannels((prev) => prev.filter((c) => c.id !== channelId))
        if (currentChannel === channelId) {
          router.push("/admin/tasks")
        }
      } else {
        toast.error("Gagal menghapus kategori.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghapus kategori.")
    }
  }

  return (
    <>
      <SidebarGroup className="p-0 py-1">
        {/* Category Header with + Add Project and Manage buttons */}
        <div className="flex items-center justify-between px-2.5 mt-1 mb-1.5">
          <SidebarGroupLabel className="p-0 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase h-auto">
            Penugasan & Proyek
          </SidebarGroupLabel>

          <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
              title="Tambah Proyek / Ruang Kerja Baru"
            >
              <PlusIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsManageOpen(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
              title="Kelola Semua Kategori & Divisi"
            >
              <Settings2Icon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-transform duration-200 cursor-pointer"
              title={isOpen ? "Sembunyikan Kategori" : "Tampilkan Kategori"}
            >
              <ChevronDownIcon className={`size-3.5 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
            </button>
          </div>
        </div>

        {isOpen && (
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {/* All Tasks Item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Semua Penugasan Kantor"
                  isActive={isAllTasksActive}
                  className={`h-8 px-2.5 rounded-[8px] text-xs font-medium transition-colors ${
                    isAllTasksActive
                      ? "bg-red-50 text-red-700 font-semibold dark:bg-red-950/40 dark:text-red-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  render={<Link href="/admin/tasks" />}
                >
                  <CheckSquareIcon
                    className={`size-3.5 shrink-0 ${
                      isAllTasksActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                    }`}
                  />
                  <span className="flex-1 truncate">Semua Penugasan</span>
                  {taskCounts["all"] !== undefined && (
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded leading-none tabular-nums group-data-[collapsible=icon]:hidden ${
                        isAllTasksActive
                          ? "bg-red-200/60 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {taskCounts["all"]}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Workload / Kapasitas Tim Item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Kapasitas & Beban Tim"
                  isActive={isWorkloadActive}
                  className={`h-8 px-2.5 rounded-[8px] text-xs font-medium transition-colors ${
                    isWorkloadActive
                      ? "bg-red-50 text-red-700 font-semibold dark:bg-red-950/40 dark:text-red-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  render={<Link href="/admin/tasks?view=workload" />}
                >
                  <ActivityIcon
                    className={`size-3.5 shrink-0 ${
                      isWorkloadActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                    }`}
                  />
                  <span className="flex-1 truncate">Kapasitas Beban Tim</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Workstream / Project Sub-header */}
              <div className="pt-2 pb-1 px-2.5 flex items-center justify-between group-data-[collapsible=icon]:hidden">
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground/60 uppercase">
                  Ruang Kerja Proyek
                </span>
                <span className="text-[9px] text-muted-foreground/60">
                  {channels.length} Proyek
                </span>
              </div>

              {/* Individual Channel / Project Items */}
              {channels.map((ch) => {
                const isActive = isTasksPage && !currentView && currentChannel === ch.id
                const count = taskCounts[ch.id] || 0
                const IconComponent = (ch.icon && iconMap[ch.icon]) || HashIcon

                return (
                  <SidebarMenuItem key={ch.id} className="group/item relative">
                    <SidebarMenuButton
                      tooltip={`#${ch.name} - ${ch.description || "Divisi"}`}
                      isActive={isActive}
                      className={`h-8 px-2.5 pr-7 rounded-[8px] text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-red-50 text-red-700 font-semibold dark:bg-red-950/40 dark:text-red-300"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      render={<Link href={`/admin/tasks?channel=${ch.id}`} />}
                    >
                      <IconComponent
                        className={`size-3.5 shrink-0 ${
                          isActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                        }`}
                      />
                      <span className="flex-1 truncate">{ch.name}</span>
                      {count > 0 && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded leading-none tabular-nums group-data-[collapsible=icon]:hidden ${
                            isActive
                              ? "bg-red-200/60 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </SidebarMenuButton>

                    {/* Delete Channel Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChannel(e, ch.id, ch.name)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded transition-all cursor-pointer"
                      title={`Hapus kategori #${ch.name}`}
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </SidebarMenuItem>
                )
              })}

              {/* Add Project Quick Item */}
              <SidebarMenuItem className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full flex items-center gap-2 h-7.5 px-2.5 rounded-[8px] text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors group-data-[collapsible=icon]:justify-center cursor-pointer border border-dashed border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-800"
                >
                  <PlusIcon className="size-3.5 shrink-0" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">+ Tambah Kategori / Proyek</span>
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>

      {/* Create Project / Channel Modal */}
      <CreateChannelModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleChannelCreated}
      />

      {/* Manage Channels Modal */}
      <ManageChannelsModal
        open={isManageOpen}
        onOpenChange={setIsManageOpen}
        onChannelsUpdated={loadData}
      />
    </>
  )
}
