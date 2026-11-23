# Wildex

A web application showcasing plant species from the Auroville Herbarium, built with modern web technologies and powered by custom web scrapers.

## Tech Stack

**Web App:**

- [Astro](https://astro.build) - Static site framework
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS

**Data Collection:**

- [Scrapy](https://scrapy.org) - Web scraping framework
- Python 3.13+
- [uv](https://github.com/astral-sh/uv) - Fast Python package installer

## Project Structure

```
wildex/
├── src/                    # Astro web app source
│   ├── components/         # Reusable Astro components
│   ├── data/              # Species data (species.js)
│   ├── layouts/           # Page layouts
│   ├── pages/             # Site pages
│   └── styles/            # Global styles
├── spider/                # Scrapy web scraping project
│   ├── crawler/           # Spider implementations
│   ├── output/            # Sample spider outputs (reference)
│   └── README.md          # Spider documentation
├── ui-mockups/            # Design explorations and mockups
└── public/                # Static assets
```

## Quick Start

### Web App Development

**Install dependencies:**

```sh
pnpm install
```

**Start development server:**

```sh
pnpm dev
```

**Build for production:**

```sh
pnpm build
```

**Preview production build:**

```sh
pnpm preview
```

### Spider (Data Collection)

The spider scrapes plant species data from the Auroville Herbarium website.

**Setup:**

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) if not already installed:

```sh
# macOS (using Homebrew)
brew install uv
```

**Run spider** (from `spider/` directory):

```sh
# Scrape a batch of species
uv run scrapy crawl species -a max_species=5

# Scrape specific species by ID

# automatically saves to output/species/species-172.json
uv run scrapy crawl species -a species_id=172

# save to custom file location
uv run scrapy crawl species -a species_id=172 -O custom-dir/filename.json

# Scrape all species
uv run scrapy crawl species
```

See [`spider/README.md`](spider/README.md) for detailed spider documentation.

## Development Workflow

1. **Scrape data** using the spider (in `spider/` directory)
2. **Process/transform data** as needed
3. **Import into web app** (currently using `src/data/species.js`)
4. **Build and deploy** the Astro site

## Current State

- Species data is currently stored in `src/data/species.js`
- Spider can extract comprehensive species information including descriptions, ecology, human uses, and conservation status
- Web app displays species in card format

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!

## License

MIT
