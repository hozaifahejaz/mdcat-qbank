/* Free sample questions shown on the landing page. Written for this site, in the same template every bank question uses:
   stem, four options, key, syllabus tag, and an explanation that says why the key is right and why each other option is wrong. */
export type Sample = {
  subject: "Biology" | "Chemistry" | "Physics";
  tag: string;
  stem: string;
  options: string[];
  answer: number;
  why: string;
  wrong: Record<number, string>;
};

export const samples: Sample[] = [
  {
    subject: "Biology",
    tag: "Homeostasis · Excretion in humans",
    stem: "Which part of the human nephron is impermeable to water?",
    options: [
      "Proximal convoluted tubule",
      "Descending limb of the loop of Henle",
      "Ascending limb of the loop of Henle",
      "Collecting duct",
    ],
    answer: 2,
    why: "The ascending limb moves Na⁺ and Cl⁻ out of the filtrate into the medulla, but water cannot follow. The filtrate becomes more dilute as it rises, and the medulla stays salty, which later lets the collecting duct concentrate urine.",
    wrong: {
      0: "The proximal convoluted tubule reabsorbs most of the filtered water, about two-thirds of it, by osmosis.",
      1: "The descending limb is permeable to water. Water leaves it into the salty medulla, so the filtrate becomes more concentrated on the way down.",
      3: "The collecting duct's permeability is set by ADH. With ADH it reabsorbs water and the urine is concentrated.",
    },
  },
  {
    subject: "Chemistry",
    tag: "Chemical bonding · Hybridisation",
    stem: "What is the hybridisation of each carbon atom in ethyne (C₂H₂)?",
    options: ["sp", "sp²", "sp³", "dsp²"],
    answer: 0,
    why: "Each carbon forms two σ bonds, one to hydrogen and one to the other carbon, using two sp orbitals 180° apart. Its two unhybridised p orbitals form two π bonds, which completes the C≡C triple bond and makes the molecule linear.",
    wrong: {
      1: "sp² is the carbon in ethene: three σ bonds at 120° and one π bond.",
      2: "sp³ is the carbon in ethane: four σ bonds at 109.5° and no π bonds.",
      3: "dsp² uses a d orbital and gives square planar complexes such as [Ni(CN)₄]²⁻. Carbon has no d orbitals in its valence shell.",
    },
  },
  {
    subject: "Physics",
    tag: "Circular motion · Centripetal acceleration",
    stem: "A ball moves in a circle of radius 2 m at a constant speed of 4 m/s. What is its centripetal acceleration?",
    options: ["4 m/s²", "8 m/s²", "2 m/s²", "32 m/s²"],
    answer: 1,
    why: "Centripetal acceleration is a = v²/r = (4 m/s)² / 2 m = 16 / 2 = 8 m/s², directed towards the centre of the circle.",
    wrong: {
      0: "4 m/s² comes from dividing v² by r² (16 / 4). The formula divides by r, not r².",
      2: "2 comes from v/r. That is the angular speed, 2 rad/s, not an acceleration.",
      3: "32 m/s² comes from multiplying v² by r instead of dividing.",
    },
  },
];
