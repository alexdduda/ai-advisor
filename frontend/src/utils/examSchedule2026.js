// April 2026 Final Examination Schedule – McGill University
// Source: Official McGill April 2026 Final Exam Schedule
// All times are Eastern Standard Time (EST)
// D.T. CAMPUS = Downtown Campus | MAC CAMPUS = MacDonald Campus

export const APRIL_2026_EXAMS = [
  // ACCT
  { code: 'ACCT 351', title: 'Intermediate Financial Acct 1', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ACCT 352', title: 'Intermediate Financial Acct 2', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ACCT 361', title: 'Management Accounting', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ACCT 362', title: 'Cost Accounting', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ACCT 385', title: 'Principles of Taxation', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ACCT 453', title: 'Advanced Financial Accounting', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ACCT 463', title: 'Management Control', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ACCT 475', title: 'Principles of Auditing', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  // AEBI
  { code: 'AEBI 211', title: 'Organisms 2', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'MAC' },
  // AECH
  { code: 'AECH 111', title: 'General Chemistry 2', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'MAC' },
  // AEMA
  { code: 'AEMA 102', title: 'Calculus 2', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'MAC' },
  { code: 'AEMA 204', title: 'Data Analytics for Biosystems', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'AEMA 305', title: 'Differential Equations', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'AEMA 310', title: 'Statistical Methods 1', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'AEMA 414', title: 'Temporal&Spatial Statistics', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'AEMA 614', title: 'Temporal&Spatial Statistics 1', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'MAC' },
  // AEPH
  { code: 'AEPH 114', title: 'Introductory Physics 2', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'AEPH 115', title: 'Physics 2', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'MAC' },
  // AGEC
  { code: 'AGEC 231', title: 'Econ Systems of Agriculture', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'MAC' },
  { code: 'AGEC 320', title: 'Intermed Microeconomic Theory', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'AGEC 430', title: 'Agric, Food & Resource Policy', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'AGEC 450', title: 'Agribusiness Management', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'MAC' },
  // AGRI
  { code: 'AGRI 330', title: 'Agricultural Legislation', type: 'ONLINE', date: '2026-04-20', start: '14:00', end: null, campus: null },
  { code: 'AGRI 411', title: 'Global Issues on Dev, Food&Agr', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'MAC' },
  // ANAT
  { code: 'ANAT 212', title: 'Molec Mechanisms of Cell Funct', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ANAT 262', title: 'Intro Molecular &Cell Biol', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ANAT 314', title: 'Human Musculoskeletal Anatomy', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ANAT 316', title: 'Clinical Human Visceral Anat', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ANAT 322', title: 'Neuroendocrinology', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ANAT 416', title: 'Dev., Disease and Regeneration', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ANAT 458', title: 'Membranes & Cellular Signaling', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  // ANSC
  { code: 'ANSC 234', title: 'Biochemistry 2', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'ANSC 301', title: 'Principles of Animal Breeding', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'ANSC 350', title: 'Food-Borne Pathogens', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'MAC' },
  { code: 'ANSC 424', title: 'Metabolic Endocrinology', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'ANSC 458', title: 'Advanced Livestock Management', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'MAC' },
  // ANTH
  { code: 'ANTH 209', title: 'Anthropology of Religion', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ANTH 222', title: 'Legal Anthropology', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ANTH 308', title: 'Political Anthropology', type: 'ONLINE', date: '2026-04-20', start: '09:00', end: null, campus: null },
  { code: 'ANTH 332', title: 'Mesoamerican Archaeology', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ANTH 339', title: 'Ecological Anthropology', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  // ARCH
  { code: 'ARCH 241', title: 'Architectural Structures 1', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ARCH 251', title: 'Architectural History 2', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  // ARTH
  { code: 'ARTH 202', title: 'Intro to Contemporary Art', type: 'ONLINE', date: '2026-04-21', start: '09:00', end: null, campus: null },
  { code: 'ARTH 205', title: 'Introduction to Modern Art', type: 'ONLINE', date: '2026-04-17', start: '09:00', end: null, campus: null },
  { code: 'ARTH 207', title: 'Intro Early Mod. Art 1400-1700', type: 'ONLINE', date: '2026-04-20', start: '09:00', end: null, campus: null },
  { code: 'ARTH 321', title: 'Visual Culture-Dutch Republic', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ARTH 339', title: 'Critical Issues-Contemp Art', type: 'ONLINE', date: '2026-04-27', start: '09:00', end: null, campus: null },
  // ATOC
  { code: 'ATOC 183', title: 'Climate and Climate Change', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ATOC 184', title: 'Science of Storms', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ATOC 215', title: 'Oceans, Weather and Climate', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ATOC 219', title: 'Intro to Atmospheric Chemistry', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ATOC 309', title: 'Weather Radars and Satellites', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ATOC 517', title: 'Boundary Layer Meteorology', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ATOC 541', title: 'Synoptic Meteorology 2', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  // BIEN
  { code: 'BIEN 203', title: 'Intro. to Stats & Data Science', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'BIEN 300', title: 'Thermodynamics in Bioengin', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'BIEN 330', title: 'Tissue Eng & Regenerative Med', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIEN 360', title: 'Physical Chemistry in Bioengin', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIEN 505', title: 'Medical Techno Innovtn & Dev.', type: 'ONLINE', date: '2026-04-21', start: '09:00', end: null, campus: null },
  { code: 'BIEN 535', title: 'ElecMicro&3D Img for BioMatls', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  // BIOC
  { code: 'BIOC 212', title: 'Molec Mechanisms of Cell Funct', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'BIOC 312', title: 'Biochemistry of Macromolecules', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOC 404', title: 'Biophysical Methods in Biochem', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOC 458', title: 'Membranes & Cellular Signaling', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'BIOC 470', title: 'Lipids&Lipoproteins in Disease', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOC 503', title: 'Biochemistry of ImmuneDiseases', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  // BIOL
  { code: 'BIOL 112', title: 'Cell and Molecular Biology', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'BIOL 201', title: 'Cell Biology & Metabolism', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOL 202', title: 'Basic Genetics', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOL 205', title: 'Functional Biol of Plnts&Anmls', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOL 303', title: 'Developmental Biology', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOL 305', title: 'Animal Diversity', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'BIOL 307', title: 'Behavioural Ecology', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'BIOL 319', title: 'Introduction to Biophysics', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'BIOL 441', title: 'Biological Oceanography', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'BIOL 568', title: 'Topics on the Human Genome', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  // BREE
  { code: 'BREE 217', title: 'Hydrology and Water Resources', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'MAC' },
  { code: 'BREE 301', title: 'Biothermodynamics', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'BREE 314', title: 'Agri-Food Buildings', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'BREE 341', title: 'Mechanics of Materials', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'BREE 403', title: 'Biological Material Properties', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'MAC' },
  // CHEE
  { code: 'CHEE 204', title: 'Chem Engineering Principles 2', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEE 220', title: 'Chemical Engrg Thermodynamics', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'CHEE 315', title: 'Heat and Mass Transfer', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEE 351', title: 'Separation Processes', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEE 440', title: 'Process Modelling', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEE 474', title: 'Biochemical Engineering', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEE 484', title: 'Materials Engineering', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEE 582', title: 'Polymer Science & Engineering', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  // CHEM
  { code: 'CHEM 120', title: 'General Chemistry 2', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 181', title: 'World of Chem: Food', type: 'ONLINE', date: '2026-04-17', start: '18:30', end: '21:30', campus: null },
  { code: 'CHEM 204', title: 'Physical Chem/Biological Scis1', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'CHEM 214', title: 'Physical Chem./Biol. Sci. 2', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 219', title: 'Intro to Atmospheric Chemistry', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 222', title: 'Intro Organic Chemistry 2', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 233', title: 'Topics in Physical Chemistry', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 234', title: 'Topics in Organic Chemistry', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 252', title: 'Orgn Chem 2 for Chem&Biochem', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 273', title: 'IntroPhysclChem2:Kinetics&Meth', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 281', title: 'Inorganic Chemistry 1', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 332', title: 'Biological Chemistry', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 334', title: 'Advanced Materials', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 355', title: 'Applications of Quantum Chem.', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 377', title: 'Instrumental Analysis 2', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 482', title: 'Organic Chem:Natural Products', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CHEM 502', title: 'Advanced Bio-Organic Chemistry', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 503', title: 'Drug Discovery', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 533', title: 'Small Molecule Crystallography', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CHEM 572', title: 'Synthetic Organic Chem', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  // CIVE
  { code: 'CIVE 202', title: 'Construction Materials', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CIVE 205', title: 'Statics', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CIVE 206', title: 'Dynamics', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CIVE 207', title: 'Solid Mechanics', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CIVE 225', title: 'Environmental Engineering', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CIVE 302', title: 'Probabilistic Systems', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CIVE 318', title: 'Structural Engineering 2', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CIVE 319', title: 'Transportation Engineering', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CIVE 327', title: 'Fluid Mechanics & Hydraulics', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CIVE 416', title: 'Geotechnical Engineering', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'CIVE 460', title: 'Matrix Structural Analysis', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CIVE 463', title: 'Design of Concrete Structures', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  // CLAS
  { code: 'CLAS 199', title: 'FYS: Classical Studies', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CLAS 203', title: 'Greek Mythology', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CLAS 212', title: 'Introductory Latin 2', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CLAS 222', title: 'Introductory Ancient Greek 2', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CLAS 240', title: 'Intro to Classical Archaeology', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CLAS 302', title: 'Roman Literature and Society', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CLAS 312', title: 'Intermediate Latin 2', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'CLAS 322', title: 'Intermediate Ancient Greek 2', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CLAS 332', title: 'Intermediate Modern Greek 2', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'CLAS 412', title: 'Advanced Latin: Themes', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  // COMP
  { code: 'COMP 189', title: 'Computers and Society', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'COMP 204', title: 'Comp. Programming for Life Sci', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'COMP 206', title: 'Intro to Software Systems', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 208', title: 'Computer Programming for PS&E', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'COMP 251', title: 'Algorithms and Data Structures', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 252', title: 'Honours Algorithms&Data Struct', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 273', title: 'Intro to Computer Systems', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'COMP 302', title: 'Programming Lang & Paradigms', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'COMP 303', title: 'Software Design', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'COMP 310', title: 'Operating Systems', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'COMP 330', title: 'Theory of Computation', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 345', title: 'From Natural Lang to Data Sci', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'COMP 360', title: 'Algorithm Design', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 409', title: 'Concurrent Programming', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 417', title: 'Intro Robots&Intelligent Sys', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'COMP 421', title: 'Database Systems', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 535', title: 'Computer Networks', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 540', title: 'Matrix Computations', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'COMP 546', title: 'Computational Perception', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 558', title: 'Fund. of Computer Vision', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'COMP 559', title: 'Fund. Computer Animation', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  // EAST
  { code: 'EAST 220', title: 'First Level Korean', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EAST 230', title: 'First Level Chinese', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EAST 240', title: 'First Level Japanese', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'EAST 242', title: 'Japanese Writing Beginners 2', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'EAST 320', title: 'Second Level Korean', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'EAST 340', title: 'Second Level Japanese', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'EAST 342', title: 'Japanese Writing Intermed. 2', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EAST 430', title: 'Third Level Chinese', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EAST 440', title: 'Third Level Japanese', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  // ECON
  { code: 'ECON 208', title: 'Microeconomic Analysis&Applic', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 209', title: 'Macroeconomic Analysis&Applic', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECON 219', title: 'Current Econ Problems:Topics', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 227', title: 'Economic Statistics', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECON 230', title: 'Microeconomic Theory', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 250', title: 'Intro to Econ Theory: Honours', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECON 257', title: 'Economic Statistics-Honours', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECON 304', title: 'Financial Instruments & Inst.', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECON 305', title: 'Industrial Organization', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 306', title: 'Labour Markets and Wages', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 310', title: 'Intro to Behavioural Economics', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECON 313', title: 'Economic Development 1', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECON 319', title: 'Economic Crises', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 333', title: 'Macroeconomic Theory -Majors 2', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECON 338', title: 'Intro Econometrics 2', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 350', title: 'Gender and Economics', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECON 354', title: 'Macroeconomics - Honours 2', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECON 409', title: 'Public Sector Economics 2', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECON 424', title: 'International Payments', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECON 447', title: 'Economics of Info&Uncertainty', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECON 450', title: 'Adv Economic Theory 1-Honours', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  // ECSE
  { code: 'ECSE 200', title: 'Electric Circuits 1', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 205', title: 'Prob and Stats for Engineers', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECSE 206', title: 'Intro to Signals and Systems', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 210', title: 'Electric Circuits 2', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 222', title: 'Digital Logic', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 223', title: 'Model-Based Programming', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 250', title: 'Fundls of Software Development', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 251', title: 'Electric and Magnetic Fields', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 308', title: 'Intro to Commun Sys & Networks', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 310', title: 'Thermodynamics of Computing', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 316', title: 'Signals and Networks', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 321', title: 'Intro. to Software Engineering', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 324', title: 'Computer Organization', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 325', title: 'Digital Systems', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 331', title: 'Electronics', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 343', title: 'Numerical Methods in Eng', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 353', title: 'Electromagnetic Fields&Waves', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 354', title: 'Electromag Wave Propagation', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 362', title: 'Fundamentals of Power Eng', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'ECSE 403', title: 'Control', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ECSE 416', title: 'Telecommunication Networks', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 425', title: 'Computer Architecture', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 427', title: 'Operating Systems', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ECSE 552', title: 'Deep Learning', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  // EDKP
  { code: 'EDKP 206', title: 'Biomechanics of Human Movement', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EDKP 208', title: 'Biomechanics & Motor Learning', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'EDKP 342', title: 'Phys. Ed Methods', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'EDKP 391', title: 'Physiology in Sport & Exercise', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EDKP 394', title: 'Historical Perspectives', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EDKP 445', title: 'Exercise Metabolism', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  // ENGL
  { code: 'ENGL 203', title: 'Dept. Survey of English Lit. 2', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ENGL 204', title: 'English Literature & the Bible', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ENGL 225', title: 'American Literature 1', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ENGL 279', title: 'Introduction to Film History', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ENGL 308', title: 'English Renaissance Drama 1', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ENGL 314', title: '20th Century Drama', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'ENGL 328', title: 'Dvlpmnt of Canadian Poetry 1', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'ENGL 336', title: 'The 20th Century Novel 2', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  // EPSC
  { code: 'EPSC 181', title: 'Environmental Geology', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EPSC 186', title: 'Astrobiology', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EPSC 201', title: 'Understanding Planet Earth', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EPSC 212', title: 'Introductory Petrology', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EPSC 225', title: 'Properties of Minerals', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'EPSC 303', title: 'Structural Geology', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'EPSC 334', title: 'Invertebrate Paleontology', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'EPSC 425', title: 'Sediments to Sequences', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  // FACC
  { code: 'FACC 300', title: 'Engineering Economy', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'FACC 400', title: 'Eng Professional Practice', type: 'ONLINE', date: '2026-04-16', start: '09:00', end: '12:00', campus: null },
  // FDSC
  { code: 'FDSC 233', title: 'Physical Chemistry', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'MAC' },
  { code: 'FDSC 251', title: 'Food Chemistry 1', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'MAC' },
  { code: 'FDSC 315', title: 'Separation Tech in Food Anal 1', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'FDSC 334', title: 'Anal of Food Toxins&Toxicants', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'FDSC 516', title: 'Flavour Chemistry', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'FDSC 525', title: 'Food Quality Assurance', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'MAC' },
  { code: 'FDSC 536', title: 'Food Traceability', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'MAC' },
  // FINE
  { code: 'FINE 342', title: 'Corporate Finance', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FINE 441', title: 'Investment Management', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'FINE 442', title: 'Capital Markets & Institutions', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'FINE 443', title: 'Applied Corporate Finance', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'FINE 446', title: 'Behavioural Finance', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FINE 447', title: 'Venture Capital & Ent Finance', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'FINE 448', title: 'Financial Derivatives', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FINE 449', title: 'Risk Management in Finance', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'FINE 451', title: 'Fixed Income Analysis', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FINE 465', title: 'Sustainable Finance', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FINE 477', title: 'Fintech for Business & Finance', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FINE 482', title: 'International Finance 1', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  // FREN
  { code: 'FREN 245', title: 'Grammaire normative', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'FREN 252', title: 'Littérature québécoise', type: 'IN-PERSON', date: '2026-04-27', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'FREN 320', title: 'Traduire, écrire, expérimenter', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FREN 336', title: 'Hist. de la langue française', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'FREN 355', title: 'Littérature du 20e siècle 1', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'FREN 444', title: 'Questions de litt. moderne', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  // GEOG
  { code: 'GEOG 205', title: 'Global Chg:Past, Pres & Future', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'GEOG 217', title: 'Cities in the Modern World', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'GEOG 272', title: 'Earths Changing Surface', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'GEOG 303', title: 'Health Geography', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'GEOG 316', title: 'Political Geography', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  // GSFS
  { code: 'GSFS 200', title: 'Feminist and Social Justice St', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  // HIST
  { code: 'HIST 201', title: 'Modern African History', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'HIST 211', title: 'American History to 1865', type: 'ONLINE', date: '2026-04-20', start: '09:00', end: null, campus: null },
  { code: 'HIST 215', title: 'Modern Europe', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'HIST 216', title: 'Intro to Russian History', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'HIST 218', title: 'Modern East Asian History', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'HIST 222', title: 'History of Pandemics', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'HIST 240', title: 'Mod Hist of Islamic Movements', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'HIST 299', title: 'The Historians Craft', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'HIST 363', title: 'Canada 1870-1914', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'HIST 375', title: 'Rome: Republic to Empire', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'HIST 383', title: 'Eighteenth-Century Britain', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  // INSY
  { code: 'INSY 341', title: 'Developing Business Apps', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'INSY 437', title: 'Managing Data & Databases', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'INSY 446', title: 'DataMiningforBusinessAnalytics', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'INSY 450', title: 'IS Project Management', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  // LING
  { code: 'LING 201', title: 'Introduction to Linguistics', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'LING 260', title: 'Meaning in Language', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'LING 320', title: 'Sociolinguistics 1', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'LING 330', title: 'Phonetics', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'LING 345', title: 'From Natural Lang to Data Sci', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'LING 355', title: 'Language Acquisition 1', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'LING 371', title: 'Syntax 1', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  // MATH
  { code: 'MATH 111', title: 'Math for Education Students', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MATH 123', title: 'Linear Algebra and Probability', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 133', title: 'Linear Algebra and Geometry', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 140', title: 'Calculus 1', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 141', title: 'Calculus 2', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 203', title: 'Principles of Statistics 1', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 204', title: 'Principles of Statistics 2', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 222', title: 'Calculus 3', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 223', title: 'Linear Algebra', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 236', title: 'Algebra 2', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 240', title: 'Discrete Structures', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 243', title: 'Analysis 2', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MATH 247', title: 'Honours Applied Linear Algebra', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 249', title: 'Honours Complex Variables', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 251', title: 'Honours Algebra 2', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 255', title: 'Honours Analysis 2', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 262', title: 'Intermediate Calculus', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 263', title: 'ODEs for Engineers', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 264', title: 'Adv Calculus for Engineers', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 308', title: 'Fundls of Statistical Learning', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MATH 314', title: 'Advanced Calculus', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 315', title: 'Ordinary Differential Eqns', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 319', title: 'Partial Differential Equations', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 323', title: 'Probability', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 324', title: 'Statistics', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MATH 329', title: 'Theory of Interest', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 340', title: 'Discrete Mathematics', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 357', title: 'Honours Statistics', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 358', title: 'Honours Advanced Calculus', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MATH 387', title: 'Honours Numerical Analysis', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 447', title: 'Intro. to Stochastic Processes', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MATH 457', title: 'Honours Algebra 4', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MATH 458', title: 'Honours Differential Geometry', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 510', title: 'Quantitative Risk Management', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MATH 525', title: 'Sampling Theory & Applications', type: 'IN-PERSON', date: '2026-04-16', start: '09:00', end: '12:00', campus: 'D.T.' },
  // MECH
  { code: 'MECH 215', title: 'Statics', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MECH 220', title: 'Introduction to Dynamics', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 240', title: 'Thermodynamics 1', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 241', title: 'Fundamentals of Thermodynamics', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 309', title: 'Numerical Methods in Mech Eng', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 314', title: 'Dynamics of Mechanisms', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 321', title: 'Mechanics of Deformable Solids', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 331', title: 'Fluid Mechanics 1', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 341', title: 'Thermodynamics 2', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 346', title: 'Heat Transfer', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MECH 360', title: 'Principles of Manufacturing', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MECH 383', title: 'Appl Electronics&Instrumentn', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MECH 412', title: 'System Dynamics and Control', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MECH 430', title: 'Fluid Mechanics 2', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  // MGCR
  { code: 'MGCR 211', title: 'Intro to Financial Accounting', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MGCR 233', title: 'Data Programming for Business', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MGCR 271', title: 'Business Statistics', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MGCR 293', title: 'Managerial Economics', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MGCR 294', title: 'The Firm in the Macroeconomy', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MGCR 331', title: 'Information Technology Mgmt', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MGCR 341', title: 'Introduction to Finance', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MGCR 352', title: 'Principles of Marketing', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'MGCR 372', title: 'Operations Management', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MGCR 382', title: 'International Business', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MGCR 423', title: 'Strategic Management', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  // MGPO
  { code: 'MGPO 362', title: 'Fundls of Entrepreneurship', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  // MGSC
  { code: 'MGSC 372', title: 'Advanced Business Statistics', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'MGSC 373', title: 'Operations Research 1', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MGSC 416', title: 'Data-DrivenModelsforOpsAnalyt', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  // MIMM
  { code: 'MIMM 214', title: 'Intro Immun: Elem of Immunity', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MIMM 314', title: 'Intermediate Immunology', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MIMM 387', title: 'The Business of Science', type: 'IN-PERSON', date: '2026-04-16', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MIMM 413', title: 'Parasitology', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'MIMM 466', title: 'Viral Pathogenesis', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  // NEUR
  { code: 'NEUR 310', title: 'Cellular Neurobiology', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  // NSCI
  { code: 'NSCI 201', title: 'Intro. to Neuroscience 2', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  // PATH
  { code: 'PATH 300', title: 'Human Disease', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  // PHAR
  { code: 'PHAR 201', title: 'Introduction to Pharmacology 2', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHAR 301', title: 'Drugs and Disease', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'PHAR 303', title: 'Principles of Toxicology', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  // PHGY
  { code: 'PHGY 210', title: 'Mammalian Physiology 2', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHGY 213', title: 'Introductory Physiology Lab 2', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHGY 312', title: 'Resp.,Renal,&Cardio Physiology', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHGY 313', title: 'Blood,GI,Imm.Syst.Physiol', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  // PHIL
  { code: 'PHIL 201', title: 'Intro to Philosophy 2', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHIL 240', title: 'Political Philosophy 1', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHIL 306', title: 'Philosophy of Mind', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'PHIL 341', title: 'Philosophy of Science 1', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHIL 348', title: 'Philosophy of Law 1', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHIL 354', title: 'Plato', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHIL 367', title: '19th Century Philosophy', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  // PHYS
  { code: 'PHYS 102', title: 'Intro Physics-Electromagnetism', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 142', title: 'Electromagnetism & Optics', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 181', title: 'Everyday Physics', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 183', title: 'The Milky Way Inside and Out', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 186', title: 'Astrobiology', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHYS 232', title: 'Heat and Waves', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHYS 241', title: 'Signal Processing', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 242', title: 'Electricity & Magnetism', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 319', title: 'Introduction to Biophysics', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 331', title: 'Topics in Classical Mechanics', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 333', title: 'Thermal & Statistical Physics', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'PHYS 342', title: 'Majors Electromagnetic Waves', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PHYS 362', title: 'Statistical Mechanics', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHYS 432', title: 'Physics of Fluids', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHYS 447', title: 'Majors Quantum Physics 2', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PHYS 457', title: 'Honours Quantum Physics 2', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  // POLI
  { code: 'POLI 222', title: 'Political Proc&Behav in Canada', type: 'IN-PERSON', date: '2026-04-24', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 227', title: 'Intro to Compar Pol-Global S.', type: 'IN-PERSON', date: '2026-04-24', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'POLI 231', title: 'Intro to Political Theory', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'POLI 321', title: 'Issues:Canadian Public Policy', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'POLI 329', title: 'Russian Politics', type: 'IN-PERSON', date: '2026-04-22', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'POLI 331', title: 'Politics in E Central Europe', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'POLI 334', title: 'Western Political Theory 2', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'POLI 345', title: 'International Organizations', type: 'IN-PERSON', date: '2026-04-28', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 347', title: 'Arab-Israel Confl,Crisis,Peace', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 352', title: 'Intl Pol/Foreign Pol:Africa', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 369', title: 'Politics of Southeast Asia', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 379', title: 'Topics in Canadian Politics', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 381', title: 'Politics in Japan and S Korea', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 427', title: 'Sel Topics:Canadian Politics', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 431', title: 'Nations and Nationalism', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'POLI 435', title: 'Identity and Inequality', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'POLI 448', title: 'Gender and Intl Relations', type: 'IN-PERSON', date: '2026-04-30', start: '14:00', end: '17:00', campus: 'D.T.' },
  // PSYC
  { code: 'PSYC 204', title: 'Intro to Psychological Stats', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PSYC 211', title: 'Intro Behavioural Neuroscience', type: 'IN-PERSON', date: '2026-04-20', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'PSYC 212', title: 'Perception', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PSYC 213', title: 'Cognition', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'PSYC 215', title: 'Social Psychology', type: 'IN-PERSON', date: '2026-04-29', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PSYC 302', title: 'Pain', type: 'IN-PERSON', date: '2026-04-17', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PSYC 304', title: 'Child Development', type: 'IN-PERSON', date: '2026-04-22', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'PSYC 305', title: 'Statistics for Exper Design', type: 'IN-PERSON', date: '2026-04-22', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PSYC 306', title: 'Research Methods in Psychology', type: 'IN-PERSON', date: '2026-04-21', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PSYC 333', title: 'Personality & Social Psych', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'PSYC 337', title: 'Intro to Psychopathology', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PSYC 342', title: 'Hormones & Behaviour', type: 'IN-PERSON', date: '2026-04-21', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PSYC 427', title: 'Sensorimotor Neuroscience', type: 'IN-PERSON', date: '2026-04-28', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'PSYC 439', title: 'Correlational Techniques', type: 'IN-PERSON', date: '2026-04-27', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PSYC 443', title: 'Affective Neuroscience', type: 'IN-PERSON', date: '2026-04-20', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'PSYC 471', title: 'Human Motivation', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  // RELG
  { code: 'RELG 204', title: 'Judaism, Christianity&Islam', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'RELG 222', title: 'World Christianity', type: 'IN-PERSON', date: '2026-04-17', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'RELG 254', title: 'Intro to Yoga Traditions', type: 'IN-PERSON', date: '2026-04-20', start: '14:00', end: '17:00', campus: 'D.T.' },
  // SOCI
  { code: 'SOCI 210', title: 'Sociological Perspectives', type: 'IN-PERSON', date: '2026-04-23', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'SOCI 211', title: 'Sociological Inquiry', type: 'IN-PERSON', date: '2026-04-27', start: '14:00', end: '17:00', campus: 'D.T.' },
  { code: 'SOCI 230', title: 'Sociology of Ethnic Relations', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'SOCI 234', title: 'Population & Society', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'SOCI 245', title: 'The Sociology of Emotions', type: 'IN-PERSON', date: '2026-04-30', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'SOCI 254', title: 'Development&Underdevelopment', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'SOCI 270', title: 'Sociology of Gender', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'SOCI 305', title: 'Socialization', type: 'IN-PERSON', date: '2026-04-29', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'SOCI 307', title: 'Globalization', type: 'IN-PERSON', date: '2026-04-23', start: '18:30', end: '21:30', campus: 'D.T.' },
  { code: 'SOCI 309', title: 'Health and Illness', type: 'IN-PERSON', date: '2026-04-29', start: '09:00', end: '12:00', campus: 'D.T.' },
  { code: 'SOCI 330', title: 'Sociological Theory', type: 'IN-PERSON', date: '2026-04-23', start: '09:00', end: '12:00', campus: 'D.T.' },
]

/**
 * Build a lookup map: normalized course code → exam entry
 * Normalized = uppercase, spaces collapsed, D2 suffixes stripped
 */
const buildExamMap = () => {
  const map = new Map()
  APRIL_2026_EXAMS.forEach(exam => {
    // Primary key: "SUBJ NNN"  e.g. "COMP 302"
    const key = exam.code.trim().toUpperCase()
    map.set(key, exam)
  })
  return map
}

export const EXAM_MAP = buildExamMap()

/**
 * Given a course_code string like "COMP 302", "MATH141", or "EAST 220D2",
 * returns the matching exam entry or null.
 */
export function lookupExam(courseCode) {
  if (!courseCode) return null
  // Normalize: uppercase, collapse spaces, trim
  let norm = courseCode.trim().toUpperCase().replace(/\s+/g, ' ')

  // If no space between letters and digits, insert one (e.g. "COMP302" → "COMP 302")
  norm = norm.replace(/^([A-Z]{2,4})(\d)/, '$1 $2')

  // Direct hit first
  if (EXAM_MAP.has(norm)) return EXAM_MAP.get(norm)

  // Strip trailing D2 / D1 suffix  e.g. "EAST 220D2" → "EAST 220"
  const withoutD = norm.replace(/\s?D\d$/, '').trim()
  if (EXAM_MAP.has(withoutD)) return EXAM_MAP.get(withoutD)

  // Strip trailing section codes like "001" or "002"
  const withoutSection = norm.replace(/\s+\d{3}$/, '').trim()
  if (EXAM_MAP.has(withoutSection)) return EXAM_MAP.get(withoutSection)

  // Try stripping both
  const withoutBoth = withoutD.replace(/\s?D\d$/, '').replace(/\s+\d{3}$/, '').trim()
  if (EXAM_MAP.has(withoutBoth)) return EXAM_MAP.get(withoutBoth)

  return null
}

/**
 * Format start time as 12-hour clock string e.g. "2:00 PM"
 */
export function formatExamTime(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}
