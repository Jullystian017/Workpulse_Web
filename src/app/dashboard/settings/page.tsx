"use client"

import * as React from "react"
import {
  Settings2Icon,
  MapPinIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyRoundIcon,
  SaveIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function SettingsPage() {
  const [geofenceRadius, setGeofenceRadius] = React.useState("200")
  const [adminEmail, setAdminEmail] = React.useState("admin@telkomakses.co.id")

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Pengaturan Geofencing & Notifikasi berhasil disimpan!")
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
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-12 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Pengaturan Sistem & Geofencing
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Konfigurasi lokasi presensi GPS, batas radius, dan akun Administrator
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
            {/* Geofencing Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPinIcon className="size-4 text-primary" />
                  Konfigurasi Geofencing Presensi
                </CardTitle>
                <CardDescription>
                  Atur koordinat pusat kantor Telkom Akses dan batas toleransi jarak presensi karyawan.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lat" className="font-semibold">Latitude Kantor Pusat</Label>
                    <Input id="lat" defaultValue="-6.2088" className="h-9" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lng" className="font-semibold">Longitude Kantor Pusat</Label>
                    <Input id="lng" defaultValue="106.8456" className="h-9" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="radius" className="font-semibold">
                    Batas Radius Toleransi GPS (Meter)
                  </Label>
                  <Input
                    id="radius"
                    type="number"
                    value={geofenceRadius}
                    onChange={(e) => setGeofenceRadius(e.target.value)}
                    placeholder="200"
                    className="h-9"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Rekomendasi standar: 100m – 300m untuk mengantisipasi GPS drift perangkat seluler.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notification Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BellIcon className="size-4 text-primary" />
                  Notifikasi & Pengingat Deadline Task
                </CardTitle>
                <CardDescription>
                  Pengaturan pesan reminder otomatis sebelum/sesudah deadline task.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/30">
                  <div>
                    <span className="font-semibold text-foreground block">Notifikasi Overdue Task</span>
                    <span className="text-muted-foreground">Kirim reminder otomatis jika task melewati deadline.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-primary" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/30">
                  <div>
                    <span className="font-semibold text-foreground block">Laporan Ringkasan Harian</span>
                    <span className="text-muted-foreground">Kirim email rekap presensi & task setiap pukul 17:00.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Admin Account */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheckIcon className="size-4 text-primary" />
                  Pengaturan Akun Admin
                </CardTitle>
                <CardDescription>Informasi akun utama administrator sistem WorkPulse.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="adminEmail" className="font-semibold">Email Administrator</Label>
                  <Input
                    id="adminEmail"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="h-9"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button type="submit" className="h-9 text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                  <SaveIcon className="size-4" /> Simpan Pengaturan
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
