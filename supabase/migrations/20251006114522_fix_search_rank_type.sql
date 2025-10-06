-- Fix type mismatch in search_note_tasks rank column
-- ts_rank_cd returns real, but we declared double precision

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
    coalesce(ts_rank_cd(to_tsvector('english', coalesce(t.text, '')), ts_query), 0)::double precision as rank
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
