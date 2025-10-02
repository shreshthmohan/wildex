# Species Data Scraping Plan - Auroville Herbarium

## Overview

Each species has a main page (`herbarium.php?id=<number>`) that serves as an index with:

- Basic specimen info (name, family, collection details)
- Navigation menu to detailed content pages
- Main specimen image
- Dry herbarium image

The detailed content is loaded via JavaScript/AJAX calls to separate PHP pages based on menu clicks.

---

## HTML Structure Analysis

### 1. Main Species Index Page (`herbarium.php?id=141`)

**Available directly on index:**

```html
<!-- Line 72-73: Specimen Header -->
<div id="specimen_title">
  Acacia holosericea <span class="specimen_title2">A.Cunn. ex G.Don</span>
</div>
<div id="specimen_family">Fabaceae</div>

<!-- Line 78: Main specimen image -->
<div id="specimen_img">
  <img
    src="https://admin.aurovilleherbarium.org/img/plants/main/acacia_holosericea.jpg"
    ...
  />
</div>

<!-- Line 173: Dry herbarium image -->
<a href="#"
  ><img
    src="https://admin.aurovilleherbarium.org/img/dryherbarium/Ac.ho_herb1.jpg"
    ...
/></a>

<!-- Lines 279-287: Collection metadata -->
<div id="notes_title">Date of collection</div>
<div id="notes_content">17 Feb, 2016</div>
<div id="notes_title">Collected by</div>
<div id="notes_content">N.L.I.B.</div>
<div id="notes_title">GPS coordinates</div>
<div id="notes_content"><pre>11.99621 N - 79.82411 E</pre></div>
<div id="notes_title">Locality</div>
<div id="notes_content">
  Pitchandikulam Forest, Auroville, Tamil Nadu, India
</div>
```

### 2. Navigation Menu Structure (Lines 100-166)

The menu reveals the data structure available for each species:

**Description sections:**

- Habit → `contents/description-habit.php?id=<id>`
- Leaf → `contents/description-leaf.php?id=<id>`
- Flower → `contents/description-flower.php?id=<id>`
- Fruit → `contents/description-fruit.php?id=<id>`
- Seed → `contents/description-seed.php?id=<id>`
- Stem & Bark → `contents/description-stem.php?id=<id>`

**Other sections:**

- Nomenclature → `contents/nomenclature.php?id=<id>`
- Phenology → `contents/phenology.php?id=<id>`
- Reproduction & Dispersal → `contents/reproduction.php?id=<id>`
- Ecology & Distribution → `contents/ecology-distribution.php?id=<id>`

**Human uses:**

- Culinary → `contents/culinary.php?id=<id>`
- Veterinary → `contents/veterinary.php?id=<id>`
- Others → `contents/others.php?id=<id>`

**Status:**

- Reforestation → `contents/reforestation.php?id=<id>`
- Conservation status → `contents/status.php?id=<id>`
- Dry Herbarium → `contents/dry-herbarium.php?id=<id>`

---

## Proposed JSON Structure (Updated based on actual HTML)

```json
{
  "species_id": 141,
  "url": "https://aurovilleherbarium.org/herbarium.php?id=141",
  "scraped_at": "2025-01-15T10:30:00Z",

  "basic_info": {
    "scientific_name": "Acacia holosericea",
    "authority": "A.Cunn. ex G.Don",
    "family": "Fabaceae",
    "common_names": {
      "english": ["Soapbush wattle", "strap wattle"],
      "indian": "Not specified"
    }
  },

  "images": {
    "main_specimen": "https://admin.aurovilleherbarium.org/img/plants/main/acacia_holosericea.jpg",
    "dry_herbarium": "https://admin.aurovilleherbarium.org/img/dryherbarium/Ac.ho_herb1.jpg",
    "thumbnail": "https://admin.aurovilleherbarium.org/img/vignettes/acacia_holosericea.jpg"
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
      "Acacia holosericea var. multispirea Domin",
      "Acacia holosericea var. typica Domin",
      "Acacia mangium var. holosericea (G.Don) C.T.White",
      "Racosperma holosericeum (G.Don) Pedley"
    ],
    "etymology": "- Acacia : From the Greek akakia used by Dioscorides ; from ake, akis 'tip, thorn'.\n- Holosericea : Completely silky-haired.",
    "source": "The Plant List, 2015, http://www.theplantlist.org"
  },

  "description": {
    "habit": {
      "text": "Acacia holosericea is a thornless, small-sized and evergreen tree growing up to 8-10 m high.",
      "images": [
        {
          "url": "https://admin.aurovilleherbarium.org/img/plants/habit/acacia_holosericea_habit1.jpg",
          "caption": "Acacia holosericea young trees"
        },
        {
          "url": "https://admin.aurovilleherbarium.org/img/plants/habit/acacia_holosericea_habit2.jpg",
          "caption": "Acacia holosericea tree"
        },
        {
          "url": "https://admin.aurovilleherbarium.org/img/plants/habit/acacia_holosericea_habit3.jpg",
          "caption": "Acacia holosericea seedlings"
        }
      ]
    },
    "leaf": {
      "text": "The leaf of Acacia holosericea is actually an expanded petiole resembling and having the function of a leaf, a phyllode.\nThe phyllodes of Acacia holosericea grow alternately on the stem (spirally arranged).\nThe phyllode is coriaceous and densely covered with short hairs (silky) on both sides. It is greyish-whitish and light green-coloured.\nThe phyllode of Acacia holosericea is 15-20 cm long and 3-5 cm wide. The shape is elliptic and falcate, the apex is obtuse or acute, the base is attenuate and the margins are entire.\nThe phyllode has parallel and arching veins.",
      "images": [
        {
          "url": "https://admin.aurovilleherbarium.org/img/plants/leaf/acacia_holosericea_leaf1.jpg",
          "caption": "Acacia holosericea twig"
        },
        {
          "url": "https://admin.aurovilleherbarium.org/img/plants/leaf/acacia_holosericea_leaf2.jpg",
          "caption": "Acacia holosericea phyllode"
        }
        // ... more images
      ]
    },
    "flower": {
      "text": "...",
      "images": []
    },
    "fruit": {
      "text": "...",
      "images": []
    },
    "seed": {
      "text": "...",
      "images": []
    },
    "stem_bark": {
      "text": "...",
      "images": []
    }
  },

  "ecology": {
    "phenology": {
      "text": "...",
      "images": []
    },
    "reproduction_dispersal": {
      "text": "...",
      "images": []
    },
    "distribution": {
      "text": "...",
      "images": []
    }
  },

  "human_uses": {
    "culinary": {
      "text": "...",
      "images": []
    },
    "veterinary": {
      "text": "...",
      "images": []
    },
    "others": {
      "text": "...",
      "images": []
    }
  },

  "conservation": {
    "status": {
      "text": "...",
      "images": []
    },
    "reforestation": {
      "text": "...",
      "images": []
    }
  }
}
```

**Note:** All description/ecology/uses sections follow the same pattern:

- `text`: Rich HTML content (preserve formatting like bold, italic, line breaks)
- `images`: Array of `{url, caption}` objects

---

## Implementation Strategy

### Phase 1: Index Page Scraping ✓ (Already done)

- Extract species links from `menu_species.php`
- Get basic preview data (name, thumbnail, common names)

### Phase 2: Main Species Page Scraping (Current)

**Approach: Direct URL construction**

Since the navigation uses JavaScript/AJAX, we have two options:

**Option A: Direct URL Construction (Recommended)**

- Construct all content URLs directly: `contents/<section>.php?id=<id>`
- Follow each URL and scrape content
- More reliable, faster, no JavaScript rendering needed

**Option B: JavaScript Rendering**

- Use Scrapy-Splash or Playwright to render JavaScript
- Click through menu items
- More complex, slower, resource-intensive

**Recommendation: Use Option A** - The URL pattern is predictable and doesn't require JavaScript rendering.

### Phase 3: Content Page Scraping

For each species ID, scrape:

1. **Main index page** (`herbarium.php?id=<id>`)

   - Basic info, images, collection metadata

2. **Content pages** (parallel requests)
   - Description pages (habit, leaf, flower, fruit, seed, stem)
   - Nomenclature
   - Ecology pages (phenology, reproduction, distribution)
   - Human uses (culinary, veterinary, others)
   - Conservation (status, reforestation)
   - Dry herbarium images

### Phase 4: Data Extraction Per Page Type ✓ (Sample pages analyzed)

**HTML Structure Patterns Identified:**

#### Description Pages (habit, leaf, flower, fruit, seed, stem)

```html
<div id="specimen_wrapper">
  <div id="titre_content"><span class="titre">{ Description | Habit }</span></div>
  <div id="plant_content_wraper">

    <!-- Text content -->
    <div id="plant_txt">
      <p>
        <p><i>Acacia holosericea</i> is a thornless, small-sized and <strong>evergreen tree</strong> growing up to 8-10 m high.</p>
      </p>
    </div>

    <!-- Multiple images with captions -->
    <div id="specimen_img">
      <img class='plant_image' src="https://admin.aurovilleherbarium.org/img/plants/habit/acacia_holosericea_habit1.jpg" .../>
    </div>
    <div id="specimen_legend">Acacia holosericea young trees</div>

    <div id="specimen_img">
      <img class='plant_image' src="...habit2.jpg" .../>
    </div>
    <div id="specimen_legend">Acacia holosericea tree</div>
    <!-- ... more images -->

  </div>
</div>
```

**Extractor Pattern:**

- **Text**: `div#plant_txt p` (clean HTML tags, extract formatted text)
- **Images**: `div#specimen_img img::attr(src)`
- **Captions**: `div#specimen_legend::text` (paired with images)
- **Section title**: `div#titre_content span.titre::text`

#### Nomenclature Page

```html
<div id="plant_txt">
  <p>
    <li>
      <span class="titchap">Botanical name :</span> <em>Acacia holosericea</em>
    </li>
    <li>
      <span class="titchap">Author :</span>
      <p>Cunningham, Allan (1832)</p>
    </li>
    <li><span class="titchap">Family :</span> Fabaceae</li>
    <li>
      <span class="titchap">English names :</span> Soapbush wattle, strap wattle
    </li>
    <li>
      <span class="titchap">Indian names (phonetics) :</span><br />
      <p>Not specified.</p>
    </li>
    <li>
      <span class="titchap">Synonyms :</span><br />
      <p><i>Acacia holosericea var. glabrata</i> Maiden<br />...</p>
    </li>
    <li>
      <span class="titchap">Etymology :</span><br />
      <p>- <i>Acacia</i> : From the Greek <i>akakia</i>...<br />...</p>
    </li>
  </p>
</div>
```

**Extractor Pattern:**

- Structured list with `<span class="titchap">` labels
- Extract key-value pairs:
  - `Botanical name`: `li:contains("Botanical name") em::text`
  - `Author`: `li:contains("Author") p::text`
  - `Family`: `li:contains("Family")::text` (remove label)
  - `English names`: `li:contains("English names")::text`
  - `Indian names`: `li:contains("Indian names") p::text`
  - `Synonyms`: `li:contains("Synonyms") p` (parse line-separated italic text)
  - `Etymology`: `li:contains("Etymology") p::text`

---

## Scrapy Implementation Plan

### Spider Structure

```python
class AhSpeciesSpider(scrapy.Spider):
    name = "ah-species"

    def start_requests(self):
        # Start with species list or specific IDs
        for species_id in species_ids:
            yield scrapy.Request(
                f'https://aurovilleherbarium.org/herbarium.php?id={species_id}',
                callback=self.parse_species_index
            )

    def parse_species_index(self, response):
        # Extract basic info, images, metadata
        species_data = {
            'species_id': extract_id(response.url),
            'basic_info': {...},
            'images': {...},
            'collection_metadata': {...}
        }

        # Follow all content pages
        content_pages = [
            ('habit', 'contents/description-habit.php'),
            ('leaf', 'contents/description-leaf.php'),
            # ... etc
        ]

        for section_name, url_path in content_pages:
            yield response.follow(
                f'{url_path}?id={species_id}',
                callback=self.parse_content_page,
                meta={'species_data': species_data, 'section': section_name}
            )

    def parse_content_page(self, response):
        # Extract content based on section type
        # Aggregate with species_data
        # Yield complete record when all sections done
        pass
```

### Data Aggregation Strategy

**Option 1: Use Scrapy Items/Pipelines**

- Create Species item
- Use pipeline to aggregate sub-page data
- Store when complete

**Option 2: Manual aggregation in spider**

- Use `meta` to pass data between callbacks
- Count responses and yield when complete

---

## CSS Selectors Reference (Implementation Ready)

### Main Index Page (`herbarium.php?id=<id>`)

```python
# Basic info
scientific_name = response.css('div#specimen_title::text').get().strip()
authority = response.css('div#specimen_title span.specimen_title2::text').get().strip()
family = response.css('div#specimen_family::text').get().strip()

# Images
main_specimen_img = response.css('div#specimen_wrapper div#specimen_img img::attr(src)').get()
dry_herbarium_img = response.css('div#dryherbarium-img img::attr(src)').get()

# Collection metadata
notes = response.css('div#notes_wrapper2')
date = notes.css('div#notes_title:contains("Date") + div#notes_content::text').get()
collected_by = notes.css('div#notes_title:contains("Collected") + div#notes_content::text').get()
gps = notes.css('div#notes_title:contains("GPS") + div#notes_content pre::text').get()
locality = notes.css('div#notes_title:contains("Locality") + div#notes_content::text').get()
```

### Description Pages (habit, leaf, flower, fruit, seed, stem)

```python
# Text content (preserve HTML for formatting)
text_html = response.css('div#plant_txt').get()
text_clean = response.css('div#plant_txt p::text').getall()  # or extract with HTML

# Images with captions (pair them correctly)
images = []
img_divs = response.css('div#specimen_img')
for img_div in img_divs:
    url = img_div.css('img::attr(src)').get()
    # Caption is in the next sibling div
    caption = img_div.xpath('following-sibling::div[@id="specimen_legend"][1]/text()').get()
    images.append({'url': url, 'caption': caption})
```

### Nomenclature Page

```python
# Extract structured list items
botanical_name = response.css('li:contains("Botanical name") em::text').get()
author = response.css('li:contains("Author") p::text').get()
family = response.css('li:contains("Family")::text').re(r'Family\s*:\s*(.+)')[0]
english_names = response.css('li:contains("English names")::text').re(r'English names\s*:\s*(.+)')[0]
indian_names = response.css('li:contains("Indian names") p::text').get()

# Synonyms - extract all italic text from paragraph
synonyms_html = response.css('li:contains("Synonyms") p').get()
synonyms = response.css('li:contains("Synonyms") p i::text').getall()

# Etymology
etymology = response.css('li:contains("Etymology") p').get()  # Keep HTML for formatting
```

## Next Steps ✓ (Updated)

1. ~~**Get sample content pages**~~ ✓ Done - analyzed habit, leaf, nomenclature
2. ~~**Design extractors**~~ ✓ Done - CSS selectors documented above
3. **Implement spider** - Build the multi-page scraping logic with:
   - Item class for species data structure
   - Parse methods for each section type
   - Data aggregation pipeline
4. **Test & validate** - Run on species ID 141 (Acacia holosericea) first
5. **Scale** - Run on all ~340 species

---

## Considerations

### Rate Limiting

- Keep `DOWNLOAD_DELAY = 1` second
- Each species has ~15-20 sub-pages
- Total requests: ~340 species × 20 pages = ~6,800 requests
- Estimated time: ~2 hours with 1-second delay

### Error Handling

- Some species may not have all sections
- Handle missing pages gracefully
- Log which sections are available/missing

### Data Validation

- Ensure GPS coordinates parse correctly
- Validate image URLs are accessible
- Check for empty/null sections

### Storage

- JSON Lines format recommended for large dataset
- One JSON object per species
- Easy to process incrementally
