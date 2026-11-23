# Pagination Plan for Species List

## Goal
Add pagination to the species list page showing 20 results per page.

## Approach
Follow progressive enhancement pattern - use URL params for pagination state.

## Implementation Steps

### 1. URL Structure
- Use `?page=1` URL parameter (default to page 1 if not present)
- Combine with existing search: `?search=term&page=2`
- Page numbers are 1-indexed for user-friendliness

### 2. Loader Changes (Server-side)
No changes needed - continue returning all data. Filtering happens client-side since:
- Data is already loaded from DB and JSON file
- Allows fast client-side filtering without additional DB queries
- Search + pagination can work together seamlessly

### 3. Component Changes

#### Read page from URL
```tsx
const page = parseInt(searchParams.get("page") || "1", 10);
```

#### Calculate pagination
```tsx
const ITEMS_PER_PAGE = 20;
const totalPages = Math.ceil(filteredComparison.length / ITEMS_PER_PAGE);
const startIndex = (page - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;
const paginatedResults = filteredComparison.slice(startIndex, endIndex);
```

#### Pagination UI Components
- Previous/Next buttons
- Page numbers (show current page and neighbors)
- First/Last page links
- Info text: "Showing X-Y of Z species"

### 4. Pagination Controls Design
Using brutalist design system (matching existing):
- Bold borders (border-2)
- Black/white color scheme
- Clear, large text
- Links for all navigation (GET requests)

### 5. URL Building for Links
Preserve search params when changing pages:
```tsx
const buildPageUrl = (newPage: number) => {
  const params = new URLSearchParams();
  if (searchQuery) params.set("search", searchQuery);
  params.set("page", String(newPage));
  return `/?${params.toString()}`;
};
```

### 6. Edge Cases
- Invalid page numbers (< 1 or > totalPages) → show page 1
- Empty results → show "no results" message, hide pagination
- Search changes → reset to page 1
- When search is cleared → reset to page 1

### 7. Accessibility
- Clear labels for screen readers
- Disabled state styling for current page
- Keyboard navigation (Links are naturally keyboard accessible)

## Benefits
- Works without JavaScript (plain links)
- Bookmarkable pagination state
- Browser back/forward works naturally
- Search + pagination state in URL
- No client-side state management needed
