# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Database Setup

This project uses Cloudflare D1 for the database.

1. Create the D1 database:

```bash
pnpm wrangler d1 create foresty-db
```

2. Add the database binding to `wrangler.jsonc` (already configured):

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "foresty-db",
    "database_id": "f7836b69-2a9e-48ac-8bdc-f7be6aa495eb"
  }
]
```

3. Apply migrations to local database:

```bash
pnpm wrangler d1 migrations apply foresty-db --local
```

4. Apply migrations to remote database (when ready to deploy):

```bash
pnpm wrangler d1 migrations apply foresty-db --remote
```

### Development

Start the development server with HMR:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
pnpm run preview
```

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
pnpm run deploy
```

To deploy a preview URL:

```sh
pnpm wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
pnpm wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

## Development Workflow

### Local vs Remote Database

- **Local development**: `pnpm dev` (uses local D1 database)
- **Remote development**: `pnpm dev:remote` (uses production D1 database)

### Database Migrations

Apply migrations to local database:
```bash
pnpm wrangler d1 migrations apply foresty-db --local
```

Apply migrations to remote database:
```bash
pnpm wrangler d1 migrations apply foresty-db --remote
```

### Data Population Scripts

The project includes scripts to scrape data from Auroville Herbarium and populate the database.

#### Single Species

Scrape and import a single species:
```bash
./scripts/scrape-and-import.sh <species_id> [--local|--remote|--both]
```

Examples:
```bash
# Import to local database only
./scripts/scrape-and-import.sh 172 --local

# Import to remote database only
./scripts/scrape-and-import.sh 172 --remote

# Import to both local and remote
./scripts/scrape-and-import.sh 172 --both
```

Or use the individual npm scripts:
```bash
# Generate SQL for single species
pnpm db:generate-single 172

# Populate local database
pnpm wrangler d1 execute foresty-db --local --file=scripts/populate-single.sql

# Populate remote database
pnpm wrangler d1 execute foresty-db --remote --file=scripts/populate-single.sql
```

#### All Species

Scrape all species and populate database:
```bash
# For local database
pnpm db:populate-all

# For remote database
pnpm db:generate-all
pnpm wrangler d1 execute foresty-db --remote --file=scripts/populate-all.sql
```

### Web Scraping

The project uses Scrapy to scrape plant species data. See [spider/README.md](../../spider/README.md) for detailed documentation.

Quick commands (run from the repo-root `spider/` directory):
```bash
cd ../../spider

# Get list of all species
uv run scrapy crawl ah-spider -O species_list.json

# Scrape specific species
uv run scrapy crawl species -a species_id=172
```

### Database Queries

For common database queries and examples, see [docs/database.md](docs/database.md).
