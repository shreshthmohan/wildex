"""
Item Pipelines for Auroville Herbarium Spider

Handles aggregation of species data from multiple page requests
"""

from itemadapter import ItemAdapter
from collections import defaultdict
import logging
from scrapy.exporters import JsonItemExporter


class SingleObjectJsonItemExporter(JsonItemExporter):
    """
    Custom JSON exporter that writes a single object instead of an array.
    Perfect for exporting a single scraped item as a clean JSON object.
    """
    def __init__(self, file, **kwargs):
        super().__init__(file, **kwargs)
        self.first_item = True

    def start_exporting(self):
        # Don't write opening bracket
        pass

    def finish_exporting(self):
        # Don't write closing bracket
        self.file.write(b'\n')

    def export_item(self, item):
        if not self.first_item:
            # If multiple items, we'd need to handle this differently
            # For now, just overwrite with the last item
            pass
        self.first_item = False

        # Write the item as a plain object (not in an array)
        itemdict = dict(self._get_serialized_fields(item))
        data = self.encoder.encode(itemdict) + '\n'
        self.file.write(data.encode('utf-8'))


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
        # Track total responses received (including empty/failed sections)
        self.responses_received = defaultdict(int)
        # Track when we first saw each species (for timeout)
        self.first_seen = {}
        # Track expected sections per species (dynamic based on menu)
        self.expected_per_species = {}
        # Track species that have been completed or failed (to ignore late responses)
        self._completed_species = set()
        # Default total expected sections if not specified
        self.default_total_expected = 15  # 6 description + 3 ecology + 4 human_uses + 2 conservation + 1 nomenclature
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

        # If this species was already completed or failed, silently drop
        if species_id not in self.species_cache:
            # Check if we already yielded/failed this species
            if species_id in getattr(self, '_completed_species', set()):
                from scrapy.exceptions import DropItem
                raise DropItem(f"Species {species_id} already completed/failed")

        # Initialize cache for this species if needed
        if species_id not in self.species_cache:
            from datetime import datetime

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
            # Track when we first saw this species
            self.first_seen[species_id] = datetime.now()

            # Get available sections from spider (if it detected them from menu)
            # Otherwise fall back to expecting all sections
            available_sections = spider.available_sections.get(species_id) if hasattr(spider, 'available_sections') else None

            if available_sections:
                # Only track sections that are actually available for this species
                self.pending_sections[species_id] = available_sections.copy()
                self.expected_per_species[species_id] = len(available_sections)
                self.logger.info(f"Species {species_id}: Expecting {self.expected_per_species[species_id]} sections based on menu")
            else:
                # Fall back to default: track all possible sections
                for section, subsections in self.expected_sections.items():
                    self.pending_sections[species_id].update(
                        [f"{section}.{sub}" for sub in subsections]
                    )
                self.expected_per_species[species_id] = self.default_total_expected

        # Update the cache with new data
        cached_item = self.species_cache[species_id]

        # Increment responses received (we got SOME response for this species)
        self.responses_received[species_id] += 1

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
        # Yield if: all sections complete OR we've received all expected responses OR timeout with enough data
        completed_count = self.completed_sections[species_id]
        responses_count = self.responses_received[species_id]
        total_expected = self.expected_per_species.get(species_id, self.default_total_expected)
        min_responses = max(2, int(total_expected * 0.6))  # At least 60% of expected responses

        # Check if we've been waiting too long (timeout after 60 seconds)
        from datetime import datetime, timedelta
        time_waiting = (datetime.now() - self.first_seen[species_id]).total_seconds()
        timed_out = time_waiting > 60

        if not self.pending_sections[species_id]:
            # All sections complete
            self.logger.info(f"Species {species_id}: All {completed_count} sections complete, yielding item")
            complete_item = self.species_cache.pop(species_id)
            del self.pending_sections[species_id]
            del self.completed_sections[species_id]
            del self.responses_received[species_id]
            del self.first_seen[species_id]
            del self.expected_per_species[species_id]
            self._completed_species.add(species_id)
            return complete_item
        elif responses_count >= total_expected:
            # Received all expected responses (even if some sections are missing/empty)
            self.logger.info(
                f"Species {species_id}: Received all {total_expected} responses "
                f"({completed_count} with data, {total_expected - completed_count} empty/missing), yielding item"
            )
            complete_item = self.species_cache.pop(species_id)
            del self.pending_sections[species_id]
            del self.completed_sections[species_id]
            del self.responses_received[species_id]
            del self.first_seen[species_id]
            del self.expected_per_species[species_id]
            self._completed_species.add(species_id)
            return complete_item
        elif responses_count >= min_responses and timed_out:
            # We have enough data and we've waited long enough - yield what we have
            self.logger.warning(
                f"Species {species_id}: Timeout after {time_waiting:.0f}s with {responses_count}/{total_expected} responses "
                f"({completed_count} with data). Yielding partial item."
            )
            complete_item = self.species_cache.pop(species_id)
            del self.pending_sections[species_id]
            del self.completed_sections[species_id]
            del self.responses_received[species_id]
            del self.first_seen[species_id]
            del self.expected_per_species[species_id]
            self._completed_species.add(species_id)
            return complete_item
        elif timed_out and responses_count < min_responses:
            # Timeout but not enough data - mark as failed
            self.logger.error(
                f"Species {species_id}: Timeout after {time_waiting:.0f}s with only {responses_count}/{total_expected} responses "
                f"({completed_count} with data). Insufficient data - marking as failed."
            )
            # Try to get the IncrementalSavingPipeline to mark as failed
            try:
                if hasattr(spider, 'crawler'):
                    pipeline = spider.crawler.engine.scraper.itemproc.middlewares[1]
                    if hasattr(pipeline, 'mark_failed'):
                        pipeline.mark_failed(
                            species_id,
                            error_type='timeout_insufficient_data',
                            error_msg=f'Timeout after {time_waiting:.0f}s',
                            retryable=True,
                            responses_received=responses_count,
                            responses_expected=total_expected,
                            missing_sections=self.pending_sections[species_id]
                        )
            except Exception as e:
                self.logger.error(f"Failed to mark species as failed: {e}")

            # Clean up this species from cache
            self.species_cache.pop(species_id, None)
            self.pending_sections.pop(species_id, None)
            self.completed_sections.pop(species_id, None)
            self.responses_received.pop(species_id, None)
            self.first_seen.pop(species_id, None)
            self.expected_per_species.pop(species_id, None)
            self._completed_species.add(species_id)

            # Trigger next species since this one failed
            # Get the IncrementalSavingPipeline to trigger next
            if hasattr(spider, 'crawler'):
                try:
                    inc_pipeline = spider.crawler.engine.scraper.itemproc.middlewares[1]
                    if hasattr(inc_pipeline, '_trigger_next_species'):
                        inc_pipeline._trigger_next_species(spider)
                except Exception as e:
                    self.logger.error(f"Failed to trigger next species: {e}")

            from scrapy.exceptions import DropItem
            raise DropItem(f"Insufficient data for species {species_id} after timeout")
        else:
            # Still waiting
            self.logger.debug(
                f"Species {species_id}: {responses_count}/{total_expected} responses received "
                f"({completed_count} with data), waiting {time_waiting:.0f}s..."
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
                # Try to get the IncrementalSavingPipeline to mark them as failed
                try:
                    from scrapy.utils.project import get_project_settings
                    settings = get_project_settings()

                    # Access the IncrementalSavingPipeline through crawler
                    if hasattr(spider, 'crawler'):
                        pipeline = spider.crawler.engine.scraper.itemproc.middlewares[1]

                        for species_id in list(self.species_cache.keys()):
                            missing = self.pending_sections.get(species_id, set())
                            responses = self.responses_received.get(species_id, 0)

                            self.logger.warning(
                                f"Species {species_id} incomplete - {responses} responses, missing {len(missing)} sections: "
                                f"{list(missing)[:5]}..."
                            )

                            # Mark as failed in status tracking
                            if hasattr(pipeline, 'mark_failed'):
                                pipeline.mark_failed(
                                    species_id,
                                    error_type='incomplete_on_close',
                                    error_msg=f'Spider closed before completion',
                                    retryable=True,
                                    responses_received=responses,
                                    responses_expected=self.total_expected,
                                    missing_sections=missing
                                )
                except Exception as e:
                    self.logger.error(f"Failed to mark incomplete species as failed: {e}")




class IncrementalSavingPipeline:
    """
    Saves each complete species to individual JSON file immediately
    Tracks scraping status to enable smart resume functionality
    """

    def __init__(self, output_dir):
        self.output_dir = output_dir
        self.status_file = None
        self.status_data = {'completed': {}, 'failed': {}}
        self.logger = logging.getLogger(self.__class__.__name__)

    @classmethod
    def from_crawler(cls, crawler):
        # Get output directory from spider settings or use default
        output_dir = crawler.settings.get('INCREMENTAL_OUTPUT_DIR', 'output/species')
        return cls(output_dir)

    def open_spider(self, spider):
        """Initialize when spider opens"""
        from pathlib import Path

        self.output_dir = Path(self.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Status tracking file
        self.status_file = self.output_dir / '_scraping_status.json'
        self.status_data = self._load_status()

        self.logger.info(f"Incremental saving initialized: {self.output_dir}")
        completed = len(self.status_data.get('completed', {}))
        failed = len(self.status_data.get('failed', {}))
        if completed or failed:
            self.logger.info(f"Previous status: {completed} completed, {failed} failed")

    def _load_status(self):
        """Load existing scraping status"""
        import json

        if self.status_file and self.status_file.exists():
            try:
                with open(self.status_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.error(f"Failed to load status file: {e}")
        return {'completed': {}, 'failed': {}}

    def _save_status(self):
        """Save scraping status"""
        import json
        from datetime import datetime

        try:
            with open(self.status_file, 'w', encoding='utf-8') as f:
                json.dump(self.status_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.logger.error(f"Failed to save status file: {e}")

    def _mark_success(self, species_id, has_minimal_data=True):
        """Mark species as successfully scraped"""
        from datetime import datetime

        self.status_data['completed'][str(species_id)] = {
            'timestamp': datetime.now().isoformat(),
            'status': 'success',
            'has_minimal_data': has_minimal_data
        }
        # Remove from failed if it was there
        self.status_data['failed'].pop(str(species_id), None)
        self._save_status()

    def mark_failed(self, species_id, error_type='unknown', error_msg='', retryable=True,
                    responses_received=None, responses_expected=None, missing_sections=None):
        """Mark species as failed (called from spider on errors)"""
        from datetime import datetime

        failure_data = {
            'timestamp': datetime.now().isoformat(),
            'error_type': error_type,
            'error_msg': error_msg,
            'retryable': retryable  # False for 404/410/403, True for network/5xx errors
        }

        # Add detailed response info if available
        if responses_received is not None:
            failure_data['responses_received'] = responses_received
        if responses_expected is not None:
            failure_data['responses_expected'] = responses_expected
        if missing_sections is not None:
            failure_data['missing_sections'] = list(missing_sections) if isinstance(missing_sections, set) else missing_sections

        self.status_data['failed'][str(species_id)] = failure_data
        self._save_status()

    def process_item(self, item, spider):
        """Save complete species to individual file and track status"""
        if spider.name != 'species':
            return item

        species_id = item.get('species_id')
        if not species_id:
            return item

        # Generate filename: species-1.json, species-172.json, etc.
        filename = f"species-{species_id}.json"
        filepath = self.output_dir / filename

        # Write to file immediately
        import json
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(dict(item), f, indent=2, ensure_ascii=False)

            # Check if species has minimal data (not just empty structure)
            has_data = bool(item.get('basic_info', {}).get('scientific_name') or
                          item.get('description') or
                          item.get('nomenclature'))

            # Mark as successfully scraped
            self._mark_success(species_id, has_minimal_data=has_data)

            self.logger.info(f"✓ Saved species {species_id} to {filepath}")

            # Trigger next species in queue (if scraping sequentially)
            self._trigger_next_species(spider)

        except Exception as e:
            self.logger.error(f"✗ Failed to save species {species_id}: {e}")
            self.mark_failed(species_id, error_type='write_error', error_msg=str(e), retryable=True)

        return item

    def _trigger_next_species(self, spider):
        """Trigger the next species in the queue to start scraping"""
        if not hasattr(spider, 'species_queue'):
            return

        spider.current_species_index = getattr(spider, 'current_species_index', 0) + 1

        if spider.current_species_index < len(spider.species_queue):
            import scrapy
            from scrapy.http import Request

            link = spider.species_queue[spider.current_species_index]
            self.logger.info(f"Starting next species ({spider.current_species_index + 1}/{len(spider.species_queue)})")

            # Use response.follow() logic to properly handle relative URLs
            # The links from menu are like "herbarium.php?id=365" (relative)
            full_url = spider.base_url + '/' + link if not link.startswith('http') else link

            request = Request(
                full_url,
                callback=spider.parse_species_index,
                dont_filter=True
            )
            spider.crawler.engine.crawl(request)


class CrawlerPipeline:
    """Default pipeline - kept for compatibility"""
    def process_item(self, item, spider):
        return item
