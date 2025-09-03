-- Prepend title as <h1> heading to body when missing
UPDATE notes
SET body = '<h1>' || title || '</h1>' || body
WHERE NOT (body ~ '^<h[1-6]');

-- Title column retained for indexing
