-- Grant execute permissions for search RPCs to application roles.
GRANT EXECUTE ON FUNCTION public.search_note_tasks(
    uuid,
    text,
    integer,
    integer,
    text,
    text,
    uuid,
    text,
    text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.search_notes(
    uuid,
    text,
    integer,
    integer,
    text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.search_note_tasks(
    uuid,
    text,
    integer,
    integer,
    text,
    text,
    uuid,
    text,
    text
) TO service_role;

GRANT EXECUTE ON FUNCTION public.search_notes(
    uuid,
    text,
    integer,
    integer,
    text
) TO service_role;
