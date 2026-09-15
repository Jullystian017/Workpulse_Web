"use client"

import * as React from "react"
import {
  CpuIcon,
  RadioIcon,
  PlusIcon,
  SearchIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  CopyIcon,
  KeyRoundIcon,
  WebhookIcon,
  RefreshCwIcon,
  ActivityIcon,
  ServerIcon,
  CloudIcon,
  ShieldCheckIcon,
  CodeIcon,
  SendIcon,
  CheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

const services = [
  {
    id: "srv-1",
    name: "Telkom Core NMS (Network Management System)",
    category: "Backbone & Fiber Network",
    description: "Sinkronisasi real-time status OLT, deteksi otomatis alarm Fiber Cut, dan redaman optic kabel feeder.",
    status: "online",
    latency: "28 ms",
    uptime: "99.99%",
    icon: RadioIcon,
    iconColor: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
  {
    id: "srv-2",
    name: "Enterprise ERP & Document Gateway",
    category: "Workflow & Penugasan Kantor",
    description: "Sinkronisasi dokumen Nota Dinas, approval anggaran proyek internal, dan bridging data SAP/ERP Telkom Group.",
    status: "online",
    latency: "42 ms",
    uptime: "99.95%",
    icon: ServerIcon,
    iconColor: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    id: "srv-3",
    name: "GPS Geofence Engine (Google Maps API)",
    category: "Geotagging & Presensi",
    description: "Validasi titik koordinat presensi mobile karyawan dalam radius 50m batas STO & wilayah pengerjaan.",
    status: "online",
    latency: "19 ms",
    uptime: "99.98%",
    icon: ActivityIcon,
    iconColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    id: "srv-4",
    name: "iBantukan Mobile Sync (Aplikasi Teknisi)",
    category: "Mobile Client Gateway",
    description: "Sinkronisasi bukti foto ODP perbaikan lapangan, nota material teknisi, dan approval supervisor.",
    status: "online",
    latency: "52 ms",
    uptime: "99.91%",
    icon: CloudIcon,
    iconColor: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    id: "srv-5",
    name: "Telkom Enterprise SSO & IAM (LDAP)",
    category: "Authentication & Security",
    description: "Autentikasi terpusat akun staf, sinkronisasi kredensial SSO, dan verifikasi Multi-Factor Authentication.",
    status: "online",
    latency: "34 ms",
    uptime: "100%",
    icon: ShieldCheckIcon,
    iconColor: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  },
  {
    id: "srv-6",
    name: "Cloud Optical Storage (ODP Bucket)",
    category: "Storage & OCR Verification",
    description: "Penyimpanan terenkripsi berkas nota belanja material optik, foto ODP sebelum/sesudah, dan log audit.",
    status: "online",
    latency: "60 ms",
    uptime: "99.97%",
    icon: CpuIcon,
    iconColor: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  },
]

const apiKeys = [
  {
    id: "key-1",
    name: "NMS Backbone Stream Key",
    key: "ta_live_89a1f290d23f990184a...",
    scope: "Read/Write Tickets, Telemetry NMS",
    created: "01 Jul 2026",
    status: true,
  },
  {
    id: "key-2",
    name: "Mobile App iBantukan Gateway",
    key: "ta_live_44b881023d8fa09911e...",
    scope: "Attendance, Photo Upload, OCR Sync",
    created: "15 Jun 2026",
    status: true,
  },
  {
    id: "key-3",
    name: "HR Audit Analytics Client",
    key: "ta_read_77c199201a4e550183b...",
    scope: "Read Only (HR Report & Kinerja)",
    created: "20 Mei 2026",
    status: true,
  },
]

const webhookEvents = [
  {
    id: "wh-1",
    url: "https://api.telkomakses.co.id/v2/hooks/fiber-cut-alert",
    event: "incident.fiber_cut.detected",
    status: "Active (200 OK)",
    lastTrigger: "Hari Ini, 15:02 WIB",
  },
  {
    id: "wh-2",
    url: "https://audit.telkom.co.id/hooks/attendance-geofence",
    event: "attendance.clockin.verified",
    status: "Active (200 OK)",
    lastTrigger: "Hari Ini, 19:30 WIB",
  },
  {
    id: "wh-3",
    url: "https://finance.telkomakses.co.id/hooks/material-approved",
    event: "document.invoice.approved",
    status: "Active (200 OK)",
    lastTrigger: "Hari Ini, 17:15 WIB",
  },
]

const liveLogs = [
  { id: "log-1", timestamp: "20:15:10", service: "GPS Engine", method: "POST", endpoint: "/v1/geofence/verify", status: 200, latency: "18ms" },
  { id: "log-2", timestamp: "20:14:48", service: "Telkom NMS", method: "GET", endpoint: "/v2/telemetry/olt-backbone", status: 200, latency: "31ms" },
  { id: "log-3", timestamp: "20:14:12", service: "iBantukan Sync", method: "POST", endpoint: "/v1/tickets/status-update", status: 200, latency: "45ms" },
  { id: "log-4", timestamp: "20:13:55", service: "MyIndiHome Gateway", method: "POST", endpoint: "/v2/dispatch/assign-field", status: 201, latency: "58ms" },
  { id: "log-5", timestamp: "20:12:30", service: "Cloud Bucket", method: "PUT", endpoint: "/v1/odp-photos/upload-evidence", status: 200, latency: "62ms" },
]

export default function IntegrasiPage() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    toast.success("API Key berhasil disalin ke clipboard!")
    setTimeout(() => setCopiedKey(null), 2000)
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
      <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
          <SiteHeader />
          <div className="flex flex-1 min-h-0 h-full flex-row overflow-hidden">
            {/* Center Content Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-6 pb-12">
              
              {/* Page Title & Main Action */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
                    <CpuIcon className="size-7 text-red-600" />
                    Integrasi & API Sistem
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Koneksi real-time ke sistem Telkom NMS, API Dispatch MyIndiHome, GPS Geofence Engine, dan Webhooks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Memperbarui status seluruh gateway integrasi...")}
                    className="h-9 gap-1.5 text-xs font-semibold rounded-[8px]"
                  >
                    <RefreshCwIcon className="size-3.5" /> Refresh Status
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.info("Membuka form pembuatan API Key baru...")}
                    className="h-9 gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                  >
                    <PlusIcon className="size-3.5" /> Buat API Key
                  </Button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">Layanan Terkoneksi</span>
                    <RadioIcon className="size-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">6 / 6</span>
                    <span className="text-xs text-emerald-600 font-semibold">100% Online</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Semua pipeline stabil</p>
                </div>

                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">Request API (24 Jam)</span>
                    <ActivityIcon className="size-4 text-blue-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">142.8K</span>
                    <span className="text-xs text-blue-600 font-semibold">Avg 32ms</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Latency optimal</p>
                </div>

                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">Webhook Terverifikasi</span>
                    <WebhookIcon className="size-4 text-amber-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">3 Endpoint</span>
                    <span className="text-xs text-emerald-600 font-semibold">200 OK</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">HMAC SHA-256 Valid</p>
                </div>

                <div className="rounded-[8px] border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium">SLA Ketersediaan</span>
                    <ShieldCheckIcon className="size-4 text-red-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">99.98%</span>
                    <span className="text-xs text-emerald-600 font-semibold">Telkom Tier-1</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">High Availability Cluster</p>
                </div>
              </div>

              {/* Main Tabs */}
              <Tabs defaultValue="services" className="w-full space-y-4">
                <TabsList className="h-10 bg-muted/60 p-1 rounded-[8px]">
                  <TabsTrigger value="services" className="rounded-[8px] text-xs font-semibold px-4">
                    Status Layanan Terkoneksi ({services.length})
                  </TabsTrigger>
                  <TabsTrigger value="keys" className="rounded-[8px] text-xs font-semibold px-4">
                    API Keys & Kredensial ({apiKeys.length})
                  </TabsTrigger>
                  <TabsTrigger value="webhooks" className="rounded-[8px] text-xs font-semibold px-4">
                    Webhooks ({webhookEvents.length})
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="rounded-[8px] text-xs font-semibold px-4">
                    Real-time API Logs
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: Status Layanan */}
                <TabsContent value="services" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((srv) => {
                      const IconComponent = srv.icon
                      return (
                        <div key={srv.id} className="rounded-[8px] border bg-card p-5 shadow-2xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className={`flex size-10 items-center justify-center rounded-[8px] shrink-0 ${srv.iconColor}`}>
                                <IconComponent className="size-5" />
                              </div>
                              <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200">
                                ● Online
                              </Badge>
                            </div>

                            <div>
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                {srv.category}
                              </span>
                              <h3 className="text-sm font-bold text-foreground mt-0.5">
                                {srv.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {srv.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span>Latency:</span>
                              <span className="font-bold text-foreground">{srv.latency}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span>Uptime:</span>
                              <span className="font-bold text-emerald-600">{srv.uptime}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                {/* TAB 2: API Keys */}
                <TabsContent value="keys" className="space-y-4">
                  <div className="rounded-[8px] border bg-card p-4 shadow-2xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">API Keys Staf & Gateway</h3>
                        <p className="text-xs text-muted-foreground">Kredensial untuk akses data API dari luar aplikasi.</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => toast.info("Membuat token API Key baru...")}
                        className="h-8 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                      >
                        + Generate Key
                      </Button>
                    </div>

                    <div className="overflow-x-auto rounded-[8px] border">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                            <th className="p-3.5 pl-4">Nama Token / Layanan</th>
                            <th className="p-3.5">API Key Secret</th>
                            <th className="p-3.5">Scope Izin</th>
                            <th className="p-3.5">Dibuat Pada</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right pr-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {apiKeys.map((k) => (
                            <tr key={k.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-3.5 pl-4 font-bold text-foreground">
                                {k.name}
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <span>{k.key}</span>
                                  <button
                                    onClick={() => handleCopy(k.key, k.id)}
                                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    {copiedKey === k.id ? <CheckIcon className="size-3.5 text-emerald-600" /> : <CopyIcon className="size-3.5" />}
                                  </button>
                                </div>
                              </td>
                              <td className="p-3.5 text-muted-foreground">
                                {k.scope}
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                                {k.created}
                              </td>
                              <td className="p-3.5">
                                <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border-emerald-200">
                                  Aktif
                                </Badge>
                              </td>
                              <td className="p-3.5 text-right pr-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toast.info(`Revoking key ${k.name}...`)}
                                  className="h-7 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                >
                                  Revoke
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 3: Webhooks */}
                <TabsContent value="webhooks" className="space-y-4">
                  <div className="rounded-[8px] border bg-card p-4 shadow-2xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Webhook Event Subscriptions</h3>
                        <p className="text-xs text-muted-foreground">Pemberitahuan real-time otomatis ketika insiden atau verifikasi terjadi.</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => toast.info("Menambahkan webhook endpoint baru...")}
                        className="h-8 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[8px] shadow-xs"
                      >
                        + Tambah Webhook
                      </Button>
                    </div>

                    <div className="divide-y rounded-[8px] border">
                      {webhookEvents.map((wh) => (
                        <div key={wh.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/30 transition-colors">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-red-600 text-white font-mono text-[10px]">
                                {wh.event}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border-emerald-200">
                                {wh.status}
                              </Badge>
                            </div>
                            <span className="text-xs font-mono text-foreground block truncate">
                              {wh.url}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              Terakhir Terpanggil: {wh.lastTrigger}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.success(`Test ping webhook ${wh.event} berhasil (200 OK)!`)}
                              className="h-8 text-xs font-semibold rounded-[8px]"
                            >
                              <SendIcon className="size-3" /> Test Ping
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 4: Real-time API Logs */}
                <TabsContent value="logs" className="space-y-4">
                  <div className="rounded-[8px] border bg-card p-4 shadow-2xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Aktivitas API Gateway Real-time</h3>
                        <p className="text-xs text-muted-foreground">Log request inbound/outbound secara live.</p>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs text-emerald-600 bg-emerald-50 gap-1.5 py-1">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Live Streaming
                      </Badge>
                    </div>

                    <div className="overflow-x-auto rounded-[8px] border">
                      <table className="w-full text-left text-xs border-collapse font-mono">
                        <thead>
                          <tr className="border-b bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                            <th className="p-3 pl-4">Timestamp</th>
                            <th className="p-3">Gateway Service</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Endpoint Path</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 pr-4 text-right">Latency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {liveLogs.map((lg) => (
                            <tr key={lg.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-3 pl-4 text-muted-foreground">{lg.timestamp} WIB</td>
                              <td className="p-3 font-bold text-foreground">{lg.service}</td>
                              <td className="p-3">
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                  {lg.method}
                                </Badge>
                              </td>
                              <td className="p-3 text-muted-foreground">{lg.endpoint}</td>
                              <td className="p-3">
                                <span className="text-emerald-600 font-bold">
                                  {lg.status} OK
                                </span>
                              </td>
                              <td className="p-3 pr-4 text-right text-muted-foreground font-semibold">{lg.latency}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
    </SidebarProvider>
  )
}
