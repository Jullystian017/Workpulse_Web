"use client"

import * as React from "react"
import {
  MapPinIcon,
  CheckCircle2Icon,
  ClockIcon,
  ShieldCheckIcon,
  NavigationIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  CalendarIcon,
  CalendarCheckIcon,
  CalendarRangeIcon,
  TrendingUpIcon,
  FileTextIcon,
  ArrowRightIcon,
  WifiIcon
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface PresensiLog {
  tanggal: string
  hari: string
  masuk: string
  pulang: string
  jarakGps: string
  status: "Tepat Waktu" | "Terlambat" | "Izin/Cuti" | "Dinas Luar"
  durasiKerja: string
}

const riwayatPresensiSaya: PresensiLog[] = [
  {
    tanggal: "24 Agu 2026",
    hari: "Senin",
    masuk: "07:58 WIB",
    pulang: "--:-- WIB",
    jarakGps: "42m (Kantor Pusat)",
    status: "Tepat Waktu",
    durasiKerja: "Sedang Berjalan",
  },
  {
    tanggal: "21 Agu 2026",
    hari: "Jumat",
    masuk: "07:52 WIB",
    pulang: "17:05 WIB",
    jarakGps: "35m (Kantor Pusat)",
    status: "Tepat Waktu",
    durasiKerja: "8 jam 13 menit",
  },
  {
    tanggal: "20 Agu 2026",
    hari: "Kamis",
    masuk: "08:18 WIB",
    pulang: "17:30 WIB",
    jarakGps: "58m (Kantor Pusat)",
    status: "Terlambat",
    durasiKerja: "8 jam 12 menit",
  },
  {
    tanggal: "19 Agu 2026",
    hari: "Rabu",
    masuk: "08:00 WIB",
    pulang: "17:02 WIB",
    jarakGps: "45m (Kantor Pusat)",
    status: "Tepat Waktu",
    durasiKerja: "8 jam 2 menit",
  },
  {
    tanggal: "18 Agu 2026",
    hari: "Selasa",
    masuk: "08:45 WIB",
    pulang: "17:15 WIB",
    jarakGps: "Dinas Luar (STO Gambir)",
    status: "Dinas Luar",
    durasiKerja: "8 jam 30 menit",
  },
]

export default function KaryawanPresensiPage() {
  const [currentTime, setCurrentTime] = React.useState<string>("")
  const [currentDate, setCurrentDate] = React.useState<string>("")
  const [isCheckedIn, setIsCheckedIn] = React.useState<boolean>(true)
  const [checkInTime, setCheckInTime] = React.useState<string>("07:58 WIB")
  const [userDistance, setUserDistance] = React.useState<number>(42) // in meters
  const [isRefreshingGps, setIsRefreshingGps] = React.useState<boolean>(false)

  const geofenceLimit = 200 // Maksimal 200 meter
  const isWithinGeofence = userDistance <= geofenceLimit

  // Live Digital Clock
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      )
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefreshGps = () => {
    setIsRefreshingGps(true)
    setTimeout(() => {
      // Simulasikan deteksi akurasi GPS
      const randomDistance = Math.floor(Math.random() * 35) + 30 // 30m - 65m
      setUserDistance(randomDistance)
      setIsRefreshingGps(false)
      toast.success(`Lokasi GPS diperbarui: ${randomDistance} meter dari Kantor Telkom Akses (Radius Valid).`)
    }, 800)
  }

  const handleClockIn = () => {
    if (!isWithinGeofence) {
      toast.error(`Presensi Gagal: Anda berada di luar radius kantor (${userDistance}m > ${geofenceLimit}m).`)
      return
    }

    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
    setIsCheckedIn(true)
    setCheckInTime(now)
    toast.success(`Clock In Berhasil pada ${now}! Lokasi terverifikasi dalam radius 200m kantor Telkom Akses.`)
  }

  const handleClockOut = () => {
    setIsCheckedIn(false)
    toast.info("Clock Out (Absen Pulang) berhasil tercatat. Selamat beristirahat!")
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Header Title & Subtitle (Always at the very top) */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Presensi GPS Geofencing (200m)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Validasi kehadiran otomatis berdasarkan jarak koordinat perangkat ke Kantor Telkom Akses
        </p>
      </div>

      {/* 2. 4 Summary Metric Cards (Overview Style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CalendarCheckIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Hadir Tepat Waktu</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                95.4%
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              21 <span className="text-lg font-normal text-muted-foreground">Hari</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Konsisten sesuai jadwal shift</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <ClockIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Terlambat Bulan Ini</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                3 Menit
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              1 <span className="text-lg font-normal text-muted-foreground">Kali</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">20 Agustus 2026</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CalendarRangeIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Izin / Cuti Terpakai</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                1 Hari
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              1 <span className="text-lg font-normal text-muted-foreground">Hari</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Sisa kuota: 9 hari</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group relative overflow-hidden rounded-[8px] border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <TrendingUpIcon className="absolute -right-2 -top-2 size-20 text-red-100 dark:text-red-950/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Akumulasi Jam Kerja</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                Target 160 Jam
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-foreground">
              172 <span className="text-lg font-normal text-muted-foreground">Jam</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Memenuhi target 160 jam/bln</p>
          </div>
        </div>
      </div>

      {/* 3. Main Hero: Unified Live Attendance & GPS Console */}
      <div className="rounded-[8px] border border-border bg-card p-6 sm:p-7 shadow-xs overflow-hidden relative">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative">
          {/* Left Column: High-End Live Radar & Geofence Status */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            {/* Top Row: Title, Live Status Tag, & Detect Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold text-foreground">
                  Validasi Geofence Aktif
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  Dalam Radius
                </span>
              </div>

              {/* Action Button: Deteksi GPS */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshGps}
                disabled={isRefreshingGps}
                className="h-8.5 px-3 text-xs font-semibold rounded-[8px] gap-2 border-border bg-background hover:bg-muted text-foreground cursor-pointer shadow-2xs transition-all hover:border-red-300 dark:hover:border-red-800"
              >
                <RefreshCwIcon className={`size-3.5 ${isRefreshingGps ? "animate-spin text-red-600" : "text-red-600"}`} />
                <span>{isRefreshingGps ? "Memindai GPS..." : "Deteksi Lokasi GPS"}</span>
              </Button>
            </div>

            {/* Main Visual Distance Radar Tile */}
            <div className="p-5 sm:p-6 rounded-[8px] bg-gradient-to-br from-muted/50 via-muted/20 to-background border border-border/80 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-2xs">
              {/* Radar Concentric Graphic Box */}
              <div className="relative size-20 sm:size-22 rounded-[8px] bg-gradient-to-br from-red-500/15 via-red-500/5 to-transparent border border-red-200 dark:border-red-900/60 flex items-center justify-center shrink-0 shadow-xs">
                {/* Concentric Pulse Rings */}
                <div className="absolute inset-1.5 rounded-[8px] border border-red-400/30 animate-pulse" />
                <div className="absolute inset-3.5 rounded-[8px] border border-red-500/20" />
                {/* Center Pin Icon */}
                <div className="size-11 rounded-[8px] bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md">
                  <MapPinIcon className="size-6 text-white" />
                </div>
              </div>

              {/* Distance Metrics & Progress Bar */}
              <div className="flex-1 space-y-2.5 w-full min-w-0">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">
                    Jarak Real-Time ke Titik Kantor Telkom Akses:
                  </span>
                  <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
                      {userDistance}
                    </span>
                    <span className="text-base font-bold text-muted-foreground">Meter</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 ml-1">
                      <CheckCircle2Icon className="size-3 text-emerald-600 shrink-0" />
                      Radius Valid (Maks. {geofenceLimit}m)
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                    <span className="text-foreground">{userDistance}m terpakai</span>
                    <span>Batas Geofence {geofenceLimit}m</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 shadow-xs"
                      style={{ width: `${(userDistance / geofenceLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3 Micro-Specs Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-[8px] bg-muted/40 border border-border/70 text-xs space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-medium block">Sentral Kantor</span>
                <span className="font-bold text-foreground block truncate">Telkom Akses</span>
              </div>
              <div className="p-3 rounded-[8px] bg-muted/40 border border-border/70 text-xs space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-medium block">Jadwal Shift</span>
                <span className="font-bold text-foreground block truncate">08:00 - 17:00 WIB</span>
              </div>
              <div className="p-3 rounded-[8px] bg-muted/40 border border-border/70 text-xs space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-medium block">Batas Toleransi</span>
                <span className="font-bold text-foreground block truncate">08:15 WIB</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clock Console & Action */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-[8px] bg-muted/30 border border-border/70 gap-5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {isCheckedIn ? "JAM MASUK TERVERIFIKASI" : currentDate || "Senin, 24 Agustus 2026"}
              </span>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-foreground">
                {isCheckedIn ? checkInTime : currentTime || "08:00:00 WIB"}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 mt-1">
                <CheckCircle2Icon className="size-3.5 text-emerald-600" />
                <span>Tepat Waktu &bull; Radius 42m Terverifikasi</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <Button
                type="button"
                onClick={handleClockIn}
                disabled={isCheckedIn || !isWithinGeofence}
                className={`w-full h-12 text-sm font-bold rounded-[8px] shadow-xs transition-all gap-2 cursor-pointer ${
                  isCheckedIn
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white cursor-default"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <CheckCircle2Icon className="size-4" />
                <span>
                  {isCheckedIn
                    ? `Presensi Masuk Berhasil (${checkInTime})`
                    : "Clock In Sekarang (Masuk)"}
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleClockOut}
                disabled={!isCheckedIn}
                className="w-full h-10 text-xs font-semibold rounded-[8px] border border-border hover:bg-muted text-foreground cursor-pointer"
              >
                Clock Out (Absen Pulang)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Riwayat Presensi Saya Table */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-[8px] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Riwayat Log Presensi Anda (Bulan Ini)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Rekapitulasi jam clock-in, jam clock-out, dan verifikasi radius GPS per hari kerja
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-[8px] border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3.5 pl-4">Tanggal & Hari</th>
                <th className="p-3.5">Clock In</th>
                <th className="p-3.5">Clock Out</th>
                <th className="p-3.5">Verifikasi Jarak GPS</th>
                <th className="p-3.5">Durasi Kerja</th>
                <th className="p-3.5 pr-4 text-right">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
              {riwayatPresensiSaya.map((log, index) => {
                const isTepatWaktu = log.status === "Tepat Waktu"
                const isTerlambat = log.status === "Terlambat"
                const isDinasLuar = log.status === "Dinas Luar"

                return (
                  <tr key={index} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3.5 pl-4">
                      <span className="font-bold text-zinc-900 dark:text-white block">{log.tanggal}</span>
                      <span className="text-[11px] text-zinc-400">{log.hari}</span>
                    </td>
                    <td className="p-3.5 font-bold text-zinc-900 dark:text-white">{log.masuk}</td>
                    <td className="p-3.5 text-zinc-600 dark:text-zinc-400">{log.pulang}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                        <MapPinIcon className="size-3.5 text-red-600 shrink-0" />
                        <span>{log.jarakGps}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-zinc-600 dark:text-zinc-400">{log.durasiKerja}</td>
                    <td className="p-3.5 pr-4 text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          isTepatWaktu
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isTerlambat
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : isDinasLuar
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-zinc-100 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
