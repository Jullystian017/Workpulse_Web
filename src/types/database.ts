export type UserRole =
  | 'staff'
  | 'officer_1'
  | 'officer_2'
  | 'officer_3'
  | 'manager'
  | 'sgm'
  | 'admin';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'unassigned' | 'todo' | 'in_progress' | 'review' | 'done';

export type NotificationType =
  | 'task_assigned'
  | 'task_delegated'
  | 'task_submitted'
  | 'task_approved'
  | 'task_returned'
  | 'task_overdue'
  | 'system';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  created_at?: string;
}

export interface Channel {
  id: string;
  department_id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string;
  created_at?: string;
  department?: Department;
}

export interface User {
  id: string;
  nik: string;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  department_id?: string | null;
  supervisor_id?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  position_title?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  department?: Department;
  supervisor?: User;
  subordinates?: User[];
}

export type SubtaskApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface SubtaskAttachment {
  id: string;
  subtask_id: string;
  task_id: string;
  uploaded_by?: string | null;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number | null;
  created_at?: string;
  uploader?: User;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  completed_at?: string | null;
  created_at?: string;
  // Sequential approval fields
  approval_status?: SubtaskApprovalStatus | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_note?: string | null;
  // Per-subtask attachment (bukti pelaksanaan tahap)
  attachments?: SubtaskAttachment[];
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  subtask_id?: string | null;  // If set, this attachment belongs to a specific subtask step
  uploaded_by?: string | null;
  file_name: string;
  file_url: string;
  file_type?: string;
  attachment_type: 'evidence' | 'receipt_nota' | 'document';
  file_size_bytes?: number | null;
  geo_lat?: number | null;
  geo_lng?: number | null;
  watermark_text?: string | null;
  amount?: number | null;
  created_at?: string;
  uploader?: User;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id?: string | null;
  comment: string;
  is_system_log: boolean;
  created_at?: string;
  user?: User;
}

export interface TaskDelegationHistory {
  id: string;
  task_id: string;
  from_user_id?: string | null;
  to_user_id?: string | null;
  reason?: string | null;
  match_score?: number | null;
  delegated_at?: string;
  from_user?: User;
  to_user?: User;
}

export interface Task {
  id: string;
  ticket_code: string;
  title: string;
  description?: string | null;
  channel_id: string;
  department_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_by?: string | null;
  assigned_to?: string | null;
  delegated_by?: string | null;
  delegated_at?: string | null;
  deadline_at?: string | null;
  completed_at?: string | null;
  estimated_hours?: number;
  actual_hours?: number | null;
  location_name?: string | null;
  location_coordinates?: string | null;
  review_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  channel?: Channel;
  department?: Department;
  creator?: User;
  assignee?: User;
  delegator?: User;
  subtasks?: Subtask[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link_url?: string | null;
  is_read: boolean;
  created_at?: string;
}

export const ROLE_HIERARCHY_LEVEL: Record<UserRole, number> = {
  staff: 1,
  officer_1: 2,
  officer_2: 3,
  officer_3: 4,
  manager: 5,
  sgm: 6,
  admin: 99,
};

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string; color: string }> = {
  staff: { label: 'Staff', badge: 'Staff', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' },
  officer_1: { label: 'Officer 1', badge: 'Officer 1', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400' },
  officer_2: { label: 'Officer 2', badge: 'Officer 2', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400' },
  officer_3: { label: 'Officer 3', badge: 'Officer 3', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400' },
  manager: { label: 'Manager', badge: 'Manager', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400' },
  sgm: { label: 'SGM', badge: 'SGM', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400' },
  admin: { label: 'Superadmin', badge: 'Superadmin', color: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300' },
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: 'Darurat', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400' },
  high: { label: 'Tinggi', color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400' },
  medium: { label: 'Sedang', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400' },
  low: { label: 'Rendah', color: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300' },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, { label: string; color: string }> = {
  unassigned: { label: 'Unassigned Pool', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  todo: { label: 'Ditugaskan (To Do)', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  in_progress: { label: 'Dalam Pengerjaan', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  review: { label: 'Menunggu Review Atasan', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400' },
  done: { label: 'Selesai & Disetujui', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
};

export type TaskItem = Task;
