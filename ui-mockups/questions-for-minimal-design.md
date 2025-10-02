# Questions for Minimal Species Viewer Design

## Navigation & Layout

1. **Navigation style preference?**

   - Horizontal tabs at the top (like classic browser tabs)?
   - Vertical sidebar navigation (left or right)? yes, right
   - Top sticky menu bar with anchor links?
   - Or something more experimental (accordion sections that expand/collapse)?

2. **Mobile navigation behavior?**

   - Should it become a hamburger menu on mobile? yes on the bottom left, but be aware of the dynamic screen heights in mobile browsers
   - Or convert to a horizontal scrollable tab bar?
   - Or just stack vertically with jump links at the top?

3. **Section organization?**
   - Should all sections be on one long page (scroll to navigate)? yes
   - Or show one section at a time with tab-style switching (using `:target` CSS selector)?

## Visual Design

4. **Serif font vibe?**

   - Classic/traditional (like Georgia, Times)?
   - Modern serif (like Crimson Text we used before)? yes
   - Something else specific you have in mind?

5. **Image galleries?**

   - Should images be inline with text? yes
   - Galleries with thumbnails?
   - Or lightbox/modal style (can be done without JS using `:target`)?

6. **Black & white aesthetic:**
   - Pure black (#000) and pure white (#fff)? this for now
   - Or softer grays for better readability (#222, #eee, etc.)?
   - Any desire for subtle borders/shadows or keep it super flat? keep it simple for now

## Data Display

7. **Species selector:**

   - You mentioned changing species "within the script" - so just a variable at top like we did before? yes
   - No UI selector needed, right? (keeps it simple)

8. **Empty data handling?**
   - Some species might not have all sections (e.g., no "uses" data)
   - Should we hide those sections entirely or show "No data available"? no data available

## My Assumptions (tell me if I'm wrong!)

- Static HTML page (no build process)
- Works 100% without JavaScript (JS only for loading JSON data into DOM on page load)
- Print-friendly would be nice? sure!
- Accessibility is paramount (keyboard nav, screen readers, semantic HTML)

Let me know your preferences and I'll craft something rad! 🌿
