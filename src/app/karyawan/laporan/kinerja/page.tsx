"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LockIcon } from "lucide-react"
import { getActiveUserFromStorage } from "@/lib/api"
import { LaporanKinerjaView } from "@/components/dashboard/reports/laporan-kinerja-view"

export default function KaryawanLaporanKinerjaPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    const user = getActiveUserFromStorage()
    if (!user) {
      router.replace("/login")
      return
    }

    // Hanya Manager, SGM, dan Admin yang memiliki hak akses laporan kinerja & SLA
    if (user.role === "manager" || user.role === "sgm" || user.role === "admin") {
      setIsAuthorized(true)
      setIsChecking(false)
    } else {
      router.replace("/karyawan/dashboard")
    }
  }, [router])

  if (isChecking) {
    return (
      <div className="flex h-96 w-full items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-2xs">
          <div className="size-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center animate-pulse">
            <LockIcon className="size-5" />
          </div>
          <div className="text-center">
            <h4 className="text-xs font-bold text-foreground">Memverifikasi Hak Akses Manajerial...</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Memuat Laporan Kinerja & SLA Tim</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="p-4 lg:p-6 pb-16">
      <LaporanKinerjaView />
    </div>
  )
}
