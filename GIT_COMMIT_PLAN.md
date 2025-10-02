# Git Commit & Documentation Plan for Wildex

## Current State Analysis

**What we got:**

- Astro + TailwindCSS web app (wildex)
- Scrapy spider project for species data extraction
- Some spider output files scattered around (both in root and spider/output)
- No main project README documenting the whole shebang
- Spider has minimal README with just run commands

**Current git status shows:**

- Modified: `.vscode/settings.json`
- Untracked: spider/, ui-mockups/, CLAUDE.md, and several JSON files

---

## Questions for You (Before Implementation)

### 1. Spider Output Data Strategy

You mentioned wanting to keep "some output data" in git as reference. Which approach speaks to you?

**Option A: Sample Files Only**

- Keep 1-2 small sample outputs (like `species-batch-of-2.json`)
- Ignore large outputs like `species-batch-of-5.json`, `species-172.json`
- Put samples in `spider/examples/` or `spider/sample-output/`

keep `species-batch-of-5.json` and `species-172.json` in `spider/output`

**Option B: Latest Snapshots**

- Keep the most recent/canonical output files
- Maybe in a dedicated `data/reference/` directory
- Version them so we can track changes over time

**Option C: Minimal Reference**

- Just keep structure examples (empty or single record)
- Actual data lives outside git or in releases

### 2. Spider Logs & Artifacts

Currently I see `spider.log` (200KB!) and `.venv` in spider directory:

- Should we ignore all `*.log` files? yes
- Should we ignore `.venv` (virtual environment)? yes
- Any other generated files to exclude?

### 3. UI Mockups

You've got `ui-mockups/` with HTML files and JSON data:

- Keep these in git? (they look like design artifacts) keep
- Or are they temporary exploration files?

### 4. CLAUDE.md

Your instructions file - I assume we're keeping this, yeah? (It's brilliant btw 💀) keep

---

## Proposed Plan

### Phase 1: Gitignore Cleanup

**Update `.gitignore` to exclude:**

```
# Python virtual environments
spider/.venv/
spider/**/__pycache__/

# Spider artifacts
spider/*.log
spider/spider.log

# Large output files (keep samples only)
spider/species-batch-of-*.json
spider/species-*.json
spider/species_links.json

# Keep output directory but ignore large files
spider/output/*.json
!spider/output/.gitkeep

# OR keep specific sample files (you decide): yes
# !spider/output/species-batch-of-2.json

# Build artifacts
dist/
.astro/
node_modules/

# Environment & OS
.env*
!.env.example
.DS_Store
*.log
```

### Phase 2: Documentation Structure

**Create comprehensive README.md (root):**

- Project overview (what wildex is about)
- Tech stack (Astro, Tailwind, Scrapy)
- Directory structure explanation
- Quick start guide for both web app and spider
- Development workflow

**Enhance spider/README.md:**

- Setup instructions (Python version, uv installation)
- Virtual environment setup
- Available spiders and what they do
- Command examples with explanations
- Output format documentation
- Troubleshooting common issues

**Additional docs to consider:**

- `CONTRIBUTING.md` (if you want others to contribute)
- `spider/DEVELOPMENT.md` (detailed spider development guide)
- `docs/SPIDER_OUTPUT.md` (document the JSON schema)

### Phase 3: Data Organization

**Proposed structure:**

```
wildex/
├── spider/
│   ├── examples/           # NEW: Sample outputs for reference
│   │   ├── species-single.json
│   │   └── species-batch.json
│   ├── output/            # Keep but gitignore contents
│   │   └── .gitkeep
│   └── ...existing files
```

Move sample files to examples, add to git. All other outputs stay gitignored.

### Phase 4: Commit Strategy

**Commit sequence (so history tells a story):**

1. **First commit: Gitignore updates**

   - Update .gitignore with exclusions
   - Prevents accidentally committing junk

2. **Second commit: Documentation**

   - Main README.md
   - Enhanced spider/README.md
   - Any additional docs

3. **Third commit: Spider project**

   - All spider code and configs
   - Sample output files (in examples/)
   - Spider documentation

4. **Fourth commit: UI mockups** (if keeping them)

   - All ui-mockups/ content

5. **Fifth commit: Config & misc**
   - CLAUDE.md
   - .vscode/settings.json changes
   - Any other configs

### Phase 5: GitHub Push

- Verify remote is set: `git remote -v`
- Push to GitHub: `git push -u origin main`
- Add repo description and topics on GitHub
- Consider adding GitHub Actions for linting/testing later

---

## Open Questions Summary

1. **Which sample output files to keep?** (and where to put them)
2. **Keep ui-mockups in git?** (yes/no)
3. **Any secrets or sensitive data in any files?** (API keys, credentials)
4. **Want a LICENSE file?** (MIT, GPL, etc.) the most open license
5. **Want to set up any GitHub-specific files?** (.github/workflows, issue templates, etc.) nah

---

## Expected Outcome

After this plan executes:

- ✅ Clean git history with logical commits
- ✅ Comprehensive documentation for both web app and spiders
- ✅ Proper gitignore preventing bloat
- ✅ Sample data for reference without repo bloat
- ✅ Ready for collaboration or deployment
- ✅ GitHub repo is organized and welcoming

---

## Timeline Estimate

- Answering questions: 5 minutes
- Implementing changes: 15-20 minutes
- Review & adjustments: 5-10 minutes
- **Total: ~30-40 minutes**

---

**Next Steps:**
Review this plan, answer the questions, and I'll execute with the precision of a caffeinated developer at 3 AM (but with better judgment).
