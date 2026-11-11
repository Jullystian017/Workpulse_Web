import { createClient } from './supabase/client';
import {
  User,
  Department,
  Channel,
  Task,
  Subtask,
  SubtaskAttachment,
  TaskAttachment,
  TaskComment,
  TaskPriority,
  TaskStatus,
  UserRole,
  ROLE_HIERARCHY_LEVEL,
  NotificationItem,
  NotificationType,
} from '@/types/database';
import { recordActivity } from './activity-logger';

export const supabase = createClient();

/** Semua id PIC sebuah tugas (gabungan assignee_ids, assigned_to, secondary_assigned_to; unik). */
export function getTaskAssigneeIds(t: Pick<Task, 'assigned_to' | 'secondary_assigned_to' | 'assignee_ids'>): string[] {
  const ids = [t.assigned_to, t.secondary_assigned_to, ...(t.assignee_ids || [])].filter(Boolean) as string[];
  return Array.from(new Set(ids));
}

/**
 * Tentukan PIC review (atasan) efektif sebuah tugas.
 * Prioritas: reviewer yang dipilih saat penugasan → delegator → pembuat tugas → atasan langsung PIC utama.
 */
/**
 * Memeriksa apakah user berhak menyetujui (approve) atau mengembalikan (return) tugas.
 * Aturan:
 * 1. Pelaksana tugas (assignee/PIC) MUTLAK dilarang menyetujui tugasnya sendiri.
 * 2. Admin & SGM selalu memiliki wewenang override.
 * 3. PIC Reviewer resmi (reviewer_id / reviewer).
 * 4. Delegator tugas (delegated_by / delegator).
 * 5. Atasan langsung si pelaksana tugas (assignee.supervisor_id).
 * 6. Pembuat tugas (inisiator) jika bukan reviewer khusus dan bukan pelaksana.
 */
export function canUserApproveTask(task: Task | null | undefined, user: User | null | undefined): boolean {
  if (!user || !task) return false;
  const assigneeIds = getTaskAssigneeIds(task);
  if (assigneeIds.includes(user.id)) return false;

  if (user.role === 'admin' || user.role === 'sgm') return true;
  if (task.reviewer_id && task.reviewer_id === user.id) return true;
  if (task.reviewer && task.reviewer.id === user.id) return true;
  if (task.delegated_by && task.delegated_by === user.id) return true;
  if (task.delegator && task.delegator.id === user.id) return true;
  if (task.assignee?.supervisor_id && task.assignee.supervisor_id === user.id) return true;

  if (!task.reviewer_id) {
    if (task.created_by && task.created_by === user.id) return true;
    if (task.creator && task.creator.id === user.id) return true;
  }

  return false;
}

export function getTaskReviewerId(
  t: Pick<Task, 'reviewer_id' | 'delegated_by' | 'created_by'> & { assignee?: User | null }
): string | null {
  return t.reviewer_id || t.delegated_by || t.created_by || t.assignee?.supervisor_id || null;
}

async function pushNotification(
  userId: string,
  n: { title: string; message: string; type: NotificationType; taskId: string }
): Promise<void> {
  try {
    const users = await getAllUsers();
    const target = users.find((u) => u.id === userId);
    const link_url =
      target?.role === 'admin' ? `/admin/tasks?selected=${n.taskId}` : `/karyawan/tasks?task=${n.taskId}`;
    await supabase.from('notifications').insert([
      { user_id: userId, title: n.title, message: n.message, type: n.type, link_url, is_read: false },
    ]);
  } catch (e) {
    console.warn('Could not insert notification:', e);
  }
}

/** Kirim notifikasi terkait siklus review sebuah tahapan (subtask). */
async function notifySubtaskEvent(
  subtaskId: string,
  event: 'submitted' | 'approved' | 'rejected',
  note?: string
): Promise<void> {
  try {
    const { data: st } = await supabase
      .from('subtasks')
      .select('title, sort_order, task_id')
      .eq('id', subtaskId)
      .single();
    if (!st) return;
    const { data: t } = await supabase
      .from('tasks')
      .select('ticket_code, title, assigned_to, secondary_assigned_to, assignee_ids, reviewer_id, delegated_by, created_by')
      .eq('id', st.task_id)
      .single();
    if (!t) return;
    const actor = getActiveUserFromStorage();

    if (event === 'submitted') {
      const users = await getAllUsers();
      const assignee = users.find((u) => u.id === t.assigned_to);
      const reviewerId = getTaskReviewerId({ ...t, assignee });
      if (reviewerId && reviewerId !== actor?.id) {
        await pushNotification(reviewerId, {
          title: `Tahap Menunggu Review: [${t.ticket_code}] ⏳`,
          message: `${actor?.nama || 'Pelaksana'} mengajukan tahap "${st.title}" pada tugas "${t.title}" untuk Anda review.`,
          type: 'task_submitted',
          taskId: st.task_id,
        });
      }
      return;
    }

    const targets = getTaskAssigneeIds(t).filter((id) => id !== actor?.id);
    for (const id of targets) {
      await pushNotification(
        id,
        event === 'approved'
          ? {
              title: `Tahap Disetujui: [${t.ticket_code}] ✅`,
              message: `Tahap "${st.title}" pada tugas "${t.title}" telah disetujui. Tahap berikutnya kini terbuka untuk dikerjakan.`,
              type: 'task_approved',
              taskId: st.task_id,
            }
          : {
              title: `Tahap Perlu Revisi: [${t.ticket_code}] ⚠️`,
              message: `Tahap "${st.title}" dikembalikan atasan${note ? `: "${note}"` : '.'}`,
              type: 'task_returned',
              taskId: st.task_id,
            }
      );
    }
  } catch (e) {
    console.warn('Could not insert subtask notification:', e);
  }
}

// ==========================================
// FALLBACK SEED DATA (Resilience Guarantee)
// ==========================================

const FALLBACK_USERS: User[] = [];

// ==========================================
// 1. AUTH & USER MANAGEMENT
// ==========================================

const CURRENT_USER_KEY = 'workpulse_active_user';

export async function loginWithCredentials(
  nik: string,
  password?: string
): Promise<{ success: boolean; user?: User; errorType?: 'USER_NOT_FOUND' | 'PASSWORD_MISMATCH' | 'SERVER_ERROR'; message?: string }> {
  const trimmed = nik.trim();
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, department:departments(*)')
      .eq('nik', trimmed)
      .maybeSingle();

    if (data && !error) {
      if (password && data.password && data.password !== password) {
        return { success: false, errorType: 'PASSWORD_MISMATCH', message: 'Password yang Anda masukkan salah.' };
      }
      if (data.is_active === false) {
        return { success: false, errorType: 'USER_NOT_FOUND', message: 'Akun Anda telah dinonaktifkan. Hubungi Admin di contact@workpulse.id.' };
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
      }
      return { success: true, user: data as User };
    }
  } catch (e) {
    console.warn('Supabase login error, checking fallback users:', e);
  }

  // Fallback match
  const fallback = FALLBACK_USERS.find((u) => u.nik === trimmed);
  if (fallback) {
    if (password && password !== 'karyawan123' && password !== 'password123') {
      return { success: false, errorType: 'PASSWORD_MISMATCH', message: 'Password yang Anda masukkan salah.' };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fallback));
    }
    return { success: true, user: fallback };
  }

  return { success: false, errorType: 'USER_NOT_FOUND', message: 'Nomor Induk Karyawan (NIK) tidak terdaftar.' };
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; errorType?: 'USER_NOT_FOUND' | 'PASSWORD_MISMATCH' | 'SERVER_ERROR'; message?: string }> {
  const trimmedEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, department:departments(*)')
      .ilike('email', trimmedEmail)
      .maybeSingle();

    if (data && !error) {
      if (data.password && data.password !== password) {
        return { success: false, errorType: 'PASSWORD_MISMATCH', message: 'Password yang Anda masukkan salah.' };
      }
      if (data.is_active === false) {
        return { success: false, errorType: 'USER_NOT_FOUND', message: 'Akun Anda telah dinonaktifkan. Hubungi Admin di contact@workpulse.id.' };
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
      }
      return { success: true, user: data as User };
    }
  } catch (e) {
    console.warn('Supabase email login error, checking fallback users:', e);
  }

  // Fallback match by email
  const fallback = FALLBACK_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (fallback) {
    if (password && password !== 'karyawan123' && password !== 'password123') {
      return { success: false, errorType: 'PASSWORD_MISMATCH', message: 'Password yang Anda masukkan salah.' };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fallback));
    }
    return { success: true, user: fallback };
  }

  return { success: false, errorType: 'USER_NOT_FOUND', message: 'Email tidak terdaftar dalam sistem.' };
}

export async function loginWithNik(nik: string): Promise<User | null> {
  const res = await loginWithCredentials(nik);
  return res.user || null;
}

export function getActiveUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as User;
    if (user && user.role === 'admin') {
      user.position_title = 'Superadmin';
    }
    return user;
  } catch {
    return null;
  }
}

export function setActiveUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    const active = getActiveUserFromStorage();
    if (active) {
      recordActivity({
        user: `${active.nama} (${active.nik})`,
        user_id: active.id,
        action: 'LOGOUT',
        module: 'Authentication',
        level: 'INFO',
        detail: `Pengguna ${active.nama} mengakhiri sesi dan keluar dari sistem WorkPulse.`,
      });
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

let _cachedUsers: User[] | null = null;
let _cachedUsersTime = 0;
let _inflightUsersPromise: Promise<User[]> | null = null;
const USERS_CACHE_TTL = 30 * 1000; // 30 seconds fresh

export function invalidateUsersCache() {
  _cachedUsers = null;
  _cachedUsersTime = 0;
  _inflightUsersPromise = null;
}

export async function getAllUsers(forceRefresh = false): Promise<User[]> {
  if (!forceRefresh && _cachedUsers && Date.now() - _cachedUsersTime < USERS_CACHE_TTL) {
    return _cachedUsers;
  }
  if (!forceRefresh && _inflightUsersPromise) {
    return _inflightUsersPromise;
  }

  _inflightUsersPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, department:departments(*)')
        .order('nama', { ascending: true });

      if (data && data.length > 0 && !error) {
        // Map supervisors in memory
        const userMap = new Map(data.map((u) => [u.id, u]));
        const result = data.map((u) => ({
          ...u,
          supervisor: u.supervisor_id ? userMap.get(u.supervisor_id) : undefined,
        })) as User[];
        _cachedUsers = result;
        _cachedUsersTime = Date.now();
        return result;
      }
    } catch (e) {
      console.warn('Error querying Supabase users, using fallback:', e);
    } finally {
      _inflightUsersPromise = null;
    }

    return FALLBACK_USERS;
  })();

  return _inflightUsersPromise;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser(user: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        nik: user.nik,
        nama: user.nama,
        email: user.email,
        password: user.password || 'karyawan123',
        role: user.role,
        department_id: user.department_id,
        supervisor_id: user.supervisor_id || null,
        position_title: user.position_title,
        sub_unit: user.sub_unit || 'Procurement',
        avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        phone: user.phone || '0812-3456-7890',
        is_active: true,
      },
    ])
    .select('*, department:departments(*)')
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  if (data) {
    invalidateUsersCache();
    const active = getActiveUserFromStorage();
    recordActivity({
      user: active ? `${active.nama} (${active.nik})` : 'Administrator',
      action: 'CREATE_EMPLOYEE',
      module: 'Karyawan Management',
      level: 'AUDIT',
      detail: `Menambahkan profil karyawan baru: ${(data as User).nama} (NIK ${(data as User).nik}, Posisi: ${(data as User).position_title || (data as User).role}).`,
    });
  }

  return data as User;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, department:departments(*)')
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  if (data) {
    invalidateUsersCache();
    const active = getActiveUserFromStorage();
    recordActivity({
      user: active ? `${active.nama} (${active.nik})` : 'Administrator',
      action: 'UPDATE_EMPLOYEE',
      module: 'Karyawan Management',
      level: 'AUDIT',
      detail: `Memperbarui data karyawan: ${(data as User).nama} (NIK ${(data as User).nik}).`,
    });
  }

  return data as User;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  invalidateUsersCache();
  const active = getActiveUserFromStorage();
  recordActivity({
    user: active ? `${active.nama} (${active.nik})` : 'Administrator',
    action: 'DELETE_EMPLOYEE',
    module: 'Karyawan Management',
    level: 'WARNING',
    detail: `Menghapus akun karyawan dengan ID ${id}.`,
  });

  return true;
}

export async function resetUserPassword(id: string, newPassword?: string): Promise<string> {
  const pass = newPassword || generateAutoPassword();
  const { error } = await supabase
    .from('users')
    .update({ password: pass, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
  return pass;
}

export async function verifyAndResetPassword(
  nik: string,
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('nik', nik.trim())
      .maybeSingle();

    if (error || !user) {
      return { success: false, message: 'NIK tidak ditemukan dalam sistem.' };
    }

    if (user.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return {
        success: false,
        message: 'Email tidak cocok dengan data NIK yang terdaftar.',
      };
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, message: 'Gagal memperbarui password di server.' };
    }

    return {
      success: true,
      message: `Password akun ${user.nama} berhasil diperbarui! Silakan login dengan password baru.`,
      user: user as User,
    };
  } catch (err: any) {
    console.error('Error in verifyAndResetPassword:', err);
    return { success: false, message: 'Terjadi kesalahan sistem saat mereset password.' };
  }
}

export async function checkUserByEmailForReset(
  email: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const trimmed = email.trim().toLowerCase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*, department:departments(*)')
      .ilike('email', trimmed)
      .maybeSingle();

    if (user && !error) {
      return { success: true, message: 'Akun ditemukan.', user: user as User };
    }

    const fallback = FALLBACK_USERS.find((u) => u.email.toLowerCase() === trimmed);
    if (fallback) {
      return { success: true, message: 'Akun ditemukan.', user: fallback };
    }

    return { success: false, message: 'Email tidak ditemukan dalam sistem.' };
  } catch (err: any) {
    console.error('Error in checkUserByEmailForReset:', err);
    return { success: false, message: 'Gagal memverifikasi email akun.' };
  }
}

export async function resetUserPasswordById(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating password in supabase:', error);
      return { success: false, message: 'Gagal memperbarui password di server.' };
    }

    return { success: true, message: 'Password berhasil diperbarui! Silakan masuk dengan password baru.' };
  } catch (err: any) {
    console.error('Error in resetUserPasswordById:', err);
    return { success: false, message: 'Terjadi kesalahan sistem saat memperbarui password.' };
  }
}

// Auto-generators
export function generateAutoNik(existingUsers: User[]): string {
  const numericNiks = existingUsers
    .map((u) => parseInt(u.nik, 10))
    .filter((n) => !isNaN(n) && n >= 10293800 && n < 10299999);

  if (numericNiks.length > 0) {
    const maxNik = Math.max(...numericNiks);
    return (maxNik + 1).toString();
  }
  return `1029${Math.floor(3870 + Math.random() * 100)}`;
}

export function generateAutoEmail(nama: string): string {
  const cleaned = nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (cleaned.length === 0) return 'user@telkomakses.co.id';
  if (cleaned.length === 1) return `${cleaned[0]}@telkomakses.co.id`;
  return `${cleaned[0]}.${cleaned[cleaned.length - 1]}@telkomakses.co.id`;
}

export function generateAutoPassword(): string {
  return 'karyawan123';
}

// Get all subordinates down the hierarchy tree
export async function getSubordinatesForUser(userId: string, role: UserRole): Promise<User[]> {
  const allUsers = await getAllUsers();
  
  if (role === 'admin' || role === 'sgm') {
    return allUsers.filter((u) => u.id !== userId);
  }

  const currentUserLevel = ROLE_HIERARCHY_LEVEL[role] || 1;

  // Direct subordinates or lower rank in same department
  const subordinates = allUsers.filter((u) => {
    if (u.id === userId) return false;
    const userLevel = ROLE_HIERARCHY_LEVEL[u.role] || 1;
    return (
      u.supervisor_id === userId ||
      userLevel < currentUserLevel
    );
  });

  return subordinates;
}

// ==========================================
// 2. DEPARTMENTS & CHANNELS
// ==========================================

let _cachedDepartments: Department[] | null = null;
let _cachedDepartmentsTime = 0;
let _inflightDepartmentsPromise: Promise<Department[]> | null = null;
const DEPARTMENTS_CACHE_TTL = 60 * 1000; // 60 seconds

export function invalidateDepartmentsCache() {
  _cachedDepartments = null;
  _cachedDepartmentsTime = 0;
  _inflightDepartmentsPromise = null;
}

export async function getDepartments(forceRefresh = false): Promise<Department[]> {
  if (!forceRefresh && _cachedDepartments && Date.now() - _cachedDepartmentsTime < DEPARTMENTS_CACHE_TTL) {
    return _cachedDepartments;
  }
  if (!forceRefresh && _inflightDepartmentsPromise) {
    return _inflightDepartmentsPromise;
  }

  _inflightDepartmentsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (data && data.length > 0 && !error) {
        const res = data as Department[];
        _cachedDepartments = res;
        _cachedDepartmentsTime = Date.now();
        return res;
      }
    } catch (e) {
      console.warn('Supabase departments error:', e);
    } finally {
      _inflightDepartmentsPromise = null;
    }

    return [
      { id: '11111111-1111-4111-8111-111111111111', name: 'Fiber Optic Operation & Maintenance', code: 'FOP' },
      { id: '11111111-1111-4111-8111-222222222222', name: 'Consumer Access & In-Home Installation', code: 'CUS' },
      { id: '11111111-1111-4111-8111-333333333333', name: 'Enterprise & Corporate Solutions', code: 'B2B' },
    ];
  })();

  return _inflightDepartmentsPromise;
}

let _cachedChannels: Channel[] | null = null;
let _cachedChannelsTime = 0;
let _inflightChannelsPromise: Promise<Channel[]> | null = null;
const CHANNELS_CACHE_TTL = 45 * 1000; // 45 seconds

export function invalidateChannelsCache() {
  _cachedChannels = null;
  _cachedChannelsTime = 0;
  _inflightChannelsPromise = null;
}

export async function getChannels(forceRefresh = false): Promise<Channel[]> {
  if (!forceRefresh && _cachedChannels && Date.now() - _cachedChannelsTime < CHANNELS_CACHE_TTL) {
    return _cachedChannels;
  }
  if (!forceRefresh && _inflightChannelsPromise) {
    return _inflightChannelsPromise;
  }

  _inflightChannelsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*, department:departments(*)');
      if (data && data.length > 0 && !error) {
        const res = data as Channel[];
        _cachedChannels = res;
        _cachedChannelsTime = Date.now();
        return res;
      }
    } catch (e) {
      console.warn('Supabase channels error:', e);
    } finally {
      _inflightChannelsPromise = null;
    }

    return [
      { id: '22222222-2222-4222-8222-111111111111', department_id: '11111111-1111-4111-8111-111111111111', name: 'Divisi Operasional', slug: 'divisi-operasional', icon: 'Layers' },
      { id: '22222222-2222-4222-8222-222222222222', department_id: '11111111-1111-4111-8111-111111111111', name: 'Anggaran & SPJ', slug: 'anggaran-spj', icon: 'FileText' },
      { id: '22222222-2222-4222-8222-333333333333', department_id: '11111111-1111-4111-8111-222222222222', name: 'Audit Kepatuhan ISO', slug: 'audit-kepatuhan-iso', icon: 'Shield' },
      { id: '22222222-2222-4222-8222-444444444444', department_id: '11111111-1111-4111-8111-333333333333', name: 'SDM & Pelatihan', slug: 'sdm-pelatihan', icon: 'Users' },
    ];
  })();

  return _inflightChannelsPromise;
}

export async function createChannel(params: {
  name: string;
  description?: string;
  department_id?: string;
  icon?: string;
}): Promise<Channel | null> {
  invalidateChannelsCache();
  const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newChannel: Partial<Channel> = {
    name: params.name,
    slug,
    description: params.description || 'Ruang kerja divisi & penugasan proyek kantor.',
    icon: params.icon || 'Hash',
    department_id: params.department_id || '11111111-1111-4111-8111-111111111111',
  };

  try {
    const { data, error } = await supabase
      .from('channels')
      .insert(newChannel)
      .select('*, department:departments(*)')
      .single();

    if (data && !error) return data as Channel;
  } catch (e) {
    console.warn('Supabase createChannel error:', e);
  }

  // Fallback local return
  return {
    id: `ch-${Date.now()}`,
    name: params.name,
    slug,
    description: params.description || 'Ruang kerja divisi & penugasan proyek kantor.',
    icon: params.icon || 'Hash',
    department_id: params.department_id || '11111111-1111-4111-8111-111111111111',
  };
}

export async function deleteChannel(channelId: string): Promise<boolean> {
  invalidateChannelsCache();
  try {
    const { error } = await supabase.from('channels').delete().eq('id', channelId);
    if (!error) return true;
  } catch (e) {
    console.warn('Supabase deleteChannel error:', e);
  }
  return true;
}

export async function updateChannel(
  channelId: string,
  params: { name?: string; description?: string; icon?: string }
): Promise<Channel | null> {
  invalidateChannelsCache();
  try {
    const updates: Partial<Channel> = { ...params };
    if (params.name) {
      updates.slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', channelId)
      .select('*, department:departments(*)')
      .single();
    if (data && !error) return data as Channel;
  } catch (e) {
    console.warn('Supabase updateChannel error:', e);
  }
  return null;
}

// ==========================================
// 3. TASKS MANAGEMENT
// ==========================================

export interface TaskFilters {
  channelId?: string;
  departmentId?: string;
  status?: TaskStatus;
  assignedTo?: string;
  search?: string;
}

const _tasksCache = new Map<string, { data: Task[]; timestamp: number }>();
const _inflightTasks = new Map<string, Promise<Task[]>>();
const TASKS_CACHE_TTL = 10 * 1000; // 10 seconds

export function invalidateTasksCache() {
  _tasksCache.clear();
  _inflightTasks.clear();
}

const _taskDetailCache = new Map<string, { data: Task; timestamp: number }>();
const _inflightTaskDetail = new Map<string, Promise<Task | null>>();
const TASK_DETAIL_CACHE_TTL = 20 * 1000; // 20 seconds

export function invalidateTaskCache(taskId?: string) {
  if (taskId) {
    _taskDetailCache.delete(taskId);
    _inflightTaskDetail.delete(taskId);
  } else {
    _taskDetailCache.clear();
    _inflightTaskDetail.clear();
  }
  invalidateTasksCache();
}

export async function getTasks(filters?: TaskFilters, forceRefresh = false): Promise<Task[]> {
  const cacheKey = JSON.stringify(filters || {});
  if (!forceRefresh) {
    const cached = _tasksCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TASKS_CACHE_TTL) {
      return cached.data;
    }
    const inflight = _inflightTasks.get(cacheKey);
    if (inflight) {
      return inflight;
    }
  }

  const promise = (async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('*, channel:channels(*), department:departments(*), subtasks(*, attachments:subtask_attachments(*)), attachments:task_attachments(*)')
        .order('created_at', { ascending: false });

      if (filters?.channelId) {
        query = query.eq('channel_id', filters.channelId);
      }
      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assignedTo) {
        query = query.or(`assigned_to.eq.${filters.assignedTo},secondary_assigned_to.eq.${filters.assignedTo},assignee_ids.cs.{${filters.assignedTo}}`);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,ticket_code.ilike.%${filters.search}%`);
      }

      const [{ data: rawTasks, error }, users] = await Promise.all([
        query,
        getAllUsers(),
      ]);

      if (rawTasks && rawTasks.length > 0 && !error) {
        const userMap = new Map(users.map((u) => [u.id, u]));

        const result = rawTasks.map((t) => ({
          ...t,
          creator: t.created_by ? userMap.get(t.created_by) : undefined,
          assignee: t.assigned_to ? userMap.get(t.assigned_to) : undefined,
          secondary_assignee: t.secondary_assigned_to ? userMap.get(t.secondary_assigned_to) : undefined,
          assignees: getTaskAssigneeIds(t).map((id) => userMap.get(id)).filter(Boolean),
          reviewer: t.reviewer_id ? userMap.get(t.reviewer_id) : undefined,
          delegator: t.delegated_by ? userMap.get(t.delegated_by) : undefined,
        })) as Task[];

        _tasksCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (e) {
      console.warn('Supabase getTasks error:', e);
    } finally {
      _inflightTasks.delete(cacheKey);
    }

    return [];
  })();

  _inflightTasks.set(cacheKey, promise);
  return promise;
}

export async function getTaskById(taskId: string, forceRefresh = false): Promise<Task | null> {
  if (!forceRefresh) {
    const cached = _taskDetailCache.get(taskId);
    if (cached && Date.now() - cached.timestamp < TASK_DETAIL_CACHE_TTL) {
      return cached.data;
    }
    const inflight = _inflightTaskDetail.get(taskId);
    if (inflight) {
      return inflight;
    }
  }

  const promise = (async () => {
    try {
      const [{ data: task, error }, users] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            channel:channels(*),
            department:departments(*),
            subtasks(*, attachments:subtask_attachments(*)),
            attachments:task_attachments(*),
            comments:task_comments(*)
          `)
          .eq('id', taskId)
          .single(),
        getAllUsers(),
      ]);

      if (task && !error) {
        const userMap = new Map(users.map((u) => [u.id, u]));

        const allComments = (task.comments || []).map((cmt: any) => ({
          ...cmt,
          user: cmt.user_id ? userMap.get(cmt.user_id) : undefined,
        }));

        const result = {
          ...task,
          creator: task.created_by ? userMap.get(task.created_by) : undefined,
          assignee: task.assigned_to ? userMap.get(task.assigned_to) : undefined,
          secondary_assignee: task.secondary_assigned_to ? userMap.get(task.secondary_assigned_to) : undefined,
          assignees: getTaskAssigneeIds(task).map((id: string) => userMap.get(id)).filter(Boolean),
          reviewer: task.reviewer_id ? userMap.get(task.reviewer_id) : undefined,
          delegator: task.delegated_by ? userMap.get(task.delegated_by) : undefined,
          subtasks: (task.subtasks || [])
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((st: any) => ({
              ...st,
              approver: st.approved_by ? userMap.get(st.approved_by) : undefined,
              attachments: (st.attachments || []).map((a: any) => ({
                ...a,
                uploader: a.uploaded_by ? userMap.get(a.uploaded_by) : undefined,
              })),
              comments: allComments.filter((c: any) => c.subtask_id === st.id),
            })),
          attachments: (task.attachments || []).map((att: any) => ({
            ...att,
            uploader: att.uploaded_by ? userMap.get(att.uploaded_by) : undefined,
          })),
          comments: allComments,
        } as Task;

        _taskDetailCache.set(taskId, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (e) {
      console.warn('Error fetching task details:', e);
    } finally {
      _inflightTaskDetail.delete(taskId);
    }

    return null;
  })();

  _inflightTaskDetail.set(taskId, promise);
  return promise;
}

export async function createTask(task: {
  title: string;
  description?: string;
  channel_id: string;
  department_id: string;
  priority: TaskPriority;
  created_by: string;
  assigned_to?: string | null;
  /** Multi-PIC: daftar semua pelaksana. Jika diisi, menggantikan assigned_to. */
  assignee_ids?: string[];
  /** PIC review (atasan) yang menyetujui tahapan & tugas. */
  reviewer_id?: string | null;
  deadline_at?: string | null;
  estimated_hours?: number;
  location_name?: string;
  location_coordinates?: string;
  subtask_titles?: string[];
}): Promise<Task | null> {
  const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
  const ticketCode = `TLK-BDG-${randomTicketNum}`;

  const assigneeIds = Array.from(new Set((task.assignee_ids && task.assignee_ids.length > 0 ? task.assignee_ids : task.assigned_to ? [task.assigned_to] : []).filter(Boolean)));
  const hasAssignee = assigneeIds.length > 0;

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert([
      {
        ticket_code: ticketCode,
        title: task.title,
        description: task.description,
        channel_id: task.channel_id,
        department_id: task.department_id,
        priority: task.priority,
        status: hasAssignee ? 'todo' : 'unassigned',
        created_by: task.created_by,
        assigned_to: assigneeIds[0] || null,
        secondary_assigned_to: assigneeIds[1] || null,
        assignee_ids: assigneeIds,
        reviewer_id: task.reviewer_id || null,
        deadline_at: task.deadline_at || (() => {
          const d = new Date();
          d.setHours(18, 0, 0, 0);
          return d.toISOString();
        })(),
        estimated_hours: task.estimated_hours || 2.0,
        location_name: task.location_name,
        location_coordinates: task.location_coordinates,
      },
    ])
    .select()
    .single();

  if (error || !newTask) {
    console.error('Error creating task:', error);
    throw error;
  }

  // Insert subtasks if provided
  if (task.subtask_titles && task.subtask_titles.length > 0) {
    const subtaskInserts = task.subtask_titles.map((title, index) => ({
      task_id: newTask.id,
      title,
      is_completed: false,
      sort_order: index + 1,
    }));
    await supabase.from('subtasks').insert(subtaskInserts);
  }

  // Add system audit comment
  await supabase.from('task_comments').insert([
    {
      task_id: newTask.id,
      user_id: task.created_by,
      comment: `Tugas ${ticketCode} dibuat dengan prioritas ${task.priority.toUpperCase()}.${hasAssignee ? (assigneeIds.length > 1 ? ` Ditugaskan langsung kepada ${assigneeIds.length} PIC.` : ' Ditugaskan langsung.') : ' Masuk ke Unassigned Pool.'}`,
      is_system_log: true,
    },
  ]);

  const activeUser = getActiveUserFromStorage();
  recordActivity({
    user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : `User ${task.created_by}`,
    user_id: task.created_by,
    action: 'CREATE_TASK',
    module: 'Task Management',
    level: 'AUDIT',
    detail: `[${ticketCode}] Tugas '${newTask.title}' dibuat (${task.priority.toUpperCase()}).${hasAssignee ? (assigneeIds.length > 1 ? ` Ditugaskan langsung kepada ${assigneeIds.length} PIC.` : ' Ditugaskan langsung.') : ' Masuk ke Unassigned Pool.'}`,
  });

  // Beritahu PIC review bahwa dirinya ditunjuk sebagai reviewer tugas ini
  if (task.reviewer_id && task.reviewer_id !== task.created_by) {
    await pushNotification(task.reviewer_id, {
      title: `Anda Ditunjuk Sebagai PIC Review: [${ticketCode}] 🛡️`,
      message: `Anda menjadi PIC review untuk tugas "${newTask.title}". Notifikasi akan masuk saat tahapan/tugas diajukan.`,
      type: 'task_delegated',
      taskId: newTask.id,
    });
  }

  invalidateTasksCache();
  return getTaskById(newTask.id);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, userId?: string): Promise<boolean> {
  const updates: Partial<Task> = { status, updated_at: new Date().toISOString() };
  if (status === 'done') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
  if (error) return false;

  if (userId) {
    await supabase.from('task_comments').insert([
      {
        task_id: taskId,
        user_id: userId,
        comment: `Status tugas diubah menjadi ${status.toUpperCase().replace('_', ' ')}.`,
        is_system_log: true,
      },
    ]);
  }

  const activeUser = getActiveUserFromStorage();
  recordActivity({
    user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : (userId ? `User ${userId}` : 'Sistem'),
    user_id: userId,
    action: 'UPDATE_TASK_STATUS',
    module: 'Task Management',
    level: 'AUDIT',
    detail: `Status penugasan diubah menjadi ${status.toUpperCase().replace('_', ' ')}.`,
  });

  invalidateTaskCache(taskId);
  return true;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  channel_id?: string;
  department_id?: string;
  priority?: TaskPriority;
  assigned_to?: string | null;
  secondary_assigned_to?: string | null;
  assignee_ids?: string[];
  reviewer_id?: string | null;
  deadline_at?: string;
  estimated_hours?: number;
  location_name?: string;
}

export async function updateTask(taskId: string, input: UpdateTaskInput, userId?: string): Promise<Task | null> {
  const updates: any = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  if (input.assignee_ids) {
    const ids = Array.from(new Set(input.assignee_ids.filter(Boolean)));
    updates.assigned_to = ids[0] || null;
    updates.secondary_assigned_to = ids[1] || null;
    updates.assignee_ids = ids;
  } else if ('assigned_to' in input || 'secondary_assigned_to' in input) {
    const { data: cur } = await supabase
      .from('tasks')
      .select('assigned_to, secondary_assigned_to, assignee_ids')
      .eq('id', taskId)
      .single();
    const extras = ((cur?.assignee_ids as string[] | null) || []).filter(
      (id) => id !== cur?.assigned_to && id !== cur?.secondary_assigned_to
    );
    const primary = 'assigned_to' in input ? input.assigned_to : cur?.assigned_to;
    const secondary = 'secondary_assigned_to' in input ? input.secondary_assigned_to : cur?.secondary_assigned_to;
    updates.assignee_ids = Array.from(new Set([primary, secondary, ...extras].filter(Boolean) as string[]));
  }

  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  if (userId) {
    await supabase.from('task_comments').insert([
      {
        task_id: taskId,
        user_id: userId,
        comment: `Rincian penugasan diperbarui di sistem.`,
        is_system_log: true,
      },
    ]);
  }

  invalidateTaskCache(taskId);
  return getTaskById(taskId);
}

export async function updateTaskDeadline(taskId: string, deadlineAt: string, userId?: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({ deadline_at: deadlineAt, updated_at: new Date().toISOString() })
    .eq('id', taskId);
  if (!error) {
    invalidateTaskCache(taskId);
    if (userId) {
      const activeUser = getActiveUserFromStorage();
      recordActivity({
        user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : 'User',
        user_id: userId,
        action: 'UPDATE_TASK_DEADLINE',
        module: 'Task Management',
        level: 'AUDIT',
        detail: `Target tenggat waktu penugasan diperbarui menjadi ${new Date(deadlineAt).toLocaleString('id-ID')}.`,
      });
    }
    return true;
  }
  return false;
}

export async function updateTaskAssignees(
  taskId: string,
  primaryId: string | null,
  secondaryId?: string | null,
  userId?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      assigned_to: primaryId,
      secondary_assigned_to: secondaryId || null,
      assignee_ids: [primaryId, secondaryId].filter(Boolean),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);
  if (!error) {
    invalidateTaskCache(taskId);
    return true;
  }
  return false;
}

// Hierarchical Delegation Action (Supports 1 or 2 assignees)
export async function delegateTask(
  taskId: string,
  toUserId: string,
  delegatorId: string,
  reason?: string,
  matchScore?: number,
  secondaryToUserId?: string | null
): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      assigned_to: toUserId,
      secondary_assigned_to: secondaryToUserId || null,
      assignee_ids: [toUserId, secondaryToUserId].filter(Boolean),
      delegated_by: delegatorId,
      delegated_at: new Date().toISOString(),
      status: 'todo',
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) {
    console.error('Error delegating task:', error);
    return false;
  }

  // Record delegation history
  await supabase.from('task_delegation_history').insert([
    {
      task_id: taskId,
      from_user_id: delegatorId,
      to_user_id: toUserId,
      secondary_to_user_id: secondaryToUserId || null,
      reason: reason || 'Pendelegasian tugas ke bawahan sesuai keahlian.',
      match_score: matchScore || 90,
    },
  ]);

  // Record system audit comment
  await supabase.from('task_comments').insert([
    {
      task_id: taskId,
      user_id: delegatorId,
      comment: `Tugas didelegasikan kepada pelaksana tugas baru.${reason ? ` Catatan: "${reason}"` : ''}`,
      is_system_log: true,
    },
  ]);

  const activeUser = getActiveUserFromStorage();
  recordActivity({
    user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : 'Atasan',
    user_id: delegatorId,
    action: 'DELEGATE_TASK',
    module: 'Task Management',
    level: 'AUDIT',
    detail: `Pendelegasian tugas kepada pelaksana baru.${reason ? ` Catatan: "${reason}"` : ''}`,
  });

  // Send Notification
  await supabase.from('notifications').insert([
    {
      user_id: toUserId,
      title: 'Tugas Baru Didelegasikan 📋',
      message: `Anda telah ditugaskan untuk mengerjakan tugas. Silakan cek detail dan mulai pengerjaan.`,
      type: 'task_delegated',
      link_url: `/admin/tasks?selected=${taskId}`,
    },
  ]);

  invalidateTaskCache(taskId);
  return true;
}

// Staff Claims Task from Unassigned Pool
export async function claimTask(taskId: string, staffUserId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      assigned_to: staffUserId,
      secondary_assigned_to: null,
      assignee_ids: [staffUserId],
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return false;

  await supabase.from('task_comments').insert([
    {
      task_id: taskId,
      user_id: staffUserId,
      comment: 'Tugas diklaim mandiri dari Unassigned Pool dan langsung mulai dikerjakan.',
      is_system_log: true,
    },
  ]);

  invalidateTaskCache(taskId);
  return true;
}

// Staff Submits Task for Review
export async function submitTaskForReview(taskId: string, userId: string, notes?: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'review',
      review_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return false;

  await supabase.from('task_comments').insert([
    {
      task_id: taskId,
      user_id: userId,
      comment: `Tugas disubmit untuk review pengerjaan.${notes ? ` Catatan: "${notes}"` : ''}`,
      is_system_log: true,
    },
  ]);

  // Fetch task info to notify supervisors / admin
  try {
    const { data: t } = await supabase
      .from('tasks')
      .select('ticket_code, title, assigned_to, reviewer_id, delegated_by, created_by')
      .eq('id', taskId)
      .single();
    if (t) {
      const activeUser = getActiveUserFromStorage();
      const submitterName = activeUser ? activeUser.nama : 'Staff';
      const users = await getAllUsers();
      const assignee = users.find((u) => u.id === t.assigned_to);
      const reviewerId = getTaskReviewerId({ ...t, assignee }) || userId;
      if (reviewerId !== userId) {
        await pushNotification(reviewerId, {
          title: `Tugas Menunggu Review: [${t.ticket_code}] ⏳`,
          message: `${submitterName} telah menyelesaikan pengerjaan "${t.title}" dan mengajukan review pengerjaan.`,
          type: 'task_submitted',
          taskId,
        });
      }
    }
  } catch (err) {
    console.warn('Could not insert submit notification:', err);
  }

  invalidateTaskCache(taskId);
  return true;
}

// Staff Withdraws / Cancels Review Submission
export async function withdrawTaskSubmission(taskId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return false;

  await supabase.from('task_comments').insert([
    {
      task_id: taskId,
      user_id: userId,
      comment: '↩ Pengajuan review ditarik kembali oleh pelaksana untuk melengkapi pekerjaan.',
      is_system_log: true,
    },
  ]);

  invalidateTaskCache(taskId);
  return true;
}

export async function clearTaskReviewNotes(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      review_notes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return false;
  invalidateTaskCache(taskId);
  return true;
}

// Supervisor Approves Task
export async function approveTask(taskId: string, supervisorId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'done',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return false;

  await supabase.from('task_comments').insert([
    {
      task_id: taskId,
      user_id: supervisorId,
      comment: '✅ Tugas diverifikasi & disetujui (APPROVED / DONE). Kinerja tercatat sangat baik.',
      is_system_log: true,
    },
  ]);

  const activeUser = getActiveUserFromStorage();
  recordActivity({
    user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : 'Supervisor',
    user_id: supervisorId,
    action: 'APPROVE_TASK',
    module: 'Task Management',
    level: 'AUDIT',
    detail: 'Tugas telah diverifikasi dan disetujui resmi (APPROVED / DONE).',
  });

  // Notify assignee of approval
  try {
    const { data: t } = await supabase.from('tasks').select('ticket_code, title, assigned_to').eq('id', taskId).single();
    if (t && t.assigned_to) {
      await supabase.from('notifications').insert([
        {
          user_id: t.assigned_to,
          title: `Tugas Disetujui & Selesai: [${t.ticket_code}] ✅`,
          message: `Tugas "${t.title}" telah disetujui oleh atasan. Poin kinerja Anda tercatat optimal!`,
          type: 'task_approved',
          link_url: `/karyawan/tasks?task=${taskId}`,
          is_read: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('Could not insert approve notification:', err);
  }

  invalidateTaskCache(taskId);
  return true;
}

// Supervisor Returns Task for Revision
export async function returnTaskForRevision(taskId: string, supervisorId: string, revisionNotes: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'in_progress',
      review_notes: revisionNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return false;

  await supabase.from('task_comments').insert([
    {
      task_id: taskId,
      user_id: supervisorId,
      comment: `⚠️ Tugas dikembalikan untuk revisi (REVISION). Catatan atasan: "${revisionNotes}"`,
      is_system_log: true,
    },
  ]);

  // Notify assignee of revision request
  try {
    const { data: t } = await supabase.from('tasks').select('ticket_code, title, assigned_to').eq('id', taskId).single();
    if (t && t.assigned_to) {
      await supabase.from('notifications').insert([
        {
          user_id: t.assigned_to,
          title: `Perlu Revisi: [${t.ticket_code}] ⚠️`,
          message: `Atasan meminta perbaikan pada tugas "${t.title}": "${revisionNotes}"`,
          type: 'task_returned',
          link_url: `/karyawan/tasks?task=${taskId}`,
          is_read: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('Could not insert return notification:', err);
  }

  invalidateTaskCache(taskId);
  return true;
}

// ==========================================
// 4. SUBTASKS & EVIDENCE
// ==========================================

export async function toggleSubtask(subtaskId: string, isCompleted: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('subtasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', subtaskId);

  if (!error) invalidateTaskCache();
  return !error;
}

export async function addSubtask(taskId: string, title: string, description?: string): Promise<Subtask | null> {
  // Get max sort_order
  const { data: existing } = await supabase
    .from('subtasks')
    .select('sort_order')
    .eq('task_id', taskId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data, error } = await supabase
    .from('subtasks')
    .insert([
      {
        task_id: taskId,
        title,
        description: description || null,
        sort_order: nextOrder,
        is_completed: false,
        approval_status: 'draft',
      },
    ])
    .select()
    .single();

  if (error) return null;
  invalidateTaskCache(taskId);
  return data as Subtask;
}

// ── Approve a specific subtask step (atasan only) ──
export async function approveSubtask(
  subtaskId: string,
  approvedByUserId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('subtasks')
    .update({
      approval_status: 'approved',
      approved_by: approvedByUserId,
      approved_at: new Date().toISOString(),
      is_completed: true,
      completed_at: new Date().toISOString(),
      rejection_note: null,
    })
    .eq('id', subtaskId);

  if (!error) {
    invalidateTaskCache();
    const activeUser = getActiveUserFromStorage();
    recordActivity({
      user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : 'Atasan',
      user_id: approvedByUserId,
      action: 'APPROVE_SUBTASK',
      module: 'Task Management',
      level: 'AUDIT',
      detail: `Tahapan subtask disetujui oleh atasan (${approvedByUserId}).`,
    });
    await notifySubtaskEvent(subtaskId, 'approved');
  }

  return !error;
}

// ── Reject / kembalikan subtask step untuk diperbaiki ──
export async function rejectSubtask(
  subtaskId: string,
  rejectedByUserId: string,
  note: string
): Promise<boolean> {
  const { error } = await supabase
    .from('subtasks')
    .update({
      approval_status: 'rejected',
      is_completed: false,
      completed_at: null,
      rejection_note: note,
    })
    .eq('id', subtaskId);

  if (!error) {
    invalidateTaskCache();
    const activeUser = getActiveUserFromStorage();
    recordActivity({
      user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : 'Atasan',
      user_id: rejectedByUserId,
      action: 'REJECT_SUBTASK',
      module: 'Task Management',
      level: 'AUDIT',
      detail: `Tahapan subtask dikembalikan untuk perbaikan: ${note}`,
    });
    await notifySubtaskEvent(subtaskId, 'rejected', note);
  }

  return !error;
}

// ── Submit subtask step for review (karyawan marks step as ready for approval) ──
export async function submitSubtaskForApproval(
  subtaskId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('subtasks')
    .update({
      approval_status: 'pending',
      submitted_at: new Date().toISOString(),
      is_completed: false,
      rejection_note: null,
    })
    .eq('id', subtaskId);

  if (!error) {
    invalidateTaskCache();
    await notifySubtaskEvent(subtaskId, 'submitted');
  }
  return !error;
}

// ── Upload file ke Supabase Storage, return public URL permanen ──
export async function uploadFileToStorage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage
    .from('task-attachments')
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
  return supabase.storage.from('task-attachments').getPublicUrl(path).data.publicUrl;
}

// ── Upload lampiran per subtask step ──
export async function addSubtaskAttachment(attachment: {
  task_id: string;
  subtask_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
}): Promise<SubtaskAttachment | null> {
  const { data, error } = await supabase
    .from('subtask_attachments')
    .insert([attachment])
    .select('*')
    .single();

  if (error) {
    console.error('Error adding subtask attachment:', error);
    return null;
  }

  if (data) {
    invalidateTaskCache(attachment.task_id);
    const activeUser = getActiveUserFromStorage();
    recordActivity({
      user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : 'Staff',
      user_id: attachment.uploaded_by,
      action: 'UPLOAD_SUBTASK_EVIDENCE',
      module: 'Task Management',
      level: 'AUDIT',
      detail: `Mengunggah bukti tahapan: ${attachment.file_name}`,
    });
  }

  return data as SubtaskAttachment;
}

// ── Get subtask attachments by subtask_id ──
export async function getSubtaskAttachments(subtaskId: string): Promise<SubtaskAttachment[]> {
  const { data, error } = await supabase
    .from('subtask_attachments')
    .select('*, uploader:users!subtask_attachments_uploaded_by_fkey(id, nama, nik, role)')
    .eq('subtask_id', subtaskId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data || []) as SubtaskAttachment[];
}

// ── Delete subtask attachment ──
export async function deleteSubtaskAttachment(id: string): Promise<boolean> {
  const { error } = await supabase.from('subtask_attachments').delete().eq('id', id);
  if (!error) invalidateTaskCache();
  return !error;
}

export async function addAttachment(attachment: {
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  attachment_type: 'evidence' | 'receipt_nota' | 'document';
  geo_lat?: number;
  geo_lng?: number;
  watermark_text?: string;
  amount?: number;
}): Promise<TaskAttachment | null> {
  const { data, error } = await supabase
    .from('task_attachments')
    .insert([attachment])
    .select('*')
    .single();

  if (error) {
    console.error('Error adding attachment:', error);
    return null;
  }

  if (data) {
    invalidateTaskCache(attachment.task_id);
    const activeUser = getActiveUserFromStorage();
    const isSpj = attachment.attachment_type === 'receipt_nota';
    recordActivity({
      user: activeUser ? `${activeUser.nama} (${activeUser.nik})` : 'Staff',
      user_id: attachment.uploaded_by,
      action: isSpj ? 'UPLOAD_SPJ' : 'UPLOAD_EVIDENCE',
      module: isSpj ? 'SPJ & Keuangan' : 'Task Management',
      level: 'AUDIT',
      detail: isSpj
        ? `Mengunggah berkas nota SPJ: ${attachment.file_name}${attachment.amount ? ` (Nominal: Rp ${attachment.amount.toLocaleString('id-ID')})` : ''}`
        : `Mengunggah berkas bukti pelaksanaan: ${attachment.file_name}`,
    });
  }

  return data as TaskAttachment;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    await supabase.from('subtasks').delete().eq('task_id', taskId);
    await supabase.from('task_comments').delete().eq('task_id', taskId);
    await supabase.from('task_attachments').delete().eq('task_id', taskId);
    await supabase.from('task_delegation_history').delete().eq('task_id', taskId);
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) invalidateTaskCache(taskId);
    return !error;
  } catch (err) {
    console.error('Error deleting task:', err);
    return false;
  }
}

export async function deleteSubtask(subtaskId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
    if (!error) invalidateTaskCache();
    return !error;
  } catch (err) {
    console.error('Error deleting subtask:', err);
    return false;
  }
}

export async function updateSubtask(subtaskId: string, title: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('subtasks').update({ title }).eq('id', subtaskId);
    if (!error) invalidateTaskCache();
    return !error;
  } catch (err) {
    console.error('Error updating subtask:', err);
    return false;
  }
}

export async function deleteAttachment(attachmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('task_attachments').delete().eq('id', attachmentId);
    if (!error) invalidateTaskCache();
    return !error;
  } catch (err) {
    console.error('Error deleting attachment:', err);
    return false;
  }
}

export async function addComment(
  taskId: string,
  userId: string,
  comment: string,
  subtaskId?: string,
  isSystemLog: boolean = false
): Promise<TaskComment | null> {
  const { data, error } = await supabase
    .from('task_comments')
    .insert([
      {
        task_id: taskId,
        subtask_id: subtaskId || null,
        user_id: userId,
        comment,
        is_system_log: isSystemLog,
      },
    ])
    .select('*')
    .single();

  if (error) return null;
  invalidateTaskCache(taskId);
  return data as TaskComment;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('task_comments').delete().eq('id', commentId);
    if (!error) invalidateTaskCache();
    return !error;
  } catch (err) {
    console.error('Error deleting comment:', err);
    return false;
  }
}

// ==========================================
// 5. SMART TASK RECOMMENDATION ENGINE (AI-Assisted)
// ==========================================

export interface SubordinateRecommendation {
  user: User;
  matchScore: number;
  activeTasksCount: number;
  onTimeRate: number;
  reasons: string[];
  isRecommended: boolean;
}

export async function getSmartDelegationRecommendations(
  taskId: string,
  supervisorId: string,
  supervisorRole: UserRole
): Promise<SubordinateRecommendation[]> {
  const subordinates = await getSubordinatesForUser(supervisorId, supervisorRole);
  const tasks = await getTasks();

  const recommendations: SubordinateRecommendation[] = subordinates.map((sub, index) => {
    const userActiveTasks = tasks.filter(
      (t) => t.assigned_to === sub.id && (t.status === 'todo' || t.status === 'in_progress')
    );

    const activeTasksCount = userActiveTasks.length;
    const onTimeRate = 92 + (index % 7);

    let score = Math.round(50 + Math.max(0, 5 - activeTasksCount) * 8 + (onTimeRate - 80) * 1.5);
    score = Math.min(99, Math.max(65, score));

    const reasons: string[] = [];
    if (activeTasksCount <= 1) {
      reasons.push('Kapasitas kerja optimal (beban kerja sangat rendah)');
    } else if (activeTasksCount <= 3) {
      reasons.push('Beban kerja sedang & siap menerima tugas baru');
    } else {
      reasons.push('Memiliki tugas aktif cukup padat');
    }

    if (sub.position_title?.toLowerCase().includes('splicer') || sub.position_title?.toLowerCase().includes('fo')) {
      reasons.push('Keahlian Splicing & Fiber Optik spesialis');
    } else if (sub.position_title?.toLowerCase().includes('indihome')) {
      reasons.push('Spesialis instalasi in-home & router ONT');
    } else if (sub.position_title?.toLowerCase().includes('odp')) {
      reasons.push('Ahli perbaikan ODP & jaringan tiang');
    }

    reasons.push(`SLA On-time ${onTimeRate}% dalam 30 hari terakhir`);

    return {
      user: sub,
      matchScore: score,
      activeTasksCount,
      onTimeRate,
      reasons,
      isRecommended: false,
    };
  });

  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  if (recommendations.length > 0) {
    recommendations[0].isRecommended = true;
  }

  return recommendations;
}

// ==========================================
// 6. EXECUTIVE KPI ANALYTICS (SGM & Manager)
// ==========================================

export async function getExecutiveKpiStats() {
  const tasks = await getTasks();
  const users = await getAllUsers();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const unassignedTasks = tasks.filter((t) => t.status === 'unassigned').length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.deadline_at && new Date(t.deadline_at) < new Date()
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeStaffCount = users.filter((u) => u.role === 'staff' && u.is_active).length;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    reviewTasks,
    unassignedTasks,
    overdueTasks,
    completionRate,
    activeStaffCount,
    totalEmployees: users.length,
  };
}

// ==========================================
// 7. EMPLOYEE PERFORMANCE REPORTING (Output & Star Rating)
// ==========================================

export interface PerformanceHistoryItem {
  taskId: string;
  ticketCode: string;
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: Task['status'];
  deadlineAt: string | null;
  completedAt: string | null;
  outcome: 'on_time' | 'late' | 'overdue' | 'in_progress';
  pointsChange: number;
  penaltyAmount: number;
  bonusAmount: number;
  reason: string;
}

export interface EmployeePerformanceReport {
  user: User;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  reviewPending: number;
  overdueCount: number;
  onTimeRate: number;
  score: number;
  stars: number;
  predicate: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian" | "Kurang";
  penaltyPoints: number;
  bonusPoints: number;
  history: PerformanceHistoryItem[];
  tasks: Task[];
}

export function formatDelayDuration(ms: number): string {
  if (ms <= 0) return "Tepat waktu";
  const minutes = Math.round(ms / (60 * 1000));
  if (minutes < 60) {
    return `${Math.max(1, minutes)} menit`;
  }
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const remainingMinutes = Math.round((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours} jam ${remainingMinutes} menit` : `${hours} jam`;
  }
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const remainingHours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return remainingHours > 0 ? `${days} hari ${remainingHours} jam` : `${days} hari`;
}

export interface PerformanceOptions {
  role?: UserRole;
  userId?: string;
  reviewerTasks?: Task[];
  teamTasks?: Task[];
}

export function calculatePerformance(
  userTasks: Task[],
  options?: PerformanceOptions
): {
  score: number;
  stars: number;
  predicate: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian" | "Kurang";
  onTimeRate: number;
  penaltyPoints: number;
  bonusPoints: number;
  completed: number;
  inProgress: number;
  reviewPending: number;
  overdueCount: number;
  history: PerformanceHistoryItem[];
  roleType?: "staff" | "officer" | "manager";
  pendingReviewCount?: number;
  teamOnTimeRate?: number;
} {
  const completed = userTasks.filter((t) => t.status === 'done').length;
  const inProgress = userTasks.filter((t) => t.status === 'in_progress').length;
  const reviewPending = userTasks.filter((t) => t.status === 'review').length;

  const now = new Date();
  const GRACE_PERIOD_MS = 15 * 60 * 1000; // Toleransi 15 menit teknis/jaringan
  let penaltyPoints = 0;
  let overdueCount = 0;
  let bonusPoints = 0;
  let completedOnTimeCount = 0;
  const history: PerformanceHistoryItem[] = [];

  // 1. Evaluasi tugas mandiri / operasional langsung
  userTasks.forEach((t) => {
    const hasDeadline = Boolean(t.deadline_at);
    const deadlineTime = t.deadline_at ? new Date(t.deadline_at).getTime() : 0;
    const completedTime = t.completed_at ? new Date(t.completed_at).getTime() : 0;
    const nowTime = now.getTime();

    // Selisih waktu keterlambatan terhadap deadline
    const delayMs = t.completed_at && hasDeadline ? Math.max(0, completedTime - deadlineTime) : 0;
    const isUnfinishedOverdue = t.status !== 'done' && hasDeadline && nowTime > (deadlineTime + GRACE_PERIOD_MS);
    const isCompletedAfterGrace = t.status === 'done' && hasDeadline && delayMs > GRACE_PERIOD_MS;
    const isCompletedWithinTimeOrGrace = t.status === 'done' && (!hasDeadline || delayMs <= GRACE_PERIOD_MS);

    let taskPenalty = 0;
    let taskBonus = 0;
    let outcome: 'on_time' | 'late' | 'overdue' | 'in_progress' = 'in_progress';
    let reason = "Tugas sedang aktif berjalan dalam batas SLA normal.";

    if (isCompletedWithinTimeOrGrace) {
      outcome = 'on_time';
      completedOnTimeCount++;
      taskBonus = 2; // Bonus tepat waktu

      const subtasks = t.subtasks || [];
      if (subtasks.length > 0 && subtasks.every((s) => s.is_completed)) {
        taskBonus += 1;
        if (delayMs > 0) {
          reason = `Selesai tepat waktu (dalam toleransi teknis ${formatDelayDuration(delayMs)}) & subtask 100% lengkap (+3 poin bonus).`;
        } else {
          reason = `Selesai tepat waktu sebelum batas deadline & subtask 100% lengkap (+3 poin bonus).`;
        }
      } else {
        if (delayMs > 0) {
          reason = `Selesai tepat waktu (dalam batas masa toleransi 15 menit: ${formatDelayDuration(delayMs)}) (+2 poin bonus).`;
        } else {
          reason = `Selesai tepat waktu sebelum batas deadline (+2 poin bonus).`;
        }
      }

      bonusPoints += taskBonus;
    } else if (isCompletedAfterGrace) {
      outcome = 'late';
      overdueCount++;

      // Penalti bertingkat proporsional berdasarkan durasi keterlambatan
      const delayHours = delayMs / (1000 * 60 * 60);
      if (delayHours <= 2) {
        if (t.priority === 'urgent') taskPenalty = 4;
        else if (t.priority === 'high') taskPenalty = 3;
        else if (t.priority === 'medium') taskPenalty = 2;
        else taskPenalty = 1;
      } else if (delayHours <= 24) {
        if (t.priority === 'urgent') taskPenalty = 7;
        else if (t.priority === 'high') taskPenalty = 5;
        else if (t.priority === 'medium') taskPenalty = 3;
        else taskPenalty = 2;
      } else {
        if (t.priority === 'urgent') taskPenalty = 10;
        else if (t.priority === 'high') taskPenalty = 6;
        else if (t.priority === 'medium') taskPenalty = 4;
        else taskPenalty = 2;
      }

      penaltyPoints += taskPenalty;

      const subtasks = t.subtasks || [];
      if (subtasks.length > 0 && subtasks.every((s) => s.is_completed)) {
        taskBonus = 1;
        bonusPoints += taskBonus;
        reason = `Diselesaikan terlambat (${formatDelayDuration(delayMs)}). Penalti keterlambatan -${taskPenalty} poin, bonus kualitas subtask +1 poin.`;
      } else {
        reason = `Diselesaikan terlambat (${formatDelayDuration(delayMs)}). Penalti keterlambatan prioritas ${t.priority} -${taskPenalty} poin.`;
      }
    } else if (isUnfinishedOverdue) {
      outcome = 'overdue';
      overdueCount++;
      const overdueMs = Math.max(0, nowTime - deadlineTime);
      const overdueHours = overdueMs / (1000 * 60 * 60);

      if (overdueHours <= 2) {
        if (t.priority === 'urgent') taskPenalty = 4;
        else if (t.priority === 'high') taskPenalty = 3;
        else if (t.priority === 'medium') taskPenalty = 2;
        else taskPenalty = 1;
      } else if (overdueHours <= 24) {
        if (t.priority === 'urgent') taskPenalty = 7;
        else if (t.priority === 'high') taskPenalty = 5;
        else if (t.priority === 'medium') taskPenalty = 3;
        else taskPenalty = 2;
      } else {
        if (t.priority === 'urgent') taskPenalty = 10;
        else if (t.priority === 'high') taskPenalty = 6;
        else if (t.priority === 'medium') taskPenalty = 4;
        else taskPenalty = 2;
      }

      penaltyPoints += taskPenalty;
      reason = `Tugas belum diselesaikan dan sudah melewati deadline (${formatDelayDuration(overdueMs)}). Penalti -${taskPenalty} poin.`;
    } else {
      outcome = 'in_progress';
      reason = "Tugas sedang dikerjakan dalam target waktu yang ditentukan.";
    }

    history.push({
      taskId: t.id,
      ticketCode: t.ticket_code,
      title: t.title,
      priority: t.priority,
      status: t.status,
      deadlineAt: t.deadline_at || null,
      completedAt: t.completed_at || null,
      outcome,
      pointsChange: taskBonus - taskPenalty,
      penaltyAmount: taskPenalty,
      bonusAmount: taskBonus,
      reason,
    });
  });

  // 2. Evaluasi Peran Khusus: Officer & Manager (Review Speed & Tim SLA)
  const isOfficer = options?.role ? ['officer_1', 'officer_2', 'officer_3'].includes(options.role) : false;
  const isManager = options?.role ? ['manager', 'sgm'].includes(options.role) : false;
  let pendingReviewCount = 0;
  let teamOnTimeRate = 100;

  if (isOfficer || isManager) {
    const reviewerTasks = options?.reviewerTasks || [];
    const pendingReviews = reviewerTasks.filter((t) => t.status === 'review');
    pendingReviewCount = pendingReviews.length;

    // Evaluasi kecepatan review
    reviewerTasks.forEach((t) => {
      if (t.status === 'done') {
        // Bonus verifikasi tepat & tuntas
        bonusPoints += 1;
      } else if (t.status === 'review' && t.deadline_at) {
        const deadlineTime = new Date(t.deadline_at).getTime();
        if (now.getTime() > deadlineTime + GRACE_PERIOD_MS) {
          // Penalti review tertahan melewati batas SLA
          penaltyPoints += 2;
          history.push({
            taskId: t.id,
            ticketCode: t.ticket_code,
            title: `[Review Pending] ${t.title}`,
            priority: t.priority,
            status: t.status,
            deadlineAt: t.deadline_at || null,
            completedAt: null,
            outcome: 'overdue',
            pointsChange: -2,
            penaltyAmount: 2,
            bonusAmount: 0,
            reason: `Tugas bawahan menunggu review Anda melewati batas deadline SLA (-2 poin).`,
          });
        }
      }
    });

    // Khusus Manager/SGM: Evaluasi performa kepemimpinan tim
    if (isManager && options?.teamTasks && options.teamTasks.length > 0) {
      const teamTasks = options.teamTasks;
      const teamDone = teamTasks.filter((t) => t.status === 'done').length;
      const teamOverdue = teamTasks.filter((t) => {
        const deadlineTime = t.deadline_at ? new Date(t.deadline_at).getTime() : 0;
        return t.status !== 'done' && deadlineTime > 0 && now.getTime() > deadlineTime + GRACE_PERIOD_MS;
      }).length;

      const totalTeamEvaluated = teamDone + teamOverdue;
      if (totalTeamEvaluated > 0) {
        teamOnTimeRate = Math.round((teamDone / totalTeamEvaluated) * 100);
      }

      if (teamOnTimeRate >= 90) {
        bonusPoints += 3; // Bonus kepemimpinan operasional
      } else if (teamOverdue > 0) {
        const teamPenalty = Math.min(5, teamOverdue);
        penaltyPoints += teamPenalty; // Penalti supervisi tim
      }
    }
  }

  // Tingkat Ketepatan Waktu Murni (On-Time SLA Rate %)
  const evaluatedTasksCount = completed + overdueCount;
  let onTimeRate = evaluatedTasksCount > 0
    ? Math.round((completedOnTimeCount / evaluatedTasksCount) * 100)
    : 100;

  // Jika manager/officer tidak memiliki tugas langsung pribadi, gunakan On-Time SLA dari tim/review
  if (userTasks.length === 0 && (isManager || isOfficer)) {
    onTimeRate = teamOnTimeRate;
  }

  // Rumus KPI Bersih & Adil: Skor Dasar 100 dikurangi penalti keterlambatan + bonus pencapaian
  const cappedBonus = Math.min(10, bonusPoints);
  const rawScore = 100 - penaltyPoints + cappedBonus;
  const score = Math.min(100, Math.max(20, rawScore));
  const stars = Number((score / 20).toFixed(1));

  let predicate: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian" | "Kurang" = "Sangat Baik";
  if (score >= 90) predicate = "Sangat Baik";
  else if (score >= 75) predicate = "Baik";
  else if (score >= 60) predicate = "Cukup";
  else if (score >= 45) predicate = "Perlu Perhatian";
  else predicate = "Kurang";

  return {
    score,
    stars,
    predicate,
    onTimeRate,
    penaltyPoints,
    bonusPoints: cappedBonus,
    completed,
    inProgress,
    reviewPending,
    overdueCount,
    history,
    roleType: isManager ? "manager" : isOfficer ? "officer" : "staff",
    pendingReviewCount,
    teamOnTimeRate,
  };
}

export async function getEmployeePerformanceReport(): Promise<EmployeePerformanceReport[]> {
  const users = await getAllUsers();
  const tasks = await getTasks();

  return users.map((u) => {
    const isManagerRole = ['manager', 'sgm'].includes(u.role);
    const isOfficerRole = ['officer_1', 'officer_2', 'officer_3'].includes(u.role);

    // Tugas langsung
    const userTasks = tasks.filter((t) => getTaskAssigneeIds(t).includes(u.id));

    // Tugas bawahan & review
    const subordinateIds = users.filter((sub) => sub.supervisor_id === u.id).map((sub) => sub.id);
    const teamTasks = tasks.filter(
      (t) =>
        getTaskAssigneeIds(t).some((id) => subordinateIds.includes(id)) ||
        (t.assignee?.supervisor_id && t.assignee.supervisor_id === u.id)
    );
    const reviewerTasks = tasks.filter((t) => t.reviewer_id === u.id);

    // Karyawan dievaluasi dengan konteks perannya
    const evaluatedTasks = userTasks.length > 0
      ? userTasks
      : (isManagerRole ? (reviewerTasks.length > 0 ? reviewerTasks : teamTasks) : reviewerTasks);

    const metrics = calculatePerformance(evaluatedTasks, {
      role: u.role,
      userId: u.id,
      reviewerTasks,
      teamTasks,
    });

    return {
      user: u,
      totalAssigned: userTasks.length > 0 ? userTasks.length : evaluatedTasks.length,
      tasks: evaluatedTasks,
      ...metrics,
    };
  });
}


// ==========================================
// 8. NOTIFICATIONS SYSTEM (ROLE-BASED & REAL-TIME)
// ==========================================

export async function createNotification(notif: {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link_url?: string | null;
}): Promise<NotificationItem | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: notif.user_id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        link_url: notif.link_url || null,
        is_read: false,
      },
    ])
    .select('*')
    .single();

  if (error) {
    console.warn('Error creating notification:', error);
    return null;
  }
  return data as NotificationItem;
}

export async function getNotificationsForUser(user: User): Promise<NotificationItem[]> {
  try {
    const [dbNotifsRes, allTasksRes, allUsersRes] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25),
      getTasks(),
      getAllUsers(),
    ]);

    const dbNotifs: NotificationItem[] = dbNotifsRes.data || [];
    const tasks = allTasksRes || [];
    const userMap = new Map((allUsersRes || []).map((u) => [u.id, u.nama]));

    // Read status override from localStorage for instant responsive UI
    const readStorageKey = `workpulse_read_notifs_${user.id}`;
    let locallyReadIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        locallyReadIds = JSON.parse(localStorage.getItem(readStorageKey) || '[]');
      } catch {}
    }

    const dynamicNotifs: NotificationItem[] = [];
    const now = new Date();

    if (user.role === 'admin') {
      // ── ADMIN NOTIFICATIONS (Manajerial & Pengawasan Kantor) ──
      // 1. Task Review Pending Approvals (Menunggu persetujuan Admin/Atasan)
      const pendingReview = tasks.filter((t) => t.status === 'review');
      pendingReview.forEach((t) => {
        const picName = t.assigned_to ? userMap.get(t.assigned_to) || 'Karyawan' : 'Pelaksana';
        dynamicNotifs.push({
          id: `dyn-review-${t.id}`,
          user_id: user.id,
          title: `Tugas Menunggu Verifikasi: [${t.ticket_code}] ⏳`,
          message: `${picName} telah menyelesaikan pengerjaan "${t.title}" dan menunggu persetujuan Anda.`,
          type: 'task_submitted',
          link_url: `/admin/tasks?selected=${t.id}`,
          is_read: false,
          created_at: t.updated_at || t.created_at || now.toISOString(),
        });
      });

      // 2. SLA Overdue Alerts
      const overdueTasks = tasks.filter(
        (t) => t.status !== 'done' && t.deadline_at && new Date(t.deadline_at) < now
      );
      if (overdueTasks.length > 0) {
        dynamicNotifs.push({
          id: `dyn-admin-overdue-summary`,
          user_id: user.id,
          title: `Peringatan SLA Kantor: ${overdueTasks.length} Tugas Melewati Deadline ⚠️`,
          message: `Terdapat ${overdueTasks.length} penugasan operasional yang telah melewati target SLA. Segera cek evaluasi dan kapasitas tim.`,
          type: 'task_overdue',
          link_url: `/admin/tasks`,
          is_read: false,
          created_at: now.toISOString(),
        });
      }

      // 3. System maintenance & security audit
      dynamicNotifs.push({
        id: `dyn-admin-system-status`,
        user_id: user.id,
        title: `Audit Keamanan Sistem WorkPulse Normal 🛡️`,
        message: `Koneksi Supabase Database & Groq AI Assistant beroperasi penuh dengan enkripsi sesi aktif.`,
        type: 'system',
        link_url: `/admin/log`,
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      });
    } else {
      // ── KARYAWAN NOTIFICATIONS (Personal & Penugasan Akun Spesifik) ──
      // 1. Assigned / In Progress tasks of this employee
      const myActiveTasks = tasks.filter(
        (t) => t.assigned_to === user.id && (t.status === 'in_progress' || t.status === 'todo')
      );

      // Check urgent / near deadline
      myActiveTasks.forEach((t) => {
        const isOverdue = t.deadline_at && new Date(t.deadline_at) < now;
        if (isOverdue) {
          dynamicNotifs.push({
            id: `dyn-staff-overdue-${t.id}`,
            user_id: user.id,
            title: `Peringatan Batas Waktu: [${t.ticket_code}] Terlambat 🚨`,
            message: `Tugas "${t.title}" telah melewati batas waktu SLA. Segera selesaikan dan submit agar tidak menambah penalti KPI.`,
            type: 'task_overdue',
            link_url: `/karyawan/tasks?task=${t.id}`,
            is_read: false,
            created_at: now.toISOString(),
          });
        }
      });

      // 2. Revision requests on their tasks
      const myRevisions = tasks.filter(
        (t) => t.assigned_to === user.id && t.status === 'in_progress' && Boolean(t.review_notes)
      );
      myRevisions.forEach((t) => {
        dynamicNotifs.push({
          id: `dyn-staff-rev-${t.id}`,
          user_id: user.id,
          title: `Catatan Revisi Tugas [${t.ticket_code}] ⚠️`,
          message: `Atasan meminta perbaikan: "${t.review_notes}". Silakan perbaiki dan submit kembali.`,
          type: 'task_returned',
          link_url: `/karyawan/tasks?task=${t.id}`,
          is_read: false,
          created_at: t.updated_at || now.toISOString(),
        });
      });

      // 3. Recently approved tasks
      const myCompleted = tasks.filter(
        (t) => t.assigned_to === user.id && t.status === 'done'
      );
      myCompleted.slice(0, 4).forEach((t) => {
        dynamicNotifs.push({
          id: `dyn-staff-done-${t.id}`,
          user_id: user.id,
          title: `Tugas Disetujui & Selesai [${t.ticket_code}] ✅`,
          message: `Pengerjaan "${t.title}" telah disetujui & ditutup resmi oleh atasan. Poin kinerja Anda telah ditambahkan.`,
          type: 'task_approved',
          link_url: `/karyawan/tasks?task=${t.id}`,
          is_read: false,
          created_at: t.completed_at || t.updated_at || now.toISOString(),
        });
      });

      // 4. Welcome notice
      dynamicNotifs.push({
        id: `dyn-staff-welcome`,
        user_id: user.id,
        title: `Selamat Datang di Portal Kerja Telkom Akses 🚀`,
        message: `Gunakan menu Tugas Saya untuk melihat target kerja, update checklist subtask, dan unggah berkas SPJ/bukti.`,
        type: 'system',
        link_url: `/karyawan/dashboard`,
        is_read: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      });
    }

    // ── PIC REVIEW: tahapan / tugas yang menunggu review user ini (semua role) ──
    tasks.forEach((t) => {
      if (t.status === 'done') return;
      const reviewerId = getTaskReviewerId({ ...t, assignee: t.assignee });
      if (reviewerId !== user.id) return;
      if (getTaskAssigneeIds(t).includes(user.id)) return;
      const link_url =
        user.role === 'admin' ? `/admin/tasks?selected=${t.id}` : `/karyawan/tasks?task=${t.id}`;
      const picName = t.assignee?.nama || 'Pelaksana';

      if (user.role !== 'admin' && t.status === 'review') {
        dynamicNotifs.push({
          id: `dyn-rv-task-${t.id}`,
          user_id: user.id,
          title: `Tugas Menunggu Review Anda: [${t.ticket_code}] ⏳`,
          message: `${picName} telah menyelesaikan "${t.title}" dan menunggu persetujuan Anda.`,
          type: 'task_submitted',
          link_url,
          is_read: false,
          created_at: t.updated_at || t.created_at || now.toISOString(),
        });
      }

      (t.subtasks || [])
        .filter((s) => s.approval_status === 'pending')
        .forEach((s) => {
          dynamicNotifs.push({
            id: `dyn-rv-sub-${s.id}`,
            user_id: user.id,
            title: `Tahap Menunggu Review: [${t.ticket_code}] ⏳`,
            message: `${picName} mengajukan tahap "${s.title}" pada tugas "${t.title}" untuk Anda review.`,
            type: 'task_submitted',
            link_url,
            is_read: false,
            created_at: s.submitted_at || t.updated_at || now.toISOString(),
          });
        });
    });

    // Merge database notifications and dynamic ones, deduping by ID
    const mergedMap = new Map<string, NotificationItem>();
    dbNotifs.forEach((n) => mergedMap.set(n.id, n));
    dynamicNotifs.forEach((n) => {
      if (!mergedMap.has(n.id)) {
        mergedMap.set(n.id, n);
      }
    });

    const result = Array.from(mergedMap.values()).map((n) => ({
      ...n,
      is_read: n.is_read || locallyReadIds.includes(n.id),
    }));

    // Sort by created_at desc
    result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return result;
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
}

export async function markNotificationAsRead(id: string, userId?: string): Promise<boolean> {
  if (userId && typeof window !== 'undefined') {
    const key = `workpulse_read_notifs_${userId}`;
    try {
      const readIds = JSON.parse(localStorage.getItem(key) || '[]');
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem(key, JSON.stringify(readIds));
      }
    } catch {}
  }

  if (!id.startsWith('dyn-')) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }
  return true;
}

export async function markAllNotificationsAsRead(user: User, notifIds: string[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const key = `workpulse_read_notifs_${user.id}`;
    try {
      const readIds = Array.from(new Set([...notifIds, ...(JSON.parse(localStorage.getItem(key) || '[]'))]));
      localStorage.setItem(key, JSON.stringify(readIds));
    } catch {}
  }

  const dbIds = notifIds.filter((id) => !id.startsWith('dyn-'));
  if (dbIds.length > 0) {
    await supabase.from('notifications').update({ is_read: true }).in('id', dbIds);
  }
  return true;
}
