-- ============================================================
-- Migration: Subtask Sequential Approval Workflow
-- Description: Adds approval fields to subtasks table and
--              creates a new subtask_attachments table for
--              per-step file evidence.
-- ============================================================

-- 1. Add approval fields to existing `subtasks` table
ALTER TABLE subtasks
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_note TEXT;

-- 2. Create `subtask_attachments` table for per-step file uploads
CREATE TABLE IF NOT EXISTS subtask_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id    UUID NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_type     TEXT,
  file_size_bytes BIGINT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security on subtask_attachments
ALTER TABLE subtask_attachments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Allow all to read subtask_attachments"
  ON subtask_attachments FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert subtask_attachments"
  ON subtask_attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to delete subtask_attachments"
  ON subtask_attachments FOR DELETE
  USING (true);

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_subtask_attachments_subtask_id
  ON subtask_attachments (subtask_id);

CREATE INDEX IF NOT EXISTS idx_subtask_attachments_task_id
  ON subtask_attachments (task_id);
