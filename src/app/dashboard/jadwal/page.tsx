"use client"

import * as React from "react"
import {
  CalendarRangeIcon,
  ClockIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const shiftData = [
  { nik: "10293841", nama: "Andi Pratama", dept: "IT", shift: "Shift Pagi (08:00 - 16:00)", lokasi: "Sentral Jaksel", status: "Bertugas" },
  { nik: "10293842", nama: "Bambang Susanto", dept: "Operations", shift: "Shift Pagi (08:00 - 16:00)", lokasi: "ODP Pasar Minggu", status: "Bertugas" },
  { nik: "10293843", nama: "Irfan Maulana", dept: "IT", shift: "Shift Siang (13:00 - 21:00)", lokasi: "Node Cilandak", status: "Siap Shift" },
  { nik: "10293844", nama: "Kevin Pratama", dept: "IT", shift: "On-Call Maintenance (24j)", lokasi: "Standby Office", status: "On-Call" },
  { nik: "10293847", nama: "Oscar Budiman", dept: "Operations", shift: "Shift Pagi (08:00 - 16:00)", lokasi: "Tower RW 05", status: "Bertugas" },
  { nik: "10293848", nama: "Julia Sari", dept: "Operations", shift: "Shift Pagi (08:00 - 16:00)", lokasi: "Standby Office", status: "Bertugas" },
]

export default function JadwalPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredShift = React.useMemo(() => {
    return shiftData.filter((item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik.includes(searchQuery)
    )
  }, [searchQuery])

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
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-12">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Jadwal & Shift Kerja Teknisi
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengaturan penugasan shift harian & jadwal piket maintenance kantor Telkom Akses
              </p>
            </div>
            <Button className="h-9 text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs">
              <PlusIcon className="size-4" /> Atur Shift Baru
            </Button>
          </div>

          {/* Shift Metrics Cards (Red Theme) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-sm font-medium text-muted-foreground">Shift Pagi (08:00 - 16:00)</span>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">4</p>
                <p className="mt-1 text-xs text-muted-foreground">Teknisi aktif bertugas saat ini</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-sm font-medium text-muted-foreground">Shift Siang (13:00 - 21:00)</span>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">1</p>
                <p className="mt-1 text-xs text-muted-foreground">Teknisi siap pengganti</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <UsersIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div className="relative">
                <span className="text-sm font-medium text-muted-foreground">On-Call Maintenance</span>
                <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums text-foreground">1</p>
                <p className="mt-1 text-xs text-muted-foreground">Standby 24 jam untuk emergency</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center justify-between bg-card p-3 rounded-2xl border">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari teknisi atau shift..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Shift Table */}
          <Card className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-24">NIK</TableHead>
                  <TableHead>Nama Teknisi</TableHead>
                  <TableHead>Shift Kerja</TableHead>
                  <TableHead>Lokasi / Area Penugasan</TableHead>
                  <TableHead>Status Shift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShift.map((row) => (
                  <TableRow key={row.nik}>
                    <TableCell className="font-mono text-xs font-semibold">{row.nik}</TableCell>
                    <TableCell className="font-semibold text-sm text-foreground">{row.nama}</TableCell>
                    <TableCell>{row.shift}</TableCell>
                    <TableCell className="text-muted-foreground">{row.lokasi}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
