"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function KaryawanKinerjaRedirectPage() {
  const router = useRouter()

  React.useEffect(() => {
    router.replace("/admin/laporan/kinerja")
  }, [router])

  return null
}
