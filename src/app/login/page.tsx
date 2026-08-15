"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ActivityIcon,
  ShieldCheckIcon,
  KeyRoundIcon,
  UserIcon,
  RefreshCwIcon,
  ArrowRightIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [nik, setNik] = React.useState("10293841")
  const [password, setPassword] = React.useState("••••••••")
  const [captchaInput, setCaptchaInput] = React.useState("")
  const [captchaCode, setCaptchaCode] = React.useState("7K9A2")

  const handleRefreshCaptcha = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    let newCode = ""
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(newCode)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (captchaInput.toUpperCase() !== captchaCode) {
      toast.error("Kode Captcha salah! Silakan coba lagi.")
      handleRefreshCaptcha()
      return
    }

    toast.success("Login berhasil! Selamat datang di WorkPulse Telkom Akses.")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -right-40 size-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md shadow-xl border relative z-10 rounded-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto size-12 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mb-2">
            <ActivityIcon className="size-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">WorkPulse Telkom Akses</CardTitle>
          <CardDescription className="text-xs mt-1">
            Portal Presensi & Monitoring Kinerja Karyawan (Telkom & Mitra)
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="flex flex-col gap-4 text-xs pt-2">
            {/* NIK Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nik" className="font-semibold">NIK (Nomor Induk Karyawan)</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="nik"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Masukkan NIK"
                  required
                  className="pl-9 h-9 font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="font-semibold">Password</Label>
              <div className="relative">
                <KeyRoundIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  required
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Captcha Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="captcha" className="font-semibold">Kode Keamanan (Captcha)</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 select-none tracking-widest font-mono font-bold text-base text-red-600 bg-red-50 dark:bg-red-950/60 p-2 rounded-xl text-center border border-red-200">
                  {captchaCode}
                </div>
                <Button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                >
                  <RefreshCwIcon className="size-4" />
                </Button>
              </div>
              <Input
                id="captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Masukkan 5 digit captcha di atas"
                required
                className="h-9 font-mono uppercase mt-1"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl">
              Masuk ke Dashboard <ArrowRightIcon className="size-4" />
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              Lupa password NIK? Hubungi Administrator HR Telkom Akses.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
