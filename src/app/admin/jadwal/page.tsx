"use client"

import * as React from "react"
import {
  ClockIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  CheckSquareIcon,
  CheckCircle2Icon,
  FileTextIcon,
  ShieldCheckIcon,
  EyeIcon,
  EditIcon,
  ClipboardListIcon,
  CalendarCheckIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Types
type ShiftCellType =
  | { type: "task"; title: string; location: string; time: string; priority: "HIGH" | "MEDIUM" | "LOW"; status: "In Progress" | "Done" | "Pending"; attachment?: boolean; geofence?: boolean }
  | { type: "full_day"; label: string }
  | { type: "sub_unit"; label: string }
  | { type: "khusus"; label: string }
  | { type: "off"; label: string }

interface EmployeeSchedule {
  id: string
  nik: string
  nama: string
  departemen: string
  role: string
  avatarUrl: string
  initials: string
  schedule: {
    sen: ShiftCellType
    sel: ShiftCellType
    rab: ShiftCellType
    kam: ShiftCellType
    jum: ShiftCellType
    sab: ShiftCellType
    min: ShiftCellType
  }
}

// Initial Data matching the Reference Image & Telkom Akses Operations
const initialEmployees: EmployeeSchedule[] = [
  {
    id: "emp-1",
    nik: "2024001",
    nama: "Ahmad Fauzi",
    departemen: "Operasional",
    role: "Operasional",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    initials: "AF",
    schedule: {
      sen: {
        type: "task",
        title: "Maintenance Jaringan Witel",
        location: "Area Jakarta Pusat",
        time: "07:30",
        priority: "HIGH",
        status: "In Progress",
        attachment: true,
        geofence: true,
      },
      sel: { type: "full_day", label: "Masuk / Full Day" },
      rab: { type: "full_day", label: "Masuk / Full Day" },
      kam: { type: "full_day", label: "Masuk / Full Day" },
      jum: { type: "full_day", label: "Masuk / Full Day" },
      sab: { type: "off", label: "Libur / Off" },
      min: { type: "off", label: "Libur / Off" },
    },
  },
  {
    id: "emp-2",
    nik: "2024045",
    nama: "Budi Santoso",
    departemen: "Teknisi Lapangan",
    role: "Teknisi Lapangan",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "BS",
    schedule: {
      sen: {
        type: "task",
        title: "Instalasi Fiber Optic",
        location: "Sub-Unit Bekasi",
        time: "07:45",
        priority: "MEDIUM",
        status: "Done",
        attachment: true,
        geofence: true,
      },
      sel: { type: "sub_unit", label: "Penugasan Sub-Unit" },
      rab: { type: "sub_unit", label: "Penugasan Sub-Unit" },
      kam: { type: "sub_unit", label: "Penugasan Sub-Unit" },
      jum: { type: "full_day", label: "Masuk / Full Day" },
      sab: { type: "off", label: "Libur / Off" },
      min: { type: "off", label: "Libur / Off" },
    },
  },
  {
    id: "emp-3",
    nik: "2024088",
    nama: "Siti Rahma",
    departemen: "Customer Support",
    role: "Customer Support",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    initials: "SR",
    schedule: {
      sen: { type: "full_day", label: "Masuk / Full Day" },
      sel: { type: "full_day", label: "Masuk / Full Day" },
      rab: { type: "full_day", label: "Masuk / Full Day" },
      kam: { type: "full_day", label: "Masuk / Full Day" },
      jum: { type: "full_day", label: "Masuk / Full Day" },
      sab: { type: "khusus", label: "Penugasan Khusus" },
      min: { type: "off", label: "Libur / Off" },
    },
  },
  {
    id: "emp-4",
    nik: "2024102",
    nama: "Kevin Pratama",
    departemen: "IT & Infrastructure",
    role: "Network Engineer",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    initials: "KP",
    schedule: {
      sen: { type: "full_day", label: "Masuk / Full Day" },
      sel: {
        type: "task",
        title: "Perbaikan ODP Node Cilandak",
        location: "Sentral Jaksel",
        time: "08:15",
        priority: "HIGH",
        status: "In Progress",
        attachment: true,
        geofence: true,
      },
      rab: { type: "full_day", label: "Masuk / Full Day" },
      kam: { type: "sub_unit", label: "Penugasan Sub-Unit" },
      jum: { type: "full_day", label: "Masuk / Full Day" },
      sab: { type: "off", label: "Libur / Off" },
      min: { type: "off", label: "Libur / Off" },
    },
  },
  {
    id: "emp-5",
    nik: "2024119",
    nama: "Julia Sari",
    departemen: "Operasional",
    role: "Field Quality Assurance",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    initials: "JS",
    schedule: {
      sen: { type: "full_day", label: "Masuk / Full Day" },
      sel: { type: "full_day", label: "Masuk / Full Day" },
      rab: {
        type: "task",
        title: "Audit Grounding Tower BTS",
        location: "Area Depok Timur",
        time: "08:00",
        priority: "MEDIUM",
        status: "Done",
        attachment: false,
        geofence: true,
      },
      kam: { type: "full_day", label: "Masuk / Full Day" },
      jum: { type: "full_day", label: "Masuk / Full Day" },
      sab: { type: "off", label: "Libur / Off" },
      min: { type: "off", label: "Libur / Off" },
    },
  },
]

const weekPeriods = [
  { label: "03 Aug - 09 Aug 2026", range: "03/08 - 09/08" },
  { label: "10 Aug - 16 Aug 2026", range: "10/08 - 16/08" },
  { label: "17 Aug - 23 Aug 2026", range: "17/08 - 23/08" },
  { label: "24 Aug - 30 Aug 2026", range: "24/08 - 30/08" },
]

export default function JadwalPage() {
  const [viewMode, setViewMode] = React.useState<"Mingguan" | "Bulanan">("Mingguan")
  const [currentWeekIndex, setCurrentWeekIndex] = React.useState(1) // "10 Aug - 16 Aug 2026"
  const [employees, setEmployees] = React.useState<EmployeeSchedule[]>(initialEmployees)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState("Semua")
  const [isAddShiftOpen, setIsAddShiftOpen] = React.useState(false)

  // Selected Task Modal state
  const [selectedTask, setSelectedTask] = React.useState<{
    employeeName: string
    employeeNik: string
    day: string
    cell: Extract<ShiftCellType, { type: "task" }>
  } | null>(null)

  const handlePrevWeek = () => {
    setCurrentWeekIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextWeek = () => {
    setCurrentWeekIndex((prev) => (prev < weekPeriods.length - 1 ? prev + 1 : prev))
  }

  const filteredEmployees = React.useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nik.includes(searchQuery) ||
        emp.departemen.toLowerCase().includes(searchQuery.toLowerCase())
      const matchDept = deptFilter === "Semua" || emp.departemen === deptFilter
      return matchSearch && matchDept
    })
  }, [employees, searchQuery, deptFilter])

  const handleAddShift = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const nama = formData.get("nama") as string
    const nik = formData.get("nik") as string
    const departemen = formData.get("departemen") as string
    const taskTitle = formData.get("taskTitle") as string
    const location = formData.get("location") as string
    const time = (formData.get("time") as string) || "07:30"
    const priority = (formData.get("priority") as "HIGH" | "MEDIUM" | "LOW") || "MEDIUM"

    const newEmp: EmployeeSchedule = {
      id: `emp-${Date.now()}`,
      nik,
      nama,
      departemen,
      role: departemen,
      avatarUrl: "",
      initials: nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      schedule: {
        sen: {
          type: "task",
          title: taskTitle || "Maintenance Jaringan Witel",
          location: location || "Area Jakarta Pusat",
          time,
          priority,
          status: "In Progress",
          attachment: true,
          geofence: true,
        },
        sel: { type: "full_day", label: "Masuk / Full Day" },
        rab: { type: "full_day", label: "Masuk / Full Day" },
        kam: { type: "full_day", label: "Masuk / Full Day" },
        jum: { type: "full_day", label: "Masuk / Full Day" },
        sab: { type: "off", label: "Libur / Off" },
        min: { type: "off", label: "Libur / Off" },
      },
    }

    setEmployees([newEmp, ...employees])
    setIsAddShiftOpen(false)
    toast.success(`Jadwal & penugasan untuk ${nama} berhasil ditambahkan!`)
  }

  const handleUpdateTaskStatus = (newStatus: "In Progress" | "Done" | "Pending") => {
    if (!selectedTask) return
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.nik !== selectedTask.employeeNik) return emp
        const currentCell = emp.schedule.sen
        if (currentCell.type === "task") {
          return {
            ...emp,
            schedule: {
              ...emp.schedule,
              sen: { ...currentCell, status: newStatus },
            },
          }
        }
        return emp
      })
    )
    setSelectedTask((prev) => (prev ? { ...prev, cell: { ...prev.cell, status: newStatus } } : null))
    toast.success(`Status tugas berhasil diubah menjadi "${newStatus}"`)
  }

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

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-16 bg-muted/10">

          {/* 1. PAGE TITLE & DESCRIPTION HEADER (Always at the very top) */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Jadwal & Shift Kerja Teknisi
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengaturan penugasan shift harian, jadwal piket maintenance & monitoring area kantor Telkom Akses
              </p>
            </div>
          </div>

          {/* 2. 4 TOP SUMMARY CARDS (Overview Style) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <UsersIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Total Karyawan Terjadwal</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    179 Orang
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  179
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Dari 179 karyawan aktif bertugas</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Shift Pagi (Sentral)</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    08:00 - 17:00
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  124
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Teknisi STO & sentral kantor</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <ClipboardListIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Penugasan Lapangan</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Dinas Luar
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  42
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Splicing & maintenance ODP</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CalendarCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Libur & Cuti</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    Off Duty
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
                  13
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Izin sakit & cuti mingguan</p>
              </div>
            </div>
          </div>

          {/* 3. TOP CONTROLS & NAVIGATION BAR */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            {/* View Switcher Tabs (Mingguan | Bulanan) */}
            <div className="flex items-center gap-1 rounded-[8px] border bg-muted p-1 text-muted-foreground self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("Mingguan")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "Mingguan"
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground"
                )}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => setViewMode("Bulanan")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "Bulanan"
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground"
                )}
              >
                Bulanan
              </button>
            </div>

            {/* Date Range Navigator & Action Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-background dark:bg-card px-3 py-1.5 rounded-[8px] border border-border/80 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  disabled={currentWeekIndex === 0}
                  className="p-1 hover:bg-muted rounded-[8px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Minggu Sebelumnya"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>

                <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground min-w-[150px] text-center">
                  {weekPeriods[currentWeekIndex].label}
                </span>

                <button
                  type="button"
                  onClick={handleNextWeek}
                  disabled={currentWeekIndex === weekPeriods.length - 1}
                  className="p-1 hover:bg-muted rounded-[8px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Minggu Berikutnya"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setIsAddShiftOpen(true)}
                className="h-9 text-xs gap-1.5 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs shrink-0 cursor-pointer"
              >
                <PlusIcon className="size-4" /> Atur Shift Baru
              </Button>
            </div>

          </div>

          {/* SEARCH & QUICK FILTERS BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-[8px] border border-border/80 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama karyawan, NIK, penugasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-[8px] bg-background"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Select value={deptFilter} onValueChange={(val) => setDeptFilter(val ?? "Semua")}>
                <SelectTrigger className="h-9 w-[160px] text-xs rounded-[8px] bg-background">
                  <SelectValue placeholder="Departemen" />
                </SelectTrigger>
                <SelectContent className="rounded-[8px] text-xs">
                  <SelectItem value="Semua">Semua Divisi</SelectItem>
                  <SelectItem value="Operasional">Operasional</SelectItem>
                  <SelectItem value="Teknisi Lapangan">Teknisi Lapangan</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                  <SelectItem value="IT & Infrastructure">IT & Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MAIN VIEW CONTENT */}
          {viewMode === "Mingguan" && (
            <div className="rounded-[8px] border border-border/80 bg-card p-4 sm:p-6 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-64 pr-4">
                        KARYAWAN INFO
                      </th>
                      <th className="text-center pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[130px] px-1.5">
                        SEN (10/08)
                      </th>
                      <th className="text-center pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[130px] px-1.5">
                        SEL (11/08)
                      </th>
                      <th className="text-center pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[130px] px-1.5">
                        RAB (12/08)
                      </th>
                      <th className="text-center pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[130px] px-1.5">
                        KAM (13/08)
                      </th>
                      <th className="text-center pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[130px] px-1.5">
                        JUM (14/08)
                      </th>
                      <th className="text-center pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[110px] px-1.5">
                        SAB (15/08)
                      </th>
                      <th className="text-center pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[110px] px-1.5">
                        MIN (16/08)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/10 transition-colors">

                        {/* Karyawan Info Column */}
                        <td className="py-4 pr-4 align-top">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-11 rounded-full border border-border shadow-2xs">
                              {emp.avatarUrl ? (
                                <AvatarImage src={emp.avatarUrl} alt={emp.nama} className="object-cover" />
                              ) : null}
                              <AvatarFallback className="font-bold text-xs bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                                {emp.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm text-foreground truncate">
                                {emp.nama}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                NIK: {emp.nik} • {emp.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SEN (10/08) */}
                        <td className="p-1.5 align-top">
                          <ShiftCell
                            cell={emp.schedule.sen}
                            onClickTask={() => {
                              if (emp.schedule.sen.type === "task") {
                                setSelectedTask({
                                  employeeName: emp.nama,
                                  employeeNik: emp.nik,
                                  day: "Senin (10/08)",
                                  cell: emp.schedule.sen,
                                })
                              }
                            }}
                          />
                        </td>

                        {/* SEL (11/08) */}
                        <td className="p-1.5 align-top">
                          <ShiftCell
                            cell={emp.schedule.sel}
                            onClickTask={() => {
                              if (emp.schedule.sel.type === "task") {
                                setSelectedTask({
                                  employeeName: emp.nama,
                                  employeeNik: emp.nik,
                                  day: "Selasa (11/08)",
                                  cell: emp.schedule.sel,
                                })
                              }
                            }}
                          />
                        </td>

                        {/* RAB (12/08) */}
                        <td className="p-1.5 align-top">
                          <ShiftCell
                            cell={emp.schedule.rab}
                            onClickTask={() => {
                              if (emp.schedule.rab.type === "task") {
                                setSelectedTask({
                                  employeeName: emp.nama,
                                  employeeNik: emp.nik,
                                  day: "Rabu (12/08)",
                                  cell: emp.schedule.rab,
                                })
                              }
                            }}
                          />
                        </td>

                        {/* KAM (13/08) */}
                        <td className="p-1.5 align-top">
                          <ShiftCell
                            cell={emp.schedule.kam}
                            onClickTask={() => {
                              if (emp.schedule.kam.type === "task") {
                                setSelectedTask({
                                  employeeName: emp.nama,
                                  employeeNik: emp.nik,
                                  day: "Kamis (13/08)",
                                  cell: emp.schedule.kam,
                                })
                              }
                            }}
                          />
                        </td>

                        {/* JUM (14/08) */}
                        <td className="p-1.5 align-top">
                          <ShiftCell
                            cell={emp.schedule.jum}
                            onClickTask={() => {
                              if (emp.schedule.jum.type === "task") {
                                setSelectedTask({
                                  employeeName: emp.nama,
                                  employeeNik: emp.nik,
                                  day: "Jumat (14/08)",
                                  cell: emp.schedule.jum,
                                })
                              }
                            }}
                          />
                        </td>

                        {/* SAB (15/08) */}
                        <td className="p-1.5 align-top">
                          <ShiftCell
                            cell={emp.schedule.sab}
                            onClickTask={() => {
                              if (emp.schedule.sab.type === "task") {
                                setSelectedTask({
                                  employeeName: emp.nama,
                                  employeeNik: emp.nik,
                                  day: "Sabtu (15/08)",
                                  cell: emp.schedule.sab,
                                })
                              }
                            }}
                          />
                        </td>

                        {/* MIN (16/08) */}
                        <td className="p-1.5 align-top">
                          <ShiftCell
                            cell={emp.schedule.min}
                            onClickTask={() => {
                              if (emp.schedule.min.type === "task") {
                                setSelectedTask({
                                  employeeName: emp.nama,
                                  employeeNik: emp.nik,
                                  day: "Minggu (16/08)",
                                  cell: emp.schedule.min,
                                })
                              }
                            }}
                          />
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* BOTTOM LEGEND BAR */}
              <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Legend:</span>

                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-500 inline-block shadow-2xs"></span>
                  <span>High Priority</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500 inline-block shadow-2xs"></span>
                  <span>Medium Priority</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                  <span>Valid Geofence</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <FileTextIcon className="size-3.5 text-muted-foreground" />
                  <span>Attachment Submitted</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="size-3 border border-dashed border-muted-foreground/60 rounded-xs inline-block bg-muted/40"></span>
                  <span>Libur/Off</span>
                </div>
              </div>
            </div>
          )}

          {/* BULANAN VIEW */}
          {viewMode === "Bulanan" && (
            <Card className="p-6 rounded-[8px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Kalender Shift Agustus 2026</h3>
                  <p className="text-xs text-muted-foreground">Ikhtisar jadwal dan ketersediaan teknisi per tanggal</p>
                </div>
                <Badge variant="outline" className="font-semibold text-xs bg-red-50 text-red-700">
                  Agustus 2026
                </Badge>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                  <div key={day} className="font-bold py-2 text-muted-foreground uppercase text-[11px]">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1
                  const isToday = dayNum === 10
                  return (
                    <div
                      key={dayNum}
                      className={`min-h-[85px] p-2 rounded-[8px] border flex flex-col justify-between transition-all ${isToday
                          ? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800/60 ring-2 ring-red-500/20"
                          : "bg-card border-border/70 hover:border-border"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs ${isToday ? "text-red-600" : "text-foreground"}`}>
                          {dayNum}
                        </span>
                        {isToday && <span className="size-1.5 rounded-full bg-red-500"></span>}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded px-1 py-0.5 truncate text-left">
                          5 Shift Masuk
                        </span>
                        {dayNum % 3 === 0 && (
                          <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 rounded px-1 py-0.5 truncate text-left">
                            2 Task Lapangan
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* TASK DETAIL DIALOG */}
          <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
            <DialogContent className="sm:max-w-md p-6 rounded-[8px] border bg-card shadow-xl">
              {selectedTask && (
                <>
                  <DialogHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={
                          selectedTask.cell.priority === "HIGH"
                            ? "bg-red-50 text-red-600 border-red-200 font-bold text-[10px]"
                            : "bg-blue-50 text-blue-600 border-blue-200 font-bold text-[10px]"
                        }
                      >
                        {selectedTask.cell.priority} PRIORITY
                      </Badge>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <ClockIcon className="size-3.5" /> {selectedTask.cell.time} WIB
                      </span>
                    </div>
                    <DialogTitle className="text-base font-bold text-foreground pt-1.5">
                      {selectedTask.cell.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPinIcon className="size-3.5 text-muted-foreground shrink-0" />
                      {selectedTask.cell.location} • {selectedTask.day}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-4 py-3 text-xs">
                    <div className="bg-muted/40 p-3 rounded-[8px] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground font-medium">Teknisi Bertugas</p>
                        <p className="font-bold text-foreground text-sm">{selectedTask.employeeName}</p>
                        <p className="text-muted-foreground text-[11px]">NIK: {selectedTask.employeeNik}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground font-medium">Validasi Geofence</p>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs mt-0.5">
                          <CheckCircle2Icon className="size-3.5" /> Radius OK
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Ubah Status Pengerjaan</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["In Progress", "Done", "Pending"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateTaskStatus(st)}
                            className={`py-2 px-3 rounded-[8px] border text-xs font-semibold transition-all cursor-pointer ${selectedTask.cell.status === st
                                ? "bg-red-600 text-white border-red-600 shadow-xs"
                                : "bg-card hover:bg-muted text-muted-foreground"
                              }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-3 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedTask(null)}
                      className="w-full text-xs font-semibold rounded-[8px]"
                    >
                      Tutup
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* ADD SHIFT DIALOG */}
          <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
            <DialogContent className="sm:max-w-md p-6 rounded-[8px] border bg-card shadow-xl">
              <DialogHeader className="pb-2 border-b border-border/60">
                <DialogTitle className="text-base font-bold text-foreground">
                  Atur Shift & Penugasan Baru
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Tentukan teknisi, divisi kerja, area penugasan, dan prioritas tugas.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddShift} className="flex flex-col gap-3.5 pt-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nik" className="text-xs font-semibold text-foreground">
                      NIK Teknisi <span className="text-red-500">*</span>
                    </Label>
                    <Input id="nik" name="nik" placeholder="2024105" required className="h-9 font-mono text-xs rounded-[8px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nama" className="text-xs font-semibold text-foreground">
                      Nama Teknisi <span className="text-red-500">*</span>
                    </Label>
                    <Input id="nama" name="nama" placeholder="Nama Lengkap" required className="h-9 text-xs rounded-[8px]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground">Divisi / Role</Label>
                    <Select name="departemen" defaultValue="Operasional">
                      <SelectTrigger className="h-9 text-xs rounded-[8px]">
                        <SelectValue placeholder="Pilih Divisi" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[8px] text-xs">
                        <SelectItem value="Operasional">Operasional</SelectItem>
                        <SelectItem value="Teknisi Lapangan">Teknisi Lapangan</SelectItem>
                        <SelectItem value="Customer Support">Customer Support</SelectItem>
                        <SelectItem value="IT & Infrastructure">IT & Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground">Prioritas Task</Label>
                    <Select name="priority" defaultValue="HIGH">
                      <SelectTrigger className="h-9 text-xs rounded-[8px]">
                        <SelectValue placeholder="Prioritas" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[8px] text-xs">
                        <SelectItem value="HIGH">Tinggi (High Priority)</SelectItem>
                        <SelectItem value="MEDIUM">Standar (Medium Priority)</SelectItem>
                        <SelectItem value="LOW">Rendah (Low Priority)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="taskTitle" className="text-xs font-semibold text-foreground">
                    Judul Task / Penugasan Lapangan
                  </Label>
                  <Input
                    id="taskTitle"
                    name="taskTitle"
                    placeholder="Contoh: Maintenance Jaringan Witel"
                    defaultValue="Maintenance Jaringan Witel"
                    className="h-9 text-xs rounded-[8px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="location" className="text-xs font-semibold text-foreground">
                      Area / Lokasi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Area Jakarta Pusat"
                      defaultValue="Area Jakarta Pusat"
                      required
                      className="h-9 text-xs rounded-[8px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="time" className="text-xs font-semibold text-foreground">
                      Jam Mulai
                    </Label>
                    <Input id="time" name="time" placeholder="07:30" defaultValue="07:30" className="h-9 text-xs rounded-[8px]" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddShiftOpen(false)}
                    className="h-9 px-4 text-xs font-semibold rounded-[8px]"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                  >
                    Simpan Jadwal Shift
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Sub-Component to Render Shift Cells according to the exact Reference Design
function ShiftCell({ cell, onClickTask }: { cell: ShiftCellType; onClickTask?: () => void }) {
  if (cell.type === "task") {
    const isHigh = cell.priority === "HIGH"
    return (
      <div
        onClick={onClickTask}
        className="bg-card border border-border/90 rounded-[8px] p-2.5 shadow-2xs space-y-1.5 hover:shadow-md hover:border-red-300 dark:hover:border-red-800 transition-all text-left group cursor-pointer min-h-[96px] flex flex-col justify-between"
      >
        <div>
          {/* Priority Badge & Time */}
          <div className="flex items-center justify-between gap-1">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${isHigh
                  ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border-red-200/80 dark:border-red-900/50"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/50"
                }`}
            >
              {cell.priority}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ClockIcon className="size-3" /> {cell.time}
            </span>
          </div>

          {/* Title */}
          <p className="text-xs font-bold text-foreground leading-snug mt-1 line-clamp-2">
            {cell.title}
          </p>

          {/* Location */}
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPinIcon className="size-2.5 text-muted-foreground shrink-0" />
            <span className="truncate">{cell.location}</span>
          </p>
        </div>

        {/* Footer: Status Badge & 3-dots */}
        <div className="flex items-center justify-between pt-1">
          {cell.status === "In Progress" ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/40">
              In Progress
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center gap-0.5">
              <CheckSquareIcon className="size-2.5" /> Done
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <MoreVerticalIcon className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs rounded-[8px]">
              <DropdownMenuItem onClick={onClickTask} className="cursor-pointer">
                <EyeIcon className="size-3.5 mr-2" /> Detail Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClickTask} className="cursor-pointer">
                <EditIcon className="size-3.5 mr-2" /> Edit Shift
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.success("Notifikasi jadwal telah dikirim ke teknisi")}
                className="cursor-pointer text-blue-600"
              >
                Kirim Pengingat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  if (cell.type === "full_day") {
    return (
      <div className="bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/50 rounded-[8px] p-3 h-full min-h-[96px] flex items-center justify-center text-center cursor-pointer transition-colors shadow-2xs">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 leading-snug">
          {cell.label}
        </span>
      </div>
    )
  }

  if (cell.type === "sub_unit" || cell.type === "khusus") {
    return (
      <div className="bg-purple-50/70 hover:bg-purple-100/80 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 border border-purple-200/70 dark:border-purple-900/50 rounded-[8px] p-3 h-full min-h-[96px] flex items-center justify-center text-center cursor-pointer transition-colors shadow-2xs">
        <span className="text-xs font-bold text-purple-800 dark:text-purple-300 leading-snug">
          {cell.label}
        </span>
      </div>
    )
  }

  if (cell.type === "off") {
    return (
      <div className="bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 border border-dashed border-border/80 rounded-[8px] p-3 h-full min-h-[96px] flex items-center justify-center text-center cursor-pointer transition-colors shadow-2xs">
        <span className="text-xs font-medium text-muted-foreground/80 leading-snug">
          {cell.label}
        </span>
      </div>
    )
  }

  return null
}
