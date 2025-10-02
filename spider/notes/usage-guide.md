# Species Spider - Usage Guide

## Overview

The `species` spider scrapes complete species data from Auroville Herbarium, including all description sections, nomenclature, ecology, human uses, and conservation information.

---

## Running the Spider

### Test on Single Species (Recommended First)

```bash
cd spider

# Test on species ID 141 (Acacia holosericea - our sample species)
uv run scrapy crawl species -a species_id=141 -o output/species-141.json

# Or as JSON Lines (recommended for multiple species)
uv run scrapy crawl species -a species_id=141 -o output/species-141.jsonl
```

### Scrape All Species

```bash
# Scrape all ~340 species (will take ~2 hours with 1-second delay)
uv run scrapy crawl species -o output/all-species.jsonl

# With more verbose logging
uv run scrapy crawl species -o output/all-species.jsonl --loglevel=INFO
```

### Scrape Multiple Specific Species

```bash
# Edit the spider to accept multiple IDs (or run multiple times)
uv run scrapy crawl species -a species_id=141 -o output/batch-1.jsonl
uv run scrapy crawl species -a species_id=111 -o output/batch-2.jsonl
# etc.
```

---

## Output Format

The spider outputs complete species data in JSON/JSONL format:

```json
{
  "species_id": 141,
  "url": "https://aurovilleherbarium.org/herbarium.php?id=141",
  "scraped_at": "2025-01-15T10:30:00Z",

  "basic_info": {
    "scientific_name": "Acacia holosericea",
    "authority": "A.Cunn. ex G.Don",
    "family": "Fabaceae"
  },

  "images": {
    "main_specimen": "https://admin.aurovilleherbarium.org/img/plants/main/acacia_holosericea.jpg",
    "dry_herbarium": "https://admin.aurovilleherbarium.org/img/dryherbarium/Ac.ho_herb1.jpg"
  },

  "collection_metadata": {
    "date": "17 Feb, 2016",
    "collected_by": "N.L.I.B.",
    "gps_coordinates": {
      "latitude": "11.99621 N",
      "longitude": "79.82411 E",
      "raw": "11.99621 N - 79.82411 E"
    },
    "locality": "Pitchandikulam Forest, Auroville, Tamil Nadu, India"
  },

  "nomenclature": {
    "botanical_name": "Acacia holosericea",
    "author": "Cunningham, Allan (1832)",
    "family": "Fabaceae",
    "english_names": "Soapbush wattle, strap wattle",
    "indian_names": "Not specified",
    "synonyms": [
      "Acacia holosericea var. glabrata Maiden",
      "..."
    ],
    "etymology": "- Acacia : From the Greek akakia..."
  },

  "description": {
    "habit": {
      "text": "Acacia holosericea is a thornless...",
      "images": [
        {
          "url": "https://admin.aurovilleherbarium.org/img/plants/habit/acacia_holosericea_habit1.jpg",
          "caption": "Acacia holosericea young trees"
        }
      ]
    },
    "leaf": { ... },
    "flower": { ... },
    "fruit": { ... },
    "seed": { ... },
    "stem_bark": { ... }
  },

  "ecology": {
    "phenology": { "text": "...", "images": [] },
    "reproduction_dispersal": { "text": "...", "images": [] },
    "distribution": { "text": "...", "images": [] }
  },

  "human_uses": {
    "culinary": { "text": "...", "images": [] },
    "veterinary": { "text": "...", "images": [] },
    "others": { "text": "...", "images": [] }
  },

  "conservation": {
    "status": { "text": "...", "images": [] },
    "reforestation": { "text": "...", "images": [] }
  }
}
```

---

## How It Works

### 1. Multi-Page Scraping

For each species, the spider:
1. Scrapes the main index page for basic info and metadata
2. Spawns 16 concurrent requests for all content pages:
   - 6 description pages (habit, leaf, flower, fruit, seed, stem)
   - 1 nomenclature page
   - 3 ecology pages (phenology, reproduction, distribution)
   - 3 human uses pages (culinary, veterinary, others)
   - 2 conservation pages (status, reforestation)

### 2. Data Aggregation

The `SpeciesAggregationPipeline` aggregates data from all 16 pages:
- Caches partial data as each page is scraped
- Tracks which sections are complete
- Yields the complete species item only when ALL sections are scraped
- Drops partial items to avoid duplicate output

### 3. Error Handling

- Missing/empty sections are handled gracefully
- Some species may not have all sections (e.g., no culinary uses)
- The pipeline logs warnings for incomplete species

---

## Performance

### Timing Estimates

- **Single species**: ~20 seconds (16 pages × 1-second delay)
- **All ~340 species**: ~2 hours (5,440 requests × 1-second delay)

### Rate Limiting

The spider is configured to be polite:
- `DOWNLOAD_DELAY = 1` second between requests
- `CONCURRENT_REQUESTS_PER_DOMAIN = 1` (sequential)
- `ROBOTSTXT_OBEY = True`

### Monitoring

Watch the logs for progress:
```
Species 141: Completed description.habit
Species 141: Completed description.leaf
Species 141: Completed nomenclature._complete
...
Species 141: All sections complete, yielding item
```

---

## Troubleshooting

### No Output File Created

- Check that the output directory exists: `mkdir -p output`
- Verify the spider name is correct: `species` (not `ah-species`)

### Incomplete Data

- Check logs for warnings about missing sections
- Some species legitimately don't have all sections
- Verify network connectivity if many sections are missing

### Pipeline Not Working

- Ensure pipeline is enabled in `settings.py`:
  ```python
  ITEM_PIPELINES = {
      "crawler.pipelines.SpeciesAggregationPipeline": 300,
  }
  ```

### Spider Hangs

- The spider waits for ALL sections before yielding
- If a request fails, the species will be incomplete
- Check logs for failed requests (HTTP errors)

---

## Next Steps

1. **Test on single species first**: `species_id=141`
2. **Validate output**: Check JSON structure is complete
3. **Test on small batch**: Try 5-10 species
4. **Run full scrape**: All 340 species overnight
5. **Process data**: Import into database or analyze

---

## Files

- **Spider**: `crawler/spiders/species.py`
- **Items**: `crawler/items.py`
- **Pipeline**: `crawler/pipelines.py`
- **Settings**: `crawler/settings.py`
- **This guide**: `notes/usage-guide.md`
