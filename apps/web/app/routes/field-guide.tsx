import { Link } from "react-router";
import type { Route } from "./+types/field-guide";
import fieldGuide from "../data/field-guide.json";

type FieldGuideEntry = {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;
  imageAlt: string;
  audio?: string;
  region?: string;
  activity?: string;
  encounterGuidance?: string;
  presenceSigns?: string;
};

const entries: FieldGuideEntry[] = fieldGuide;

export const meta: Route.MetaFunction = () => [
  { title: "Forest Beings | Wildex" },
  {
    name: "description",
    content:
      "Living wisely alongside the beings who shape and inhabit these landscapes.",
  },
];

export default function FieldGuide() {
  return (
    <div className="min-h-screen bg-stone-100 pb-16 text-stone-800">
      <header className="mx-auto max-w-6xl px-4 py-8 md:py-16 lg:py-20">
        <Link to="/" className="mb-6 inline-block underline underline-offset-4">
          Species collection
        </Link>
        <h1 className="mb-2 text-4xl font-semibold">Forest Beings</h1>
        <p className="max-w-2xl text-xl font-light text-stone-600">
          Living wisely alongside the beings who shape and inhabit these
          landscapes
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => {
          const notes = [
            entry.activity,
            entry.encounterGuidance,
            entry.presenceSigns,
          ].filter(Boolean);

          return (
            <article
              key={entry.id}
              id={entry.id}
              className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-md"
            >
              <div className="relative overflow-hidden pt-[75%]">
                <div
                  className="absolute inset-0 bg-cover bg-center blur-xl"
                  style={{ backgroundImage: `url(${entry.image})` }}
                />
                <img
                  loading="lazy"
                  src={entry.image}
                  alt={entry.imageAlt}
                  className="absolute inset-0 z-10 h-full w-full object-contain p-2"
                />
              </div>

              <div className="h-full p-6">
                <h2 className="text-2xl font-medium">{entry.commonName}</h2>
                <p className="mt-1 mb-4 text-base text-stone-500 italic">
                  {entry.scientificName}
                </p>

                {entry.audio && (
                  <figure className="mb-4">
                    <figcaption className="mb-1 text-sm text-stone-600 italic">
                      Listen to call
                    </figcaption>
                    <audio
                      controls
                      preload="none"
                      src={entry.audio}
                      className="w-full"
                    />
                  </figure>
                )}

                {entry.region && (
                  <p className="mb-5">
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                      {entry.region}
                    </span>
                  </p>
                )}

                {notes.length > 0 && (
                  <ul className="list-disc space-y-3 pl-5">
                    {notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}
