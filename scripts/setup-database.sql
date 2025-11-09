-- Create registries table
CREATE TABLE IF NOT EXISTS registries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  files JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS registries_created_at_idx ON registries(created_at DESC);
