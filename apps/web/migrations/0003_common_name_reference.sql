-- Migration to change common_name from TEXT to a foreign key reference
-- This allows common_name to reference an existing name in the names table

-- Create a temporary column for the foreign key
ALTER TABLE species ADD COLUMN common_name_id INTEGER;

-- Add foreign key constraint
CREATE TABLE species_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scientific_name TEXT NOT NULL UNIQUE,
  common_name_id INTEGER,
  family TEXT,
  category TEXT,
  conservation_status TEXT,
  main_image_url TEXT,
  main_image_alt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (common_name_id) REFERENCES names(id) ON DELETE SET NULL
);

-- Copy data from old table to new table
INSERT INTO species_new (id, scientific_name, common_name_id, family, category, conservation_status, main_image_url, main_image_alt, created_at, updated_at)
SELECT id, scientific_name, NULL, family, category, conservation_status, main_image_url, main_image_alt, created_at, updated_at
FROM species;

-- Drop old table and rename new table
DROP TABLE species;
ALTER TABLE species_new RENAME TO species;

-- Recreate indexes if any existed
CREATE INDEX idx_species_scientific_name ON species(scientific_name);
