import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Type definitions for the scraped data
interface ScrapedSpecies {
  species_id: number;
  url: string;
  scraped_at: string;
  basic_info: {
    scientific_name: string;
    authority?: string;
    family: string;
  };
  images: {
    main_specimen?: string;
    dry_herbarium?: string;
  };
  nomenclature: {
    botanical_name: string;
    family: string;
    english_names?: string;
    indian_names?: string | null;
    synonyms?: string[];
  };
  description: {
    [key: string]: {
      text: string | null;
      text_html: string;
      images: Array<{
        url: string;
        caption: string;
      }>;
    };
  };
  ecology?: any;
  human_uses?: any;
  conservation?: any;
}

// Language mapping
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'Bengali' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
];

const LANGUAGE_NAME_TO_ID: { [key: string]: number } = {
  'English': 1,
  'Bengali': 2,
  'Hindi': 3,
  'Kannada': 4,
  'Malayalam': 5,
  'Marathi': 6,
  'Sanskrit': 7,
  'Tamil': 8,
  'Telugu': 9,
};

function escapeSql(str: string | null): string {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function generateSqlForSpecies(speciesData: ScrapedSpecies, speciesId: number): string[] {
  const statements: string[] = [];

  // Clean up existing related data for this species ID
  statements.push(`-- Clean up existing data for species ID ${speciesId}`);
  statements.push(`DELETE FROM section_images WHERE section_id IN (SELECT id FROM sections WHERE species_id = ${speciesId});`);
  statements.push(`DELETE FROM sections WHERE species_id = ${speciesId};`);
  statements.push(`DELETE FROM names WHERE species_id = ${speciesId};`);
  statements.push(`DELETE FROM sources WHERE species_id = ${speciesId};`);
  statements.push('');

  // Insert or replace species
  statements.push(
    `INSERT OR REPLACE INTO species (id, scientific_name, family, category, main_image_url, main_image_alt) VALUES (${speciesId}, ${escapeSql(
      speciesData.basic_info.scientific_name
    )}, ${escapeSql(speciesData.basic_info.family)}, 'plants', ${escapeSql(
      speciesData.images.main_specimen || null
    )}, ${escapeSql(speciesData.basic_info.scientific_name + ' specimen')});`
  );

  // Insert English names
  if (speciesData.nomenclature.english_names) {
    const englishLangId = LANGUAGE_NAME_TO_ID['English'];
    const englishNames = speciesData.nomenclature.english_names
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    for (const name of englishNames) {
      statements.push(
        `INSERT INTO names (species_id, language_id, name) VALUES (${speciesId}, ${englishLangId}, ${escapeSql(
          name
        )});`
      );
    }
  }

  // Insert Indian names
  if (speciesData.nomenclature.indian_names && typeof speciesData.nomenclature.indian_names === 'object') {
    for (const [languageName, names] of Object.entries(speciesData.nomenclature.indian_names)) {
      const languageId = LANGUAGE_NAME_TO_ID[languageName];
      if (languageId && Array.isArray(names)) {
        for (const name of names) {
          if (name && name.trim().length > 0) {
            statements.push(
              `INSERT INTO names (species_id, language_id, name) VALUES (${speciesId}, ${languageId}, ${escapeSql(
                name.trim()
              )});`
            );
          }
        }
      }
    }
  }

  // Insert sections and images from description
  const sectionOrder = ['habit', 'stem_bark', 'leaf', 'flower', 'fruit', 'seed'];

  let sectionId = speciesId * 100; // Simple ID generation
  let order = 1;

  for (const sectionKey of sectionOrder) {
    const section = speciesData.description?.[sectionKey];
    if (!section) continue;

    const title = sectionKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Insert section
    statements.push(
      `INSERT INTO sections (id, species_id, title, section_order, content_text, content_html) VALUES (${sectionId}, ${speciesId}, ${escapeSql(
        title
      )}, ${order}, ${escapeSql(section.text)}, ${escapeSql(section.text_html)});`
    );

    // Insert section images
    if (section.images && section.images.length > 0) {
      for (let i = 0; i < section.images.length; i++) {
        const img = section.images[i];
        statements.push(
          `INSERT INTO section_images (section_id, image_url, caption, image_order) VALUES (${sectionId}, ${escapeSql(
            img.url
          )}, ${escapeSql(img.caption)}, ${i + 1});`
        );
      }
    }

    sectionId++;
    order++;
  }

  // Insert combined Human Uses section
  if (speciesData.human_uses && typeof speciesData.human_uses === 'object') {
    const humanUsesSubsections = Object.values(speciesData.human_uses);

    if (humanUsesSubsections.length > 0) {
      // Combine all text and HTML content
      const combinedText = humanUsesSubsections
        .map((subsection: any) => subsection.text)
        .filter((text) => text)
        .join('\n\n');

      const combinedHtml = humanUsesSubsections
        .map((subsection: any) => subsection.text_html)
        .filter((html) => html)
        .join('\n');

      // Insert the combined section
      statements.push(
        `INSERT INTO sections (id, species_id, title, section_order, content_text, content_html) VALUES (${sectionId}, ${speciesId}, ${escapeSql(
          'Human Uses'
        )}, ${order}, ${escapeSql(combinedText || null)}, ${escapeSql(combinedHtml || null)});`
      );

      // Collect all images from all subsections
      let imageOrder = 1;
      for (const subsection of humanUsesSubsections) {
        const subsectionTyped = subsection as any;
        if (subsectionTyped.images && Array.isArray(subsectionTyped.images) && subsectionTyped.images.length > 0) {
          for (const img of subsectionTyped.images) {
            statements.push(
              `INSERT INTO section_images (section_id, image_url, caption, image_order) VALUES (${sectionId}, ${escapeSql(
                img.url
              )}, ${escapeSql(img.caption)}, ${imageOrder});`
            );
            imageOrder++;
          }
        }
      }

      sectionId++;
      order++;
    }
  }

  // Insert Ecology section
  if (speciesData.ecology?.ecology) {
    const ecologySection = speciesData.ecology.ecology;

    statements.push(
      `INSERT INTO sections (id, species_id, title, section_order, content_text, content_html) VALUES (${sectionId}, ${speciesId}, ${escapeSql(
        'Ecology'
      )}, ${order}, ${escapeSql(ecologySection.text || null)}, ${escapeSql(ecologySection.text_html || null)});`
    );

    // Insert images if any
    if (ecologySection.images && Array.isArray(ecologySection.images) && ecologySection.images.length > 0) {
      for (let i = 0; i < ecologySection.images.length; i++) {
        const img = ecologySection.images[i];
        statements.push(
          `INSERT INTO section_images (section_id, image_url, caption, image_order) VALUES (${sectionId}, ${escapeSql(
            img.url
          )}, ${escapeSql(img.caption)}, ${i + 1});`
        );
      }
    }

    sectionId++;
    order++;
  }

  // Insert Distribution section
  if (speciesData.ecology?.distribution) {
    const distributionSection = speciesData.ecology.distribution;

    statements.push(
      `INSERT INTO sections (id, species_id, title, section_order, content_text, content_html) VALUES (${sectionId}, ${speciesId}, ${escapeSql(
        'Distribution'
      )}, ${order}, ${escapeSql(distributionSection.text || null)}, ${escapeSql(distributionSection.text_html || null)});`
    );

    // Insert images if any
    if (distributionSection.images && Array.isArray(distributionSection.images) && distributionSection.images.length > 0) {
      for (let i = 0; i < distributionSection.images.length; i++) {
        const img = distributionSection.images[i];
        statements.push(
          `INSERT INTO section_images (section_id, image_url, caption, image_order) VALUES (${sectionId}, ${escapeSql(
            img.url
          )}, ${escapeSql(img.caption)}, ${i + 1});`
        );
      }
    }

    sectionId++;
    order++;
  }

  // Insert source URL
  if (speciesData.url) {
    statements.push(
      `INSERT INTO sources (species_id, url, source_order) VALUES (${speciesId}, ${escapeSql(
        speciesData.url
      )}, 1);`
    );
  }

  return statements;
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'single'; // 'single' or 'all'

  // If second arg is a number, use it as species ID, otherwise treat as filename
  let speciesId = 1;
  let speciesFile = 'species-1.json';

  if (args[1]) {
    const parsed = parseInt(args[1], 10);
    if (!isNaN(parsed)) {
      // It's a number - use it as ID and construct filename
      speciesId = parsed;
      speciesFile = `species-${speciesId}.json`;
    } else {
      // It's a filename - extract ID from filename
      speciesFile = args[1];
      const match = speciesFile.match(/species-(\d+)\.json/);
      speciesId = match ? parseInt(match[1], 10) : 1;
    }
  }

  const dataDir = join(process.cwd(), '../../spider/output/species');

  // First, generate language inserts
  const languageStatements: string[] = [
    '-- Insert languages',
    ...LANGUAGES.map(
      (lang, idx) =>
        `INSERT INTO languages (id, code, name) VALUES (${idx + 1}, ${escapeSql(
          lang.code
        )}, ${escapeSql(lang.name)}) ON CONFLICT(code) DO NOTHING;`
    ),
    '',
  ];

  let sqlStatements: string[] = [...languageStatements];

  if (mode === 'single') {
    // Process single species
    const filePath = join(dataDir, speciesFile);
    console.log(`Reading: ${filePath}`);

    const speciesData = JSON.parse(readFileSync(filePath, 'utf-8')) as ScrapedSpecies;

    // Use species_id from JSON
    const dbSpeciesId = speciesData.species_id;

    sqlStatements.push(`-- Species: ${speciesData.basic_info.scientific_name}`, '');
    sqlStatements.push(...generateSqlForSpecies(speciesData, dbSpeciesId));

    const outputFile = 'scripts/populate-single.sql';
    writeFileSync(outputFile, sqlStatements.join('\n'));
    console.log(`✅ Generated SQL file: ${outputFile}`);
    console.log(
      `\nRun with: pnpm wrangler d1 execute foresty-db --local --file=${outputFile}`
    );
  } else {
    // Process all species
    const files = readdirSync(dataDir)
      .filter((f) => f.startsWith('species-') && f.endsWith('.json'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/species-(\d+)\.json/)?.[1] || '0');
        const numB = parseInt(b.match(/species-(\d+)\.json/)?.[1] || '0');
        return numA - numB;
      });

    console.log(`Found ${files.length} species files`);

    // Process all species using their species_id from JSON
    for (const file of files) {
      const filePath = join(dataDir, file);
      const speciesData = JSON.parse(readFileSync(filePath, 'utf-8')) as ScrapedSpecies;

      // Use species_id from JSON
      const dbSpeciesId = speciesData.species_id;

      sqlStatements.push(`-- Species ${dbSpeciesId}: ${speciesData.basic_info.scientific_name}`, '');
      sqlStatements.push(...generateSqlForSpecies(speciesData, dbSpeciesId));
      sqlStatements.push('');
    }

    const outputFile = 'scripts/populate-all.sql';
    writeFileSync(outputFile, sqlStatements.join('\n'));
    console.log(`✅ Generated SQL file: ${outputFile}`);
    console.log(`   Processed ${files.length} species`);
    console.log(
      `\nRun with: pnpm wrangler d1 execute foresty-db --local --file=${outputFile}`
    );
  }
}

main();
