-- Gap questions for the pre-medical banks: PMDC learning outcomes that the bank covered thinly when counted per topic
-- (respiration of fats and proteins, kidney capillary beds, muscle types, biotechnology in health care, genes and the
-- DNA double helix, reflexes and receptors, group 14 elements, types of solids, the electromagnetic spectrum,
-- streamline flow, efficiency, mechanical waves and the PN junction). All original, checked against the textbooks.
-- New ids: BIO-2001 on, CHE-2101 on, PHY-2101 on. Each goes in the MDCAT bank through its own chapter and in the
-- other banks below, as live questions on the same topics are mapped.

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-2001', 'Biology', 'Bioenergetics', 'Respiration of fats', 'moderate', 'Markhor Prep original question', 'Before fatty acids can enter the Krebs cycle, they are broken down by beta-oxidation into:', '', '["Pyruvate", "Glycerol", "Oxaloacetate", "Acetyl CoA"]', 3, 'Beta-oxidation in the mitochondrial matrix cuts a fatty acid into two-carbon pieces, each carried as acetyl CoA, which enters the Krebs cycle just as acetyl CoA from glucose does.', '{"0": "Pyruvate is the end product of glycolysis of glucose, not of beta-oxidation.", "1": "Glycerol is the other part of a fat molecule, released when the fat is hydrolysed, not a product of beta-oxidation.", "2": "Oxaloacetate is the Krebs cycle compound that accepts acetyl CoA; it is not made from the fatty acid."}', 1),
  ('BIO-2002', 'Biology', 'Bioenergetics', 'Respiration of fats', 'moderate', 'Markhor Prep original question', 'The glycerol part of a fat molecule enters cellular respiration by joining:', '', '["The Krebs cycle directly, as citrate", "The electron transport chain directly", "Glycolysis, as a three-carbon sugar phosphate", "Beta-oxidation, as acetyl CoA"]', 2, 'Glycerol is converted into a three-carbon sugar phosphate (PGAL), an intermediate of glycolysis, so it is respired along the same pathway as glucose from that point.', '{"0": "Citrate is formed inside the Krebs cycle from acetyl CoA and oxaloacetate; glycerol does not enter there.", "1": "Only electron carriers (NADH, FADH₂) feed the electron transport chain, not carbon compounds.", "3": "Beta-oxidation breaks down fatty acids, not glycerol."}', 1),
  ('BIO-2003', 'Biology', 'Bioenergetics', 'Respiration of proteins', 'moderate', 'Markhor Prep original question', 'Before the carbon skeleton of an amino acid can be respired, the amino acid must first undergo:', '', '["Decarboxylation of glucose", "Deamination", "Phosphorylation by ATP", "Hydrolysis into glycerol"]', 1, 'Deamination removes the amino group (–NH₂) as ammonia, which the liver turns into urea. The remaining keto acid enters respiration as pyruvate, acetyl CoA or a Krebs cycle acid.', '{"0": "Decarboxylation removes CO₂ inside respiration itself; it is not the first step that prepares an amino acid.", "2": "Phosphorylation by ATP is how glucose is prepared in glycolysis, not amino acids.", "3": "Glycerol comes from fats, not from amino acids."}', 1),
  ('BIO-2004', 'Biology', 'Bioenergetics', 'Respiration of fats', 'hard', 'Markhor Prep original question', 'Gram for gram, fat releases about twice as much energy as carbohydrate in respiration. The main reason is that fat molecules:', '', '["Have many more C–H bonds and less oxygen, so they supply more hydrogen to the electron transport chain", "Are respired anaerobically, which releases more energy", "Are larger, and larger molecules always release more energy per gram", "Are broken down in the cytoplasm, where more ATP is made"]', 0, 'Fatty acids are long hydrocarbon chains with very little oxygen. Their many C–H bonds supply far more hydrogen (electrons) to NAD and FAD, and so to the electron transport chain, than the same mass of carbohydrate, which is already partly oxidised.', '{"1": "Fats can only be respired aerobically; anaerobic respiration releases much less energy.", "2": "Energy per gram depends on how reduced the molecule is, not its size.", "3": "Beta-oxidation and the Krebs cycle happen in mitochondria, and most ATP is made there, not in the cytoplasm."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-2005', 'Biology', 'Bioenergetics', 'Respiratory quotient', 'moderate', 'Markhor Prep original question', 'The respiratory quotient (RQ) of a resting person is measured as 0.7. Which food is mainly being respired?', '', '["Fat", "Carbohydrate", "Protein", "Glucose without oxygen"]', 0, 'RQ is the volume of CO₂ released divided by the volume of O₂ taken in. It is about 1.0 for carbohydrate, about 0.8 to 0.9 for protein and about 0.7 for fat, because fat needs more oxygen for each CO₂ it gives out.', '{"1": "Carbohydrate gives an RQ of about 1.0.", "2": "Protein gives an RQ of about 0.8 to 0.9.", "3": "Anaerobic respiration releases CO₂ without using oxygen, giving an RQ above 1."}', 1),
  ('BIO-2006', 'Biology', 'Bioenergetics', 'Respiratory quotient', 'hard', 'Markhor Prep original question', 'The fat tripalmitin is respired completely: 2C₅₁H₉₈O₆ + 145O₂ → 102CO₂ + 98H₂O. What is its respiratory quotient?', '', '["1.00", "1.42", "0.96", "0.70"]', 3, 'RQ = CO₂ released ÷ O₂ used = 102 ÷ 145 = 0.70, the typical value for fats.', '{"0": "1.00 is the RQ of carbohydrate such as glucose.", "1": "1.42 is O₂ ÷ CO₂, the ratio upside down.", "2": "0.96 compares the water formed with the CO₂ formed, which is not the RQ."}', 1),
  ('BIO-2007', 'Biology', 'Homeostasis', 'Capillary beds', 'moderate', 'Markhor Prep original question', 'Blood pressure in the glomerulus stays high enough for filtration mainly because:', '', '["The afferent arteriole is wider than the efferent arteriole", "The efferent arteriole is wider than the afferent arteriole", "Glomerular capillaries have thick muscular walls", "Peritubular capillaries pump blood back into the glomerulus"]', 0, 'Blood enters the glomerulus through a wide afferent arteriole and leaves through a narrower efferent arteriole. The narrow exit holds blood back, keeping pressure high, which forces fluid out into Bowman''s capsule.', '{"1": "A wider exit would let blood drain away and lower the pressure.", "2": "Capillaries have walls one cell thick, with no muscle.", "3": "Capillaries cannot pump; peritubular capillaries come after the glomerulus."}', 1),
  ('BIO-2008', 'Biology', 'Homeostasis', 'Capillary beds', 'moderate', 'Markhor Prep original question', 'Water, glucose and salts reabsorbed from the proximal tubule pass back into the blood through the:', '', '["Glomerular capillaries", "Afferent arteriole", "Bowman''s capsule", "Peritubular capillaries"]', 3, 'The efferent arteriole divides again into peritubular capillaries that wrap around the tubules. They take back reabsorbed substances and also carry substances for tubular secretion.', '{"0": "Glomerular capillaries filter fluid out of the blood; they do not take it back.", "1": "The afferent arteriole brings blood to the glomerulus, before filtration.", "2": "Bowman''s capsule collects the filtrate; it is part of the nephron, not a blood vessel."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-2009', 'Biology', 'Homeostasis', 'Capillary beds', 'hard', 'Markhor Prep original question', 'How does blood pressure in the peritubular capillaries compare with that in the glomerular capillaries, and why does it matter?', '', '["It is higher, which favours filtration", "It is the same, because both lie in the same kidney", "It is lower, which favours reabsorption of fluid into the blood", "It is lower, which stops tubular secretion"]', 2, 'Blood has already passed through the glomerulus and the narrow efferent arteriole, so pressure in the peritubular capillaries is low. Their blood is also rich in plasma proteins left behind by filtration. Low pressure and high protein both draw water back in.', '{"0": "Filtration happens in the glomerulus, where pressure is high; the peritubular bed is the low-pressure bed.", "1": "Pressure falls as blood passes the efferent arteriole, so the two beds differ.", "3": "Tubular secretion still happens from the peritubular capillaries into the tubule; low pressure does not stop it."}', 1),
  ('BIO-2010', 'Biology', 'Homeostasis', 'Glomerular filtration', 'easy', 'Markhor Prep original question', 'Which of these is normally absent from the glomerular filtrate of a healthy person?', '', '["Plasma proteins", "Glucose", "Urea", "Amino acids"]', 0, 'Filtration separates by size. Glucose, amino acids, urea, salts and water pass through the glomerular membrane, but plasma proteins are too large and stay in the blood.', '{"1": "Glucose is filtered and then normally all reabsorbed in the proximal tubule.", "2": "Urea is filtered, and much of it stays in the urine.", "3": "Amino acids are filtered and then reabsorbed."}', 1),
  ('BIO-2011', 'Biology', 'Human physiology', 'Muscle types', 'easy', 'Markhor Prep original question', 'Which kind of muscle is striated, has branched fibres and works involuntarily?', '', '["Skeletal muscle", "Smooth muscle", "Cardiac muscle", "Both skeletal and smooth muscle"]', 2, 'Cardiac muscle is found only in the heart. Its fibres are striated and branched, joined by intercalated discs, and it contracts without conscious control.', '{"0": "Skeletal muscle is striated but its fibres are unbranched and it is voluntary.", "1": "Smooth muscle is involuntary but not striated.", "3": "Neither skeletal nor smooth muscle has all three features."}', 1),
  ('BIO-2012', 'Biology', 'Human physiology', 'Muscle types', 'easy', 'Markhor Prep original question', 'Intercalated discs, which pass the impulse quickly from cell to cell, are found in:', '', '["Skeletal muscle", "Cardiac muscle", "Smooth muscle of the gut", "All three types of muscle"]', 1, 'Intercalated discs are special junctions between cardiac muscle cells. They let the impulse spread rapidly so the heart contracts as one unit.', '{"0": "Skeletal muscle fibres are long single cells with no intercalated discs.", "2": "Smooth muscle cells are spindle-shaped and lack intercalated discs.", "3": "Only cardiac muscle has them."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-2013', 'Biology', 'Human physiology', 'Muscle types', 'easy', 'Markhor Prep original question', 'Spindle-shaped cells, each with one nucleus and no striations, describe:', '', '["Smooth muscle", "Cardiac muscle", "Skeletal muscle", "Tendons"]', 0, 'Smooth (visceral) muscle, found in the walls of the gut, blood vessels and bladder, has spindle-shaped uninucleate cells without striations.', '{"1": "Cardiac muscle is striated and branched.", "2": "Skeletal muscle fibres are striated and have many nuclei.", "3": "Tendons are connective tissue, not muscle."}', 1),
  ('BIO-2014', 'Biology', 'Human physiology', 'Muscle types', 'moderate', 'Markhor Prep original question', 'Which statement about skeletal muscle fibres is correct?', '', '["Each fibre is branched and has one central nucleus", "Each fibre is spindle-shaped and contracts slowly without fatigue", "Each fibre is joined to the next by intercalated discs", "Each fibre is long, striated and has many nuclei"]', 3, 'A skeletal muscle fibre forms by the fusion of many cells, so it is long and multinucleate, with its nuclei under the sarcolemma. Its regular actin and myosin give it striations.', '{"0": "Branched fibres with one central nucleus describe cardiac muscle.", "1": "Spindle-shaped, slow, fatigue-resistant cells describe smooth muscle.", "2": "Intercalated discs belong to cardiac muscle."}', 1),
  ('BIO-2015', 'Biology', 'Biotechnology', 'Vaccines from biotechnology', 'moderate', 'Markhor Prep original question', 'The hepatitis B vaccine made by genetic engineering contains:', '', '["Live hepatitis B virus that has been weakened", "A viral surface protein made by recombinant yeast", "Antibodies against the hepatitis B virus", "The complete DNA of the hepatitis B virus"]', 1, 'The gene for the virus''s surface antigen is put into yeast, which makes the protein in large amounts. The purified protein is the vaccine: it trains the immune system but cannot cause infection.', '{"0": "A weakened live virus is a different, older kind of vaccine.", "2": "Ready-made antibodies give passive immunity; a vaccine makes the body produce its own.", "3": "The vaccine contains a protein, not the virus''s genes."}', 1),
  ('BIO-2016', 'Biology', 'Biotechnology', 'Vaccines from biotechnology', 'moderate', 'Markhor Prep original question', 'Why are recombinant subunit vaccines safer than vaccines made from live, weakened microbes?', '', '["They contain only an antigen, so they cannot cause the disease", "They contain more microbes, so the response is faster", "They contain antibodies, so no immune response is needed", "They change the patient''s DNA to resist infection"]', 0, 'A subunit vaccine contains only a purified antigen (usually one protein), not a whole microbe. There is nothing that could multiply or revert to a harmful form, so it cannot cause the disease.', '{"1": "A subunit vaccine contains no whole microbes at all.", "2": "Vaccines rely on the body making its own antibodies; supplying antibodies is passive immunity.", "3": "Vaccines do not change the patient''s DNA."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-2017', 'Biology', 'Biotechnology', 'DNA probes', 'moderate', 'Markhor Prep original question', 'A DNA probe used to diagnose a genetic disease is:', '', '["An enzyme that cuts DNA at a particular base sequence", "A double-stranded plasmid that carries a new gene", "A short, labelled, single strand of DNA that pairs with a matching sequence", "An antibody that binds to a faulty protein"]', 2, 'A probe is a short single-stranded piece of DNA (or RNA) labelled with a radioactive or fluorescent tag. It binds by base pairing to a complementary sequence, showing whether the disease allele is present.', '{"0": "An enzyme that cuts DNA is a restriction enzyme.", "1": "A plasmid carrying a gene is a vector, used to transfer genes.", "3": "An antibody is a protein, used in monoclonal antibody tests, not a DNA probe."}', 1),
  ('BIO-2018', 'Biology', 'Biotechnology', 'Products of biotechnology', 'easy', 'Markhor Prep original question', 'Which medicine is now made on a large scale by genetically engineered bacteria?', '', '["Human insulin", "Penicillin", "Aspirin", "Morphine"]', 0, 'The human insulin gene is inserted into bacteria (E. coli), which then produce human insulin for people with diabetes.', '{"1": "Penicillin is made naturally by the fungus Penicillium.", "2": "Aspirin is made by ordinary chemical synthesis.", "3": "Morphine comes from the opium poppy."}', 1),
  ('BIO-2019', 'Biology', 'Biotechnology', 'Products of biotechnology', 'moderate', 'Markhor Prep original question', 'Recombinant clotting factor VIII, made by genetically engineered cells, is used to treat:', '', '["Diabetes mellitus", "Dwarfism", "Sickle-cell anaemia", "Haemophilia A"]', 3, 'People with haemophilia A lack working factor VIII, so their blood clots poorly. Factor VIII made by recombinant cells replaces it without the risk of infection from donated blood.', '{"0": "Diabetes is treated with insulin.", "1": "Pituitary dwarfism is treated with human growth hormone.", "2": "Sickle-cell anaemia is caused by faulty haemoglobin, not a missing clotting factor."}', 1),
  ('BIO-2020', 'Biology', 'Biotechnology', 'Products of biotechnology', 'moderate', 'Markhor Prep original question', 'Interferon made by recombinant DNA technology is mainly used against:', '', '["Bacterial infections such as tuberculosis", "High blood sugar", "Viral infections such as hepatitis", "Blood clotting disorders"]', 2, 'Interferons are proteins that make cells resist the spread of viruses. Recombinant interferon is used to treat viral infections such as hepatitis B and C, and some cancers.', '{"0": "Bacterial infections are treated with antibiotics.", "1": "High blood sugar is treated with insulin.", "3": "Clotting disorders are treated with clotting factors."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-2021', 'Biology', 'Chromosomes and DNA', 'Genes', 'easy', 'Markhor Prep original question', 'According to the one gene–one polypeptide idea, a gene is:', '', '["A single nucleotide in DNA", "A sequence of nucleotides in DNA that codes for one polypeptide", "A whole chromosome", "A sequence of amino acids in a protein"]', 1, 'A gene is a stretch of DNA whose sequence of nucleotides carries the code for building one polypeptide chain.', '{"0": "One nucleotide cannot code for anything; codons are three bases long.", "2": "A chromosome carries hundreds or thousands of genes.", "3": "Amino acids make up the polypeptide that the gene codes for, not the gene itself."}', 1),
  ('BIO-2022', 'Biology', 'Biological molecules', 'Nucleic acids', 'moderate', 'Markhor Prep original question', 'In the Watson and Crick model of DNA, one complete turn of the double helix contains about:', '', '["10 base pairs, over a length of 3.4 nm", "20 base pairs, over a length of 3.4 nm", "10 base pairs, over a length of 2 nm", "34 base pairs, over a length of 10 nm"]', 0, 'Neighbouring base pairs are 0.34 nm apart, and the helix makes one full turn every 10 base pairs, so one turn is 3.4 nm long. The helix is about 2 nm wide.', '{"1": "20 base pairs in 3.4 nm would put the bases only 0.17 nm apart.", "2": "2 nm is the width of the helix, not the length of one turn.", "3": "This mixes up the numbers: 34 is 3.4 nm written in ångströms."}', 1),
  ('BIO-2023', 'Biology', 'Biological molecules', 'Nucleic acids', 'moderate', 'Markhor Prep original question', 'A sample of double-stranded DNA contains 30% adenine. What percentage of its bases are cytosine?', '', '["30%", "40%", "70%", "20%"]', 3, 'A pairs with T and G pairs with C, so A = T = 30%. That leaves 100 − 60 = 40% for G and C together, and C is half of it: 20%.', '{"0": "30% is the amount of thymine, which equals adenine.", "1": "40% is G and C together; cytosine is half of that.", "2": "70% is everything except adenine."}', 1),
  ('BIO-2024', 'Biology', 'Biological molecules', 'Nucleic acids', 'moderate', 'Markhor Prep original question', 'In the Watson and Crick model, the two strands of DNA are:', '', '["Parallel, held together by covalent bonds between bases", "Antiparallel, held together by peptide bonds", "Antiparallel, held together by hydrogen bonds between complementary bases", "Identical in base sequence, held by ionic bonds"]', 2, 'One strand runs 5′ to 3′ and the other 3′ to 5′. The sugar-phosphate backbones are outside, and the bases pair inside by hydrogen bonds: A with T (two) and G with C (three).', '{"0": "The strands run in opposite directions, and bases pair by hydrogen bonds, not covalent bonds.", "1": "Peptide bonds join amino acids in proteins.", "3": "The strands are complementary, not identical, and the bonds are hydrogen bonds."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-2025', 'Biology', 'Coordination and control', 'Reflex arc', 'moderate', 'Markhor Prep original question', 'The knee-jerk reflex is an example of:', '', '["A cranial reflex controlled by the brain", "A conditioned reflex learnt by practice", "A monosynaptic spinal reflex", "A reflex with several interneurons"]', 2, 'Tapping the tendon stretches the thigh muscle. The sensory neuron synapses directly with the motor neuron in the spinal cord, with no interneuron, so there is only one synapse.', '{"0": "Cranial reflexes, such as blinking, are centred in the brain; the knee jerk is centred in the spinal cord.", "1": "The knee jerk is inborn, not learnt.", "3": "It has no interneuron at all; withdrawal reflexes are the ones with interneurons."}', 1),
  ('BIO-2026', 'Biology', 'Coordination and control', 'Reflex arc', 'moderate', 'Markhor Prep original question', 'Which of these is a conditioned (learnt) reflex?', '', '["Blinking when an object comes near the eye", "A dog salivating at the sound of a bell", "Pulling the hand away from a hot object", "The pupil narrowing in bright light"]', 1, 'A conditioned reflex is learnt through experience. Pavlov''s dogs learnt to link the bell with food, so the bell alone made them salivate.', '{"0": "Blinking is an inborn cranial reflex.", "2": "Withdrawal from heat is an inborn spinal reflex.", "3": "The pupil reflex is inborn and present from birth."}', 1),
  ('BIO-2027', 'Biology', 'Coordination and control', 'Reflex arc', 'easy', 'Markhor Prep original question', 'What is the correct path of an impulse in a withdrawal reflex arc?', '', '["Receptor → sensory neuron → interneuron → motor neuron → effector", "Receptor → motor neuron → interneuron → sensory neuron → effector", "Effector → sensory neuron → interneuron → motor neuron → receptor", "Receptor → interneuron → sensory neuron → effector → motor neuron"]', 0, 'The receptor detects the stimulus, the sensory neuron carries the impulse to the spinal cord, an interneuron passes it on, and the motor neuron carries it to the effector muscle.', '{"1": "Sensory and motor neurons are swapped.", "2": "The path starts at the receptor, not the effector.", "3": "The sensory neuron comes before the interneuron, and the effector is last."}', 1),
  ('BIO-2028', 'Biology', 'Coordination and control', 'Receptors', 'easy', 'Markhor Prep original question', 'Sensory receptors are called transducers because they:', '', '["Store nerve impulses until they are needed", "Change nerve impulses back into the original stimulus", "Change the energy of a stimulus into electrical nerve impulses", "Carry impulses from the brain to muscles"]', 2, 'A transducer converts one form of energy into another. Receptors turn light, sound, pressure, heat or chemical energy into the electrical energy of nerve impulses.', '{"0": "Receptors do not store impulses.", "1": "That is the reverse of what receptors do.", "3": "Carrying impulses to muscles is the job of motor neurons."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('CHE-2101', 'Chemistry', 'p-block elements', 'Group 14 elements', 'moderate', 'Markhor Prep original question', 'Going down group 14 (IV-A) from carbon to lead, the +2 oxidation state:', '', '["Becomes less stable", "Becomes more stable than the +4 state", "Disappears completely", "Stays exactly as stable as the +4 state"]', 1, 'This is the inert pair effect: the two outer s electrons are less and less likely to take part in bonding down the group. For carbon and silicon +4 is stable, but for lead +2 is the more stable state.', '{"0": "The +2 state becomes more stable down the group, not less.", "2": "Lead forms many stable +2 compounds, such as PbO and PbCl₂.", "3": "The balance shifts down the group; for lead +2 wins."}', 1),
  ('CHE-2102', 'Chemistry', 'p-block elements', 'Group 14 elements', 'moderate', 'Markhor Prep original question', 'Which oxide is amphoteric?', '', '["PbO", "CO₂", "SiO₂", "CO"]', 0, 'Oxides of the metals at the bottom of group 14, such as PbO and SnO, react with both acids and strong bases, so they are amphoteric.', '{"1": "CO₂ is an acidic oxide.", "2": "SiO₂ is an acidic oxide; it reacts with bases, not acids.", "3": "CO is a neutral oxide."}', 1),
  ('CHE-2103', 'Chemistry', 'p-block elements', 'Group 14 elements', 'hard', 'Markhor Prep original question', 'Which chloride is NOT hydrolysed by water?', '', '["SiCl₄", "GeCl₄", "SnCl₄", "CCl₄"]', 3, 'Water attacks SiCl₄ and the heavier chlorides by using the empty d orbitals of the central atom. Carbon has no d orbitals in its outer shell and is small and crowded by four chlorine atoms, so CCl₄ does not react with water.', '{"0": "SiCl₄ fumes in moist air and is hydrolysed to silica and HCl.", "1": "GeCl₄ is hydrolysed by water.", "2": "SnCl₄ is hydrolysed by water."}', 1),
  ('CHE-2104', 'Chemistry', 'p-block elements', 'Group 14 elements', 'moderate', 'Markhor Prep original question', 'Silicon tetrachloride reacts with water to give:', '', '["Silicon and chlorine", "Silane (SiH₄) and oxygen", "Hydrated silica (SiO₂) and hydrogen chloride", "No reaction takes place"]', 2, 'SiCl₄ + 2H₂O → SiO₂ + 4HCl (the silica forms as hydrated Si(OH)₄). The HCl is why SiCl₄ fumes in moist air.', '{"0": "Water does not split SiCl₄ into its elements.", "1": "Hydrolysis does not produce silane or oxygen.", "3": "SiCl₄ is readily hydrolysed, unlike CCl₄."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('CHE-2105', 'Chemistry', 'p-block elements', 'Group 14 elements', 'moderate', 'Markhor Prep original question', 'Which of these is the strongest oxidising agent?', '', '["CO₂", "PbO₂", "SiO₂", "SnO₂"]', 1, 'Lead prefers the +2 state (inert pair effect), so Pb(IV) in PbO₂ readily gains electrons to become Pb(II). That makes PbO₂ a strong oxidising agent.', '{"0": "Carbon is stable in the +4 state, so CO₂ is not an oxidising agent.", "2": "Silicon is very stable in the +4 state.", "3": "Tin''s +4 state is more stable than lead''s, so SnO₂ is a much weaker oxidant."}', 1),
  ('CHE-2106', 'Chemistry', 'p-block elements', 'Group 14 elements', 'easy', 'Markhor Prep original question', 'Which two group 14 elements are metalloids?', '', '["Silicon and germanium", "Carbon and silicon", "Tin and lead", "Carbon and lead"]', 0, 'Metallic character increases down the group: carbon is a non-metal, silicon and germanium are metalloids, and tin and lead are metals.', '{"1": "Carbon is a non-metal.", "2": "Tin and lead are metals.", "3": "Carbon is a non-metal and lead is a metal."}', 1),
  ('CHE-2107', 'Chemistry', 'p-block elements', 'Group 14 elements', 'hard', 'Markhor Prep original question', 'CO₂ is a gas made of separate molecules, but SiO₂ is a hard solid with a very high melting point. This is because:', '', '["SiO₂ is an ionic compound and CO₂ is covalent", "Silicon atoms are smaller than carbon atoms", "CO₂ has hydrogen bonds between its molecules", "Silicon does not form stable double bonds with oxygen, so it forms single bonds in a giant network"]', 3, 'Carbon forms strong C=O double bonds, so each CO₂ is a small separate molecule. Silicon is too large to form good π bonds with oxygen, so each Si bonds to four O atoms by single bonds, building a giant covalent network that needs a lot of energy to break.', '{"0": "Both are covalent; SiO₂ is a giant covalent structure, not ionic.", "1": "Silicon atoms are larger than carbon atoms.", "2": "CO₂ has no hydrogen, so it cannot hydrogen-bond."}', 1),
  ('CHE-2108', 'Chemistry', 'p-block elements', 'Group 14 elements', 'hard', 'Markhor Prep original question', 'On gentle warming, lead(IV) chloride decomposes into:', '', '["Lead and chlorine", "Lead(IV) oxide and hydrogen chloride", "Lead(II) chloride and chlorine", "Lead(II) oxide and chlorine"]', 2, 'PbCl₄ → PbCl₂ + Cl₂. Because the +2 state of lead is the more stable one, PbCl₄ is unstable and loses chlorine easily.', '{"0": "Lead does not fall all the way to the metal on gentle warming.", "1": "No water or oxygen is involved, so neither an oxide nor HCl forms.", "3": "Without oxygen, no oxide can form."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('CHE-2109', 'Chemistry', 'States of matter', 'Types of solids', 'easy', 'Markhor Prep original question', 'Iodine and ice are molecular solids. Which properties are typical of molecular solids?', '', '["Hard, very high melting points and conduct when solid", "Malleable, shiny and conduct electricity", "Hard, brittle and conduct when molten", "Soft, low melting points and do not conduct electricity"]', 3, 'Molecules in a molecular solid are held by weak intermolecular forces (London forces, dipole forces or hydrogen bonds), which are easy to overcome. There are no free ions or electrons to carry charge.', '{"0": "Very high melting points belong to covalent network solids such as diamond, and they don''t conduct when solid either.", "1": "Malleable, shiny conductors are metals.", "2": "Hard, brittle solids that conduct when molten are ionic."}', 1),
  ('CHE-2110', 'Chemistry', 'States of matter', 'Ionic crystals', 'easy', 'Markhor Prep original question', 'Sodium chloride does not conduct electricity as a solid, but conducts when molten because:', '', '["Electrons are released when it melts", "Its ions become free to move when it melts", "Melting turns its covalent bonds into ionic bonds", "Solid sodium chloride has no ions"]', 1, 'Sodium chloride is made of Na⁺ and Cl⁻ ions held in fixed positions in the lattice. When it melts (or dissolves) the ions can move, and moving ions carry the current.', '{"0": "Ionic compounds carry current by moving ions, not free electrons.", "2": "Sodium chloride is ionic in the solid as well; melting does not change the bonding.", "3": "Solid sodium chloride is made of ions; they just cannot move."}', 1),
  ('CHE-2111', 'Chemistry', 'States of matter', 'Types of solids', 'moderate', 'Markhor Prep original question', 'Diamond is a covalent network solid. Which statement explains its very high melting point?', '', '["Its molecules are held together by strong hydrogen bonds", "Every carbon atom is joined to four others by strong covalent bonds throughout the crystal", "It is made of positive ions in a sea of electrons", "It contains Na⁺ and Cl⁻ ions in a lattice"]', 1, 'In diamond each carbon is covalently bonded to four others in a tetrahedral network that runs through the whole crystal. Melting means breaking many strong covalent bonds.', '{"0": "Diamond has no separate molecules and no hydrogen.", "2": "A sea of electrons describes metals.", "3": "Diamond is pure carbon, not an ionic compound."}', 1),
  ('PHY-2101', 'Physics', 'Alternating current', 'Electromagnetic spectrum', 'easy', 'Markhor Prep original question', 'Which list puts electromagnetic waves in order of increasing frequency?', '', '["X-rays, ultraviolet, visible light, infrared, microwaves, radio waves", "Radio waves, microwaves, infrared, visible light, ultraviolet, X-rays", "Visible light, infrared, radio waves, microwaves, ultraviolet, X-rays", "Microwaves, radio waves, visible light, infrared, X-rays, ultraviolet"]', 1, 'Radio waves have the lowest frequency (longest wavelength), then microwaves, infrared, visible light, ultraviolet, X-rays and gamma rays.', '{"0": "This is the right order but backwards: decreasing frequency.", "2": "Infrared lies between microwaves and visible light, and radio waves have the lowest frequency.", "3": "Radio waves have lower frequency than microwaves, and ultraviolet lower than X-rays."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('PHY-2102', 'Physics', 'Alternating current', 'Electromagnetic spectrum', 'easy', 'Markhor Prep original question', 'Which electromagnetic radiation has the shortest wavelength?', '', '["Gamma rays", "X-rays", "Ultraviolet", "Radio waves"]', 0, 'Gamma rays have the highest frequency and so the shortest wavelength of the whole spectrum.', '{"1": "X-rays have slightly longer wavelengths than gamma rays.", "2": "Ultraviolet has much longer wavelengths than X-rays and gamma rays.", "3": "Radio waves have the longest wavelengths."}', 1),
  ('PHY-2103', 'Physics', 'Alternating current', 'Electromagnetic spectrum', 'easy', 'Markhor Prep original question', 'The wavelengths of visible light lie roughly between:', '', '["4 nm and 7 nm", "400 μm and 700 μm", "4 m and 7 m", "400 nm and 700 nm"]', 3, 'Visible light runs from violet at about 400 nm to red at about 700 nm.', '{"0": "4 to 7 nm lies in the X-ray and far-ultraviolet region.", "1": "Hundreds of micrometres lie in the far infrared.", "2": "Metre wavelengths are radio waves."}', 1),
  ('PHY-2104', 'Physics', 'Alternating current', 'Electromagnetic spectrum', 'moderate', 'Markhor Prep original question', 'A radio station broadcasts at 100 MHz. What is the wavelength of its waves? (c = 3 × 10⁸ m s⁻¹)', '', '["0.3 m", "30 m", "3 m", "3 × 10¹⁶ m"]', 2, 'λ = c ÷ f = (3 × 10⁸) ÷ (100 × 10⁶) = 3 m.', '{"0": "0.3 m would need a frequency of 1000 MHz.", "1": "30 m would need a frequency of 10 MHz.", "3": "This multiplies c by f instead of dividing."}', 1),
  ('PHY-2105', 'Physics', 'Alternating current', 'Electromagnetic spectrum', 'moderate', 'Markhor Prep original question', 'In a vacuum, all electromagnetic waves have the same:', '', '["Frequency", "Speed", "Wavelength", "Energy per photon"]', 1, 'Every electromagnetic wave, from radio to gamma, travels at 3 × 10⁸ m s⁻¹ in a vacuum. They differ in frequency and wavelength, and so in photon energy (E = hf).', '{"0": "Frequency is what distinguishes one part of the spectrum from another.", "2": "Wavelength changes across the spectrum, since λ = c ÷ f.", "3": "Photon energy E = hf rises with frequency, so it differs."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('PHY-2106', 'Physics', 'Alternating current', 'Electromagnetic spectrum', 'moderate', 'Markhor Prep original question', 'Which radiation is used to sterilise sealed surgical instruments and syringes?', '', '["Gamma rays", "Radio waves", "Infrared", "Microwaves"]', 0, 'Gamma rays pass through packaging and kill bacteria, so instruments can be sterilised after being sealed.', '{"1": "Radio waves carry too little energy per photon to kill bacteria.", "2": "Infrared only heats surfaces and does not pass through packaging to sterilise.", "3": "Microwaves heat water and are not used to sterilise sealed instruments."}', 1),
  ('PHY-2107', 'Physics', 'Alternating current', 'Electromagnetic spectrum', 'easy', 'Markhor Prep original question', 'Which of these is NOT an electromagnetic wave?', '', '["X-rays", "Infrared", "Microwaves", "Ultrasound"]', 3, 'Ultrasound is sound above 20 kHz, a mechanical (longitudinal) wave that needs a medium. X-rays, infrared and microwaves are all electromagnetic.', '{"0": "X-rays are electromagnetic.", "1": "Infrared is electromagnetic.", "2": "Microwaves are electromagnetic."}', 1),
  ('PHY-2108', 'Physics', 'Fluid dynamics', 'Laminar and turbulent flow', 'moderate', 'Markhor Prep original question', 'In steady (streamline) flow of a fluid:', '', '["Every particle passing a point has the same velocity, and streamlines never cross", "The velocity at a point keeps changing at random", "Streamlines cross each other and form eddies", "The fluid must be at rest"]', 0, 'In streamline (laminar) flow, every particle that reaches a given point follows the path of the particles before it with the same velocity, so the streamlines are smooth and never cross.', '{"1": "Random changes in velocity describe turbulent flow.", "2": "Crossing streamlines and eddies are signs of turbulence.", "3": "Streamline flow is a kind of motion, not rest."}', 1),
  ('PHY-2109', 'Physics', 'Fluid dynamics', 'Laminar and turbulent flow', 'moderate', 'Markhor Prep original question', 'Flow through a pipe changes from streamline to turbulent when:', '', '["The fluid becomes more viscous", "The fluid''s speed falls to zero", "The pipe is made narrower but the speed stays very low", "The speed of the fluid rises above a critical value"]', 3, 'At low speeds flow is smooth. Above a critical speed (which depends on the fluid''s density and viscosity and the size of the pipe), the flow breaks up into eddies and becomes turbulent.', '{"0": "Higher viscosity damps out eddies and keeps flow smooth.", "1": "A fluid at rest is not flowing at all.", "2": "At very low speed the flow stays streamline even in a narrow pipe."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('PHY-2110', 'Physics', 'Fluid dynamics', 'Stokes'' law', 'moderate', 'Markhor Prep original question', 'A small sphere moves slowly through a viscous liquid. If its radius is doubled and its speed kept the same, the viscous drag on it:', '', '["Halves", "Becomes four times larger", "Stays the same", "Doubles"]', 3, 'Stokes'' law gives F = 6πηrv. Drag is directly proportional to the radius, so doubling r doubles F.', '{"0": "Drag increases with radius, it doesn''t decrease.", "1": "Four times would be true if drag depended on r², like the cross-sectional area.", "2": "Drag depends on the radius, so it changes."}', 1),
  ('PHY-2111', 'Physics', 'Work and energy', 'Efficiency', 'easy', 'Markhor Prep original question', 'An electric motor uses 500 J of electrical energy to lift a load, giving the load 400 J of potential energy. What is its efficiency?', '', '["125%", "80%", "20%", "100%"]', 1, 'Efficiency = useful output ÷ input × 100% = 400 ÷ 500 × 100% = 80%.', '{"0": "This divides input by output; no machine can exceed 100%.", "2": "20% is the fraction wasted, not the useful fraction.", "3": "100% would mean no energy wasted, which never happens in practice."}', 1),
  ('PHY-2112', 'Physics', 'Work and energy', 'Energy losses', 'easy', 'Markhor Prep original question', 'The energy ''lost'' by a working machine is mostly:', '', '["Destroyed by friction", "Stored in the machine as extra potential energy", "Turned back into the input energy", "Changed into heat by friction and spread into the surroundings"]', 3, 'Energy cannot be destroyed. In a machine, friction and air resistance turn part of the input energy into heat (internal energy), which spreads out and can''t be used again.', '{"0": "Energy is never destroyed; it only changes form.", "1": "The machine does not store the wasted energy as potential energy.", "2": "Wasted energy can''t be turned back into useful input energy."}', 1),
  ('PHY-2113', 'Physics', 'Waves', 'Types of waves', 'easy', 'Markhor Prep original question', 'Mechanical waves differ from electromagnetic waves because mechanical waves:', '', '["Can travel through a vacuum", "Always travel at 3 × 10⁸ m s⁻¹", "Are always transverse", "Need a material medium to travel through"]', 3, 'Mechanical waves, such as sound and water waves, pass on energy through particles of a medium, so they cannot cross a vacuum. Electromagnetic waves need no medium.', '{"0": "Travelling through a vacuum is what electromagnetic waves can do.", "1": "3 × 10⁸ m s⁻¹ is the speed of electromagnetic waves in a vacuum.", "2": "Sound is a longitudinal mechanical wave, so mechanical waves are not always transverse."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, figure, options, answer, why, wrong, mdcat, stage, free, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11, s.column12, s.column13,
  'live', 0, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('PHY-2114', 'Physics', 'Waves', 'Types of waves', 'easy', 'Markhor Prep original question', 'A ringing bell is placed in a jar and the air is pumped out. The sound fades away because:', '', '["The bell stops vibrating in a vacuum", "Sound travels faster in a vacuum and passes the listener", "Sound needs a medium, and there is almost no air left to carry it", "The glass jar absorbs all the sound"]', 2, 'Sound is a mechanical wave carried by air molecules. As the air is removed, there is less and less medium to pass the vibrations on, even though the bell keeps vibrating.', '{"0": "The bell keeps vibrating; you can still see the hammer strike.", "1": "Sound cannot travel in a vacuum at all.", "3": "The sound was heard clearly through the glass before the air was removed."}', 1),
  ('PHY-2115', 'Physics', 'Electronics', 'PN junction', 'moderate', 'Markhor Prep original question', 'When a PN junction is forward biased, the depletion region:', '', '["Becomes wider, and current is blocked", "Stays the same width, and no current flows", "Becomes narrower, and current flows easily", "Disappears and the diode breaks down"]', 2, 'In forward bias the positive terminal is joined to the p-side. Holes and electrons are pushed towards the junction, narrowing the depletion region and lowering the barrier, so a large current flows.', '{"0": "A wider depletion region is what happens in reverse bias.", "1": "The depletion width changes with bias, and current flows in forward bias.", "3": "Breakdown happens at a large reverse voltage, not in forward bias."}', 1),
  ('PHY-2116', 'Physics', 'Electronics', 'PN junction', 'moderate', 'Markhor Prep original question', 'A silicon diode starts to conduct noticeably in forward bias at about:', '', '["0.3 V", "0.7 V", "7 V", "70 V"]', 1, 'The potential barrier of a silicon junction is about 0.7 V. The forward voltage must overcome it before a large current flows.', '{"0": "About 0.3 V is the barrier for a germanium diode.", "2": "7 V is ten times the silicon barrier.", "3": "70 V is far larger than any junction barrier."}', 1),
  ('PHY-2117', 'Physics', 'Electronics', 'PN junction', 'hard', 'Markhor Prep original question', 'A small current still flows through a reverse-biased PN junction. It is carried by:', '', '["Minority charge carriers", "Majority charge carriers", "The ions in the depletion region", "Protons crossing the junction"]', 0, 'Reverse bias stops the majority carriers, but the few minority carriers (electrons in the p-side, holes in the n-side) are swept across the junction by the field, giving a tiny leakage current.', '{"1": "Reverse bias blocks the majority carriers.", "2": "The ions in the depletion region are fixed in the crystal and can''t move.", "3": "Protons stay in the nuclei; charge in a semiconductor is carried by electrons and holes."}', 1)
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter) VALUES
  ('nums', 'BIO-2001', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-2001', 'Biology', 'Bioenergetics'),
  ('fsc1', 'BIO-2001', 'Biology', 'Bioenergetics'),
  ('nums', 'BIO-2002', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-2002', 'Biology', 'Bioenergetics'),
  ('fsc1', 'BIO-2002', 'Biology', 'Bioenergetics'),
  ('nums', 'BIO-2003', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-2003', 'Biology', 'Bioenergetics'),
  ('fsc1', 'BIO-2003', 'Biology', 'Bioenergetics'),
  ('nums', 'BIO-2004', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-2004', 'Biology', 'Bioenergetics'),
  ('fsc1', 'BIO-2004', 'Biology', 'Bioenergetics'),
  ('nums', 'BIO-2005', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-2005', 'Biology', 'Bioenergetics'),
  ('fsc1', 'BIO-2005', 'Biology', 'Bioenergetics'),
  ('nums', 'BIO-2006', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-2006', 'Biology', 'Bioenergetics'),
  ('fsc1', 'BIO-2006', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-2007', 'Biology', 'Homeostasis'),
  ('fsc2', 'BIO-2007', 'Biology', 'Human urinary system'),
  ('aku', 'BIO-2008', 'Biology', 'Homeostasis'),
  ('fsc2', 'BIO-2008', 'Biology', 'Human urinary system'),
  ('aku', 'BIO-2009', 'Biology', 'Homeostasis'),
  ('fsc2', 'BIO-2009', 'Biology', 'Human urinary system'),
  ('aku', 'BIO-2010', 'Biology', 'Homeostasis'),
  ('fsc2', 'BIO-2010', 'Biology', 'Human urinary system'),
  ('nums', 'BIO-2011', 'Biology', 'Support and movement'),
  ('aku', 'BIO-2011', 'Biology', 'Human physiology'),
  ('fsc1', 'BIO-2011', 'Biology', 'Human skeletal and muscular systems'),
  ('nums', 'BIO-2012', 'Biology', 'Support and movement'),
  ('aku', 'BIO-2012', 'Biology', 'Human physiology'),
  ('fsc1', 'BIO-2012', 'Biology', 'Human skeletal and muscular systems'),
  ('nums', 'BIO-2013', 'Biology', 'Support and movement'),
  ('aku', 'BIO-2013', 'Biology', 'Human physiology'),
  ('fsc1', 'BIO-2013', 'Biology', 'Human skeletal and muscular systems'),
  ('nums', 'BIO-2014', 'Biology', 'Support and movement'),
  ('aku', 'BIO-2014', 'Biology', 'Human physiology'),
  ('fsc1', 'BIO-2014', 'Biology', 'Human skeletal and muscular systems'),
  ('aku', 'BIO-2015', 'Biology', 'Biotechnology'),
  ('fsc2', 'BIO-2015', 'Biology', 'Biotechnology'),
  ('aku', 'BIO-2016', 'Biology', 'Biotechnology'),
  ('fsc2', 'BIO-2016', 'Biology', 'Biotechnology'),
  ('aku', 'BIO-2017', 'Biology', 'Biotechnology'),
  ('fsc2', 'BIO-2017', 'Biology', 'Biotechnology'),
  ('aku', 'BIO-2018', 'Biology', 'Biotechnology'),
  ('fsc2', 'BIO-2018', 'Biology', 'Biotechnology'),
  ('aku', 'BIO-2019', 'Biology', 'Biotechnology'),
  ('fsc2', 'BIO-2019', 'Biology', 'Biotechnology'),
  ('aku', 'BIO-2020', 'Biology', 'Biotechnology'),
  ('fsc2', 'BIO-2020', 'Biology', 'Biotechnology'),
  ('aku', 'BIO-2021', 'Biology', 'Chromosomes and DNA'),
  ('fsc2', 'BIO-2021', 'Biology', 'Chromosome and DNA'),
  ('nums', 'BIO-2022', 'Biology', 'Biological molecules'),
  ('aku', 'BIO-2022', 'Biology', 'Biological molecules'),
  ('fsc1', 'BIO-2022', 'Biology', 'Biomolecules'),
  ('nums', 'BIO-2023', 'Biology', 'Biological molecules'),
  ('aku', 'BIO-2023', 'Biology', 'Biological molecules'),
  ('fsc1', 'BIO-2023', 'Biology', 'Biomolecules'),
  ('nums', 'BIO-2024', 'Biology', 'Biological molecules'),
  ('aku', 'BIO-2024', 'Biology', 'Biological molecules'),
  ('fsc1', 'BIO-2024', 'Biology', 'Biomolecules'),
  ('nums', 'BIO-2025', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-2025', 'Biology', 'Coordination and control'),
  ('fsc2', 'BIO-2025', 'Biology', 'Human nervous system'),
  ('nums', 'BIO-2026', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-2026', 'Biology', 'Coordination and control'),
  ('fsc2', 'BIO-2026', 'Biology', 'Human nervous system'),
  ('nums', 'BIO-2027', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-2027', 'Biology', 'Coordination and control'),
  ('fsc2', 'BIO-2027', 'Biology', 'Human nervous system'),
  ('nums', 'BIO-2028', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-2028', 'Biology', 'Coordination and control'),
  ('fsc2', 'BIO-2028', 'Biology', 'Human nervous system'),
  ('nums', 'CHE-2101', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2101', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2101', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2102', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2102', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2102', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2103', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2103', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2103', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2104', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2104', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2104', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2105', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2105', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2105', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2106', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2106', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2106', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2107', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2107', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2107', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2108', 'Chemistry', 's- and p-block elements'),
  ('aku', 'CHE-2108', 'Chemistry', 'p-block elements'),
  ('fsc1', 'CHE-2108', 'Chemistry', 'Periodic table and periodic properties'),
  ('nums', 'CHE-2109', 'Chemistry', 'Solids'),
  ('aku', 'CHE-2109', 'Chemistry', 'States of matter'),
  ('fsc1', 'CHE-2109', 'Chemistry', 'States and phases of matter');

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter) VALUES
  ('nums', 'CHE-2110', 'Chemistry', 'Solids'),
  ('aku', 'CHE-2110', 'Chemistry', 'States of matter'),
  ('fsc1', 'CHE-2110', 'Chemistry', 'States and phases of matter'),
  ('nums', 'CHE-2111', 'Chemistry', 'Solids'),
  ('aku', 'CHE-2111', 'Chemistry', 'States of matter'),
  ('fsc1', 'CHE-2111', 'Chemistry', 'States and phases of matter'),
  ('aku', 'PHY-2101', 'Physics', 'Alternating current'),
  ('fsc2', 'PHY-2101', 'Physics', 'Medical physics'),
  ('aku', 'PHY-2102', 'Physics', 'Alternating current'),
  ('fsc2', 'PHY-2102', 'Physics', 'Medical physics'),
  ('aku', 'PHY-2103', 'Physics', 'Alternating current'),
  ('fsc2', 'PHY-2103', 'Physics', 'Medical physics'),
  ('aku', 'PHY-2104', 'Physics', 'Alternating current'),
  ('fsc2', 'PHY-2104', 'Physics', 'Medical physics'),
  ('aku', 'PHY-2105', 'Physics', 'Alternating current'),
  ('fsc2', 'PHY-2105', 'Physics', 'Medical physics'),
  ('aku', 'PHY-2106', 'Physics', 'Alternating current'),
  ('fsc2', 'PHY-2106', 'Physics', 'Medical physics'),
  ('aku', 'PHY-2107', 'Physics', 'Alternating current'),
  ('fsc2', 'PHY-2107', 'Physics', 'Medical physics'),
  ('aku', 'PHY-2108', 'Physics', 'Fluid dynamics'),
  ('fsc1', 'PHY-2108', 'Physics', 'Solids and fluid dynamics'),
  ('aku', 'PHY-2109', 'Physics', 'Fluid dynamics'),
  ('fsc1', 'PHY-2109', 'Physics', 'Solids and fluid dynamics'),
  ('aku', 'PHY-2110', 'Physics', 'Fluid dynamics'),
  ('fsc1', 'PHY-2110', 'Physics', 'Solids and fluid dynamics'),
  ('nums', 'PHY-2111', 'Physics', 'Work and energy'),
  ('aku', 'PHY-2111', 'Physics', 'Work and energy'),
  ('fsc1', 'PHY-2111', 'Physics', 'Work, energy and power'),
  ('nums', 'PHY-2112', 'Physics', 'Work and energy'),
  ('aku', 'PHY-2112', 'Physics', 'Work and energy'),
  ('fsc1', 'PHY-2112', 'Physics', 'Work, energy and power'),
  ('nums', 'PHY-2113', 'Physics', 'Waves'),
  ('aku', 'PHY-2113', 'Physics', 'Waves'),
  ('fsc1', 'PHY-2113', 'Physics', 'Waves and vibrations'),
  ('nums', 'PHY-2114', 'Physics', 'Waves'),
  ('aku', 'PHY-2114', 'Physics', 'Waves'),
  ('fsc1', 'PHY-2114', 'Physics', 'Waves and vibrations'),
  ('nums', 'PHY-2115', 'Physics', 'Electronics'),
  ('aku', 'PHY-2115', 'Physics', 'Electronics'),
  ('fsc2', 'PHY-2115', 'Physics', 'Alternating current'),
  ('nums', 'PHY-2116', 'Physics', 'Electronics'),
  ('aku', 'PHY-2116', 'Physics', 'Electronics'),
  ('fsc2', 'PHY-2116', 'Physics', 'Alternating current'),
  ('nums', 'PHY-2117', 'Physics', 'Electronics'),
  ('aku', 'PHY-2117', 'Physics', 'Electronics'),
  ('fsc2', 'PHY-2117', 'Physics', 'Alternating current');
