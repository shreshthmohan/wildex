# Database Commands

Useful commands to verify, query, and interact with the Foresty D1 database.

## Database Setup & Verification

### List all tables

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Expected tables: `attributes`, `audio_files`, `languages`, `names`, `section_images`, `sections`, `sources`, `species`, `species_attributes`

### Check table structure

```bash
# Check species table structure
pnpm wrangler d1 execute foresty-db --local --command "PRAGMA table_info(species);"

# Check any other table
pnpm wrangler d1 execute foresty-db --local --command "PRAGMA table_info(sections);"
```

### Check all indexes

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY name;"
```

### Count records in each table

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT 'species' as table_name, COUNT(*) as count FROM species UNION ALL SELECT 'languages', COUNT(*) FROM languages UNION ALL SELECT 'names', COUNT(*) FROM names UNION ALL SELECT 'sections', COUNT(*) FROM sections UNION ALL SELECT 'sources', COUNT(*) FROM sources;"
```

## Query Species Data

### List all species

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT id, scientific_name, family FROM species ORDER BY scientific_name;"
```

### Query all data for a species

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT * FROM species WHERE id = 1;"
```

### Query species with local names

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT s.scientific_name, l.name as language, n.name as local_name FROM species s LEFT JOIN names n ON s.id = n.species_id LEFT JOIN languages l ON n.language_id = l.id;"
```

Filter by species ID:
```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT s.scientific_name, l.name as language, n.name as local_name FROM species s LEFT JOIN names n ON s.id = n.species_id LEFT JOIN languages l ON n.language_id = l.id WHERE s.id = 2;"
```

## Query Sections & Content

### Query all sections for a given species

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT s.id, s.title, s.section_order, s.content_text FROM sections s WHERE s.species_id = 1 ORDER BY s.section_order;"
```

Replace `1` with the desired species ID.

### Query sections with images

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT s.id, s.title, s.section_order, COUNT(si.id) as image_count FROM sections s LEFT JOIN section_images si ON s.id = si.section_id WHERE s.species_id = 1 GROUP BY s.id ORDER BY s.section_order;"
```

### Query all names for a species

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT l.name as language, n.name as species_name FROM names n JOIN languages l ON n.language_id = l.id WHERE n.species_id = 1 ORDER BY l.name;"
```

### Query all sources for a species

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT url, title, description FROM sources WHERE species_id = 1 ORDER BY source_order;"
```

## Other Queries

### List all languages

```bash
pnpm wrangler d1 execute foresty-db --local --command "SELECT * FROM languages;"
```

## Data Management

### Insert sample data

Insert a sample language:
```bash
pnpm wrangler d1 execute foresty-db --local --command "INSERT INTO languages (code, name) VALUES ('en', 'English');"
```

Insert a sample species:
```bash
pnpm wrangler d1 execute foresty-db --local --command "INSERT INTO species (scientific_name, common_name, family, category, conservation_status) VALUES ('Abrus precatorius', 'Bead vine', 'Fabaceae', 'plants', 'LC');"
```

Insert a sample name:
```bash
pnpm wrangler d1 execute foresty-db --local --command "INSERT INTO names (species_id, language_id, name) VALUES (1, 1, 'Bead vine');"
```

### Clear all data (danger!)

```bash
pnpm wrangler d1 execute foresty-db --local --command "DELETE FROM species_attributes; DELETE FROM names; DELETE FROM attributes; DELETE FROM section_images; DELETE FROM sections; DELETE FROM audio_files; DELETE FROM sources; DELETE FROM species; DELETE FROM languages;"
```

**Warning:** Use `--remote` instead of `--local` to clear production database (use with extreme caution!).

## Remote vs Local

Replace `--local` with `--remote` in any command to query the production database instead of local development database.
