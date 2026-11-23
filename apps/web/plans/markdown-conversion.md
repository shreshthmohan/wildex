# Markdown Conversion Plan

## Overview
Convert species data storage from HTML to Markdown, enabling easier editing while maintaining rich formatting.

## Goals
1. Store section content as Markdown instead of HTML
2. Combine `human_uses` subsections into one section with h3 headings
3. Enable easier content editing in the future
4. Render markdown as HTML in the frontend

## Current State
- **Database**: `sections` table has `content_text` (plain text) and `content_html` (HTML)
- **Data source**: Scraped JSON has `text` and `text_html` for each section
- **Frontend**: Currently renders... (TODO: check what we're rendering)

## Proposed Changes

### 1. Database Schema Changes
**File**: `migrations/`

- [ ] Remove `content_html` column from `sections` table
- [ ] Rename `content_text` to `content_markdown` (for clarity) OR keep as `content_text` but store markdown
- [ ] Migration strategy:
  - Create new migration file
  - Drop the `content_html` column
  - Optionally rename `content_text` → `content_markdown`

**Decision needed**: Keep column name as `content_text` or rename to `content_markdown`?

### 2. Data Generation Script Changes
**File**: `scripts/generate-sql.ts`

#### a. Install HTML-to-Markdown converter
```bash
pnpm add turndown
pnpm add -D @types/turndown
```

#### b. Convert HTML to Markdown
- Use `turndown` library to convert `text_html` → markdown
- Preserve formatting: bold, italic, line breaks, links, etc.
- Handle edge cases (nested tags, malformed HTML)

#### c. Combine human_uses sections
For `human_uses` object with subsections like `veterinary`, `culinary`, `handicrafts`:

```markdown
### Veterinary
[converted markdown from veterinary.text_html]

### Culinary
[converted markdown from culinary.text_html]

### Handicrafts
[converted markdown from handicrafts.text_html]
```

- Transform subsection keys: `veterinary` → `Veterinary`, `reproduction_dispersal` → `Reproduction Dispersal`
- Join with double newlines between sections

#### d. Handle all sections
**Decision needed**:
- Option A: Convert only `human_uses` to markdown for now
- Option B: Convert all sections (description, ecology, conservation) to markdown

### 3. Frontend Rendering Changes

#### a. Install Markdown renderer
Choose one:
- `marked` - Simple, fast, popular
- `remark` / `remark-html` - More powerful
- `markdown-it` - Feature-rich

**Recommendation**: Start with `marked` for simplicity

```bash
pnpm add marked
pnpm add -D @types/marked
```

#### b. Render in loader or component
**File**: `app/routes/species.$id.tsx` (TODO: check actual file)

Option A - Render in loader (server-side):
```typescript
import { marked } from 'marked';

export async function loader({ params }) {
  const sections = await db.query(...);

  // Convert markdown to HTML
  const sectionsWithHtml = sections.map(section => ({
    ...section,
    html: marked(section.content_markdown)
  }));

  return { sections: sectionsWithHtml };
}
```

Option B - Render in component (client-side):
```typescript
import { marked } from 'marked';

export default function Species() {
  const { sections } = useLoaderData();

  return sections.map(section => (
    <div dangerouslySetInnerHTML={{ __html: marked(section.content_markdown) }} />
  ));
}
```

**Recommendation**: Render in loader (server-side) for better performance and SEO

#### c. Sanitize HTML output
**Security consideration**: Since we're using `dangerouslySetInnerHTML`, we should sanitize the HTML

```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

### 4. Future: Editing Support
Once markdown is in place, editing becomes simpler:
- Show `<textarea>` with markdown content
- Optional: Add markdown preview
- Optional: Add simple markdown toolbar
- Submit form → update `content_markdown` in database

## Implementation Order

### Phase 1: Setup
1. [ ] Install dependencies (`turndown`, `marked`, `dompurify`)
2. [ ] Create database migration to remove `content_html`
3. [ ] Run migration on local database

### Phase 2: Data Generation
4. [ ] Update `scripts/generate-sql.ts`:
   - [ ] Add turndown converter
   - [ ] Create helper function to convert HTML → Markdown
   - [ ] Update section generation to use markdown
   - [ ] Combine `human_uses` with h3 headings
5. [ ] Test: Generate SQL for species-8
6. [ ] Verify: Check generated markdown looks correct
7. [ ] Populate database with new data

### Phase 3: Frontend Rendering
8. [ ] Update species detail page loader to convert markdown → HTML
9. [ ] Add HTML sanitization
10. [ ] Test: View species page, verify rendering works

### Phase 4: Testing
11. [ ] Test with multiple species
12. [ ] Verify all formatting preserved (bold, italic, links)
13. [ ] Check image captions still work
14. [ ] Test edge cases

## Questions to Resolve

1. **Column naming**: Keep `content_text` or rename to `content_markdown`?
2. **Conversion scope**: Convert all sections or just `human_uses`?
3. **Markdown library**: Use `marked` or another library?
4. **Render location**: Server-side (loader) or client-side (component)?
5. **Existing data**: Do we need to migrate existing data, or is local DB recreatable?

## Notes

- The scraped JSON will remain unchanged (still has both `text` and `text_html`)
- We're only changing how we store and render the data
- Markdown makes future editing much easier
- This approach is more "progressive enhancement" friendly

## Rollback Plan

If issues arise:
1. Keep migration file to restore `content_html` column
2. Revert `generate-sql.ts` changes
3. Re-run old SQL generation
4. Revert frontend changes
