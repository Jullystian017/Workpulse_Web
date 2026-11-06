/*  */-- ==============================================================================
-- SKRIP BASIS DATA LENGKAP: WORKPULSE WEB (PT TELKOM AKSES)
-- DBMS: PostgreSQL / Supabase
-- Tanggal Dibuat: 2026-11-05
-- Deskripsi: File skema tabel, tipe enum, relasi foreign key, dan data awal (seeding)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPE DATA ENUM
CREATE TYPE user_role AS ENUM (
  'staff',
  'officer_1',
  'officer_2',
  'officer_3',
  'manager',
  'sgm',
  'admin'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE task_status AS ENUM (
  'unassigned',
  'todo',
  'in_progress',
  'review',
  'done'
);

CREATE TYPE subtask_approval_status AS ENUM (
  'draft',
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE attachment_type AS ENUM (
  'evidence',
  'receipt_nota',
  'document'
);

CREATE TYPE notification_type AS ENUM (
  'task_assigned',
  'task_delegated',
  'task_submitted',
  'task_approved',
  'task_returned',
  'task_overdue',
  'system'
);

-- ==============================================================================
-- 3. PEMBUATAN TABEL-TABEL UTAMA
-- ==============================================================================

-- Tabel 1: departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 2: channels (Kategori di bawah departemen)
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 3: users (Karyawan & Rantai Komando)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nik VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Self-referencing FK
  avatar_url TEXT,
  phone VARCHAR(50),
  position_title VARCHAR(255),
  sub_unit VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 4: tasks (Penugasan & Tiket Kerja)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'unassigned',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  secondary_assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assignee_ids TEXT[], -- Array UUID PIC
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  delegated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  delegated_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours NUMERIC(6,2) DEFAULT 0,
  actual_hours NUMERIC(6,2),
  location_name VARCHAR(255),
  location_coordinates VARCHAR(100),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 5: subtasks (Tahapan Pengerjaan Checklist)
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  approval_status subtask_approval_status DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 6: task_attachments (File Bukti Pelaksanaan & Nota SPJ)
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES subtasks(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  attachment_type attachment_type NOT NULL DEFAULT 'evidence',
  file_size_bytes BIGINT,
  geo_lat DOUBLE PRECISION,
  geo_lng DOUBLE PRECISION,
  watermark_text TEXT,
  amount NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 7: subtask_attachments (Bukti Khusus Per-Subtask)
CREATE TABLE IF NOT EXISTS subtask_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subtask_id UUID NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 8: task_comments (Diskusi & Audit Log Sistem)
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES subtasks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  is_system_log BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 9: task_delegation_history (Audit Trail Delegasi Tiket)
CREATE TABLE IF NOT EXISTS task_delegation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  match_score NUMERIC(5,2),
  delegated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 10: notifications (Notifikasi Personil)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CONTOH DATA AWAL (SEEDING DATA)
-- ==============================================================================

-- Insert Departemen
INSERT INTO departments (id, name, code, description) VALUES
('11111111-1111-4111-8111-111111111111', 'Operasi & Pemeliharaan Jaringan', 'OP-NET', 'Divisi teknis pemeliharaan kabel fiber optik & infrastruktur OLT'),
('22222222-2222-4222-8222-222222222222', 'Konstruksi & Deploy Jaringan', 'CONST-DEPLOY', 'Divisi penggelaran instalasi kabel fiber optik baru & site modernisasi');

-- Insert Kategori (Channels)
INSERT INTO channels (id, department_id, name, slug, description, icon) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Maintenance OLT & Sentral', 'maintenance-olt', 'Pemeliharaan rutin perangkat OLT & sentral Telkom', 'ServerIcon'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Instalasi Fiber Optik B2B', 'instalasi-fo-b2b', 'Penyambungan & aktivasi kabel pelanggan korporat', 'ZapIcon');

-- Insert Akun User Sesuai Jenjang Hierarki
INSERT INTO users (id, nik, nama, email, password, role, department_id, supervisor_id, position_title) VALUES
('55555555-5555-4555-8555-111111111111', 'ADM001', 'Super Admin IT', 'admin@telkomakses.co.id', 'admin123', 'admin', '11111111-1111-4111-8111-111111111111', NULL, 'System Administrator'),
('66666666-6666-4666-8666-222222222222', 'MGR001', 'Budi Santoso', 'manager.ops@telkomakses.co.id', 'manager123', 'manager', '11111111-1111-4111-8111-111111111111', NULL, 'Manager Operasional Jaringan'),
('77777777-7777-4777-8777-333333333333', 'OFC001', 'Rian Hidayat', 'officer1@telkomakses.co.id', 'officer123', 'officer_1', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-222222222222', 'Officer 1 Pengawasan Lapangan'),
('88888888-8888-4888-8888-444444444444', 'STF001', 'Ahmad Fadillah', 'ahmad.fadillah@telkomakses.co.id', 'staff123', 'staff', '11111111-1111-4111-8111-111111111111', '77777777-7777-4777-8777-333333333333', 'Teknisi Lapangan Staff');

-- Insert Contoh Task
INSERT INTO tasks (
  id, ticket_code, title, description, channel_id, department_id, priority, status, created_by, assigned_to, reviewer_id, deadline_at, location_name
) VALUES (
  '99999999-9999-4999-8999-555555555555',
  'WP-2026-001',
  'Perbaikan Putus Kabel FO Feeder Titik BDG-04',
  'Terjadi redaman tinggi pada kabel feeder utama. Diperlukan splicing ulang.',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'urgent',
  'in_progress',
  '77777777-7777-4777-8777-333333333333',
  '88888888-8888-4888-8888-444444444444',
  '77777777-7777-4777-8777-333333333333',
  NOW() + INTERVAL '1 day',
  'Jl. Gegerkalong Hilir No. 47, Bandung'
);

