"use client"

import * as React from "react"
import {
  TableIcon,
  KanbanIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
  UserPlusIcon,
  UsersIcon,
  ArrowUpDownIcon,
  LayersIcon,
  UserIcon,
  XIcon,
  ChevronDownIcon,
  CheckIcon,
  MapPinIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  FileBarChartIcon,
  ArrowUpRightIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AiPanelProvider } from "@/components/dashboard/ai-panel-context"
import { AiIntegratedPanel } from "@/components/dashboard/ai-integrated-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { DataTable } from "@/components/dashboard/data-table"
import { KanbanView } from "@/components/dashboard/tasks/kanban-view"
import { TimelineView } from "@/components/dashboard/tasks/timeline-view"
import { CalendarView } from "@/components/dashboard/tasks/calendar-view"
import { TaskDetailSheet, type TaskItem } from "@/components/dashboard/tasks/task-detail-sheet"
import initialTasks from "../data.json"

const departments = ["Semua", "Deployment", "Maintenance", "Customer Service", "Survey"]

const teknisiList = [
  { name: "Andi Pratama", role: "Field Lead Engineer", avatar: "AP" },
  { name: "Bambang Susanto", role: "Supervisor Telkom", avatar: "BS" },
  { name: "Kevin Sanjaya", role: "Network Specialist", avatar: "KS" },
  { name: "Irfan Maulana", role: "Splicing Specialist", avatar: "IM" },
  { name: "Oscar Budiman", role: "Mitra Support Team", avatar: "OB" },
  { name: "Siti Rahayu", role: "Quality Assurance", avatar: "SR" },
]

function CustomDropdown({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string
  icon: React.ElementType
  value: string
  options: { label: string; value: string }[]
  onChange: (val: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const selectedOption = options.find((o) => o.value === value) || options[0]

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className={`flex items-center gap-1.5 h-8.5 px-3 rounded-xl border transition-all cursor-pointer shadow-2xs whitespace-nowrap text-xs font-medium ${
          open
            ? "border-red-500 ring-2 ring-red-500/20 bg-muted/80 text-foreground"
            : "bg-background hover:bg-muted/60 text-foreground"
        }`}
      >
        <Icon className="size-3.5 text-muted-foreground" />
        <span>
          {label}: <strong className="font-semibold text-foreground">{selectedOption.label}</strong>
        </span>
        <ChevronDownIcon className={`size-3 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-48 p-1.5 rounded-2xl border bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 ring-1 ring-border/50">
          <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-semibold"
                    : "hover:bg-muted/80 text-foreground"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <CheckIcon className="size-3.5 text-red-600 dark:text-red-400 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks as TaskItem[])
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  
  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDept, setSelectedDept] = React.useState("Semua")
  const [selectedStatus, setSelectedStatus] = React.useState("Semua")
  const [selectedPriority, setSelectedPriority] = React.useState("Semua")
  const [selectedAssignee, setSelectedAssignee] = React.useState("Semua")
  const [sortBy, setSortBy] = React.useState("deadline")
  const [activeTab, setActiveTab] = React.useState<"table" | "kanban" | "timeline" | "calendar">("timeline")

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = React.useState("")
  const [newTaskAssignee, setNewTaskAssignee] = React.useState(teknisiList[0].name)
  const [newTaskDept, setNewTaskDept] = React.useState("Maintenance")
  const [newTaskPriority, setNewTaskPriority] = React.useState("Tinggi")
  const [newTaskDeadline, setNewTaskDeadline] = React.useState("2026-08-16")
  const [newTaskLocation, setNewTaskLocation] = React.useState("STO Gambir")
  const [newTaskDesc, setNewTaskDesc] = React.useState("")

  const handleOpenDetail = (task: TaskItem) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  const handleUpdateStatus = (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) {
      toast.error("Mohon isi judul task!")
      return
    }

    const nextIdNumber = tasks.length + 1
    const newId = `TSK-${String(nextIdNumber).padStart(3, "0")}`

    const createdTask: TaskItem = {
      id: newId,
      judulTask: newTaskTitle,
      assignee: newTaskAssignee,
      departemen: newTaskDept,
      prioritas: newTaskPriority,
      deadline: newTaskDeadline,
      status: "Tertunda",
      progress: 0,
      bukti: false,
      deskripsi: newTaskDesc || "Penugasan baru telah dibuat oleh Admin.",
      lokasi: newTaskLocation,
      kategori: newTaskDept,
    }

    setTasks((prev) => [createdTask, ...prev])
    setIsCreateModalOpen(false)
    
    // Reset form
    setNewTaskTitle("")
    setNewTaskDesc("")
    toast.success(`Task ${newId} berhasil dibuat dan ditugaskan ke ${newTaskAssignee}!`)
  }

  const filteredTasks = React.useMemo(() => {
    let result = tasks.filter((t) => {
      const matchSearch =
        t.judulTask.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchDept = selectedDept === "Semua" || t.departemen === selectedDept
      const matchStatus = selectedStatus === "Semua" || t.status === selectedStatus
      const matchPriority = selectedPriority === "Semua" || t.prioritas === selectedPriority
      const matchAssignee = selectedAssignee === "Semua" || t.assignee.includes(selectedAssignee)
      return matchSearch && matchDept && matchStatus && matchPriority && matchAssignee
    })

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (sortBy === "priority") {
        const priorityOrder: Record<string, number> = { Tinggi: 1, Sedang: 2, Rendah: 3 }
        return (priorityOrder[a.prioritas] || 99) - (priorityOrder[b.prioritas] || 99)
      }
      if (sortBy === "title") {
        return a.judulTask.localeCompare(b.judulTask)
      }
      if (sortBy === "progress") {
        return (b.progress || 0) - (a.progress || 0)
      }
      return 0
    })
  }, [tasks, searchQuery, selectedDept, selectedStatus, selectedPriority, selectedAssignee, sortBy])

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
            <div className="flex-1 min-h-0 overflow-y-auto pb-12">
              
              {/* Row 1: Top Page Header (Matching Reference Screenshot) */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 pt-5 pb-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Task Management
                </h1>

                {/* Right: Link to Laporan Kinerja */}
                <div className="flex items-center gap-2.5">
                  <Link href="/dashboard/laporan/kinerja">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8.5 px-3 gap-1.5 rounded-xl text-xs font-semibold hover:bg-muted hover:text-red-600 border-border/80 cursor-pointer shadow-2xs transition-colors"
                    >
                      <FileBarChartIcon className="size-3.5 text-red-600" />
                      <span>Laporan Kinerja</span>
                      <ArrowUpRightIcon className="size-3 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Row 2: View Switcher Tabs (Underline Style Matching Reference Screenshot) */}
              <div className="px-4 lg:px-6 border-b border-border/80 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("table")}
                  className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative cursor-pointer ${
                    activeTab === "table"
                      ? "text-red-600 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TableIcon className="size-3.5" />
                  <span>Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("kanban")}
                  className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative cursor-pointer ${
                    activeTab === "kanban"
                      ? "text-red-600 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <KanbanIcon className="size-3.5" />
                  <span>Kanban</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("timeline")}
                  className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative cursor-pointer ${
                    activeTab === "timeline"
                      ? "text-red-600 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ClockIcon className="size-3.5" />
                  <span>Timeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("calendar")}
                  className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative cursor-pointer ${
                    activeTab === "calendar"
                      ? "text-red-600 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarIcon className="size-3.5" />
                  <span>Calendar</span>
                </button>
              </div>

              {/* Row 3: Action Toolbar (Custom Premium Dropdowns, Search, Create Task +) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 lg:px-6 py-3.5 relative z-20">
                {/* Left Side: Filter, Sort by, Group by, Assigner */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Dropdown */}
                  <CustomDropdown
                    label="Filter"
                    icon={FilterIcon}
                    value={selectedDept}
                    onChange={setSelectedDept}
                    options={[
                      { label: "Semua Dept", value: "Semua" },
                      { label: "Maintenance", value: "Maintenance" },
                      { label: "Deployment", value: "Deployment" },
                      { label: "Customer Service", value: "Customer Service" },
                      { label: "Survey", value: "Survey" },
                    ]}
                  />

                  {/* Sort By Dropdown */}
                  <CustomDropdown
                    label="Sort by"
                    icon={ArrowUpDownIcon}
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { label: "Deadline", value: "deadline" },
                      { label: "Prioritas", value: "priority" },
                      { label: "Judul (A-Z)", value: "title" },
                      { label: "Progress", value: "progress" },
                    ]}
                  />

                  {/* Group by / Status Dropdown */}
                  <CustomDropdown
                    label="Group by"
                    icon={LayersIcon}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={[
                      { label: "Semua Status", value: "Semua" },
                      { label: "Tertunda", value: "Tertunda" },
                      { label: "Dalam Proses", value: "Dalam Proses" },
                      { label: "Selesai", value: "Selesai" },
                    ]}
                  />

                  {/* Assigner / PIC Dropdown */}
                  <CustomDropdown
                    label="Assigner"
                    icon={UserIcon}
                    value={selectedAssignee}
                    onChange={setSelectedAssignee}
                    options={[
                      { label: "Semua Teknisi", value: "Semua" },
                      ...teknisiList.map((t) => ({ label: t.name, value: t.name })),
                    ]}
                  />
                </div>

                {/* Right Side: Search + Create Task + Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cari task..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8.5 pl-8 pr-3 w-36 sm:w-44 focus:w-56 transition-all rounded-xl border bg-background text-xs placeholder:text-muted-foreground outline-none focus:border-red-500 shadow-2xs"
                    />
                  </div>

                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    size="sm"
                    className="h-8.5 px-3.5 gap-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    <span>Create Task</span>
                    <PlusIcon className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Row 4: Main View Canvas Container */}
              <div className="mt-2">
                {activeTab === "table" && (
                  <DataTable data={filteredTasks} />
                )}

                {activeTab === "kanban" && (
                  <KanbanView
                    tasks={filteredTasks}
                    onUpdateStatus={handleUpdateStatus}
                    onSelectTask={handleOpenDetail}
                  />
                )}

                {activeTab === "timeline" && (
                  <TimelineView tasks={filteredTasks} onSelectTask={handleOpenDetail} />
                )}

                {activeTab === "calendar" && (
                  <CalendarView tasks={filteredTasks} onSelectTask={handleOpenDetail} />
                )}
              </div>

              {/* Task Detail Drawer Sheet */}
              <TaskDetailSheet
                task={selectedTask}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>

            {/* Integrated Right AI Column Panel */}
            <AiIntegratedPanel />
          </div>
        </SidebarInset>

        {/* Modal Dialog: Create Task + */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                    <PlusIcon className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Create New Task</h3>
                    <p className="text-[11px] text-muted-foreground">Isi rincian tugas dan tentukan teknisi penanggung jawab</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleCreateTask} className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Judul Task */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Judul Tugas / Pekerjaan *</label>
                  <Input
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Contoh: Perbaikan Kabel Feeder 96 Core STO Gambir"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                {/* Grid: Departemen & Prioritas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Departemen / Kategori</label>
                    <select
                      value={newTaskDept}
                      onChange={(e) => setNewTaskDept(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border bg-background text-xs outline-none cursor-pointer"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Deployment">Deployment</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Survey">Survey</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Tingkat Prioritas</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border bg-background text-xs outline-none cursor-pointer"
                    >
                      <option value="Tinggi">🔴 Tinggi (Critical SLA)</option>
                      <option value="Sedang">🟡 Sedang (Normal SLA)</option>
                      <option value="Rendah">⚪ Rendah (Routine)</option>
                    </select>
                  </div>
                </div>

                {/* PIC / Teknisi Assignment */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Teknisi / PIC yang Ditugaskan</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border bg-background text-xs outline-none cursor-pointer font-medium"
                  >
                    {teknisiList.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} — {t.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid: Lokasi & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Lokasi STO / Titik Kerja</label>
                    <Input
                      value={newTaskLocation}
                      onChange={(e) => setNewTaskLocation(e.target.value)}
                      placeholder="Contoh: STO Gambir / ODP Depok"
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Tenggat Waktu (Deadline)</label>
                    <Input
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {/* Deskripsi & Instruksi */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Instruksi & Keterangan Pengerjaan</label>
                  <textarea
                    rows={3}
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Tuliskan instruksi teknis, SOP redaman, atau detail material yang diperlukan..."
                    className="w-full p-2.5 rounded-xl border bg-background text-xs outline-none focus:border-red-500"
                  />
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-8.5 text-xs font-semibold rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="h-8.5 px-4 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    Create Task
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AiPanelProvider>
    </SidebarProvider>
  )
}
