"use client"

import * as React from "react"
import {
  UsersIcon,
  SearchIcon,
  PlusIcon,
  MailIcon,
  PhoneIcon,
  Building2Icon,
  ShieldCheckIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  ListIcon,
  GitForkIcon,
  RefreshCwIcon,
  SparklesIcon,
  Edit2Icon,
  Trash2Icon,
  CopyIcon,
  CheckIcon,
  LockIcon,
  DicesIcon,
  UserCheckIcon,
  MoreVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldAlertIcon,
  ImageIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getAllUsers,
  getDepartments,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  generateAutoNik,
  getActiveUserFromStorage,
} from "@/lib/api"
import { User, Department, UserRole, ROLE_LABELS, ROLE_HIERARCHY_LEVEL } from "@/types/database"

export default function AdminKaryawanPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list" | "organogram">("grid")

  // Active logged-in user (for access control)
  const activeUser = React.useMemo(() => getActiveUserFromStorage(), [])

  // Create Modal State
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [newNik, setNewNik] = React.useState("")
  const [newNama, setNewNama] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [newPhone, setNewPhone] = React.useState("0812-3456-7890")
  const [newRole, setNewRole] = React.useState<UserRole>("staff")
  const [newDeptId, setNewDeptId] = React.useState("")
  const [newSupervisorId, setNewSupervisorId] = React.useState("")
  const [newPositionTitle, setNewPositionTitle] = React.useState("")
  const [copiedPassword, setCopiedPassword] = React.useState(false)

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [editNama, setEditNama] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")
  const [editRole, setEditRole] = React.useState<UserRole>("staff")
  const [editDeptId, setEditDeptId] = React.useState("")
  const [editSupervisorId, setEditSupervisorId] = React.useState("")
  const [editPositionTitle, setEditPositionTitle] = React.useState("")
  const [editAvatarUrl, setEditAvatarUrl] = React.useState("")
  const [editIsActive, setEditIsActive] = React.useState(true)
  const [editPassword, setEditPassword] = React.useState("")
  const [showEditPassword, setShowEditPassword] = React.useState(true)

  const avatarFileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Harap pilih file gambar (JPG, PNG, WebP).")
      return
    }

    if (file.size > 2.5 * 1024 * 1024) {
      toast.error("Ukuran file foto maksimal 2.5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setEditAvatarUrl(base64)
      toast.success("Foto profil berhasil dipilih!")
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setEditAvatarUrl("")
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = ""
    }
    toast.info("Foto profil dikosongkan.")
  }

  // Delete Confirm Modal State
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null)

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  /**
   * Access control: can the active user edit the target user?
   * Rules:
   * - Cannot edit yourself.
   * - Admin can edit everyone except themselves.
   * - Others can only edit users whose role level is strictly lower than theirs.
   */
  const canEditUser = React.useCallback((target: User): boolean => {
    if (!activeUser) return false
    if (activeUser.id === target.id) return false // cannot edit self
    if (activeUser.role === "admin") return true   // admin can edit all (except self)
    const myLevel = ROLE_HIERARCHY_LEVEL[activeUser.role] || 0
    const targetLevel = ROLE_HIERARCHY_LEVEL[target.role] || 0
    return myLevel > targetLevel
  }, [activeUser])

  /**
   * Returns a human-readable reason why the active user cannot edit the target.
   * Returns null if they CAN edit.
   */
  const getEditBlockReason = React.useCallback((target: User): string | null => {
    if (!activeUser) return "Sesi tidak terdeteksi. Silakan login ulang."
    if (activeUser.id === target.id) return "Anda tidak dapat mengedit akun milik sendiri."
    if (activeUser.role === "admin") return null // admin can edit all except self (handled above)
    const myLevel = ROLE_HIERARCHY_LEVEL[activeUser.role] || 0
    const targetLevel = ROLE_HIERARCHY_LEVEL[target.role] || 0
    if (myLevel <= targetLevel) {
      return `Jabatan Anda (${ROLE_LABELS[activeUser.role]?.badge}) tidak memiliki wewenang untuk mengedit akun dengan jabatan ${ROLE_LABELS[target.role]?.badge} atau setara.`
    }
    return null
  }, [activeUser])

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [uList, dList] = await Promise.all([getAllUsers(), getDepartments()])
      const normalizedUsers = uList.map((u) => {
        if (u.role === "admin") {
          return {
            ...u,
            position_title: "Superadmin",
          }
        }
        return u
      })
      setUsers(normalizedUsers)
      setDepartments(dList)
      if (dList.length > 0) setNewDeptId(dList[0].id)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-fill when opening Create Modal
  const handleOpenAddModal = () => {
    const autoNik = generateAutoNik(users)
    setNewNik(autoNik)
    setNewPassword("karyawan123")
    setNewNama("")
    setNewEmail("")
    setNewRole("staff")
    setNewPositionTitle(ROLE_LABELS["staff"].label)
    setNewSupervisorId("")
    setIsAddOpen(true)
  }

  const handleNamaChange = (val: string) => {
    setNewNama(val)
  }



  // Copy Generated Password
  const handleCopyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass)
    setCopiedPassword(true)
    toast.success("Password disalin ke clipboard!")
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNik.trim() || !newNama.trim() || !newEmail.trim()) {
      toast.error("Semua kolom data wajib diisi.")
      return
    }

    setIsSubmitting(true)
    try {
      const created = await createUser({
        nik: newNik.trim(),
        nama: newNama.trim(),
        email: newEmail.trim(),
        password: newPassword || "karyawan123",
        role: newRole,
        department_id: newDeptId || null,
        supervisor_id: newSupervisorId || null,
        position_title: ROLE_LABELS[newRole]?.label || newPositionTitle,
        phone: newPhone,
      })

      if (created) {
        toast.success(`Akun karyawan ${created.nama} berhasil dibuat!`, {
          description: `NIK ${created.nik} â€¢ Password: ${newPassword}`,
        })
        setIsAddOpen(false)
        loadData()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mendaftarkan karyawan. Pastikan NIK/Email belum terdaftar.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    if (!canEditUser(user)) {
      toast.error("Akses ditolak.", {
        description: activeUser?.id === user.id
          ? "Anda tidak dapat mengedit akun milik sendiri."
          : "Anda tidak memiliki wewenang untuk mengedit akun ini.",
      })
      return
    }
    setEditingUser(user)
    setEditNama(user.nama)
    setEditEmail(user.email)
    setEditPhone(user.phone || "")
    setEditRole(user.role)
    setEditDeptId(user.department_id || (departments[0]?.id || ""))
    setEditSupervisorId(user.supervisor_id || "")
    setEditPositionTitle(user.position_title || "")
    setEditAvatarUrl(user.avatar_url || "")
    setEditIsActive(user.is_active ?? true)
    setEditPassword(user.password || "karyawan123")
    setShowEditPassword(true)
    setIsEditOpen(true)
  }

  // Submit Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    if (!canEditUser(editingUser)) {
      toast.error("Akses ditolak. Anda tidak berwenang mengedit akun ini.")
      return
    }
    if (editPassword && editPassword.length < 6) {
      toast.error("Password minimal 6 karakter.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: Partial<User> = {
        nama: editNama.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || null,
        role: editRole,
        department_id: editDeptId || null,
        supervisor_id: editingUser.supervisor_id || null,
        position_title: ROLE_LABELS[editRole]?.label,
        avatar_url: editAvatarUrl.trim() || null,
        is_active: editIsActive,
        password: editPassword.trim() || editingUser.password || "karyawan123",
      }

      const updated = await updateUser(editingUser.id, payload)

      if (updated) {
        toast.success(`Data karyawan ${updated.nama} berhasil diperbarui!`)
        setIsEditOpen(false)
        loadData()
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal memperbarui data karyawan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Delete Modal
  const handleOpenDelete = (user: User) => {
    setUserToDelete(user)
    setIsDeleteOpen(true)
  }

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    setIsSubmitting(true)
    try {
      const ok = await deleteUser(userToDelete.id)
      if (ok) {
        toast.success(`Akun karyawan ${userToDelete.nama} berhasil dihapus dari sistem.`)
        setIsDeleteOpen(false)
        loadData()
      } else {
        toast.error("Gagal menghapus akun karyawan.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kendala saat menghapus akun.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset Password Handler
  const handleResetPassword = async (user: User) => {
    try {
      const newPass = await resetUserPassword(user.id)
      navigator.clipboard.writeText(newPass)
      toast.success(`Password baru ${user.nama} di-reset!`, {
        description: `Password: ${newPass} (Telah disalin ke clipboard)`,
      })
    } catch (err) {
      console.error(err)
      toast.error("Gagal mereset password.")
    }
  }

  // Filtered Users
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchRole = selectedRole === "all" || u.role === selectedRole
      const matchSearch =
        !searchQuery ||
        u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.nik.includes(searchQuery) ||
        (u.position_title && u.position_title.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchRole && matchSearch
    })
  }, [users, selectedRole, searchQuery])

  // Potential supervisors dropdown for Create
  const potentialSupervisorsForNew = users.filter((u) => {
    const level = ROLE_HIERARCHY_LEVEL[u.role] || 1
    const newLevel = ROLE_HIERARCHY_LEVEL[newRole] || 1
    return level > newLevel
  })

  // Potential supervisors dropdown for Edit
  const potentialSupervisorsForEdit = users.filter((u) => {
    if (!editingUser || u.id === editingUser.id) return false
    const level = ROLE_HIERARCHY_LEVEL[u.role] || 1
    const editLevel = ROLE_HIERARCHY_LEVEL[editRole] || 1
    return level > editLevel
  })

  // All role definitions ordered by hierarchy for display
  const ALL_ROLES: { key: UserRole; level: number; label: string }[] = [
    { key: 'staff',     level: 1, label: 'Level 1' },
    { key: 'officer_1', level: 2, label: 'Level 2' },
    { key: 'officer_2', level: 3, label: 'Level 3' },
    { key: 'officer_3', level: 4, label: 'Level 4' },
    { key: 'manager',   level: 5, label: 'Level 5' },
    { key: 'sgm',       level: 6, label: 'Level 6' },
    { key: 'admin',     level: 99, label: 'Admin'  },
  ]

  // Roles that the current active user is allowed to assign
  const assignableRoles = React.useMemo(() => {
    if (!activeUser) return []
    if (activeUser.role === 'admin') return ALL_ROLES // admin can assign any
    const myLevel = ROLE_HIERARCHY_LEVEL[activeUser.role] || 0
    return ALL_ROLES.filter((r) => r.level < myLevel) // only strictly below own level
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUser])

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
        <div className="flex flex-1 flex-col font-sans">
          <div className="flex flex-1 flex-col gap-5 py-4 lg:py-6">
            {/* Header Title & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Direktori Karyawan & Organogram
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900">
                    {users.length} Akun Terdaftar
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Admin Provisioning: Auto-generator NIK, Email, Password, CRUD Karyawan, dan Pemetaan Rantai Komando.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="h-9 px-3 rounded-[8px] text-xs font-semibold gap-1.5"
                >
                  <RefreshCwIcon className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Button
                  size="sm"
                  onClick={handleOpenAddModal}
                  className="h-9 px-4 rounded-[6px] text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs gap-1.5"
                >
                  <PlusIcon className="size-4" />
                  Tambah Karyawan Baru
                </Button>
              </div>
            </div>

            {/* View Switcher & Filters */}
            <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex p-1 bg-muted/60 rounded-[6px] border border-border">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-[3px] transition-all ${
                      viewMode === "grid" ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    <LayoutGridIcon className="size-3.5" />
                    <span>Grid View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      viewMode === "list" ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    <ListIcon className="size-3.5" />
                    <span>Tabel List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("organogram")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      viewMode === "organogram" ? "bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    <GitForkIcon className="size-3.5" />
                    <span>Pohon Organogram</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari NIK atau Nama Karyawan..."
                    className="h-8.5 w-48 lg:w-64 pl-8 rounded-[6px] text-xs bg-muted/30"
                  />
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-8.5 px-3 rounded-[5px] text-xs font-semibold bg-card border border-border text-foreground"
                >
                  <option value="all">Semua Jabatan</option>
                  <option value="sgm">Senior General Manager (SGM)</option>
                  <option value="manager">Manager Divisi</option>
                  <option value="officer_3">Officer 3 (Project Lead)</option>
                  <option value="officer_2">Officer 2 (Specialist)</option>
                  <option value="officer_1">Officer 1 (Shift Lead)</option>
                  <option value="staff">Staff Lapangan / Teknisi</option>
                  <option value="admin">Superadmin</option>
                </select>
              </div>
            </div>

            {/* Content Area */}
            <div className="px-4 lg:px-6">
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUsers.map((u) => {
                    const roleMeta = ROLE_LABELS[u.role] || { label: "User", badge: "User", color: "bg-zinc-100" }
                    return (
                      <div
                        key={u.id}
                        className="p-4 rounded-xl border border-border bg-card shadow-xs hover:shadow-md hover:border-border/80 transition-all flex flex-col justify-between gap-3 relative group"
                      >
                        {/* Top Profile */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                                alt={u.nama}
                                className="size-12 rounded-xl object-cover border border-border"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${
                                  u.is_active ? "bg-emerald-500" : "bg-zinc-400"
                                }`}
                                title={u.is_active ? "Akun Aktif" : "Akun Nonaktif"}
                              />
                            </div>
                            <div className="overflow-hidden space-y-1">
                              <h3 className="text-sm font-bold text-foreground truncate" title={u.nama}>
                                {u.nama}
                              </h3>
                              <div>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    u.role === "admin"
                                      ? "bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                                      : roleMeta.color
                                  }`}
                                >
                                  {u.role === "admin" ? "Superadmin" : roleMeta.badge}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
                                />
                              }
                            >
                              <MoreVerticalIcon className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 shadow-lg">
                              {(() => {
                                const blockReason = getEditBlockReason(u)
                                const blocked = blockReason !== null
                                return (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => !blocked && handleOpenEdit(u)}
                                      disabled={blocked}
                                      title={blockReason ?? undefined}
                                      className={`text-xs gap-2 py-1.5 rounded-lg ${
                                        blocked
                                          ? "opacity-50 cursor-not-allowed"
                                          : "cursor-pointer"
                                      }`}
                                    >
                                      <Edit2Icon className="size-3.5 text-blue-500 shrink-0" />
                                      <div className="flex flex-col flex-1 min-w-0">
                                        <span>Edit Karyawan</span>
                                        {blocked && (
                                          <span className="text-[9px] text-muted-foreground leading-tight truncate">
                                            {blockReason}
                                          </span>
                                        )}
                                      </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem
                                      onClick={() => !blocked && handleOpenDelete(u)}
                                      disabled={blocked}
                                      title={blocked ? blockReason ?? undefined : undefined}
                                      className={`text-xs gap-2 py-1.5 rounded-lg font-semibold ${
                                        blocked
                                          ? "opacity-50 cursor-not-allowed"
                                          : "text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer"
                                      }`}
                                    >
                                      <Trash2Icon className="size-3.5" />
                                      <span>Hapus Akun</span>
                                    </DropdownMenuItem>
                                  </>
                                )
                              })()}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Details */}
                        <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">NIK</span>
                            <span className="text-foreground font-mono font-bold text-[11px] bg-muted/60 px-1.5 py-0.5 rounded">
                              {u.nik}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">Email</span>
                            <span className="text-foreground/80 text-[11px] truncate max-w-[170px]" title={u.email}>
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {viewMode === "list" && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Karyawan</th>
                        <th className="py-3 px-4">NIK</th>
                        <th className="py-3 px-4">Jabatan</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                                alt={u.nama}
                                className="size-8 rounded-full object-cover border"
                              />
                              <span className="font-bold text-foreground">{u.nama}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-red-600">{u.nik}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === "admin"
                                  ? "bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                                  : ROLE_LABELS[u.role]?.color
                              }`}
                            >
                              {u.role === "admin" ? "Superadmin" : ROLE_LABELS[u.role]?.badge}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.is_active
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800"
                              }`}
                            >
                              <span className={`size-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                              <span>{u.is_active ? "Aktif" : "Nonaktif"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(() => {
                                const blockReason = getEditBlockReason(u)
                                const blocked = blockReason !== null
                                return (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => !blocked && handleOpenEdit(u)}
                                      disabled={blocked}
                                      title={blockReason ?? "Edit data karyawan ini"}
                                      className={`h-7 px-2 text-[11px] font-bold rounded-lg gap-1 ${
                                        blocked
                                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                                          : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                      }`}
                                    >
                                      <Edit2Icon className="size-3" /> Edit
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => !blocked && handleOpenDelete(u)}
                                      disabled={blocked}
                                      title={blockReason ?? "Hapus akun karyawan ini"}
                                      className={`h-7 px-2 text-[11px] font-bold rounded-lg ${
                                        blocked
                                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                                          : "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                      }`}
                                    >
                                      <Trash2Icon className="size-3" />
                                    </Button>
                                  </>
                                )
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {viewMode === "organogram" && (
                <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <GitForkIcon className="size-5 text-red-600" />
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Struktur Rantai Komando Organisasi</h3>
                      <p className="text-[11px] text-muted-foreground">Pohon hierarki pelimpahan dan delegasi wewenang operasional.</p>
                    </div>
                  </div>

                  {/* SGM Level */}
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                      <span>ðŸ‘‘ Level 6: Senior General Manager (SGM)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-red-500">
                      {users.filter((u) => u.role === "sgm").map((u) => (
                        <div key={u.id} className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 flex items-center gap-3">
                          <img
                            src={u.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"}
                            alt={u.nama}
                            className="size-10 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{u.nama}</h4>
                            <p className="text-[10px] text-muted-foreground">{u.position_title}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Manager Level */}
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 mt-4">
                      <span>ðŸ‘” Level 5: Manager Divisi</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-amber-500">
                      {users.filter((u) => u.role === "manager").map((u) => (
                        <div key={u.id} className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 flex items-center gap-3">
                          <img
                            src={u.avatar_url || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"}
                            alt={u.nama}
                            className="size-9 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{u.nama}</h4>
                            <p className="text-[10px] text-muted-foreground">{u.position_title}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Officer Level */}
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 mt-4">
                      <span>Level 2-4: Officer 1 / 2 / 3 (Project & Coordination Leads)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pl-4 border-l-2 border-blue-500">
                      {users.filter((u) => u.role.startsWith("officer")).map((u) => (
                        <div key={u.id} className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 flex items-center gap-2.5">
                          <img
                            src={u.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                            alt={u.nama}
                            className="size-8 rounded-lg object-cover"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-foreground truncate">{u.nama}</h4>
                            <span className="text-[10px] text-muted-foreground truncate block">{ROLE_LABELS[u.role]?.badge}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Staff Level */}
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5 mt-4">
                      <span>Level 1: Staff Administrasi & Operasional Kantor</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pl-4 border-l-2 border-zinc-400">
                      {users.filter((u) => u.role === "staff").map((u) => (
                        <div key={u.id} className="p-2.5 rounded-xl border border-border bg-card flex items-center gap-2">
                          <img
                            src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                            alt={u.nama}
                            className="size-7 rounded-full object-cover"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-[11px] font-bold text-foreground truncate">{u.nama}</h4>
                            <span className="text-[9px] text-muted-foreground truncate block">{u.position_title || "Staff Kantor"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: TAMBAH KARYAWAN BARU (WITH AUTO-GENERATOR)       */}
        {/* ======================================================== */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[88vh] flex flex-col rounded-2xl p-0 font-sans overflow-hidden shadow-2xl">
            {/* Modal Header (Sticky Top) */}
            <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/40 shrink-0 pr-14">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <UserCheckIcon className="size-5 text-red-600" />
                  Daftarkan Akun Karyawan Baru
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  NIK, Email resmi, dan Password di-generate secara otomatis dan dapat disesuaikan.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Nama Lengkap & NIK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nama Lengkap *
                  </label>
                  <Input
                    value={newNama}
                    onChange={(e) => handleNamaChange(e.target.value)}
                    placeholder="Contoh: Rian Hidayat, S.T."
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      NIK Otomatis *
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewNik(generateAutoNik(users))}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <DicesIcon className="size-3" /> Re-roll
                    </button>
                  </div>
                  <Input
                    value={newNik}
                    onChange={(e) => setNewNik(e.target.value)}
                    placeholder="Contoh: 10293880"
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-mono font-bold tracking-wider text-red-600"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MailIcon className="size-3.5" />
                    Email Login *
                  </label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Password Akun *
                    </label>
                    <span className="text-[10px] text-muted-foreground">Default: <strong className="font-mono text-foreground">karyawan123</strong></span>
                  </div>
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="karyawan123"
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-mono font-bold text-foreground"
                  />
                </div>
              </div>

              {/* Tingkat Jabatan & Atasan Langsung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tingkat Jabatan (Role) *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole
                      setNewRole(r)
                      setNewPositionTitle(ROLE_LABELS[r]?.label)
                    }}
                    className="w-full mt-1 h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
                  >
                    <option value="staff">Level 1: Staff Lapangan / Teknisi</option>
                    <option value="officer_1">Level 2: Officer 1 (Shift Lead)</option>
                    <option value="officer_2">Level 3: Officer 2 (Specialist)</option>
                    <option value="officer_3">Level 4: Officer 3 (Project Lead)</option>
                    <option value="manager">Level 5: Manager Divisi</option>
                    <option value="sgm">Level 6: Senior General Manager (SGM)</option>
                    <option value="admin">Superadmin</option>
                  </select>
                </div>
              </div>

              </div>

              {/* Sticky Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-border bg-background/95 backdrop-blur-xs shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="h-9 px-4 text-xs font-semibold rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs"
                >
                  {isSubmitting ? "Mendaftarkan..." : "Daftarkan Akun Karyawan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* MODAL 2: EDIT DATA KARYAWAN (UPDATE CRUD)                */}
        {/* ======================================================== */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[88vh] flex flex-col rounded-2xl p-0 font-sans overflow-hidden shadow-2xl">
            {/* Modal Header (Sticky Top) */}
            <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/40 shrink-0 pr-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center shrink-0">
                  <Edit2Icon className="size-5 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold tracking-tight text-foreground">
                    Edit Data Karyawan
                  </DialogTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    NIK <span className="font-mono font-bold text-foreground">{editingUser?.nik}</span>
                    {" • "}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ROLE_LABELS[editingUser?.role ?? "staff"]?.color}`}>
                      {ROLE_LABELS[editingUser?.role ?? "staff"]?.badge}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateUser} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Section: Identitas */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <ShieldCheckIcon className="size-3" /> Identitas Akun
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap *</label>
                    <Input
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      required
                      placeholder="Nama lengkap karyawan"
                      className="mt-1 h-9 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Login *</label>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      className="mt-1 h-9 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nomor Telepon</label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="mt-1 h-9 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  {/* Upload Foto Profil Langsung */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Foto Profil Karyawan
                    </label>
                    <div className="flex items-center gap-3.5 p-3 rounded-xl border border-border bg-muted/20">
                      <div className="relative size-14 rounded-xl overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center shadow-xs">
                        {editAvatarUrl ? (
                          <img
                            src={editAvatarUrl}
                            alt="preview"
                            className="size-full object-cover"
                          />
                        ) : (
                          <UserIcon className="size-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            ref={avatarFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => avatarFileInputRef.current?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer bg-background hover:bg-muted"
                          >
                            <UploadIcon className="size-3.5 text-primary" />
                            <span>{editAvatarUrl ? "Ganti Foto" : "Pilih Foto dari Komputer"}</span>
                          </Button>

                          {editAvatarUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveAvatar}
                              className="h-8 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer"
                            >
                              <Trash2Icon className="size-3.5" />
                              <span>Hapus Foto</span>
                            </Button>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Upload file foto langsung dari laptop / komputer (JPG, PNG, WebP maks. 2.5MB).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Jabatan & Struktur */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <UsersIcon className="size-3" /> Jabatan & Status Akun
                </p>
                <div className="space-y-3">
                  {/* Custom Role Picker */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tingkat Jabatan (Role) *</label>
                    {assignableRoles.length === 0 ? (
                      <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-400">
                        <ShieldAlertIcon className="size-3.5 shrink-0" />
                        <span>Anda tidak memiliki wewenang untuk mengubah jabatan akun ini.</span>
                      </div>
                    ) : (
                      <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                        {assignableRoles.map((r) => {
                          const meta = ROLE_LABELS[r.key]
                          const isSelected = editRole === r.key
                          return (
                            <button
                              key={r.key}
                              type="button"
                              onClick={() => {
                                setEditRole(r.key)
                                setEditPositionTitle(meta.label)
                              }}
                              className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-red-400 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-400"
                                  : "border-border bg-background hover:bg-muted/60"
                              }`}
                            >
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${meta.color}`}>
                                {r.level === 99 ? "Superadmin" : `Lv.${r.level}`}
                              </span>
                              <span className={`text-[10px] font-bold leading-tight ${
                                isSelected ? "text-red-700 dark:text-red-400" : "text-foreground"
                              }`}>
                                {meta.badge}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Jabatan: <span className="font-semibold text-foreground">{ROLE_LABELS[editRole]?.label}</span>
                    </p>
                  </div>

                  {/* Status Akun (Tanpa Atasan Langsung) */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Status Akun Karyawan
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditIsActive((v) => !v)}
                      className={`h-9 w-full sm:w-auto min-w-[220px] flex items-center justify-between gap-3 px-3.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        editIsActive
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {editIsActive ? <ToggleRightIcon className="size-4" /> : <ToggleLeftIcon className="size-4" />}
                        <span>{editIsActive ? "Aktif (Dapat Login)" : "Nonaktif (Diblokir)"}</span>
                      </span>
                      <span className="text-[10px] font-normal opacity-75">Klik untuk ubah</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section: Keamanan & Password Akun */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <KeyRoundIcon className="size-3" /> Password & Keamanan Akun
                </p>
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground block">
                        Password Akun Karyawan
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        Admin dapat melihat password akun ini atau menggantinya secara langsung.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditPassword("karyawan123")
                          toast.info("Password diubah ke default: karyawan123")
                        }}
                        className="h-7 px-2 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        title="Reset ke default karyawan123"
                      >
                        <RefreshCwIcon className="size-3" /> Reset Default
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(editPassword)
                          toast.success("Password akun berhasil disalin!")
                        }}
                        className="h-7 px-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-muted rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        title="Salin password"
                      >
                        <CopyIcon className="size-3" /> Salin
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-1">
                    <Input
                      type={showEditPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      required
                      placeholder="Masukkan password akun..."
                      className="h-9.5 rounded-lg text-xs font-mono font-bold tracking-wider pr-20 bg-background text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((v) => !v)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/80 flex items-center gap-1 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                      <span>{showEditPassword ? "Tutup" : "Lihat"}</span>
                    </button>
                  </div>
                </div>
              </div>
              </div>

              {/* Footer Buttons (Sticky Bottom) */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-background/95 backdrop-blur-xs shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldAlertIcon className="size-3.5 text-amber-500" />
                  <span>Perubahan langsung tersimpan ke database.</span>
                </div>
                <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="h-9 px-4 text-xs font-semibold rounded-lg"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs gap-1.5"
                  >
                    {isSubmitting ? (
                      <><RefreshCwIcon className="size-3 animate-spin" /> Menyimpan...</>
                    ) : (
                      <><CheckIcon className="size-3" /> Simpan Perubahan</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* MODAL 3: KONFIRMASI HAPUS AKUN (DELETE CRUD)             */}
        {/* ======================================================== */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6 font-sans">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <Trash2Icon className="size-5 text-red-600" />
                Hapus Akun Karyawan?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Apakah Anda yakin ingin menghapus akun <strong>{userToDelete?.nama}</strong> (NIK: {userToDelete?.nik}) dari database sistem? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-end gap-3 pt-3 mt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="h-9 px-4 text-xs font-semibold rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="h-9 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus Akun"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
