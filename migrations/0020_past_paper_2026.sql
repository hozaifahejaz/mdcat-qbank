-- Past paper: UHS MDCAT 2026 (Punjab), 180 questions, in the paper's order.
-- Source: the official question paper (Paper ID A) that UHS published on uhs.edu.pk. UHS has not published an answer
-- key for 2026, so every key here was worked out and checked by us. Each question is rebuilt in our own words (same
-- concept, same answer) with our own explanation, as the site promises for past papers; questions that were unclear or
-- flawed in the original were made unambiguous (see the review notes in the pull request).
-- questions.paper = 2026 puts them in the 2026 past paper on /past-papers; their subject and chapter also put them in
-- normal practice, in the MDCAT bank and (except Logical Reasoning) in the NUMS and AKU banks.
-- IDs use a separate block (BIO-9001, CHE-9001, PHY-9001) so they never collide with textbook questions numbered by
-- the BIO, CHE and PHY counters; those counters are left alone. English and Logical Reasoning start their counters here.
-- INSERT OR IGNORE keeps the file safe to run twice; nothing is inserted if the owner's admin account doesn't exist.

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-9001', 'Biology', 'Acellular life', 'HIV and AIDS', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q1. Rebuilt in our own words.', 'What does the abbreviation HIV stand for?', '["Human Immunodeficiency Virus", "Human Internal Virus", "High Impact Virus", "Human Immunogenic Vaccine"]', 0, 'HIV is the Human Immunodeficiency Virus. It destroys helper T cells, weakening the immune system, and causes AIDS.', '{"1": "There is no virus by this name; the ''I'' stands for immunodeficiency.", "2": "Not a real expansion of HIV.", "3": "HIV is a virus, not a vaccine."}'),
  ('BIO-9002', 'Biology', 'Human physiology', 'Digestive system', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q2. Rebuilt in our own words.', 'Which part of the human digestive tract carries food but takes no direct part in its digestion?', '["Mouth", "Oesophagus", "Stomach", "Small intestine"]', 1, 'The oesophagus only moves the bolus to the stomach by peristalsis. It secretes mucus but no digestive enzymes.', '{"0": "Digestion starts in the mouth: chewing plus salivary amylase acting on starch.", "2": "The stomach digests proteins with pepsin and HCl.", "3": "Most chemical digestion and absorption happen in the small intestine."}'),
  ('BIO-9003', 'Biology', 'Coordination and control', 'Receptors', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q3. Rebuilt in our own words.', 'Pacinian corpuscles, the receptors that sense deep pressure, are found in the', '["retina", "lungs", "liver", "skin"]', 3, 'Pacinian corpuscles are pressure receptors lying deep in the dermis of the skin.', '{"0": "The retina contains photoreceptors (rods and cones).", "1": "The lungs have stretch receptors, not Pacinian corpuscles as their sense organ.", "2": "The liver is not a sense organ for pressure."}'),
  ('BIO-9004', 'Biology', 'Coordination and control', 'Receptors', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q4. Rebuilt in our own words.', 'The receptors of the inner ear that detect sound and balance belong to which group?', '["Mechanoreceptors", "Thermoreceptors", "Nociceptors", "Photoreceptors"]', 0, 'Hair cells of the cochlea and of the vestibular apparatus respond to mechanical movement of fluid, so they are mechanoreceptors.', '{"1": "Thermoreceptors respond to temperature change.", "2": "Nociceptors respond to painful (damaging) stimuli.", "3": "Photoreceptors respond to light."}'),
  ('BIO-9005', 'Biology', 'Coordination and control', 'Receptors', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q5. Rebuilt in our own words.', 'The receptors in the nose that detect the smell of food are', '["chemoreceptors", "mechanoreceptors", "nociceptors", "photoreceptors"]', 0, 'Smell is detected when odour molecules bind to olfactory receptors, so these are chemoreceptors (like taste receptors).', '{"1": "Mechanoreceptors respond to touch, pressure, sound and stretch.", "2": "Nociceptors respond to pain.", "3": "Photoreceptors respond to light."}'),
  ('BIO-9006', 'Biology', 'Human physiology', 'Muscles', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q6. Rebuilt in our own words.', 'Which type of muscle is the most abundant voluntary muscle in the human body?', '["Cardiac", "Skeletal", "Smooth", "Smooth and cardiac"]', 1, 'Skeletal muscle is the only voluntary muscle type, and it makes up most of the body''s muscle mass.', '{"0": "Cardiac muscle is involuntary and found only in the heart.", "2": "Smooth muscle is involuntary (gut, blood vessels).", "3": "Both are involuntary."}'),
  ('BIO-9007', 'Biology', 'Biological molecules', 'Types of RNA', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q7. Rebuilt in our own words.', 'Messenger RNA (mRNA) makes up roughly what share of the total RNA in a cell?', '["3-4%", "4-5%", "5-6%", "6-7%"]', 0, 'mRNA is short-lived and makes up only about 3-4% of cellular RNA; rRNA is about 80% and tRNA most of the rest.', '{"1": "Higher than the usual textbook figure of 3-4%.", "2": "Higher than the usual textbook figure of 3-4%.", "3": "Higher than the usual textbook figure of 3-4%."}'),
  ('BIO-9008', 'Biology', 'Human physiology', 'Stomach', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q8. Rebuilt in our own words.', 'The innermost layer of the stomach wall, whose gastric glands secrete enzymes, HCl and mucus, is the', '["submucosa", "mucosa", "muscularis", "serosa"]', 1, 'The mucosa lines the lumen and contains the gastric glands (parietal, chief and mucous cells).', '{"0": "The submucosa is connective tissue with blood vessels and nerves under the mucosa.", "2": "The muscularis is the muscle layer that churns food.", "3": "The serosa is the outer covering."}'),
  ('BIO-9009', 'Biology', 'Evolution', 'Lamarckism', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q9. Rebuilt in our own words.', 'In Lamarck''s theory, traits that an organism develops during its life through the use or disuse of organs are called', '["prominent characters", "biological characters", "acquired characters", "physical characters"]', 2, 'Lamarck proposed the inheritance of acquired characters: features gained during life by use and disuse are passed to the offspring.', '{"0": "Not a term from Lamarck''s theory.", "1": "Too general; not Lamarck''s term.", "3": "Too general; not Lamarck''s term."}'),
  ('BIO-9010', 'Biology', 'Human physiology', 'Bone', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q10. Rebuilt in our own words.', 'The collagen fibres of bone become hard because of deposits of', '["calcium and oxalate", "calcium and phosphate", "magnesium and nitrate", "iron and glycogen"]', 1, 'Bone matrix is hardened by calcium phosphate (hydroxyapatite) crystals laid down on the collagen fibres.', '{"0": "Calcium oxalate is the usual material of kidney stones, not bone.", "2": "Not the mineral of bone.", "3": "Iron is in haemoglobin and glycogen is a stored carbohydrate; neither hardens bone."}'),
  ('BIO-9011', 'Biology', 'Human physiology', 'Peristalsis', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q11. Rebuilt in our own words.', 'Which muscle type moves food along the intestine by peristalsis?', '["Smooth muscle", "Cardiac muscle", "Skeletal muscle", "Skeletal and cardiac muscle"]', 0, 'The gut wall contains involuntary smooth muscle in circular and longitudinal layers, whose waves of contraction (peristalsis) push food along.', '{"1": "Cardiac muscle is found only in the heart.", "2": "Skeletal muscle is only at the two ends of the tract (mouth, upper oesophagus, anus).", "3": "Neither forms the intestinal wall."}'),
  ('BIO-9012', 'Biology', 'Chromosomes and DNA', 'DNA structure', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q12. Rebuilt in our own words.', 'In the Watson-Crick model of DNA, one complete turn of the double helix contains', '["6 base pairs", "8 base pairs", "10 base pairs", "12 base pairs"]', 2, 'In the Watson-Crick (B-DNA) model, each full turn is 3.4 nm long and contains 10 base pairs spaced 0.34 nm apart.', '{"0": "Too few; 3.4 nm ÷ 0.34 nm = 10.", "1": "Too few; 3.4 nm ÷ 0.34 nm = 10.", "3": "Too many; 3.4 nm ÷ 0.34 nm = 10."}'),
  ('BIO-9013', 'Biology', 'Human physiology', 'Mouth', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q13. Rebuilt in our own words.', 'The main purpose of chewing (mastication) is to', '["make the food soft", "moisten the food", "increase the surface area of food for enzymes", "improve the taste"]', 2, 'Chewing breaks food into small pieces, giving digestive enzymes a much larger surface to act on.', '{"0": "Softening happens, but the key purpose is a larger surface area for enzymes.", "1": "Moistening is done mainly by saliva, not by chewing itself.", "3": "Taste is not the purpose of mastication."}'),
  ('BIO-9014', 'Biology', 'Reproduction', 'Menstrual cycle hormones', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q14. Rebuilt in our own words.', 'Which hormone stimulates primary follicles in the ovary to develop?', '["Oestrogen", "Progesterone", "Luteinising hormone (LH)", "Follicle stimulating hormone (FSH)"]', 3, 'FSH from the anterior pituitary stimulates the growth of ovarian follicles, as its name says.', '{"0": "Oestrogen is made by the growing follicle; it does not start follicle development.", "1": "Progesterone comes from the corpus luteum and prepares the uterus.", "2": "LH triggers ovulation and corpus luteum formation."}'),
  ('BIO-9015', 'Biology', 'Coordination and control', 'Neurons', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q15. Rebuilt in our own words.', 'Which feature is typical of the sensory neurons carried in spinal nerves?', '["A single axon only", "A single long dendron", "Many short dendrites", "Many nodes of Ranvier and no dendron"]', 1, 'Sensory neurons have one long dendron carrying impulses from the receptor towards the cell body (which lies in the dorsal root ganglion), and a short axon into the spinal cord.', '{"0": "Every neuron has an axon; that is not what distinguishes sensory neurons.", "2": "Many short dendrites are typical of motor neurons.", "3": "Nodes of Ranvier are on myelinated fibres of many neuron types and do not replace the dendron."}'),
  ('BIO-9016', 'Biology', 'Coordination and control', 'Neurons', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q16. Rebuilt in our own words.', 'Nissl''s granules in a neuron are found in the', '["axoplasm", "myelin sheath", "dendrite tips", "cell body (soma)"]', 3, 'Nissl''s granules are clusters of ribosomes (rough ER) in the cell body, where the neuron makes its proteins.', '{"0": "The axon lacks Nissl''s granules.", "1": "The myelin sheath is made by Schwann cells, not the neuron''s cytoplasm.", "2": "They are concentrated in the soma."}'),
  ('BIO-9017', 'Biology', 'Coordination and control', 'Brain', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q17. Rebuilt in our own words.', 'Which is a function of the cerebellum?', '["Acting as a relay station for sensory impulses", "Turning short-term memories into long-term memories", "Coordinating smooth, accurate movements and maintaining posture", "Linking the nervous and endocrine systems"]', 2, 'The cerebellum coordinates muscle activity so movements are smooth and accurate, and it maintains balance and posture.', '{"0": "The thalamus is the relay station.", "1": "The hippocampus (limbic system) converts short-term to long-term memory.", "3": "The hypothalamus links the nervous and endocrine systems."}'),
  ('BIO-9018', 'Biology', 'Immunity', 'Specific defence', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q18. Rebuilt in our own words.', 'Which blood cells are mainly responsible for specific immunity?', '["Erythrocytes", "Thrombocytes", "Neutrophils", "Lymphocytes"]', 3, 'Specific immunity is carried out by lymphocytes: B cells make antibodies and T cells destroy infected cells or help other cells.', '{"0": "Red cells carry oxygen.", "1": "Platelets help clotting.", "2": "Neutrophils are phagocytes of non-specific defence."}'),
  ('BIO-9019', 'Biology', 'Enzymes', 'Inhibition', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q19. Rebuilt in our own words.', 'Which kind of enzyme inhibition can be overcome by raising the substrate concentration?', '["Non-competitive inhibition", "Competitive inhibition", "Irreversible inhibition", "Allosteric inhibition"]', 1, 'A competitive inhibitor competes with the substrate for the active site; more substrate out-competes it and restores the rate.', '{"0": "A non-competitive inhibitor binds elsewhere and changes the enzyme, so extra substrate cannot help.", "2": "An irreversible inhibitor binds permanently.", "3": "An allosteric inhibitor binds at another site, so extra substrate does not reverse it."}'),
  ('BIO-9020', 'Biology', 'Chromosomes and DNA', 'Chromosome number', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q20. Rebuilt in our own words.', 'The sperm of an animal contains 8 chromosomes. How many chromosomes are in its body cells?', '["4", "16", "24", "32"]', 1, 'Sperm are haploid (n = 8), so body cells are diploid: 2n = 16.', '{"0": "That would be half the haploid number.", "2": "That would be triploid (3n).", "3": "That would be tetraploid (4n)."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-9021', 'Biology', 'Cell structure and function', 'Golgi apparatus', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q21. Rebuilt in our own words.', 'Which description fits the Golgi apparatus?', '["Site of energy production", "Centre that modifies and packs cell products", "Store of genetic material", "Site of protein synthesis"]', 1, 'The Golgi apparatus modifies, sorts and packages proteins and lipids into vesicles for secretion or for use in the cell.', '{"0": "Energy (ATP) production is the job of mitochondria.", "2": "Genetic material is stored in the nucleus.", "3": "Proteins are made on ribosomes."}'),
  ('BIO-9022', 'Biology', 'Evolution', 'Natural selection', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q22. Rebuilt in our own words.', 'Offspring of the better-adapted individuals in a population form a larger share of each new generation. This is best explained by', '["mutation", "inheritance of acquired characters", "natural selection", "genetic drift"]', 2, 'Natural selection: individuals with favourable heritable traits survive and reproduce more, so their traits become more common.', '{"0": "Mutation creates new variation but does not by itself favour adapted individuals.", "1": "This is Lamarck''s idea and is not supported.", "3": "Genetic drift is a random change in allele frequency, not linked to adaptation."}'),
  ('BIO-9023', 'Biology', 'Homeostasis', 'Thermoregulation', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q23. Rebuilt in our own words.', 'Which body system directly starts shivering when the body gets cold?', '["Respiratory system", "Circulatory system", "Nervous system", "Digestive system"]', 2, 'The hypothalamus senses the fall in temperature and sends nerve impulses to skeletal muscles, which contract rapidly (shiver) to make heat.', '{"0": "Breathing does not start shivering.", "1": "The blood carries heat but does not command the muscles.", "3": "Digestion is not involved."}'),
  ('BIO-9024', 'Biology', 'Human physiology', 'Pancreatic enzymes', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q24. Rebuilt in our own words.', 'If enterokinase is missing from the small intestine, which enzyme stays inactive?', '["Pepsinogen", "Trypsinogen", "Amylase", "Lipase"]', 1, 'Enterokinase from the intestinal wall converts inactive trypsinogen into active trypsin.', '{"0": "Pepsinogen is activated by HCl in the stomach.", "2": "Amylase is secreted in active form.", "3": "Lipase is secreted in active form (helped by bile)."}'),
  ('BIO-9025', 'Biology', 'Coordination and control', 'Neurotransmitters', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q25. Rebuilt in our own words.', 'Which neurotransmitter works widely outside the brain, for example at neuromuscular junctions?', '["Dopamine", "Serotonin", "Acetylcholine", "Melatonin"]', 2, 'Acetylcholine is released at neuromuscular junctions and in the autonomic nervous system, as well as in the brain.', '{"0": "Dopamine acts mainly in the brain.", "1": "Serotonin acts mainly in the brain (as a neurotransmitter).", "3": "Melatonin is a hormone of the pineal gland, not a neurotransmitter."}'),
  ('BIO-9026', 'Biology', 'Homeostasis', 'Excretion', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q26. Rebuilt in our own words.', 'In the liver, ammonia released by deamination of amino acids is turned into urea by the', '["carbon cycle", "glycolysis", "urea (ornithine) cycle", "Krebs cycle"]', 2, 'Toxic ammonia is combined with CO2 in the ornithine (urea) cycle in liver cells to form less toxic urea.', '{"0": "The carbon cycle is an ecological cycle.", "1": "Glycolysis breaks down glucose.", "3": "The Krebs cycle oxidises acetyl CoA."}'),
  ('BIO-9027', 'Biology', 'Human physiology', 'Absorption', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q27. Rebuilt in our own words.', 'The lymph capillary inside each intestinal villus is called a', '["microvillus", "brush border", "lacteal", "lymph node"]', 2, 'Each villus has a central lacteal that absorbs fats (as chylomicrons) into the lymph.', '{"0": "Microvilli are tiny folds of the surface cells.", "1": "The brush border is the microvilli surface.", "3": "Lymph nodes are along lymph vessels, not inside villi."}'),
  ('BIO-9028', 'Biology', 'Chromosomes and DNA', 'Protein synthesis', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q28. Rebuilt in our own words.', 'Translation takes place when mRNA, after leaving the nucleus, is read at the', '["nucleolus", "ribosome", "Golgi apparatus", "lysosome"]', 1, 'mRNA carries the code from the nucleus to ribosomes in the cytoplasm, where tRNAs bring amino acids and the protein is built.', '{"0": "The nucleolus makes ribosomal RNA; translation is in the cytoplasm.", "2": "The Golgi modifies proteins after they are made.", "3": "Lysosomes digest materials."}'),
  ('BIO-9029', 'Biology', 'Homeostasis', 'Nitrogenous wastes', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q29. Rebuilt in our own words.', 'Which nitrogenous waste needs the least water for its excretion?', '["Ammonia", "Urea", "Uric acid", "Creatinine"]', 2, 'Uric acid is the least toxic and is nearly insoluble, so it can be excreted as a paste with very little water.', '{"0": "Ammonia is very toxic and needs a lot of water to dilute it.", "1": "Urea needs moderate water.", "3": "Creatinine is a minor waste, not the water-saving form."}'),
  ('BIO-9030', 'Biology', 'Homeostasis', 'Kidney stones', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q30. Rebuilt in our own words.', 'Kidney stones mainly form because of', '["low filtration in Bowman''s capsule", "protein breakdown in the stomach", "high blood glucose", "a high level of calcium in the blood"]', 3, 'Most kidney stones are calcium oxalate or calcium phosphate. High calcium in blood and urine (hypercalciuria) lets these salts crystallise.', '{"0": "Filtration rate is not the main cause.", "1": "Gastric protein digestion does not form kidney stones.", "2": "High glucose is linked to diabetes, not stone formation."}'),
  ('BIO-9031', 'Biology', 'Acellular life', 'Virus structure', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q31. Rebuilt in our own words.', 'The protein units that repeat to build a virus''s protein coat are called', '["nucleic acids", "capsomeres", "the core", "the envelope"]', 1, 'The capsid is built from many identical protein subunits called capsomeres.', '{"0": "The nucleic acid is the genome inside the capsid.", "2": "The core is the nucleic acid inside.", "3": "The envelope is a lipid membrane around some viruses."}'),
  ('BIO-9032', 'Biology', 'Inheritance', 'Sex-linked inheritance', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q32. Rebuilt in our own words.', 'A man with haemophilia can pass the haemophilia gene to', '["his sons only", "his daughters only", "sons and daughters equally", "sons and daughters in a 2:1 ratio"]', 1, 'Haemophilia is X-linked recessive. A father gives his X to every daughter and his Y to every son, so only daughters receive the gene.', '{"0": "Sons get the father''s Y chromosome, not his X.", "2": "Sons never receive the father''s X.", "3": "Sons never receive the father''s X."}'),
  ('BIO-9033', 'Biology', 'Biotechnology', 'cDNA', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q33. Rebuilt in our own words.', 'Which enzyme makes complementary DNA (cDNA) from an RNA template?', '["Restriction endonuclease", "Reverse transcriptase", "DNA ligase", "Helicase"]', 1, 'Reverse transcriptase copies RNA into DNA; it is used to make cDNA from mRNA.', '{"0": "Restriction enzymes cut DNA at specific sequences.", "2": "Ligase joins DNA fragments.", "3": "Helicase unwinds DNA."}'),
  ('BIO-9034', 'Biology', 'Cell structure and function', 'Prokaryotes', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q34. Rebuilt in our own words.', 'Which of these is ABSENT from prokaryotic cells?', '["Mitochondria", "Circular DNA", "Ribosomes", "Cell membrane"]', 0, 'Prokaryotes have no membrane-bound organelles, so they lack mitochondria; respiration happens on the cell membrane.', '{"1": "Prokaryotes do have circular DNA.", "2": "Prokaryotes have (70S) ribosomes.", "3": "All cells have a cell membrane."}'),
  ('BIO-9035', 'Biology', 'Coordination and control', 'Resting potential', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q35. Rebuilt in our own words.', 'The resting membrane potential of an unstimulated neuron is about', '["-50 mV", "+50 mV", "-70 mV", "+70 mV"]', 2, 'At rest the inside of the neuron is about 70 mV negative relative to the outside.', '{"0": "Around -50 mV is near the threshold, not the resting value.", "1": "The inside is negative at rest.", "3": "The inside is negative at rest."}'),
  ('BIO-9036', 'Biology', 'Human physiology', 'Joint disorders', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q36. Rebuilt in our own words.', 'Which joint disease is linked with a reduced amount of synovial fluid?', '["Gout", "Arthritis", "Rickets", "Sciatica"]', 1, 'In arthritis (especially osteoarthritis) the joint has less synovial fluid and its cartilage wears, causing friction, pain and stiffness.', '{"0": "Gout is caused by uric acid crystals in joints.", "2": "Rickets is soft bones from vitamin D deficiency.", "3": "Sciatica is pain from pressure on the sciatic nerve."}'),
  ('BIO-9037', 'Biology', 'Coordination and control', 'Neurons', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q37. Rebuilt in our own words.', 'The gaps along an axon where there is no myelin sheath are called', '["nodes of Ranvier", "Schwann cells", "neuroglia", "dendrons"]', 0, 'Nodes of Ranvier are the unmyelinated gaps between Schwann cells; impulses jump between them (saltatory conduction).', '{"1": "Schwann cells make the myelin.", "2": "Neuroglia are supporting cells of the nervous system.", "3": "A dendron carries impulses towards the cell body."}'),
  ('BIO-9038', 'Biology', 'Enzymes', 'Factors affecting enzymes', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q38. Rebuilt in our own words.', 'Which condition denatures enzymes and so slows catalysis?', '["Low temperature", "High temperature", "High water content", "Low water content"]', 1, 'High temperature breaks the bonds holding the enzyme''s shape, so the active site is lost (denaturation).', '{"0": "Low temperature only slows the enzyme; it does not denature it.", "2": "Water is needed for enzyme action.", "3": "Low water reduces activity but does not denature the enzyme."}'),
  ('BIO-9039', 'Biology', 'Human physiology', 'Gastric glands', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q39. Rebuilt in our own words.', 'The parietal (oxyntic) cells of the gastric glands secrete', '["hydrochloric acid", "pepsinogen", "mucus", "gastrin"]', 0, 'Parietal cells secrete HCl (and intrinsic factor).', '{"1": "Pepsinogen comes from chief (peptic) cells.", "2": "Mucus comes from mucous cells.", "3": "Gastrin comes from G cells (endocrine)."}'),
  ('BIO-9040', 'Biology', 'Human physiology', 'Stomach', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q40. Rebuilt in our own words.', 'Pepsinogen is converted into active pepsin because of', '["low pH (HCl)", "high pH", "optimum temperature", "freezing temperature"]', 0, 'The HCl in gastric juice gives a low pH, which converts inactive pepsinogen into pepsin.', '{"1": "A high (alkaline) pH would inactivate pepsin.", "2": "Body temperature does not by itself activate pepsinogen.", "3": "Freezing stops enzyme activity."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-9041', 'Biology', 'Cell structure and function', 'Mitochondria', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q41. Rebuilt in our own words.', 'A cell pumps substances against their concentration gradient and needs a steady supply of ATP to do so. Which organelle supplies this energy?', '["Nucleus", "Mitochondrion", "Golgi apparatus", "Endoplasmic reticulum"]', 1, 'Active transport uses ATP, and most ATP is made by aerobic respiration in mitochondria.', '{"0": "The nucleus controls the cell but does not make ATP.", "2": "The Golgi packs and modifies products.", "3": "The ER makes and transports proteins and lipids."}'),
  ('BIO-9042', 'Biology', 'Acellular life', 'Classification of viruses', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q42. Rebuilt in our own words.', 'Viruses are mainly classified on the basis of their', '["colour and size only", "structure and type of nucleic acid", "habitat only", "temperature tolerance"]', 1, 'Viruses are grouped by their structure (shape of capsid, envelope) and their genome (DNA or RNA, single or double stranded), along with host.', '{"0": "Viruses have no colour, and size alone is not the basis.", "2": "Viruses live only inside host cells; habitat is not the basis.", "3": "Not a basis of classification."}'),
  ('BIO-9043', 'Biology', 'Inheritance', 'Linkage', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q43. Rebuilt in our own words.', 'When two genes are described as ''linked'', it means they', '["occupy the same locus on a chromosome", "are on the same chromosome", "are alleles of the same gene", "have phenotypes that depend on the sex of the organism"]', 1, 'Linked genes lie on the same chromosome, so they tend to be inherited together unless crossing over separates them.', '{"0": "Two different genes cannot share one locus; alleles of one gene share a locus.", "2": "Alleles are versions of one gene, not two linked genes.", "3": "That describes sex-linked or sex-limited traits, not linkage."}'),
  ('BIO-9044', 'Biology', 'Cell structure and function', 'Ribosomes', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q44. Rebuilt in our own words.', 'How do ribosomes of prokaryotes and eukaryotes compare?', '["Both have 80S ribosomes", "Prokaryotes 80S, eukaryotes 70S", "Prokaryotes 70S, eukaryotes 80S", "Neither has ribosomes"]', 2, 'Prokaryotic ribosomes are smaller (70S); eukaryotic cytoplasmic ribosomes are 80S.', '{"0": "Prokaryotes have the smaller 70S type.", "1": "This reverses the two.", "3": "Both kinds of cell make proteins on ribosomes."}'),
  ('BIO-9045', 'Biology', 'Homeostasis', 'Nephron', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q45. Rebuilt in our own words.', 'What is the main function of the peritubular capillaries around a nephron?', '["Taking oxygen from kidney cells", "Supplying carbon dioxide to kidney cells", "Reabsorbing urea", "Taking back useful substances reabsorbed from the tubule"]', 3, 'Peritubular capillaries surround the tubule and carry back into the blood the useful substances (glucose, amino acids, salts, water) reabsorbed from the filtrate.', '{"0": "Capillaries deliver oxygen to tissues, not take it from them.", "1": "Capillaries remove CO2 from cells, not supply it.", "2": "Urea is mostly left in the filtrate to be excreted; reabsorbing it is not the main role."}'),
  ('BIO-9046', 'Biology', 'Inheritance', 'Linkage', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q46. Rebuilt in our own words.', 'Which of these reduces variation among offspring?', '["Meiosis", "Epistasis", "Crossing over", "Gene linkage"]', 3, 'Linked genes are inherited together, so fewer new combinations (recombinants) appear in the offspring.', '{"0": "Meiosis creates variation through independent assortment and crossing over.", "1": "Epistasis changes phenotype ratios but does not reduce variation.", "2": "Crossing over increases variation by making recombinants."}'),
  ('BIO-9047', 'Biology', 'Coordination and control', 'Reflex arc', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q47. Rebuilt in our own words.', 'In a reflex action, nerve impulses travel', '["from the CNS to effectors and from the CNS to receptors", "from effectors to the CNS and from the CNS to receptors", "from receptors to the CNS and from the CNS to effectors", "from the CNS to receptors and from effectors to the CNS"]', 2, 'Receptor → sensory neuron → CNS (relay neuron) → motor neuron → effector.', '{"0": "Impulses do not travel from the CNS to receptors.", "1": "This reverses the direction of the arc.", "3": "This reverses the direction of the arc."}'),
  ('BIO-9048', 'Biology', 'Homeostasis', 'Nephron', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q48. Rebuilt in our own words.', 'Which blood vessel carries blood away from the glomerulus after filtration?', '["Renal artery", "Renal vein", "Afferent arteriole", "Efferent arteriole"]', 3, 'The efferent arteriole leaves the glomerulus and then branches into the peritubular capillaries.', '{"0": "The renal artery brings blood to the kidney.", "1": "The renal vein drains the whole kidney, later.", "2": "The afferent arteriole brings blood into the glomerulus."}'),
  ('BIO-9049', 'Biology', 'Coordination and control', 'Nervous system', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q49. Rebuilt in our own words.', 'Ganglia are clusters of', '["complete neurons", "cell bodies of neurons", "axon fibres", "axons and dendrites"]', 1, 'Ganglia are groups of neuron cell bodies lying outside the CNS, such as the dorsal root ganglia.', '{"0": "They hold cell bodies, not whole neurons with their fibres.", "2": "Bundles of axons form nerves.", "3": "Bundles of fibres form nerves, not ganglia."}'),
  ('BIO-9050', 'Biology', 'Human physiology', 'Muscle contraction', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q50. Rebuilt in our own words.', 'When a nerve impulse reaches a muscle fibre, which structure releases calcium ions into the cytosol?', '["Sarcolemma", "Sarcomere", "Sarcoplasmic reticulum", "Myofilaments"]', 2, 'The impulse spreads through T-tubules and makes the sarcoplasmic reticulum release its stored Ca2+, which starts contraction.', '{"0": "The sarcolemma carries the impulse but is not the calcium store.", "1": "The sarcomere is the contractile unit.", "3": "Actin and myosin filaments contract; they do not store calcium."}'),
  ('BIO-9051', 'Biology', 'Reproduction', 'Corpus luteum', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q51. Rebuilt in our own words.', 'Which hormone is produced by the corpus luteum?', '["Luteinising hormone", "Progesterone", "Testosterone", "Secretin"]', 1, 'The corpus luteum secretes progesterone (and some oestrogen) to keep the uterine lining ready for pregnancy.', '{"0": "LH comes from the anterior pituitary.", "2": "Testosterone comes from the testes.", "3": "Secretin comes from the duodenum."}'),
  ('BIO-9052', 'Biology', 'Homeostasis', 'Glomerular filtration', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q52. Rebuilt in our own words.', 'Which group of substances is filtered from the blood into Bowman''s capsule?', '["Glucose, proteins, salts and water", "Glucose, proteins, urea and water", "Glucose, salts, urea and water", "Proteins, salts, urea and water"]', 2, 'Small molecules (glucose, salts, urea, water) pass through the glomerular membrane; plasma proteins and blood cells are too large and stay in the blood.', '{"0": "Proteins are too large to be filtered.", "1": "Proteins are too large to be filtered.", "3": "Proteins are too large to be filtered."}'),
  ('BIO-9053', 'Biology', 'Immunity', 'Antibodies', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q53. Rebuilt in our own words.', 'Which cells are mainly responsible for making antibodies?', '["T lymphocytes", "B lymphocytes", "Macrophages", "Platelets"]', 1, 'B lymphocytes become plasma cells, which secrete antibodies.', '{"0": "T cells give cell-mediated immunity and do not make antibodies.", "2": "Macrophages engulf pathogens and present antigens.", "3": "Platelets help clotting."}'),
  ('BIO-9054', 'Biology', 'Human physiology', 'Lymphatic system', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q54. Rebuilt in our own words.', 'A patient has a swelling where lymph is being screened for pathogens and immune cells are multiplying fast. Which structure is this?', '["Spleen", "Lymph node", "Lymphatic duct", "Lymph capillary"]', 1, 'Lymph nodes filter lymph; during infection lymphocytes multiply in them and they swell (''swollen glands'').', '{"0": "The spleen filters blood, not lymph.", "2": "Lymphatic ducts only carry lymph back to the veins.", "3": "Lymph capillaries collect fluid; they do not filter it."}'),
  ('BIO-9055', 'Biology', 'Human physiology', 'Heart', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q55. Rebuilt in our own words.', 'Which chamber of the heart has the thickest muscular wall?', '["Right atrium", "Right ventricle", "Left atrium", "Left ventricle"]', 3, 'The left ventricle pumps blood around the whole body (systemic circulation), so it has the thickest wall.', '{"0": "Atria only push blood into the ventricles, so their walls are thin.", "1": "The right ventricle pumps only to the lungs.", "2": "Atria have thin walls."}'),
  ('BIO-9056', 'Biology', 'Human physiology', 'Large intestine', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q56. Rebuilt in our own words.', 'A person has a disease of the colon. Absorption of which substance is most likely to be affected?', '["Glucose", "Water", "Fats", "Amino acids"]', 1, 'The colon''s main job is to absorb water (and some salts) from the remaining food.', '{"0": "Glucose is absorbed in the small intestine.", "2": "Fats are absorbed in the small intestine.", "3": "Amino acids are absorbed in the small intestine."}'),
  ('BIO-9057', 'Biology', 'Reproduction', 'Male reproductive system', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q57. Rebuilt in our own words.', 'In males, testosterone is made by the', '["interstitial (Leydig) cells", "Sertoli cells", "spermatogonia", "primary spermatocytes"]', 0, 'Leydig cells, between the seminiferous tubules, secrete testosterone when stimulated by LH.', '{"1": "Sertoli cells nourish developing sperm.", "2": "Spermatogonia are sperm stem cells.", "3": "Primary spermatocytes divide by meiosis to form sperm."}'),
  ('BIO-9058', 'Biology', 'Human physiology', 'Lymphatic system', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q58. Rebuilt in our own words.', 'Which is a function of the lymphatic system?', '["Absorbing glucose from the intestine", "Clotting blood after injury", "Filtering out and destroying germs and toxins", "Regulating body temperature"]', 2, 'Lymph nodes filter lymph and their lymphocytes and macrophages destroy pathogens. The system also returns tissue fluid and absorbs fats.', '{"0": "Glucose enters blood capillaries of the villi, not the lymph.", "1": "Clotting is done by platelets and clotting factors.", "3": "Temperature is regulated by the hypothalamus, skin and blood flow."}'),
  ('BIO-9059', 'Biology', 'Reproduction', 'Menstrual cycle hormones', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q59. Rebuilt in our own words.', 'In the menstrual cycle, a sudden surge of LH causes', '["menstruation", "ovulation", "fertilisation", "implantation of the embryo"]', 1, 'The mid-cycle LH surge makes the mature follicle burst and release the egg (ovulation).', '{"0": "Menstruation follows a fall in progesterone and oestrogen.", "2": "Fertilisation needs a sperm meeting the egg.", "3": "Implantation happens about a week after fertilisation."}'),
  ('BIO-9060', 'Biology', 'Bioenergetics', 'Krebs cycle', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q60. Rebuilt in our own words.', 'The main products of the Krebs cycle are', '["glucose and oxygen", "NADH and FADH2 (with CO2)", "ATP and G3P", "pyruvate and acetyl CoA"]', 1, 'Each turn oxidises acetyl CoA, releasing CO2 and making reduced coenzymes (3 NADH, 1 FADH2) plus 1 ATP/GTP. The NADH and FADH2 feed the electron transport chain.', '{"0": "Glucose and oxygen are made in photosynthesis.", "2": "G3P is made in glycolysis and the Calvin cycle.", "3": "Pyruvate and acetyl CoA are made before the cycle."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-9061', 'Biology', 'Human physiology', 'Heart valves', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q61. Rebuilt in our own words.', 'A surgeon repairs the heart valve that stops blood flowing back into the right ventricle. Which valve is it?', '["Mitral (bicuspid) valve", "Aortic semilunar valve", "Tricuspid valve", "Pulmonary semilunar valve"]', 3, 'Blood leaves the right ventricle through the pulmonary artery. The pulmonary semilunar valve at its base stops blood from flowing back into the right ventricle.', '{"0": "The mitral valve is between the left atrium and left ventricle.", "1": "The aortic valve guards the left ventricle.", "2": "The tricuspid valve stops backflow from the right ventricle into the right atrium."}'),
  ('BIO-9062', 'Biology', 'Human physiology', 'Bile', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q62. Rebuilt in our own words.', 'Bile salts help in the digestion of', '["proteins", "fats", "nucleic acids", "carbohydrates"]', 1, 'Bile salts emulsify fats into tiny droplets, giving lipase a larger surface to digest them into fatty acids and glycerol.', '{"0": "Proteins are digested by proteases without bile.", "2": "Nucleic acids are digested by nucleases.", "3": "Carbohydrates are digested by amylase and other carbohydrases."}'),
  ('BIO-9063', 'Biology', 'Human physiology', 'Pancreatic enzymes', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q63. Rebuilt in our own words.', 'The exocrine pancreas secretes which enzyme for digesting carbohydrates?', '["Lipase", "Trypsin", "Enterokinase", "Amylase"]', 3, 'Pancreatic amylase digests starch into maltose in the duodenum.', '{"0": "Lipase digests fats.", "1": "Trypsin digests proteins.", "2": "Enterokinase is made by the intestinal wall and activates trypsinogen."}'),
  ('BIO-9064', 'Biology', 'Human physiology', 'Digestive hormones', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q64. Rebuilt in our own words.', 'Endocrine cells of the duodenum release the hormone secretin when they are stimulated by', '["acetylcholine", "acidic chyme", "bile salts", "sodium bicarbonate"]', 1, 'Acid chyme entering the duodenum triggers secretin, which makes the pancreas release bicarbonate-rich juice to neutralise the acid.', '{"0": "Acetylcholine is a neurotransmitter, not the trigger for secretin.", "2": "Bile salts are not the stimulus.", "3": "Bicarbonate is the response to secretin, not its trigger."}'),
  ('BIO-9065', 'Biology', 'Human physiology', 'Heart', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q65. Rebuilt in our own words.', 'The chordae tendineae of the heart are', '["blood vessels", "fibrous cords", "bands of cardiac muscle", "epithelial tissue"]', 1, 'Chordae tendineae are fibrous cords that tie the cusps of the atrioventricular valves to the papillary muscles so the valves do not turn inside out.', '{"0": "They carry no blood.", "2": "They attach to papillary muscles but are themselves fibrous.", "3": "They are connective tissue, not epithelium."}'),
  ('BIO-9066', 'Biology', 'Inheritance', 'Monohybrid cross', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q66. Rebuilt in our own words.', 'Two heterozygous round-seeded pea plants (Rr × Rr) are crossed. What will the offspring be?', '["100% round", "50% round, 50% wrinkled", "75% round, 25% wrinkled", "100% wrinkled"]', 2, 'Rr × Rr gives RR : Rr : rr = 1 : 2 : 1. RR and Rr are round, so 3/4 round and 1/4 wrinkled.', '{"0": "That would need at least one RR parent.", "1": "That is a test cross (Rr × rr).", "3": "That would need both parents rr."}'),
  ('BIO-9067', 'Biology', 'Cell structure and function', 'Endoplasmic reticulum', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q67. Rebuilt in our own words.', 'Which structure provides channels for transporting proteins from the nucleus region to other organelles?', '["Endoplasmic reticulum", "Mitochondria", "Golgi complex", "Nuclear membrane"]', 0, 'The ER is a network of channels continuous with the outer nuclear membrane; it carries proteins through the cytoplasm towards the Golgi and other parts.', '{"1": "Mitochondria make ATP.", "2": "The Golgi receives proteins from the ER; it does not form the transport channels.", "3": "The nuclear membrane encloses the nucleus; the channels are the ER."}'),
  ('BIO-9068', 'Biology', 'Immunity', 'Immunological memory', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q68. Rebuilt in our own words.', 'The immune system''s ability to respond faster and more strongly to an antigen it has met before is called', '["the primary immune response", "immunological memory", "short-term memory", "long-term memory"]', 1, 'Memory B and T cells made during the first exposure give a rapid, larger secondary response. This is immunological memory.', '{"0": "The primary response is the first, slower one.", "2": "A brain function term, not immunology.", "3": "A brain function term, not immunology."}'),
  ('BIO-9069', 'Biology', 'Chromosomes and DNA', 'Genetic code', 'hard', 'UHS MDCAT 2026 (Punjab), Paper A, Q69. Rebuilt in our own words.', 'Amino acids X, Y and Z have mRNA codons UCA (X), ACU (Y) and GUC (Z). Which DNA coding (sense) strand codes for the polypeptide Y-X-Y-Y-X-Z-Z-X-Z-Y?', '["5''-ACUUCAACUACUUCAGUCGUCUCAGUCACU-3''", "5''-ACTTCAACTACTTCAGTCGTCTCAGTCACT-3''", "3''-TGAAGTTGATGAAGTCAGCAGAGTCAGTGA-5''", "3''-UGAAGUUGAUGAAGUCAGCAGAGUCAGUGA-5''"]', 1, 'The coding strand has the same sequence as the mRNA, written 5''→3'', but with T in place of U. mRNA = ACU UCA ACU ACU UCA GUC GUC UCA GUC ACU, so the coding strand is 5''-ACTTCAACTACTTCAGTCGTCTCAGTCACT-3''.', '{"0": "This is the mRNA itself; DNA has T, not U.", "2": "This is the template (antisense) strand, complementary to the mRNA.", "3": "DNA never contains U."}'),
  ('BIO-9070', 'Biology', 'Evolution', 'Lamarckism', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q70. Rebuilt in our own words.', 'Which of these ideas was NOT proposed by Lamarck?', '["Use and disuse of organs", "Inheritance of acquired characters", "Unused organs become vestigial", "Overproduction of offspring drives evolution"]', 3, 'Overproduction and the struggle for existence are part of Darwin''s theory of natural selection, not Lamarck''s.', '{"0": "This is Lamarck''s first idea.", "1": "This is Lamarck''s central idea.", "2": "Lamarck said disuse makes organs shrink and become vestigial."}'),
  ('BIO-9071', 'Biology', 'Enzymes', 'Rate of reaction', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q71. Rebuilt in our own words.', 'In an enzyme experiment, raising the substrate concentration increases the rate until it levels off. At that point, which change will most effectively raise the rate further?', '["Adding more substrate", "Lowering the temperature", "Adding more enzyme", "Adding a non-competitive inhibitor"]', 2, 'At the plateau all active sites are occupied, so the enzyme is limiting. Adding more enzyme provides more active sites and increases the rate.', '{"0": "The enzyme is saturated, so extra substrate has no effect.", "1": "Lowering temperature slows the reaction.", "3": "An inhibitor lowers the rate."}'),
  ('BIO-9072', 'Biology', 'Biological molecules', 'Protein structure', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q72. Rebuilt in our own words.', 'Which interaction helps hold polypeptide chains together in a protein''s quaternary structure?', '["1,4-glycosidic bond", "Hydrophobic interaction", "Ester bond", "1,6-glycosidic bond"]', 1, 'Quaternary structure is held by the same weak interactions as tertiary structure: hydrophobic interactions, hydrogen bonds, ionic bonds (and some disulphide bridges).', '{"0": "Glycosidic bonds join sugars, not polypeptides.", "2": "Ester bonds are found in lipids.", "3": "Glycosidic bonds join sugars (as at glycogen branch points)."}'),
  ('BIO-9073', 'Biology', 'Coordination and control', 'Brain', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q73. Rebuilt in our own words.', 'Which part of the brain controls heart rate and breathing?', '["Cerebellum", "Hypothalamus", "Medulla oblongata", "Cerebrum"]', 2, 'The medulla oblongata contains the cardiac, respiratory and vasomotor centres.', '{"0": "The cerebellum coordinates movement and balance.", "1": "The hypothalamus controls temperature, thirst, hunger and hormones.", "3": "The cerebrum handles thought, senses and voluntary action."}'),
  ('BIO-9074', 'Biology', 'Human physiology', 'Muscle contraction', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q74. Rebuilt in our own words.', 'In a resting muscle, ______ lies over the binding sites on the ______ filament, where the heads of ______ would attach.', '["tropomyosin; actin; myosin", "myosin; actin; tropomyosin", "actin; tropomyosin; myosin", "actin; myosin; tropomyosin"]', 0, 'At rest, tropomyosin covers the myosin-binding sites on actin. When Ca2+ binds troponin, tropomyosin moves aside and myosin heads can attach.', '{"1": "Myosin heads bind the sites; myosin does not cover them.", "2": "Actin carries the sites; it does not cover them.", "3": "Myosin is the filament whose heads attach, not the one carrying the sites."}'),
  ('BIO-9075', 'Biology', 'Inheritance', 'Monohybrid cross', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q75. Rebuilt in our own words.', 'Green is dominant over yellow. If two true-breeding parents are crossed and the F1 is self-crossed, what percentage of the F2 is homozygous?', '["0%", "25%", "50%", "75%"]', 2, 'F1 is Gg. Gg × Gg gives GG 25%, Gg 50%, gg 25%. Homozygotes are GG + gg = 50%.', '{"0": "Both GG and gg appear in the F2.", "1": "25% counts only one kind of homozygote.", "3": "75% is the proportion showing the dominant phenotype."}'),
  ('BIO-9076', 'Biology', 'Human physiology', 'Respiratory system', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q76. Rebuilt in our own words.', 'The walls of human bronchioles contain', '["C-shaped cartilage rings", "cartilage plates", "circular smooth muscle", "longitudinal smooth muscle"]', 2, 'Bronchioles have no cartilage; their walls are mainly circular smooth muscle, which can narrow or widen the airway.', '{"0": "C-shaped rings are in the trachea.", "1": "Cartilage plates are in the bronchi, not bronchioles.", "3": "The muscle in bronchioles is arranged circularly."}'),
  ('BIO-9077', 'Biology', 'Human physiology', 'Cartilage', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q77. Rebuilt in our own words.', 'Which cartilage is found in the ribs, nose and trachea?', '["Hyaline cartilage", "Elastic cartilage", "Fibrocartilage", "Osteoblast"]', 0, 'Hyaline cartilage, the most common type, forms the costal cartilages, nose, trachea rings and ends of long bones.', '{"1": "Elastic cartilage is in the ear pinna and epiglottis.", "2": "Fibrocartilage is in intervertebral discs.", "3": "An osteoblast is a bone-forming cell, not a cartilage."}'),
  ('BIO-9078', 'Biology', 'Reproduction', 'Corpus luteum', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q78. Rebuilt in our own words.', 'If the corpus luteum breaks down too early in pregnancy, the most likely result is', '["more ovulation and fertilisation", "more LH secretion and release of an extra egg", "higher oestrogen secretion", "failed implantation and loss of the pregnancy"]', 3, 'The corpus luteum''s progesterone keeps the uterine lining in place. If it degenerates early, progesterone falls, the lining breaks down and the embryo cannot stay implanted.', '{"0": "Pregnancy hormones suppress ovulation.", "1": "Corpus luteum loss does not cause release of an extra egg.", "2": "Oestrogen falls along with progesterone."}'),
  ('BIO-9079', 'Biology', 'Human physiology', 'Circulation', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q79. Rebuilt in our own words.', 'Which vein carries blood from the small intestine to the liver?', '["Renal vein", "Hepatic portal vein", "Iliac vein", "Hepatic vein"]', 1, 'The hepatic portal vein carries absorbed nutrients from the gut to the liver.', '{"0": "The renal vein drains the kidney.", "2": "The iliac veins drain the legs and pelvis.", "3": "The hepatic vein carries blood from the liver to the vena cava."}'),
  ('BIO-9080', 'Biology', 'Inheritance', 'Segregation', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q80. Rebuilt in our own words.', 'In eukaryotes, the alleles of a gene separate (segregate) from each other during', '["mitosis", "binary fission", "meiosis", "DNA replication before division"]', 2, 'Homologous chromosomes, carrying the two alleles, separate in anaphase I of meiosis, so each gamete gets one allele (Mendel''s law of segregation).', '{"0": "Mitosis gives daughter cells both alleles.", "1": "Binary fission is prokaryotic division.", "3": "Replication copies DNA; it does not separate alleles."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('BIO-9081', 'Biology', 'Inheritance', 'Linkage and crossing over', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q81. Rebuilt in our own words.', 'In dihybrid crosses of sweet pea with two linked genes, a few offspring show non-parental phenotypes. The best explanation is that', '["crossing over produced recombinant gametes", "the experimenters contaminated the pollen", "independent assortment made unusual phenotypes", "only plants of one sex show the parental phenotypes"]', 0, 'Linked genes usually stay together, but crossing over between them in prophase I makes recombinant gametes, giving a small proportion of non-parental phenotypes.', '{"1": "Repeated results by many scientists rule out simple error.", "2": "Linked genes do not assort independently.", "3": "Sweet pea plants are not male and female individuals."}'),
  ('CHE-9001', 'Chemistry', 'States of matter', 'Intermolecular forces', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q82. Rebuilt in our own words.', 'What mainly holds the atoms of a noble gas together in the liquid or solid state?', '["Covalent bonds", "Electrostatic attraction between ions", "Hydrogen bonds", "London dispersion forces"]', 3, 'Noble gas atoms are non-polar and form no bonds; only weak London (dispersion) forces from temporary dipoles attract them.', '{"0": "Noble gases have full shells and do not form covalent bonds.", "1": "They form no ions.", "2": "Hydrogen bonding needs H bonded to N, O or F."}'),
  ('CHE-9002', 'Chemistry', 'Alkyl halides', 'Reactions of alkyl halides', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q83. Rebuilt in our own words.', 'Heating ethyl chloride with dry silver oxide gives', '["dimethyl ether", "diethyl ether", "ethanoic acid", "ethanal"]', 1, 'Dry Ag2O joins two ethyl groups through oxygen: 2C2H5Cl + Ag2O → C2H5-O-C2H5 + 2AgCl. (Moist Ag2O would give ethanol.)', '{"0": "Dimethyl ether would need methyl halide.", "2": "No oxidation to an acid occurs.", "3": "No aldehyde is formed."}'),
  ('CHE-9003', 'Chemistry', 'Alcohols and phenols', 'Reactions of phenol', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q84. Rebuilt in our own words.', 'What colour is the precipitate formed when phenol reacts with bromine water?', '["Red", "White", "Blue", "Orange"]', 1, 'Phenol decolourises bromine water and gives a white precipitate of 2,4,6-tribromophenol.', '{"0": "The product is white.", "2": "The product is white.", "3": "Orange is the colour of the bromine water before it reacts."}'),
  ('CHE-9004', 'Chemistry', 'Atomic structure', 'Hydrogen spectrum', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q85. Rebuilt in our own words.', 'The Pfund series of the hydrogen spectrum is produced when electrons fall to which orbit?', '["2nd", "3rd", "4th", "5th"]', 3, 'Lyman → n = 1, Balmer → 2, Paschen → 3, Brackett → 4, Pfund → 5.', '{"0": "n = 2 gives the Balmer series.", "1": "n = 3 gives the Paschen series.", "2": "n = 4 gives the Brackett series."}'),
  ('CHE-9005', 'Chemistry', 'Atomic structure', 'Electronic configuration', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q86. Rebuilt in our own words.', 'What is the electronic configuration of the hydride ion, H⁻?', '["1s⁰", "1s¹", "1s²", "1s² 2s¹"]', 2, 'H has 1 electron; H⁻ has gained one more, giving 1s².', '{"0": "1s⁰ is H⁺.", "1": "1s¹ is the neutral H atom.", "3": "H⁻ has only two electrons."}'),
  ('CHE-9006', 'Chemistry', 'Alkyl halides', 'Grignard reagent', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q87. Rebuilt in our own words.', 'A carboxylic acid is formed when a Grignard reagent reacts (followed by acid hydrolysis) with', '["a carbonate", "carbon dioxide", "an aldehyde", "carbon monoxide"]', 1, 'RMgX adds to CO2 to give RCOOMgX, which on hydrolysis gives the carboxylic acid RCOOH.', '{"0": "Not the standard route to acids.", "2": "Aldehydes give secondary (or, with methanal, primary) alcohols.", "3": "Not the reagent used to make acids from RMgX."}'),
  ('CHE-9007', 'Chemistry', 'Atomic structure', 'Quantum numbers', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q88. Rebuilt in our own words.', 'An electron has n = 4, l = 0, m = 0 and s = −½. It is in which subshell?', '["4s", "4p", "5s", "5p"]', 0, 'n = 4 is the fourth shell and l = 0 is an s subshell, so the electron is in 4s.', '{"1": "A p subshell has l = 1.", "2": "5s would need n = 5.", "3": "5p would need n = 5 and l = 1."}'),
  ('CHE-9008', 'Chemistry', 'States of matter', 'Ideal and real gases', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q89. Rebuilt in our own words.', 'Under which conditions does a real gas behave most nearly like an ideal gas?', '["100 °C and 10 atm", "1000 °C and 20 atm", "1000 °C and 1 atm", "10 °C and 100 atm"]', 2, 'Real gases approach ideal behaviour at high temperature (attractions overcome) and low pressure (molecular volume negligible).', '{"0": "Lower temperature and higher pressure than option c.", "1": "Same temperature as c but higher pressure.", "3": "Low temperature and high pressure give the largest deviation."}'),
  ('CHE-9009', 'Chemistry', 'States of matter', 'Crystalline solids', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q90. Rebuilt in our own words.', 'Which statement describes a crystalline solid?', '["Particles are arranged randomly with no repeating pattern.", "Particles are arranged in a regular, repeating three-dimensional pattern.", "It softens gradually over a range of temperatures.", "It has no definite shape or melting point."]', 1, 'Crystalline solids have long-range order: a repeating 3D lattice, a definite shape and a sharp melting point.', '{"0": "This describes an amorphous solid.", "2": "Gradual softening is typical of amorphous solids.", "3": "Crystalline solids have definite shapes and sharp melting points."}'),
  ('CHE-9010', 'Chemistry', 'Fundamental concepts', 'Percentage yield', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q91. Rebuilt in our own words.', 'Heating 25 g of CaCO₃ gives 12 g of CaO (CaCO₃ → CaO + CO₂; CaCO₃ = 100, CaO = 56 g/mol). The percentage yield is about', '["50%", "60%", "86%", "90%"]', 2, '25 g CaCO₃ = 0.25 mol, which can give 0.25 × 56 = 14 g CaO. Yield = 12/14 × 100 ≈ 86%.', '{"0": "12/25 = 48% compares CaO with CaCO₃ by mass, which is wrong.", "1": "Not the result of 12/14.", "3": "Not the result of 12/14."}'),
  ('CHE-9011', 'Chemistry', 'Fundamental concepts', 'Percentage yield', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q92. Rebuilt in our own words.', 'The actual yield of a reaction is 20 g and the theoretical yield is 25 g. The percentage yield is', '["60%", "70%", "80%", "85%"]', 2, '% yield = actual ÷ theoretical × 100 = 20/25 × 100 = 80%.', '{"0": "Not 20/25.", "1": "Not 20/25.", "3": "Not 20/25."}'),
  ('CHE-9012', 'Chemistry', 'States of matter', 'Gas laws', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q93. Rebuilt in our own words.', 'For a gas, the pressure is halved while the temperature (in kelvin) and the number of moles are both doubled. The new volume is', '["double", "four times", "six times", "eight times"]', 3, 'V = nRT/P. New V = (2n)(2T)/(½P) × R = 8 × the old volume.', '{"0": "Only one change has been counted.", "1": "Only two of the three changes have been counted.", "2": "The factors multiply (2 × 2 × 2), they do not add."}'),
  ('CHE-9013', 'Chemistry', 'Alkyl halides', 'Elimination reactions', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q94. Rebuilt in our own words.', 'The rate of an E1 reaction depends on', '["the alkyl halide only", "the base only", "the nucleophile only", "both the base and the alkyl halide"]', 0, 'E1 is unimolecular: the slow step is ionisation of R-X to a carbocation, so rate = k[R-X].', '{"1": "The base acts after the slow step.", "2": "E1 rate does not involve a nucleophile.", "3": "That describes E2 (bimolecular)."}'),
  ('CHE-9014', 'Chemistry', 'Reaction kinetics', 'Rate law', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q95. Rebuilt in our own words.', 'For a reaction with rate = k[A][B]², what happens to the rate if both concentrations are doubled?', '["It halves", "It doubles", "It becomes four times", "It becomes eight times"]', 3, 'New rate = k(2[A])(2[B])² = 2 × 4 = 8 times the old rate.', '{"0": "Raising concentrations cannot reduce the rate here.", "1": "That counts only the [A] term.", "2": "That counts only the [B]² term."}'),
  ('CHE-9015', 'Chemistry', 'Alkyl halides', 'Grignard reagent', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q96. Rebuilt in our own words.', 'A Grignard reagent reacts with methanal (followed by acid hydrolysis) to give', '["a phenol", "a primary alcohol", "propanoic acid", "a ketone"]', 1, 'Methanal (HCHO) + RMgX → RCH2OMgX → RCH2OH, a primary alcohol. Other aldehydes give secondary and ketones give tertiary alcohols.', '{"0": "Phenols are not made this way.", "2": "Acids come from CO2, not methanal.", "3": "Grignard reagents give alcohols with carbonyls, not ketones."}'),
  ('CHE-9016', 'Chemistry', 'Atomic structure', 'Orbitals', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q97. Rebuilt in our own words.', 'The region where the probability of finding an electron is greatest is called', '["an orbit", "an orbital", "a degenerate orbit", "a node"]', 1, 'An orbital is the region of space around the nucleus where there is a high probability of finding an electron.', '{"0": "An orbit is Bohr''s fixed circular path.", "2": "Degeneracy refers to orbitals of equal energy, not to probability.", "3": "A node is where the probability is zero."}'),
  ('CHE-9017', 'Chemistry', 'Organic chemistry', 'Alkynes', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q98. Rebuilt in our own words.', 'Hydration of alkynes (dilute H₂SO₄, HgSO₄) gives ketones for all of these EXCEPT', '["acetylene (ethyne)", "propyne", "butyne", "pentyne"]', 0, 'Ethyne gives acetaldehyde (ethanal), an aldehyde. Higher alkynes give ketones.', '{"1": "Propyne gives propanone (a ketone).", "2": "Butyne gives butanone (a ketone).", "3": "Pentyne gives a pentanone (a ketone)."}'),
  ('CHE-9018', 'Chemistry', 'Organic chemistry', 'Benzene', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q99. Rebuilt in our own words.', 'Benzene is unusually stable because', '["it has only single bonds", "its π electrons are delocalised over the ring", "its carbons are sp³ hybridised", "it has isolated double bonds"]', 1, 'The six π electrons are delocalised over all six carbons (resonance), which lowers the energy of the molecule.', '{"0": "Benzene has delocalised π bonding as well.", "2": "Benzene''s carbons are sp².", "3": "Isolated double bonds would make it react like an alkene."}'),
  ('CHE-9019', 'Chemistry', 'Thermochemistry', 'Lattice energy', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q100. Rebuilt in our own words.', 'For chlorides of Period 3 metals (NaCl, MgCl₂, AlCl₃), how does lattice energy change across the period?', '["It increases", "It decreases", "It stays the same", "It changes randomly"]', 0, 'Across the period the cation charge rises (Na⁺, Mg²⁺, Al³⁺) and its radius falls, so the attraction to the anions and the lattice energy increase.', '{"1": "Higher charge and smaller size increase lattice energy.", "2": "Charge and size both change across the period.", "3": "The change follows charge and size."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('CHE-9020', 'Chemistry', 'Alcohols and phenols', 'Oxidation of alcohols', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q101. Rebuilt in our own words.', 'A primary alcohol is oxidised to a carboxylic acid by', '["CH₃COOH/P₂O₅", "NH₃", "CH₃OH", "acidified K₂Cr₂O₇ (H₂SO₄)"]', 3, 'Acidified dichromate oxidises a primary alcohol to an aldehyde and then (when heated under reflux) to a carboxylic acid.', '{"0": "This mixture is not an oxidising agent.", "1": "Ammonia is not an oxidant.", "2": "Methanol is not an oxidant."}'),
  ('CHE-9021', 'Chemistry', 'Transition elements', 'Properties', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q102. Rebuilt in our own words.', 'Which statement is generally true of transition metals?', '["They are hard, weak metals with low melting points", "They are hard, strong metals with high melting points", "They are soft, strong metals with high melting points", "They are soft, weak metals with low melting points"]', 1, 'Strong metallic bonding (d and s electrons) makes most transition metals hard and strong with high melting points (mercury is the exception).', '{"0": "Their metallic bonding is strong.", "2": "Most are hard.", "3": "Most are hard and high-melting."}'),
  ('CHE-9022', 'Chemistry', 'Aldehydes, ketones and carboxylic acids', 'Tests for carbonyls', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q103. Rebuilt in our own words.', 'Which test distinguishes methyl ketones from other ketones?', '["Silver mirror (Tollens'') test", "Silver nitrate test", "Iodoform test", "Lucas test"]', 2, 'Compounds with a CH₃CO- group give a yellow iodoform (CHI₃) precipitate with I₂ and NaOH.', '{"0": "Tollens'' test distinguishes aldehydes from ketones.", "1": "Silver nitrate tests for halide ions.", "3": "The Lucas test classifies alcohols."}'),
  ('CHE-9023', 'Chemistry', 'Fundamental concepts', 'Molar volume', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q104. Rebuilt in our own words.', 'What volume do 9.03 × 10²³ molecules of an ideal gas occupy at STP?', '["11.2 dm³", "22.4 dm³", "33.6 dm³", "44.8 dm³"]', 2, '9.03 × 10²³ ÷ 6.02 × 10²³ = 1.5 mol. Volume = 1.5 × 22.4 = 33.6 dm³.', '{"0": "That is 0.5 mol.", "1": "That is 1 mol.", "3": "That is 2 mol."}'),
  ('CHE-9024', 'Chemistry', 'Reaction kinetics', 'Order of reaction', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q105. Rebuilt in our own words.', 'For rate = k[A]⁰[B], what happens to the rate if both [A] and [B] are doubled?', '["It stays the same", "It doubles", "It triples", "It halves"]', 1, 'The reaction is zero order in A, so A has no effect; doubling [B] doubles the rate.', '{"0": "Doubling [B] does change the rate.", "2": "The rate depends on [B] to the first power only.", "3": "Increasing [B] cannot reduce the rate."}'),
  ('CHE-9025', 'Chemistry', 'Electrochemistry', 'Oxidation numbers', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q106. Rebuilt in our own words.', 'What are the oxidation numbers of the two nitrogen atoms in NH₄NO₃?', '["+4 and −4", "−3 and +5", "−4 and +6", "−4 and +5"]', 1, 'In NH₄⁺: N + 4(+1) = +1, so N = −3. In NO₃⁻: N + 3(−2) = −1, so N = +5.', '{"0": "Not consistent with the two ions.", "2": "Not consistent with the two ions.", "3": "N in NH₄⁺ is −3, not −4."}'),
  ('CHE-9026', 'Chemistry', 'Atomic structure', 'Subshell capacity', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q107. Rebuilt in our own words.', 'The maximum number of electrons in a subshell with azimuthal quantum number l is', '["l + 1", "2l + 1", "2(2l + 1)", "2l + 2"]', 2, 'A subshell has 2l + 1 orbitals, each holding 2 electrons, so 2(2l + 1). For p (l = 1) this gives 6.', '{"0": "Gives the wrong count (p would hold 2).", "1": "2l + 1 is the number of orbitals, not electrons.", "3": "Gives 4 for p instead of 6."}'),
  ('CHE-9027', 'Chemistry', 'Electrochemistry', 'Galvanic cells', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q108. Rebuilt in our own words.', 'In a galvanic cell, oxidation takes place at the', '["cathode", "anode", "salt bridge", "electrolyte"]', 1, 'Oxidation always happens at the anode (and reduction at the cathode).', '{"0": "Reduction occurs at the cathode.", "2": "The salt bridge only completes the circuit with ions.", "3": "Electron transfer happens at the electrodes."}'),
  ('CHE-9028', 'Chemistry', 'Electrochemistry', 'Oxidation numbers', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q109. Rebuilt in our own words.', 'What is the oxidation number of chlorine in HClO₃?', '["−1", "−5", "+1", "+5"]', 3, '(+1) + Cl + 3(−2) = 0, so Cl = +5.', '{"0": "−1 is Cl in HCl.", "1": "Chlorine is bonded to more electronegative oxygen, so it is positive.", "2": "+1 is Cl in HClO."}'),
  ('CHE-9029', 'Chemistry', 'Fundamental concepts', 'Mole and mass', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q110. Rebuilt in our own words.', 'What is the mass of 0.5 mol of CaCO₃ (molar mass 100 g/mol)?', '["50 g", "55 g", "45 g", "60 g"]', 0, 'Mass = moles × molar mass = 0.5 × 100 = 50 g.', '{"1": "Not 0.5 × 100.", "2": "Not 0.5 × 100.", "3": "Not 0.5 × 100."}'),
  ('CHE-9030', 'Chemistry', 'Reaction kinetics', 'Surface area', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q111. Rebuilt in our own words.', 'Equal masses of crushed and large copper sulphate crystals are stirred in water. The crushed sample dissolves faster because it', '["has a higher density", "has a greater surface area", "has a lower density", "has a smaller surface area"]', 1, 'Crushing exposes more surface to the water, so more particles dissolve per second.', '{"0": "Crushing does not change density.", "2": "Crushing does not change density.", "3": "Crushing increases surface area."}'),
  ('CHE-9031', 'Chemistry', 'Fundamental principles of organic chemistry', 'Isomerism', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q112. Rebuilt in our own words.', 'Which type of isomerism does 2-butene show?', '["Tautomerism", "Geometric (cis-trans) isomerism", "Functional group isomerism", "Metamerism"]', 1, 'Each carbon of the C=C carries two different groups (CH₃ and H), and rotation about the double bond is restricted, so cis and trans forms exist.', '{"0": "Tautomerism is a rapid shift of H between two structures (e.g. keto-enol).", "2": "This needs different functional groups.", "3": "Metamerism is seen in ethers, ketones and amines with different groups around the functional group."}'),
  ('CHE-9032', 'Chemistry', 'Macromolecules', 'Nylon-6,6', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q113. Rebuilt in our own words.', 'Nylon-6,6 is made from two monomers, each of which contains', '["6 carbon atoms", "6 amino groups", "6 nitrogen atoms", "6 carboxylic acid groups"]', 0, 'Hexamethylenediamine (1,6-diaminohexane) and adipic acid (hexanedioic acid) each have 6 carbon atoms, hence ''6,6''.', '{"1": "The diamine has 2 amino groups.", "2": "The diamine has 2 nitrogen atoms.", "3": "Adipic acid has 2 -COOH groups."}'),
  ('CHE-9033', 'Chemistry', 'States of matter', 'Types of solids', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q114. Rebuilt in our own words.', 'Solid X does not conduct electricity but conducts when melted. Solid Y does not conduct in any state. What are X and Y?', '["X molecular, Y ionic", "X ionic, Y molecular", "Both ionic", "Both molecular"]', 1, 'Ionic solids conduct only when molten (or dissolved), when the ions can move. Molecular solids have no ions or free electrons and do not conduct.', '{"0": "This swaps the two.", "2": "Y never conducts, so it is not ionic.", "3": "X conducts when molten, so it is ionic."}'),
  ('CHE-9034', 'Chemistry', 'Chemical equilibrium', 'Solubility product', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q115. Rebuilt in our own words.', 'The solubility of AgBr is 7.1 × 10⁻⁷ mol dm⁻³. What is its solubility product, Ksp?', '["5.04 × 10⁻¹³", "4.94 × 10¹³", "7.1 × 10⁻⁷", "1.42 × 10⁻¹³"]', 0, 'AgBr ⇌ Ag⁺ + Br⁻, so Ksp = s² = (7.1 × 10⁻⁷)² = 50.41 × 10⁻¹⁴ = 5.04 × 10⁻¹³.', '{"1": "The power of ten must be negative.", "2": "That is the solubility, not Ksp.", "3": "This doubles the solubility (2 × 7.1) instead of squaring it."}'),
  ('CHE-9035', 'Chemistry', 'Fundamental concepts', 'Solutions', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q116. Rebuilt in our own words.', 'In an aqueous solution of methanol, the solvent is', '["HCl", "water", "methanol", "NaOH"]', 1, '''Aqueous'' means water is the solvent; methanol is the solute.', '{"0": "HCl is not present.", "2": "Methanol is the solute.", "3": "NaOH is not present."}'),
  ('CHE-9036', 'Chemistry', 'States of matter', 'Amorphous solids', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q117. Rebuilt in our own words.', 'Which is the best example of an amorphous solid?', '["Diamond", "Glass", "Sodium chloride", "Potassium bromide"]', 1, 'Glass has no long-range order and softens over a range of temperature, so it is amorphous.', '{"0": "Diamond is a covalent crystal.", "2": "NaCl is an ionic crystal.", "3": "KBr is an ionic crystal."}'),
  ('CHE-9037', 'Chemistry', 'Macromolecules', 'PVC', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q118. Rebuilt in our own words.', 'Vinyl chloride, the monomer of PVC, is prepared by adding HCl to', '["ethene", "ethyne (acetylene)", "vinyl alcohol", "methane"]', 1, 'HC≡CH + HCl → CH₂=CHCl (vinyl chloride), which polymerises to PVC.', '{"0": "HCl + ethene gives chloroethane, not vinyl chloride.", "2": "Vinyl alcohol is unstable and is not the starting material.", "3": "Methane gives chloromethanes."}'),
  ('CHE-9038', 'Chemistry', 'Aldehydes, ketones and carboxylic acids', 'Acid chlorides', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q119. Rebuilt in our own words.', 'Acetic acid is converted into acetyl chloride with', '["thionyl chloride (SOCl₂)", "chlorine", "sodium chloride", "phosphorus trioxide"]', 0, 'CH₃COOH + SOCl₂ → CH₃COCl + SO₂ + HCl. PCl₃ or PCl₅ also work.', '{"1": "Chlorine substitutes the α-hydrogen instead.", "2": "NaCl does not react with acetic acid this way.", "3": "P₂O₃ is not a chlorinating agent."}'),
  ('CHE-9039', 'Chemistry', 'Aldehydes, ketones and carboxylic acids', 'Reduction of carbonyls', 'hard', 'UHS MDCAT 2026 (Punjab), Paper A, Q120. Rebuilt in our own words.', '2-Oxopentanal (CH₃CH₂CH₂COCHO) is treated with NaBH₄. The product is', '["CH₃CH(OH)CH₂CH₂OH", "CH₃CH₂CH₂CH₂CH₂OH", "CH₃CH(OH)CH₂CH(OH)CH₃", "CH₃CH₂CH₂CH(OH)CH₂OH"]', 3, 'NaBH₄ reduces both carbonyl groups: the aldehyde (C1) to a primary alcohol and the ketone (C2) to a secondary alcohol, giving pentane-1,2-diol.', '{"0": "This has only four carbons.", "1": "The C2 oxygen cannot be removed by NaBH₄.", "2": "The OH groups are in the wrong positions."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('CHE-9040', 'Chemistry', 'States of matter', 'Avogadro''s law', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q121. Rebuilt in our own words.', 'A 2.0 L container holds 0.5 mol of N₂. Another 1.0 mol is added at the same temperature and pressure. What is the new volume?', '["3.0 L", "4.0 L", "6.0 L", "8.0 L"]', 2, 'At constant T and P, V ∝ n. The moles rise from 0.5 to 1.5 (×3), so V = 2.0 × 3 = 6.0 L.', '{"0": "This adds 1 L instead of scaling.", "1": "That would be 1.0 mol in total.", "3": "That would be 2.0 mol in total."}'),
  ('CHE-9041', 'Chemistry', 'States of matter', 'Gas constant', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q122. Rebuilt in our own words.', 'The value of the gas constant R in dm³ torr K⁻¹ mol⁻¹ is', '["0.0821", "1.987", "8.314", "62.4"]', 3, 'R = 0.0821 dm³ atm K⁻¹ mol⁻¹ × 760 torr/atm ≈ 62.4 dm³ torr K⁻¹ mol⁻¹.', '{"0": "0.0821 is in dm³ atm K⁻¹ mol⁻¹.", "1": "1.987 is in cal K⁻¹ mol⁻¹.", "2": "8.314 is in J K⁻¹ mol⁻¹."}'),
  ('CHE-9042', 'Chemistry', 'Transition elements', 'Electronic configuration', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q123. Rebuilt in our own words.', 'How many unpaired electrons does Fe²⁺ (Z = 26) have?', '["6", "4", "3", "2"]', 1, 'Fe = [Ar]3d⁶4s². Fe²⁺ loses the two 4s electrons: [Ar]3d⁶. Five d orbitals hold 6 electrons, so one pair and 4 unpaired.', '{"0": "Six d electrons cannot all be unpaired in five orbitals.", "2": "Three would fit d³ or d⁷.", "3": "Two would fit d² or d⁸."}'),
  ('CHE-9043', 'Chemistry', 'Periodic table and periodicity', 'Blocks', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q124. Rebuilt in our own words.', 'An element with atomic number 27 belongs to which block?', '["s-block", "p-block", "d-block", "f-block"]', 2, 'Z = 27 is cobalt, [Ar]3d⁷4s². Its last electron enters a d subshell, so it is a d-block element.', '{"0": "The last electron goes into 3d, not s.", "1": "p-block elements fill p orbitals.", "3": "f-block elements fill 4f or 5f."}'),
  ('CHE-9044', 'Chemistry', 'Thermochemistry', 'First law', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q125. Rebuilt in our own words.', 'A system goes through a complete cycle, absorbing 1200 J of heat and giving out 700 J. Which statement is correct?', '["Its internal energy rises by 500 J", "Its internal energy falls by 500 J", "The system does 500 J of net work", "The surroundings do 500 J of net work on the system"]', 2, 'In a cycle the system returns to its starting state, so ΔE = 0. Net heat absorbed = 1200 − 700 = 500 J, which must equal the net work done by the system.', '{"0": "ΔE over a full cycle is zero.", "1": "ΔE over a full cycle is zero.", "3": "Net heat flowed in, so the system does work on the surroundings."}'),
  ('CHE-9045', 'Chemistry', 'Periodic table and periodicity', 'Ionic radius', 'hard', 'UHS MDCAT 2026 (Punjab), Paper A, Q126. Rebuilt in our own words.', 'Of these Period 3 elements, which forms the stable ion with the largest radius?', '["Sodium", "Silicon", "Phosphorus", "Chlorine"]', 2, 'P³⁻ and Cl⁻ both have 18 electrons, but P³⁻ has only 15 protons pulling on them, against 17 in Cl⁻, so P³⁻ is larger. Na⁺ has lost its outer shell and is small.', '{"0": "Na⁺ has only two shells, so it is small.", "1": "Silicon does not form a simple stable ion.", "3": "Cl⁻ has more protons than P³⁻ for the same 18 electrons, so it is smaller."}'),
  ('PHY-9001', 'Physics', 'Waves', 'Wave terms', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q127. Rebuilt in our own words.', 'The distance a wave travels in one second is its', '["wavelength", "amplitude", "displacement", "wave speed"]', 3, 'Wave speed is distance travelled per unit time (v = fλ).', '{"0": "Wavelength is the distance between two successive crests.", "1": "Amplitude is the maximum displacement from the mean position.", "2": "Displacement is a particle''s distance from its mean position at an instant."}'),
  ('PHY-9002', 'Physics', 'Waves', 'Wave equation', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q128. Rebuilt in our own words.', 'A wave of wavelength 0.5 m travels at 4 m/s. Its frequency is', '["2 Hz", "4 Hz", "6 Hz", "8 Hz"]', 3, 'f = v/λ = 4 ÷ 0.5 = 8 Hz.', '{"0": "That is v × λ = 2, not v ÷ λ.", "1": "Not v ÷ λ.", "2": "Not v ÷ λ."}'),
  ('PHY-9003', 'Physics', 'Waves', 'Transverse waves', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q129. Rebuilt in our own words.', 'The coils of a slinky spring vibrate at right angles to the direction the wave travels. The wave is', '["a matter wave", "an electromagnetic wave", "a transverse wave", "a longitudinal wave"]', 2, 'In a transverse wave, particles vibrate perpendicular to the direction of propagation.', '{"0": "Matter waves are de Broglie waves of moving particles.", "1": "Electromagnetic waves need no medium.", "3": "In a longitudinal wave, particles vibrate parallel to the direction of travel."}'),
  ('PHY-9004', 'Physics', 'Thermodynamics', 'Molar specific heat', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q130. Rebuilt in our own words.', 'Which quantity is measured in J mol⁻¹ K⁻¹?', '["Specific heat capacity", "Thermal conductivity", "Molar specific heat", "Latent heat"]', 2, 'Molar specific heat is the heat needed to raise 1 mol of a substance by 1 K.', '{"0": "Specific heat capacity is per kilogram: J kg⁻¹ K⁻¹.", "1": "Thermal conductivity is W m⁻¹ K⁻¹.", "3": "Latent heat is J kg⁻¹."}'),
  ('PHY-9005', 'Physics', 'Force and motion', 'Velocity-time graph', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q131. Rebuilt in our own words.', 'For a car moving with constant acceleration, the velocity-time graph is a', '["parabola", "curve bending upward", "straight line", "curve bending downward"]', 2, 'v = vᵢ + at is linear in t, so the graph is a straight line whose slope is the acceleration.', '{"0": "A parabola is the displacement-time graph for constant acceleration.", "1": "A curving v-t graph means the acceleration is changing.", "3": "A curving v-t graph means the acceleration is changing."}'),
  ('PHY-9006', 'Physics', 'Force and motion', 'Newton''s second law', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q132. Rebuilt in our own words.', 'The rate of change of momentum of a body equals the', '["impulse", "force acting on it", "torque", "velocity"]', 1, 'Newton''s second law: F = Δp/Δt.', '{"0": "Impulse is the change in momentum (F × t), not its rate.", "2": "Torque is the rate of change of angular momentum.", "3": "Velocity is momentum divided by mass."}'),
  ('PHY-9007', 'Physics', 'Force and motion', 'Displacement-time graph', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q133. Rebuilt in our own words.', 'On a displacement-time graph, the slope of the tangent at a point gives the object''s', '["average velocity over the whole motion", "instantaneous velocity at that point", "velocity at the start", "velocity at the end"]', 1, 'The tangent''s slope is Δd/Δt at that instant, which is the instantaneous velocity there.', '{"0": "Average velocity is the slope of the chord joining the start and end points.", "2": "It applies at the chosen point, not the start.", "3": "It applies at the chosen point, not the end."}'),
  ('PHY-9008', 'Physics', 'Electromagnetic induction', 'Lenz''s law', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q134. Rebuilt in our own words.', 'Lenz''s law tells us about the', '["production of an induced emf", "magnitude of the induced emf", "direction of the induced emf", "strength of the magnetic field"]', 2, 'Lenz''s law gives the direction: the induced current opposes the change in flux that causes it.', '{"0": "Production of an induced emf is Faraday''s discovery.", "1": "The magnitude comes from Faraday''s law (ε = −NΔΦ/Δt).", "3": "Lenz''s law does not deal with field strength."}'),
  ('PHY-9009', 'Physics', 'Waves', 'Simple pendulum', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q135. Rebuilt in our own words.', 'For a simple pendulum of length l in SHM, the quantity 4π²f² equals', '["gl", "g/l", "l/g", "√(g/l)"]', 1, 'ω² = g/l for a simple pendulum, and ω = 2πf, so 4π²f² = g/l.', '{"0": "The units of gl are not s⁻².", "2": "l/g equals 1/ω², which is T²/4π².", "3": "√(g/l) is ω, not ω²."}'),
  ('PHY-9010', 'Physics', 'Modern and nuclear physics', 'Half-life', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q136. Rebuilt in our own words.', 'At one moment, 50% of a radioactive sample is left. 10 s later, only 12.5% is left. The half-life is', '["2.5 s", "3.3 s", "5 s", "10 s"]', 2, '50% → 25% → 12.5% is two half-lives in 10 s, so one half-life is 5 s.', '{"0": "That would be four half-lives in 10 s.", "1": "That would be three half-lives in 10 s.", "3": "One half-life would only reach 25%."}'),
  ('PHY-9011', 'Physics', 'Electromagnetic induction', 'Induced emf', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q137. Rebuilt in our own words.', 'A coil is moved at constant speed through a uniform magnetic field, with its plane kept perpendicular to the field and the coil staying entirely inside the field. The induced emf is', '["zero", "constant and non-zero", "increasing", "decreasing"]', 0, 'The field is uniform and the coil stays inside it, so the flux through the coil never changes. No change in flux means no induced emf.', '{"1": "An emf needs a changing flux.", "2": "An emf needs a changing flux.", "3": "An emf needs a changing flux."}'),
  ('PHY-9012', 'Physics', 'Electrostatics', 'Potential difference', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q138. Rebuilt in our own words.', 'The work done per unit positive charge in moving it between two points against an electric field is the', '["electric power", "electric potential difference", "electric flux", "electric field intensity"]', 1, 'ΔV = W/q, measured in volts (J C⁻¹).', '{"0": "Power is work per unit time.", "2": "Flux is the field passing through an area.", "3": "Field intensity is force per unit charge."}'),
  ('PHY-9013', 'Physics', 'Modern and nuclear physics', 'Atomic spectra', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q139. Rebuilt in our own words.', 'Each line in the emission spectrum of neon corresponds to', '["a different atom", "a different element", "photons of one particular energy", "an atom splitting"]', 2, 'Each line is light of one wavelength, emitted when electrons drop between two particular energy levels, so each line is photons of a specific energy.', '{"0": "All neon atoms give the same set of lines.", "1": "All the lines come from neon.", "3": "Atoms do not split to emit light."}'),
  ('PHY-9014', 'Physics', 'Fluid dynamics', 'Bernoulli''s principle', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q140. Rebuilt in our own words.', 'Pressing a spray bottle''s nozzle makes air move fast across the top of the tube. This', '["creates high pressure that lifts the liquid", "creates low pressure that lifts the liquid", "raises the pressure at the tube''s opening", "lowers the surface tension of the liquid"]', 1, 'By Bernoulli''s principle, fast-moving air has low pressure. The higher pressure on the liquid in the bottle pushes it up the tube.', '{"0": "Fast-moving air has low, not high, pressure.", "2": "The pressure at the opening falls.", "3": "Surface tension is not what lifts the liquid."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('PHY-9015', 'Physics', 'Force and motion', 'Newton''s second law', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q141. Rebuilt in our own words.', 'A 10 N force acts on a 2 kg mass. The acceleration is', '["5 m s⁻²", "10 m s⁻²", "20 m s⁻²", "0.2 m s⁻²"]', 0, 'a = F/m = 10 ÷ 2 = 5 m s⁻².', '{"1": "This ignores the mass.", "2": "This multiplies F and m.", "3": "This divides m by F."}'),
  ('PHY-9016', 'Physics', 'Work and energy', 'Gravitational potential energy', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q142. Rebuilt in our own words.', 'Two identical masses are at heights h and 2h. The ratio of their gravitational potential energies is', '["1 : 2", "2 : 1", "1 : 1", "it depends on the mass"]', 0, 'P.E. = mgh, so with equal masses it is proportional to height: h : 2h = 1 : 2.', '{"1": "This inverts the ratio.", "2": "P.E. depends on height.", "3": "The masses are identical, so mass cancels."}'),
  ('PHY-9017', 'Physics', 'Vectors and equilibrium', 'Scalar product', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q143. Rebuilt in our own words.', 'The scalar (dot) product of two parallel vectors equals', '["zero", "the square of one magnitude", "the product of their magnitudes", "the sum of their magnitudes"]', 2, 'A·B = AB cos θ, and θ = 0 for parallel vectors, so A·B = AB.', '{"0": "Zero is for perpendicular vectors.", "1": "Only true if both vectors are equal.", "3": "A dot product multiplies magnitudes."}'),
  ('PHY-9018', 'Physics', 'Fluid dynamics', 'Flow rate', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q144. Rebuilt in our own words.', 'The volume flow rate of a fluid through a pipe equals', '["mv", "Av", "Aρ", "vρ"]', 1, 'Volume per second = cross-sectional area × flow speed = Av (m³ s⁻¹).', '{"0": "mv is momentum.", "2": "Aρ has the wrong units.", "3": "vρ has the wrong units (ρAv is mass flow rate)."}'),
  ('PHY-9019', 'Physics', 'Thermodynamics', 'Adiabatic process', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q145. Rebuilt in our own words.', 'In which process is work done by the gas entirely at the expense of its internal energy?', '["Isochoric", "Isobaric", "Isothermal", "Adiabatic"]', 3, 'In an adiabatic process Q = 0, so W = −ΔU: work done by the gas comes from its internal energy and it cools.', '{"0": "In an isochoric process no work is done.", "1": "In an isobaric process heat is supplied as well.", "2": "In an isothermal process ΔU = 0; the work comes from heat taken in."}'),
  ('PHY-9020', 'Physics', 'Thermodynamics', 'Isothermal process', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q146. Rebuilt in our own words.', 'In an isothermal process, the internal energy of an ideal gas', '["decreases", "increases", "stays the same", "becomes zero"]', 2, 'The internal energy of an ideal gas depends only on temperature, which is constant, so ΔU = 0.', '{"0": "Temperature is constant, so U does not change.", "1": "Temperature is constant, so U does not change.", "3": "U stays at its value; it does not become zero."}'),
  ('PHY-9021', 'Physics', 'Thermodynamics', 'Adiabatic process', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q147. Rebuilt in our own words.', 'A gas expands adiabatically and does 10 J of work. Its change in internal energy is', '["+10 J", "−10 J", "+20 J", "0 J"]', 1, 'Q = 0, so ΔU = Q − W = 0 − 10 = −10 J. The gas cools.', '{"0": "The gas loses energy while doing work.", "2": "No heat is supplied in an adiabatic process.", "3": "Only an isothermal ideal-gas process has ΔU = 0."}'),
  ('PHY-9022', 'Physics', 'Fluid dynamics', 'Equation of continuity', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q148. Rebuilt in our own words.', 'In the equation of continuity, Av = constant. The constant is the', '["volume of fluid", "mass of fluid", "density of fluid", "volume flow rate"]', 3, 'A × v (m² × m s⁻¹) gives m³ s⁻¹, the volume flowing per second, which is the same at every section of the pipe.', '{"0": "It is volume per second, not volume.", "1": "Mass flow rate would be ρAv.", "2": "Density is not Av."}'),
  ('PHY-9023', 'Physics', 'Electromagnetic induction', 'Transformer', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q149. Rebuilt in our own words.', 'In an ideal transformer, which quantity is the same in the primary and secondary?', '["Voltage", "Current", "Power", "Heat produced"]', 2, 'An ideal transformer has no losses, so power in = power out (VₚIₚ = VₛIₛ); voltage and current change in opposite ratios.', '{"0": "Voltage changes with the turns ratio.", "1": "Current changes inversely with the turns ratio.", "3": "An ideal transformer produces no heat."}'),
  ('PHY-9024', 'Physics', 'Thermodynamics', 'First law', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q150. Rebuilt in our own words.', 'The first law of thermodynamics can be written as', '["ΔQ = ΔU + ΔW", "ΔQ = ΔU − ΔW", "ΔU = ΔQ + ΔW", "ΔW = ΔU + ΔQ"]', 0, 'Heat supplied = increase in internal energy + work done by the system (with W as work done by the system).', '{"1": "With W as work done by the system, it must be added.", "2": "With W as work done by the system, ΔU = ΔQ − ΔW.", "3": "Not a form of the first law."}'),
  ('PHY-9025', 'Physics', 'Work and energy', 'Kinetic energy', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q151. Rebuilt in our own words.', 'A bullet fired from a gun pierces a target because of its', '["mechanical energy in general", "heat energy", "kinetic energy", "potential energy"]', 2, 'The fast-moving bullet has large kinetic energy (½mv²), which does work against the target''s material.', '{"0": "Too general; the energy doing the work is kinetic.", "1": "Heat is produced, but it is not what pierces the target.", "3": "The bullet''s potential energy is not involved."}'),
  ('PHY-9026', 'Physics', 'Waves', 'Wave equation', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q152. Rebuilt in our own words.', 'Ten waves pass a point each second at a speed of 10 m/s. The wavelength is', '["0.1 m", "1 m", "10 m", "100 m"]', 1, 'f = 10 Hz, so λ = v/f = 10 ÷ 10 = 1 m.', '{"0": "That would be f ÷ v.", "2": "That would be v alone.", "3": "That would be v × f."}'),
  ('PHY-9027', 'Physics', 'Waves', 'Stationary waves', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q153. Rebuilt in our own words.', 'In a stationary wave, the points where the two waves always cancel and the displacement is zero are called', '["antinodes", "nodes", "crests", "compressions"]', 1, 'Nodes are points of permanent destructive interference with zero displacement; antinodes have maximum displacement.', '{"0": "Antinodes have maximum displacement.", "2": "Crests are maximum displacement points of a travelling wave.", "3": "Compressions are regions of high pressure in a longitudinal wave."}'),
  ('PHY-9028', 'Physics', 'Current electricity', 'Steady current', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q154. Rebuilt in our own words.', 'What keeps a steady current flowing in a circuit?', '["A very large resistance", "A constant voltage source", "A switch", "An ammeter"]', 1, 'A source of constant emf keeps a constant potential difference across the circuit, which drives a steady current.', '{"0": "Large resistance reduces current; it does not maintain it.", "2": "A switch only opens or closes the circuit.", "3": "An ammeter only measures current."}'),
  ('PHY-9029', 'Physics', 'Modern and nuclear physics', 'Uses of radioisotopes', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q155. Rebuilt in our own words.', 'In hospital radiotherapy, gamma rays from cobalt-60 are used to', '["make X-ray images", "destroy cancer cells", "destroy healthy tissue", "measure blood pressure"]', 1, 'Co-60 emits penetrating gamma rays, which are aimed at tumours to kill cancer cells (it is also used to sterilise equipment).', '{"0": "X-ray images use X-ray tubes, not Co-60.", "2": "Doses are aimed to spare healthy tissue.", "3": "Radioisotopes are not used to measure blood pressure."}'),
  ('PHY-9030', 'Physics', 'Modern and nuclear physics', 'Radioactive decay', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q156. Rebuilt in our own words.', 'Radioactive decay is called ''random'' because', '["we cannot control the decay rate", "each unstable nucleus has a constant probability of decaying, but we cannot tell which will decay next", "we can find which nucleus will decay next", "we can speed up the decay"]', 1, 'Every unstable nucleus has the same fixed chance of decaying per second, but which one decays and when cannot be predicted.', '{"0": "True, but it means decay is spontaneous, not random.", "2": "It is impossible to predict which nucleus decays next.", "3": "Decay rate cannot be changed by physical conditions."}'),
  ('PHY-9031', 'Physics', 'Force and motion', 'Projectile range', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q157. Rebuilt in our own words.', 'For a projectile on level ground (no air resistance), the launch angle that gives the maximum range is', '["22.5°", "30°", "45°", "60°"]', 2, 'R = v² sin 2θ / g is largest when sin 2θ = 1, i.e. θ = 45°.', '{"0": "sin 45° < 1, so the range is less.", "1": "30° and 60° give equal ranges, both less than the maximum.", "3": "30° and 60° give equal ranges, both less than the maximum."}'),
  ('PHY-9032', 'Physics', 'Waves', 'Speed of sound', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q158. Rebuilt in our own words.', 'Sound travels faster on a humid (rainy) day because', '["moist air has more mass than dry air", "moist air is less dense than dry air", "the temperature stays the same", "the medium stays the same"]', 1, 'Water vapour (18 g/mol) is lighter than N₂ and O₂, so moist air has lower density, and v = √(γP/ρ) increases.', '{"0": "Moist air is lighter, not heavier.", "2": "This does not explain a change in speed.", "3": "The medium does change: it contains water vapour."}'),
  ('PHY-9033', 'Physics', 'Electrostatics', 'Electric potential', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q159. Rebuilt in our own words.', 'Two point charges +Q and −Q are a distance s apart. The electric potential at the point midway between them is', '["Q", "−kQ/s", "infinite", "zero"]', 3, 'V = kQ/(s/2) + k(−Q)/(s/2) = 0. Potentials are scalars and cancel.', '{"0": "Q is a charge, not a potential.", "1": "The two contributions are equal and opposite.", "2": "The point is not at either charge, so V is finite."}'),
  ('PHY-9034', 'Physics', 'Circular motion', 'Angular velocity', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q160. Rebuilt in our own words.', 'A fan turns steadily at 2 revolutions per second. Its angular velocity in SI units is', '["2π rev/s", "4π rev/min", "π/2 rad/s", "4π rad/s"]', 3, '1 rev = 2π rad, so ω = 2 × 2π = 4π rad s⁻¹.', '{"0": "Not in SI units (rad/s).", "1": "Not in SI units, and the value is wrong.", "2": "Not equal to 2 rev/s."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT OR IGNORE INTO questions
  (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, stage, free, paper, checks, writer_id, created_at, updated_at)
SELECT s.column1, s.column2, s.column3, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10, s.column11,
  'live', 0, 2026, '[]', u.id, unixepoch() * 1000, unixepoch() * 1000
FROM (VALUES
  ('PHY-9035', 'Physics', 'Electronics', 'Rectification', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q161. Rebuilt in our own words.', 'Converting alternating current into direct current is called', '["modulation", "polarisation", "rectification", "quantisation"]', 2, 'A rectifier (diodes) allows current in one direction only, turning AC into DC.', '{"0": "Modulation puts a signal on a carrier wave.", "1": "Polarisation restricts transverse vibrations to one plane.", "3": "Quantisation means taking discrete values."}'),
  ('PHY-9036', 'Physics', 'Waves', 'Stationary waves', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q162. Rebuilt in our own words.', 'A stationary wave on a string has speed 2 m/s and wavelength 0.25 m. Its frequency is', '["0.125 Hz", "2.0 Hz", "4.0 Hz", "8.0 Hz"]', 3, 'f = v/λ = 2 ÷ 0.25 = 8 Hz.', '{"0": "That is λ ÷ v.", "1": "That is v alone.", "2": "Not v ÷ λ."}'),
  ('ENG-0001', 'English', 'Grammar and sentence correction', 'Relative pronouns', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q163. Rebuilt in our own words.', 'Choose the word that fills the blank: The director ______ film was a blockbuster earned a lot of money.', '["who''s", "whom", "whose", "which"]', 2, '''Whose'' shows possession: the film belongs to the director.', '{"0": "''Who''s'' means ''who is'', which makes no sense here.", "1": "''Whom'' is an object pronoun and does not show possession.", "3": "''Which'' is used for things, and does not show possession here."}'),
  ('ENG-0002', 'English', 'Grammar and sentence correction', 'Punctuation', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q164. Rebuilt in our own words.', 'Which sentence is punctuated correctly?', '["I love Pakistan!", "Wow. That''s amazing", "Lets eat. Grandma.", "He''s not coming, is he"]', 0, 'An exclamation mark correctly ends a strong statement of feeling.', '{"1": "''Wow'' needs an exclamation mark or comma, and the sentence needs a full stop.", "2": "It should be ''Let''s eat, Grandma.'' (apostrophe and comma).", "3": "A tag question must end with a question mark."}'),
  ('ENG-0003', 'English', 'Vocabulary in context', 'Words in context', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q165. Rebuilt in our own words.', '''The captain stood at the head of the table, where the person in charge of the meeting sits.'' Here ''head'' means', '["a part of the body", "the end of the table for the most important person", "the top of a page", "a school principal"]', 1, 'In ''the head of the table'', head means the end of the table where the leader or most important person sits.', '{"0": "The sentence is not about a body part.", "2": "No page is mentioned.", "3": "''Head'' can mean a principal, but not in this phrase."}'),
  ('ENG-0004', 'English', 'Grammar and sentence correction', 'Direct and indirect speech', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q166. Rebuilt in our own words.', 'Change to direct speech: He claimed that he could speak French fluently.', '["He claimed, \"I can speak French fluently.\"", "He claimed, \"I am speaking French fluently.\"", "He claimed, \"I speak French fluently.\"", "He claimed, \"I was speaking French fluently.\""]', 0, 'In reported speech ''can'' shifts back to ''could''. Going back to direct speech, ''could'' returns to ''can'', and ''he'' becomes ''I''.', '{"1": "''Could speak'' is about ability, not a continuous action.", "2": "The modal ''can'' is lost.", "3": "The tense and meaning are both wrong."}'),
  ('ENG-0005', 'English', 'Grammar and sentence correction', 'Direct and indirect speech', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q167. Rebuilt in our own words.', 'Choose the correct indirect speech: The student said, "I am taking extra classes so that I can improve my grades before the finals."', '["The student said that he was taking extra classes so that he can improve his grades before the finals.", "The student said that he had taken extra classes so that he can improve his grades before the finals.", "The student said that he had been taking extra classes so that he could improve his grades before the finals.", "The student said that he was taking extra classes so that he could improve his grades before the finals."]', 3, 'With a past reporting verb, ''am taking'' becomes ''was taking'' and ''can'' becomes ''could''.', '{"0": "''Can'' must change to ''could''.", "1": "''Am taking'' becomes ''was taking'', not ''had taken''; ''can'' must change too.", "2": "''Am taking'' becomes ''was taking'', not ''had been taking''."}'),
  ('ENG-0006', 'English', 'Vocabulary in context', 'Phrasal verbs', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q168. Rebuilt in our own words.', 'What does ''She broke down in front of the audience'' mean?', '["She sang a song.", "She lost control of her emotions.", "She left the stage.", "She performed well."]', 1, '''Break down'' (of a person) means to lose control of one''s feelings and start crying.', '{"0": "Unrelated meaning.", "2": "Leaving is not implied.", "3": "This is the opposite sense."}'),
  ('ENG-0007', 'English', 'Grammar and sentence correction', 'Active and passive voice', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q169. Rebuilt in our own words.', 'Change to active voice: Mistakes could have been avoided if the instructions had been followed carefully by the workers.', '["The workers could avoid mistakes if they followed the instructions carefully.", "The workers could have avoided mistakes if they followed the instructions carefully.", "The workers could have avoided mistakes if they had followed the instructions carefully.", "The workers avoid mistakes if they follow the instructions carefully."]', 2, '''Could have been avoided'' becomes ''could have avoided'', and ''had been followed'' becomes ''had followed''; the tenses stay the same.', '{"0": "Both tenses are changed.", "1": "''Had been followed'' must become ''had followed'', not ''followed''.", "3": "Both tenses are changed to the present."}'),
  ('ENG-0008', 'English', 'Grammar and sentence correction', 'Adverbs', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q170. Rebuilt in our own words.', 'What kind of adverb is used in: ''The cat chased the rat everywhere''?', '["Adverb of time", "Adverb of manner", "Adverb of frequency", "Adverb of place"]', 3, '''Everywhere'' tells us where the action happened, so it is an adverb of place.', '{"0": "Adverbs of time answer ''when'' (e.g. yesterday).", "1": "Adverbs of manner answer ''how'' (e.g. quickly).", "2": "Adverbs of frequency answer ''how often'' (e.g. always)."}'),
  ('ENG-0009', 'English', 'Vocabulary in context', 'Word meaning', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q171. Rebuilt in our own words.', '''He was known for resolving contentious matters.'' The word ''contentious'' means', '["disputed", "secret", "unethical", "private"]', 0, '''Contentious'' means causing argument or disagreement, i.e. disputed.', '{"1": "Secrecy is not the meaning.", "2": "Contentious matters are argued about, not necessarily wrong.", "3": "Contentious matters are often public."}'),
  ('LR-0001', 'Logical Reasoning', 'Critical thinking', 'Reasonable belief', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q172. Rebuilt in our own words.', 'A belief can be called true and reasonable when it is', '["accepted by most people", "in line with your feelings", "based on evidence and logic", "found in old books"]', 2, 'Critical thinking accepts a belief when it is supported by evidence and sound reasoning.', '{"0": "Popularity is not evidence.", "1": "Feelings are not evidence.", "3": "Age of a source does not make it true."}'),
  ('LR-0002', 'Logical Reasoning', 'Course of action', 'Course of action', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q173. Rebuilt in our own words.', 'While a teacher was briefly out of a chemistry lab, a student mixed leftover unknown chemicals. A strong smell filled the room and one student began coughing. Which action best prevents such accidents in future?', '["Cancel all chemistry practicals", "Expel the student involved", "Strengthen and enforce lab safety rules", "Punish the teacher for leaving the room"]', 2, 'The useful course of action fixes the cause (rules not followed) without stopping learning. Stronger, enforced safety rules do that.', '{"0": "Too extreme: it stops necessary learning.", "1": "Punishes one person but does not stop the next accident.", "3": "Punishment alone does not prevent future accidents."}'),
  ('LR-0003', 'Logical Reasoning', 'Patterns and sequences', 'Odd one out', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q174. Rebuilt in our own words.', 'Find the odd one out.', '["6 : 35", "2 : 15", "4 : 25", "7 : 45"]', 3, 'In the first three pairs the second number = 5 × (first + 1): 5 × 7 = 35, 5 × 3 = 15, 5 × 5 = 25. For 7 this rule gives 40, not 45.', '{"0": "Fits the rule: 5 × (6 + 1) = 35.", "1": "Fits the rule: 5 × (2 + 1) = 15.", "2": "Fits the rule: 5 × (4 + 1) = 25."}'),
  ('LR-0004', 'Logical Reasoning', 'Patterns and sequences', 'Odd one out', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q175. Rebuilt in our own words.', 'Find the odd one out.', '["D : G", "U : W", "H : J", "Q : S"]', 0, 'U→W, H→J and Q→S each skip one letter (gap of 2). D→G has a gap of 3.', '{"1": "U to W is a gap of 2, like the others.", "2": "H to J is a gap of 2, like the others.", "3": "Q to S is a gap of 2, like the others."}'),
  ('LR-0005', 'Logical Reasoning', 'Logical deductions', 'Blood relations', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q176. Rebuilt in our own words.', 'X''s son is a cousin of Y''s son. Y has no brother. What is X to Y?', '["Cousin", "Nephew", "Uncle", "Sister"]', 3, 'The two sons are cousins, so their parents X and Y are siblings. Y has no brother, so X must be Y''s sister.', '{"0": "If X and Y were cousins, their sons would be second cousins.", "1": "A nephew would be a generation younger than Y.", "2": "An uncle would be a generation older than Y."}'),
  ('LR-0006', 'Logical Reasoning', 'Patterns and sequences', 'Number series', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q177. Rebuilt in our own words.', 'What number comes next? 48, 45, 40, 33, 24, ...', '["11", "8", "13", "1"]', 2, 'The differences are −3, −5, −7, −9, so the next is −11: 24 − 11 = 13.', '{"0": "That subtracts 13.", "1": "That subtracts 16.", "3": "That subtracts 23."}'),
  ('LR-0007', 'Logical Reasoning', 'Logical problems', 'Quantitative comparison', 'moderate', 'UHS MDCAT 2026 (Punjab), Paper A, Q178. Rebuilt in our own words.', 'Quantity A: the price of a television on sale at 25% off. Quantity B: the price of the same television on sale at $25 off. Which is greater?', '["Quantity A", "Quantity B", "They are equal", "It cannot be determined"]', 3, 'It depends on the original price. At $200, 25% off = $50 off, so A is cheaper; at $50, 25% off = $12.50 off, so B is cheaper; at $100 they are equal.', '{"0": "True only for prices below $100.", "1": "True only for prices above $100.", "2": "True only at exactly $100."}'),
  ('LR-0008', 'Logical Reasoning', 'Logical problems', 'Arrangement', 'hard', 'UHS MDCAT 2026 (Punjab), Paper A, Q179. Rebuilt in our own words.', 'Five boxes (red, green, blue, yellow, black) are stacked from position 1 (bottom) to 5 (top). Red is above green, yellow is directly above black, and black is not at the bottom. If blue is at position 4, which box is at position 2?', '["Red", "Green", "Yellow", "Black"]', 3, 'Black cannot be at 1, and yellow must be directly above it with 4 taken by blue, so black = 2 and yellow = 3. Red above green then gives green = 1 and red = 5.', '{"0": "Red must be at 5.", "1": "Green must be at 1.", "2": "Yellow is at 3, directly above black."}'),
  ('LR-0009', 'Logical Reasoning', 'Logical problems', 'Percentages', 'easy', 'UHS MDCAT 2026 (Punjab), Paper A, Q180. Rebuilt in our own words.', '54 seconds is what percentage of 90 minutes?', '["1%", "6%", "3%", "10%"]', 0, '90 minutes = 5400 seconds. 54 ÷ 5400 × 100 = 1%.', '{"1": "This mixes minutes and seconds.", "2": "Not 54/5400.", "3": "Not 54/5400."}')
) AS s
JOIN users u ON u.email = 'hozaiphaa@gmail.com';

INSERT INTO question_counters (prefix, n) VALUES ('ENG', 9) ON CONFLICT (prefix) DO UPDATE SET n = max(n, 9);
INSERT INTO question_counters (prefix, n) VALUES ('LR', 9) ON CONFLICT (prefix) DO UPDATE SET n = max(n, 9);

-- The same chapters in the NUMS and AKU banks (both reuse the MDCAT chapter names).
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'BIO-9001', 'Biology', 'Acellular life'),
  ('aku', 'BIO-9001', 'Biology', 'Acellular life'),
  ('nums', 'BIO-9002', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9002', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9003', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9003', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9004', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9004', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9005', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9005', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9006', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9006', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9007', 'Biology', 'Biological molecules'),
  ('aku', 'BIO-9007', 'Biology', 'Biological molecules'),
  ('nums', 'BIO-9008', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9008', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9009', 'Biology', 'Evolution'),
  ('aku', 'BIO-9009', 'Biology', 'Evolution'),
  ('nums', 'BIO-9010', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9010', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9011', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9011', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9012', 'Biology', 'Chromosomes and DNA'),
  ('aku', 'BIO-9012', 'Biology', 'Chromosomes and DNA'),
  ('nums', 'BIO-9013', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9013', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9014', 'Biology', 'Reproduction'),
  ('aku', 'BIO-9014', 'Biology', 'Reproduction'),
  ('nums', 'BIO-9015', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9015', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9016', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9016', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9017', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9017', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9018', 'Biology', 'Immunity'),
  ('aku', 'BIO-9018', 'Biology', 'Immunity'),
  ('nums', 'BIO-9019', 'Biology', 'Enzymes'),
  ('aku', 'BIO-9019', 'Biology', 'Enzymes'),
  ('nums', 'BIO-9020', 'Biology', 'Chromosomes and DNA'),
  ('aku', 'BIO-9020', 'Biology', 'Chromosomes and DNA')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'BIO-9021', 'Biology', 'Cell structure and function'),
  ('aku', 'BIO-9021', 'Biology', 'Cell structure and function'),
  ('nums', 'BIO-9022', 'Biology', 'Evolution'),
  ('aku', 'BIO-9022', 'Biology', 'Evolution'),
  ('nums', 'BIO-9023', 'Biology', 'Homeostasis'),
  ('aku', 'BIO-9023', 'Biology', 'Homeostasis'),
  ('nums', 'BIO-9024', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9024', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9025', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9025', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9026', 'Biology', 'Homeostasis'),
  ('aku', 'BIO-9026', 'Biology', 'Homeostasis'),
  ('nums', 'BIO-9027', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9027', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9028', 'Biology', 'Chromosomes and DNA'),
  ('aku', 'BIO-9028', 'Biology', 'Chromosomes and DNA'),
  ('nums', 'BIO-9029', 'Biology', 'Homeostasis'),
  ('aku', 'BIO-9029', 'Biology', 'Homeostasis'),
  ('nums', 'BIO-9030', 'Biology', 'Homeostasis'),
  ('aku', 'BIO-9030', 'Biology', 'Homeostasis'),
  ('nums', 'BIO-9031', 'Biology', 'Acellular life'),
  ('aku', 'BIO-9031', 'Biology', 'Acellular life'),
  ('nums', 'BIO-9032', 'Biology', 'Inheritance'),
  ('aku', 'BIO-9032', 'Biology', 'Inheritance'),
  ('nums', 'BIO-9033', 'Biology', 'Biotechnology'),
  ('aku', 'BIO-9033', 'Biology', 'Biotechnology'),
  ('nums', 'BIO-9034', 'Biology', 'Cell structure and function'),
  ('aku', 'BIO-9034', 'Biology', 'Cell structure and function'),
  ('nums', 'BIO-9035', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9035', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9036', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9036', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9037', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9037', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9038', 'Biology', 'Enzymes'),
  ('aku', 'BIO-9038', 'Biology', 'Enzymes'),
  ('nums', 'BIO-9039', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9039', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9040', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9040', 'Biology', 'Human physiology')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'BIO-9041', 'Biology', 'Cell structure and function'),
  ('aku', 'BIO-9041', 'Biology', 'Cell structure and function'),
  ('nums', 'BIO-9042', 'Biology', 'Acellular life'),
  ('aku', 'BIO-9042', 'Biology', 'Acellular life'),
  ('nums', 'BIO-9043', 'Biology', 'Inheritance'),
  ('aku', 'BIO-9043', 'Biology', 'Inheritance'),
  ('nums', 'BIO-9044', 'Biology', 'Cell structure and function'),
  ('aku', 'BIO-9044', 'Biology', 'Cell structure and function'),
  ('nums', 'BIO-9045', 'Biology', 'Homeostasis'),
  ('aku', 'BIO-9045', 'Biology', 'Homeostasis'),
  ('nums', 'BIO-9046', 'Biology', 'Inheritance'),
  ('aku', 'BIO-9046', 'Biology', 'Inheritance'),
  ('nums', 'BIO-9047', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9047', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9048', 'Biology', 'Homeostasis'),
  ('aku', 'BIO-9048', 'Biology', 'Homeostasis'),
  ('nums', 'BIO-9049', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9049', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9050', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9050', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9051', 'Biology', 'Reproduction'),
  ('aku', 'BIO-9051', 'Biology', 'Reproduction'),
  ('nums', 'BIO-9052', 'Biology', 'Homeostasis'),
  ('aku', 'BIO-9052', 'Biology', 'Homeostasis'),
  ('nums', 'BIO-9053', 'Biology', 'Immunity'),
  ('aku', 'BIO-9053', 'Biology', 'Immunity'),
  ('nums', 'BIO-9054', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9054', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9055', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9055', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9056', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9056', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9057', 'Biology', 'Reproduction'),
  ('aku', 'BIO-9057', 'Biology', 'Reproduction'),
  ('nums', 'BIO-9058', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9058', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9059', 'Biology', 'Reproduction'),
  ('aku', 'BIO-9059', 'Biology', 'Reproduction'),
  ('nums', 'BIO-9060', 'Biology', 'Bioenergetics'),
  ('aku', 'BIO-9060', 'Biology', 'Bioenergetics')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'BIO-9061', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9061', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9062', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9062', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9063', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9063', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9064', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9064', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9065', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9065', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9066', 'Biology', 'Inheritance'),
  ('aku', 'BIO-9066', 'Biology', 'Inheritance'),
  ('nums', 'BIO-9067', 'Biology', 'Cell structure and function'),
  ('aku', 'BIO-9067', 'Biology', 'Cell structure and function'),
  ('nums', 'BIO-9068', 'Biology', 'Immunity'),
  ('aku', 'BIO-9068', 'Biology', 'Immunity'),
  ('nums', 'BIO-9069', 'Biology', 'Chromosomes and DNA'),
  ('aku', 'BIO-9069', 'Biology', 'Chromosomes and DNA'),
  ('nums', 'BIO-9070', 'Biology', 'Evolution'),
  ('aku', 'BIO-9070', 'Biology', 'Evolution'),
  ('nums', 'BIO-9071', 'Biology', 'Enzymes'),
  ('aku', 'BIO-9071', 'Biology', 'Enzymes'),
  ('nums', 'BIO-9072', 'Biology', 'Biological molecules'),
  ('aku', 'BIO-9072', 'Biology', 'Biological molecules'),
  ('nums', 'BIO-9073', 'Biology', 'Coordination and control'),
  ('aku', 'BIO-9073', 'Biology', 'Coordination and control'),
  ('nums', 'BIO-9074', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9074', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9075', 'Biology', 'Inheritance'),
  ('aku', 'BIO-9075', 'Biology', 'Inheritance'),
  ('nums', 'BIO-9076', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9076', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9077', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9077', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9078', 'Biology', 'Reproduction'),
  ('aku', 'BIO-9078', 'Biology', 'Reproduction'),
  ('nums', 'BIO-9079', 'Biology', 'Human physiology'),
  ('aku', 'BIO-9079', 'Biology', 'Human physiology'),
  ('nums', 'BIO-9080', 'Biology', 'Inheritance'),
  ('aku', 'BIO-9080', 'Biology', 'Inheritance')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'BIO-9081', 'Biology', 'Inheritance'),
  ('aku', 'BIO-9081', 'Biology', 'Inheritance'),
  ('nums', 'CHE-9001', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9001', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9002', 'Chemistry', 'Alkyl halides'),
  ('aku', 'CHE-9002', 'Chemistry', 'Alkyl halides'),
  ('nums', 'CHE-9003', 'Chemistry', 'Alcohols and phenols'),
  ('aku', 'CHE-9003', 'Chemistry', 'Alcohols and phenols'),
  ('nums', 'CHE-9004', 'Chemistry', 'Atomic structure'),
  ('aku', 'CHE-9004', 'Chemistry', 'Atomic structure'),
  ('nums', 'CHE-9005', 'Chemistry', 'Atomic structure'),
  ('aku', 'CHE-9005', 'Chemistry', 'Atomic structure'),
  ('nums', 'CHE-9006', 'Chemistry', 'Alkyl halides'),
  ('aku', 'CHE-9006', 'Chemistry', 'Alkyl halides'),
  ('nums', 'CHE-9007', 'Chemistry', 'Atomic structure'),
  ('aku', 'CHE-9007', 'Chemistry', 'Atomic structure'),
  ('nums', 'CHE-9008', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9008', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9009', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9009', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9010', 'Chemistry', 'Fundamental concepts'),
  ('aku', 'CHE-9010', 'Chemistry', 'Fundamental concepts'),
  ('nums', 'CHE-9011', 'Chemistry', 'Fundamental concepts'),
  ('aku', 'CHE-9011', 'Chemistry', 'Fundamental concepts'),
  ('nums', 'CHE-9012', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9012', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9013', 'Chemistry', 'Alkyl halides'),
  ('aku', 'CHE-9013', 'Chemistry', 'Alkyl halides'),
  ('nums', 'CHE-9014', 'Chemistry', 'Reaction kinetics'),
  ('aku', 'CHE-9014', 'Chemistry', 'Reaction kinetics'),
  ('nums', 'CHE-9015', 'Chemistry', 'Alkyl halides'),
  ('aku', 'CHE-9015', 'Chemistry', 'Alkyl halides'),
  ('nums', 'CHE-9016', 'Chemistry', 'Atomic structure'),
  ('aku', 'CHE-9016', 'Chemistry', 'Atomic structure'),
  ('nums', 'CHE-9017', 'Chemistry', 'Organic chemistry'),
  ('aku', 'CHE-9017', 'Chemistry', 'Organic chemistry'),
  ('nums', 'CHE-9018', 'Chemistry', 'Organic chemistry'),
  ('aku', 'CHE-9018', 'Chemistry', 'Organic chemistry'),
  ('nums', 'CHE-9019', 'Chemistry', 'Thermochemistry'),
  ('aku', 'CHE-9019', 'Chemistry', 'Thermochemistry')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'CHE-9020', 'Chemistry', 'Alcohols and phenols'),
  ('aku', 'CHE-9020', 'Chemistry', 'Alcohols and phenols'),
  ('nums', 'CHE-9021', 'Chemistry', 'Transition elements'),
  ('aku', 'CHE-9021', 'Chemistry', 'Transition elements'),
  ('nums', 'CHE-9022', 'Chemistry', 'Aldehydes, ketones and carboxylic acids'),
  ('aku', 'CHE-9022', 'Chemistry', 'Aldehydes, ketones and carboxylic acids'),
  ('nums', 'CHE-9023', 'Chemistry', 'Fundamental concepts'),
  ('aku', 'CHE-9023', 'Chemistry', 'Fundamental concepts'),
  ('nums', 'CHE-9024', 'Chemistry', 'Reaction kinetics'),
  ('aku', 'CHE-9024', 'Chemistry', 'Reaction kinetics'),
  ('nums', 'CHE-9025', 'Chemistry', 'Electrochemistry'),
  ('aku', 'CHE-9025', 'Chemistry', 'Electrochemistry'),
  ('nums', 'CHE-9026', 'Chemistry', 'Atomic structure'),
  ('aku', 'CHE-9026', 'Chemistry', 'Atomic structure'),
  ('nums', 'CHE-9027', 'Chemistry', 'Electrochemistry'),
  ('aku', 'CHE-9027', 'Chemistry', 'Electrochemistry'),
  ('nums', 'CHE-9028', 'Chemistry', 'Electrochemistry'),
  ('aku', 'CHE-9028', 'Chemistry', 'Electrochemistry'),
  ('nums', 'CHE-9029', 'Chemistry', 'Fundamental concepts'),
  ('aku', 'CHE-9029', 'Chemistry', 'Fundamental concepts'),
  ('nums', 'CHE-9030', 'Chemistry', 'Reaction kinetics'),
  ('aku', 'CHE-9030', 'Chemistry', 'Reaction kinetics'),
  ('nums', 'CHE-9031', 'Chemistry', 'Fundamental principles of organic chemistry'),
  ('aku', 'CHE-9031', 'Chemistry', 'Fundamental principles of organic chemistry'),
  ('nums', 'CHE-9032', 'Chemistry', 'Macromolecules'),
  ('aku', 'CHE-9032', 'Chemistry', 'Macromolecules'),
  ('nums', 'CHE-9033', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9033', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9034', 'Chemistry', 'Chemical equilibrium'),
  ('aku', 'CHE-9034', 'Chemistry', 'Chemical equilibrium'),
  ('nums', 'CHE-9035', 'Chemistry', 'Fundamental concepts'),
  ('aku', 'CHE-9035', 'Chemistry', 'Fundamental concepts'),
  ('nums', 'CHE-9036', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9036', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9037', 'Chemistry', 'Macromolecules'),
  ('aku', 'CHE-9037', 'Chemistry', 'Macromolecules'),
  ('nums', 'CHE-9038', 'Chemistry', 'Aldehydes, ketones and carboxylic acids'),
  ('aku', 'CHE-9038', 'Chemistry', 'Aldehydes, ketones and carboxylic acids'),
  ('nums', 'CHE-9039', 'Chemistry', 'Aldehydes, ketones and carboxylic acids'),
  ('aku', 'CHE-9039', 'Chemistry', 'Aldehydes, ketones and carboxylic acids')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'CHE-9040', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9040', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9041', 'Chemistry', 'States of matter'),
  ('aku', 'CHE-9041', 'Chemistry', 'States of matter'),
  ('nums', 'CHE-9042', 'Chemistry', 'Transition elements'),
  ('aku', 'CHE-9042', 'Chemistry', 'Transition elements'),
  ('nums', 'CHE-9043', 'Chemistry', 'Periodic table and periodicity'),
  ('aku', 'CHE-9043', 'Chemistry', 'Periodic table and periodicity'),
  ('nums', 'CHE-9044', 'Chemistry', 'Thermochemistry'),
  ('aku', 'CHE-9044', 'Chemistry', 'Thermochemistry'),
  ('nums', 'CHE-9045', 'Chemistry', 'Periodic table and periodicity'),
  ('aku', 'CHE-9045', 'Chemistry', 'Periodic table and periodicity'),
  ('nums', 'PHY-9001', 'Physics', 'Waves'),
  ('aku', 'PHY-9001', 'Physics', 'Waves'),
  ('nums', 'PHY-9002', 'Physics', 'Waves'),
  ('aku', 'PHY-9002', 'Physics', 'Waves'),
  ('nums', 'PHY-9003', 'Physics', 'Waves'),
  ('aku', 'PHY-9003', 'Physics', 'Waves'),
  ('nums', 'PHY-9004', 'Physics', 'Thermodynamics'),
  ('aku', 'PHY-9004', 'Physics', 'Thermodynamics'),
  ('nums', 'PHY-9005', 'Physics', 'Force and motion'),
  ('aku', 'PHY-9005', 'Physics', 'Force and motion'),
  ('nums', 'PHY-9006', 'Physics', 'Force and motion'),
  ('aku', 'PHY-9006', 'Physics', 'Force and motion'),
  ('nums', 'PHY-9007', 'Physics', 'Force and motion'),
  ('aku', 'PHY-9007', 'Physics', 'Force and motion'),
  ('nums', 'PHY-9008', 'Physics', 'Electromagnetic induction'),
  ('aku', 'PHY-9008', 'Physics', 'Electromagnetic induction'),
  ('nums', 'PHY-9009', 'Physics', 'Waves'),
  ('aku', 'PHY-9009', 'Physics', 'Waves'),
  ('nums', 'PHY-9010', 'Physics', 'Modern and nuclear physics'),
  ('aku', 'PHY-9010', 'Physics', 'Modern and nuclear physics'),
  ('nums', 'PHY-9011', 'Physics', 'Electromagnetic induction'),
  ('aku', 'PHY-9011', 'Physics', 'Electromagnetic induction'),
  ('nums', 'PHY-9012', 'Physics', 'Electrostatics'),
  ('aku', 'PHY-9012', 'Physics', 'Electrostatics'),
  ('nums', 'PHY-9013', 'Physics', 'Modern and nuclear physics'),
  ('aku', 'PHY-9013', 'Physics', 'Modern and nuclear physics'),
  ('nums', 'PHY-9014', 'Physics', 'Fluid dynamics'),
  ('aku', 'PHY-9014', 'Physics', 'Fluid dynamics')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'PHY-9015', 'Physics', 'Force and motion'),
  ('aku', 'PHY-9015', 'Physics', 'Force and motion'),
  ('nums', 'PHY-9016', 'Physics', 'Work and energy'),
  ('aku', 'PHY-9016', 'Physics', 'Work and energy'),
  ('nums', 'PHY-9017', 'Physics', 'Vectors and equilibrium'),
  ('aku', 'PHY-9017', 'Physics', 'Vectors and equilibrium'),
  ('nums', 'PHY-9018', 'Physics', 'Fluid dynamics'),
  ('aku', 'PHY-9018', 'Physics', 'Fluid dynamics'),
  ('nums', 'PHY-9019', 'Physics', 'Thermodynamics'),
  ('aku', 'PHY-9019', 'Physics', 'Thermodynamics'),
  ('nums', 'PHY-9020', 'Physics', 'Thermodynamics'),
  ('aku', 'PHY-9020', 'Physics', 'Thermodynamics'),
  ('nums', 'PHY-9021', 'Physics', 'Thermodynamics'),
  ('aku', 'PHY-9021', 'Physics', 'Thermodynamics'),
  ('nums', 'PHY-9022', 'Physics', 'Fluid dynamics'),
  ('aku', 'PHY-9022', 'Physics', 'Fluid dynamics'),
  ('nums', 'PHY-9023', 'Physics', 'Electromagnetic induction'),
  ('aku', 'PHY-9023', 'Physics', 'Electromagnetic induction'),
  ('nums', 'PHY-9024', 'Physics', 'Thermodynamics'),
  ('aku', 'PHY-9024', 'Physics', 'Thermodynamics'),
  ('nums', 'PHY-9025', 'Physics', 'Work and energy'),
  ('aku', 'PHY-9025', 'Physics', 'Work and energy'),
  ('nums', 'PHY-9026', 'Physics', 'Waves'),
  ('aku', 'PHY-9026', 'Physics', 'Waves'),
  ('nums', 'PHY-9027', 'Physics', 'Waves'),
  ('aku', 'PHY-9027', 'Physics', 'Waves'),
  ('nums', 'PHY-9028', 'Physics', 'Current electricity'),
  ('aku', 'PHY-9028', 'Physics', 'Current electricity'),
  ('nums', 'PHY-9029', 'Physics', 'Modern and nuclear physics'),
  ('aku', 'PHY-9029', 'Physics', 'Modern and nuclear physics'),
  ('nums', 'PHY-9030', 'Physics', 'Modern and nuclear physics'),
  ('aku', 'PHY-9030', 'Physics', 'Modern and nuclear physics'),
  ('nums', 'PHY-9031', 'Physics', 'Force and motion'),
  ('aku', 'PHY-9031', 'Physics', 'Force and motion'),
  ('nums', 'PHY-9032', 'Physics', 'Waves'),
  ('aku', 'PHY-9032', 'Physics', 'Waves'),
  ('nums', 'PHY-9033', 'Physics', 'Electrostatics'),
  ('aku', 'PHY-9033', 'Physics', 'Electrostatics'),
  ('nums', 'PHY-9034', 'Physics', 'Circular motion'),
  ('aku', 'PHY-9034', 'Physics', 'Circular motion')
) AS v
JOIN questions q ON q.id = v.column2;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT v.column1, v.column2, v.column3, v.column4
FROM (VALUES
  ('nums', 'PHY-9035', 'Physics', 'Electronics'),
  ('aku', 'PHY-9035', 'Physics', 'Electronics'),
  ('nums', 'PHY-9036', 'Physics', 'Waves'),
  ('aku', 'PHY-9036', 'Physics', 'Waves'),
  ('nums', 'ENG-0001', 'English', 'Grammar and sentence correction'),
  ('aku', 'ENG-0001', 'English', 'Grammar and sentence correction'),
  ('nums', 'ENG-0002', 'English', 'Grammar and sentence correction'),
  ('aku', 'ENG-0002', 'English', 'Grammar and sentence correction'),
  ('nums', 'ENG-0003', 'English', 'Vocabulary in context'),
  ('aku', 'ENG-0003', 'English', 'Vocabulary in context'),
  ('nums', 'ENG-0004', 'English', 'Grammar and sentence correction'),
  ('aku', 'ENG-0004', 'English', 'Grammar and sentence correction'),
  ('nums', 'ENG-0005', 'English', 'Grammar and sentence correction'),
  ('aku', 'ENG-0005', 'English', 'Grammar and sentence correction'),
  ('nums', 'ENG-0006', 'English', 'Vocabulary in context'),
  ('aku', 'ENG-0006', 'English', 'Vocabulary in context'),
  ('nums', 'ENG-0007', 'English', 'Grammar and sentence correction'),
  ('aku', 'ENG-0007', 'English', 'Grammar and sentence correction'),
  ('nums', 'ENG-0008', 'English', 'Grammar and sentence correction'),
  ('aku', 'ENG-0008', 'English', 'Grammar and sentence correction'),
  ('nums', 'ENG-0009', 'English', 'Vocabulary in context'),
  ('aku', 'ENG-0009', 'English', 'Vocabulary in context')
) AS v
JOIN questions q ON q.id = v.column2;
