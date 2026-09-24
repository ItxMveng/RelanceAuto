create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  my_name text not null default '',
  activity text not null default 'en accompagnement bien-être',
  booking_link text not null default '',
  tone text not null default 'warm',
  steps jsonb not null default '[]'::jsonb,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  plan text not null default 'trial',
  sim_offset_minutes integer not null default 0,
  send_mode text not null default 'simulation',
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_pass_enc text,
  smtp_from text,
  capture_slug text not null unique default encode(gen_random_bytes(6), 'hex'),
  webhook_key text not null default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  email text not null,
  message text not null default '',
  source text not null default 'manuel',
  status text not null default 'active',
  unsub_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  booked_at timestamptz
);
create index if not exists leads_account_idx on leads(account_id, created_at desc);
create unique index if not exists leads_account_email_idx on leads(account_id, lower(email));

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  step_index integer not null,
  subject text not null,
  body text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'scheduled',
  delivery text,
  error text
);
create index if not exists messages_due_idx on messages(status, scheduled_at);
create index if not exists messages_lead_idx on messages(lead_id, step_index);

create table if not exists rate_limits (
  key text primary key,
  hits integer not null,
  window_start timestamptz not null default now()
);

alter table leads add column if not exists notes text not null default '';
alter table accounts add column if not exists send_from_hour integer not null default 8;
alter table accounts add column if not exists send_to_hour integer not null default 20;
alter table accounts add column if not exists onboarding_done boolean not null default false;
create index if not exists messages_account_sent_idx on messages(account_id, sent_at);
