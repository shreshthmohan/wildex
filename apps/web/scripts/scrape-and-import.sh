#!/bin/bash

# Script to scrape a species and import it to the database
# Usage: ./scripts/scrape-and-import.sh <species_id> [--local|--remote|--both]

set -e  # Exit on error

# Check if species_id is provided
if [ -z "$1" ]; then
  echo "Error: Species ID is required"
  echo "Usage: $0 <species_id> [--local|--remote|--both]"
  echo "Example: $0 120 --remote"
  echo "Example: $0 120 --both"
  exit 1
fi

SPECIES_ID=$1
DB_TARGET=${2:-"--local"}  # Default to local if not specified

# Validate DB_TARGET
if [ "$DB_TARGET" != "--local" ] && [ "$DB_TARGET" != "--remote" ] && [ "$DB_TARGET" != "--both" ]; then
  echo "Error: Second argument must be --local, --remote, or --both"
  echo "Usage: $0 <species_id> [--local|--remote|--both]"
  exit 1
fi

echo "===================="
echo "Scraping species ID: $SPECIES_ID"
echo "Target database: $DB_TARGET"
echo "===================="

# Step 1: Scrape the species
echo ""
echo "Step 1/3: Scraping species data..."
(cd ../../spider && uv run scrapy crawl species -a species_id=$SPECIES_ID)

# Step 2: Generate SQL
echo ""
echo "Step 2/3: Generating SQL..."
pnpm db:generate-single $SPECIES_ID

# Step 3: Import to database
echo ""
echo "Step 3/3: Importing to database..."

if [ "$DB_TARGET" = "--both" ]; then
  echo "  → Importing to local database..."
  pnpm wrangler d1 execute foresty-db --local --file=scripts/populate-single.sql -y

  echo ""
  echo "  → Importing to remote database..."
  pnpm wrangler d1 execute foresty-db --remote --file=scripts/populate-single.sql -y
else
  echo "  → Importing to $DB_TARGET database..."
  pnpm wrangler d1 execute foresty-db $DB_TARGET --file=scripts/populate-single.sql -y
fi

echo ""
echo "===================="
echo "✅ Successfully scraped and imported species ID: $SPECIES_ID"
echo "===================="
