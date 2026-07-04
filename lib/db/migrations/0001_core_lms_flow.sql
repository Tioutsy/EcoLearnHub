ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS invitation_status text NOT NULL DEFAULT 'not_invited',
  ADD COLUMN IF NOT EXISTS invitation_token text,
  ADD COLUMN IF NOT EXISTS invitation_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS invitation_accepted_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS employees_invitation_token_unique
  ON employees (invitation_token)
  WHERE invitation_token IS NOT NULL;

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS company_id integer,
  ADD COLUMN IF NOT EXISTS employee_id integer,
  ADD COLUMN IF NOT EXISTS assigned_by_user_id text,
  ADD COLUMN IF NOT EXISTS assignment_source text NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS due_date timestamptz;

CREATE INDEX IF NOT EXISTS enrollments_company_employee_course_idx
  ON enrollments (company_id, employee_id, course_id);

CREATE INDEX IF NOT EXISTS enrollments_due_date_idx
  ON enrollments (due_date);

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS company_id integer,
  ADD COLUMN IF NOT EXISTS employee_id integer;

CREATE INDEX IF NOT EXISTS certificates_company_employee_course_idx
  ON certificates (company_id, employee_id, course_id);
