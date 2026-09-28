"use client"

import * as React from "react"
import { ShieldCheckIcon, SaveIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { getActiveUserFromStorage, updateUser } from "@/lib/api"
import { User, ROLE_HIERARCHY_LEVEL, ROLE_LABELS } from "@/types/database"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const [user, setUser] = React.useState<User | null>(null)
  const [formData, setFormData] = React.useState<Partial<User>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    const activeUser = getActiveUserFromStorage()
    if (activeUser) {
      setUser(activeUser)
      setFormData(activeUser)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-muted-foreground animate-pulse text-sm">Memuat profil...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-muted-foreground text-sm">Profil tidak ditemukan. Silakan login kembali.</p>
      </div>
    )
  }

  const isEditable = ROLE_HIERARCHY_LEVEL[user.role] === 6 || ROLE_HIERARCHY_LEVEL[user.role] === 99

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditable) return
    
    try {
      setSaving(true)
      const updatedUser = await updateUser(user.id, formData)
      if (updatedUser) {
        setUser(updatedUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('workpulse_active_user', JSON.stringify(updatedUser))
        }
        toast.success("Profil berhasil diperbarui!")
      }
    } catch (error) {
      toast.error("Gagal memperbarui profil.")
    } finally {
      setSaving(false)
    }
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
              Profil Akun
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Informasi data diri dan detail kontak karyawan
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-[8px] bg-white dark:bg-zinc-900 shadow-xs">
            <Avatar className="size-16 rounded-xl border border-border">
              <AvatarImage src={user.avatar_url || undefined} alt={user.nama} className="object-cover" />
              <AvatarFallback className="rounded-xl font-bold text-lg bg-red-50 text-red-700">
                {user.nama.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-foreground">{user.nama}</h2>
              <p className="text-xs text-muted-foreground">NIK: {user.nik}</p>
              {user.role && ROLE_LABELS[user.role] && (
                <span className="text-[11px] font-semibold text-primary mt-1">
                  {ROLE_LABELS[user.role].label}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserIcon className="size-4 text-primary" />
                  Detail Informasi
                </CardTitle>
                <CardDescription>
                  {isEditable
                    ? "Anda memiliki akses untuk memperbarui data ini."
                    : "Data ini dikelola oleh administrator dan bersifat read-only."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nama" className="font-semibold">Nama Lengkap</Label>
                    <Input
                      id="nama"
                      value={formData.nama || ""}
                      onChange={handleInputChange}
                      readOnly={!isEditable}
                      className={`h-9 ${!isEditable ? "bg-muted/50 cursor-not-allowed text-muted-foreground" : ""}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="font-semibold">Email Karyawan</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      readOnly={!isEditable}
                      className={`h-9 ${!isEditable ? "bg-muted/50 cursor-not-allowed text-muted-foreground" : ""}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone" className="font-semibold">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      readOnly={!isEditable}
                      className={`h-9 ${!isEditable ? "bg-muted/50 cursor-not-allowed text-muted-foreground" : ""}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="position_title" className="font-semibold">Posisi / Jabatan</Label>
                    <Input
                      id="position_title"
                      value={formData.position_title || ""}
                      onChange={handleInputChange}
                      readOnly={!isEditable}
                      className={`h-9 ${!isEditable ? "bg-muted/50 cursor-not-allowed text-muted-foreground" : ""}`}
                    />
                  </div>
                </div>
              </CardContent>
              {isEditable && (
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="h-9 text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <SaveIcon className="size-4" /> 
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
