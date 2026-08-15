"use client"

import * as React from "react"
import {
  CheckCircle2,
  Clock,
  MapPin,
  Wrench,
  AlertCircle
} from "lucide-react"

import { AppSidebarStaff } from "@/components/dashboard/app-sidebar-staff"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AiPanelProvider } from "@/components/dashboard/ai-panel-context"
import { AiIntegratedPanel } from "@/components/dashboard/ai-integrated-panel"

export default function StaffDashboard() {
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
        <AppSidebarStaff variant="inset" />
        <SidebarInset className="h-screen md:h-[calc(100vh-1rem)] overflow-hidden flex flex-col">
          <SiteHeader />
          <div className="flex flex-1 min-h-0 h-full flex-row overflow-hidden">
            {/* Main Center Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
                  
                  {/* Dashboard Content inside SidebarInset */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-zinc-900">Halo, Budi Santoso! 👋</h1>
                      <p className="text-zinc-500 mt-1">Berikut adalah ringkasan pekerjaan lapangan Anda hari ini.</p>
                    </div>
                    
                    {/* Presensi Quick Action */}
                    <div className="bg-white border border-zinc-200 p-1.5 rounded-xl flex items-center shadow-sm w-full md:w-auto shrink-0">
                      <button className="flex-1 md:flex-none px-6 py-2.5 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-lg transition-colors">
                        Check In
                      </button>
                      <button className="flex-1 md:flex-none px-6 py-2.5 text-zinc-500 hover:text-zinc-900 text-sm font-bold rounded-lg hover:bg-zinc-50 transition-colors">
                        Check Out
                      </button>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col hover:border-red-200 hover:shadow-md transition-all cursor-default">
                      <div className="flex items-center gap-2 text-zinc-600 mb-2">
                        <Clock className="size-4" />
                        <h3 className="text-sm font-semibold">Status Presensi</h3>
                      </div>
                      <p className="text-2xl font-bold text-zinc-900 mt-1">Belum Check-In</p>
                      <p className="text-xs text-zinc-500 mt-2">Shift: Pagi (08:00 - 17:00)</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col hover:border-red-200 hover:shadow-md transition-all cursor-default">
                      <div className="flex items-center gap-2 text-zinc-600 mb-2">
                        <Wrench className="size-4" />
                        <h3 className="text-sm font-semibold">Tugas Selesai Hari Ini</h3>
                      </div>
                      <p className="text-2xl font-bold text-zinc-900 mt-1">1 <span className="text-lg text-zinc-400 font-medium">/ 4 Tiket</span></p>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-red-600 h-full w-1/4 rounded-full"></div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col hover:border-red-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-2 text-zinc-600 mb-2">
                        <AlertCircle className="size-4" />
                        <h3 className="text-sm font-semibold">Pesan Admin Terbaru</h3>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 mt-1 line-clamp-2">"Pastikan peralatan K3 (Helm, Sepatu) selalu digunakan saat memanjat tiang..."</p>
                      <p className="text-xs text-red-600 font-semibold mt-auto pt-3">Buka pesan &rarr;</p>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-zinc-900">Daftar Tiket Pekerjaan (WO)</h2>
                      <button className="text-sm font-semibold text-red-600 hover:text-red-700">Lihat Semua</button>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      
                      {/* Task Item 1: Sedang Berjalan */}
                      <div className="bg-white border-2 border-zinc-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex gap-4 items-start">
                            <div className="p-2.5 bg-zinc-900 text-white rounded-xl shrink-0">
                              <Wrench className="size-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">Sedang Berjalan</span>
                                <span className="text-xs font-mono text-zinc-500 font-medium">#WO-8825</span>
                              </div>
                              <h4 className="font-bold text-zinc-900 mt-1.5 text-lg">Perbaikan Koneksi Terputus (LOS)</h4>
                              <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1 font-medium">
                                <MapPin className="size-4" />
                                <span>Perumahan Indah Blok C2, Bandung</span>
                              </div>
                            </div>
                          </div>
                          <button className="w-full md:w-auto px-6 py-2.5 text-sm font-bold text-white bg-black hover:bg-zinc-800 rounded-xl transition-colors">
                            Update Status
                          </button>
                        </div>
                      </div>
                      
                      {/* Task Item 2: Menunggu */}
                      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-red-300 transition-all cursor-pointer group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex gap-4 items-start">
                            <div className="p-2.5 bg-zinc-100 text-zinc-400 rounded-xl shrink-0 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                              <Wrench className="size-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md">Menunggu</span>
                                <span className="text-xs font-mono text-zinc-500 font-medium">#WO-8830</span>
                              </div>
                              <h4 className="font-bold text-zinc-900 mt-1.5 text-lg">Migrasi Perangkat ONT</h4>
                              <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1 font-medium">
                                <MapPin className="size-4" />
                                <span>Apartemen Sukajadi Lt. 4, Bandung</span>
                              </div>
                            </div>
                          </div>
                          <button className="hidden md:flex px-6 py-2.5 text-sm font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">
                            Mulai Pekerjaan
                          </button>
                        </div>
                      </div>

                      {/* Task Item 3: Selesai */}
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 shadow-sm cursor-pointer opacity-75">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex gap-4 items-start">
                            <div className="p-2.5 bg-green-100 text-green-600 rounded-xl shrink-0">
                              <CheckCircle2 className="size-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">Selesai</span>
                                <span className="text-xs font-mono text-zinc-500 font-medium">#WO-8821</span>
                              </div>
                              <h4 className="font-bold text-zinc-900 mt-1.5 text-lg line-through decoration-zinc-300">Pemasangan IndiHome Baru</h4>
                              <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1 font-medium">
                                <MapPin className="size-4" />
                                <span>Jl. Merdeka No. 45, Bandung</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg self-start md:self-center border border-green-100">
                            Selesai pada 09:30
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Integrated Right AI Column Panel - Full Height */}
            <AiIntegratedPanel />
          </div>
        </SidebarInset>
      </AiPanelProvider>
    </SidebarProvider>
  )
}
