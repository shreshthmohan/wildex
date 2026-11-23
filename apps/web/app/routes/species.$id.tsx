import type { Route } from "./+types/species.$id";
import { Link, Form, useSearchParams } from "react-router";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { redirect } from "react-router";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { id } = params;
  const db = context.cloudflare.env.DB;

  // Get species with all related data, including common name from names table
  const species = await db
    .prepare(
      `
    SELECT
      s.id,
      s.scientific_name,
      s.common_name_id,
      n.name as common_name,
      s.family,
      s.category,
      s.conservation_status,
      s.main_image_url,
      s.main_image_alt
    FROM species s
    LEFT JOIN names n ON s.common_name_id = n.id
    WHERE s.id = ?
  `
    )
    .bind(id)
    .first();

  if (!species) {
    throw new Response("Species not found", { status: 404 });
  }

  // Get all names grouped by language
  const namesResult = await db
    .prepare(
      `
    SELECT
      n.id,
      l.name as language_name,
      n.name as species_name
    FROM names n
    JOIN languages l ON n.language_id = l.id
    WHERE n.species_id = ?
    ORDER BY l.name
  `
    )
    .bind(id)
    .all();

  const names: Record<string, string[]> = {};
  const namesWithIds: Array<{ id: number; name: string; language: string }> = [];

  for (const row of namesResult.results) {
    const langName = row.language_name as string;
    const speciesName = row.species_name as string;
    const nameId = row.id as number;

    if (!names[langName]) {
      names[langName] = [];
    }
    names[langName].push(speciesName);
    namesWithIds.push({ id: nameId, name: speciesName, language: langName });
  }

  // Get all sections with their images
  const sectionsResult = await db
    .prepare(
      `
    SELECT
      s.id,
      s.title,
      s.section_order,
      s.content_text,
      s.content_html
    FROM sections s
    WHERE s.species_id = ?
    ORDER BY s.section_order
  `
    )
    .bind(id)
    .all();

  const sections = [];
  for (const section of sectionsResult.results) {
    const imagesResult = await db
      .prepare(
        `
      SELECT
        image_url,
        caption,
        credit
      FROM section_images
      WHERE section_id = ?
      ORDER BY image_order
    `
      )
      .bind(section.id)
      .all();

    sections.push({
      ...section,
      images: imagesResult.results,
    });
  }

  // Get attributes
  const attributesResult = await db
    .prepare(
      `
    SELECT
      a.name,
      a.category,
      a.description
    FROM attributes a
    JOIN species_attributes sa ON a.id = sa.attribute_id
    WHERE sa.species_id = ?
  `
    )
    .bind(id)
    .all();

  // Get sources
  const sourcesResult = await db
    .prepare(
      `
    SELECT
      url,
      title,
      description,
      accessed_at
    FROM sources
    WHERE species_id = ?
    ORDER BY source_order
  `
    )
    .bind(id)
    .all();

  return {
    species,
    names,
    namesWithIds,
    sections,
    attributes: attributesResult.results,
    sources: sourcesResult.results,
  };
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const { id } = params;
  const db = context.cloudflare.env.DB;
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "update_common_name") {
    const nameId = formData.get("common_name_id") as string;

    await db
      .prepare("UPDATE species SET common_name_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(nameId || null, id)
      .run();

    return redirect(`/species/${id}?success=updated`);
  }

  return { error: "Invalid action" };
}

// Helper function to create URL-friendly slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function Species({ loaderData }: Route.ComponentProps) {
  const { species, names, namesWithIds, sections, sources } = loaderData;
  const [searchParams] = useSearchParams();
  const editing = searchParams.get("edit") === "true";
  const success = searchParams.get("success");

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white min-h-screen">
      <div className="max-w-screen-xl mx-auto p-4 md:p-8 md:flex md:gap-8">
        {/* Main Content */}
        <main className="flex-1 md:pr-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: String(species.scientific_name || "Species") },
            ]}
          />

          {/* Success message */}
          {success === "updated" && (
            <div className="mb-6 p-4 border-2 border-black dark:border-white bg-green-50 dark:bg-green-900 flex items-center justify-between">
              <span className="text-lg">Common name updated successfully!</span>
              <Link to={`/species/${species.id}`} className="text-sm underline hover:font-bold">
                ✕
              </Link>
            </div>
          )}

          {/* Overview Section */}
          <section id="overview" className="mb-20">
            <h1 className="text-6xl font-bold mb-3">
              {species.common_name || species.scientific_name}
            </h1>
            {species.common_name && (
              <p className="text-3xl mb-3 italic text-gray-600 dark:text-gray-400">
                {species.scientific_name}
              </p>
            )}

            {/* Common Name Display/Edit */}
            <div className="mb-6">
              {editing ? (
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="_action" value="update_common_name" />
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <label htmlFor="common_name_id" className="block text-lg font-bold mb-2">
                        Common Name
                      </label>
                      <select
                        id="common_name_id"
                        name="common_name_id"
                        defaultValue={species.common_name_id || ""}
                        className="w-full px-4 py-2 text-xl border-2 border-black dark:border-white bg-white dark:bg-black"
                      >
                        <option value="">-- No common name --</option>
                        {namesWithIds.map((nameObj) => (
                          <option key={nameObj.id} value={nameObj.id}>
                            {nameObj.name} ({nameObj.language})
                          </option>
                        ))}
                      </select>
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                        Choose from existing names in any language
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                      Save
                    </button>
                    <Link
                      to={`/species/${species.id}`}
                      className="px-6 py-2 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      Cancel
                    </Link>
                  </div>
                </Form>
              ) : (
                <div className="flex items-center gap-4">
                  {species.common_name ? (
                    <p className="text-2xl">{species.common_name}</p>
                  ) : (
                    <p className="text-2xl text-gray-400 italic">No common name set</p>
                  )}
                  <Link
                    to={`/species/${species.id}?edit=true`}
                    className="text-lg underline hover:font-bold"
                  >
                    Edit
                  </Link>
                </div>
              )}
            </div>

            <p className="text-3xl mb-8">{species.family}</p>

            {/* Names */}
            {Object.keys(names).length > 0 && (
              <div className="mb-8">
                {Object.entries(names).map(([lang, langNames]) => (
                  <div key={lang} className="mb-3">
                    <span className="font-bold text-xl">{lang}:</span>
                    <span className="text-xl ml-2">{langNames.join(", ")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Main Image */}
            {species.main_image_url && (
              <div className="mt-10">
                <img
                  src={species.main_image_url}
                  alt={species.main_image_alt || species.scientific_name}
                  className="max-h-[98vh] border-2 border-black dark:border-white"
                />
                <p className="text-base mt-2">Main specimen</p>
              </div>
            )}
          </section>

          {/* Dynamic Sections */}
          {sections.map((section: any) => (
            <section
              key={section.id}
              id={slugify(section.title)}
              className="mb-20 border-t-2 border-black dark:border-white pt-10 scroll-mt-8"
            >
              <h2 className="text-4xl font-bold mb-6">{section.title}</h2>

              {/* Section Content */}
              {section.content_html ? (
                <div
                  className="text-xl leading-relaxed mb-6 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content_html }}
                />
              ) : section.content_text ? (
                <div className="text-xl leading-relaxed mb-6">
                  <p>{section.content_text}</p>
                </div>
              ) : null}

              {/* Section Images */}
              {section.images && section.images.length > 0 && (
                <div className="space-y-8 mt-8">
                  {section.images.map((img: any, idx: number) => (
                    <div key={idx}>
                      <img
                        src={img.image_url}
                        alt={img.caption || section.title}
                        className="max-h-[98vh] border-2 border-black dark:border-white mb-2"
                      />
                      {img.caption && (
                        <p className="text-base italic text-lg">
                          {img.caption}
                        </p>
                      )}
                      {img.credit && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Credit: {img.credit}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Sources Section */}
          {sources && sources.length > 0 && (
            <section
              id="sources"
              className="mb-20 border-t-2 border-black dark:border-white pt-10"
            >
              <h2 className="text-4xl font-bold mb-8">
                {sources.length === 1 ? "Source" : "Sources"}
              </h2>
              <p className="text-xl mb-4">
                Information on this page is sourced from:
              </p>
              <ul className="space-y-4">
                {sources.map((source: any, idx: number) => (
                  <li key={idx}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl underline hover:font-bold transition-all"
                    >
                      {source.title || source.url}
                    </a>
                    {source.description && (
                      <p className="text-base mt-1 text-gray-600 dark:text-gray-400">
                        {source.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <nav
            className="sticky top-4 space-y-2 border-l-2 border-black dark:border-white pl-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
            aria-label="Species sections"
          >
            <a
              href="#overview"
              className="md:text-xl block py-1 hover:underline transition-all"
            >
              {species.scientific_name}
            </a>
            {sections.map((section: any) => (
              <a
                key={section.id}
                href={`#${slugify(section.title)}`}
                className="md:text-xl block py-1 hover:underline transition-all"
              >
                {section.title}
              </a>
            ))}
            {sources && sources.length > 0 && (
              <a
                href="#sources"
                className="md:text-xl block py-1 hover:underline transition-all"
              >
                {sources.length === 1 ? "Source" : "Sources"}
              </a>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}
