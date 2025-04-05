// animals.js - Data structure for forest animals

export const animals = [
  {
    id: "sloth-bear",
    commonName: "Sloth Bear",
    scientificName: "Melursus ursinus",
    category: "bears",
    mainImage: "/images/sloth-bear.webp",
    image: "../images/sloth-bear.webp",
    imageAlt: "Sloth Bear standing on a rock surrounded by forest vegetation",
    iconClass: "mountain", // Icon class
    iconTitle: "Rocky forest terrain",
    region: "Central & Eastern India",
    regionClass: "bg-emerald-100 text-emerald-800",
    endangeredStatus: "Vulnerable",
    activity: {
      icon: "moon",
      text: "Active at night, dawn, dusk & on cloudy days",
    },

    encounterGuidance: {
      icon: "hand",
      text: "If encountered: Stand still, never run",
    },
    presenceSigns: {
      icon: "paw",
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
      icon: "mountain",
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
    diet: {
      primary: ["Termites", "Ants"],
      secondary: ["Fruits", "Honey", "Flowers"],
      notes:
        "Uses long snout, protrusible lips and puffing to extract and consume insects from mounds",
    },
    behavior: {
      social: "Generally solitary except mothers with cubs",
      movement:
        "Active primarily during cooler hours, capable of running up to 30 km/h",
      climbing:
        "Excellent climbers despite size, often climb trees for fruits or honey",
      sounds:
        "Loud sucking noise when feeding on termites, can make loud huffing and grunting sounds when threatened",
    },
    humanInteractions: {
      threats:
        "Highly unpredictable and potentially aggressive when surprised or with cubs",
      attacks: "Known to target the face and head during attacks",
      avoidance:
        "Make noise while walking, avoid dawn/dusk travel in known habitats",
      if_encountered:
        "Stay upright, don't run, if approached duck down and cover head with arms",
    },
    seasonalPatterns: {
      mating: "June to July",
      cubBirth: "December to January (after ~6-7 month gestation)",
      fruitForaging:
        "Increases during monsoon and post-monsoon seasons when fruits are abundant",
    },
    conservationStatus: {
      status: "Vulnerable",
      threats: [
        "Habitat loss",
        "Poaching for medicinal use",
        "Human-wildlife conflict",
      ],
      population: "Declining across most of its range",
    },
    culturalSignificance: {
      folklore:
        "Features in many tribal stories and traditions across Central India",
      localNames: {
        hindi: "Bhalu",
        telugu: "Elugu Banti",
        kannada: "Karadi",
        marathi: "Aswal",
      },
    },
    detailedDescription:
      "If you spot a hairy black creature, roughly the size of human almost anywhere in South India, it's most likely a sloth bear. Don't go by its name - sloth bears aren't slow or docile like sloths. They're very fast and the most aggressive among any bears found in India. Sloth bears have attacked several humans over the years in India and few have survived to tell the horrific tale of the attack.\n\nSloth bears have poor eyesight, but an exceptional sense of smell. Hearing is moderately developed. They will likely smell you before they see you. Bears usually forage for food in the dark, so during dusk, night and dawn they're likely to be moving around.\n\nWhat to do if you see a sloth bear? Stay where you are. Stand upright. Don't run! You can't outrun a bear. If you run it will follow and mostly attack you. If it approaches very close, duck down and cover your head with your folded arms. You increase chances of survival because bears usually attack the head first.",
  },

  {
    id: "himalayan-brown-bear",
    commonName: "Himalayan Brown Bear",
    scientificName: "Ursus arctos isabellinus",
    category: "bears",
    region: "Himalayas",
    image: "../images/himalayan-brown-bear.jpg",
    imageAlt: "Himalayan Brown Bear in its natural mountain habitat",
    habitat: {
      icon: "mountain",
      title: "Higher altitude Himalayan regions",
      colorClass: "brown",
    },
    activity: {
      icon: "moon",
      text: "More active during day, hibernates in winter",
    },
    encounterGuidance: {
      icon: "hand",
      text: "If encountered: Keep distance, especially during mating season or when cubs present",
    },
    presenceSigns: {
      icon: "paw",
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
    image: "../images/asiatic-black-bear.jpg",
    imageAlt: "Asiatic Black Bear with distinctive white crescent on chest",
    habitat: {
      icon: "tree",
      title: "Temperate forests to alpine meadows",
      colorClass: "slate",
    },
    activity: {
      icon: "moon",
      text: "Primarily active during dawn and dusk",
    },
    encounterGuidance: {
      icon: "hand",
      text: "If encountered: Don't climb trees - they are excellent climbers",
    },
    presenceSigns: {
      icon: "paw",
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
      icon: "tree",
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
      icon: "moon",
      text: "Primarily diurnal, active during day",
    },
    encounterGuidance: {
      icon: "hand",
      text: "If encountered: Keep distance despite small size, sharp claws for climbing",
    },
    presenceSigns: {
      icon: "paw",
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
    image: "../images/indian-hare.jpg",
    imageAlt: "Indian Hare alert and attentive in grassland",
    habitat: {
      icon: "seedling",
      title: "Grassland and scrub forest",
      colorClass: "blue",
    },
    activity: {
      icon: "moon",
      text: "Most active at twilight & during moonlit nights",
    },
    encounterGuidance: {
      icon: "eye",
      text: "Observe quietly; sudden movements trigger flight",
    },
    presenceSigns: {
      icon: "paw",
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
