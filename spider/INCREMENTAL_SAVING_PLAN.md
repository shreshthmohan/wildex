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

1. Get all species links from `./species_list.json`
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

Add new pipeline with status tracking:

```python
import json
import os
from pathlib import Path
from datetime import datetime

class IncrementalSavingPipeline:
    """
    Saves each complete species to individual JSON file immediately
    Tracks scraping status to enable smart resume functionality
    """

    def __init__(self, output_dir):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Status tracking file
        self.status_file = self.output_dir / '_scraping_status.json'
        self.status_data = self._load_status()

    @classmethod
    def from_crawler(cls, crawler):
        # Get output directory from spider settings or use default
        output_dir = crawler.settings.get('INCREMENTAL_OUTPUT_DIR', 'output/species')
        return cls(output_dir)

    def _load_status(self):
        """Load existing scraping status"""
        if self.status_file.exists():
            with open(self.status_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'completed': {}, 'failed': {}}

    def _save_status(self):
        """Save scraping status"""
        with open(self.status_file, 'w', encoding='utf-8') as f:
            json.dump(self.status_data, f, indent=2, ensure_ascii=False)

    def _mark_success(self, species_id, has_minimal_data=True):
        """Mark species as successfully scraped"""
        self.status_data['completed'][str(species_id)] = {
            'timestamp': datetime.now().isoformat(),
            'status': 'success',
            'has_minimal_data': has_minimal_data
        }
        # Remove from failed if it was there
        self.status_data['failed'].pop(str(species_id), None)
        self._save_status()

    def process_item(self, item, spider):
        """Save complete species to individual file and track status"""
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

        # Check if species has minimal data (not just empty structure)
        has_data = bool(item.get('name') or item.get('description'))

        # Mark as successfully scraped
        self._mark_success(species_id, has_minimal_data=has_data)

        spider.logger.info(f"✓ Saved species {species_id} to {filepath}")

        return item

    def mark_failed(self, species_id, error_type='unknown', error_msg='', retryable=True):
        """Mark species as failed (called from spider on errors)"""
        self.status_data['failed'][str(species_id)] = {
            'timestamp': datetime.now().isoformat(),
            'error_type': error_type,
            'error_msg': error_msg,
            'retryable': retryable  # False for 404/410/403, True for network/5xx errors
        }
        self._save_status()
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

#### Step 3: Add Error Handling in Spider

Add error handling to track failed species:

```python
class SpeciesSpider(scrapy.Spider):
    # ... existing code ...

    def parse_species_index(self, response):
        """Parse species index page - now with error handling"""
        species_id = self.extract_species_id(response.url)

        # Get pipeline for error tracking
        pipeline = self.crawler.engine.scraper.itemproc.middlewares[0]

        # Permanent failures (don't retry)
        if response.status == 404:
            self.logger.warning(f"✗ Species {species_id} not found (404)")
            if hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='404_permanent',
                                   error_msg='Page not found', retryable=False)
            return

        if response.status == 410:
            self.logger.warning(f"✗ Species {species_id} gone (410)")
            if hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='410_permanent',
                                   error_msg='Resource gone', retryable=False)
            return

        if response.status == 403:
            self.logger.warning(f"✗ Species {species_id} forbidden (403)")
            if hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='403_permanent',
                                   error_msg='Access forbidden', retryable=False)
            return

        # Temporary failures (can retry)
        if response.status >= 500:
            self.logger.error(f"✗ Server error for species {species_id} (status {response.status})")
            if hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='server_error',
                                   error_msg=f'HTTP {response.status}', retryable=True)
            return

        if response.status == 429:
            self.logger.error(f"✗ Rate limited for species {species_id} (429)")
            if hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='rate_limit',
                                   error_msg='Too many requests', retryable=True)
            return

        # Check for empty/invalid response
        if not response.body or len(response.body) < 100:
            self.logger.error(f"✗ Empty response for species {species_id}")
            if hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='empty_response',
                                   error_msg='Response body too small', retryable=True)
            return

        # ... rest of existing parsing logic ...

    def errback_httpbin(self, failure):
        """Handle request failures (network errors, timeouts, etc.)"""
        species_id = self.extract_species_id(failure.request.url)
        pipeline = self.crawler.engine.scraper.itemproc.middlewares[0]

        # Network/timeout errors are retryable
        error_type = failure.type.__name__
        self.logger.error(f"✗ Request failed for species {species_id}: {error_type}")

        if hasattr(pipeline, 'mark_failed'):
            pipeline.mark_failed(species_id, error_type='network_error',
                               error_msg=str(failure.value), retryable=True)
```

#### Step 4: Add Resume Functionality with Status Tracking

Add ability to skip successfully-scraped species and retry failed ones:

```python
class SpeciesSpider(scrapy.Spider):
    # ... existing code ...

    def __init__(self, species_id=None, max_species=None, resume=False, retry_failed=False, *args, **kwargs):
        super(SpeciesSpider, self).__init__(*args, **kwargs)
        self.species_id = species_id
        self.max_species = int(max_species) if max_species else None
        self.resume = resume
        self.retry_failed = retry_failed

        # Load scraping status if resume=True
        if self.resume or self.retry_failed:
            self.scraping_status = self._load_scraping_status()
            completed_count = len(self.scraping_status.get('completed', {}))
            failed_count = len(self.scraping_status.get('failed', {}))
            self.logger.info(f"Status: {completed_count} completed, {failed_count} failed")
        else:
            self.scraping_status = {'completed': {}, 'failed': {}}

    def _load_scraping_status(self):
        """Load scraping status from _scraping_status.json"""
        from pathlib import Path
        import json

        status_file = Path('output/species/_scraping_status.json')
        if status_file.exists():
            with open(status_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'completed': {}, 'failed': {}}

    def parse_species_menu(self, response):
        """Parse the species menu to get all species IDs"""
        species_links = response.css('a[href*="herbarium.php?id="]::attr(href)').getall()
        unique_links = list(set(species_links))

        # Filter based on scraping status
        if self.resume:
            filtered_links = []
            completed_ids = set(self.scraping_status.get('completed', {}).keys())

            for link in unique_links:
                species_id = str(self.extract_species_id(link))
                if species_id not in completed_ids:
                    filtered_links.append(link)
                else:
                    self.logger.debug(f"Skipping successfully scraped species {species_id}")

            unique_links = filtered_links
            self.logger.info(f"Resume mode: {len(unique_links)} species remaining")

        # Retry failed species only (but only retryable ones)
        if self.retry_failed:
            filtered_links = []
            failed_dict = self.scraping_status.get('failed', {})

            for link in unique_links:
                species_id = str(self.extract_species_id(link))
                if species_id in failed_dict:
                    # Only retry if marked as retryable
                    if failed_dict[species_id].get('retryable', True):
                        filtered_links.append(link)
                        self.logger.debug(f"Will retry species {species_id} ({failed_dict[species_id]['error_type']})")
                    else:
                        self.logger.debug(f"Skipping permanent failure {species_id} ({failed_dict[species_id]['error_type']})")

            unique_links = filtered_links
            self.logger.info(f"Retry mode: {len(unique_links)} retryable failures to retry")

        # Limit species if max_species is set
        if self.max_species:
            unique_links = unique_links[:self.max_species]
            self.logger.info(f"Limiting to {self.max_species} species")

        self.logger.info(f"Scraping {len(unique_links)} species")

        # Follow each species link
        for link in unique_links:
            yield response.follow(link, callback=self.parse_species_index)
```

#### Step 5: Update Gitignore

**File:** `.gitignore`

Add:

```
# Spider output (incremental saves)
spider/output/species/
!spider/output/.gitkeep

# But keep the status tracking file for debugging
!spider/output/species/_scraping_status.json
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
# Skips successfully-scraped species, continues where it left off
```

### Retry only failed species

```bash
cd spider
uv run scrapy crawl species -a retry_failed=True
# Only re-scrapes species that failed (404s, server errors, etc.)
```

### Check scraping status

```bash
cd spider
# Count successful/failed
cat output/species/_scraping_status.json | jq '.completed | length'
cat output/species/_scraping_status.json | jq '.failed | length'

# See all failures with details
cat output/species/_scraping_status.json | jq '.failed'

# Count retryable vs permanent failures
cat output/species/_scraping_status.json | jq '.failed | to_entries | map(select(.value.retryable == true)) | length'
cat output/species/_scraping_status.json | jq '.failed | to_entries | map(select(.value.retryable == false)) | length'

# List only permanent failures (404s, etc.)
cat output/species/_scraping_status.json | jq '.failed | to_entries | map(select(.value.retryable == false))'
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
