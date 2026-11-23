# Species Spider

Web scraper for extracting plant species data from the [Auroville Herbarium](https://aurovilleherbarium.org).

## What It Does

Scrapes comprehensive species information including:
- Basic taxonomy (scientific name, family, authority)
- Detailed descriptions (habit, leaf, flower, fruit, seed, stem/bark)
- Nomenclature (botanical names, common names in multiple languages, synonyms, etymology)
- Ecology (phenology, reproduction/dispersal, distribution)
- Human uses (culinary, veterinary, other uses)
- Conservation status and reforestation info
- Images with captions
- Collection metadata (GPS coordinates, locality, collector, date)

## Requirements

- Python 3.13+
- [uv](https://github.com/astral-sh/uv) - Fast Python package installer

## Setup

The spider uses `uv` which automatically manages the virtual environment and dependencies.

**Install uv** (if you don't have it):
```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

No other setup needed! `uv` will handle the rest when you run the spider.

## Usage

**Important:** Run all commands from inside the `spider/` directory.

```sh
cd spider
```

### Quick Reference

```bash
# Scrape a single specific species
uv run scrapy crawl species -a species_id=172

# Scrape multiple species (limited batch)
uv run scrapy crawl species -a max_species=5

# Get list of all available species
uv run scrapy crawl ah-spider -O species_list.json
```

### Output Options

#### Option 1: Use default output (recommended)
The spider outputs to `species_output.json` by default with automatic overwrite enabled:

```sh
uv run scrapy crawl species -a max_species=2
# Output: species_output.json (overwrites each run)
```

#### Option 2: Custom output filename
Use `-O` (capital O) to **overwrite** the file each run:

```sh
uv run scrapy crawl species -a max_species=2 -O species-batch-of-2.json
```

**⚠️ Important:** Use `-O` (overwrite) instead of `-o` (append). Using lowercase `-o` will append to existing files, causing duplicate data.

### Examples

#### Scrape multiple species (limited batch)
```sh
uv run scrapy crawl species -a max_species=5 -O species-batch-of-5.json
```

#### Scrape single specific species
```sh
uv run scrapy crawl species -a species_id=172 -O species-172.json
```

#### Scrape all species (takes a while!)
```sh
uv run scrapy crawl species
# Output: species_output.json
```

### Get Species List

To get a list of all species with their basic info (names, links, thumbnails) without scraping full details:

```sh
uv run scrapy crawl ah-spider -O species_list.json
```

This is much faster and useful for:
- Getting an overview of available species
- Finding species IDs to scrape individually
- Building an index/catalog

## Output Format

The spider outputs JSON with the following structure:

```json
{
  "species_id": 172,
  "url": "https://aurovilleherbarium.org/herbarium.php?id=172",
  "scraped_at": "2025-10-02T12:00:00Z",
  "basic_info": {
    "scientific_name": "...",
    "authority": "...",
    "family": "..."
  },
  "nomenclature": { /* names, synonyms, etymology */ },
  "description": {
    "habit": { "text": "...", "images": [...] },
    "leaf": { /* ... */ },
    "flower": { /* ... */ },
    "fruit": { /* ... */ },
    "seed": { /* ... */ },
    "stem_bark": { /* ... */ }
  },
  "ecology": {
    "phenology": { /* ... */ },
    "reproduction_dispersal": { /* ... */ },
    "distribution": { /* ... */ }
  },
  "human_uses": {
    "culinary": { /* ... */ },
    "veterinary": { /* ... */ },
    "others": { /* ... */ }
  },
  "conservation": {
    "status": { /* ... */ },
    "reforestation": { /* ... */ }
  },
  "images": {
    "main_specimen": "...",
    "dry_herbarium": "..."
  },
  "collection_metadata": {
    "date": "...",
    "collected_by": "...",
    "gps_coordinates": { "latitude": "...", "longitude": "..." },
    "locality": "..."
  }
}
```

## Spider Behavior

- **Polite scraping:** 3-second delay between requests (randomized)
  - Configured in `crawler/spiders/species.py` (`DOWNLOAD_DELAY` setting)
- **Sequential requests:** One at a time to avoid overloading the server
- **Retry logic:** Automatically retries on server errors
- **Logging:** Writes to `spider.log` (overwritten each run)

## Troubleshooting

**"Command not found: uv"**
- Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`

**Getting duplicate data?**
- Make sure you're using `-O` (uppercase) not `-o` (lowercase)

**Spider running too slow?**
- This is intentional! We use delays to be respectful to the server
- Don't modify `DOWNLOAD_DELAY` settings unless you know what you're doing

## Reference Data

Sample outputs are stored in `output/` for reference:
- `output/species-172.json` - Single species example
- `output/species-batch-of-5.json` - Multi-species batch example
