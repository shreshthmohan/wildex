# Sample HTML Files - Coverage Report

## Complete Coverage ✅

We have sample HTML files for **ALL major sections** of the species data structure!

### Files Present (17 total)

#### Core Pages
1. ✅ `hearbarium.html` - Main species index page with basic info, images, collection metadata
2. ✅ `menu_species.html` - Species list page (already scraped for links)

#### Description Section (6 pages)
3. ✅ `description-habit.html` - Tree/plant habit and form
4. ✅ `description-leaf.html` - Leaf morphology details
5. ✅ `description-flower.html` - Floral architecture
6. ✅ `description-fruit.html` - Fruit characteristics
7. ✅ `description-seed.html` - Seed details
8. ✅ `description-stem.html` - Stem & bark features

#### Nomenclature
9. ✅ `nomenclature.html` - Scientific names, synonyms, etymology

#### Ecology Section (3 pages)
10. ✅ `phenology.html` - Flowering/fruiting seasons
11. ✅ `reproduction.html` - Reproduction & dispersal methods
12. ✅ `ecology-distribution.html` - Habitat & geographic distribution

#### Human Uses Section (3 pages)
13. ✅ `culinary.html` - Edible uses
14. ✅ `veterinary.html` - Animal/veterinary uses
15. ✅ `others.html` - Other human uses (crafts, construction, etc.)

#### Conservation Section (2 pages)
16. ✅ `reforestation.html` - Propagation & reforestation potential
17. ✅ `status.html` - Conservation status

### Missing (Optional)
- ❌ `dry-herbarium.html` - Dry herbarium specimen images page
  - **Note:** Dry herbarium image URL is already available on main index page
  - This page likely just shows additional herbarium specimen images
  - **Impact:** Low - can scrape the main dry herbarium image from index page

---

## Pattern Verification

All pages follow the **same consistent structure**:

```html
<div id="specimen_wrapper">
  <div id="titre_content">
    <span class="titre">{ Section | Subsection }</span>
  </div>

  <div id="plant_content_wraper">
    <div id="plant_txt">
      <p>Text content with HTML formatting...</p>
    </div>

    <!-- Images (if present) -->
    <div id="specimen_img">
      <img src="..." />
    </div>
    <div id="specimen_legend">Caption text</div>
    <!-- Repeat for multiple images -->
  </div>
</div>
```

### Pattern Observations

1. **All description pages** (habit, leaf, flower, fruit, seed, stem) → Same structure
2. **All ecology pages** (phenology, reproduction, distribution) → Same structure
3. **All human uses pages** (culinary, veterinary, others) → Same structure
4. **Conservation pages** (reforestation, status) → Same structure
5. **Nomenclature** → Slightly different (structured list), already analyzed

### Key Insight

We can use **ONE reusable extractor function** for all content pages except nomenclature!

```python
def extract_content_page(response):
    """Works for ALL description/ecology/uses/conservation pages"""
    return {
        'text': response.css('div#plant_txt p').get(),  # Keep HTML
        'images': extract_images_with_captions(response)
    }
```

---

## Implementation Status

✅ **Ready to implement!**

We have:
- Complete HTML structure understanding
- CSS selectors documented
- JSON structure designed
- All major page types sampled

### Next Step
Implement the spider with the extraction logic.

### Estimated Page Count Per Species
- 1 main index page
- ~15 content pages (some species may not have all sections)
- **Total: ~16 pages per species**
- **340 species × 16 pages = ~5,440 total requests**
- **With 1-second delay: ~90 minutes scraping time**

---

## Sample Species for Testing

Use **ID 141** (Acacia holosericea) for initial testing since all our samples are from this species.
