create table if not exists fan_board (
  user_id text primary key,
  name text not null,
  results text not null,
  updated_at timestamptz not null default now()
);
