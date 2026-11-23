-- Initial database schema for Foresty
-- Created: 2025-10-07

-- Core species table
CREATE TABLE species (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scientific_name TEXT NOT NULL UNIQUE,
  common_name TEXT,
  family TEXT,
  category TEXT,
  conservation_status TEXT,
  main_image_url TEXT,
  main_image_alt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Languages reference table
CREATE TABLE languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

-- Multilingual common names
CREATE TABLE names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL,
  language_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
);
CREATE INDEX idx_names_species ON names(species_id);
CREATE INDEX idx_names_language ON names(language_id);

-- Flexible tagging system
CREATE TABLE attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT
);

CREATE TABLE species_attributes (
  species_id INTEGER NOT NULL,
  attribute_id INTEGER NOT NULL,
  PRIMARY KEY (species_id, attribute_id),
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
  FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);

-- Flexible content sections
CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  content_text TEXT,
  content_html TEXT,
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);
CREATE INDEX idx_sections_species ON sections(species_id);

-- Images associated with sections
CREATE TABLE section_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  image_order INTEGER NOT NULL,
  credit TEXT,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);
CREATE INDEX idx_section_images_section ON section_images(section_id);

-- Audio files (for bird calls, etc.)
CREATE TABLE audio_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);
CREATE INDEX idx_audio_species ON audio_files(species_id);
