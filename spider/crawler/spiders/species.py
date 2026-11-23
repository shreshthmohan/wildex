"""
Auroville Herbarium - Full Species Data Scraper

Scrapes complete species information including:
- Main specimen data
- All description sections (habit, leaf, flower, fruit, seed, stem)
- Nomenclature
- Ecology (phenology, reproduction, distribution)
- Human uses (culinary, veterinary, others)
- Conservation (status, reforestation)
"""

import scrapy
from datetime import datetime
import re
from crawler.items import SpeciesItem


class SpeciesSpider(scrapy.Spider):
    name = "species"
    allowed_domains = ["aurovilleherbarium.org"]

    # Base URLs
    base_url = "https://aurovilleherbarium.org"

    # Be polite - wait between requests
    custom_settings = {
        "DOWNLOAD_DELAY": 3,  # Wait 3 seconds between requests
        "RANDOMIZE_DOWNLOAD_DELAY": True,  # Add randomness to avoid patterns
        "ROBOTSTXT_OBEY": False,  # Site doesn't have robots.txt
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,  # Sequential requests
        "RETRY_TIMES": 5,  # Retry failed requests
        "RETRY_HTTP_CODES": [429, 500, 502, 503, 504],

        # Allow 429 and 5xx errors to pass through to retry middleware
        "HTTPERROR_ALLOWED_CODES": [429, 500, 502, 503, 504],

        # Exponential backoff for retries
        "RETRY_BACKOFF_MULTIPLIER": 0.5,  # Wait 0.5s, 1s, 2s, 4s, 8s between retries

        # Incremental saving pipeline
        "ITEM_PIPELINES": {
            "crawler.pipelines.SpeciesAggregationPipeline": 300,  # Aggregates sections
            "crawler.pipelines.IncrementalSavingPipeline": 400,   # Saves immediately
        },

        # Configure output directory for incremental saves
        "INCREMENTAL_OUTPUT_DIR": "output/species",

        "LOG_FILE": "spider.log",  # Write logs to file
        "LOG_FILE_APPEND": False,  # Overwrite log file each run
        "LOG_LEVEL": "INFO",  # INFO, DEBUG, WARNING, ERROR
    }

    # Content pages to scrape for each species
    CONTENT_PAGES = {
        "description": {
            "habit": "contents/description-habit.php",
            "leaf": "contents/description-leaf.php",
            "flower": "contents/description-flower.php",
            "fruit": "contents/description-fruit.php",
            "seed": "contents/description-seed.php",
            "stem_bark": "contents/description-stem.php",
        },
        "ecology": {
            "phenology": "contents/phenology.php",
            "reproduction_dispersal": "contents/reproduction.php",
            "ecology_distribution": "contents/ecology-distribution.php",
        },
        "human_uses": {
            "medicinal": "contents/medicinal.php",
            "culinary": "contents/culinary.php",
            "handicrafts": "contents/handicrafts.php",
            "veterinary": "contents/veterinary.php",
            "others": "contents/others.php",
        },
        "conservation": {
            "status": "contents/status.php",
            "reforestation": "contents/reforestation.php",
        },
    }

    def __init__(self, species_id=None, max_species=None, resume=False, retry_failed=False, *args, **kwargs):
        super(SpeciesSpider, self).__init__(*args, **kwargs)
        self.species_id = species_id
        self.max_species = int(max_species) if max_species else None
        self.resume = resume if isinstance(resume, bool) else resume.lower() in ('true', '1', 'yes')
        self.retry_failed = retry_failed if isinstance(retry_failed, bool) else retry_failed.lower() in ('true', '1', 'yes')

        # Track available sections per species
        self.available_sections = {}

        # Load scraping status if resume or retry_failed
        if self.resume or self.retry_failed:
            self.scraping_status = self._load_scraping_status()
            completed_count = len(self.scraping_status.get('completed', {}))
            failed_count = len(self.scraping_status.get('failed', {}))
            self.logger.info(f"Status: {completed_count} completed, {failed_count} failed")
        else:
            self.scraping_status = {'completed': {}, 'failed': {}}

    def _load_scraping_status(self):
        """Load scraping status from _scraping_status.json"""
        from pathlib import Path
        import json

        status_file = Path('output/species/_scraping_status.json')
        if status_file.exists():
            try:
                with open(status_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.error(f"Failed to load status file: {e}")
        return {'completed': {}, 'failed': {}}

    async def start(self):
        """
        Start with specific species ID or scrape all from menu

        To scrape specific species:
            scrapy crawl species -a species_id=141

        To scrape limited number of species:
            scrapy crawl species -a max_species=5

        To resume interrupted scraping:
            scrapy crawl species -a resume=True

        To retry only failed species:
            scrapy crawl species -a retry_failed=True

        To scrape all species:
            scrapy crawl species
        """
        if self.species_id:
            # Scrape specific species
            url = f"{self.base_url}/herbarium.php?id={self.species_id}"
            yield scrapy.Request(url, callback=self.parse_species_index)
        else:
            # Start from species menu to get all IDs
            url = f"{self.base_url}/menu_species.php"
            yield scrapy.Request(url, callback=self.parse_species_menu)

    def parse_species_menu(self, response):
        """
        Parse the species menu to get all species IDs
        Store them and start processing one at a time
        """
        # Extract all unique species IDs
        species_links = response.css(
            'a[href*="herbarium.php?id="]::attr(href)'
        ).getall()
        unique_links = list(set(species_links))

        self.logger.info(f"Found {len(unique_links)} unique species links")

        # Filter based on scraping status
        if self.resume:
            filtered_links = []
            completed_ids = set(self.scraping_status.get('completed', {}).keys())

            for link in unique_links:
                species_id = str(self.extract_species_id(link))
                if species_id not in completed_ids:
                    filtered_links.append(link)
                else:
                    self.logger.debug(f"Skipping successfully scraped species {species_id}")

            unique_links = filtered_links
            self.logger.info(f"Resume mode: {len(unique_links)} species remaining to scrape")

        # Retry failed species only (but only retryable ones)
        if self.retry_failed:
            filtered_links = []
            failed_dict = self.scraping_status.get('failed', {})

            for link in unique_links:
                species_id = str(self.extract_species_id(link))
                if species_id in failed_dict:
                    # Only retry if marked as retryable
                    if failed_dict[species_id].get('retryable', True):
                        filtered_links.append(link)
                        self.logger.debug(f"Will retry species {species_id} ({failed_dict[species_id]['error_type']})")
                    else:
                        self.logger.debug(f"Skipping permanent failure {species_id} ({failed_dict[species_id]['error_type']})")

            unique_links = filtered_links
            self.logger.info(f"Retry mode: {len(unique_links)} retryable failures to retry")

        # Limit species if max_species is set
        if self.max_species:
            unique_links = unique_links[:self.max_species]
            self.logger.info(f"Limiting to {self.max_species} species")

        self.logger.info(f"Scraping {len(unique_links)} species sequentially")

        # Store remaining species to scrape
        self.species_queue = unique_links
        self.current_species_index = 0

        # Start with the first species only
        if self.species_queue:
            link = self.species_queue[0]
            yield response.follow(link, callback=self.parse_species_index)

    def parse_species_index(self, response):
        """
        Parse the main species index page and spawn requests for all content pages
        """
        # Extract species ID from URL
        species_id = self.extract_species_id(response.url)

        # Get pipeline for error tracking
        try:
            pipeline = self.crawler.engine.scraper.itemproc.middlewares[1]  # IncrementalSavingPipeline at 400
        except (AttributeError, IndexError):
            pipeline = None

        # Handle permanent failures (don't retry)
        if response.status == 404:
            self.logger.warning(f"✗ Species {species_id} not found (404)")
            if pipeline and hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='404_permanent',
                                   error_msg='Page not found', retryable=False)
            return

        if response.status == 410:
            self.logger.warning(f"✗ Species {species_id} gone (410)")
            if pipeline and hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='410_permanent',
                                   error_msg='Resource gone', retryable=False)
            return

        if response.status == 403:
            self.logger.warning(f"✗ Species {species_id} forbidden (403)")
            if pipeline and hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='403_permanent',
                                   error_msg='Access forbidden', retryable=False)
            return

        # Handle temporary failures (can retry)
        if response.status >= 500:
            self.logger.error(f"✗ Server error for species {species_id} (status {response.status})")
            if pipeline and hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='server_error',
                                   error_msg=f'HTTP {response.status}', retryable=True)
            return

        if response.status == 429:
            self.logger.error(f"✗ Rate limited for species {species_id} (429)")
            if pipeline and hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='rate_limit',
                                   error_msg='Too many requests', retryable=True)
            return

        # Check for empty/invalid response
        if not response.body or len(response.body) < 100:
            self.logger.error(f"✗ Empty response for species {species_id}")
            if pipeline and hasattr(pipeline, 'mark_failed'):
                pipeline.mark_failed(species_id, error_type='empty_response',
                                   error_msg='Response body too small', retryable=True)
            return

        # Initialize the species item
        species_data = SpeciesItem()
        species_data["species_id"] = species_id
        species_data["url"] = response.url
        species_data["scraped_at"] = datetime.utcnow().isoformat() + "Z"

        # Extract basic info
        species_data["basic_info"] = self.extract_basic_info(response)

        # Extract images
        species_data["images"] = self.extract_images(response)

        # Extract collection metadata
        species_data["collection_metadata"] = self.extract_collection_metadata(response)

        # Initialize nested structures
        species_data["description"] = {}
        species_data["ecology"] = {}
        species_data["human_uses"] = {}
        species_data["conservation"] = {}
        species_data["nomenclature"] = {}

        # Extract available sections from menu to know what to expect
        available_sections = self.extract_available_menu_sections(response)
        self.available_sections[species_id] = available_sections
        self.logger.info(f"Species {species_id}: Found {len(available_sections)} available sections in menu: {available_sections}")

        # Store initial data in meta for aggregation
        meta = {"species_data": dict(species_data)}

        # Only scrape pages that are actually in the menu (available_sections)
        # Scrape nomenclature page if available
        if 'nomenclature._complete' in available_sections:
            url = f"{self.base_url}/contents/nomenclature.php?id={species_id}"
            yield scrapy.Request(
                url,
                callback=self.parse_nomenclature,
                meta=meta.copy(),
                errback=self.handle_error,
                dont_filter=True
            )

        # Scrape description pages (only those in menu)
        for section_name, page_url in self.CONTENT_PAGES["description"].items():
            if f"description.{section_name}" in available_sections:
                url = f"{self.base_url}/{page_url}?id={species_id}"
                meta_copy = meta.copy()
                meta_copy["section"] = "description"
                meta_copy["subsection"] = section_name
                yield scrapy.Request(
                    url, callback=self.parse_content_page, meta=meta_copy,
                    errback=self.handle_error, dont_filter=True
                )

        # Scrape ecology pages (only those in menu)
        for section_name, page_url in self.CONTENT_PAGES["ecology"].items():
            # Special handling for combined ecology-distribution page
            if section_name == "ecology_distribution":
                if "ecology.distribution" in available_sections:
                    url = f"{self.base_url}/{page_url}?id={species_id}"
                    meta_copy = meta.copy()
                    meta_copy["section"] = "ecology"
                    meta_copy["subsection"] = "ecology_distribution"
                    yield scrapy.Request(
                        url, callback=self.parse_ecology_distribution, meta=meta_copy,
                        errback=self.handle_error, dont_filter=True
                    )
            elif f"ecology.{section_name}" in available_sections:
                url = f"{self.base_url}/{page_url}?id={species_id}"
                meta_copy = meta.copy()
                meta_copy["section"] = "ecology"
                meta_copy["subsection"] = section_name
                yield scrapy.Request(
                    url, callback=self.parse_content_page, meta=meta_copy,
                    errback=self.handle_error, dont_filter=True
                )

        # Scrape human uses pages (only those in menu)
        for section_name, page_url in self.CONTENT_PAGES["human_uses"].items():
            if f"human_uses.{section_name}" in available_sections:
                url = f"{self.base_url}/{page_url}?id={species_id}"
                meta_copy = meta.copy()
                meta_copy["section"] = "human_uses"
                meta_copy["subsection"] = section_name
                yield scrapy.Request(
                    url, callback=self.parse_content_page, meta=meta_copy,
                    errback=self.handle_error, dont_filter=True
                )

        # Scrape conservation pages (only those in menu)
        for section_name, page_url in self.CONTENT_PAGES["conservation"].items():
            if f"conservation.{section_name}" in available_sections:
                url = f"{self.base_url}/{page_url}?id={species_id}"
                meta_copy = meta.copy()
                meta_copy["section"] = "conservation"
                meta_copy["subsection"] = section_name
                yield scrapy.Request(
                    url, callback=self.parse_content_page, meta=meta_copy,
                    errback=self.handle_error, dont_filter=True
                )

    def parse_content_page(self, response):
        """
        Generic parser for all content pages (description/ecology/uses/conservation)
        All follow the same HTML structure
        """
        section = response.meta["section"]
        subsection = response.meta["subsection"]
        species_data = response.meta["species_data"]

        # Extract content using generic extractor
        content = self.extract_content_section(response)

        # Store in appropriate section
        species_data[section][subsection] = content

        # Yield partial data - pipeline will aggregate
        yield SpeciesItem(species_data)

    def parse_nomenclature(self, response):
        """
        Parse nomenclature page (different structure than content pages)
        """
        species_data = response.meta["species_data"]

        # Extract nomenclature data
        species_data["nomenclature"] = self.extract_nomenclature(response)

        # Yield partial data - pipeline will aggregate
        yield SpeciesItem(species_data)

    def parse_ecology_distribution(self, response):
        """
        Parse combined ecology-distribution page (has both ecology and distribution in one page)
        """
        species_data = response.meta["species_data"]

        # Extract ecology and distribution separately from the same page
        ecology_data = self.extract_ecology_from_combined_page(response)
        distribution_data = self.extract_distribution_from_combined_page(response)

        # Store both sections
        if ecology_data:
            species_data["ecology"]["ecology"] = ecology_data
        if distribution_data:
            species_data["ecology"]["distribution"] = distribution_data

        # Yield partial data - pipeline will aggregate
        yield SpeciesItem(species_data)

    # ========== Extraction Methods ==========

    def extract_available_menu_sections(self, response):
        """
        Extract which sections are actually available for this species from the menu.
        Returns a set of section keys like 'description.habit', 'nomenclature._complete', etc.
        """
        available = set()

        # Check for Nomenclature
        if response.css('div#plant_menu[title="Nomenclature"] a'):
            available.add('nomenclature._complete')

        # Check for Description subsections
        desc_menu_items = {
            'Habit': 'habit',
            'Leaf': 'leaf',
            'Flower': 'flower',
            'Fruit': 'fruit',
            'Seed': 'seed',
            'Stem': 'stem_bark',
        }
        for title, key in desc_menu_items.items():
            if response.css(f'div#plant_sousmenu[title="{title}"] a'):
                available.add(f'description.{key}')

        # Check for Ecology sections
        if response.css('div#plant_menu[title="Phenology"] a'):
            available.add('ecology.phenology')
        if response.css('div#plant_menu[title="Reproduction"] a'):
            available.add('ecology.reproduction_dispersal')
        if response.css('div#plant_menu[title="Ecology"]'):
            available.add('ecology.distribution')

        # Check for Human uses subsections
        human_uses_items = {
            'Medicinal': 'medicinal',
            'Culinary': 'culinary',
            'Handicrafts': 'handicrafts',
            'Veterinary': 'veterinary',
            'Others': 'others',
        }
        for title, key in human_uses_items.items():
            # Medicinal can be either a link or selected (span)
            if response.css(f'div#plant_sousmenu[title="{title}"] a') or \
               response.css(f'div#plant_sousmenu[title="{title}"] span.subselected'):
                available.add(f'human_uses.{key}')

        # Check for Conservation sections
        if response.css('div#plant_menu[title="Conservation status"] a'):
            available.add('conservation.status')
        if response.css('div#plant_menu[title="Reforestation"] a'):
            available.add('conservation.reforestation')

        return available

    def extract_species_id(self, url):
        """Extract species ID from URL"""
        match = re.search(r"id=(\d+)", url)
        return int(match.group(1)) if match else None

    def extract_basic_info(self, response):
        """Extract basic species information from index page"""
        scientific_name = response.css("div#specimen_title::text").get()
        if scientific_name:
            scientific_name = scientific_name.strip()

        authority = response.css("div#specimen_title span.specimen_title2::text").get()
        if authority:
            authority = authority.strip()

        family = response.css("div#specimen_family::text").get()
        if family:
            family = family.strip()

        return {
            "scientific_name": scientific_name,
            "authority": authority,
            "family": family,
        }

    def extract_images(self, response):
        """Extract main images from index page"""
        main_specimen = response.css(
            "div#specimen_wrapper div#specimen_img img::attr(src)"
        ).get()
        dry_herbarium = response.css("div#dryherbarium-img img::attr(src)").get()

        return {
            "main_specimen": main_specimen,
            "dry_herbarium": dry_herbarium,
        }

    def extract_collection_metadata(self, response):
        """Extract collection information from index page"""
        # Extract metadata from notes section
        notes_wrapper = response.css("div#notes_wrapper2")

        # Date
        date = self.extract_note_content(response, "Date of collection")

        # Collector
        collected_by = self.extract_note_content(response, "Collected by")

        # GPS coordinates
        gps_raw = response.css(
            'div#notes_title:contains("GPS") + div#notes_content pre::text'
        ).get()
        gps_coords = self.parse_gps_coordinates(gps_raw) if gps_raw else None

        # Locality
        locality = self.extract_note_content(response, "Locality")

        return {
            "date": date,
            "collected_by": collected_by,
            "gps_coordinates": gps_coords,
            "locality": locality,
        }

    def extract_note_content(self, response, title):
        """Helper to extract content following a notes title"""
        content = response.xpath(
            f'//div[@id="notes_title"][contains(text(), "{title}")]/following-sibling::div[@id="notes_content"][1]/text()'
        ).get()
        return content.strip() if content else None

    def parse_gps_coordinates(self, raw_coords):
        """Parse GPS coordinates string into structured format"""
        if not raw_coords:
            return None

        # Example: "11.99621 N - 79.82411 E"
        parts = raw_coords.split("-")
        if len(parts) == 2:
            return {
                "latitude": parts[0].strip(),
                "longitude": parts[1].strip(),
                "raw": raw_coords.strip(),
            }
        return {"raw": raw_coords.strip()}

    def extract_content_section(self, response):
        """
        Generic extractor for content pages (works for all description/ecology/uses pages)
        """
        # Extract text content (keep HTML for formatting)
        text_html = response.css("div#plant_txt").get()

        # Extract plain text if HTML is not needed
        text_parts = response.css(
            "div#plant_txt p *::text, div#plant_txt p::text"
        ).getall()
        text_clean = " ".join([t.strip() for t in text_parts if t.strip()])

        # Extract images with captions
        images = self.extract_images_with_captions(response)

        return {
            "text": text_clean if text_clean else None,
            "text_html": text_html,
            "images": images,
        }

    def extract_images_with_captions(self, response):
        """
        Extract images and pair them with their captions
        """
        images = []

        # Get all specimen_img divs
        img_divs = response.css("div#specimen_img")

        for img_div in img_divs:
            url = img_div.css("img::attr(src)").get()
            if url:
                # Get the caption from the next sibling div#specimen_legend
                caption = img_div.xpath(
                    'following-sibling::div[@id="specimen_legend"][1]/text()'
                ).get()

                images.append(
                    {"url": url, "caption": caption.strip() if caption else None}
                )

        return images

    def extract_ecology_from_combined_page(self, response):
        """
        Extract ecology section from the combined ecology-distribution page
        """
        # Extract content from the "Ecology :" section
        # The HTML has <p><li><span class="titchap">Ecology :</span><br><p>content</p></li></p>
        ecology_text_parts = response.xpath(
            '//span[@class="titchap" and contains(text(), "Ecology")]/following-sibling::p//text()'
        ).getall()
        ecology_text = " ".join([t.strip() for t in ecology_text_parts if t.strip()])

        # Extract HTML - get the parent li element
        ecology_html = response.xpath(
            '//span[@class="titchap" and contains(text(), "Ecology")]/parent::li'
        ).get()

        # Extract images (if any in this section)
        images = []

        return {
            "text": ecology_text if ecology_text else None,
            "text_html": ecology_html,
            "images": images,
        }

    def extract_distribution_from_combined_page(self, response):
        """
        Extract distribution section from the combined ecology-distribution page
        """
        # Extract content from the "Distribution :" section
        distribution_text_parts = response.xpath(
            '//span[@class="titchap" and contains(text(), "Distribution")]/following-sibling::p//text()'
        ).getall()
        distribution_text = " ".join([t.strip() for t in distribution_text_parts if t.strip()])

        # Extract HTML - get the parent li element
        distribution_html = response.xpath(
            '//span[@class="titchap" and contains(text(), "Distribution")]/parent::li'
        ).get()

        # Extract images (if any in this section)
        images = []

        return {
            "text": distribution_text if distribution_text else None,
            "text_html": distribution_html,
            "images": images,
        }

    def extract_nomenclature(self, response):
        """
        Extract nomenclature data (has different structure than content pages)
        """
        # Extract list items with titchap labels
        botanical_name = response.xpath(
            '//li[contains(., "Botanical name")]/em/text()'
        ).get()

        author = response.xpath('//li[contains(., "Author")]/p/text()').get()

        family = response.xpath(
            '//li[contains(., "Family")]//text()[not(parent::span)]'
        ).getall()
        family = " ".join(
            [t.strip() for t in family if t.strip() and "Family" not in t]
        )

        english_names = response.xpath(
            '//li[contains(., "English names")]//text()[not(parent::span)]'
        ).getall()
        english_names = " ".join(
            [t.strip() for t in english_names if t.strip() and "English names" not in t]
        )

        # Parse Indian names into structured dictionary
        indian_names_raw = response.xpath(
            '//li[contains(., "Indian names")]//text()[not(parent::span)]'
        ).getall()

        # Join all text parts and clean
        indian_names_text = " ".join(
            [t.strip() for t in indian_names_raw if t.strip() and t.strip() != "&nbsp;"]
        )

        # Parse into dictionary: {"Hindi": ["name1", "name2"], "Tamil": ["name3"]}
        indian_names = {}
        if indian_names_text:
            # Split by language markers (e.g., "Hindi :", "Tamil :")
            import re

            # Pattern: Language name followed by colon
            parts = re.split(r"([A-Z][a-z]+)\s*:", indian_names_text)

            # parts will be like: ['', 'Hindi', 'Peeli kaner', 'Marathi', 'Bitti', 'Tamil', 'Arali, ponnarali']
            for i in range(1, len(parts), 2):
                if i + 1 < len(parts):
                    language = parts[i].strip()
                    names_str = parts[i + 1].strip()
                    # Split by comma to get individual names
                    names_list = [
                        name.strip() for name in names_str.split(",") if name.strip()
                    ]
                    if names_list:
                        indian_names[language] = names_list

        # Synonyms - extract all italic text
        synonyms_list = response.xpath(
            '//li[contains(., "Synonyms")]//p/i/text()'
        ).getall()

        # Etymology - keep HTML for formatting
        etymology_html = response.xpath('//li[contains(., "Etymology")]//p').get()
        etymology_text = response.xpath(
            '//li[contains(., "Etymology")]//p//text()'
        ).getall()
        etymology_clean = "\n".join([t.strip() for t in etymology_text if t.strip()])

        return {
            "botanical_name": botanical_name.strip() if botanical_name else None,
            "author": author.strip() if author else None,
            "family": family.strip() if family else None,
            "english_names": english_names.strip() if english_names else None,
            "indian_names": indian_names
            if indian_names
            else None,  # Already a dict or None
            "synonyms": [s.strip() for s in synonyms_list if s.strip()],
            "etymology": etymology_clean if etymology_clean else None,
            "etymology_html": etymology_html,
        }

    def handle_error(self, failure):
        """Handle request failures (network errors, timeouts, etc.)"""
        species_id = self.extract_species_id(failure.request.url)

        # Get pipeline for error tracking
        try:
            pipeline = self.crawler.engine.scraper.itemproc.middlewares[1]  # IncrementalSavingPipeline
        except (AttributeError, IndexError):
            pipeline = None

        # Network/timeout errors are retryable
        error_type = failure.type.__name__ if hasattr(failure, 'type') else 'unknown'
        error_msg = str(failure.value) if hasattr(failure, 'value') else str(failure)

        self.logger.error(f"✗ Request failed for species {species_id}: {error_type}")

        if pipeline and hasattr(pipeline, 'mark_failed'):
            pipeline.mark_failed(species_id, error_type='network_error',
                               error_msg=error_msg, retryable=True)
