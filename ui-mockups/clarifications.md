# Clarifications for Species Viewer UI

## 1. Navigation Sections - What to Include?

Based on the JSON structure, I see these potential sections:

### Core sections (always present):

- Basic Info (scientific name, family, authority)
- Collection Metadata (date, location, GPS, collector)
- Nomenclature (etymology, synonyms, English/Indian names)

### Variable content sections:

- **Description subsections:**

  - Habit (overall plant form)
  - Stem/Bark
  - Leaf
  - Flower
  - Fruit
  - Seed

- **Ecology subsections:**

  - Distribution
  - Reproduction & Dispersal
  - Phenology (seasonal patterns)

- **Human Uses subsections:**

  - Culinary
  - Veterinary
  - Others

- **Conservation:**
  - Status
  - Reforestation/Planting advice

**Questions:**

- Should I group these into main categories (e.g., "Description", "Ecology", "Uses", "Conservation") with sub-navigation? yes
- Or flat list all subsections that have data?
- Should "Images" be a separate section showing all images together, or keep images inline with each section? keep images inline with each section (not a separate section)

## 2. Right Sidebar Navigation - Details

You mentioned right sidebar. Some specifics:

- **Width:** Narrow (150px) or more spacious (250px)? you take a call
- **Sticky/Fixed:** Should it scroll with page or stay fixed while content scrolls? sticky
- **Current section indicator:** Highlight which section you're currently viewing (can do with `:target` CSS)? sure!

## 3. Mobile Bottom-Left Navigation (okay make this botton right actually)

You mentioned bottom-left hamburger with awareness of dynamic screen heights.

- **Menu style when opened:**

  - Slide-up panel from bottom?
  - Overlay menu? this
  - Push content up?

- **Safe area handling:**
  - Should I use `env(safe-area-inset-bottom)` for notch/home indicator spacing? let's try this
  - Fixed distance from bottom (like 20px) plus safe-area?

## 4. Typography Scale

For the serif font (Crimson Text):

- **Headings:** What size hierarchy feels right? use tailwind defaults, choose ones yourself

  - Species name (h1): 2.5rem? 3rem?
  - Section headings (h2): 1.75rem? 2rem?
  - Subsection headings (h3): 1.25rem?

- **Body text:** 1rem (16px) or slightly larger for readability (1.125rem/18px)? larger (use tailwind default classes)

## 5. Image Display

You said "inline with text" - specifics:

- **Image layout within a section:**

  - One image per row (full width)?
  - Two images side-by-side on desktop?
  - Simple vertical stack? this

- **Image captions:** Below images in smaller text? sure

- **Aspect ratio handling:** Let images keep natural aspect ratio or constrain max-height? constrain (to be a bit smaller than screen height)

## 6. Species Switcher in Script

Just to confirm the approach:

```javascript
// Top of script
const CURRENT_SPECIES_ID = 172; // Change this to switch species // instead allow me to specify the array index

// Then find and render that species from the array
```

Is that the vibe you want? Simple variable swap?

## 7. Section Order Preference

Default order I'm thinking:

1. Basic Info (name, family)
2. Images (main specimen + herbarium)
3. Collection Metadata
4. Nomenclature
5. Description (habit → stem → leaf → flower → fruit → seed)
6. Ecology
7. Human Uses
8. Conservation

Sound good or different order?

---

Let me know your thoughts and I'll build this! 🌿
