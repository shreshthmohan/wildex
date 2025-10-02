"""
Scrapy Items for Auroville Herbarium data structures
"""

import scrapy


class SpeciesItem(scrapy.Item):
    """
    Complete species data structure matching the JSON schema in scraping-plan.md
    """
    # Basic identifiers
    species_id = scrapy.Field()
    url = scrapy.Field()
    scraped_at = scrapy.Field()

    # Basic info
    basic_info = scrapy.Field()  # dict with scientific_name, authority, family, common_names

    # Images
    images = scrapy.Field()  # dict with main_specimen, dry_herbarium, thumbnail

    # Collection metadata
    collection_metadata = scrapy.Field()  # dict with date, collected_by, gps_coordinates, locality

    # Nomenclature
    nomenclature = scrapy.Field()  # dict with botanical_name, author, family, synonyms, etymology, etc.

    # Description sections
    description = scrapy.Field()  # dict with habit, leaf, flower, fruit, seed, stem_bark

    # Ecology sections
    ecology = scrapy.Field()  # dict with phenology, reproduction_dispersal, distribution

    # Human uses
    human_uses = scrapy.Field()  # dict with culinary, veterinary, others

    # Conservation
    conservation = scrapy.Field()  # dict with status, reforestation


class ContentSectionItem(scrapy.Item):
    """
    Reusable item for any content section (description/ecology/uses)
    """
    text = scrapy.Field()  # HTML text content
    images = scrapy.Field()  # list of {url, caption} dicts
