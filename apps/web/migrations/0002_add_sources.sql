-- Migration to add sources table for tracking multiple sources per species
-- Created: 2025-10-07

-- Sources table for references and citations
CREATE TABLE sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  source_order INTEGER DEFAULT 1,
  accessed_at DATETIME,
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

CREATE INDEX idx_sources_species ON sources(species_id);
