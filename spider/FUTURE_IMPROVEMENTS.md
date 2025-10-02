# Future Improvements for Species Spider

## 1. Dynamic Menu-Based Scraping

### Problem
Currently, the spider attempts to scrape all predefined content pages for every species, even if some sections don't exist for certain species. This leads to:
- Unnecessary requests to pages that may not exist
- Potential errors or empty data fields
- Inflexibility when the website adds/removes sections

### Solution: Parse Menu Dynamically

Instead of hardcoding which pages to scrape, parse the left-side menu on each species page to determine which sections actually exist.

#### Current Approach
```python
CONTENT_PAGES = {
    "description": {
        "habit": "contents/description-habit.php",
        "leaf": "contents/description-leaf.php",
        # ... hardcoded list
    },
    # ...
}
```

#### Proposed Approach

**Step 1: Parse the menu from the main species page**

The menu structure in the HTML looks like:
```html
<div id="plant_menu" title="Nomenclature">
    <a href="#">Nomenclature</a>
</div>

<div id="plant_menu">Description</div>
    <div id="plant_sousmenu" title="Habit">
        <a href="#">Habit</a>
    </div>
    <div id="plant_sousmenu" title="Leaf">
        <a href="#">Leaf</a>
    </div>

<div id="plant_menu">Human uses</div>
    <div id="plant_sousmenu" title="Handicrafts">
        <a href="#">Handicrafts</a>
    </div>
    <div id="plant_sousmenu" title="Culinary">
        <a href="#">Culinary</a>
    </div>
```

**Step 2: Extract available sections**

Create a new method:
```python
def extract_available_sections(self, response):
    """
    Parse the left menu to determine which content sections exist
    Returns dict like:
    {
        'nomenclature': True,
        'description': ['habit', 'leaf', 'flower', 'fruit', 'seed', 'stem'],
        'ecology': ['phenology', 'reproduction', 'distribution'],
        'human_uses': ['handicrafts', 'culinary', 'veterinary'],
        'conservation': ['status', 'reforestation']
    }
    """
    sections = {}

    # Parse main menu items
    menu_items = response.css('div#plant_menu')

    for menu_item in menu_items:
        title = menu_item.css('::attr(title)').get()
        text = menu_item.css('::text').get()

        # Handle main sections vs category headers
        if title:  # It's a clickable section
            sections[normalize_title(title)] = True
        elif text:  # It's a category header
            # Get all submenu items following this header
            subsections = []
            # Extract submenu items until next main menu
            # ... parsing logic here
            sections[normalize_category(text)] = subsections

    return sections
```

**Step 3: Map menu titles to URLs**

Create a mapping dictionary:
```python
SECTION_URL_MAP = {
    'nomenclature': 'contents/nomenclature.php',
    'habit': 'contents/description-habit.php',
    'leaf': 'contents/description-leaf.php',
    'flower': 'contents/description-flower.php',
    'fruit': 'contents/description-fruit.php',
    'seed': 'contents/description-seed.php',
    'stem': 'contents/description-stem.php',
    'phenology': 'contents/phenology.php',
    'reproduction': 'contents/reproduction.php',
    'ecology': 'contents/ecology-distribution.php',
    'culinary': 'contents/culinary.php',
    'handicrafts': 'contents/handicrafts.php',
    'veterinary': 'contents/veterinary.php',
    'others': 'contents/others.php',
    'status': 'contents/status.php',
    'reforestation': 'contents/reforestation.php',
}
```

**Step 4: Refactor parse_species_index**

```python
def parse_species_index(self, response):
    """
    Parse the main species index page and spawn requests
    only for sections that exist in the menu
    """
    species_id = self.extract_species_id(response.url)
    species_data = SpeciesItem()
    # ... existing initialization code ...

    # NEW: Extract which sections are available
    available_sections = self.extract_available_sections(response)

    # Only scrape sections that exist
    if 'nomenclature' in available_sections:
        # scrape nomenclature
        pass

    if 'description' in available_sections:
        for subsection in available_sections['description']:
            url = SECTION_URL_MAP.get(subsection)
            if url:
                # scrape this subsection
                pass

    # ... similar for ecology, human_uses, conservation
```

### Benefits

1. **Robust:** Handles variations between species automatically
2. **Future-proof:** Adapts if website adds/removes sections
3. **Efficient:** Only makes requests for pages that exist
4. **Discoverable:** Can detect new sections without code changes

### Implementation Checklist

- [ ] Create `extract_available_sections()` method
- [ ] Build `SECTION_URL_MAP` dictionary
- [ ] Update `parse_species_index()` to use dynamic sections
- [ ] Add logging to report which sections were found/skipped
- [ ] Test with various species IDs (some with all sections, some with partial)
- [ ] Update spider README with new behavior
- [ ] Consider caching menu structure if scraping multiple times

### Testing Strategy

Test with species that have:
1. All sections (comprehensive species)
2. Missing some human uses sections
3. Missing conservation data
4. Only basic data

Example test species IDs to validate:
- Species #172 (has handicrafts)
- Species #109 (reference from handicrafts.html)
- Find species with minimal data

### Notes

- Keep backward compatibility option via spider argument
- Consider adding a `--strict` mode that fails on missing expected sections
- Log warnings when expected sections are missing from menu
