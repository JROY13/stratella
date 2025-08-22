-- Add open_tasks column to notes table
ALTER TABLE notes ADD COLUMN open_tasks numeric DEFAULT 0;
