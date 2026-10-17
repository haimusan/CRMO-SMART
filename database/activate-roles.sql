-- Role and storage preparation; does not modify live content or relocate existing media.
create table if not exists public.crmo_user_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('viewer','social','registered','client','admin','owner')),
 updated_at timestamptz not null default now()
);
alter table public.crmo_user_roles enable row level security;
revoke all on public.crmo_user_roles from public, anon, authenticated;
grant select on public.crmo_user_roles to authenticated;
create policy crmo_roles_read_self on public.crmo_user_roles for select to authenticated using (user_id=(select auth.uid()));
-- Owner assignments are provisioned separately after explicit confirmation.
insert into storage.buckets(id,name,public) values ('galleries','galleries',true),('our-brands','our-brands',true),('admin','admin',false) on conflict(id) do nothing;
drop policy if exists crmo_site_config_insert_all on public.crmo_site_config;
drop policy if exists crmo_site_config_update_all on public.crmo_site_config;
create policy crmo_content_insert_editor on public.crmo_site_config for insert to authenticated with check(exists(select 1 from public.crmo_user_roles where user_id=(select auth.uid()) and role in ('admin','owner')));
create policy crmo_content_update_editor on public.crmo_site_config for update to authenticated using(exists(select 1 from public.crmo_user_roles where user_id=(select auth.uid()) and role in ('admin','owner'))) with check(exists(select 1 from public.crmo_user_roles where user_id=(select auth.uid()) and role in ('admin','owner')));
drop policy if exists crmo_test_delete_assets on storage.objects;
drop policy if exists crmo_test_insert_assets on storage.objects;
drop policy if exists crmo_test_read_assets on storage.objects;
drop policy if exists crmo_test_update_assets on storage.objects;
create policy crmo_storage_read on storage.objects for select to anon,authenticated using(bucket_id in ('assets','galleries','our-brands') or (bucket_id='admin' and exists(select 1 from public.crmo_user_roles where user_id=(select auth.uid()) and role in ('admin','owner'))));
create policy crmo_storage_insert_editor on storage.objects for insert to authenticated with check(bucket_id in ('assets','galleries','our-brands','admin') and exists(select 1 from public.crmo_user_roles where user_id=(select auth.uid()) and role in ('admin','owner')));
create policy crmo_storage_update_editor on storage.objects for update to authenticated using(bucket_id in ('assets','galleries','our-brands','admin') and exists(select 1 from public.crmo_user_roles where user_id=(select auth.uid()) and role in ('admin','owner'))) with check(bucket_id in ('assets','galleries','our-brands','admin') and exists(select 1 from public.crmo_user_roles where user_id=(select auth.uid()) and role in ('admin','owner')));
-- No DELETE permission is granted to the new editor policies.
