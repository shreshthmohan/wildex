import type { Route } from "./+types/route";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import {
  fieldPhotos,
  gaps,
  gbifCountries,
  herbariumSheets,
  malesiana,
  misapplied,
  morphology,
  nativeRange,
  sources,
  synonyms,
  typeSheets,
  vernacular,
  type Media,
} from "./data";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800;900&display=swap",
  },
];

export function meta() {
  return [
    { title: "Fimbristylis insignis - Foresty" },
    {
      name: "description",
      content:
        "A tufted perennial sedge of wet, poor ground from Sri Lanka to Cape York. Description, distribution, habitat, type material and photographs.",
    },
  ];
}

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "names", label: "Names" },
  { id: "description", label: "Description" },
  { id: "telling-it-apart", label: "Telling It Apart" },
  { id: "where-it-grows", label: "Where It Grows" },
  { id: "habitat", label: "Habitat & Neighbours" },
  { id: "season", label: "Through the Year" },
  { id: "type-material", label: "Type Material" },
  { id: "conservation", label: "Conservation" },
  { id: "field-photographs", label: "Field Photographs" },
  { id: "herbarium-sheets", label: "Herbarium Sheets" },
  { id: "gaps", label: "What Is Missing" },
  { id: "sources", label: "Sources" },
];

function Figure({ item }: { item: Media }) {
  return (
    <figure>
      <img
        src={item.src}
        alt={item.caption}
        loading="lazy"
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
      />
      <figcaption className="mt-3 space-y-1">
        <p className="text-base leading-snug text-gray-700 dark:text-gray-300">{item.caption}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">{item.place}</p>
        <p className="text-sm text-gray-400 dark:text-gray-600">
          {item.credit} &middot;{" "}
          <a
            href={item.source}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            {item.license}
          </a>
        </p>
      </figcaption>
    </figure>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-20 scroll-mt-8">
      <h2 className="font-semibold text-2xl text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function FimbristylisInsignis() {
  return (
    <div className="bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 antialiased text-xl min-h-screen font-[League_Spartan,ui-sans-serif,system-ui,sans-serif]">
      <div className="max-w-6xl mx-auto px-8 py-12 lg:flex lg:gap-12">
        <main className="max-w-3xl lg:flex-1">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Fimbristylis insignis" }]}
          />

          {/* Header */}
          <header className="pb-8 mb-10 border-b-2 border-gray-900 dark:border-gray-400">
            <p className="text-base uppercase tracking-widest text-gray-900/50 dark:text-gray-400/60 mb-2">
              Cyperaceae &middot; Sedge Family
            </p>
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 italic mb-1">
              Fimbristylis insignis
            </h1>
            <p className="text-2xl text-gray-900/70 dark:text-gray-300 mb-6">
              Thwaites, 1864. A tufted perennial sedge of wet, poor ground, from Sri Lanka to Cape
              York.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-1 text-base text-gray-900/60 dark:text-gray-400">
              <p>
                <span className="text-gray-900/40 dark:text-gray-500">Rank</span> Species
              </p>
              <p>
                <span className="text-gray-900/40 dark:text-gray-500">Status</span> Accepted name
              </p>
              <p>
                <span className="text-gray-900/40 dark:text-gray-500">Page built</span> September
                2026
              </p>
            </div>
          </header>

          {/* Hero */}
          <figure className="mb-16">
            <img
              src="/species-media/fimbristylis-insignis/hero-spiral-rosette.jpg"
              alt="A lime-green rosette of Fimbristylis insignis in a shallow layer of dark soil over rock, its leaves curving one way around the centre in a flat spiral."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            />
            <figcaption className="mt-3 text-base leading-snug text-gray-700 dark:text-gray-300">
              The plant as you meet it: a flat green pinwheel in a shallow skin of soil over rock.
              Every blade curves the same way around the centre. There is no flowering stalk for
              most of the year, so this rosette is the whole plant above ground.
            </figcaption>
          </figure>

          {/* Overview */}
          <Section id="overview" title="Overview">
            <p className="leading-relaxed mb-6">
              <strong className="font-semibold text-gray-900 dark:text-gray-100">
                Fimbristylis insignis
              </strong>{" "}
              is a perennial sedge. It grows as a dense tuft, because the rhizome is short and does
              not run. The leaves curve out from the centre of the tuft in a way that makes the
              plant look like a small green star from above. From that tuft the plant sends up stiff
              culms of 20-40 cm, each one topped by a loose head of hard, cigar-shaped spikelets.
              Those spikelets give the species its Chinese name, which means &ldquo;hard-spike
              fimbry&rdquo;.
            </p>
            <p className="leading-relaxed mb-6">
              G.H.K. Thwaites published the species in 1864 in his{" "}
              <em>Enumeratio Plantarum Zeylaniae</em>, from material he collected in Ceylon, now Sri
              Lanka. The range is wide but thin: the plant occurs from Sri Lanka and southern India
              across mainland Southeast Asia to southern China, then through the Malesian islands to
              New Guinea and northern Queensland. It is nowhere common in collections.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { k: "Height", v: "20-40", s: "cm, culms" },
                { k: "Spikelets", v: "10-20", s: "mm long, about 4 mm thick" },
                { k: "Countries", v: "14", s: "with GBIF records" },
                { k: "Records", v: "235", s: "on GBIF, all sources" },
              ].map((c) => (
                <div
                  key={c.k}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-5"
                >
                  <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                    {c.k}
                  </p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {c.v}
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400">{c.s}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Names */}
          <Section id="names" title="Names">
            <p className="leading-relaxed mb-6">
              The accepted name is <em>Fimbristylis insignis</em> Thwaites, published in{" "}
              <em>Enumeratio Plantarum Zeylaniae</em> page 349 in 1864. The genus name comes from
              the Latin <em>fimbria</em>, a fringe, and refers to the hairs on the style. The
              epithet <em>insignis</em> means &ldquo;remarkable&rdquo;.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Synonyms
            </h3>
            <div className="space-y-4 mb-8">
              {synonyms.map((s) => (
                <div
                  key={s.name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                >
                  <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                    <em>{s.name}</em> {s.author}
                  </p>
                  <p className="text-base text-gray-500 dark:text-gray-400">{s.published}</p>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Names applied to it by mistake
            </h3>
            <p className="leading-relaxed mb-4 text-base text-gray-600 dark:text-gray-400">
              Kern lists two names that earlier authors used, in part, for material of this species.
              Both are legitimate names of other plants, so they are not synonyms. If you meet
              either one on an old Philippine or Malayan sheet, check the determination.
            </p>
            <div className="space-y-4 mb-8">
              {misapplied.map((m) => (
                <div
                  key={m.name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                >
                  <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                    <em>{m.name}</em>
                  </p>
                  <p className="text-base text-gray-500 dark:text-gray-400">{m.where}</p>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Local names
            </h3>
            <div className="space-y-4">
              {vernacular.map((v) => (
                <div
                  key={v.name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                >
                  <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                    {v.name}{" "}
                    <span className="font-normal text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      {v.language}
                    </span>
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400">{v.note}</p>
                </div>
              ))}
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              No English or Indian common name is recorded for this species. India Flora Online
              files it under the Hindi family name बड़ा नागर मोथा, which names the sedge family and
              not this plant.
            </p>
          </Section>

          {/* Description */}
          <Section id="description" title="Description">
            <p className="leading-relaxed mb-6">
              The description below follows the Flora of China treatment, which is the fullest
              modern account in the open literature.
            </p>
            <dl className="space-y-4 mb-12">
              {morphology.map((m) => (
                <div
                  key={m.part}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                >
                  <dt className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                    {m.part}
                  </dt>
                  <dd className="leading-relaxed">{m.text}</dd>
                </div>
              ))}
            </dl>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              A second description: Flora Malesiana
            </h3>
            <p className="leading-relaxed mb-6">
              Kern treated the species for the Flora Malesiana Cyperaceae in 1974, from material
              across the islands. His measurements run wider than the Chinese ones, because his
              material does. Where the two accounts differ, the difference is the range of the
              species, not an error.
            </p>
            <dl className="space-y-4 mb-6">
              {malesiana.map((m) => (
                <div
                  key={m.part}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                >
                  <dt className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                    {m.part}
                  </dt>
                  <dd className="leading-relaxed text-base text-gray-600 dark:text-gray-400">
                    {m.text}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="border-l-4 border-lime-700 dark:border-lime-500 bg-gray-50 dark:bg-gray-900 rounded-r-lg p-5">
              <p className="text-base leading-relaxed">
                <strong className="font-semibold text-gray-900 dark:text-gray-100">
                  A correction Kern makes to Thwaites.
                </strong>{" "}
                Thwaites described the style as hairless. Kern examined the type collection C.P.
                3317 and most other material, and found the style distinctly ciliate, sometimes
                edged with a hyaline membrane. He found it hairless in one collection only,
                Vesterdal 228 from Kedah. If you key this plant out, expect a hairy style.
              </p>
            </div>
          </Section>

          {/* Telling it apart */}
          <Section id="telling-it-apart" title="Telling It Apart">
            <p className="leading-relaxed mb-6">
              <em>Fimbristylis</em> is a large and difficult genus. Four characters together
              separate this species from most of the others in its range:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                [
                  "Big, solitary spikelets",
                  "10-20 mm long and about 4 mm thick, each one alone at the end of a ray. Most Fimbristylis species have spikelets under 10 mm, and many carry them in clusters.",
                ],
                [
                  "Long glumes",
                  "About 6 mm, with a keeled midvein and a short point at the tip.",
                ],
                [
                  "Three stigmas and a three-sided nutlet",
                  "The nutlet is broadly obcordate, about 1.5 mm, warty, and marked with a hexagonal net. Many common Fimbristylis species have two stigmas and a flat, two-sided nutlet.",
                ],
                [
                  "Stiff, deeply grooved culms with a leathery leaf",
                  "The blade is 1-2.5 mm wide and almost leathery, not soft. There is no ligule.",
                ],
              ].map(([head, body]) => (
                <li key={head} className="flex items-start gap-3">
                  <span className="mt-3 block w-2 h-2 rounded-full bg-lime-700 dark:bg-lime-500 flex-shrink-0" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{head}.</span>{" "}
                    {body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-l-4 border-lime-700 dark:border-lime-500 bg-gray-50 dark:bg-gray-900 rounded-r-lg p-5 mb-6">
              <p className="text-base leading-relaxed">
                <strong className="font-semibold text-gray-900 dark:text-gray-100">
                  The Flora Malesiana key couplet.
                </strong>{" "}
                Kern brings you to two species with spikelets 2-4 mm wide and a style 2.5-5 mm long,
                then splits them on one line. Glumes with a small point, nut obovoid-pyriform and
                truncate or slightly depressed at the top, rhizome not creeping, gives{" "}
                <em>F. insignis</em>. Glumes blunt with no point, nut broadly obovoid and rounded at
                the top, rhizome creeping, gives <em>F. pierotii</em>. The rhizome alone settles it
                in the field: this plant makes a clump and stays there.
              </p>
            </div>
            <div className="border-l-4 border-lime-700 dark:border-lime-500 bg-gray-50 dark:bg-gray-900 rounded-r-lg p-5">
              <p className="text-base leading-relaxed">
                <strong className="font-semibold text-gray-900 dark:text-gray-100">
                  A note on lookalikes.
                </strong>{" "}
                <em>Fimbristylis velliangiriensis</em>, described in 2010 from the Velliangiri Hills
                in the Nilgiri Biosphere Reserve, was published as a close relative of{" "}
                <em>F. insignis</em>. The two differ in leaf form, spikelet size, involucral bracts
                and anthers. Treat any Western Ghats record of <em>F. insignis</em> with care.
              </p>
            </div>
            <div className="border-l-4 border-amber-600 dark:border-amber-500 bg-gray-50 dark:bg-gray-900 rounded-r-lg p-5 mt-6">
              <p className="text-base leading-relaxed">
                <strong className="font-semibold text-gray-900 dark:text-gray-100">
                  Not the same plant: <em>Fimbristylis fimbristyloides</em>.
                </strong>{" "}
                <em>F. fimbristyloides</em> (F.Muell.) Druce is an accepted species in its own
                right, not a synonym. Popular write-ups sometimes run the two names together under
                a shared &ldquo;spiral sedge&rdquo; label, because both make a flat pinwheel
                rosette. The ranges separate them. <em>F. fimbristyloides</em> reaches Nepal,
                Bhutan, Assam, the East Himalaya, Korea and Japan, and is not recorded from Sri
                Lanka. <em>F. insignis</em> is a Sri Lankan, Southeast Asian and Australian plant
                and reaches none of those northern regions. Where they do overlap, in Thailand,
                Borneo, Sulawesi, New Guinea and Queensland, use the description above rather than
                the rosette shape.
              </p>
            </div>
          </Section>

          {/* Where it grows */}
          <Section id="where-it-grows" title="Where It Grows">
            <p className="leading-relaxed mb-6">
              The World Checklist of Vascular Plants gives the native range as fifteen regions:
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {nativeRange.map((r) => (
                <span
                  key={r}
                  className="border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1 text-base text-gray-700 dark:text-gray-300"
                >
                  {r}
                </span>
              ))}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Records per country
            </h3>
            <p className="leading-relaxed mb-4 text-base text-gray-600 dark:text-gray-400">
              GBIF holds 235 records in total. Collecting effort, not abundance, drives most of the
              differences below.
            </p>
            <div className="space-y-2 mb-8">
              {gbifCountries.map((c) => (
                <div key={c.name} className="flex items-center gap-4">
                  <span className="w-40 flex-shrink-0 text-base text-gray-700 dark:text-gray-300">
                    {c.name}
                  </span>
                  <span
                    className="h-3 rounded-sm bg-lime-700 dark:bg-lime-500"
                    style={{ width: `${(c.count / 57) * 100}%`, minWidth: "4px" }}
                  />
                  <span className="text-base text-gray-400 dark:text-gray-500 tabular-nums">
                    {c.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                  Australia: Cape York Peninsula
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  47 of the 57 Australian records carry the state Queensland, and almost all of them
                  sit on Cape York Peninsula. Named sites include the Jardine River and Jardine
                  Swamp, Eliot Creek and Fruit Bat Falls, Cholmondeley Creek, the Wenlock River,
                  Weipa, Iron Range and Moa Island in the Torres Strait. One record carries Northern
                  Territory.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                  Thailand: the northeastern sandstone plateaus
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Most Thai material comes from Isan and the hills around it: Phu Kradung, Phu Phan,
                  Phu Wua, Phu Phra Bat, Sakon Nakhon, Kalasin, Mukdahan, Chaiyaphum and Ubon
                  Ratchathani. Southern records reach Songkhla and Krabi.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                  China: Guangdong and Hainan
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  The Flora of China limits the species to Guangdong and Hainan. Two GBIF records
                  come from Hong Kong, both of them recent observations.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                  India: a thin record
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  India Flora Online records the species from Alappuzha district in Kerala, in wet
                  places, and gives the wider range as Indo-Malesia and China. GBIF holds only two
                  Indian records. The Indian occurrence is real but poorly documented.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                  Sri Lanka: the home ground
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Fifteen Sri Lankan records, several of them from the 19th century Thwaites
                  collections. Later material comes from Kalutara district and from the road between
                  Ramboda and Nuwara Eliya.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                  The islands: scattered, never common
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Kern calls the Malesian occurrence a handful of remote localities, and names them:
                  Setul and Kedah on the Malay Peninsula, North Borneo, Culion, Luzon and Panay in
                  the Philippines, Rumbia and Timampu in southeast Celebes. New Guinea is the
                  exception. There he writes &ldquo;throughout&rdquo;, and GBIF backs him with 21
                  Papua New Guinea records plus more from the Indonesian side.
                </p>
              </div>
            </div>
          </Section>

          {/* Habitat */}
          <Section id="habitat" title="Habitat & Neighbours">
            <p className="leading-relaxed mb-6">
              The two floras disagree in a useful way. The Flora of China puts the plant on{" "}
              <em>dry slopes, poor soil</em>. India Flora Online puts it in <em>wet places</em>. The
              herbarium labels and the field photographs settle it: this is a plant of ground that
              is seasonally wet and permanently poor. Seepage zones, stream margins, thin soil over
              sandstone, open sedgeland on sand. Wet in the rains, hard and bare out of them.
            </p>
            <p className="leading-relaxed mb-6">
              The best single record is the label of Wilson &amp; Sharpe 8188, collected at Jardine
              Swamp on Cape York in March 1992. It gives the vegetation as open sedgeland of{" "}
              <em>Leptocarpus spathaceus</em> with <em>Asteromyrtus lysicephala</em>, and calls the
              site a &ldquo;Wet Desert&rdquo;. The collectors took nine other sedges and a
              pitcher plant at the same spot:
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                "Tricostularia undulata",
                "Tricostularia aff. undulata",
                "Schoenus punctatus",
                "Schoenus calostachyus",
                "Schoenus sparteus",
                "Rhynchospora brownii",
                "Rhynchospora rubra",
                "Nepenthes mirabilis",
              ].map((n) => (
                <span
                  key={n}
                  className="border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1 text-base italic text-gray-700 dark:text-gray-300"
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="leading-relaxed mb-6">
              That list is a signature. <em>Nepenthes</em>, <em>Schoenus</em> and{" "}
              <em>Rhynchospora</em> together mean wet, acid, nutrient-poor sand. This is the
              community that <em>F. insignis</em> belongs to at the Australian end of its range, and
              the Thai photographs show the same conditions on sandstone.
            </p>
            <p className="leading-relaxed mb-6">
              Kern, writing for the Malesian islands, adds the part the Australian label leaves
              out:{" "}
              <em>
                in frequently burnt savannahs, in open rocky grass-fields by the sea-shore, in the
                Malay Peninsula on heaths, in Celebes found in monsoon forest; at low altitudes
              </em>
              . Fire matters. A tufted perennial with a short rhizome and a tough leathery leaf is
              built to burn and come back, and the open ground after a fire is where a small sedge
              gets its light.
            </p>
            <p className="leading-relaxed mb-6">
              Kern&rsquo;s &ldquo;rocky grass-fields&rdquo; and the photographs point the same way:
              much of the time this plant behaves as a lithophyte. It anchors a wiry root system in
              a crack or in a film of soil over bare stone, on ground that holds a sheet of water in
              the rains and bakes hard out of them. Look at thin soil over sandstone, mossy rock in
              a stream bed, gravel at a stream margin, and the bare edges of seepage. That is where
              the field pictures below were taken.
            </p>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-5">
              <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                Altitude
              </p>
              <p className="leading-relaxed text-base text-gray-600 dark:text-gray-400">
                Kern calls it a plant of low altitudes. Most georeferenced records agree: sea level
                to 300 m. A few Thai collections reach 936-1300 m, on the Phu Kradung summit plateau
                and similar plateau country.
              </p>
            </div>
          </Section>

          {/* Season */}
          <Section id="season" title="Through the Year">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { k: "China", v: "June", s: "Flowers and fruits, per Flora of China" },
                { k: "India", v: "Sep-Nov", s: "Kerala, per India Flora Online" },
                { k: "Observed", v: "Jul-Nov", s: "Most dated iNaturalist records" },
              ].map((c) => (
                <div
                  key={c.k}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-5"
                >
                  <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                    {c.k}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{c.v}</p>
                  <p className="text-base text-gray-600 dark:text-gray-400">{c.s}</p>
                </div>
              ))}
            </div>
            <p className="leading-relaxed mb-12">
              The species follows the monsoon. It flowers after the rains fill its ground, so the
              month moves with latitude. Herbarium labels carry dates from March to November, which
              means no single flowering window covers the whole range. For India the window is
              usually given as August to November, as the rains recede.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              The plant changes shape twice
            </h3>
            <p className="leading-relaxed mb-6">
              For most of the year there is no flowering stalk at all, and the plant is only a
              rosette pressed against rock. The photographs on this page are almost all of that
              phase. It is worth learning, because it is what you will actually meet.
            </p>
            <div className="space-y-4 mb-8">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  Wet season
                </p>
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-1">
                  A lime-green pinwheel
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  With water available the rosette is bright and full. The blades spread wide and
                  curve one way around the centre, so the plant reads as a flat geometric spiral
                  against the dark ground it sits on, whether that is a shallow skin of soil over
                  rock or bare wet stone. Every field photograph here was taken in this phase.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  Dry season
                </p>
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-1">
                  Straw, bronze and rust, rolled tight
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  As the ground bakes, the green goes. The blades roll inward and press flat to the
                  rock, which cuts the surface the sun can reach. The leathery leaf and the short
                  rhizome that the floras describe are both parts of the same answer to this
                  problem. The plant is a perennial: it holds on and waits, rather than dying back
                  to seed.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  Flowering
                </p>
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-1">
                  Stiff stalks straight out of the middle
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  The geometry inverts. A few rigid, grooved culms rise vertically from the centre
                  of the flat rosette and carry the head clear of it. There are no petals. Each
                  spikelet is a hard brown cone of tightly overlapping glumes, and the only bright
                  part is the three white stigmas at the tip. Wind does the pollinating. The
                  Queensland photographs by Jason Searle are the ones on this page that show it.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  Fruit
                </p>
                <p className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-1">
                  Nutlets into the cracks
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  The nutlets are about 1-1.5 mm, three-sided, warty and netted. They drop into the
                  crevices around the parent and wait for the next rains. The two floras disagree on
                  colour: the Flora of China says greyish black when ripe, Kern says whitish or
                  brownish. Expect both, and use the shape and the net pattern instead.
                </p>
              </div>
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400">
              The two-phase account above is read off the photographs and the floras together. No
              single source on this page describes the seasonal colour change directly, so treat it
              as a working picture rather than a citation.
            </p>
          </Section>

          {/* Type material */}
          <Section id="type-material" title="Type Material">
            <p className="leading-relaxed mb-6">
              Thwaites collected the type in Ceylon under his Ceylon Plants number{" "}
              <strong className="font-semibold text-gray-900 dark:text-gray-100">C.P. 3317</strong>.
              He distributed duplicates widely, so sheets of this one gathering now sit in at least
              eight herbaria: P, K, BM, G, BR, GH, DR and SMF. The Paris sheet P00045584 is recorded
              as the holotype, with P00045585 as an isotype.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              The protologue, 1864
            </h3>
            <p className="leading-relaxed mb-4">
              Thwaites gave the species as number 15 in his run of{" "}
              <em>Fimbristylis</em>, on page 349, in Latin. Read plainly, it says: culm thread-like
              and grooved, slightly flattened at the top, hairless, leafy at the base; leaves short,
              firm, curved, blunt with a small point, hairless, rough on the margin; umbel open with
              about six rays; involucre very short; spikes almost cylindric and acute, borne one,
              two or three to a ray, the middle one stalkless and larger; glumes ovate-oblong,
              almost acute, with a small point; flowers with three stamens; nut shortly obcordate,
              three-sided, almost smooth; style linear, three-angled, hairless; stigmas rather
              short.
            </p>
            <p className="leading-relaxed mb-4">
              He adds the field notes in a smaller type: tufted, two feet tall; spike 1 to 1½ inch
              long and 1½ lines wide; glumes brownish-rust, paler at the base and margin, 2 lines
              long.
            </p>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-5 mb-8">
              <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                Type locality
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Between Negombo and Kurunegala
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Western and North Western Province, Sri Lanka. Thwaites gives no date. GBIF dates
                the Paris sheets to 1858, which fits: the{" "}
                <em>Enumeratio</em> came out in five parts between 1858 and 1864.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
              {typeSheets.map((item) => (
                <Figure key={item.src} item={item} />
              ))}
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400">
              The Paris holotype image could not be downloaded for this page. See{" "}
              <a
                href="#gaps"
                className="underline hover:text-gray-700 dark:hover:text-gray-200"
              >
                What Is Missing
              </a>
              .
            </p>
          </Section>

          {/* Conservation */}
          <Section id="conservation" title="Conservation">
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-5 mb-6">
              <p className="text-base text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                IUCN status
              </p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                Not Evaluated
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                No global assessment exists. India Flora Online also records NE.
              </p>
            </div>
            <p className="leading-relaxed">
              The wide range argues against global threat. The habitat does not. Seasonally wet,
              nutrient-poor sand and sandstone seepage is exactly the ground that drainage, mining
              and plantation forestry take first. The Cape York records cluster in country that is
              still largely intact. The Thai and Chinese records do not. Nobody has counted the
              populations.
            </p>
          </Section>

          {/* Field photographs */}
          <Section id="field-photographs" title="Field Photographs">
            <p className="leading-relaxed mb-4">
              {fieldPhotos.length} photographs, all from iNaturalist. The Queensland pictures by
              Jason Searle are the only ones here that show the flowering head clearly. The rest
              show the vegetative rosette, which is how the plant spends most of the year.
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
              Many of these observations are still at &ldquo;needs ID&rdquo; on iNaturalist. Treat
              the rosette photographs as probable, not confirmed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {fieldPhotos.map((item) => (
                <Figure key={item.src} item={item} />
              ))}
            </div>
          </Section>

          {/* Herbarium sheets */}
          <Section id="herbarium-sheets" title="Herbarium Sheets">
            <p className="leading-relaxed mb-8">
              {herbariumSheets.length} sheets from Kew, Naturalis, the Queensland Herbarium and the
              National Herbarium of New South Wales. A pressed sheet shows the whole plant, root to
              spikelet, at one scale. For a sedge that is often the fastest way to learn the shape.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {herbariumSheets.map((item) => (
                <Figure key={item.src} item={item} />
              ))}
            </div>
          </Section>

          {/* Gaps */}
          <Section id="gaps" title="What Is Missing">
            <p className="leading-relaxed mb-6">
              These sources refused access, sit behind a paywall, or are not online. Each one holds
              material this page would use. Every title below links to the page it was tried on, so
              you can open it, copy what is there, and paste it in.
            </p>
            <div className="space-y-4">
              {gaps.map((g) => (
                <div
                  key={g.url}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                >
                  <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-gray-300 dark:decoration-gray-600 underline-offset-4 hover:decoration-current"
                    >
                      {g.title}
                    </a>
                  </p>
                  <p className="text-base text-gray-400 dark:text-gray-500 mb-2 break-all">
                    {g.linkLabel}
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Blocked by
                    </span>{" "}
                    {g.problem}
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Want
                    </span>{" "}
                    {g.want}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-6">
              The same list, with a paste slot under each item, is in{" "}
              <code className="text-gray-700 dark:text-gray-300">
                app/routes/fimbristylis-insignis/SOURCES-BLOCKED.md
              </code>
              .
            </p>
          </Section>

          {/* Sources */}
          <Section id="sources" title="Sources">
            <ul className="space-y-4">
              {sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:font-semibold text-gray-900 dark:text-gray-100 transition-all"
                  >
                    {s.title}
                  </a>
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{s.note}</p>
                </li>
              ))}
            </ul>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-8">
              Images keep the licence of their source. The credit and licence under each picture
              link back to the record it came from.
            </p>
          </Section>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <nav
            className="sticky top-8 border-l-2 border-gray-900 dark:border-gray-400 pl-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
            aria-label="Page sections"
          >
            <p className="text-base uppercase tracking-widest text-gray-900/40 dark:text-gray-500 mb-3">
              On this page
            </p>
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="block py-1 text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
