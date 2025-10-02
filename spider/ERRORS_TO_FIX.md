# Console Errors to Fix

## Phase 1: Critical Errors

### Error 1: DropItem Exceptions Flooding Console

**Issue:** Pipeline is dropping partial items and printing huge stack traces
**Log snippet:**

```
[scrapy.core.scraper] ERROR: Error processing {...}
Traceback (most recent call last):
  ...
crawler.pipelines.DropItem: Partial item for species 172
```

**Why:** The `DropItem` exception is being raised but Scrapy treats it as an error instead of silently dropping

**Fix:** Change `raise DropItem()` to `return None` in the pipeline

---

### Error 2: Deprecation Warning - start_requests()

**Issue:** Using deprecated `start_requests()` method
**Log snippet:**

```
ScrapyDeprecationWarning: crawler.spiders.species.SpeciesSpider defines the deprecated start_requests() method.
```

**Fix:** Rename `start_requests()` to `start()` and make it async

---

## Phase 2: Warning Cleanup

### Warning 1: robots.txt 404 Error

**Issue:** Site doesn't have robots.txt but we're checking for it
**Log snippet:**

```
DEBUG: Crawled (404) <GET https://aurovilleherbarium.org/robots.txt>
```

**Fix:** Either disable `ROBOTSTXT_OBEY` or ignore this (not critical) disable for now

---

### Warning 2: Protego Rules Without User Agent

**Issue:** robots.txt parser warnings (multiple lines)
**Log snippet:**

```
[protego._protego] DEBUG: Rule at line X without any user agent to enforce it on.
```

**Fix:** These are just debug logs from the robots parser, can be suppressed by log level

---

## Phase 3: Data Issues

### Issue 1: Empty Output File

**Problem:** Spider completes but outputs `[]`
**Why:** All items dropped because pipeline expects ALL sections to complete, but some sections may be empty/missing on the website

**Fix:** Pipeline needs to be smarter about which sections are truly required vs optional
