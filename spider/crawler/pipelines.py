"""
Item Pipelines for Auroville Herbarium Spider

Handles aggregation of species data from multiple page requests
"""

from itemadapter import ItemAdapter
from collections import defaultdict
import logging


class SpeciesAggregationPipeline:
    """
    Aggregates species data from multiple page requests into a single complete item
    """

    def __init__(self):
        # Cache to store partial species data by species_id
        self.species_cache = defaultdict(dict)
        # Track which requests are pending for each species
        self.pending_sections = defaultdict(set)
        # Track completed sections count
        self.completed_sections = defaultdict(int)
        # Total expected sections per species
        self.total_expected = 15  # 6 description + 3 ecology + 3 human_uses + 2 conservation + 1 nomenclature
        self.logger = logging.getLogger(self.__class__.__name__)

    def open_spider(self, spider):
        """Initialize when spider opens"""
        if spider.name == 'species':
            self.logger.info("Species aggregation pipeline initialized")
            # Define expected sections
            self.expected_sections = {
                'description': set(['habit', 'leaf', 'flower', 'fruit', 'seed', 'stem_bark']),
                'ecology': set(['phenology', 'reproduction_dispersal', 'distribution']),
                'human_uses': set(['culinary', 'veterinary', 'others']),
                'conservation': set(['status', 'reforestation']),
                'nomenclature': set(['_complete'])  # Special marker for nomenclature
            }

    def process_item(self, item, spider):
        """
        Process items - aggregate data for each species

        Returns complete item only when all sections are scraped
        """
        if spider.name != 'species':
            return item

        species_id = item.get('species_id')
        if not species_id:
            return item

        # Initialize cache for this species if needed
        if species_id not in self.species_cache:
            self.species_cache[species_id] = {
                'species_id': species_id,
                'url': item.get('url'),
                'scraped_at': item.get('scraped_at'),
                'basic_info': item.get('basic_info', {}),
                'images': item.get('images', {}),
                'collection_metadata': item.get('collection_metadata', {}),
                'nomenclature': {},
                'description': {},
                'ecology': {},
                'human_uses': {},
                'conservation': {},
            }
            # Track all pending sections for this species
            for section, subsections in self.expected_sections.items():
                self.pending_sections[species_id].update(
                    [f"{section}.{sub}" for sub in subsections]
                )

        # Update the cache with new data
        cached_item = self.species_cache[species_id]

        # Update sections that have data
        for section in ['description', 'ecology', 'human_uses', 'conservation']:
            if item.get(section):
                for subsection, data in item[section].items():
                    cached_item[section][subsection] = data
                    # Mark this section as complete
                    section_key = f"{section}.{subsection}"
                    if section_key in self.pending_sections[species_id]:
                        self.pending_sections[species_id].remove(section_key)
                        self.completed_sections[species_id] += 1
                        self.logger.debug(f"Species {species_id}: Completed {section_key}")

        # Handle nomenclature (single page)
        if item.get('nomenclature') and item['nomenclature']:
            cached_item['nomenclature'] = item['nomenclature']
            section_key = "nomenclature._complete"
            if section_key in self.pending_sections[species_id]:
                self.pending_sections[species_id].remove(section_key)
                self.completed_sections[species_id] += 1
                self.logger.debug(f"Species {species_id}: Completed nomenclature")

        # Check if we should yield
        # Yield if: all sections complete OR we've received all expected requests
        completed_count = self.completed_sections[species_id]

        if not self.pending_sections[species_id]:
            # All sections complete
            self.logger.info(f"Species {species_id}: All {completed_count} sections complete, yielding item")
            complete_item = self.species_cache.pop(species_id)
            del self.pending_sections[species_id]
            del self.completed_sections[species_id]
            return complete_item
        elif completed_count >= self.total_expected:
            # Received all expected responses (even if some sections are missing/empty)
            self.logger.info(
                f"Species {species_id}: Received all {self.total_expected} requests "
                f"({len(self.pending_sections[species_id])} sections empty/missing), yielding item"
            )
            complete_item = self.species_cache.pop(species_id)
            del self.pending_sections[species_id]
            del self.completed_sections[species_id]
            return complete_item
        else:
            # Still waiting
            self.logger.debug(
                f"Species {species_id}: {completed_count}/{self.total_expected} sections received, "
                f"still waiting for {len(self.pending_sections[species_id])}: "
                f"{list(self.pending_sections[species_id])[:3]}..."
            )
            # Don't yield yet - drop this partial item silently
            from scrapy.exceptions import DropItem
            raise DropItem(f"Partial item for species {species_id}")

    def close_spider(self, spider):
        """Cleanup when spider closes"""
        if spider.name == 'species':
            # Log any incomplete species that were cached but not yielded
            if self.species_cache:
                self.logger.warning(
                    f"Spider closing with {len(self.species_cache)} incomplete species - they were not yielded"
                )
                for species_id in list(self.species_cache.keys())[:5]:
                    missing = self.pending_sections.get(species_id, set())
                    self.logger.warning(
                        f"Species {species_id} incomplete - missing {len(missing)} sections: "
                        f"{list(missing)[:5]}..."
                    )




class CrawlerPipeline:
    """Default pipeline - kept for compatibility"""
    def process_item(self, item, spider):
        return item
