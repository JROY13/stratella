-- Fix type mismatch in search_notes open_tasks column
-- n.open_tasks is numeric but we declared integer

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
      n.open_tasks::integer,
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
    n.open_tasks::integer,
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
    ts_rank_cd(n.search_vector, ts_query)::double precision as rank
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
