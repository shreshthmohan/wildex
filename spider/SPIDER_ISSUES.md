# Spider Output Issues & Fixes

## Issue Analysis: Species Batch JSON Output

### Problem 1: Incomplete/Missing Indian Names Parsing ❌

**What's Wrong:**
The `indian_names` field is not being parsed correctly. Looking at the examples:

**Source HTML (`nomeclature-172.html` line 115):**

```html
<li>
  <span class="titchap">Indian names (phonetics) :</span><br />
  <p>
    Hindi : <i>Peeli kaner</i><br />Marathi : <i>Bitti</i><br />Tamil :
    <i>Arali, ponnarali</i><br />&nbsp;
  </p>
</li>
```

**Current Output (`species-batch-of-2.json` line 30):**

```json
"indian_names": "Hindi :"
```

**Expected Output:**

```json
"indian_names": {"Hindi": ["Peeli kaner"], "Marathi" : ["Bitti"], "Tamil" : ["Arali", "ponnarali"]}
```

**Why This Happens:**
The XPath selector in `species.py:373` is only grabbing the first text node:

```python
indian_names = response.xpath(
    '//li[contains(., "Indian names")]/p/text()'
).get()  # <-- .get() only returns FIRST match
```

The HTML has multiple text nodes and `<i>` tags, so `.get()` only captures "Hindi :" and stops.

**Fix:**
Change from `.get()` to `.getall()` and join all text parts:

```python
indian_names_parts = response.xpath(
    '//li[contains(., "Indian names")]//p//text()'
).getall()
indian_names = ' '.join([t.strip() for t in indian_names_parts if t.strip() and t.strip() != '&nbsp;'])
```

---

### Problem 2: Synonyms Including Non-Synonym Text ⚠️

**What's Wrong:**
The last item in synonyms list contains source citation text:

**Current Output:**

```json
"synonyms": [
  "Cascabela peruviana",
  "Cerbera linearifolia",
  ...
  "Thevetia thevetia",
  "The Plant List, 2015, http://www.theplantlist.org"  <-- This is not a synonym!
]
```

**Why This Happens:**
The XPath `//li[contains(., "Synonyms")]//p/i/text()` grabs ALL `<i>` tag text, including the source citation which is also in italics in the HTML.

**Fix:**
Need to exclude the citation by being more selective or post-processing to remove non-botanical names.

---

## Recommendations

### Immediate Fixes (High Priority)

1. **Fix Indian Names Parsing**

   - Update `extract_nomenclature()` method in `species.py:373-374`
   - Parse into structured dictionary format with language keys and arrays of names
   - Handle multiple names per language (comma-separated)

2. **Clean Synonyms List**
   - Filter out source citations from synonyms array
   - Add validation to exclude URLs and parenthetical citations

### Code Location References

- Spider file: `crawler/spiders/species.py`
- Nomenclature extraction: `species.py:349-399` (specifically line 373-374 for indian_names)
- Pipeline: `crawler/pipelines.py:12-121`
- Items definition: `crawler/items.py`

### Testing Commands

```bash
# Test with 2 species to verify fixes
uv run scrapy crawl species -a max_species=2 -o test-output.jsonl

# Validate JSON output
cat test-output.jsonl | jq -s '.' > test-output.json

# Check specific fields
cat test-output.jsonl | jq '.indian_names, .nomenclature.synonyms'
```

---

## Additional Observations

### Data Quality Issues

Some species have incomplete data (e.g., `species_id: 301, 345` have missing fields):

- `basic_info.authority` is `null`
- `ecology.distribution.text` is `null`
- `conservation.status.text` only contains "EN" (not full description)

**This is likely due to:**

- Incomplete source data on the herbarium website
- Different HTML structure for some species pages
- Need defensive parsing for optional fields

### Performance Considerations

- Current `DOWNLOAD_DELAY: 3` is working well to avoid 429 errors
- Aggregation pipeline is functioning correctly
- May want to add progress logging to track which species are incomplete
