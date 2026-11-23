# Wildex

Species documentation, built from Auroville Herbarium data.

- `apps/web`: the main app (React Router on Cloudflare Workers with D1). Formerly `foresty`. It still deploys to the `foresty` Worker and `foresty-db`.
- `apps/site`: the Astro site with the Wildex articles and design work.
- `spider`: the Scrapy scraper shared by the project. Scraped output goes to `spider/output/` and is not tracked.
- `spider/reference`: older scrape samples kept for reference.

Run `pnpm install`, then `pnpm dev` for the app or `pnpm dev:site` for the Astro site.
