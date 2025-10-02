# Plan: Incremental Per-Species File Saving

## Current Behavior

**Problem:** The spider currently:
1. Aggregates species data in memory (via `SpeciesAggregationPipeline`)
2. Outputs ALL species to a single JSON file at the END of the run
3. If spider crashes midway, all scraped data is lost

**Example current output:**
```bash
uv run scrapy crawl species -a max_species=10 -O output.json
# Creates: output.json with array of 10 species (only after all complete)
```

## Desired Behavior

**Goal:**
1. Get all species links from menu (like `ah-spider` does)
2. Scrape each species individually with full data
3. Save each species to individual file AS SOON AS it completes
4. Continue scraping next species

**Example desired output:**
```bash
uv run scrapy crawl species_incremental
# Creates as scraping progresses:
#   output/species-001.json (immediately when species 1 completes)
#   output/species-002.json (immediately when species 2 completes)
#   output/species-003.json (immediately when species 3 completes)
#   ...
```

**Benefits:**
- Crash-resilient: already-scraped species are saved
- Progress tracking: can see how many species completed
- Easy to resume: skip already-scraped species
- Memory efficient: don't hold all species in memory

---

## Implementation Plan

### Option 1: Custom File Pipeline (Recommended)

Create a new pipeline that writes individual files as each species completes.

#### Step 1: Create `IncrementalSavingPipeline`

**File:** `spider/crawler/pipelines.py`

Add new pipeline:
```python
import json
import os
from pathlib import Path

class IncrementalSavingPipeline:
    """
    Saves each complete species to individual JSON file immediately
    """

    def __init__(self, output_dir):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    @classmethod
    def from_crawler(cls, crawler):
        # Get output directory from spider settings or use default
        output_dir = crawler.settings.get('INCREMENTAL_OUTPUT_DIR', 'output/species')
        return cls(output_dir)

    def process_item(self, item, spider):
        """Save complete species to individual file"""
        if spider.name != 'species':
            return item

        species_id = item.get('species_id')
        if not species_id:
            return item

        # Generate filename: species-001.json, species-172.json, etc.
        filename = f"species-{species_id:03d}.json"
        filepath = self.output_dir / filename

        # Write to file immediately
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump([item], f, indent=2, ensure_ascii=False)

        spider.logger.info(f"✓ Saved species {species_id} to {filepath}")

        return item
```

#### Step 2: Update Spider Settings

**File:** `spider/crawler/spiders/species.py`

Modify `custom_settings`:
```python
custom_settings = {
    "DOWNLOAD_DELAY": 2,
    "RANDOMIZE_DOWNLOAD_DELAY": True,
    "ROBOTSTXT_OBEY": False,
    "CONCURRENT_REQUESTS_PER_DOMAIN": 1,
    "RETRY_TIMES": 3,
    "RETRY_HTTP_CODES": [429, 500, 502, 503, 504],

    # REMOVE: Old feed exports (writes at end)
    # "FEEDS": {...}

    # ADD: Incremental saving pipeline
    "ITEM_PIPELINES": {
        "crawler.pipelines.SpeciesAggregationPipeline": 300,  # Aggregates sections
        "crawler.pipelines.IncrementalSavingPipeline": 400,   # Saves immediately
    },

    # Configure output directory
    "INCREMENTAL_OUTPUT_DIR": "output/species",

    "LOG_FILE": "spider.log",
    "LOG_FILE_APPEND": False,
    "LOG_LEVEL": "INFO",
}
```

#### Step 3: Add Resume Functionality (Optional but Recommended)

Add ability to skip already-scraped species:

```python
class SpeciesSpider(scrapy.Spider):
    # ... existing code ...

    def __init__(self, species_id=None, max_species=None, resume=False, *args, **kwargs):
        super(SpeciesSpider, self).__init__(*args, **kwargs)
        self.species_id = species_id
        self.max_species = int(max_species) if max_species else None
        self.resume = resume

        # Load already-scraped species IDs if resume=True
        if self.resume:
            self.completed_species = self._load_completed_species()
            self.logger.info(f"Resume mode: Found {len(self.completed_species)} already-scraped species")
        else:
            self.completed_species = set()

    def _load_completed_species(self):
        """Get list of already-scraped species IDs from output directory"""
        output_dir = Path('output/species')
        completed = set()

        if output_dir.exists():
            for file in output_dir.glob('species-*.json'):
                # Extract ID from filename: species-172.json -> 172
                try:
                    species_id = int(file.stem.split('-')[1])
                    completed.add(species_id)
                except (ValueError, IndexError):
                    pass

        return completed

    def parse_species_menu(self, response):
        """Parse the species menu to get all species IDs"""
        species_links = response.css('a[href*="herbarium.php?id="]::attr(href)').getall()
        unique_links = list(set(species_links))

        # Filter out already-completed species if resume=True
        if self.resume:
            filtered_links = []
            for link in unique_links:
                species_id = self.extract_species_id(link)
                if species_id not in self.completed_species:
                    filtered_links.append(link)
                else:
                    self.logger.debug(f"Skipping already-scraped species {species_id}")

            unique_links = filtered_links
            self.logger.info(f"Resume mode: {len(unique_links)} species remaining to scrape")

        # Limit species if max_species is set
        if self.max_species:
            unique_links = unique_links[:self.max_species]
            self.logger.info(f"Limiting to {self.max_species} species")

        self.logger.info(f"Scraping {len(unique_links)} species")

        # Follow each species link
        for link in unique_links:
            yield response.follow(link, callback=self.parse_species_index)
```

#### Step 4: Update Gitignore

**File:** `.gitignore`

Add:
```
# Spider output (incremental saves)
spider/output/species/
!spider/output/.gitkeep
```

Keep only reference samples in git, not all scraped species.

---

## Usage Examples

### Scrape all species with incremental saving
```bash
cd spider
uv run scrapy crawl species
# Creates: output/species/species-001.json, species-002.json, etc.
```

### Resume interrupted scraping
```bash
cd spider
uv run scrapy crawl species -a resume=True
# Skips already-saved species, continues where it left off
```

### Scrape limited batch
```bash
cd spider
uv run scrapy crawl species -a max_species=10
# Creates: output/species/species-001.json through species-010.json
```

### Scrape specific species (still works)
```bash
cd spider
uv run scrapy crawl species -a species_id=172
# Creates: output/species/species-172.json
```

---

## Testing Strategy

1. **Test incremental saving:**
   - Run: `uv run scrapy crawl species -a max_species=2`
   - Verify: 2 files created in `output/species/`
   - Check: Files contain complete species data

2. **Test crash recovery:**
   - Start scraping 10 species
   - Kill spider after 5 complete (Ctrl+C)
   - Verify: 5 files exist
   - Resume: `uv run scrapy crawl species -a resume=True -a max_species=10`
   - Verify: Scrapes remaining 5 only

3. **Test overwrite protection:**
   - Scrape species 172
   - Scrape species 172 again
   - Verify: File is overwritten (or add logic to skip)

---

## Alternative: Option 2 - Feed Exports with Item Template

Use Scrapy's built-in feed exports with per-item files:

```python
custom_settings = {
    # ...
    "FEEDS": {
        "output/species/species-%(species_id)03d.json": {
            "format": "json",
            "encoding": "utf-8",
            "item_export_kwargs": {
                "ensure_ascii": False,
                "indent": 2,
            },
            "overwrite": True,
        }
    },
}
```

**Pros:** Simpler, uses built-in Scrapy functionality
**Cons:** Less control, harder to add resume logic

---

## Recommendation

**Use Option 1** (Custom Pipeline) because:
1. Full control over file saving
2. Easy to add resume functionality
3. Better error handling
4. Can add progress tracking/stats
5. Future: can add retry logic for failed species

---

## Implementation Checklist

- [ ] Create `IncrementalSavingPipeline` in `pipelines.py`
- [ ] Update spider `custom_settings` to use new pipeline
- [ ] Add resume functionality to spider
- [ ] Update `.gitignore` for incremental output
- [ ] Test with small batch (2-3 species)
- [ ] Test resume functionality
- [ ] Update `spider/README.md` with new usage instructions
- [ ] Consider: Add progress bar using `tqdm`
- [ ] Consider: Add database tracking instead of file scanning

---

## Future Enhancements

1. **Progress Dashboard:**
   - Track scraping progress in SQLite database
   - Show: completed, failed, remaining species

2. **Parallel Scraping:**
   - Increase `CONCURRENT_REQUESTS_PER_DOMAIN` carefully
   - Monitor server load

3. **Failure Tracking:**
   - Log failed species to `failed_species.txt`
   - Add `--retry-failed` flag

4. **Validation:**
   - Verify saved files are valid JSON
   - Check for minimum required fields
   - Mark incomplete species for re-scraping
