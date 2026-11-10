-- Moasist HR core: server-authoritative dataset, credentials and sessions.
--
-- The app's HR data lives server-side (never shipped in the client bundle).
-- `hr_dataset` holds the whole HR document as one JSONB row; reads are filtered
-- by role and writes are role-checked in `src/lib/hr/*.server.ts`.
--
-- Credentials are kept OUT of the dataset blob: `hr_credential` stores only
-- hashes (scrypt), never plaintext PINs or passwords.

create table if not exists hr_dataset (
  id integer primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists hr_credential (
  login text primary key,                 -- DNI for employees, email for the admin
  kind text not null default 'employee',  -- 'employee' | 'admin'
  employee_id text,
  role text not null default 'colaborador',
  email text,
  pin_hash text,
  pin_salt text,
  password_hash text,
  password_salt text,
  must_change boolean not null default true,
  email_verified boolean not null default false,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hr_session (
  token text primary key,
  login text not null,
  kind text not null,
  role text not null,
  employee_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists hr_session_expires_at_idx on hr_session (expires_at);
