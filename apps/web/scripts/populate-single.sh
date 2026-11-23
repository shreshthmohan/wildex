#!/bin/bash
# Wrapper script to populate a single species into the database

# Pass all arguments to the generate script
pnpm db:generate-single "$@"

# Run wrangler without arguments
pnpm wrangler d1 execute foresty-db --local --file=scripts/populate-single.sql
