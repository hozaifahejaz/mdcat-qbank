-- NUST NET Intelligence: 132 original verbal reasoning MCQs, IQ-0001 to IQ-0132.
-- Written for Markhor Prep, not copied from any book or other bank. Keys that can be worked out (letter codes,
-- calendars, directions, orderings, clock angles) were recomputed by a script before this file was made.
--
-- They fill the thin verbal chapters of NET's Intelligence part (lib/banks.ts): analogies, odd one out, word skills,
-- coding and decoding, relations and directions, ordering and ranking, calendars and clocks. Each is a Logical
-- Reasoning question under the nearest MDCAT chapter, with questions.mdcat = 0 so it stays out of the MDCAT bank and
-- mocks, and is listed in the NET bank under its Intelligence chapter. Not in the free set. INSERT OR IGNORE keeps the
-- file safe to run twice; without the site owner's account (a fresh local database) nothing is inserted.

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, mdcat, checks, writer_id, created_at, updated_at)
SELECT s.column1, 'Logical Reasoning', s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10,
  'live', 0, 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('IQ-0001', 'Patterns and sequences', 'Word analogy', 'easy', 'Markhor Prep original question', 'Painter is to brush as sculptor is to:', '["chisel", "canvas", "statue", "museum"]', 0, 'A painter works with a brush; a sculptor works with a chisel. The link is worker : main tool.', '{"1": "Canvas is a painter''s surface, not a sculptor''s tool.", "2": "A statue is what the sculptor makes, not the tool.", "3": "A museum is where the work may be shown."}'),
  ('IQ-0002', 'Patterns and sequences', 'Word analogy', 'easy', 'Markhor Prep original question', 'Library is to books as gallery is to:', '["visitors", "paintings", "frames", "artists"]', 1, 'A library keeps books; a gallery keeps and shows paintings. The link is place : what it holds.', '{"0": "Visitors come to it but are not what it holds.", "2": "Frames are parts of the exhibits.", "3": "Artists make the works; the gallery holds the works."}'),
  ('IQ-0003', 'Patterns and sequences', 'Word analogy', 'easy', 'Markhor Prep original question', 'Hungry is to food as thirsty is to:', '["drink", "dry", "water", "desert"]', 2, 'Hunger is relieved by food; thirst is relieved by water. ''Drink'' is the action, not the thing, so ''water'' keeps the pattern noun to noun.', '{"0": "Drink is a verb for the action; food is a noun for the thing.", "1": "Dry describes a state, not what relieves thirst.", "3": "A desert is a dry place."}'),
  ('IQ-0004', 'Patterns and sequences', 'Word analogy', 'moderate', 'Markhor Prep original question', 'Speedometer is to speed as ammeter is to:', '["voltage", "resistance", "power", "electric current"]', 3, 'Each instrument measures one quantity: a speedometer measures speed and an ammeter measures current.', '{"0": "Voltage is measured with a voltmeter.", "1": "Resistance is measured with an ohmmeter.", "2": "Power is measured with a wattmeter."}'),
  ('IQ-0005', 'Patterns and sequences', 'Word analogy', 'moderate', 'Markhor Prep original question', 'Seismograph is to earthquake as anemometer is to:', '["rainfall", "air pressure", "wind speed", "humidity"]', 2, 'Instrument : what it records. An anemometer measures wind speed.', '{"0": "Rainfall is measured with a rain gauge.", "1": "Air pressure is measured with a barometer.", "3": "Humidity is measured with a hygrometer."}'),
  ('IQ-0006', 'Patterns and sequences', 'Word analogy', 'moderate', 'Markhor Prep original question', 'Bridge is to river as tunnel is to:', '["mountain", "road", "train", "darkness"]', 0, 'A bridge takes a route over a river; a tunnel takes a route through a mountain. Both are ways past an obstacle.', '{"1": "A road runs through a tunnel; it is not the obstacle.", "2": "A train uses the tunnel.", "3": "Darkness is a feature of a tunnel, not what it gets past."}'),
  ('IQ-0007', 'Patterns and sequences', 'Word analogy', 'moderate', 'Markhor Prep original question', 'Generous is to stingy as humble is to:', '["modest", "poor", "kind", "arrogant"]', 3, 'The pairs are opposites: generous/stingy and humble/arrogant.', '{"0": "Modest means the same as humble.", "1": "Poor is about money, not pride.", "2": "Kind is close to generous, not the opposite of humble."}'),
  ('IQ-0008', 'Patterns and sequences', 'Word analogy', 'moderate', 'Markhor Prep original question', 'Prologue is to play as preface is to:', '["chapter", "book", "author", "epilogue"]', 1, 'A prologue comes at the start of a play; a preface comes at the start of a book.', '{"0": "A chapter is a part of a book, but a preface introduces the whole book.", "2": "The author writes the preface.", "3": "An epilogue comes at the end."}'),
  ('IQ-0009', 'Patterns and sequences', 'Word analogy', 'hard', 'Markhor Prep original question', 'Find the pair related in the same way as FLOCK : SHEEP.', '["Kennel : dogs", "Herd : grass", "Swarm : bees", "Nest : eggs"]', 2, 'A flock is a group of sheep; a swarm is a group of bees.', '{"0": "A kennel is a dog''s shelter, not a group of dogs.", "1": "A herd is a group of animals, which eat grass.", "3": "A nest holds eggs; it is not a group of them."}'),
  ('IQ-0010', 'Patterns and sequences', 'Word analogy', 'hard', 'Markhor Prep original question', 'Find the pair related in the same way as MASON : WALL.', '["Tailor : suit", "Doctor : hospital", "Teacher : student", "Farmer : tractor"]', 0, 'A mason builds a wall; a tailor makes a suit. Worker : what the worker makes.', '{"1": "A doctor works in a hospital but does not make it.", "2": "A teacher teaches students but does not make them.", "3": "A tractor is a farmer''s machine, not the product."}'),
  ('IQ-0011', 'Patterns and sequences', 'Word analogy', 'hard', 'Markhor Prep original question', 'Find the pair related in the same way as DROUGHT : FAMINE.', '["Rain : cloud", "Wind : sail", "Fire : smoke detector", "Flood : erosion"]', 3, 'A drought can cause a famine; a flood can cause erosion. Cause : effect.', '{"0": "The cloud produces the rain, so the order is effect : cause.", "1": "Wind pushes a sail, but a sail is not a consequence of wind.", "2": "A smoke detector senses fire; it is not caused by it."}'),
  ('IQ-0012', 'Patterns and sequences', 'Word analogy', 'hard', 'Markhor Prep original question', 'Find the pair related in the same way as ANTIDOTE : POISON.', '["Doctor : patient", "Vaccine : infection", "Medicine : pharmacy", "Pain : injury"]', 1, 'An antidote counters a poison; a vaccine protects against an infection. Something that works against a harm.', '{"0": "A doctor treats a patient; the patient is not a harm.", "2": "A pharmacy sells medicine.", "3": "Pain results from injury; it does not counter it."}'),
  ('IQ-0013', 'Patterns and sequences', 'Letter analogy', 'easy', 'Markhor Prep original question', 'AB : DE :: MN : ?', '["OP", "NO", "PQ", "QR"]', 2, 'Each letter moves 3 places: A→D, B→E, so M→P and N→Q.', '{"0": "That moves 2 places.", "1": "That moves 1 place.", "3": "That moves 4 places."}'),
  ('IQ-0014', 'Patterns and sequences', 'Letter analogy', 'moderate', 'Markhor Prep original question', 'BDF : CEG :: PRT : ?', '["QRS", "RTV", "OQS", "QSU"]', 3, 'Each letter of BDF moves forward 1 to give CEG. PRT moves forward 1 to give QSU.', '{"0": "That keeps only the first letter''s shift.", "1": "That moves each letter 2 places.", "2": "That moves each letter back 1."}'),
  ('IQ-0015', 'Patterns and sequences', 'Letter analogy', 'moderate', 'Markhor Prep original question', 'ACE : ZXV :: BDF : ?', '["YXW", "YWU", "XVT", "ZYX"]', 1, 'Each letter is replaced by its mirror letter (A↔Z, C↔X, E↔V). Mirror of B, D, F is Y, W, U.', '{"0": "Only the first letter is mirrored correctly.", "2": "That mirrors A, C, E plus 1.", "3": "That is the mirror of A, B, C."}'),
  ('IQ-0016', 'Patterns and sequences', 'Letter analogy', 'hard', 'Markhor Prep original question', 'CAT : DCW :: DOG : ?', '["EQJ", "EPH", "FQJ", "EQI"]', 0, 'The letters move forward by 1, 2 and 3: C+1 = D, A+2 = C, T+3 = W. So D+1 = E, O+2 = Q, G+3 = J.', '{"1": "That moves every letter by 1.", "2": "The first letter moves only 1.", "3": "The last letter moves 3, not 2."}'),
  ('IQ-0017', 'Patterns and sequences', 'Number analogy', 'easy', 'Markhor Prep original question', '4 : 16 :: 7 : ?', '["28", "49", "14", "56"]', 1, '16 is 4 squared, so the answer is 7 squared.', '{"0": "That is 4 × 7, using the multiplier 4.", "2": "That doubles 7.", "3": "That is 7 × 8."}'),
  ('IQ-0018', 'Patterns and sequences', 'Number analogy', 'moderate', 'Markhor Prep original question', '3 : 28 :: 4 : ?', '["65", "64", "63", "17"]', 0, '28 = 3³ + 1, so the answer is 4³ + 1 = 65.', '{"1": "That is 4³ without the +1.", "2": "That is 4³ − 1.", "3": "That is 4² + 1."}'),
  ('IQ-0019', 'Patterns and sequences', 'Number analogy', 'moderate', 'Markhor Prep original question', '6 : 35 :: 9 : ?', '["81", "82", "72", "80"]', 3, '35 = 6² − 1, so the answer is 9² − 1 = 80.', '{"0": "That is 9², without the −1.", "1": "That is 9² + 1.", "2": "That is 9 × 8."}'),
  ('IQ-0020', 'Patterns and sequences', 'Number analogy', 'hard', 'Markhor Prep original question', '12 : 3 :: 63 : ?', '["21", "7", "9", "6"]', 2, 'The second number is the sum of the digits of the first: 1 + 2 = 3, 6 + 3 = 9.', '{"0": "That is 63 ÷ 3; but 12 ÷ 3 = 4, not 3.", "1": "That is 63 ÷ 9.", "3": "That is 6 alone, the first digit."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, mdcat, checks, writer_id, created_at, updated_at)
SELECT s.column1, 'Logical Reasoning', s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10,
  'live', 0, 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('IQ-0021', 'Patterns and sequences', 'Number analogy', 'hard', 'Markhor Prep original question', 'Find the pair that follows the same rule as 5 : 26 and 7 : 50.', '["8 : 63", "6 : 35", "10 : 100", "9 : 82"]', 3, 'Each second number is the first number squared plus 1: 5² + 1 = 26, 7² + 1 = 50, 9² + 1 = 82.', '{"0": "8² + 1 = 65.", "1": "6² + 1 = 37.", "2": "10² + 1 = 101."}'),
  ('IQ-0022', 'Patterns and sequences', 'Word analogy', 'moderate', 'Markhor Prep original question', 'Oasis is to desert as island is to:', '["sand", "palm", "sea", "beach"]', 2, 'An oasis is a fertile spot surrounded by desert; an island is land surrounded by sea.', '{"0": "Sand is found in deserts and on islands but does not surround an island.", "1": "A palm grows at an oasis.", "3": "A beach is the island''s edge."}'),
  ('IQ-0023', 'Patterns and sequences', 'Word analogy', 'moderate', 'Markhor Prep original question', 'Pilot is to aircraft as captain is to:', '["crew", "ship", "harbour", "voyage"]', 1, 'Each person is in charge of the vessel: a pilot flies an aircraft, a captain commands a ship.', '{"0": "The crew are people the captain leads, not the vessel.", "2": "A harbour is where a ship docks.", "3": "A voyage is the journey."}'),
  ('IQ-0024', 'Patterns and sequences', 'Word analogy', 'hard', 'Markhor Prep original question', 'Verbose is to concise as transparent is to:', '["opaque", "clear", "glassy", "honest"]', 0, 'Opposites: verbose (wordy) and concise; transparent and opaque.', '{"1": "Clear means the same as transparent.", "2": "Glassy suggests transparent, not its opposite.", "3": "Honest is a figurative meaning of transparent, a synonym."}'),
  ('IQ-0025', 'Patterns and sequences', 'Word analogy', 'easy', 'Markhor Prep original question', 'Glove is to hand as sock is to:', '["shoe", "leg", "foot", "wool"]', 2, 'Each item is worn on a body part.', '{"0": "A shoe goes over the sock; it is not a body part.", "1": "A sock is worn on the foot, not the leg.", "3": "Wool is what a sock may be made of."}'),
  ('IQ-0026', 'Patterns and sequences', 'Odd word', 'easy', 'Markhor Prep original question', 'Which word is the odd one out?
Mercury, Venus, Moon, Mars', '["Mercury", "Venus", "Mars", "Moon"]', 3, 'Mercury, Venus and Mars are planets; the Moon is Earth''s natural satellite.', '{"0": "Mercury is a planet.", "1": "Venus is a planet.", "2": "Mars is a planet."}'),
  ('IQ-0027', 'Patterns and sequences', 'Odd word', 'easy', 'Markhor Prep original question', 'Which word is the odd one out?
Kilogram, Metre, Litre, Thermometer', '["Kilogram", "Thermometer", "Metre", "Litre"]', 1, 'Kilogram, metre and litre are units; a thermometer is an instrument.', '{"0": "A kilogram is a unit of mass.", "2": "A metre is a unit of length.", "3": "A litre is a unit of volume."}'),
  ('IQ-0028', 'Patterns and sequences', 'Odd word', 'moderate', 'Markhor Prep original question', 'Which word is the odd one out?
Iron, Copper, Brass, Zinc', '["Brass", "Iron", "Copper", "Zinc"]', 0, 'Iron, copper and zinc are elements; brass is an alloy (of copper and zinc).', '{"1": "Iron is an element.", "2": "Copper is an element.", "3": "Zinc is an element."}'),
  ('IQ-0029', 'Patterns and sequences', 'Odd word', 'moderate', 'Markhor Prep original question', 'Which word is the odd one out?
Violin, Guitar, Sitar, Flute', '["Violin", "Flute", "Guitar", "Sitar"]', 1, 'Violin, guitar and sitar are string instruments; the flute is a wind instrument.', '{"0": "A violin has strings.", "2": "A guitar has strings.", "3": "A sitar has strings."}'),
  ('IQ-0030', 'Patterns and sequences', 'Odd word', 'moderate', 'Markhor Prep original question', 'Which word is the odd one out?
Whale, Shark, Dolphin, Seal', '["Shark", "Whale", "Dolphin", "Seal"]', 0, 'Whales, dolphins and seals are mammals; a shark is a fish.', '{"1": "A whale is a mammal.", "2": "A dolphin is a mammal.", "3": "A seal is a mammal."}'),
  ('IQ-0031', 'Patterns and sequences', 'Odd word', 'moderate', 'Markhor Prep original question', 'Which word is the odd one out?
Karachi, Lahore, Peshawar, Islamabad', '["Karachi", "Lahore", "Peshawar", "Islamabad"]', 3, 'Karachi, Lahore and Peshawar are provincial capitals; Islamabad is the federal capital.', '{"0": "Karachi is the capital of Sindh.", "1": "Lahore is the capital of Punjab.", "2": "Peshawar is the capital of Khyber Pakhtunkhwa."}'),
  ('IQ-0032', 'Patterns and sequences', 'Odd word', 'hard', 'Markhor Prep original question', 'Which word is the odd one out?
Square, Rhombus, Rectangle, Triangle', '["Square", "Rhombus", "Triangle", "Rectangle"]', 2, 'Square, rhombus and rectangle are quadrilaterals (four sides); a triangle has three.', '{"0": "A square has four sides.", "1": "A rhombus has four sides.", "3": "A rectangle has four sides."}'),
  ('IQ-0033', 'Patterns and sequences', 'Odd word', 'hard', 'Markhor Prep original question', 'Which word is the odd one out?
Neutron, Proton, Electron, Photon', '["Neutron", "Photon", "Proton", "Electron"]', 1, 'Neutrons, protons and electrons are the particles that make up atoms; a photon is a particle of light.', '{"0": "Neutrons are in the nucleus.", "2": "Protons are in the nucleus.", "3": "Electrons surround the nucleus."}'),
  ('IQ-0034', 'Patterns and sequences', 'Odd word', 'hard', 'Markhor Prep original question', 'Which word is the odd one out?
Anxious, Nervous, Uneasy, Serene', '["Anxious", "Nervous", "Uneasy", "Serene"]', 3, 'Anxious, nervous and uneasy describe worry; serene means calm.', '{"0": "Anxious means worried.", "1": "Nervous means worried.", "2": "Uneasy means worried."}'),
  ('IQ-0035', 'Patterns and sequences', 'Odd word', 'hard', 'Markhor Prep original question', 'Which word is the odd one out?
Radius, Diameter, Chord, Volume', '["Volume", "Radius", "Diameter", "Chord"]', 0, 'Radius, diameter and chord are line segments of a circle; volume measures space.', '{"1": "A radius is a segment of a circle.", "2": "A diameter is a chord through the centre.", "3": "A chord joins two points of a circle."}'),
  ('IQ-0036', 'Patterns and sequences', 'Odd number', 'easy', 'Markhor Prep original question', 'Which number is the odd one out?
11, 13, 17, 21', '["11", "13", "21", "17"]', 2, '11, 13 and 17 are prime; 21 = 3 × 7.', '{"0": "11 is prime.", "1": "13 is prime.", "3": "17 is prime."}'),
  ('IQ-0037', 'Patterns and sequences', 'Odd number', 'easy', 'Markhor Prep original question', 'Which number is the odd one out?
8, 27, 64, 100', '["8", "27", "64", "100"]', 3, '8, 27 and 64 are cubes (2³, 3³, 4³); 100 is not a cube.', '{"0": "8 = 2³.", "1": "27 = 3³.", "2": "64 = 4³."}'),
  ('IQ-0038', 'Patterns and sequences', 'Odd number', 'moderate', 'Markhor Prep original question', 'Which number is the odd one out?
24, 36, 54, 60', '["24", "54", "36", "60"]', 1, '24, 36 and 60 are multiples of 12; 54 is not (54 ÷ 12 = 4.5).', '{"0": "24 = 12 × 2.", "2": "36 = 12 × 3.", "3": "60 = 12 × 5."}'),
  ('IQ-0039', 'Patterns and sequences', 'Odd number', 'moderate', 'Markhor Prep original question', 'Which number is the odd one out?
145, 257, 369, 482', '["482", "145", "257", "369"]', 0, 'In 145, 257 and 369 the last digit is the sum of the first two (1 + 4 = 5, 2 + 5 = 7, 3 + 6 = 9). In 482, 4 + 8 = 12, not 2.', '{"1": "1 + 4 = 5.", "2": "2 + 5 = 7.", "3": "3 + 6 = 9."}'),
  ('IQ-0040', 'Patterns and sequences', 'Odd number', 'moderate', 'Markhor Prep original question', 'Which number is the odd one out?
3, 5, 9, 17, 31, 65', '["5", "9", "31", "17"]', 2, 'Each term is double the previous minus 1: 3, 5, 9, 17, 33, 65. So 31 should be 33.', '{"0": "5 = 2 × 3 − 1.", "1": "9 = 2 × 5 − 1.", "3": "17 = 2 × 9 − 1."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, mdcat, checks, writer_id, created_at, updated_at)
SELECT s.column1, 'Logical Reasoning', s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10,
  'live', 0, 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('IQ-0041', 'Patterns and sequences', 'Odd number', 'hard', 'Markhor Prep original question', 'Which number is the odd one out?
2, 6, 12, 20, 31, 42', '["12", "31", "20", "42"]', 1, 'The terms are n(n + 1): 2, 6, 12, 20, 30, 42. So 31 should be 30.', '{"0": "12 = 3 × 4.", "2": "20 = 4 × 5.", "3": "42 = 6 × 7."}'),
  ('IQ-0042', 'Patterns and sequences', 'Odd number', 'hard', 'Markhor Prep original question', 'Which pair is the odd one out?
(3, 9), (4, 16), (5, 25), (6, 32)', '["(3, 9)", "(4, 16)", "(5, 25)", "(6, 32)"]', 3, 'In the others the second number is the square of the first; 6² = 36, not 32.', '{"0": "3² = 9.", "1": "4² = 16.", "2": "5² = 25."}'),
  ('IQ-0043', 'Patterns and sequences', 'Odd letters', 'easy', 'Markhor Prep original question', 'Which letter group is the odd one out?
AEI, OUA, EIO, BCD', '["BCD", "AEI", "OUA", "EIO"]', 0, 'AEI, OUA and EIO are made of vowels only; BCD is made of consonants.', '{"1": "A, E and I are all vowels.", "2": "O, U and A are all vowels.", "3": "E, I and O are all vowels."}'),
  ('IQ-0044', 'Patterns and sequences', 'Odd letters', 'moderate', 'Markhor Prep original question', 'Which letter group is the odd one out?
CFI, JMP, QTW, KNR', '["CFI", "JMP", "KNR", "QTW"]', 2, 'In the others each letter moves 3 places: C→F→I, J→M→P, Q→T→W. In KNR, N→R moves 4.', '{"0": "C, F, I step by 3.", "1": "J, M, P step by 3.", "3": "Q, T, W step by 3."}'),
  ('IQ-0045', 'Patterns and sequences', 'Odd letters', 'hard', 'Markhor Prep original question', 'Which letter group is the odd one out?
AZ, BY, CX, DV', '["AZ", "BY", "DV", "CX"]', 2, 'AZ, BY and CX are mirror pairs (positions add to 27). D''s mirror is W, not V.', '{"0": "1 + 26 = 27.", "1": "2 + 25 = 27.", "3": "3 + 24 = 27."}'),
  ('IQ-0046', 'Patterns and sequences', 'Odd word', 'moderate', 'Markhor Prep original question', 'Which word is the odd one out?
Stethoscope, Scalpel, Forceps, Telescope', '["Stethoscope", "Scalpel", "Forceps", "Telescope"]', 3, 'Stethoscope, scalpel and forceps are medical instruments; a telescope is for viewing distant objects.', '{"0": "A doctor uses a stethoscope.", "1": "A surgeon uses a scalpel.", "2": "Forceps are used in surgery."}'),
  ('IQ-0047', 'Patterns and sequences', 'Odd word', 'hard', 'Markhor Prep original question', 'Which word is the odd one out?
Indus, Jhelum, Chenab, Karakoram', '["Indus", "Karakoram", "Jhelum", "Chenab"]', 1, 'The Indus, Jhelum and Chenab are rivers; the Karakoram is a mountain range.', '{"0": "The Indus is a river.", "2": "The Jhelum is a river.", "3": "The Chenab is a river."}'),
  ('IQ-0048', 'Patterns and sequences', 'Dictionary order', 'easy', 'Markhor Prep original question', 'Which word comes first in dictionary order?
Compute, Compare, Compass, Complete', '["Compare", "Compass", "Complete", "Compute"]', 0, 'All begin with ''Comp''. The next letters are a, a, l, u; between Compare and Compass, ''r'' comes before ''s''.', '{"1": "Compass comes after Compare: ''r'' before ''s''.", "2": "''l'' comes after ''a''.", "3": "''u'' comes after ''a'' and ''l''."}'),
  ('IQ-0049', 'Patterns and sequences', 'Dictionary order', 'moderate', 'Markhor Prep original question', 'Arranged in dictionary order, which word comes third?
Stream, Strange, Straight, Strategy', '["Strange", "Strategy", "Straight", "Stream"]', 1, 'Order: Straight, Strange, Strategy, Stream (''i'' < ''n'' < ''t'' after ''Stra'', and ''e'' after ''a'').', '{"0": "Strange is second.", "2": "Straight is first.", "3": "Stream is last."}'),
  ('IQ-0050', 'Patterns and sequences', 'Dictionary order', 'moderate', 'Markhor Prep original question', 'Arranged in dictionary order, which word comes last?
Nation, Natural, Native, Nature', '["Natural", "Native", "Nation", "Nature"]', 3, 'Order: Nation, Native, Natural, Nature. ''Natur'' words come after ''Nati'' words, and ''e'' comes after ''a''.', '{"0": "Natural comes before Nature: ''a'' before ''e''.", "1": "Native is second.", "2": "Nation is first."}'),
  ('IQ-0051', 'Patterns and sequences', 'Dictionary order', 'hard', 'Markhor Prep original question', 'Arranged in dictionary order, which word comes second?
Protein, Protest, Protect, Proton', '["Protein", "Protect", "Protest", "Proton"]', 0, 'Order: Protect, Protein, Protest, Proton. After ''Prot'', the letters are e-c, e-i, e-s and o.', '{"1": "Protect is first.", "2": "Protest is third.", "3": "Proton is last."}'),
  ('IQ-0052', 'Patterns and sequences', 'Jumbled words', 'easy', 'Markhor Prep original question', 'Rearrange the letters of TRAHE to make a word. It names a:', '["fruit", "bird", "planet", "colour"]', 2, 'TRAHE rearranges to EARTH, a planet.', '{"0": "No fruit uses exactly these letters.", "1": "No bird uses exactly these letters.", "3": "No colour uses exactly these letters."}'),
  ('IQ-0053', 'Patterns and sequences', 'Jumbled words', 'moderate', 'Markhor Prep original question', 'Rearrange the letters of GENOXY to make a word. It names a:', '["metal", "gas", "planet", "river"]', 1, 'GENOXY rearranges to OXYGEN, a gas.', '{"0": "Oxygen is not a metal.", "2": "Not a planet.", "3": "Not a river."}'),
  ('IQ-0054', 'Patterns and sequences', 'Jumbled words', 'moderate', 'Markhor Prep original question', 'Which of these, when the letters are rearranged, does NOT make the name of an animal?
LAMEC, RIGET, NOLI, HATEC', '["HATEC", "LAMEC", "RIGET", "NOLI"]', 0, 'LAMEC → CAMEL, RIGET → TIGER, NOLI → LION. HATEC makes CHEAT (or TEACH), not an animal; CHEETAH needs seven letters.', '{"1": "LAMEC makes CAMEL.", "2": "RIGET makes TIGER.", "3": "NOLI makes LION."}'),
  ('IQ-0055', 'Patterns and sequences', 'Jumbled words', 'hard', 'Markhor Prep original question', 'Rearrange the letters of TIUCRIC to make a word. It belongs to:', '["botany", "geography", "music", "electricity"]', 3, 'TIUCRIC rearranges to CIRCUIT, a path for electric current.', '{"0": "No plant word uses exactly these letters.", "1": "No landform word uses exactly these letters.", "2": "No music word uses exactly these letters."}'),
  ('IQ-0056', 'Patterns and sequences', 'Word meanings', 'easy', 'Markhor Prep original question', 'Choose the word closest in meaning to RAPID.', '["steady", "steep", "swift", "rare"]', 2, 'Rapid means fast; swift means fast too.', '{"0": "Steady means even and regular, not fast.", "1": "Steep describes a slope.", "3": "Rare means uncommon."}'),
  ('IQ-0057', 'Patterns and sequences', 'Word meanings', 'moderate', 'Markhor Prep original question', 'Choose the word closest in meaning to CANDID.', '["sweet", "secret", "frank", "careful"]', 2, 'Candid means open and honest in speech.', '{"0": "That confuses candid with candy.", "1": "Secret is close to the opposite.", "3": "Careful is unrelated."}'),
  ('IQ-0058', 'Patterns and sequences', 'Word meanings', 'moderate', 'Markhor Prep original question', 'Choose the word most nearly opposite in meaning to TRANSPARENT.', '["opaque", "clear", "fragile", "shiny"]', 0, 'Transparent lets light through; opaque does not.', '{"1": "Clear means the same.", "2": "Fragile means easily broken.", "3": "Shiny describes the surface, not the light passing through."}'),
  ('IQ-0059', 'Patterns and sequences', 'Word meanings', 'moderate', 'Markhor Prep original question', 'Choose the word closest in meaning to DILIGENT.', '["clever", "lazy", "lucky", "hardworking"]', 3, 'A diligent person works with steady care and effort.', '{"0": "Clever is about ability, not effort.", "1": "Lazy is the opposite.", "2": "Lucky is unrelated."}'),
  ('IQ-0060', 'Patterns and sequences', 'Word meanings', 'hard', 'Markhor Prep original question', 'Choose the word most nearly opposite in meaning to BENEVOLENT.', '["generous", "malicious", "humble", "anxious"]', 1, 'Benevolent means wishing others well; malicious means wishing harm.', '{"0": "Generous is close in meaning.", "2": "Humble is about pride.", "3": "Anxious is about worry."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, mdcat, checks, writer_id, created_at, updated_at)
SELECT s.column1, 'Logical Reasoning', s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10,
  'live', 0, 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('IQ-0061', 'Patterns and sequences', 'Word meanings', 'hard', 'Markhor Prep original question', 'Choose the word closest in meaning to EPHEMERAL.', '["eternal", "short-lived", "invisible", "beautiful"]', 1, 'Ephemeral means lasting a very short time.', '{"0": "Eternal is the opposite.", "2": "Something short-lived may still be seen.", "3": "Beauty is not part of the meaning."}'),
  ('IQ-0062', 'Patterns and sequences', 'Making words', 'moderate', 'Markhor Prep original question', 'Which word can be made from the letters of ENGINEERING?', '["GRAIN", "RINGS", "REIGNS", "GREEN"]', 3, 'ENGINEERING has E×3, N×3, G×2, I×2, R×1. GREEN needs G, R, E, E, N: all available.', '{"0": "There is no A.", "1": "There is no S.", "2": "There is no S."}'),
  ('IQ-0063', 'Patterns and sequences', 'Making words', 'hard', 'Markhor Prep original question', 'Which word CANNOT be made from the letters of MATHEMATICS?', '["SATCHEL", "STEAM", "THEMATIC", "CHASM"]', 0, 'MATHEMATICS has M, A, T (twice each), H, E, I, C and S. SATCHEL needs an L, which is not there.', '{"1": "S, T, E, A, M are all available.", "2": "T twice, H, E, M, A, I, C are all available.", "3": "C, H, A, S, M are all available."}'),
  ('IQ-0064', 'Patterns and sequences', 'Making words', 'moderate', 'Markhor Prep original question', 'Which word can be made using only letters from ISLAMABAD?', '["BLADES", "MISLAID", "SALAD", "BALLAD"]', 2, 'ISLAMABAD has I, S, L, M, B, D and three As. SALAD needs S, two As, L and D: all available.', '{"0": "There is no E.", "1": "There is only one I.", "3": "There is only one L."}'),
  ('IQ-0065', 'Patterns and sequences', 'Hidden words', 'moderate', 'Markhor Prep original question', 'Which word is hidden in the sentence: ''The doctor came late to the clinic''?', '["rate", "clinch", "camel", "doctorate"]', 2, 'Across ''came late'', the letters c-a-m-e-l spell CAMEL.', '{"0": "''rate'' does not appear in order.", "1": "''clinch'' needs an h after ''clin''.", "3": "''doctor'' is followed by '' came''."}'),
  ('IQ-0066', 'Patterns and sequences', 'Word series', 'moderate', 'Markhor Prep original question', 'Which word fits: FAST is to FASTER as GOOD is to ?', '["better", "gooder", "best", "well"]', 0, 'FASTER is the comparative of FAST; BETTER is the comparative of GOOD.', '{"1": "''Gooder'' is not standard English.", "2": "Best is the superlative.", "3": "Well is an adverb."}'),
  ('IQ-0067', 'Patterns and sequences', 'Word meanings', 'easy', 'Markhor Prep original question', 'Choose the word closest in meaning to ANCIENT.', '["very large", "very new", "very strange", "very old"]', 3, 'Ancient means belonging to the distant past.', '{"0": "That is huge or vast.", "1": "That is the opposite.", "2": "That is odd or bizarre."}'),
  ('IQ-0068', 'Patterns and sequences', 'Word meanings', 'hard', 'Markhor Prep original question', 'Choose the word most nearly opposite in meaning to SCARCITY.', '["shortage", "abundance", "poverty", "rarity"]', 1, 'Scarcity is a shortage; abundance is a plentiful supply.', '{"0": "Shortage means the same.", "2": "Poverty is close in meaning.", "3": "Rarity is close in meaning."}'),
  ('IQ-0069', 'Patterns and sequences', 'Letter shift', 'easy', 'Markhor Prep original question', 'In a code, LAMP is written as NCOR. How is GIFT written in that code?', '["HJGU", "IKGV", "IKHV", "JLIW"]', 2, 'Each letter moves 2 places forward: L→N, A→C, M→O, P→R. So G→I, I→K, F→H, T→V.', '{"0": "That moves each letter 1 place.", "1": "F moves to H, not G.", "3": "That moves each letter 3 places."}'),
  ('IQ-0070', 'Patterns and sequences', 'Letter shift', 'easy', 'Markhor Prep original question', 'In a code, NORTH is written as MNQSG. How is EAST written in that code?', '["DZRS", "FBTU", "DZSR", "CZRS"]', 0, 'Each letter moves 1 place back: N→M, O→N, R→Q, T→S, H→G. So E→D, A→Z (wrapping round), S→R, T→S.', '{"1": "That moves forward instead of back.", "2": "The last two letters are swapped.", "3": "E moves 1 place back to D, not 2 to C."}'),
  ('IQ-0071', 'Patterns and sequences', 'Mirror code', 'moderate', 'Markhor Prep original question', 'In a code, each letter is replaced by the letter in the same position counting from the other end of the alphabet (A↔Z, B↔Y, …). How is GOLD written?', '["TLWO", "UMPX", "SLOW", "TLOW"]', 3, 'G is 7th from the start, so it becomes T, 7th from the end. O→L, L→O, D→W.', '{"0": "The last two letters are swapped.", "1": "That is one place too far each time.", "2": "G becomes T, not S."}'),
  ('IQ-0072', 'Patterns and sequences', 'Mirror code', 'moderate', 'Markhor Prep original question', 'In the A↔Z, B↔Y code, a word is written as RILM. What is the word?', '["IRAN", "IRON", "RING", "IONS"]', 1, 'The code is its own reverse: R→I, I→R, L→O, M→N.', '{"0": "L decodes to O, not A.", "2": "That uses the letters in the wrong order.", "3": "M decodes to N; there is no S."}'),
  ('IQ-0073', 'Patterns and sequences', 'Increasing shift', 'moderate', 'Markhor Prep original question', 'In a code, PEN is written as QGQ (the letters move 1, 2 and 3 places). How is MAP written?', '["NBQ", "NCS", "NCR", "OCS"]', 1, 'M+1 = N, A+2 = C, P+3 = S.', '{"0": "That moves every letter by 1.", "2": "The last letter moves 3, not 2.", "3": "The first letter moves 1, not 2."}'),
  ('IQ-0074', 'Patterns and sequences', 'Reverse and shift', 'hard', 'Markhor Prep original question', 'In a code, FRIEND is written as EOFJSG (written backwards, then each letter moved 1 place forward). How is CHAIR written?', '["SJBID", "DIBJS", "RIAHC", "SJBIE"]', 0, 'Backwards: RIAHC. Then +1 each: S, J, B, I, D.', '{"1": "That shifts without reversing.", "2": "That reverses without shifting.", "3": "C moves to D, not E."}'),
  ('IQ-0075', 'Patterns and sequences', 'Number code', 'easy', 'Markhor Prep original question', 'If A = 1, B = 2, …, Z = 26, what is the value of the word BAD (adding the letters)?', '["8", "6", "214", "7"]', 3, 'B + A + D = 2 + 1 + 4 = 7.', '{"0": "D is 4, not 5.", "1": "A is 1, not 0.", "2": "That writes the numbers side by side instead of adding them."}'),
  ('IQ-0076', 'Patterns and sequences', 'Number code', 'moderate', 'Markhor Prep original question', 'In a code, CAB = 6 and FACE = 15. Using the same rule, HIDE = ?', '["24", "28", "26", "22"]', 2, 'The code adds letter positions: C + A + B = 3 + 1 + 2 = 6; F + A + C + E = 15. HIDE = 8 + 9 + 4 + 5 = 26.', '{"0": "I is 9, not 7.", "1": "D is 4, not 6.", "3": "E is 5, not 1."}'),
  ('IQ-0077', 'Patterns and sequences', 'Number code', 'hard', 'Markhor Prep original question', 'In a code, each word is written as the product of its letters'' positions (A = 1, B = 2, …). BED = 40. What is CAGE?', '["105", "16", "84", "120"]', 0, 'BED: 2 × 5 × 4 = 40. CAGE: 3 × 1 × 7 × 5 = 105.', '{"1": "That adds the positions.", "2": "That uses G = 7 but E = 4.", "3": "That takes G as 8."}'),
  ('IQ-0078', 'Patterns and sequences', 'Code language', 'moderate', 'Markhor Prep original question', 'In a code language:
"good morning friend" is written "ka lo mi"
"morning tea" is written "pa lo"
"good tea" is written "pa ka"
What is the code for "friend"?', '["lo", "ka", "mi", "pa"]', 2, '''morning'' is common to the first two lines, so it is ''lo''. ''tea'' is common to the last two, so it is ''pa''. ''good'' is then ''ka'', and ''friend'' is ''mi''.', '{"0": "lo is ''morning''.", "1": "ka is ''good''.", "3": "pa is ''tea''."}'),
  ('IQ-0079', 'Patterns and sequences', 'Code language', 'hard', 'Markhor Prep original question', 'In a code language:
"sun is hot" is written "tor vi ka"
"hot tea is ready" is written "ka mu vi fe"
"ready to go" is written "fe zo ri"
Which code stands for "sun"?', '["vi", "tor", "ka", "fe"]', 1, '''is'' and ''hot'' are common to the first two lines; their codes are ''vi'' and ''ka''. That leaves ''tor'' for ''sun''.', '{"0": "vi is ''is'' or ''hot''.", "2": "ka is ''is'' or ''hot''.", "3": "fe is ''ready'', from the last two lines."}'),
  ('IQ-0080', 'Patterns and sequences', 'Symbol code', 'moderate', 'Markhor Prep original question', 'If + means ×, × means −, − means ÷ and ÷ means +, what is 8 + 3 × 12 − 4?', '["3", "40", "27", "21"]', 3, 'Replace the signs: 8 × 3 − 12 ÷ 4 = 24 − 3 = 21.', '{"0": "That works left to right, ignoring the order of operations: (24 − 12) ÷ 4.", "1": "That keeps the original signs: 8 + 36 − 4.", "2": "That turns × into + instead of −: 24 + 3."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, mdcat, checks, writer_id, created_at, updated_at)
SELECT s.column1, 'Logical Reasoning', s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10,
  'live', 0, 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('IQ-0081', 'Patterns and sequences', 'Symbol code', 'hard', 'Markhor Prep original question', 'If P means +, Q means −, R means × and S means ÷, what is 18 S 3 R 4 Q 5 P 2?', '["1", "21", "17", "25"]', 1, '18 ÷ 3 × 4 − 5 + 2 = 6 × 4 − 5 + 2 = 24 − 5 + 2 = 21.', '{"0": "That does 18 ÷ (3 × 4) first.", "2": "That subtracts 5 + 2 together.", "3": "That adds 5 instead of subtracting."}'),
  ('IQ-0082', 'Patterns and sequences', 'Position code', 'moderate', 'Markhor Prep original question', 'In a code, the word TABLE is written 20-1-2-12-5. How is CHAIR written?', '["3-8-1-9-18", "3-8-1-9-17", "3-7-1-9-18", "4-8-1-9-18"]', 0, 'Each letter is written as its position: C = 3, H = 8, A = 1, I = 9, R = 18.', '{"1": "R is 18, not 17.", "2": "H is 8, not 7.", "3": "C is 3, not 4."}'),
  ('IQ-0083', 'Patterns and sequences', 'Position code', 'hard', 'Markhor Prep original question', 'In a code, 7-15-12-4 stands for GOLD. What does 19-9-12-22-5-18 stand for?', '["SILVRE", "SLIVER", "SALVER", "SILVER"]', 3, 'S = 19, I = 9, L = 12, V = 22, E = 5, R = 18.', '{"0": "The last two letters are swapped.", "1": "The second and third letters are swapped.", "2": "9 is I, not A."}'),
  ('IQ-0084', 'Patterns and sequences', 'Letter shift', 'hard', 'Markhor Prep original question', 'In a code, TEACHER is written as VGCEJGT. Which word is written as RWRKN?', '["QVQJM", "TYTMP", "PUPIL", "PUPIK"]', 2, 'Each letter moves 2 forward, so decode by moving each letter 2 back: R→P, W→U, R→P, K→I, N→L.', '{"0": "That moves only 1 back.", "1": "That moves forward instead of back.", "3": "N goes back 2 to L, not 3 to K."}'),
  ('IQ-0085', 'Patterns and sequences', 'Pattern code', 'moderate', 'Markhor Prep original question', 'In a code, the vowels A, E, I, O, U are written as 1, 2, 3, 4, 5, and consonants stay the same. How is EDUCATION written?', '["2D5C1T43N", "1D5C2T34N", "2D4C1T35N", "2D5C1T34N"]', 3, 'E→2, D, U→5, C, A→1, T, I→3, O→4, N.', '{"0": "I and O are swapped.", "1": "E and A are swapped.", "2": "U is 5 and O is 4."}'),
  ('IQ-0086', 'Patterns and sequences', 'Number code', 'moderate', 'Markhor Prep original question', 'In a code, each letter is written as its position counted from Z (Z = 1, Y = 2, …). How is DOG written?', '["4-15-7", "23-12-20", "22-11-19", "23-12-19"]', 1, 'Reverse position = 27 − normal position: D (4) → 23, O (15) → 12, G (7) → 20.', '{"0": "That is the normal position.", "2": "That uses 26 − position.", "3": "G (7) → 20, not 19."}'),
  ('IQ-0087', 'Logical deductions', 'Directions', 'easy', 'Markhor Prep original question', 'Sara walks 6 km east, then 8 km north. How far is she from her starting point?', '["10 km", "14 km", "2 km", "7 km"]', 0, 'The two legs are at right angles: √(6² + 8²) = 10 km.', '{"1": "That adds the two distances walked.", "2": "That subtracts them.", "3": "That averages them."}'),
  ('IQ-0088', 'Logical deductions', 'Directions', 'easy', 'Markhor Prep original question', 'Facing east, Usman turns left, then turns left again. Which way is he facing now?', '["North", "South", "West", "East"]', 2, 'Two left turns make a half-turn: east → north → west.', '{"0": "That is after one left turn.", "1": "That is after one right turn.", "3": "Two left turns do change the direction."}'),
  ('IQ-0089', 'Logical deductions', 'Directions', 'moderate', 'Markhor Prep original question', 'A man walks 5 m south, turns left and walks 3 m, then turns left and walks 5 m. Which way is he from his starting point?', '["East", "West", "North", "South"]', 0, 'Facing south, a left turn faces east; another left faces north. He ends 3 m east of the start.', '{"1": "A left turn from south faces east, not west.", "2": "The north and south legs cancel.", "3": "He walked 5 m back north."}'),
  ('IQ-0090', 'Logical deductions', 'Directions', 'moderate', 'Markhor Prep original question', 'Hina walks 10 m north, 4 m east, 6 m south and 4 m east. How far is she from her starting point?', '["24 m", "4√5 m", "12 m", "8√5 m"]', 1, 'Net: 10 − 6 = 4 m north and 4 + 4 = 8 m east. Distance = √(8² + 4²) = √80 = 4√5 m (about 8.9 m).', '{"0": "That adds every leg.", "2": "That adds the net legs 8 + 4.", "3": "That adds the 6 m south to the 10 m north."}'),
  ('IQ-0091', 'Logical deductions', 'Directions', 'moderate', 'Markhor Prep original question', 'In the evening, Tariq stands facing his shadow. Which direction is he facing?', '["West", "North", "East", "South"]', 2, 'In the evening the sun is in the west, so shadows fall towards the east. Facing his shadow, he faces east.', '{"0": "The sun is in the west; he would face the sun.", "1": "Shadows are not north in the evening.", "3": "Shadows are not south in the evening."}'),
  ('IQ-0092', 'Logical deductions', 'Directions', 'hard', 'Markhor Prep original question', 'A car goes 12 km west, turns right and goes 5 km, then turns right again and goes 12 km. How far is it from the start?', '["29 km", "13 km", "17 km", "5 km"]', 3, 'West, then a right turn faces north, then another right faces east. The east and west legs cancel, leaving 5 km north.', '{"0": "That adds every leg.", "1": "That is √(12² + 5²), after only two legs.", "2": "That is 12 + 5."}'),
  ('IQ-0093', 'Logical deductions', 'Directions', 'hard', 'Markhor Prep original question', 'Facing south-west, a girl turns 135° clockwise. Which direction is she facing now?', '["East", "West", "North-west", "North"]', 3, 'Clockwise from south-west: 45° → west, 90° → north-west, 135° → north.', '{"0": "That is 225° clockwise.", "1": "That is 45° clockwise.", "2": "That is 90° clockwise."}'),
  ('IQ-0094', 'Logical deductions', 'Directions', 'hard', 'Markhor Prep original question', 'Point B is 6 km north of A. C is 8 km east of B. D is 6 km south of C. How far and in which direction is D from A?', '["8 km west", "10 km north-east", "8 km east", "14 km east"]', 2, 'Going north 6 and south 6 cancel, so D is 8 km due east of A.', '{"0": "It is east, not west.", "1": "That is the distance from A to C.", "3": "That adds 6 + 8."}'),
  ('IQ-0095', 'Logical deductions', 'Blood relations', 'easy', 'Markhor Prep original question', 'Ayesha is the daughter of Kamal''s only brother. How is Ayesha related to Kamal?', '["Daughter", "Niece", "Sister", "Cousin"]', 1, 'A brother''s daughter is one''s niece.', '{"0": "She is his brother''s daughter.", "2": "She is a generation below him.", "3": "She is a cousin of Kamal''s children, not of Kamal."}'),
  ('IQ-0096', 'Logical deductions', 'Blood relations', 'easy', 'Markhor Prep original question', 'Ahmed''s father is the only son of Bashir. How is Bashir related to Ahmed?', '["Grandfather", "Father", "Uncle", "Brother"]', 0, 'Bashir''s son is Ahmed''s father, so Bashir is Ahmed''s grandfather.', '{"1": "Bashir is the father of Ahmed''s father.", "2": "An uncle would be the father''s brother.", "3": "Bashir is two generations above."}'),
  ('IQ-0097', 'Logical deductions', 'Blood relations', 'moderate', 'Markhor Prep original question', 'Pointing to a man, Zara says, "His mother is the only daughter of my mother." How is the man related to Zara?', '["Brother", "Nephew", "Cousin", "Son"]', 3, 'The only daughter of Zara''s mother is Zara herself, so the man''s mother is Zara. He is her son.', '{"0": "His mother is Zara, not Zara''s mother.", "1": "A nephew would be a sibling''s son.", "2": "A cousin''s mother would be Zara''s aunt."}'),
  ('IQ-0098', 'Logical deductions', 'Blood relations', 'moderate', 'Markhor Prep original question', 'A is B''s sister. C is B''s mother. D is C''s father. How is A related to D?', '["Daughter", "Grandmother", "Granddaughter", "Niece"]', 2, 'A is C''s daughter (B''s sister), and C is D''s child, so A is D''s granddaughter.', '{"0": "A is C''s daughter, not D''s.", "1": "A is two generations below D, not above.", "3": "A niece would be a sibling''s child."}'),
  ('IQ-0099', 'Logical deductions', 'Blood relations', 'moderate', 'Markhor Prep original question', 'Introducing a woman, Faisal says, "Her husband is the only son of my father." How is the woman related to Faisal?', '["Sister", "Wife", "Sister-in-law", "Mother"]', 1, 'The only son of Faisal''s father is Faisal himself, so the woman''s husband is Faisal.', '{"0": "Her husband is Faisal, so she is not his sister.", "2": "That would need Faisal to have a brother.", "3": "His mother''s husband is his father."}'),
  ('IQ-0100', 'Logical deductions', 'Blood relations', 'hard', 'Markhor Prep original question', 'P is the father of Q. Q is the sister of R. S is the son of R. T is the wife of P. How is T related to S?', '["Grandmother", "Mother", "Aunt", "Sister"]', 0, 'P and T are the parents of Q and R. S is R''s son, so T is S''s grandmother.', '{"1": "S''s mother is R''s wife or R herself, not T.", "2": "An aunt would be a sister of S''s parent, like Q.", "3": "T is two generations above S."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, mdcat, checks, writer_id, created_at, updated_at)
SELECT s.column1, 'Logical Reasoning', s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10,
  'live', 0, 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('IQ-0101', 'Logical deductions', 'Blood relations', 'hard', 'Markhor Prep original question', 'Pointing to a photograph, Imran says, "She is the daughter of the only son of my grandfather." Imran has no brothers. How is the girl related to Imran?', '["Sister", "Cousin", "Daughter", "Niece"]', 0, 'The only son of Imran''s grandfather is Imran''s father, so the girl is his father''s daughter: his sister.', '{"1": "A cousin would be the child of an uncle or aunt; the grandfather has only one son.", "2": "His daughter would be his own child.", "3": "A niece would be a sibling''s child."}'),
  ('IQ-0102', 'Logical deductions', 'Blood relations', 'hard', 'Markhor Prep original question', 'In a family, M is the mother of N. N is the brother of O. O is married to P, and Q is the daughter of O and P. How is N related to Q?', '["Father", "Grandfather", "Uncle", "Brother"]', 2, 'N is the brother of Q''s parent O, so N is Q''s uncle.', '{"0": "Q''s father is P or O, not N.", "1": "M is Q''s grandmother; N is one generation lower.", "3": "N is a generation above Q."}'),
  ('IQ-0103', 'Logical deductions', 'Directions', 'moderate', 'Markhor Prep original question', 'A boy cycles 3 km north, 4 km west, then 6 km south. In which direction is he now from his starting point?', '["North-west", "South-west", "South-east", "West"]', 1, 'Net: 3 north − 6 south = 3 km south, and 4 km west. So he is south-west of the start.', '{"0": "He went further south than north.", "2": "He went west, not east.", "3": "He also moved 3 km south overall."}'),
  ('IQ-0104', 'Logical deductions', 'Directions', 'hard', 'Markhor Prep original question', 'A boy cycles 3 km north, 4 km west, then 6 km south. How far is he from his starting point?', '["13 km", "7 km", "1 km", "5 km"]', 3, 'Net displacement is 4 km west and 3 km south: √(4² + 3²) = 5 km.', '{"0": "That adds every leg.", "1": "That adds the net legs 4 + 3.", "2": "That subtracts them."}'),
  ('IQ-0105', 'Logical problems', 'Ranking', 'easy', 'Markhor Prep original question', 'In a row of 25 students, Bilal is 9th from the front. What is his position from the back?', '["17th", "16th", "18th", "15th"]', 0, 'Position from back = total − position from front + 1 = 25 − 9 + 1 = 17.', '{"1": "That forgets the + 1.", "2": "That adds 1 twice.", "3": "That subtracts 10."}'),
  ('IQ-0106', 'Logical problems', 'Ranking', 'moderate', 'Markhor Prep original question', 'Saima is 12th from the top and 18th from the bottom in her class. How many students are in the class?', '["30", "28", "29", "31"]', 2, 'Total = 12 + 18 − 1 = 29 (Saima is counted in both).', '{"0": "That counts Saima twice.", "1": "That subtracts 2.", "3": "That adds 1."}'),
  ('IQ-0107', 'Logical problems', 'Ranking', 'moderate', 'Markhor Prep original question', 'In a queue, Asad is 7th from the front and Kiran is 4th behind Asad. Kiran is 10th from the back. How many people are in the queue?', '["21", "20", "19", "17"]', 1, 'Kiran is 7 + 4 = 11th from the front and 10th from the back: 11 + 10 − 1 = 20.', '{"0": "That forgets to subtract 1.", "2": "That takes Kiran as 10th from the front.", "3": "That adds 7 and 10 only."}'),
  ('IQ-0108', 'Logical problems', 'Ordering', 'moderate', 'Markhor Prep original question', 'Five friends are in a line. Ali is ahead of Bina but behind Chand. Dua is behind Bina. Eman is ahead of Chand. Who is in the middle?', '["Bina", "Chand", "Dua", "Ali"]', 3, 'Order from the front: Eman, Chand, Ali, Bina, Dua.', '{"0": "Bina is 4th.", "1": "Chand is 2nd.", "2": "Dua is last."}'),
  ('IQ-0109', 'Logical problems', 'Ordering', 'moderate', 'Markhor Prep original question', 'P is taller than Q. R is shorter than Q. S is taller than P. Who is the shortest?', '["Q", "P", "R", "S"]', 2, 'S > P > Q > R.', '{"0": "Q is taller than R.", "1": "P is taller than Q.", "3": "S is the tallest."}'),
  ('IQ-0110', 'Logical problems', 'Ordering', 'hard', 'Markhor Prep original question', 'Among A, B, C, D and E: A is heavier than B but lighter than C. D is heavier than C. E is lighter than B. Who is the third heaviest?', '["A", "B", "C", "E"]', 0, 'From heaviest: D, C, A, B, E.', '{"1": "B is fourth.", "2": "C is second.", "3": "E is the lightest."}'),
  ('IQ-0111', 'Logical problems', 'Ordering', 'hard', 'Markhor Prep original question', 'Six people sit in a row of seats numbered 1 to 6 from the left. F is in seat 1. A sits next to F. B is third from the right end. C sits between A and B. D is not at either end. Who is in seat 6?', '["D", "B", "C", "E"]', 3, 'F 1, A 2, B is third from the right so seat 4, C between A and B is seat 3. D cannot be at the end, so D is 5 and E is 6.', '{"0": "D is not at an end, so D is in seat 5.", "1": "B is in seat 4.", "2": "C is in seat 3."}'),
  ('IQ-0112', 'Logical problems', 'Ranking', 'hard', 'Markhor Prep original question', 'In a class, Umar''s rank is 15th from the top. Hamza is 5 ranks below Umar and 26th from the bottom. How many students are there?', '["46", "45", "44", "41"]', 1, 'Hamza is 15 + 5 = 20th from the top and 26th from the bottom: 20 + 26 − 1 = 45.', '{"0": "That forgets to subtract 1.", "2": "That subtracts 2.", "3": "That takes Hamza as 15th."}'),
  ('IQ-0113', 'Logical problems', 'Seating', 'moderate', 'Markhor Prep original question', 'Four friends sit round a square table, one on each side. Amna faces Bushra. Sidra is on Amna''s right. Who is on Amna''s left?', '["Dania", "Bushra", "Sidra", "Nobody"]', 0, 'With four seats, the one opposite Amna is Bushra and the one on her right is Sidra, so Dania is on her left.', '{"1": "Bushra is opposite.", "2": "Sidra is on her right.", "3": "Every side has someone."}'),
  ('IQ-0114', 'Logical problems', 'Ordering', 'moderate', 'Markhor Prep original question', 'In a race, Rafay finished before Saad but after Taha. Usama finished after Saad. Who finished last?', '["Saad", "Rafay", "Usama", "Taha"]', 2, 'Order: Taha, Rafay, Saad, Usama.', '{"0": "Saad was ahead of Usama.", "1": "Rafay was second.", "3": "Taha won."}'),
  ('IQ-0115', 'Logical problems', 'Ranking', 'easy', 'Markhor Prep original question', 'There are 40 boys in a row. Fahad is 22nd from the left. What is his position from the right?', '["18th", "19th", "20th", "17th"]', 1, '40 − 22 + 1 = 19.', '{"0": "That forgets the + 1.", "2": "That adds 2.", "3": "That subtracts 23."}'),
  ('IQ-0116', 'Logical problems', 'Ordering', 'hard', 'Markhor Prep original question', 'Five books are stacked. The red book is just above the blue. The green is at the bottom. The yellow is just below the black. The black is at the top. Which book is in the middle?', '["Blue", "Yellow", "Green", "Red"]', 3, 'Top to bottom: Black, Yellow, Red, Blue, Green. Red is 3rd.', '{"0": "Blue is 4th.", "1": "Yellow is 2nd.", "2": "Green is at the bottom."}'),
  ('IQ-0117', 'Logical problems', 'Calendars', 'easy', 'Markhor Prep original question', 'If today is Monday, what day will it be 15 days from today?', '["Tuesday", "Monday", "Wednesday", "Sunday"]', 0, '15 = 2 weeks + 1 day, so one day after Monday.', '{"1": "That would be 14 days.", "2": "That would be 16 days.", "3": "That would be 13 days."}'),
  ('IQ-0118', 'Logical problems', 'Calendars', 'moderate', 'Markhor Prep original question', '1 January 2026 was a Thursday. What day was the 101st day of 2026 (11 April)?', '["Friday", "Saturday", "Thursday", "Sunday"]', 1, 'The 101st day is 100 days after 1 January. 100 = 14 weeks + 2 days, so Thursday + 2 = Saturday.', '{"0": "That adds 1 day.", "2": "That treats 100 as a whole number of weeks.", "3": "That adds 3 days."}'),
  ('IQ-0119', 'Logical problems', 'Calendars', 'moderate', 'Markhor Prep original question', '14 August 2026 is a Friday. On which day will 14 August 2027 fall?', '["Friday", "Sunday", "Saturday", "Thursday"]', 2, 'From 14 August 2026 to 14 August 2027 is 365 days (no 29 February in between) = 52 weeks + 1 day.', '{"0": "The date moves on by one day in an ordinary year.", "1": "That would need a leap day in between.", "3": "The day moves forward, not back."}'),
  ('IQ-0120', 'Logical problems', 'Calendars', 'moderate', 'Markhor Prep original question', 'How many odd days (days left over after whole weeks) are there in a leap year?', '["1", "0", "3", "2"]', 3, '366 = 52 × 7 + 2.', '{"0": "That is for an ordinary year of 365 days.", "1": "366 is not a multiple of 7.", "2": "52 × 7 = 364, so 2 days remain."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, mdcat, checks, writer_id, created_at, updated_at)
SELECT s.column1, 'Logical Reasoning', s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10,
  'live', 0, 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('IQ-0121', 'Logical problems', 'Calendars', 'hard', 'Markhor Prep original question', 'Which of these years is a leap year?', '["1900", "2000", "2100", "2026"]', 1, 'A century year is a leap year only if it divides by 400. 2000 does; 1900 and 2100 do not. 2026 does not divide by 4.', '{"0": "1900 divides by 100 but not by 400.", "2": "2100 divides by 100 but not by 400.", "3": "2026 ÷ 4 = 506.5."}'),
  ('IQ-0122', 'Logical problems', 'Calendars', 'hard', 'Markhor Prep original question', 'If 1 March of a year is a Sunday, what day is 1 June of the same year?', '["Sunday", "Tuesday", "Saturday", "Monday"]', 3, 'March 31 + April 30 + May 31 = 92 days = 13 weeks + 1 day. Sunday + 1 = Monday. (February does not come in between.)', '{"0": "92 is not a whole number of weeks.", "1": "That adds 2 days.", "2": "The day moves forward, not back."}'),
  ('IQ-0123', 'Logical problems', 'Calendars', 'hard', 'Markhor Prep original question', 'Pakistan Day, 23 March 2026, is a Monday. On what day was 23 March 2025?', '["Sunday", "Monday", "Saturday", "Tuesday"]', 0, 'Between 23 March 2025 and 23 March 2026 there are 365 days (no 29 February), so the date moves one day back going to 2025.', '{"1": "The day changes over a year.", "2": "That goes back 2 days, as if there were a leap day.", "3": "Going back a year moves the day back, not forward."}'),
  ('IQ-0124', 'Logical problems', 'Calendars', 'moderate', 'Markhor Prep original question', 'If the 3rd of a month is a Tuesday, which of these dates in the same month is also a Tuesday?', '["21st", "23rd", "24th", "25th"]', 2, 'Add multiples of 7: 3, 10, 17, 24, 31.', '{"0": "21 − 3 = 18, not a multiple of 7.", "1": "23 − 3 = 20.", "3": "25 − 3 = 22."}'),
  ('IQ-0125', 'Logical problems', 'Clocks', 'easy', 'Markhor Prep original question', 'What is the angle between the hands of a clock at 3:00?', '["180°", "60°", "90°", "30°"]', 2, 'Each hour mark is 30°; at 3:00 the hands are 3 marks apart.', '{"0": "That is at 6:00.", "1": "That is at 2:00.", "3": "That is at 1:00."}'),
  ('IQ-0126', 'Logical problems', 'Clocks', 'moderate', 'Markhor Prep original question', 'What is the angle between the hands of a clock at 2:30?', '["105°", "120°", "135°", "90°"]', 0, 'Angle = |30 × 2 − 5.5 × 30| = |60 − 165| = 105°. The hour hand has moved halfway from 2 to 3.', '{"1": "That ignores the hour hand''s movement past 2.", "2": "That moves the hour hand back towards 1 instead of on towards 3.", "3": "That puts the hour hand on 3."}'),
  ('IQ-0127', 'Logical problems', 'Clocks', 'moderate', 'Markhor Prep original question', 'What is the angle between the hands of a clock at 4:20?', '["0°", "20°", "30°", "10°"]', 3, '|30 × 4 − 5.5 × 20| = |120 − 110| = 10°.', '{"0": "The hour hand has moved past 4 by 10°.", "1": "That doubles the 10°.", "2": "That is the gap between two hour marks."}'),
  ('IQ-0128', 'Logical problems', 'Clocks', 'hard', 'Markhor Prep original question', 'How many times do the hands of a clock coincide in 12 hours?', '["12", "11", "24", "22"]', 1, 'The minute hand gains a full lap on the hour hand every 12/11 hours, so they meet 11 times in 12 hours.', '{"0": "Between 11 and 1 they meet only once, at 12.", "2": "That assumes they meet twice every hour.", "3": "That is the count for 24 hours."}'),
  ('IQ-0129', 'Logical problems', 'Clocks', 'hard', 'Markhor Prep original question', 'At what time between 3 and 4 o''clock are the hands of a clock together?', '["16 4/11 minutes past 3", "15 minutes past 3", "16 minutes past 3", "17 3/11 minutes past 3"]', 0, 'Need 30 × 3 = 5.5m, so m = 90/5.5 = 180/11 = 16 4/11.', '{"1": "At 3:15 the hour hand has moved past 3.", "2": "That rounds down.", "3": "That uses 3 instead of 4/11."}'),
  ('IQ-0130', 'Logical problems', 'Clocks', 'hard', 'Markhor Prep original question', 'A clock shows 8:10 when seen in a mirror. What is the real time?', '["4:50", "3:10", "3:50", "8:50"]', 2, 'For a mirror image, real time = 11:60 − 8:10 = 3:50.', '{"0": "That subtracts from 12:60.", "1": "That changes only the hour.", "3": "That changes only the minutes."}'),
  ('IQ-0131', 'Logical problems', 'Clocks', 'moderate', 'Markhor Prep original question', 'A clock gains 5 minutes every hour. If it is set right at 8:00 a.m., what will it show at 2:00 p.m. the same day?', '["2:05 p.m.", "2:30 p.m.", "2:25 p.m.", "1:30 p.m."]', 1, 'From 8 a.m. to 2 p.m. is 6 hours; it gains 6 × 5 = 30 minutes.', '{"0": "That counts only one hour''s gain.", "2": "That counts 5 hours.", "3": "A clock that gains runs ahead, not behind."}'),
  ('IQ-0132', 'Logical problems', 'Clocks', 'moderate', 'Markhor Prep original question', 'Through how many degrees does the hour hand turn from 10:00 to 1:30?', '["90°", "120°", "210°", "105°"]', 3, '3½ hours × 30° per hour = 105°.', '{"0": "That ignores the half hour.", "1": "That is 4 hours.", "2": "That is the minute hand''s extra half-turn added."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter) VALUES
  ('net', 'IQ-0001', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0002', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0003', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0004', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0005', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0006', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0007', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0008', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0009', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0010', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0011', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0012', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0013', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0014', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0015', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0016', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0017', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0018', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0019', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0020', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0021', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0022', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0023', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0024', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0025', 'Intelligence', 'Analogies'),
  ('net', 'IQ-0026', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0027', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0028', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0029', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0030', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0031', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0032', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0033', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0034', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0035', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0036', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0037', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0038', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0039', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0040', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0041', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0042', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0043', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0044', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0045', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0046', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0047', 'Intelligence', 'Odd one out'),
  ('net', 'IQ-0048', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0049', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0050', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0051', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0052', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0053', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0054', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0055', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0056', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0057', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0058', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0059', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0060', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0061', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0062', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0063', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0064', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0065', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0066', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0067', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0068', 'Intelligence', 'Word skills'),
  ('net', 'IQ-0069', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0070', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0071', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0072', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0073', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0074', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0075', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0076', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0077', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0078', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0079', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0080', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0081', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0082', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0083', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0084', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0085', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0086', 'Intelligence', 'Coding and decoding'),
  ('net', 'IQ-0087', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0088', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0089', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0090', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0091', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0092', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0093', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0094', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0095', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0096', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0097', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0098', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0099', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0100', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0101', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0102', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0103', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0104', 'Intelligence', 'Relations and directions'),
  ('net', 'IQ-0105', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0106', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0107', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0108', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0109', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0110', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0111', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0112', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0113', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0114', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0115', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0116', 'Intelligence', 'Ordering and ranking'),
  ('net', 'IQ-0117', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0118', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0119', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0120', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0121', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0122', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0123', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0124', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0125', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0126', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0127', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0128', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0129', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0130', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0131', 'Intelligence', 'Calendars and clocks'),
  ('net', 'IQ-0132', 'Intelligence', 'Calendars and clocks');

INSERT INTO question_counters (prefix, n) VALUES ('IQ', 132) ON CONFLICT (prefix) DO UPDATE SET n = max(n, 132);
