-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default now()
);

-- LINKS
create table links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  original_url text not null,
  short_code text unique not null,
  click_count integer default 0,
  created_at timestamp with time zone default now()
);

-- CLICKS (for analytics)
create table clicks (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid references links(id) on delete cascade,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now()
);
