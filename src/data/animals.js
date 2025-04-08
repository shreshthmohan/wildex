// animals.js - Data structure for forest animals

// to be added:
// Ochotona roylei / Royle's pika
// flying fox (bat)
// antlion
// ant
// dragonfly
// damselfly

export const animals = [
  {
    // Indian eagle-owl Bubo bengalensis
    // kkoshy, flickr
    id: "indian-eagle-owl",
    scientificName: "Bubo bengalensis",
    commonName: "Indian Eagle-Owl",
    category: "birds",
    image: "../images/indian-eagle-owl.webp",
    imageCredit: "kkoshy, flickr",
    imageAlt: "Indian Eagle-Owl in its natural habitat",
    conservationStatus: "Least Concern",
  },
  {
    // Indian jackal (Canis aureus indicus)
    id: "indian-jackal",
    scientificName: "Canis aureus indicus",
    commonName: "Indian Jackal",
    category: "mammals",
    image: "../images/indian-jackal.webp",
    imageCredit: "",
    imageAlt: "Indian Jackal in its natural habitat",
    conservationStatus: "Least Concern",
  },
  {
    // gaur (Bos gaurus
    id: "gaur",
    scientificName: "Bos gaurus",
    commonName: "Gaur",
    category: "mammals",
    image: "../images/gaur.webp",
    imageCredit: "",
    imageAlt: "Gaur in its natural habitat",
    conservationStatus: "Vulnerable",
  },
  {
    // small Indian civet (Viverricula indica)
    id: "small-indian-civet",
    scientificName: "Viverricula indica",
    commonName: "Small Indian Civet",
    category: "mammals",
    image: "../images/small-indian-civet.webp",
    imageCredit: "",
    imageAlt: "Small Indian Civet in its natural habitat",
    conservationStatus: "Least Concern",
  },
  {
    // Asian palm civet (Paradoxurus hermaphroditus)
    id: "asian-palm-civet",
    scientificName: "Paradoxurus hermaphroditus",
    commonName: "Asian Palm Civet",
    category: "mammals",
    image: "../images/asian-palm-civet.webp",
    imageCredit: "",
    imageAlt: "Asian Palm Civet in its natural habitat",
    conservationStatus: "Least Concern",
  },

  {
    // Indian boar (Sus scrofa cristatus)
    id: "indian-boar",
    scientificName: "Sus scrofa cristatus",
    commonName: "Indian Boar",
    category: "mammals",
    image: "../images/indian-boar.webp",
    imageCredit: "",
    imageAlt: "Indian Boar in its natural habitat",
    conservationStatus: "Least Concern",
  },
  {
    // Ziziphus mauritiana, also known as Indian jujube
    id: "indian-jujube",
    scientificName: "Ziziphus mauritiana",
    commonName: "Indian Jujube",
    category: "plants",
    image: "../images/indian-jujube.webp",
    imageCredit: "Wibowo Djatmiko",
    imageAlt: "Indian Jujube",
    conservationStatus: "Least Concern",
    otherNames: {
      hi: " बेर",
    },
  },
  {
    // Indian elephant (Elephas maximus indicus
    id: "indian-elephant",
    scientificName: "Elephas maximus indicus",
    commonName: "Indian Elephant",
    category: "mammals",
    image: "../images/indian-elephant.webp",
    imageCredit: "",
    imageAlt: "Indian Elephant in its natural habitat",
    conservationStatus: "Endangered",
  },
  {
    id: "indian-leopard",
    scientificName: "Panthera pardus fusca",
    commonName: "Indian Leopard",
    category: "mammals",
    image: "../images/indian-leopard.webp",
    imageCredit: "Srikaanth Sekar, Flickr",
    imageAlt: "Indian Leopard in its natural habitat",
    conservationStatus: "Near threatened",
  },
  {
    // Indian crested porcupine (Hystrix indica)
    id: "indian-crested-porcupine",
    scientificName: "Hystrix indica",
    commonName: "Indian Crested Porcupine",
    category: "rodents",
    image: "../images/indian-crested-porcupine.webp",
    imageCredit: "tgerus, flickr",
    imageAlt: "Indian Crested Porcupine with quills",
    conservationStatus: "Least Concern",
  },
  {
    id: "golden-shower-tree",
    scientificName: "Cassia fistula",
    commonName: "Golden Shower Tree",
    category: "plants",
    image: "/images/golden-shower-tree.webp",
    imageCredit: "",
    imageAlt: "Golden Shower Tree in full bloom with fragrant flowers",
  },
  {
    id: "sloth-bear",
    commonName: "Sloth Bear",
    scientificName: "Melursus ursinus",
    otherNames: {
      hi: ["भालू", "रीछ", "Bhālu"],
      kn: ["ಕರಡಿ", "Karaḍi"],
    },
    subspecies: [
      {
        scientificName: "Melursus ursinus ursinus",
        commonName: "Indian Sloth Bear",
      },
      {
        scientificName: "Melursus ursinus inornatus",
        commonName: "Sri Lankan Sloth Bear",
      },
    ],
    category: "bears",
    mainImage: "/images/sloth-bear.webp",
    image: "../images/sloth-bear.webp",
    imageAlt: "Sloth Bear standing on a rock surrounded by forest vegetation",
    habitatTitle: "Rocky forest terrain",
    endangeredStatus: "Vulnerable",
    activity: {
      text: "Active at night, dawn, dusk & on cloudy days",
    },

    encounterGuidance: {
      text: "If encountered: Stand still, never run",
    },
    presenceSigns: {
      text: "Look for dug termite mounds & claw marks on trees",
    },
    habitat: {
      primary: "Rocky hillocks interspersed with forests",
      range: "Throughout India except cold Himalayan regions",
      preferredAreas: [
        "Deciduous forests",
        "Grasslands with rocky outcrops",
        "Scrub forests",
      ],
      title: "Rocky forest terrain",
      colorClass: "amber",
    },
    themeColor: "amber",
    physicalDescription: {
      size: "1.5-1.8 meters in length",
      weight: "80-145 kg",
      appearance:
        "Shaggy black fur with a distinctive white V or Y-shaped marking on chest, long snout, and curved claws",
      distinctiveFeatures: [
        "Long snout for termite feeding",
        "Curved claws for digging",
        "White chest marking",
        "Shaggy black fur",
      ],
    },
    pugMarks: {
      description:
        "Five-toed prints with visible claw marks, front paws showing long curved claws",
      image: "/images/sloth-bear-pugmarks.svg",
      width: "12-15 cm wide",
      length: "15-18 cm long",
    },
    scat: {
      description:
        "Grainy texture due to termite exoskeletons, often contains fruit seeds depending on season",
      image: "/images/sloth-bear-scat.jpg",
    },
    imageAlt: "Himalayan Brown Bear in its natural mountain habitat",
    habitat: {
      title: "Higher altitude Himalayan regions",
      colorClass: "brown",
    },
    activity: {
      text: "More active during day, hibernates in winter",
    },
    encounterGuidance: {
      text: "If encountered: Keep distance, especially during mating season or when cubs present",
    },
    presenceSigns: {
      text: "Look for large paw prints and disturbed roots or berries",
    },
    themeColor: "brown",
  },
  {
    id: "asiatic-black-bear",
    commonName: "Asiatic Black Bear",
    scientificName: "Ursus thibetanus",
    category: "bears",
    region: "J&K, Northeast India",
    image: "../images/asiatic-black-bear.webp",
    imageAlt: "Asiatic Black Bear with distinctive white crescent on chest",
    habitat: {
      title: "Temperate forests to alpine meadows",
      colorClass: "slate",
    },
    activity: {
      text: "Primarily active during dawn and dusk",
    },
    encounterGuidance: {
      text: "If encountered: Don't climb trees - they are excellent climbers",
    },
    presenceSigns: {
      text: "Claw marks on trees and disturbed fruit-bearing plants",
    },
    themeColor: "slate",
  },
  {
    id: "sun-bear",
    commonName: "Sun Bear",
    scientificName: "Helarctos malayanus",
    category: "bears",
    region: "Northeast India",
    image: "../images/sun-bear.webp",
    imageAlt: "Small Sun Bear with distinctive chest marking",
    habitat: {
      title: "Tropical rainforests",
      colorClass: "yellow",
      preferredAreas: ["Tropical rainforests"],
    },
    culturalSignificance: {
      folklore:
        "Features in many tribal stories and traditions across Northeast India",
      localNames: {
        hindi: "Kattu",
        telugu: "Kattu",
        kannada: "Kattu",
        marathi: "Kattu",
      },
    },
    activity: {
      text: "Primarily diurnal, active during day",
    },
    encounterGuidance: {
      text: "If encountered: Keep distance despite small size, sharp claws for climbing",
    },
    presenceSigns: {
      text: "Broken termite mounds and honeycomb remnants",
    },
    themeColor: "yellow",
    conservationStatus: {
      status: "Vulnerable",
      threats: [
        "Habitat loss",
        "Poaching for medicinal use",
        "Human-wildlife conflict",
      ],
      population: "Declining across most of its range",
    },
    physicalDescription: {
      size: "1.5-1.8 meters in length",
      weight: "80-145 kg",
      appearance:
        "Shaggy black fur with a distinctive white V or Y-shaped marking on chest, long snout, and curved claws",
      distinctiveFeatures: [
        "Long snout for termite feeding",
        "Curved claws for digging",
        "White chest marking",
        "Shaggy black fur",
      ],
    },
    pugMarks: {
      image: "/images/sun-bear-pugmarks.svg",
      width: "12-15 cm wide",
      length: "15-18 cm long",
    },
    scat: {
      image: "/images/sun-bear-scat.jpg",
      description:
        "Small, rounded pellets, often with visible termite exoskeletons",
    },
    diet: {
      primary: ["Termites", "Ants"],
      secondary: ["Fruits", "Honey", "Flowers"],
      notes:
        "Uses long snout, protrusible lips and puffing to extract and consume insects from mounds",
    },
    behavior: {
      social: "Solitary except females with cubs",
      movement: "Fast runner, can reach speeds of 30 km/h",
      climbing: "Good climbers, often climbs trees for fruits or honey",
      sounds: "Loud grunts and huffs when threatened",
    },
    humanInteractions: {
      threats: ["Aggressive when provoked or threatened"],
      attacks: ["Can be dangerous if provoked"],
      avoidance: ["Best to avoid eye contact"],
      if_encountered: ["Stay still, do not approach"],
    },
    seasonalPatterns: {
      mating: "Late summer to early autumn",
      cubBirth: "Late winter to early spring",
      fruitForaging: "Increased during monsoon and post-monsoon seasons",
    },
    detailedDescription: "",
  },
  {
    id: "indian-hare",
    commonName: "Indian Hare",
    scientificName: "Lepus nigricollis",
    category: "small-mammals",
    region: "Throughout India",
    image: "../images/indian-hare.webp",
    imageAlt: "Indian Hare alert and attentive in grassland",
    habitat: {
      title: "Grassland and scrub forest",
      colorClass: "blue",
    },
    activity: {
      text: "Most active at twilight & during moonlit nights",
    },
    encounterGuidance: {
      text: "Observe quietly; sudden movements trigger flight",
    },
    presenceSigns: {
      text: "Creates grass tunnels & pellet-like scat clusters",
    },
    themeColor: "blue",
  },
];

// Function to get animal by ID
export function getAnimalById(id) {
  return animals.find((animal) => animal.id === id);
}

// Function to get all animals
export function getAllAnimals() {
  return animals;
}

// Function to get animals by category
export function getAnimalsByCategory(category) {
  return animals.filter((animal) => animal.category === category);
}

// Function to get animal by name
export function getAnimalByName(name) {
  return animals.find(
    (animal) => animal.commonName === name || animal.name === name
  );
}
