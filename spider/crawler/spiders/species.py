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
        "DOWNLOAD_DELAY": 2,  # Wait 3 seconds between requests
        "RANDOMIZE_DOWNLOAD_DELAY": True,  # Add randomness to avoid patterns
        "ROBOTSTXT_OBEY": False,  # Site doesn't have robots.txt
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,  # Sequential requests
        "RETRY_TIMES": 3,  # Retry on 429 errors
        "RETRY_HTTP_CODES": [429, 500, 502, 503, 504],
        "FEEDS": {
            "%(name)s_output.json": {
                "format": "json",
                "overwrite": True,  # Overwrite existing file
            }
        },
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
            "distribution": "contents/ecology-distribution.php",
        },
        "human_uses": {
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

    def __init__(self, species_id=None, max_species=None, *args, **kwargs):
        super(SpeciesSpider, self).__init__(*args, **kwargs)
        self.species_id = species_id
        self.max_species = int(max_species) if max_species else None

    async def start(self):
        """
        Start with specific species ID or scrape all from menu

        To scrape specific species:
            scrapy crawl species -a species_id=141

        To scrape limited number of species:
            scrapy crawl species -a max_species=5

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
        """
        # Extract all unique species IDs
        species_links = response.css(
            'a[href*="herbarium.php?id="]::attr(href)'
        ).getall()
        unique_links = list(set(species_links))

        # Limit species if max_species is set
        if self.max_species:
            unique_links = unique_links[: self.max_species]
            self.logger.info(f"Limiting to {self.max_species} species")

        self.logger.info(f"Found {len(unique_links)} unique species")

        # Follow each species link
        for link in unique_links:
            yield response.follow(link, callback=self.parse_species_index)

    def parse_species_index(self, response):
        """
        Parse the main species index page and spawn requests for all content pages
        """
        # Extract species ID from URL
        species_id = self.extract_species_id(response.url)

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

        # Store initial data in meta for aggregation
        meta = {"species_data": dict(species_data)}

        # Scrape nomenclature page (different structure)
        url = f"{self.base_url}/contents/nomenclature.php?id={species_id}"
        yield scrapy.Request(
            url, callback=self.parse_nomenclature, meta=meta.copy(), dont_filter=True
        )

        # Scrape all description pages
        for section_name, page_url in self.CONTENT_PAGES["description"].items():
            url = f"{self.base_url}/{page_url}?id={species_id}"
            meta_copy = meta.copy()
            meta_copy["section"] = "description"
            meta_copy["subsection"] = section_name
            yield scrapy.Request(
                url, callback=self.parse_content_page, meta=meta_copy, dont_filter=True
            )

        # Scrape all ecology pages
        for section_name, page_url in self.CONTENT_PAGES["ecology"].items():
            url = f"{self.base_url}/{page_url}?id={species_id}"
            meta_copy = meta.copy()
            meta_copy["section"] = "ecology"
            meta_copy["subsection"] = section_name
            yield scrapy.Request(
                url, callback=self.parse_content_page, meta=meta_copy, dont_filter=True
            )

        # Scrape all human uses pages
        for section_name, page_url in self.CONTENT_PAGES["human_uses"].items():
            url = f"{self.base_url}/{page_url}?id={species_id}"
            meta_copy = meta.copy()
            meta_copy["section"] = "human_uses"
            meta_copy["subsection"] = section_name
            yield scrapy.Request(
                url, callback=self.parse_content_page, meta=meta_copy, dont_filter=True
            )

        # Scrape all conservation pages
        for section_name, page_url in self.CONTENT_PAGES["conservation"].items():
            url = f"{self.base_url}/{page_url}?id={species_id}"
            meta_copy = meta.copy()
            meta_copy["section"] = "conservation"
            meta_copy["subsection"] = section_name
            yield scrapy.Request(
                url, callback=self.parse_content_page, meta=meta_copy, dont_filter=True
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

    # ========== Extraction Methods ==========

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
            '//li[contains(., "Indian names")]//p//text()'
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
