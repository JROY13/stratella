-- Strip legacy <html><body> wrappers from notes.body
UPDATE notes
SET body = regexp_replace(
        regexp_replace(body, '(?is)^<html><body>', ''),
        '(?is)</body></html>$', ''
    )
WHERE body ~* '^<html><body>';
