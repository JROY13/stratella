-- Backfill persisted note metadata for deployments that predate title/open task columns
with metadata as (
  select
    n.id,
    coalesce(
      nullif(btrim(n.title), ''),
      nullif(btrim(substring(n.body from '(?is)<h1[^>]*>(.*?)</h1>')), ''),
      nullif(btrim(public.strip_html(n.body)), ''),
      'Untitled'
    ) as fallback_title,
    coalesce(
      (
        select count(*)::numeric
        from (
          select lower(match[1]) as checked
          from regexp_matches(
            coalesce(n.body, ''),
            '<li[^>]*data-type="taskItem"[^>]*data-checked="([^\"]]*)"[^>]*>',
            'gi'
          ) as match
        ) as extracted
        where coalesce(extracted.checked, '') not in ('true', 't', '1', 'yes')
      ),
      0::numeric
    ) as fallback_open_tasks
  from public.notes n
)
update public.notes as n
set
  title = case
    when n.title is null or btrim(n.title) = '' then metadata.fallback_title
    else n.title
  end,
  open_tasks = case
    when n.open_tasks is null then metadata.fallback_open_tasks
    else n.open_tasks
  end
from metadata
where n.id = metadata.id
  and (
    (n.title is null or btrim(n.title) = '')
    or n.open_tasks is null
  );
