-- Ensure search RPCs enforce the caller's authenticated user
-- by switching them to use auth.uid() instead of an explicit
-- p_user_id parameter.

-- Drop the previous function definitions that accepted a user id argument.
drop function if exists public.search_note_tasks(
  uuid,
  text,
  integer,
  integer,
  text,
  text,
  uuid,
  text,
  text
);

drop function if exists public.search_notes(
  uuid,
  text,
  integer,
  integer,
  text
);

-- Recreate search_notes enforcing auth.uid().
create or replace function public.search_notes(
  p_query text default null,
  p_limit integer default 20,
  p_offset integer default 0,
  p_sort text default 'newest'
)
returns table (
  id uuid,
  title text,
  updated_at timestamptz,
  open_tasks integer,
  highlight_title text,
  highlight_body text,
  rank double precision
)
language plpgsql
stable
as $$
declare
  ts_query tsquery;
  order_direction text := case when p_sort = 'oldest' then 'asc' else 'desc' end;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'search_notes must be called with an authenticated user';
  end if;

  if p_query is not null and btrim(p_query) <> '' then
    ts_query := websearch_to_tsquery('english', p_query);
  else
    ts_query := null;
  end if;

  if ts_query is null then
    return query
    select
      n.id,
      n.title,
      n.updated_at,
      n.open_tasks,
      null::text as highlight_title,
      null::text as highlight_body,
      0::double precision as rank
    from public.notes n
    where n.user_id = current_user_id
    order by
      case when order_direction = 'asc' then n.updated_at end asc,
      case when order_direction = 'desc' then n.updated_at end desc
    limit p_limit offset p_offset;
  end if;

  return query
  select
    n.id,
    n.title,
    n.updated_at,
    n.open_tasks,
    ts_headline(
      'english',
      coalesce(n.title, ''),
      ts_query,
      'StartSel=<mark>,StopSel=</mark>'
    ) as highlight_title,
    ts_headline(
      'english',
      public.strip_html(n.body),
      ts_query,
      'StartSel=<mark>,StopSel=</mark>,HighlightAll=true'
    ) as highlight_body,
    ts_rank_cd(n.search_vector, ts_query) as rank
  from public.notes n
  where n.user_id = current_user_id
    and n.search_vector @@ ts_query
  order by
    ts_rank_cd(n.search_vector, ts_query) desc,
    case when order_direction = 'asc' then n.updated_at end asc,
    case when order_direction = 'desc' then n.updated_at end desc
  limit p_limit offset p_offset;
end;
$$;

-- Recreate search_note_tasks enforcing auth.uid().
create or replace function public.search_note_tasks(
  p_query text default null,
  p_limit integer default 20,
  p_offset integer default 0,
  p_completion text default null,
  p_tag text default null,
  p_note_id uuid default null,
  p_due text default null,
  p_sort text default 'text'
)
returns table (
  note_id uuid,
  line integer,
  text text,
  tags text[],
  due text,
  status text,
  is_completed boolean,
  note_title text,
  note_updated_at timestamptz,
  highlight text,
  rank double precision
)
language plpgsql
stable
as $$
declare
  ts_query tsquery;
  normalized_sort text := coalesce(p_sort, 'text');
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'search_note_tasks must be called with an authenticated user';
  end if;

  if p_query is not null and btrim(p_query) <> '' then
    ts_query := websearch_to_tsquery('english', p_query);
  else
    ts_query := null;
  end if;

  return query
  select
    t.note_id,
    t.line,
    t.text,
    t.tags,
    t.due,
    t.status,
    t.is_completed,
    coalesce(n.title, public.strip_html(n.body)) as note_title,
    n.updated_at,
    case when ts_query is not null then
      ts_headline(
        'english',
        t.text,
        ts_query,
        'StartSel=<mark>,StopSel=</mark>,HighlightAll=true'
      )
    else
      null::text
    end as highlight,
    coalesce(ts_rank_cd(to_tsvector('english', coalesce(t.text, '')), ts_query), 0) as rank
  from public.note_tasks t
  join public.notes n on n.id = t.note_id
  where n.user_id = current_user_id
    and (p_note_id is null or t.note_id = p_note_id)
    and (
      p_completion is null or
      (p_completion = 'open' and t.is_completed = false) or
      (p_completion = 'done' and t.is_completed = true)
    )
    and (p_tag is null or p_tag = any(t.tags))
    and (p_due is null or t.due = p_due)
    and (ts_query is null or to_tsvector('english', coalesce(t.text, '')) @@ ts_query)
  order by
    case when ts_query is not null then coalesce(ts_rank_cd(to_tsvector('english', coalesce(t.text, '')), ts_query), 0) end desc,
    case when normalized_sort = 'due' then t.due end asc,
    case when normalized_sort = 'text' then lower(t.text) end asc,
    n.updated_at desc
  limit p_limit offset p_offset;
end;
$$;

-- Reapply execute permissions for the new signatures.
grant execute on function public.search_notes(
  text,
  integer,
  integer,
  text
) to authenticated, service_role;

grant execute on function public.search_note_tasks(
  text,
  integer,
  integer,
  text,
  text,
  uuid,
  text,
  text
) to authenticated, service_role;
