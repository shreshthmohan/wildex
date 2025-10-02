import scrapy


class AhSpider(scrapy.Spider):
    name = "ah-spider"
    start_urls = ["https://aurovilleherbarium.org/menu_species.php"]

    # Be polite - wait between requests
    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "ROBOTSTXT_OBEY": True,
    }

    def parse(self, response):
        """
        Parse the species menu page to extract all individual species page links.
        The page structure has species links in format: herbarium.php?id=<number>
        Each species is in a div with class 'column_plantmenu'
        """

        # Extract all species links (format: herbarium.php?id=123)
        species_links = response.css('a[href*="herbarium.php?id="]::attr(href)').getall()

        # Get unique links only (each species appears twice - image link and text link)
        unique_links = list(set(species_links))

        self.logger.info(f"Found {len(unique_links)} unique species pages")

        # Extract species info from the menu page
        for species_div in response.css('div#column_plantmenu'):
            # Get the species link
            species_url = species_div.css('a[href*="herbarium.php?id="]::attr(href)').get()

            if species_url:
                # Extract species name info from the menu
                scientific_name = species_div.css('span.latin2::text').get()
                authority = species_div.css('span.latin::text').get()
                common_names_raw = species_div.css('div#index_plants a br::text').getall()
                # Common names come after the <br> tag
                common_names = [name.strip() for name in common_names_raw if name.strip()]

                # Get thumbnail image
                thumbnail = species_div.css('img.plant_image::attr(src)').get()

                yield {
                    "species_url": response.urljoin(species_url),
                    "scientific_name": scientific_name.strip() if scientific_name else None,
                    "authority": authority.strip() if authority else None,
                    "common_names": common_names,
                    "thumbnail_url": thumbnail,
                    "source_page": response.url,
                }

        # Optionally: Follow each species link to scrape detailed pages
        # Uncomment below to crawl individual species pages
        # for link in unique_links:
        #     yield response.follow(link, callback=self.parse_species_page)

    def parse_species_page(self, response):
        """
        Parse individual species detail page (herbarium.php?id=<number>)
        Customize this based on what data you need from the species page
        """
        yield {
            "url": response.url,
            "species_id": response.url.split("id=")[-1] if "id=" in response.url else None,
            # Add more fields based on the actual species page structure
        }
