i want to make a db (sqlite) schema such that it's flexible enough to be used for different species (plants, mammals, insects)

- scientific name

- an array of names. the stucture is as below

- conservation/iucn red list status

```json
{
  "English": ["Bead vine", "Coral bead vine"],
  "Bengali": ["Gunch"],
  "Hindi": ["Gunci", "Guncaci", "Ratti"],
  "Kannada": ["Gurugunji"],
  "Malayalam": ["Kunni"],
  "Marathi": ["chanoti", "gunchi", "Gunja"],
  "Sanskrit": ["Gunjaa"],
  "Tamil": ["kudri mani", "kundumani", "Kuntumani"],
  "Telugu": ["Gurija", "Guruginja"]
}
```

i am thinking we could have sections for the details of a species:

each section has:

- a title
- an array of images (each with an optional caption)
- description text for the section (markdown)

so this way it's flexible enough

maybe we can have different attributes?

for example
for plants:
deciduous, perennial, thornless, climber (these would all be attributes, right?)

for animals, say:
nocturnal, mammal, marsupial etc

and these attributes can be associated with any species

---

## Database Schema Plan

### Core Tables

#### 1. `species` (main entity)

```sql
CREATE TABLE species (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scientific_name TEXT NOT NULL UNIQUE,
  common_name TEXT,
  family TEXT,  -- botanical/zoological family
  category TEXT,  -- 'plants', 'mammals', 'birds', 'insects', etc.
  conservation_status TEXT,  -- IUCN status
  main_image_url TEXT,
  main_image_alt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `languages` (normalized language reference)

```sql
CREATE TABLE languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,  -- 'en', 'hi', 'ta', etc. (ISO 639-1)
  name TEXT NOT NULL  -- 'English', 'Hindi', 'Tamil', etc.
);
```

#### 3. `names` (multilingual common names)

```sql
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
```

#### 4. `attributes` (flexible tagging system)

```sql
CREATE TABLE attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,  -- 'nocturnal', 'deciduous', 'thornless', etc.
  category TEXT,  -- 'behavior', 'physical', 'habitat', etc. (optional grouping)
  description TEXT
);

CREATE TABLE species_attributes (
  species_id INTEGER NOT NULL,
  attribute_id INTEGER NOT NULL,
  PRIMARY KEY (species_id, attribute_id),
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
  FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);
```

#### 5. `sections` (flexible content sections)

```sql
CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL,
  title TEXT NOT NULL,  -- 'Habitat', 'Physical Description', 'Flower', 'Leaf', etc.
  section_order INTEGER NOT NULL,  -- for ordering sections
  content_text TEXT,  -- markdown content
  content_html TEXT,  -- pre-rendered HTML (optional)
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);
CREATE INDEX idx_sections_species ON sections(species_id);
```

#### 6. `section_images` (images associated with sections)

```sql
CREATE TABLE section_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  image_order INTEGER NOT NULL,  -- for ordering images within section
  credit TEXT,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);
CREATE INDEX idx_section_images_section ON section_images(section_id);
```

#### 7. `audio_files` (for bird calls, etc.)

```sql
CREATE TABLE audio_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  description TEXT,  -- 'call', 'song', 'alarm', etc.
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);
CREATE INDEX idx_audio_species ON audio_files(species_id);
```

### Migration Strategy

**Phase 1**: Core schema setup

- Create all tables
- Set up indexes and foreign keys
- Add migration tooling

**Phase 2**: Data migration from existing sources

- Transform `species.js` data → SQLite
- Transform scraped JSON data → SQLite
- Handle conflicts/merges intelligently

**Phase 3**: Application layer updates

- Update queries to use SQLite instead of in-memory JS
- Build CRUD APIs
- Add search/filter capabilities

### Key Design Decisions

1. **Flexible sections**: Instead of hardcoded fields (flower, leaf, habitat), use `sections` table so ANY type of descriptive content can be added
2. **Normalized languages**: Separate `languages` table for consistent language references, easier to add new languages
3. **Integer IDs**: Using auto-increment integers for primary keys (simpler, faster joins, can still generate slugs from scientific names for URLs)
4. **Attributes as tags**: Reusable across species, easy to filter/search by multiple attributes
5. **Order fields**: Both sections and images have ordering so you control display sequence
6. **Cascading deletes**: Clean up related data automatically when species removed
7. **Minimal first version**: Dropped authority, theme_color, synonyms, and subspecies tables to start lean (can add later if needed)

### Example Queries

```sql
-- Get species with all names
SELECT s.*,
       GROUP_CONCAT(n.name || ' (' || l.name || ')') as all_names
FROM species s
LEFT JOIN names n ON s.id = n.species_id
LEFT JOIN languages l ON n.language_id = l.id
GROUP BY s.id;

-- Find all nocturnal species
SELECT s.*
FROM species s
JOIN species_attributes sa ON s.id = sa.species_id
JOIN attributes a ON sa.attribute_id = a.id
WHERE a.name = 'nocturnal';

-- Get full species detail with sections and images
SELECT s.*,
       sec.title, sec.content_text,
       img.image_url, img.caption
FROM species s
LEFT JOIN sections sec ON s.id = sec.species_id
LEFT JOIN section_images img ON sec.id = img.section_id
WHERE s.scientific_name = 'Melursus ursinus'
ORDER BY sec.section_order, img.image_order;
```
