-- Create extension for unaccent to improve search normalization
create extension if not exists unaccent;

-- Helper function to strip HTML tags and normalize whitespace
create or replace function public.strip_html(input text)
  returns text
  language sql
  immutable
as $$
  select trim(regexp_replace(regexp_replace(coalesce(input, ''), '<[^>]+>', ' ', 'gi'), '\s+', ' ', 'g'))
$$;

-- Ensure notes table has a search_vector column
alter table public.notes
  add column if not exists search_vector tsvector;

-- Trigger function to keep the search_vector column in sync
create or replace function public.notes_search_vector_trigger()
  returns trigger
  language plpgsql
as $$
declare
  body_plain text;
begin
  body_plain := public.strip_html(new.body);
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body_plain, '')), 'B');
  return new;
end;
$$;

-- Attach trigger to notes table
create trigger notes_search_vector_update
  before insert or update on public.notes
  for each row
  execute function public.notes_search_vector_trigger();

-- Backfill existing rows
update public.notes
set search_vector = (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(public.strip_html(body), '')), 'B')
)
where search_vector is null;

-- Create the supporting GIN index
create index if not exists notes_search_vector_idx
  on public.notes using gin(search_vector);

-- Table to persist parsed tasks
create table if not exists public.note_tasks (
  note_id uuid references public.notes(id) on delete cascade,
  line integer not null,
  text text not null,
  tags text[] not null default array[]::text[],
  due text,
  status text,
  is_completed boolean not null default false,
  primary key (note_id, line)
);

-- Expression index to speed up task full-text search
create index if not exists note_tasks_text_search_idx
  on public.note_tasks using gin (to_tsvector('english', coalesce(text, '')));

-- Enable RLS and mirror note ownership
alter table public.note_tasks enable row level security;

create policy "Note tasks are readable by note owners"
  on public.note_tasks for select
  using (
    exists (
      select 1 from public.notes n
      where n.id = note_tasks.note_id
        and n.user_id = auth.uid()
    )
  );

create policy "Note tasks are writable by note owners"
  on public.note_tasks for insert
  with check (
    exists (
      select 1 from public.notes n
      where n.id = note_tasks.note_id
        and n.user_id = auth.uid()
    )
  );

create policy "Note tasks are updatable by note owners"
  on public.note_tasks for update
  using (
    exists (
      select 1 from public.notes n
      where n.id = note_tasks.note_id
        and n.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.notes n
      where n.id = note_tasks.note_id
        and n.user_id = auth.uid()
    )
  );

create policy "Note tasks are deletable by note owners"
  on public.note_tasks for delete
  using (
    exists (
      select 1 from public.notes n
      where n.id = note_tasks.note_id
        and n.user_id = auth.uid()
    )
  );

-- Function returning ranked note search results
create or replace function public.search_notes(
  p_user_id uuid,
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
begin
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
    where n.user_id = p_user_id
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
  where n.user_id = p_user_id
    and n.search_vector @@ ts_query
  order by
    ts_rank_cd(n.search_vector, ts_query) desc,
    case when order_direction = 'asc' then n.updated_at end asc,
    case when order_direction = 'desc' then n.updated_at end desc
  limit p_limit offset p_offset;
end;
$$;

-- Function returning ranked task search results
create or replace function public.search_note_tasks(
  p_user_id uuid,
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
begin
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
  where n.user_id = p_user_id
    and (p_note_id is null or t.note_id = p_note_id)
    and (p_completion is null or (p_completion = 'open' and t.is_completed = false) or (p_completion = 'done' and t.is_completed = true))
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
