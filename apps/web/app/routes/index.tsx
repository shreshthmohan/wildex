import { Link, Form, useSearchParams } from "react-router";
import type { Route } from "./+types/index";

interface SpeciesListItem {
  id: number;
  scientific_name: string;
  common_name: string | null;
  family: string;
  main_image_url: string | null;
}

interface SpiderSpecies {
  species_url: string;
  scientific_name: string;
  authority: string;
  common_names: string[];
  thumbnail_url: string;
}

interface ComparisonData {
  dbSpecies: SpeciesListItem[];
  spiderSpecies: SpiderSpecies[];
  comparison: {
    scientific_name: string;
    id: number | null;
    inDb: boolean;
    inSpider: boolean;
    dbData?: SpeciesListItem;
    spiderData?: SpiderSpecies;
  }[];
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare.env as { DB: D1Database };

  // Get all species from database with common names
  const dbResult = await env.DB.prepare(
    `SELECT s.id, s.scientific_name, n.name as common_name, s.family, s.main_image_url
     FROM species s
     LEFT JOIN names n ON s.common_name_id = n.id
     ORDER BY s.scientific_name`
  ).all<SpeciesListItem>();

  const dbSpecies = dbResult.results || [];

  // Load spider species list from local file
  // Import as JSON module to work in both dev and production
  let spiderSpecies: SpiderSpecies[] = [];
  try {
    const spiderData = await import("../../../../spider/species_list.json");
    spiderSpecies = spiderData.default || spiderData;
  } catch (error) {
    console.error("Failed to load spider species list:", error);
    spiderSpecies = [];
  }

  // Create comparison map
  const comparisonMap = new Map<
    string,
    {
      scientific_name: string;
      id: number | null;
      inDb: boolean;
      inSpider: boolean;
      dbData?: SpeciesListItem;
      spiderData?: SpiderSpecies;
    }
  >();

  // Add DB species
  for (const species of dbSpecies) {
    comparisonMap.set(species.scientific_name, {
      scientific_name: species.scientific_name,
      id: species.id,
      inDb: true,
      inSpider: false,
      dbData: species,
    });
  }

  // Add spider species
  for (const species of spiderSpecies) {
    const existing = comparisonMap.get(species.scientific_name);
    if (existing) {
      existing.inSpider = true;
      existing.spiderData = species;
    } else {
      // Extract ID from URL
      let id = null;
      try {
        const url = new URL(species.species_url);
        id = parseInt(url.searchParams.get("id") || "0") || null;
      } catch (e) {
        // ignore
      }

      comparisonMap.set(species.scientific_name, {
        scientific_name: species.scientific_name,
        id,
        inDb: false,
        inSpider: true,
        spiderData: species,
      });
    }
  }

  const comparison = Array.from(comparisonMap.values()).sort((a, b) =>
    a.scientific_name.localeCompare(b.scientific_name)
  );

  return {
    dbSpecies,
    spiderSpecies,
    comparison,
  };
}

export default function SpeciesList({ loaderData }: Route.ComponentProps) {
  const { comparison } = loaderData as ComparisonData;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // Filter species based on search
  const filteredComparison = comparison.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spiderData?.authority?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const ITEMS_PER_PAGE = 18;
  const totalPages = Math.ceil(filteredComparison.length / ITEMS_PER_PAGE);
  const validPage = Math.min(page, Math.max(1, totalPages));
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResults = filteredComparison.slice(startIndex, endIndex);

  // Helper to build page URLs
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (newPage > 1) params.set("page", String(newPage));
    return `/?${params.toString()}`;
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Species Collection</h1>

        <nav aria-label="Wildex sections" className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-lg">
          <Link to="/field-guide" className="underline underline-offset-4">
            Forest Beings
          </Link>
          <a href="/articles/lets-talk-about-poop/" className="underline underline-offset-4">
            Let's Talk About Poop
          </a>
          <a href="/articles/lotus-vs-lily/" className="underline underline-offset-4">
            Water Lily vs Lotus
          </a>
        </nav>

        {/* Search */}
        <Form method="get" className="max-w-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search by scientific name or authority..."
              className="flex-1 px-4 py-3 text-xl border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:shadow-[0_0_0_2px_black] dark:focus:shadow-[0_0_0_2px_white]"
              aria-label="Search species"
            />
            <button
              type="submit"
              className="px-6 py-3 text-xl font-bold border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors"
              aria-label="Submit search"
            >
              Search
            </button>
            {searchQuery && (
              <Link
                to="/"
                className="px-6 py-3 text-xl font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                aria-label="Clear search"
              >
                Clear
              </Link>
            )}
          </div>
        </Form>

        <p className="mt-4 text-xl">
          {filteredComparison.length > 0 ? (
            <>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredComparison.length)} of {filteredComparison.length}{" "}
              species
              {searchQuery && ` (filtered from ${comparison.length} total)`}
            </>
          ) : (
            `0 of ${comparison.length} species`
          )}
        </p>
      </header>

      {/* All Species List */}
      {filteredComparison.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-3xl font-bold mb-4">No species found</p>
          <p className="text-xl">Try a different search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedResults.map((item) => {
              const imageUrl = item.dbData?.main_image_url || item.spiderData?.thumbnail_url;
              const commonName = item.dbData?.common_name || null;
              const authority = item.spiderData?.authority || "";
              const family = item.dbData?.family || "";

              return (
                <div
                  key={item.scientific_name}
                  className={`relative border-2 border-black dark:border-white bg-white dark:bg-black ${
                    !item.inDb ? "opacity-60" : ""
                  }`}
                >
                  {/* Status Indicators */}
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    {item.inDb && (
                      <div
                        className="px-2 py-1 text-xs font-bold bg-black text-white dark:bg-white dark:text-black"
                        title="In Database"
                      >
                        DB
                      </div>
                    )}
                    {item.inSpider && (
                      <div
                        className="px-2 py-1 text-xs font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white"
                        title="In Spider JSON"
                      >
                        JSON
                      </div>
                    )}
                  </div>

                  {/* Link wrapper for DB species, plain div for others */}
                  {item.inDb && item.id ? (
                    <Link
                      to={`/species/${item.id}`}
                      className="block hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <SpeciesCard
                        imageUrl={imageUrl}
                        scientificName={item.scientific_name}
                        commonName={commonName}
                        authority={authority}
                        family={family}
                        speciesId={item.id}
                      />
                    </Link>
                  ) : (
                    <SpeciesCard
                      imageUrl={imageUrl}
                      scientificName={item.scientific_name}
                      commonName={commonName}
                      authority={authority}
                      family={family}
                      speciesId={item.id}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="flex gap-2 flex-wrap justify-center">
                {/* Previous button */}
                {validPage > 1 ? (
                  <Link
                    to={buildPageUrl(validPage - 1)}
                    className="px-6 py-3 text-xl font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    aria-label="Previous page"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="px-6 py-3 text-xl font-bold border-2 border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed">
                    ← Previous
                  </span>
                )}

                {/* Page numbers */}
                <div className="flex gap-2">
                  {/* First page */}
                  {validPage > 3 && (
                    <>
                      <Link
                        to={buildPageUrl(1)}
                        className="px-4 py-3 text-xl font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        1
                      </Link>
                      {validPage > 4 && <span className="px-4 py-3 text-xl font-bold">...</span>}
                    </>
                  )}

                  {/* Pages around current */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - validPage) <= 1)
                    .map((p) =>
                      p === validPage ? (
                        <span
                          key={p}
                          className="px-4 py-3 text-xl font-bold border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                          aria-current="page"
                        >
                          {p}
                        </span>
                      ) : (
                        <Link
                          key={p}
                          to={buildPageUrl(p)}
                          className="px-4 py-3 text-xl font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                          {p}
                        </Link>
                      )
                    )}

                  {/* Last page */}
                  {validPage < totalPages - 2 && (
                    <>
                      {validPage < totalPages - 3 && <span className="px-4 py-3 text-xl font-bold">...</span>}
                      <Link
                        to={buildPageUrl(totalPages)}
                        className="px-4 py-3 text-xl font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        {totalPages}
                      </Link>
                    </>
                  )}
                </div>

                {/* Next button */}
                {validPage < totalPages ? (
                  <Link
                    to={buildPageUrl(validPage + 1)}
                    className="px-6 py-3 text-xl font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    aria-label="Next page"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="px-6 py-3 text-xl font-bold border-2 border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed">
                    Next →
                  </span>
                )}
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-400">
                Page {validPage} of {totalPages}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SpeciesCard({
  imageUrl,
  scientificName,
  commonName,
  authority,
  family,
  speciesId,
}: {
  imageUrl?: string | null;
  scientificName: string;
  commonName?: string | null;
  authority: string;
  family: string;
  speciesId: number | null;
}) {
  return (
    <>
      {imageUrl && (
        <div className="aspect-[4/3] overflow-hidden border-b-2 border-black dark:border-white">
          <img
            src={imageUrl}
            alt={commonName || scientificName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-2xl font-bold">{commonName || scientificName}</h2>
          {speciesId !== null ? (
            <span className="px-2 py-1 text-xs font-bold bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-full whitespace-nowrap">
              #{speciesId}
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-bold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-full whitespace-nowrap">
              missing
            </span>
          )}
        </div>
        {commonName && <p className="text-lg mb-2 italic text-gray-600 dark:text-gray-400">{scientificName}</p>}
        {authority && <p className="text-lg mb-2">{authority}</p>}
        {family && <p className="text-base text-gray-600 dark:text-gray-400">{family}</p>}
      </div>
    </>
  );
}
