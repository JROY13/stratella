-- Ensure search RPC functions are accessible to PostgREST clients
grant execute on function public.search_notes(
  uuid,
  text,
  integer,
  integer,
  text
) to authenticated, anon;

grant execute on function public.search_note_tasks(
  uuid,
  text,
  integer,
  integer,
  text,
  text,
  uuid,
  text,
  text
) to authenticated, anon;

-- Refresh PostgREST schema cache so the new grants take effect immediately
notify pgrst, 'reload schema';
