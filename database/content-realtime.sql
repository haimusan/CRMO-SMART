-- Content reads and writes retain their existing RLS policies.
do $$ begin
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='crmo_site_config') then
    alter publication supabase_realtime add table public.crmo_site_config;
  end if;
end $$;
