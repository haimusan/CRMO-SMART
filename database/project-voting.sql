-- Applied as Supabase migration project_voting_social_accounts.
create table public.crmo_project_votes (
 project_id text not null check(length(project_id) between 1 and 160),
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(project_id,user_id)
);
create index crmo_project_votes_user_idx on public.crmo_project_votes(user_id);
create table public.crmo_project_vote_totals (
 project_id text primary key, vote_count bigint not null default 0 check(vote_count>=0),
 updated_at timestamptz not null default now()
);
alter table public.crmo_project_votes enable row level security;
alter table public.crmo_project_vote_totals enable row level security;
revoke all on public.crmo_project_votes from public,anon,authenticated;
revoke all on public.crmo_project_vote_totals from public,anon,authenticated;
grant select,delete on public.crmo_project_votes to authenticated;
grant insert(project_id,user_id) on public.crmo_project_votes to authenticated;
grant select on public.crmo_project_vote_totals to anon,authenticated;
create policy "Read own votes or admin report" on public.crmo_project_votes for select to authenticated using (
 user_id=(select auth.uid()) or exists(select 1 from public.crmo_user_roles r where r.user_id=(select auth.uid()) and r.role in ('admin','owner'))
);
create policy "Social account votes for visible projects" on public.crmo_project_votes for insert to authenticated with check (
 user_id=(select auth.uid()) and (
 (select auth.jwt()->'app_metadata'->>'provider') in ('google','facebook','linkedin','linkedin_oidc')
 or (select auth.jwt()->'app_metadata'->'providers') ?| array['google','facebook','linkedin','linkedin_oidc']
 ) and exists (
 select 1 from public.crmo_site_config c cross join lateral jsonb_array_elements(c.payload->'galleries') g
 cross join lateral jsonb_array_elements(g->'tiles') t where c.key='main__multi_gallery_demo'
 and g->>'galleryId'<>'our-brands' and g->'meta'->>'visible' is distinct from 'false'
 and t->>'isVisible' is distinct from 'false' and t->>'tileId'=project_id
 and jsonb_array_length(coalesce(t->'media','[]'::jsonb))>0
 )
);
create policy "Remove own vote" on public.crmo_project_votes for delete to authenticated using(user_id=(select auth.uid()));
create policy "Read aggregate counts" on public.crmo_project_vote_totals for select to anon,authenticated using(true);
create schema if not exists crmo_private;
create function crmo_private.update_project_vote_total() returns trigger
language plpgsql security definer set search_path=pg_catalog as $$
begin
 if auth.uid() is not null and auth.uid() is distinct from coalesce(new.user_id,old.user_id) then raise exception 'Cannot change another account vote' using errcode='42501';end if;
 if tg_op='INSERT' then
 insert into public.crmo_project_vote_totals(project_id,vote_count,updated_at) values(new.project_id,1,clock_timestamp())
 on conflict(project_id) do update set vote_count=public.crmo_project_vote_totals.vote_count+1,updated_at=clock_timestamp();return new;
 elsif tg_op='DELETE' then
 update public.crmo_project_vote_totals set vote_count=greatest(0,vote_count-1),updated_at=clock_timestamp() where project_id=old.project_id;return old;
 end if;return null;
end;
$$;
revoke all on function crmo_private.update_project_vote_total() from public,anon,authenticated;
create trigger project_vote_count after insert or delete on public.crmo_project_votes for each row execute function crmo_private.update_project_vote_total();
