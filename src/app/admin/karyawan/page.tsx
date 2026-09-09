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
  generateAutoEmail,
  generateAutoPassword,
} from "@/lib/api"
import { User, Department, UserRole, ROLE_LABELS, ROLE_HIERARCHY_LEVEL } from "@/types/database"

export default function AdminKaryawanPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list" | "organogram">("grid")

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
  const [editRole, setEditRole] = React.useState<UserRole>("staff")
  const [editDeptId, setEditDeptId] = React.useState("")
  const [editSupervisorId, setEditSupervisorId] = React.useState("")
  const [editPositionTitle, setEditPositionTitle] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")

  // Delete Confirm Modal State
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null)

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [uList, dList] = await Promise.all([getAllUsers(), getDepartments()])
      setUsers(uList)
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
    const autoPass = generateAutoPassword()
    setNewNik(autoNik)
    setNewPassword(autoPass)
    setNewNama("")
    setNewEmail("")
    setNewPositionTitle("Staff Teknisi Lapangan")
    setNewRole("staff")
    setNewSupervisorId("")
    setIsAddOpen(true)
  }

  // Auto-generate email when Name changes
  const handleNamaChange = (val: string) => {
    setNewNama(val)
    if (val.trim()) {
      setNewEmail(generateAutoEmail(val))
    }
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
        password: newPassword || "password123",
        role: newRole,
        department_id: newDeptId || null,
        supervisor_id: newSupervisorId || null,
        position_title: newPositionTitle || `${ROLE_LABELS[newRole]?.label}`,
        phone: newPhone,
      })

      if (created) {
        toast.success(`Akun karyawan ${created.nama} berhasil dibuat!`, {
          description: `NIK ${created.nik} • Password: ${newPassword}`,
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
    setEditingUser(user)
    setEditNama(user.nama)
    setEditEmail(user.email)
    setEditRole(user.role)
    setEditDeptId(user.department_id || (departments[0]?.id || ""))
    setEditSupervisorId(user.supervisor_id || "")
    setEditPositionTitle(user.position_title || "")
    setEditPhone(user.phone || "0812-3456-7890")
    setIsEditOpen(true)
  }

  // Submit Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setIsSubmitting(true)
    try {
      const updated = await updateUser(editingUser.id, {
        nama: editNama.trim(),
        email: editEmail.trim(),
        role: editRole,
        department_id: editDeptId || null,
        supervisor_id: editSupervisorId || null,
        position_title: editPositionTitle,
        phone: editPhone,
      })

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
                    placeholder="Cari NIK / Nama / Posisi..."
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
                  <option value="admin">System Admin</option>
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
                        className="p-4 rounded-[8px] border border-border bg-card shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 relative group"
                      >
                        {/* Top Profile */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <img
                              src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                              alt={u.nama}
                              className="size-12 rounded-xl object-cover border border-border shrink-0"
                            />
                            <div className="overflow-hidden space-y-1">
                              <h3 className="text-xs font-bold text-foreground truncate">{u.nama}</h3>
                              <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-extrabold ${roleMeta.color}`}>
                                {roleMeta.badge}
                              </span>
                              <p className="text-[11px] text-muted-foreground truncate">{u.position_title}</p>
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
                            <DropdownMenuContent align="end" className="w-44 rounded-[5px] p-1">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(u)}
                                className="text-xs gap-2 py-1.5 cursor-pointer rounded-lg"
                              >
                                <Edit2Icon className="size-3.5 text-blue-500" />
                                <span>Edit Karyawan</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResetPassword(u)}
                                className="text-xs gap-2 py-1.5 cursor-pointer rounded-lg"
                              >
                                <KeyRoundIcon className="size-3.5 text-amber-500" />
                                <span>Reset Password</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1" />
                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(u)}
                                className="text-xs gap-2 py-1.5 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer rounded-lg font-semibold"
                              >
                                <Trash2Icon className="size-3.5" />
                                <span>Hapus Akun</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Details */}
                        <div className="pt-3 border-t border-border/60 space-y-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>NIK:</span>
                            <strong className="text-foreground font-mono">{u.nik}</strong>
                          </div>
                          {u.supervisor && (
                            <div className="flex items-center justify-between">
                              <span>Atasan:</span>
                              <span className="text-foreground font-semibold truncate max-w-[130px]">{u.supervisor.nama}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span>Email:</span>
                            <span className="truncate max-w-[140px]">{u.email}</span>
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
                        <th className="py-3 px-4">Posisi Spesifik</th>
                        <th className="py-3 px-4">Atasan Langsung</th>
                        <th className="py-3 px-4">Email</th>
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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ROLE_LABELS[u.role]?.color}`}>
                              {ROLE_LABELS[u.role]?.badge}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground font-medium">{u.position_title}</td>
                          <td className="py-3 px-4 text-muted-foreground font-semibold">
                            {u.supervisor?.nama || "Puncak Struktur / SGM"}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(u)}
                                className="h-7 px-2 text-[11px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg gap-1"
                              >
                                <Edit2Icon className="size-3" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDelete(u)}
                                className="h-7 px-2 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                              >
                                <Trash2Icon className="size-3" />
                              </Button>
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
                      <span>👑 Level 6: Senior General Manager (SGM)</span>
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
                      <span>👔 Level 5: Manager Divisi</span>
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
          <DialogContent className="sm:max-w-2xl rounded-[16px] p-6 sm:p-8 font-sans">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                Daftarkan Akun Karyawan Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                NIK, Email resmi, dan Password di-generate secara otomatis dan dapat disesuaikan.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-3.5 mt-3">
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

              {/* Email & Password Auto-Generator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Resmi (Auto-Generated) *
                  </label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama.lengkap@telkomakses.co.id"
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-semibold text-foreground"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Password Sementara *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewPassword(generateAutoPassword())}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
                        title="Acak Password"
                      >
                        <DicesIcon className="size-3" /> Acak
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPassword(newPassword)}
                        className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 flex items-center gap-0.5"
                        title="Salin Password"
                      >
                        {copiedPassword ? <CheckIcon className="size-3 text-emerald-500" /> : <CopyIcon className="size-3" />}
                        {copiedPassword ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password awal"
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-mono font-bold text-foreground"
                  />
                </div>
              </div>

              {/* Tingkat Jabatan & Atasan Langsung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
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
                    <option value="admin">System & HR Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Atasan Langsung (Rantai Komando)
                  </label>
                  <select
                    value={newSupervisorId}
                    onChange={(e) => setNewSupervisorId(e.target.value)}
                    className="w-full mt-1 h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
                  >
                    <option value="">-- Puncak Struktur / Tanpa Atasan --</option>
                    {potentialSupervisorsForNew.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.nama} ({ROLE_LABELS[sup.role]?.badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Posisi Spesifik */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Deskripsi Posisi Spesifik
                </label>
                <Input
                  value={newPositionTitle}
                  onChange={(e) => setNewPositionTitle(e.target.value)}
                  placeholder="Contoh: Staff Teknisi Splicing Core FO Area Bandung Barat"
                  className="mt-1 h-10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="h-10 px-4 text-xs font-semibold rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
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
          <DialogContent className="sm:max-w-2xl rounded-[16px] p-6 sm:p-8 font-sans">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                Edit Data Karyawan: {editingUser?.nama}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Perbarui informasi akun, tingkat jabatan, dan atasan langsung.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateUser} className="space-y-3.5 mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nama Lengkap *
                  </label>
                  <Input
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Resmi *
                  </label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="mt-1 h-10 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tingkat Jabatan (Role) *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full mt-1 h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
                  >
                    <option value="staff">Level 1: Staff Lapangan / Teknisi</option>
                    <option value="officer_1">Level 2: Officer 1 (Shift Lead)</option>
                    <option value="officer_2">Level 3: Officer 2 (Specialist)</option>
                    <option value="officer_3">Level 4: Officer 3 (Project Lead)</option>
                    <option value="manager">Level 5: Manager Divisi</option>
                    <option value="sgm">Level 6: Senior General Manager (SGM)</option>
                    <option value="admin">System & HR Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Atasan Langsung
                  </label>
                  <select
                    value={editSupervisorId}
                    onChange={(e) => setEditSupervisorId(e.target.value)}
                    className="w-full mt-1 h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
                  >
                    <option value="">-- Puncak Struktur / Tanpa Atasan --</option>
                    {potentialSupervisorsForEdit.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.nama} ({ROLE_LABELS[sup.role]?.badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Deskripsi Posisi Spesifik
                </label>
                <Input
                  value={editPositionTitle}
                  onChange={(e) => setEditPositionTitle(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="h-10 px-4 text-xs font-semibold rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
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
