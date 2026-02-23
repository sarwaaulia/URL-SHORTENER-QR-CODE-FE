-- Enable RLS
alter table profiles enable row level security;
alter table links enable row level security;
alter table clicks enable row level security;

-- Profiles
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

-- Links
create policy "Users can manage own links"
on links for all
using (auth.uid() = user_id);

-- Clicks (insert only)
create policy "Anyone can insert clicks"
on clicks for insert
with check (true);

-- Allow service role to insert profiles
create policy "Allow service role to insert profiles"
on profiles
for insert
using (auth.role() = 'service_role');

-- Allow publishable key to insert profiles
create policy "Allow signup inserts for owner"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

create policy "Public can read links by short code"
on links
for select
using (true);

create policy "Allow select clicks"
on clicks
for select
using (true);
