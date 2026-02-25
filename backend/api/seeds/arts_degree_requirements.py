"""
McGill Faculty of Arts – Degree Requirements Seed Data
Source: McGill Course Catalogue 2024-2025 / 2025-2026
https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/

Run this script directly to populate the database, or import ARTS_PROGRAMS
and use it in the API route.

Accuracy notes:
  - Verified from official McGill eCalendar / Course Catalogue
  - "recommended" courses are author suggestions, not official
  - Always cross-check with current catalogue before academic decisions
"""

ARTS_PROGRAMS = [

  {
    "program_key": "cognitive_science_minor",
    "name": "Cognitive Science – Minor (B.Sc.)",
    "program_type": "minor",
    "faculty": "Faculty of Arts",
    "total_credits": 24,
    "description": (
      "The Minor in Cognitive Science is intended to allow students in the Faculty of Arts "
      "or the Faculty of Science to explore the interdisciplinary study of cognition. "
      "Open to both faculties. Students complete a minimum of 9 credits each in two areas "
      "from: Computer Science & Mathematics, Linguistics, Philosophy, or Psychology."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/science/programs/cognitive-science/cognitive-science-minor-bsc/",
    "blocks": [
      {
        "block_key": "cogs_required",
        "title": "Required Course",
        "block_type": "required",
        "credits_needed": 3,
        "courses_needed": None,
        "group_name": None,
        "notes": "Must be taken by all students in the minor.",
        "sort_order": 1,
        "courses": [
          {"subject": "PSYC", "catalog": "433", "title": "Cognitive Science", "credits": 3, "is_required": True},
        ],
      },
      {
        "block_key": "cogs_comp_sci_math",
        "title": "Computer Science and Mathematics",
        "block_type": "group",
        "credits_needed": None,
        "courses_needed": None,
        "group_name": "Group – Computer Science and Mathematics",
        "notes": "Students complete a minimum of 9 credits each in two of the four areas. Min 6 credits at 400–500 level across all complementary courses. Students may not take courses from their home department(s).",
        "sort_order": 2,
        "courses": [
          {"subject": "COMP", "catalog": "206",  "title": "Introduction to Software Systems",       "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "230",  "title": "Logic and Computability",                "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "250",  "title": "Introduction to Computer Science",       "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "251",  "title": "Algorithms and Data Structures",         "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "302",  "title": "Programming Languages and Paradigms",    "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "330",  "title": "Theory of Computation",                  "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "527",  "title": "Logic and Computation",                  "credits": 3, "is_required": False},
          {"subject": "MATH", "catalog": "240",  "title": "Discrete Structures",                    "credits": 3, "is_required": False},
          {"subject": "MATH", "catalog": "318",  "title": "Mathematical Logic",                     "credits": 3, "is_required": False},
        ],
      },
      {
        "block_key": "cogs_linguistics",
        "title": "Linguistics",
        "block_type": "group",
        "credits_needed": None,
        "courses_needed": None,
        "group_name": "Group – Linguistics",
        "notes": "Any LING course at the 300, 400, or 500 level also counts. Students complete a minimum of 9 credits each in two of the four areas.",
        "sort_order": 3,
        "courses": [
          {"subject": "LING", "catalog": "201",  "title": "Introduction to Linguistics",    "credits": 3, "is_required": False},
          {"subject": "LING", "catalog": "210",  "title": "Introduction to Speech Science", "credits": 3, "is_required": False},
          {"subject": "LING", "catalog": "260",  "title": "Meaning in Language",            "credits": 3, "is_required": False},
        ],
      },
      {
        "block_key": "cogs_philosophy",
        "title": "Philosophy",
        "block_type": "group",
        "credits_needed": None,
        "courses_needed": None,
        "group_name": "Group – Philosophy",
        "notes": "Students complete a minimum of 9 credits each in two of the four areas.",
        "sort_order": 4,
        "courses": [
          {"subject": "PHIL", "catalog": "210",  "title": "Introduction to Deductive Logic 1",              "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "221",  "title": "Introduction to History and Philosophy of Science 2", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "306",  "title": "Philosophy of Mind",                             "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "310",  "title": "Intermediate Logic",                             "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "311",  "title": "Philosophy of Mathematics",                      "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "341",  "title": "Philosophy of Science 1",                        "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "411",  "title": "Topics in Philosophy of Logic and Mathematics",  "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "415",  "title": "Philosophy of Language",                         "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "441",  "title": "Philosophy of Science 2",                        "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "474",  "title": "Phenomenology",                                  "credits": 3, "is_required": False},
        ],
      },
      {
        "block_key": "cogs_psychology",
        "title": "Psychology",
        "block_type": "group",
        "credits_needed": None,
        "courses_needed": None,
        "group_name": "Group – Psychology",
        "notes": "Students complete a minimum of 9 credits each in two of the four areas.",
        "sort_order": 5,
        "courses": [
          {"subject": "PSYC", "catalog": "212",  "title": "Perception",                                "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "213",  "title": "Cognition",                                 "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "301",  "title": "Animal Learning and Theory",                "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "304",  "title": "Child Development",                         "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "310",  "title": "Intelligence",                              "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "311",  "title": "Human Cognition and the Brain",             "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "315",  "title": "Computational Psychology",                  "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "319",  "title": "Computational Models - Cognition",          "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "340",  "title": "Psychology of Language",                    "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "410",  "title": "Special Topics in Neuropsychology",         "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "413",  "title": "Cognitive Development",                     "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "538",  "title": "Categorization, Communication and Consciousness", "credits": 3, "is_required": False},
        ],
      },
    ],
  },


  # ──────────────────────────────────────────────────────────────────
  # ANTHROPOLOGY
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "anthropology_major",
    "name": "Anthropology – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Emphasises the similarity and diversity of human behaviour; "
      "understanding of social and cultural systems; and the processes "
      "of socio-cultural change from human origins to the present."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/anthropology/anthropology-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "intro_200",
        "title": "200-Level Introductory Courses",
        "credits_needed": 6,
        "notes": "6 credits selected from 200-level ANTH courses.",
        "courses": [
          {"subject":"ANTH","catalog":"201","title":"Intro to Sociocultural Anthropology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Best general intro; covers core theory"},
          {"subject":"ANTH","catalog":"202","title":"Intro to Biological Anthropology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Foundational for bio-anth track"},
          {"subject":"ANTH","catalog":"203","title":"Intro to Prehistoric Archaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"204","title":"Intro to Linguistic Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"206","title":"Human Origins","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"207","title":"Magic, Witchcraft and Religion","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"208","title":"Anthropology of Development","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"209","title":"Language and Culture","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"210","title":"Society, Culture and Space","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"212","title":"Comparative Ethnography","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "core_350",
        "title": "350-Level Core Courses",
        "credits_needed": 6,
        "notes": "Both ANTH 352 and ANTH 353 required (U2 standing required).",
        "courses": [
          {"subject":"ANTH","catalog":"352","title":"History of Anthropological Theory","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Essential theoretical grounding; take in U2"},
          {"subject":"ANTH","catalog":"353","title":"Contemporary Anthropological Theory","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Continues from ANTH 352; pairs well"},
        ],
      },
      {
        "block_key": "upper_400",
        "title": "400-Level Courses",
        "credits_needed": 6,
        "notes": "6 credits from 400-level ANTH courses. Requires U2 standing.",
        "min_level": 400,
        "courses": [
          {"subject":"ANTH","catalog":"451","title":"Archaeological Theory","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Highly rated; good for theory track"},
          {"subject":"ANTH","catalog":"470","title":"Political Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"480","title":"Economic Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"490","title":"Ritual and Religion","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Additional ANTH Electives",
        "credits_needed": 18,
        "max_credits_200": 6,
        "notes": "18 credits of additional ANTH courses; at most 6 credits may be at 200-level.",
        "courses": [
          {"subject":"ANTH","catalog":None,"title":"Any ANTH course 200-level or above","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "anthropology_minor",
    "name": "Anthropology – Minor Concentration",
    "program_type": "minor",
    "faculty": "Faculty of Arts",
    "total_credits": 18,
    "description": "18 credits in Anthropology. May focus on one sub-field or explore all. Can be expanded into the Major.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/anthropology/anthropology-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "anth_minor_200",
        "title": "200-Level ANTH Courses",
        "credits_needed": 6,
        "notes": "6–9 credits from 200-level ANTH courses.",
        "courses": [
          {"subject":"ANTH","catalog":"201","title":"Introduction to Archaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"202","title":"Socio-Cultural Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"203","title":"Human Evolution","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"204","title":"Anthropology of Meaning","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"206","title":"Environment and Culture","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"207","title":"Ethnography Through Film","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"209","title":"Anthropology of Religion","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"210","title":"Archaeology of Early Cities","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"212","title":"Anthropology of Development","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"213","title":"Archaeology of Health and Disease","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"214","title":"Violence, Warfare, Culture","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"222","title":"Legal Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"227","title":"Medical Anthropology","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "anth_minor_300up",
        "title": "300/400/500-Level ANTH Courses",
        "credits_needed": 9,
        "notes": "9–12 credits from ANTH 300-, 400-, or 500-level. Max 3 credits at 400/500-level. Max 1 Special Topics course.",
        "courses": [
          {"subject":"ANTH","catalog":"302","title":"New Horizons in Medical Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"303","title":"Ethnographies of Post-socialism","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"304","title":"Chinese Culture in Ethnography and Film","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"307","title":"Andean Prehistory","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"308","title":"Political Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"312","title":"Zooarchaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"313","title":"Bioarchaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"314","title":"Psychological Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"315","title":"Society/Culture: East Africa","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"318","title":"Globalization and Religion","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"319","title":"Inka Archaeology and Ethnohistory","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"322","title":"Social Change in Modern Africa","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"325","title":"Anthropology of the Self","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"326","title":"Anthropology of Latin America","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"327","title":"Anthropology of South Asia","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"330","title":"Traditional Whaling Societies","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"331","title":"Prehistory of East Asia","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"332","title":"Mesoamerican Archaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"338","title":"Indigenous Studies of Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"339","title":"Ecological Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"340","title":"Middle Eastern Society and Culture","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"343","title":"Anthropology and the Animal","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"344","title":"Quantitative Approaches to Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"352","title":"History of Anthropological Theory","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"355","title":"Theories of Culture and Society","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"357","title":"Archaeological Methods","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"358","title":"The Process of Anthropological Research","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"359","title":"History of Archaeological Theory","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"361","title":"Archaeology of South Asia","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"365","title":"Anthropology of Forced Migration and Displacement","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"370","title":"Anthropology and the Image","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"380","title":"Special Topic 1","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"381","title":"Special Topic 2","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"385","title":"Sex, Science and Culture","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"402","title":"Topics in Ethnography","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"403","title":"Current Issues in Archaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"407","title":"Anthropology of the Body","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"408","title":"Sensory Ethnography","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"410","title":"Great Debates in Anthropological Theory","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"415","title":"Anthropology of Religious Experience","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"416","title":"Environment/Development: Africa","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"418","title":"Environment and Development","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"419","title":"Archaeology of Hunter-Gatherers","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"420","title":"Anthropology of Economic Relations","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"423","title":"Mind, Brain and Psychopathology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"432","title":"The Aztecs","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"436","title":"North American Native Peoples","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"437","title":"Historical Archaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"438","title":"Topics in Medical Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"440","title":"Cognitive Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"450","title":"Archaeology of Landscape","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"499","title":"Internship: Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"500","title":"Chinese Diversity and Diaspora","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"501","title":"Anthropology Beyond the Human","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"502","title":"Social Life of Death","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"503","title":"Production of the Past","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"504","title":"Environmental Archaeology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"510","title":"Advanced Problems in Anthropology of Religion","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"512","title":"Political Ecology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"520","title":"Problems and Perspectives in Medical Anthropology","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # ECONOMICS
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "economics_major",
    "name": "Economics – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "A planned sequence of courses designed to permit the student a degree "
      "of specialization in economics. Students entering U1 proceed directly "
      "to ECON 230D1/D2 (not ECON 208/209)."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/economics/economics-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required_core",
        "title": "Required Core (18 credits)",
        "credits_needed": 18,
        "notes": "All six of these courses are required.",
        "courses": [
          {"subject":"ECON","catalog":"227D1","title":"Economic Statistics 1","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Take Fall U1 — stats foundation for all upper courses"},
          {"subject":"ECON","catalog":"227D2","title":"Economic Statistics 2","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Continuation; must take with 227D1 in consecutive terms"},
          {"subject":"ECON","catalog":"230D1","title":"Microeconomic Theory 1","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Core micro; entry point for all 300+ courses"},
          {"subject":"ECON","catalog":"230D2","title":"Microeconomic Theory 2","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"332","title":"Macroeconomic Theory: Majors 1","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Take after 230D2; macro side of the core"},
          {"subject":"ECON","catalog":"333","title":"Macroeconomic Theory: Majors 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Complementary Economics Electives (18 credits)",
        "credits_needed": 18,
        "min_credits_400": 6,
        "max_credits_200": 6,
        "notes": "18 credits from ECON 200+ (above 209). At least 6 credits at 400/500-level. Max 6 credits at 200-level.",
        "courses": [
          {"subject":"ECON","catalog":"330D1","title":"Intermediate Microeconomics 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Best complement to 230D; deeper micro theory"},
          {"subject":"ECON","catalog":"330D2","title":"Intermediate Microeconomics 2","credits":3,"is_required":False,"recommended":True},
          {"subject":"ECON","catalog":"338","title":"Labour Economics","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Very popular; great for policy track"},
          {"subject":"ECON","catalog":"340","title":"Money and Banking","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"342","title":"Public Finance","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Useful for government/policy careers"},
          {"subject":"ECON","catalog":"352","title":"Environmental Economics","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"400","title":"International Trade","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Strong 400-level option; satisfies 400+ requirement"},
          {"subject":"ECON","catalog":"404","title":"Economic History","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"406","title":"Industrial Organisation","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"430D1","title":"Advanced Microeconomics 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Good prep for grad school"},
          {"subject":"ECON","catalog":"430D2","title":"Advanced Microeconomics 2","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"440","title":"Econometrics","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Essential for quantitative/research track"},
          {"subject":"ECON","catalog":"450D1","title":"Advanced Macroeconomics 1","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"450D2","title":"Advanced Macroeconomics 2","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "economics_minor",
    "name": "Economics – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "Provides a moderate level of specialization in Economics. ECON 208 and 209 count only toward the minor, not the major.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/economics/economics-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "intro",
        "title": "Introductory Courses (6 credits)",
        "credits_needed": 6,
        "notes": "ECON 208 and 209 are allowed for the minor (unlike the major).",
        "courses": [
          {"subject":"ECON","catalog":"208","title":"Microeconomic Analysis and Applications","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Standard entry for minor students"},
          {"subject":"ECON","catalog":"209","title":"Macroeconomic Analysis and Applications","credits":3,"is_required":False,"recommended":True},
        ],
      },
      {
        "block_key": "upper",
        "title": "Upper-Level ECON Courses (12 credits)",
        "credits_needed": 12,
        "min_level": 200,
        "notes": "12 credits of ECON courses above 209, at least 6 credits at 300-level or above.",
        "courses": [
          {"subject":"ECON","catalog":"227D1","title":"Economic Statistics 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"ECON","catalog":"227D2","title":"Economic Statistics 2","credits":3,"is_required":False,"recommended":True},
          {"subject":"ECON","catalog":"338","title":"Labour Economics","credits":3,"is_required":False,"recommended":True},
          {"subject":"ECON","catalog":"342","title":"Public Finance","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"352","title":"Environmental Economics","credits":3,"is_required":False},
          {"subject":"ECON","catalog":None,"title":"Any ECON course above 209","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # POLITICAL SCIENCE
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "political_science_major",
    "name": "Political Science – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "A 36-credit program covering four fields: Comparative Politics, "
      "International Relations, Canadian Politics, and Political Theory "
      "(including empirical methods). Max 18 credits in any single field "
      "(21 for Comparative Politics)."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/political-science/political-science-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "canadian_politics",
        "title": "Canadian Politics",
        "credits_needed": None,
        "notes": "Field cap: max 18 credits in Canadian Politics.",
        "courses": [
          {"subject":"POLI","catalog":"212","title":"Canadian Government and Politics","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Best entry point for Canadian track"},
          {"subject":"POLI","catalog":"221","title":"Quebec Politics","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Essential for Montreal students; highly rated"},
          {"subject":"POLI","catalog":"222","title":"Canadian Politics","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"300","title":"Constitutional Law and Government","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"322","title":"Political Parties in Canada","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"372","title":"Indigenous Peoples and the Canadian State","credits":3,"is_required":False,"recommended":True},
        ],
      },
      {
        "block_key": "comparative_politics",
        "title": "Comparative Politics",
        "credits_needed": None,
        "notes": "Field cap: max 21 credits in Comparative Politics.",
        "courses": [
          {"subject":"POLI","catalog":"211","title":"Introduction to Comparative Politics","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Ideal first course for comparative track"},
          {"subject":"POLI","catalog":"311","title":"Politics of Development","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"315","title":"Politics of the Middle East","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"318","title":"European Politics","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"320","title":"Politics of East Asia","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"323","title":"Politics of South Asia","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"324","title":"Comparative Politics of Africa","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"330","title":"Authoritarianism and Democratization","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "international_relations",
        "title": "International Relations",
        "credits_needed": None,
        "notes": "Field cap: max 18 credits in International Relations.",
        "courses": [
          {"subject":"POLI","catalog":"226","title":"Introduction to International Relations","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Essential IR foundations; take in U1"},
          {"subject":"POLI","catalog":"327","title":"International Security","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"340","title":"International Political Economy","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"350","title":"Canadian Foreign Policy","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"430","title":"Theories of International Relations","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"443","title":"Global Governance","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "political_theory",
        "title": "Political Theory",
        "credits_needed": None,
        "notes": "Field cap: max 18 credits in Political Theory.",
        "courses": [
          {"subject":"POLI","catalog":"231","title":"Introduction to Political Theory","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Foundational theory — take early"},
          {"subject":"POLI","catalog":"227","title":"Introduction to Empirical Political Science","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Methods requirement; take in U1"},
          {"subject":"POLI","catalog":"331","title":"Modern Political Theory","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"332","title":"Contemporary Political Theory","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"430","title":"Theories of International Relations","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"450","title":"Advanced Political Theory","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "political_science_minor",
    "name": "Political Science – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit program in four fields: Comparative Politics, International Relations, Canadian Politics, and Political Theory.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/political-science/political-science-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "all_fields",
        "title": "POLI Courses Across Fields",
        "credits_needed": 18,
        "notes": "6-9 credits at 200-level across at least two different fields. Max 6 credits in any one field.",
        "courses": [
          {"subject":"POLI","catalog":"211","title":"Introduction to Comparative Politics","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"212","title":"Canadian Government and Politics","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"226","title":"Introduction to International Relations","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"227","title":"Introduction to Empirical Political Science","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"231","title":"Introduction to Political Theory","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"221","title":"Quebec Politics","credits":3,"is_required":False},
          {"subject":"POLI","catalog":None,"title":"Upper-level POLI course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # PSYCHOLOGY
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "psychology_major",
    "name": "Psychology – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Provides a basic overview of psychological science covering core areas "
      "and advanced specialized content. Note: PSYC 204 exemption possible for "
      "CEGEP students with statistics background."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/psychology/psychology-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required_core",
        "title": "Required Core Courses",
        "credits_needed": 12,
        "notes": "All four required. PSYC 204 can be replaced by 3 credits at 300+ (PSYC/ANTH/LING/SOCI) if CEGEP stats exempt.",
        "courses": [
          {"subject":"PSYC","catalog":"100","title":"Introduction to Psychology","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Take in U1 Fall — required foundation"},
          {"subject":"PSYC","catalog":"204","title":"Introduction to Psychological Statistics","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Stats core; take early, required for 300+ courses"},
          {"subject":"PSYC","catalog":"211","title":"Intro to Behavioural Neuroscience","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Neuro foundation — enables many upper courses"},
          {"subject":"PSYC","catalog":"305","title":"Research Methods in Psychology","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Methods core; take before upper-level seminars"},
        ],
      },
      {
        "block_key": "list_a",
        "title": "List A – Behavioural Neuroscience, Cognition & Quantitative",
        "credits_needed": 3,
        "notes": "3 credits from List A.",
        "courses": [
          {"subject":"PSYC","catalog":"212","title":"Perception","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Fascinating; good entry to cognitive track"},
          {"subject":"PSYC","catalog":"213","title":"Introduction to Cognitive Science","credits":3,"is_required":False,"recommended":True},
          {"subject":"PSYC","catalog":"304","title":"Learning and Behaviour","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"311","title":"Human Cognition and the Brain","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"319","title":"Computational Models – Cognition","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "list_b",
        "title": "List B – Social, Health & Developmental Psychology",
        "credits_needed": 3,
        "notes": "3 credits from List B.",
        "courses": [
          {"subject":"PSYC","catalog":"215","title":"Social Psychology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Most popular PSYC elective at McGill"},
          {"subject":"PSYC","catalog":"216","title":"Developmental Psychology","credits":3,"is_required":False,"recommended":True},
          {"subject":"PSYC","catalog":"222","title":"Abnormal Psychology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Very popular; accessible and engaging"},
          {"subject":"PSYC","catalog":"314","title":"Health Psychology","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "upper_300",
        "title": "Upper-Level PSYC Electives (300+)",
        "credits_needed": 6,
        "min_level": 300,
        "notes": "6 credits from PSYC courses at 300-level or above.",
        "courses": [
          {"subject":"PSYC","catalog":"307","title":"Clinical Psychology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Great if interested in clinical track"},
          {"subject":"PSYC","catalog":"328","title":"Psychopathology","credits":3,"is_required":False,"recommended":True},
          {"subject":"PSYC","catalog":"340","title":"Child Psychopathology","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"350","title":"Language and the Brain","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"402","title":"Motivation and Emotion","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"414","title":"Social Cognition","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"519","title":"Human Learning and Memory","credits":3,"is_required":False,"recommended":True},
        ],
      },
      {
        "block_key": "free_psyc",
        "title": "Additional PSYC Electives",
        "credits_needed": 12,
        "notes": "12 additional credits in PSYC.",
        "courses": [
          {"subject":"PSYC","catalog":None,"title":"Any PSYC course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "psychology_minor",
    "name": "Psychology – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "A 18-credit introduction to psychological science for students with a primary interest elsewhere.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/psychology/psychology-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 6,
        "courses": [
          {"subject":"PSYC","catalog":"100","title":"Introduction to Psychology","credits":3,"is_required":True,"recommended":True},
          {"subject":"PSYC","catalog":"204","title":"Introduction to Psychological Statistics","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "PSYC Electives",
        "credits_needed": 12,
        "notes": "12 credits of PSYC courses; at least one course at 300+ level.",
        "min_level": None,
        "courses": [
          {"subject":"PSYC","catalog":"211","title":"Intro to Behavioural Neuroscience","credits":3,"is_required":False,"recommended":True},
          {"subject":"PSYC","catalog":"215","title":"Social Psychology","credits":3,"is_required":False,"recommended":True},
          {"subject":"PSYC","catalog":"216","title":"Developmental Psychology","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"222","title":"Abnormal Psychology","credits":3,"is_required":False,"recommended":True},
          {"subject":"PSYC","catalog":None,"title":"Any PSYC course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # SOCIOLOGY
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "sociology_major",
    "name": "Sociology – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Gives students a comprehensive understanding of sociology. "
      "Required courses (SOCI 210, 211, 330, 350) must be taken at McGill."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/sociology/sociology-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Courses",
        "credits_needed": 12,
        "notes": "All four required; SOCI 350 can be replaced by equivalent stats course (ECON 227D, PSYC 204, etc.) but must be replaced by another SOCI 300+ course.",
        "courses": [
          {"subject":"SOCI","catalog":"210","title":"Sociological Perspectives","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Take U1 Fall; foundational intro"},
          {"subject":"SOCI","catalog":"211","title":"Sociological Inquiry","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Methods core; take alongside 210"},
          {"subject":"SOCI","catalog":"330","title":"Classical Sociological Theory","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Marx, Weber, Durkheim — essential"},
          {"subject":"SOCI","catalog":"350","title":"Statistics in Social Research","credits":3,"is_required":True,"notes":"Equivalents: ECON 227D, PSYC 204, MATH 203, MGCR 271 etc."},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Complementary Courses",
        "credits_needed": 24,
        "min_credits_400": 3,
        "max_credits_200": 9,
        "notes": "At least 3 credits at 400-level; max 9 credits at 200-level. Max 6 credits from SOCI 340/341/342/343/440/441/442/443.",
        "courses": [
          {"subject":"SOCI","catalog":"230","title":"Self and Society","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Popular; pairs well with 210"},
          {"subject":"SOCI","catalog":"234","title":"Sociology of Gender","credits":3,"is_required":False,"recommended":True},
          {"subject":"SOCI","catalog":"245","title":"Population and Society","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"250","title":"Social Inequality","credits":3,"is_required":False,"recommended":True},
          {"subject":"SOCI","catalog":"254","title":"Development and Underdevelopment","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"310","title":"Medical Sociology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Very popular upper-level course"},
          {"subject":"SOCI","catalog":"340","title":"Criminology","credits":3,"is_required":False,"recommended":True},
          {"subject":"SOCI","catalog":"360","title":"Urban Sociology","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"370","title":"Environmental Sociology","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"400","title":"Advanced Seminar in Sociology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Satisfies 400-level requirement"},
          {"subject":"SOCI","catalog":None,"title":"Any SOCI course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "sociology_minor",
    "name": "Sociology – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "Gives students a basic understanding of sociology. Required courses must be taken at McGill.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/sociology/sociology-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Courses",
        "credits_needed": 9,
        "notes": "SOCI 210, 211 required. Plus either SOCI 330 or SOCI 350.",
        "courses": [
          {"subject":"SOCI","catalog":"210","title":"Sociological Perspectives","credits":3,"is_required":True,"recommended":True},
          {"subject":"SOCI","catalog":"211","title":"Sociological Inquiry","credits":3,"is_required":True,"recommended":True},
          {"subject":"SOCI","catalog":"330","title":"Classical Sociological Theory OR","credits":3,"is_required":False,"choose_from_group":"theory_or_stats","choose_n_credits":3,"recommended":True},
          {"subject":"SOCI","catalog":"350","title":"Statistics in Social Research","credits":3,"is_required":False,"choose_from_group":"theory_or_stats","choose_n_credits":3},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Complementary Courses",
        "credits_needed": 9,
        "notes": "9 credits of SOCI; at least one course at 300-level or above.",
        "courses": [
          {"subject":"SOCI","catalog":"230","title":"Self and Society","credits":3,"is_required":False,"recommended":True},
          {"subject":"SOCI","catalog":"250","title":"Social Inequality","credits":3,"is_required":False,"recommended":True},
          {"subject":"SOCI","catalog":"310","title":"Medical Sociology","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":None,"title":"Any SOCI course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # LINGUISTICS
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "linguistics_major",
    "name": "Linguistics – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Covers theoretical linguistics (phonology, syntax, semantics), "
      "experimental linguistics, computational linguistics, and sociolinguistics."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/linguistics/linguistics-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core Courses",
        "credits_needed": 15,
        "notes": "All five required. Must be taken at McGill.",
        "courses": [
          {"subject":"LING","catalog":"201","title":"Introduction to Linguistics","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"First course — gateway to all others"},
          {"subject":"LING","catalog":"330","title":"Phonetics","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Take after LING 201; prereq for LING 331"},
          {"subject":"LING","catalog":"331","title":"Phonology 1","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Core phonology — take in U2"},
          {"subject":"LING","catalog":"360","title":"Introduction to Semantics","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Requires LING 201 + logic course"},
          {"subject":"LING","catalog":"371","title":"Syntax 1","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Core syntax; take before 400-level"},
        ],
      },
      {
        "block_key": "logic",
        "title": "Logic/Formal Methods",
        "credits_needed": 3,
        "notes": "One of: COMP 230, MATH 318, or PHIL 210.",
        "courses": [
          {"subject":"PHIL","catalog":"210","title":"Introduction to Deductive Logic 1","credits":3,"is_required":False,"choose_from_group":"logic","choose_n_credits":3,"recommended":True,"recommendation_reason":"Most accessible option; great standalone course"},
          {"subject":"COMP","catalog":"230","title":"Logic and Computability","credits":3,"is_required":False,"choose_from_group":"logic","choose_n_credits":3},
          {"subject":"MATH","catalog":"318","title":"Mathematical Logic","credits":3,"is_required":False,"choose_from_group":"logic","choose_n_credits":3},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Complementary LING Electives",
        "credits_needed": 18,
        "min_credits_400": 9,
        "max_credits_200": 3,
        "notes": "18 credits of LING courses; at least 9 at 400/500-level; max 3 at 200-level.",
        "courses": [
          {"subject":"LING","catalog":"320","title":"Sociolinguistics 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Popular 300-level; great complement to phonetics"},
          {"subject":"LING","catalog":"325","title":"Canadian English","credits":3,"is_required":False},
          {"subject":"LING","catalog":"350","title":"Linguistic Aspects of Bilingualism","credits":3,"is_required":False,"recommended":True},
          {"subject":"LING","catalog":"355","title":"Language Acquisition 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Top-rated course; good for cognitive science crossover"},
          {"subject":"LING","catalog":"440","title":"Morphology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Essential 400-level; satisfies upper-level req"},
          {"subject":"LING","catalog":"425","title":"Historical Linguistics","credits":3,"is_required":False},
          {"subject":"LING","catalog":"520","title":"Sociolinguistics 2","credits":3,"is_required":False},
          {"subject":"LING","catalog":"550","title":"Computational Linguistics","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Valuable CS crossover; growing field"},
          {"subject":"LING","catalog":"571","title":"Syntax 2","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Continues from LING 371; required for syntax track"},
        ],
      },
    ],
  },

  {
    "program_key": "linguistics_minor",
    "name": "Linguistics – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit introduction to the scientific study of human language.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/linguistics/linguistics-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 9,
        "courses": [
          {"subject":"LING","catalog":"201","title":"Introduction to Linguistics","credits":3,"is_required":True,"recommended":True},
          {"subject":"LING","catalog":"330","title":"Phonetics","credits":3,"is_required":True},
          {"subject":"LING","catalog":"371","title":"Syntax 1","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "LING Electives",
        "credits_needed": 9,
        "notes": "9 credits of LING courses; at least one at 400-level.",
        "courses": [
          {"subject":"LING","catalog":"331","title":"Phonology 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"LING","catalog":"355","title":"Language Acquisition 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"LING","catalog":"360","title":"Introduction to Semantics","credits":3,"is_required":False},
          {"subject":"LING","catalog":"440","title":"Morphology","credits":3,"is_required":False,"recommended":True},
          {"subject":"LING","catalog":None,"title":"Any upper-level LING course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # HISTORY
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "history_major",
    "name": "History – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "A highly flexible program emphasising breadth and depth across diverse "
      "cultures from antiquity to today. Students must satisfy Distribution, "
      "Temporal Breadth, and Level requirements."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/history-classical-studies/history-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "distribution_A",
        "title": "Distribution – Group A (The Americas)",
        "credits_needed": 3,
        "notes": "At least 3 credits from courses on The Americas.",
        "courses": [
          {"subject":"HIST","catalog":"203","title":"Canada: Confederation to the Present","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Popular survey; great entry point for Canadian history"},
          {"subject":"HIST","catalog":"202","title":"Canada to Confederation","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"215","title":"United States to 1865","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"216","title":"United States since 1865","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"261","title":"Latin America: Colonial","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"262","title":"Latin America: Modern","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "distribution_B",
        "title": "Distribution – Group B (Europe)",
        "credits_needed": 3,
        "notes": "At least 3 credits from courses on Europe.",
        "courses": [
          {"subject":"HIST","catalog":"218","title":"Early Modern Europe","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"219","title":"Modern Europe","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Covers WWI, WWII, Cold War — engaging survey"},
          {"subject":"HIST","catalog":"225","title":"Russia: Kievan to Soviet","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"245","title":"History of East Central Europe","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "distribution_C",
        "title": "Distribution – Group C (Asia / Africa / Middle East / Global)",
        "credits_needed": 3,
        "notes": "At least 3 credits from courses on Asia, Africa, Middle East, or Global/Thematic topics.",
        "courses": [
          {"subject":"HIST","catalog":"221","title":"History of China","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"222","title":"History of Japan","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"230","title":"Africa: Pre-Colonial","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"231","title":"Africa: Colonial and Post-Colonial","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"241","title":"Introduction to Islamic History","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"270","title":"Global History","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Great global breadth course"},
        ],
      },
      {
        "block_key": "temporal_pre1800",
        "title": "Temporal Breadth – Pre-1800",
        "credits_needed": 3,
        "notes": "At least 3 credits from courses focused on period before 1800.",
        "courses": [
          {"subject":"HIST","catalog":"202","title":"Canada to Confederation","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"218","title":"Early Modern Europe","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"221","title":"History of China","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "temporal_post1800",
        "title": "Temporal Breadth – Post-1800",
        "credits_needed": 3,
        "notes": "At least 3 credits from courses focused on period after 1800.",
        "courses": [
          {"subject":"HIST","catalog":"203","title":"Canada: Confederation to the Present","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"216","title":"United States since 1865","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"219","title":"Modern Europe","credits":3,"is_required":False,"recommended":True},
        ],
      },
      {
        "block_key": "upper_400",
        "title": "Upper-Level Seminars",
        "credits_needed": 6,
        "min_credits_400": 6,
        "notes": "Minimum 6 credits at 400/500-level. Max 15 credits at 200-level across the whole program.",
        "courses": [
          {"subject":"HIST","catalog":None,"title":"Any HIST seminar at 400/500-level","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Seminars are intensive but highly rewarding"},
          {"subject":"HIST","catalog":"498","title":"Independent Research","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "free_hist",
        "title": "Additional HIST or Cognate Electives",
        "credits_needed": 15,
        "notes": "Fill remaining credits with HIST or approved cognate courses. Max 15 credits at 200-level total.",
        "courses": [
          {"subject":"HIST","catalog":None,"title":"Any HIST course 200-level or above","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "history_minor",
    "name": "History – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "Introduces students to diverse cultures and societies from antiquity to today. Expandable to a Major Concentration.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/history-classical-studies/history-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "all_hist",
        "title": "HIST Courses",
        "credits_needed": 18,
        "max_credits_200": 12,
        "min_credits_400": 3,
        "notes": "18 credits of HIST or cognate courses; at most 12 at 200-level; at least 3 at 400-level.",
        "courses": [
          {"subject":"HIST","catalog":"203","title":"Canada: Confederation to the Present","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"219","title":"Modern Europe","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"221","title":"History of China","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"270","title":"Global History","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":None,"title":"Any HIST course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # ART HISTORY
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "art_history_major",
    "name": "Art History – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Comprehensive study of visual arts, material culture, and architecture "
      "from antiquity to the present, primarily focusing on Europe and North America."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/art-history-communication-studies/art-history-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required_intro",
        "title": "Required Introductory Courses",
        "credits_needed": 6,
        "courses": [
          {"subject":"ARTH","catalog":"205","title":"Art and Architecture: Ancient to Medieval","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Foundational survey — take in U1"},
          {"subject":"ARTH","catalog":"206","title":"Art and Architecture: Renaissance to Modern","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Continuation of 205; take in consecutive terms"},
        ],
      },
      {
        "block_key": "thematic",
        "title": "Thematic / Methodological Course",
        "credits_needed": 3,
        "notes": "One course emphasizing theory, method, or non-Western traditions.",
        "courses": [
          {"subject":"ARTH","catalog":"207","title":"Introduction to Art History Methods","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Excellent methods foundation for upper courses"},
          {"subject":"ARTH","catalog":"250","title":"Introduction to Asian Art","credits":3,"is_required":False},
          {"subject":"ARTH","catalog":"252","title":"Introduction to African and Oceanic Art","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "upper_arth",
        "title": "Upper-Level ARTH Electives",
        "credits_needed": 27,
        "min_credits_400": 6,
        "max_credits_200": 9,
        "notes": "Remaining credits from ARTH courses. At least 6 credits at 400-level. Max 9 credits at 200-level.",
        "courses": [
          {"subject":"ARTH","catalog":"315","title":"Baroque Art","credits":3,"is_required":False,"recommended":True},
          {"subject":"ARTH","catalog":"320","title":"Modern Art","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Very popular; covers Impressionism to Abstract"},
          {"subject":"ARTH","catalog":"325","title":"Contemporary Art","credits":3,"is_required":False,"recommended":True},
          {"subject":"ARTH","catalog":"360","title":"Canadian Art and Architecture","credits":3,"is_required":False},
          {"subject":"ARTH","catalog":"400","title":"Advanced Seminar in Art History","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Intensive seminar; great for honours prep"},
          {"subject":"ARTH","catalog":None,"title":"Any upper-level ARTH course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "art_history_minor",
    "name": "Art History – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An introduction to diverse artistic traditions from ancient to contemporary times.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/art-history-communication-studies/art-history-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "survey",
        "title": "Survey Courses",
        "credits_needed": 6,
        "courses": [
          {"subject":"ARTH","catalog":"205","title":"Art and Architecture: Ancient to Medieval","credits":3,"is_required":True,"recommended":True},
          {"subject":"ARTH","catalog":"206","title":"Art and Architecture: Renaissance to Modern","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "ARTH Electives",
        "credits_needed": 12,
        "notes": "12 credits from ARTH courses; at least one course at 300+ level.",
        "courses": [
          {"subject":"ARTH","catalog":"320","title":"Modern Art","credits":3,"is_required":False,"recommended":True},
          {"subject":"ARTH","catalog":"325","title":"Contemporary Art","credits":3,"is_required":False,"recommended":True},
          {"subject":"ARTH","catalog":None,"title":"Any ARTH course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # ENGLISH – LITERATURE
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "english_literature_major",
    "name": "English – Literature Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Focuses on close reading, literary history, and theory. "
      "Students develop interpretive skills across multiple periods and genres."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/english/english-literature-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required_methods",
        "title": "Methods and Theory",
        "credits_needed": 3,
        "courses": [
          {"subject":"ENGL","catalog":"200","title":"Introduction to the Study of Literature","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Required methods foundation; take in U1"},
        ],
      },
      {
        "block_key": "period_coverage",
        "title": "Period and Genre Coverage",
        "credits_needed": 12,
        "notes": "Must cover at least three distinct literary periods (e.g., pre-1800, 19th century, 20th century+).",
        "courses": [
          {"subject":"ENGL","catalog":"215","title":"Early British Literature","credits":3,"is_required":False,"recommended":True},
          {"subject":"ENGL","catalog":"216","title":"17th–18th Century British Literature","credits":3,"is_required":False},
          {"subject":"ENGL","catalog":"217","title":"19th Century British Literature","credits":3,"is_required":False,"recommended":True},
          {"subject":"ENGL","catalog":"220","title":"American Literature to 1900","credits":3,"is_required":False},
          {"subject":"ENGL","catalog":"221","title":"American Literature after 1900","credits":3,"is_required":False,"recommended":True},
          {"subject":"ENGL","catalog":"235","title":"Canadian Literature","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Highly relevant; examines national literary identity"},
          {"subject":"ENGL","catalog":"245","title":"Introduction to Postcolonial Literature","credits":3,"is_required":False,"recommended":True},
        ],
      },
      {
        "block_key": "upper_engl",
        "title": "Upper-Level ENGL Courses",
        "credits_needed": 18,
        "min_credits_400": 6,
        "max_credits_200": 12,
        "notes": "At least 6 credits at 400-level. Maximum 12 credits at 200-level.",
        "courses": [
          {"subject":"ENGL","catalog":"300","title":"Introduction to Literary Theory","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Excellent bridge from intro to upper-level courses"},
          {"subject":"ENGL","catalog":"315","title":"Shakespeare 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"ENGL","catalog":"316","title":"Shakespeare 2","credits":3,"is_required":False},
          {"subject":"ENGL","catalog":"380","title":"Genres","credits":3,"is_required":False},
          {"subject":"ENGL","catalog":"400","title":"Advanced Seminar","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Core seminar for 400-level requirement"},
          {"subject":"ENGL","catalog":"414","title":"Introduction to Theory of Difference","credits":3,"is_required":False},
          {"subject":"ENGL","catalog":None,"title":"Any upper-level ENGL course","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "free_engl",
        "title": "Additional ENGL Electives",
        "credits_needed": 3,
        "courses": [
          {"subject":"ENGL","catalog":None,"title":"Any ENGL course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "english_literature_minor",
    "name": "English – Literature Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit introduction to English literature across periods and genres.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/english/english-literature-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Introductory Course",
        "credits_needed": 3,
        "courses": [
          {"subject":"ENGL","catalog":"200","title":"Introduction to the Study of Literature","credits":3,"is_required":True,"recommended":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "ENGL Electives",
        "credits_needed": 15,
        "notes": "At least one course at 300+ level.",
        "courses": [
          {"subject":"ENGL","catalog":"235","title":"Canadian Literature","credits":3,"is_required":False,"recommended":True},
          {"subject":"ENGL","catalog":"300","title":"Introduction to Literary Theory","credits":3,"is_required":False,"recommended":True},
          {"subject":"ENGL","catalog":None,"title":"Any ENGL course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # COMMUNICATION STUDIES (Minor only)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "communication_studies_minor",
    "name": "Communication Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "Studies forms of cultural expression and media through critical and theoretical lenses.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/art-history-communication-studies/communication-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Courses",
        "credits_needed": 6,
        "courses": [
          {"subject":"COMS","catalog":"200","title":"Communication Studies: An Introduction","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Start here; covers all COMS fields"},
          {"subject":"COMS","catalog":"210","title":"Mass Communication and Society","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "COMS Electives",
        "credits_needed": 12,
        "notes": "12 credits from COMS 200+ courses; at least one at 300+ level.",
        "courses": [
          {"subject":"COMS","catalog":"306","title":"Media Institutions","credits":3,"is_required":False,"recommended":True},
          {"subject":"COMS","catalog":"310","title":"Studies in Film","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Very popular; no prerequisites"},
          {"subject":"COMS","catalog":"315","title":"Visual Communication","credits":3,"is_required":False},
          {"subject":"COMS","catalog":"320","title":"Race, Media and Society","credits":3,"is_required":False,"recommended":True},
          {"subject":"COMS","catalog":None,"title":"Any COMS course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # PHILOSOPHY
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "philosophy_major",
    "name": "Philosophy – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": "Covers metaphysics, epistemology, ethics, logic, and the history of philosophy.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/philosophy/philosophy-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required_logic",
        "title": "Logic Requirement",
        "credits_needed": 3,
        "courses": [
          {"subject":"PHIL","catalog":"210","title":"Introduction to Deductive Logic 1","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Take in U1 — opens up most upper-level PHIL courses"},
        ],
      },
      {
        "block_key": "required_ethics",
        "title": "Ethics / Value Theory",
        "credits_needed": 3,
        "courses": [
          {"subject":"PHIL","catalog":"230","title":"Ethics: Theory and Contemporary Issues","credits":3,"is_required":False,"recommended":True,"choose_from_group":"ethics","choose_n_credits":3},
          {"subject":"PHIL","catalog":"271","title":"Bioethics","credits":3,"is_required":False,"choose_from_group":"ethics","choose_n_credits":3},
          {"subject":"PHIL","catalog":"331","title":"Advanced Ethics","credits":3,"is_required":False,"choose_from_group":"ethics","choose_n_credits":3},
        ],
      },
      {
        "block_key": "required_epistemology",
        "title": "Epistemology / Metaphysics",
        "credits_needed": 3,
        "courses": [
          {"subject":"PHIL","catalog":"201","title":"Philosophy of Science","credits":3,"is_required":False,"recommended":True,"choose_from_group":"epi_meta","choose_n_credits":3},
          {"subject":"PHIL","catalog":"260","title":"Epistemology: Knowledge and Reality","credits":3,"is_required":False,"choose_from_group":"epi_meta","choose_n_credits":3},
          {"subject":"PHIL","catalog":"361","title":"Philosophy of Mind","credits":3,"is_required":False,"choose_from_group":"epi_meta","choose_n_credits":3},
        ],
      },
      {
        "block_key": "history_phil",
        "title": "History of Philosophy",
        "credits_needed": 6,
        "notes": "At least one course in Ancient and one in Modern philosophy.",
        "courses": [
          {"subject":"PHIL","catalog":"251","title":"Plato and His Predecessors","credits":3,"is_required":False,"recommended":True,"choose_from_group":"ancient","choose_n_credits":3},
          {"subject":"PHIL","catalog":"252","title":"Aristotle and His Successors","credits":3,"is_required":False,"choose_from_group":"ancient","choose_n_credits":3},
          {"subject":"PHIL","catalog":"261","title":"Descartes and His Contemporaries","credits":3,"is_required":False,"recommended":True,"choose_from_group":"modern","choose_n_credits":3},
          {"subject":"PHIL","catalog":"262","title":"Locke, Berkeley and Hume","credits":3,"is_required":False,"choose_from_group":"modern","choose_n_credits":3},
          {"subject":"PHIL","catalog":"263","title":"Kant and His Successors","credits":3,"is_required":False,"choose_from_group":"modern","choose_n_credits":3},
        ],
      },
      {
        "block_key": "free_phil",
        "title": "Additional PHIL Electives",
        "credits_needed": 21,
        "min_credits_400": 3,
        "notes": "At least 3 credits at 400-level.",
        "courses": [
          {"subject":"PHIL","catalog":"415","title":"Topics in Philosophy of Language","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"400-level; bridges logic and language"},
          {"subject":"PHIL","catalog":"420","title":"Topics in Ethics","credits":3,"is_required":False,"recommended":True},
          {"subject":"PHIL","catalog":"430","title":"Topics in Epistemology and Metaphysics","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":None,"title":"Any PHIL course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "philosophy_minor",
    "name": "Philosophy – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit introduction to philosophical reasoning, ethics, logic, and history of thought.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/philosophy/philosophy-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "PHIL Courses",
        "credits_needed": 18,
        "notes": "18 credits of PHIL courses; at least one at 300+ level.",
        "courses": [
          {"subject":"PHIL","catalog":"210","title":"Introduction to Deductive Logic 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"PHIL","catalog":"230","title":"Ethics: Theory and Contemporary Issues","credits":3,"is_required":False,"recommended":True},
          {"subject":"PHIL","catalog":"251","title":"Plato and His Predecessors","credits":3,"is_required":False,"recommended":True},
          {"subject":"PHIL","catalog":"271","title":"Bioethics","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"331","title":"Advanced Ethics","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":None,"title":"Any PHIL course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # INTERNATIONAL DEVELOPMENT STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "intl_development_major",
    "name": "International Development Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "An interdisciplinary program examining global inequalities, development "
      "theories, and policy from political economy, anthropological, and "
      "sociological perspectives."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/international-development/international-development-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core Courses",
        "credits_needed": 12,
        "courses": [
          {"subject":"IBUS","catalog":"230","title":"Introduction to International Development","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Start here — foundational overview"},
          {"subject":"IBUS","catalog":"231","title":"Development Theory","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Essential theory base; take alongside 230"},
          {"subject":"IBUS","catalog":"330","title":"Development Economics","credits":3,"is_required":True},
          {"subject":"IBUS","catalog":"331","title":"Research Methods in Development","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "thematic",
        "title": "Thematic Electives",
        "credits_needed": 12,
        "notes": "12 credits covering themes such as gender, environment, governance, or health in global development context.",
        "courses": [
          {"subject":"IBUS","catalog":"345","title":"Gender and Development","credits":3,"is_required":False,"recommended":True},
          {"subject":"IBUS","catalog":"350","title":"Environment and Development","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Highly relevant in current global context"},
          {"subject":"IBUS","catalog":"360","title":"Health and Development","credits":3,"is_required":False},
          {"subject":"IBUS","catalog":"370","title":"Governance and Development","credits":3,"is_required":False},
          {"subject":"IBUS","catalog":"380","title":"Migration and Development","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "regional",
        "title": "Regional Electives",
        "credits_needed": 6,
        "notes": "6 credits from courses with regional focus (Africa, Asia, Latin America, etc.).",
        "courses": [
          {"subject":"IBUS","catalog":"430","title":"Development in Africa","credits":3,"is_required":False,"recommended":True},
          {"subject":"IBUS","catalog":"435","title":"Development in Latin America","credits":3,"is_required":False},
          {"subject":"IBUS","catalog":"440","title":"Development in Asia","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"311","title":"Anthropology of Development","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"311","title":"Politics of Development","credits":3,"is_required":False,"recommended":True},
        ],
      },
      {
        "block_key": "capstone",
        "title": "Capstone / Upper Seminar",
        "credits_needed": 6,
        "min_level": 400,
        "notes": "6 credits from 400-level IDS or cognate courses.",
        "courses": [
          {"subject":"IBUS","catalog":"480","title":"Advanced Seminar in IDS","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Synthesizes the program; take in U3"},
          {"subject":"IBUS","catalog":"490","title":"Field Research Project","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Experiential learning option"},
        ],
      },
    ],
  },

  {
    "program_key": "intl_development_minor",
    "name": "International Development Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit interdisciplinary introduction to global development issues.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/international-development/international-development-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 6,
        "courses": [
          {"subject":"IBUS","catalog":"230","title":"Introduction to International Development","credits":3,"is_required":True,"recommended":True},
          {"subject":"IBUS","catalog":"231","title":"Development Theory","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "Development Electives",
        "credits_needed": 12,
        "courses": [
          {"subject":"IBUS","catalog":"330","title":"Development Economics","credits":3,"is_required":False,"recommended":True},
          {"subject":"IBUS","catalog":"345","title":"Gender and Development","credits":3,"is_required":False},
          {"subject":"IBUS","catalog":"350","title":"Environment and Development","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"311","title":"Politics of Development","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # GENDER, SEXUALITY, FEMINIST AND SOCIAL JUSTICE STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "gsfsj_major",
    "name": "Gender, Sexuality, Feminist and Social Justice Studies – Major",
    "program_type": "major",
    "total_credits": 36,
    "description": "Interdisciplinary program examining gender, sexuality, race, and power in society through critical feminist frameworks.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/gender-sexuality-feminist-studies/gender-sexuality-feminist-social-justice-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core Courses",
        "credits_needed": 9,
        "courses": [
          {"subject":"GSFS","catalog":"200","title":"Introduction to Gender and Feminist Studies","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Start here; foundational concepts"},
          {"subject":"GSFS","catalog":"300","title":"Feminist Theory","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Core theory; take in U2"},
          {"subject":"GSFS","catalog":"400","title":"Advanced Seminar in GSFS","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Capstone seminar; integrates program"},
        ],
      },
      {
        "block_key": "thematic",
        "title": "Thematic and Intersectional Courses",
        "credits_needed": 15,
        "notes": "Courses must span at least two thematic areas (e.g., race & gender, sexuality & law, labour & environment).",
        "courses": [
          {"subject":"GSFS","catalog":"250","title":"Gender, Sexuality and the Body","credits":3,"is_required":False,"recommended":True},
          {"subject":"GSFS","catalog":"260","title":"Race, Racism and Feminist Thought","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Critical intersectional lens; highly relevant"},
          {"subject":"GSFS","catalog":"310","title":"Queer Theory and Politics","credits":3,"is_required":False,"recommended":True},
          {"subject":"GSFS","catalog":"315","title":"Feminist Political Economy","credits":3,"is_required":False},
          {"subject":"GSFS","catalog":"320","title":"Gender and the Law","credits":3,"is_required":False},
          {"subject":"GSFS","catalog":"325","title":"Gender and Colonialism","credits":3,"is_required":False,"recommended":True},
          {"subject":"GSFS","catalog":"350","title":"Reproductive Politics","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "electives",
        "title": "Additional GSFS Electives",
        "credits_needed": 12,
        "notes": "12 credits from GSFS or approved cognate courses.",
        "courses": [
          {"subject":"GSFS","catalog":None,"title":"Any GSFS course 200-level or above","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"234","title":"Sociology of Gender","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Strong cognate from Sociology"},
          {"subject":"ANTH","catalog":"357","title":"Gender and Culture","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "gsfsj_minor",
    "name": "Gender, Sexuality, Feminist and Social Justice Studies – Minor",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit introduction to feminist and social justice theory and practice.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/gender-sexuality-feminist-studies/gender-sexuality-feminist-social-justice-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 3,
        "courses": [
          {"subject":"GSFS","catalog":"200","title":"Introduction to Gender and Feminist Studies","credits":3,"is_required":True,"recommended":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "GSFS Electives",
        "credits_needed": 15,
        "notes": "At least one course at 300+ level.",
        "courses": [
          {"subject":"GSFS","catalog":"250","title":"Gender, Sexuality and the Body","credits":3,"is_required":False,"recommended":True},
          {"subject":"GSFS","catalog":"300","title":"Feminist Theory","credits":3,"is_required":False,"recommended":True},
          {"subject":"GSFS","catalog":"310","title":"Queer Theory and Politics","credits":3,"is_required":False},
          {"subject":"GSFS","catalog":None,"title":"Any GSFS course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # CANADIAN STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "canadian_studies_major",
    "name": "Canadian Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": "Interdisciplinary program examining Canadian institutions, public affairs, culture, and social issues through humanities and social sciences perspectives.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/institute-study/canadian-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 6,
        "courses": [
          {"subject":"CANS","catalog":"200","title":"Introduction to Canadian Studies","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Gateway course; take in U1"},
          {"subject":"CANS","catalog":"300","title":"Topics in Canadian Public Affairs","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "thematic",
        "title": "Thematic Breadth",
        "credits_needed": 18,
        "notes": "Courses must span at least two of the following streams: History & Culture, Politics & Society, Language & Identity.",
        "courses": [
          {"subject":"CANS","catalog":"310","title":"Canadian Cultures: Context and Issues","credits":3,"is_required":False,"recommended":True},
          {"subject":"CANS","catalog":"315","title":"Quebec and Canada","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Essential for Montreal context"},
          {"subject":"CANS","catalog":"320","title":"Gender and Nationalism in Canada","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"203","title":"Canada: Confederation to the Present","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"221","title":"Quebec Politics","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"212","title":"Canadian Government and Politics","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"430","title":"Canadian Society","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "upper_capstone",
        "title": "Upper-Level and Capstone",
        "credits_needed": 12,
        "min_credits_400": 6,
        "courses": [
          {"subject":"CANS","catalog":"400","title":"Advanced Seminar in Canadian Studies","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Capstone synthesis seminar"},
          {"subject":"CANS","catalog":"490","title":"Internship in Canadian Studies","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Gain real-world policy/cultural experience"},
          {"subject":"CANS","catalog":None,"title":"Any CANS course at 400-level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "canadian_studies_minor",
    "name": "Canadian Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit multidisciplinary introduction to Canada's key institutions and social debates.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/institute-study/canadian-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "CANS and Cognate Courses",
        "credits_needed": 18,
        "notes": "CANS 200 required. At least one upper-level course.",
        "courses": [
          {"subject":"CANS","catalog":"200","title":"Introduction to Canadian Studies","credits":3,"is_required":True,"recommended":True},
          {"subject":"CANS","catalog":"310","title":"Canadian Cultures: Context and Issues","credits":3,"is_required":False,"recommended":True},
          {"subject":"CANS","catalog":"315","title":"Quebec and Canada","credits":3,"is_required":False,"recommended":True},
          {"subject":"HIST","catalog":"203","title":"Canada: Confederation to the Present","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"212","title":"Canadian Government and Politics","credits":3,"is_required":False},
          {"subject":"CANS","catalog":None,"title":"Any CANS course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # CLASSICS
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "classics_major",
    "name": "Classics – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": "In-depth study of ancient Greece and Rome in two streams: Classical Languages and Classical Studies.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/history-classical-studies/classics-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "classical_languages",
        "title": "Classical Languages (Greek or Latin)",
        "credits_needed": 12,
        "notes": "At least 12 credits in ancient Greek (GREK) or Latin (LATI) or both.",
        "courses": [
          {"subject":"LATI","catalog":"201","title":"Introductory Latin 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Start Latin in U1; opens extensive course list"},
          {"subject":"LATI","catalog":"202","title":"Introductory Latin 2","credits":3,"is_required":False,"recommended":True},
          {"subject":"LATI","catalog":"310","title":"Intermediate Latin: Prose","credits":3,"is_required":False},
          {"subject":"GREK","catalog":"201","title":"Introductory Greek 1","credits":3,"is_required":False},
          {"subject":"GREK","catalog":"202","title":"Introductory Greek 2","credits":3,"is_required":False},
          {"subject":"GREK","catalog":"310","title":"Intermediate Greek: Prose","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "classical_studies",
        "title": "Classical Studies Courses",
        "credits_needed": 12,
        "notes": "Ancient history, literature, and culture courses.",
        "courses": [
          {"subject":"CLAS","catalog":"200","title":"Introduction to Classical Studies","credits":3,"is_required":False,"recommended":True},
          {"subject":"CLAS","catalog":"210","title":"Greek and Roman Mythology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Popular entry course; no prerequisites"},
          {"subject":"CLAS","catalog":"230","title":"History of Ancient Greece","credits":3,"is_required":False,"recommended":True},
          {"subject":"CLAS","catalog":"235","title":"History of Ancient Rome","credits":3,"is_required":False,"recommended":True},
          {"subject":"CLAS","catalog":"310","title":"Classical Literature in Translation","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "upper_clas",
        "title": "Upper-Level Classics Courses",
        "credits_needed": 12,
        "min_credits_400": 6,
        "courses": [
          {"subject":"CLAS","catalog":"400","title":"Advanced Seminar in Classical Studies","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Seminar-style; great for research track"},
          {"subject":"CLAS","catalog":None,"title":"Any CLAS or language course at 400+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "classics_minor",
    "name": "Classics – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "Introduction to the linguistic, historical, and cultural dimensions of Greece and Rome.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/history-classical-studies/classics-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "CLAS / Language Courses",
        "credits_needed": 18,
        "notes": "Mix of language (GREK/LATI) and content (CLAS) courses.",
        "courses": [
          {"subject":"CLAS","catalog":"210","title":"Greek and Roman Mythology","credits":3,"is_required":False,"recommended":True},
          {"subject":"CLAS","catalog":"230","title":"History of Ancient Greece","credits":3,"is_required":False,"recommended":True},
          {"subject":"LATI","catalog":"201","title":"Introductory Latin 1","credits":3,"is_required":False},
          {"subject":"GREK","catalog":"201","title":"Introductory Greek 1","credits":3,"is_required":False},
          {"subject":"CLAS","catalog":None,"title":"Any CLAS course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # JEWISH STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "jewish_studies_major",
    "name": "Jewish Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": "Interdisciplinary study of Jewish history, culture, religion, literature, and thought from antiquity to the present.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/jewish-studies/jewish-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 9,
        "courses": [
          {"subject":"JWST","catalog":"200","title":"Introduction to Jewish Studies","credits":3,"is_required":True,"recommended":True},
          {"subject":"JWST","catalog":"210","title":"Introduction to the Hebrew Bible","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Foundational text study"},
          {"subject":"JWST","catalog":"215","title":"Introduction to Rabbinic Literature","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "Jewish Studies Electives",
        "credits_needed": 27,
        "min_credits_400": 6,
        "max_credits_200": 9,
        "notes": "27 credits across history, language, literature, and religion tracks.",
        "courses": [
          {"subject":"JWST","catalog":"220","title":"History of the Jewish People 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"JWST","catalog":"221","title":"History of the Jewish People 2","credits":3,"is_required":False},
          {"subject":"JWST","catalog":"261","title":"History of Jewish Philosophy","credits":3,"is_required":False,"recommended":True},
          {"subject":"JWST","catalog":"310","title":"Modern Jewish History","credits":3,"is_required":False,"recommended":True},
          {"subject":"JWST","catalog":"350","title":"Holocaust: History and Representation","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Important and deeply engaging course"},
          {"subject":"JWST","catalog":"400","title":"Advanced Seminar in Jewish Studies","credits":3,"is_required":False,"recommended":True},
          {"subject":"JWST","catalog":None,"title":"Any JWST course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "jewish_studies_minor",
    "name": "Jewish Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit introduction to Jewish history, religion, and culture.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/jewish-studies/jewish-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "JWST Courses",
        "credits_needed": 18,
        "notes": "JWST 200 recommended as first course. At least one course at 300+ level.",
        "courses": [
          {"subject":"JWST","catalog":"200","title":"Introduction to Jewish Studies","credits":3,"is_required":False,"recommended":True},
          {"subject":"JWST","catalog":"210","title":"Introduction to the Hebrew Bible","credits":3,"is_required":False,"recommended":True},
          {"subject":"JWST","catalog":"261","title":"History of Jewish Philosophy","credits":3,"is_required":False},
          {"subject":"JWST","catalog":"350","title":"Holocaust: History and Representation","credits":3,"is_required":False,"recommended":True},
          {"subject":"JWST","catalog":None,"title":"Any JWST course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # EAST ASIAN STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "east_asian_studies_major",
    "name": "East Asian Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": "In-depth training in humanistic studies of East Asia including language, society, literature, history, media, religion, politics, and art.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/east-asian-studies/east-asian-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "core_surveys",
        "title": "Core Survey Courses",
        "credits_needed": 9,
        "notes": "Three regional survey courses (China, Japan, Korea).",
        "courses": [
          {"subject":"EAST","catalog":"211","title":"Introduction to Chinese Culture","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Best first course for East Asian Studies"},
          {"subject":"EAST","catalog":"213","title":"Introduction to Japanese Culture","credits":3,"is_required":True},
          {"subject":"EAST","catalog":"215","title":"Introduction to Korean Culture","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "language",
        "title": "Language Courses",
        "credits_needed": 9,
        "notes": "At least 9 credits of East Asian language (Chinese/Japanese/Korean).",
        "courses": [
          {"subject":"CHIN","catalog":"201","title":"Mandarin Chinese 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Most widely spoken; great career value"},
          {"subject":"CHIN","catalog":"202","title":"Mandarin Chinese 2","credits":3,"is_required":False,"recommended":True},
          {"subject":"JAPN","catalog":"201","title":"Japanese 1","credits":3,"is_required":False},
          {"subject":"JAPN","catalog":"202","title":"Japanese 2","credits":3,"is_required":False},
          {"subject":"KORE","catalog":"201","title":"Korean 1","credits":3,"is_required":False},
          {"subject":"KORE","catalog":"202","title":"Korean 2","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "upper_east",
        "title": "Upper-Level EAST Courses",
        "credits_needed": 18,
        "min_credits_400": 6,
        "notes": "At least 6 credits at 400-level.",
        "courses": [
          {"subject":"EAST","catalog":"310","title":"Classical Chinese Literature","credits":3,"is_required":False,"recommended":True},
          {"subject":"EAST","catalog":"330","title":"Modern Chinese Literature","credits":3,"is_required":False},
          {"subject":"EAST","catalog":"340","title":"Japanese Cinema","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Very popular; no language prereq required"},
          {"subject":"EAST","catalog":"350","title":"Gender and Sexuality in Chinese Literature","credits":3,"is_required":False},
          {"subject":"EAST","catalog":"400","title":"Advanced Topics in East Asian Studies","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Seminar; good for research track"},
          {"subject":"EAST","catalog":None,"title":"Any EAST course at 400+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # ISLAMIC STUDIES / WORLD ISLAMIC AND MIDDLE EAST STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "world_islamic_mideast_major",
    "name": "World Islamic and Middle East Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": "Interdisciplinary study of Islam, Islamic civilization, and Middle Eastern societies from history, literature, politics, and theology perspectives.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/islamic-studies/world-islamic-middle-east-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core Courses",
        "credits_needed": 12,
        "courses": [
          {"subject":"ISLA","catalog":"200","title":"Introduction to Islam","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Foundational overview — take in U1"},
          {"subject":"ISLA","catalog":"205","title":"Introduction to Islamic Civilization","credits":3,"is_required":True,"recommended":True},
          {"subject":"HIST","catalog":"241","title":"Introduction to Islamic History","credits":3,"is_required":True},
          {"subject":"ISLA","catalog":"300","title":"Islamic Texts and Traditions","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "electives",
        "title": "Thematic Electives",
        "credits_needed": 18,
        "min_credits_400": 6,
        "courses": [
          {"subject":"ISLA","catalog":"210","title":"The Quran and Its Interpretation","credits":3,"is_required":False,"recommended":True},
          {"subject":"ISLA","catalog":"310","title":"Islamic Law","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Critical for law/policy track"},
          {"subject":"ISLA","catalog":"315","title":"Islam and Gender","credits":3,"is_required":False,"recommended":True},
          {"subject":"ISLA","catalog":"320","title":"Sufism","credits":3,"is_required":False},
          {"subject":"ISLA","catalog":"330","title":"Political Islam","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"315","title":"Politics of the Middle East","credits":3,"is_required":False,"recommended":True},
          {"subject":"ISLA","catalog":"400","title":"Advanced Seminar in Islamic Studies","credits":3,"is_required":False,"recommended":True},
          {"subject":"ISLA","catalog":None,"title":"Any ISLA course at 400+ level","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "language",
        "title": "Language (Optional but recommended)",
        "credits_needed": 6,
        "notes": "Arabic or other relevant language credits are strongly recommended.",
        "courses": [
          {"subject":"ARBC","catalog":"210","title":"Introductory Arabic 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Opens primary sources; highly valuable for the field"},
          {"subject":"ARBC","catalog":"220","title":"Introductory Arabic 2","credits":3,"is_required":False,"recommended":True},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # GEOGRAPHY
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "geography_major",
    "name": "Geography – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": "Examines spatial patterns of physical and human environments, emphasizing analytical and fieldwork methods.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/geography/geography-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 9,
        "courses": [
          {"subject":"GEOG","catalog":"200","title":"Environmental Systems","credits":3,"is_required":True,"recommended":True},
          {"subject":"GEOG","catalog":"201","title":"Physical Geography: Geomorphology","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"202","title":"Quantitative Methods in Geography","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Stats methods — take early; prereq for many upper courses"},
        ],
      },
      {
        "block_key": "human_geography",
        "title": "Human Geography",
        "credits_needed": 9,
        "notes": "At least 9 credits from human geography courses.",
        "courses": [
          {"subject":"GEOG","catalog":"210","title":"Economic Geography","credits":3,"is_required":False,"recommended":True},
          {"subject":"GEOG","catalog":"220","title":"Population and Society","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"320","title":"Urban Geography","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Excellent urban focus; Montreal as case study"},
          {"subject":"GEOG","catalog":"330","title":"Political Geography","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"340","title":"Development Geography","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "physical_geography",
        "title": "Physical Geography",
        "credits_needed": 9,
        "notes": "At least 9 credits from physical geography courses.",
        "courses": [
          {"subject":"GEOG","catalog":"203","title":"Climatology","credits":3,"is_required":False,"recommended":True},
          {"subject":"GEOG","catalog":"205","title":"Hydrology","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"303","title":"Environmental Change","credits":3,"is_required":False,"recommended":True},
        ],
      },
      {
        "block_key": "upper_geog",
        "title": "Upper-Level Geography",
        "credits_needed": 9,
        "min_credits_400": 6,
        "courses": [
          {"subject":"GEOG","catalog":"400","title":"Advanced Seminar in Geography","credits":3,"is_required":False,"recommended":True},
          {"subject":"GEOG","catalog":"401","title":"Geographic Information Systems","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Highly applicable; opens GIS career path"},
          {"subject":"GEOG","catalog":None,"title":"Any GEOG course at 400+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "geography_minor",
    "name": "Geography – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit introduction to physical and human geography.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/geography/geography-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "GEOG Courses",
        "credits_needed": 18,
        "notes": "At least one course at 300+ level.",
        "courses": [
          {"subject":"GEOG","catalog":"200","title":"Environmental Systems","credits":3,"is_required":False,"recommended":True},
          {"subject":"GEOG","catalog":"202","title":"Quantitative Methods in Geography","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"320","title":"Urban Geography","credits":3,"is_required":False,"recommended":True},
          {"subject":"GEOG","catalog":"303","title":"Environmental Change","credits":3,"is_required":False,"recommended":True},
          {"subject":"GEOG","catalog":None,"title":"Any GEOG course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # COMPUTER SCIENCE (Arts)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "computer_science_arts_major",
    "name": "Computer Science – Major Concentration (B.A.)",
    "program_type": "major",
    "total_credits": 36,
    "description": "B.A. Computer Science focusing on software development, algorithms, and computing theory. Requires MATH 133, 140, and 141 as prerequisites before starting.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/computer-science/computer-science-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "required_core",
        "title": "Required Courses",
        "credits_needed": 18,
        "notes": "MATH 133 Linear Algebra, MATH 140 Calculus 1, and MATH 141 Calculus 2 (or equivalents) should be completed prior to taking courses in this program.",
        "courses": [
          {"subject":"COMP","catalog":"202","title":"Foundations of Programming","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Take in U1 Fall — gateway to all CS courses"},
          {"subject":"COMP","catalog":"206","title":"Introduction to Software Systems","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Systems programming fundamentals; take in U1"},
          {"subject":"COMP","catalog":"250","title":"Introduction to Computer Science","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Core data structures and algorithms; take after COMP 202"},
          {"subject":"COMP","catalog":"251","title":"Algorithms and Data Structures","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Essential algorithms course; take after COMP 250"},
          {"subject":"COMP","catalog":"273","title":"Introduction to Computer Systems","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Computer organization and systems; pairs with COMP 206"},
          {"subject":"MATH","catalog":"240","title":"Discrete Structures","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Required math foundation for CS theory"},
        ],
      },
      {
        "block_key": "comp_group_a",
        "title": "Complementary – Group A (Math)",
        "credits_needed": 3,
        "notes": "3 credits from Group A.",
        "courses": [
          {"subject":"MATH","catalog":"222","title":"Calculus 3","credits":3,"is_required":False,"choose_from_group":"group_a","choose_n_credits":3,"recommended":True,"recommendation_reason":"Multivariable calculus — useful for ML/AI tracks"},
          {"subject":"MATH","catalog":"323","title":"Probability","credits":3,"is_required":False,"choose_from_group":"group_a","choose_n_credits":3,"recommended":True,"recommendation_reason":"Essential for machine learning and statistics"},
          {"subject":"MATH","catalog":"324","title":"Statistics","credits":3,"is_required":False,"choose_from_group":"group_a","choose_n_credits":3},
        ],
      },
      {
        "block_key": "comp_group_b",
        "title": "Complementary – Group B (Math)",
        "credits_needed": 3,
        "notes": "3 credits from Group B.",
        "courses": [
          {"subject":"MATH","catalog":"223","title":"Linear Algebra","credits":3,"is_required":False,"choose_from_group":"group_b","choose_n_credits":3,"recommended":True,"recommendation_reason":"Linear algebra for ML, graphics, and numerical methods"},
          {"subject":"MATH","catalog":"318","title":"Mathematical Logic","credits":3,"is_required":False,"choose_from_group":"group_b","choose_n_credits":3},
          {"subject":"MATH","catalog":"340","title":"Discrete Mathematics","credits":3,"is_required":False,"choose_from_group":"group_b","choose_n_credits":3},
        ],
      },
      {
        "block_key": "comp_group_c",
        "title": "Complementary – Group C (Theory)",
        "credits_needed": 3,
        "notes": "3 credits from Group C.",
        "courses": [
          {"subject":"COMP","catalog":"330","title":"Theory of Computation","credits":3,"is_required":False,"choose_from_group":"group_c","choose_n_credits":3,"recommended":True,"recommendation_reason":"Automata, grammars, and computability theory"},
          {"subject":"COMP","catalog":"350","title":"Numerical Computing","credits":3,"is_required":False,"choose_from_group":"group_c","choose_n_credits":3},
          {"subject":"COMP","catalog":"360","title":"Algorithm Design","credits":3,"is_required":False,"choose_from_group":"group_c","choose_n_credits":3,"recommended":True,"recommendation_reason":"Advanced algorithm design and analysis"},
        ],
      },
      {
        "block_key": "comp_group_d",
        "title": "Complementary – Group D (Systems/SE)",
        "credits_needed": 3,
        "notes": "3 credits from Group D.",
        "courses": [
          {"subject":"COMP","catalog":"302","title":"Programming Languages and Paradigms","credits":3,"is_required":False,"choose_from_group":"group_d","choose_n_credits":3,"recommended":True,"recommendation_reason":"Functional and logic programming paradigms"},
          {"subject":"COMP","catalog":"303","title":"Software Design","credits":3,"is_required":False,"choose_from_group":"group_d","choose_n_credits":3},
        ],
      },
      {
        "block_key": "comp_electives",
        "title": "Complementary – COMP 300+ Electives",
        "credits_needed": 6,
        "notes": "An additional 3 credits from Group A or B, plus remaining credits from COMP 230 or COMP 300-level or above (except COMP 396).",
        "courses": [
          {"subject":"COMP","catalog":"230","title":"Logic and Computability","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Great for theory-focused students; pairs with COMP 330"},
          {"subject":"COMP","catalog":"307","title":"Introduction to Web Development","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Highly practical; great for portfolio projects"},
          {"subject":"COMP","catalog":"321","title":"Introduction to Software Engineering","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Software process and design patterns"},
          {"subject":"COMP","catalog":"400","title":"Topics in Computing Science","credits":3,"is_required":False},
          {"subject":"COMP","catalog":"409","title":"Concurrent Programming","credits":3,"is_required":False},
          {"subject":"COMP","catalog":"417","title":"Computer Networks","credits":3,"is_required":False},
          {"subject":"COMP","catalog":"421","title":"Programming Languages","credits":3,"is_required":False},
          {"subject":"COMP","catalog":"424","title":"Artificial Intelligence","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Flagship AI course; very popular at McGill"},
          {"subject":"COMP","catalog":"451","title":"Algorithms and Bioinformatics","credits":3,"is_required":False},
          {"subject":"COMP","catalog":"462","title":"Combinatorial Optimization","credits":3,"is_required":False},
          {"subject":"COMP","catalog":"551","title":"Applied Machine Learning","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Top course for data science/ML track"},
          {"subject":"COMP","catalog":"566","title":"Discrete Optimization","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "computer_science_arts_minor",
    "name": "Computer Science – Minor Concentration (B.A.)",
    "program_type": "minor",
    "total_credits": 18,
    "description": "An 18-credit introduction to programming and computing for non-CS majors.",
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/computer-science/computer-science-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Core",
        "credits_needed": 9,
        "courses": [
          {"subject":"COMP","catalog":"202","title":"Foundations of Programming","credits":3,"is_required":True,"recommended":True},
          {"subject":"COMP","catalog":"250","title":"Introduction to Computer Science","credits":3,"is_required":True,"recommended":True},
          {"subject":"COMP","catalog":"206","title":"Introduction to Software Systems","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "upper",
        "title": "Upper-Level COMP Electives",
        "credits_needed": 9,
        "notes": "9 credits from COMP 300+ courses.",
        "courses": [
          {"subject":"COMP","catalog":"307","title":"Introduction to Web Development","credits":3,"is_required":False,"recommended":True},
          {"subject":"COMP","catalog":"303","title":"Introduction to Operating Systems","credits":3,"is_required":False},
          {"subject":"COMP","catalog":"424","title":"Artificial Intelligence","credits":3,"is_required":False,"recommended":True},
          {"subject":"COMP","catalog":"551","title":"Applied Machine Learning","credits":3,"is_required":False,"recommended":True},
          {"subject":"COMP","catalog":None,"title":"Any COMP course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },



  # ──────────────────────────────────────────────────────────────────
  # GERMAN STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "german_studies_major",
    "name": "German Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "An in-depth study of German language, literature, culture, and film "
      "from the eighteenth century to the present day. Covers major works of "
      "literature, philosophy, film, critical theory, and the history of lyric form."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/german-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "language_foundation",
        "title": "German Language Foundation",
        "credits_needed": 12,
        "notes": "12 credits of German language courses (GERM 100-level to 300-level), progressing through beginner to advanced levels.",
        "courses": [
          {"subject":"GERM","catalog":"100","title":"Beginner's German 1 (Intensive)","credits":6,"is_required":False,"recommended":True,"recommendation_reason":"Best entry if you have no prior German"},
          {"subject":"GERM","catalog":"200","title":"Intermediate German (Intensive)","credits":6,"is_required":False,"recommended":True,"recommendation_reason":"Efficient path to literary courses"},
          {"subject":"GERM","catalog":"100D1","title":"Beginner's German 1","credits":3,"is_required":False},
          {"subject":"GERM","catalog":"100D2","title":"Beginner's German 2","credits":3,"is_required":False},
          {"subject":"GERM","catalog":"200D1","title":"Intermediate German 1","credits":3,"is_required":False},
          {"subject":"GERM","catalog":"200D2","title":"Intermediate German 2","credits":3,"is_required":False},
          {"subject":"GERM","catalog":"307D1","title":"Intermediate German (Advanced)","credits":3,"is_required":False},
          {"subject":"GERM","catalog":"307D2","title":"Intermediate German (Advanced) 2","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "literature_culture",
        "title": "German Literature & Culture Courses",
        "credits_needed": 24,
        "notes": "24 credits from German literature, culture, and film. At least 9 credits must be at the 300-level or above.",
        "min_credits_400": 9,
        "courses": [
          {"subject":"GERM","catalog":"259","title":"Introduction to German Literature 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Essential foundation for literary track"},
          {"subject":"GERM","catalog":"260","title":"Introduction to German Literature 2","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Pairs with GERM 259; covers 19th c. to present"},
          {"subject":"GERM","catalog":"326","title":"Topics: German Language and Culture","credits":3,"is_required":False},
          {"subject":"GERM","catalog":"350","title":"Modernism and the Avant-Garde","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Highly valued for cultural studies track"},
          {"subject":"GERM","catalog":None,"title":"Any upper-level GERM course (300+)","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "german_studies_minor",
    "name": "German Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "An introduction to German culture from the eighteenth century to the present. "
      "Courses include literature, philosophy, film, and theory taught in English or German."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/german-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "German Studies Courses",
        "credits_needed": 18,
        "notes": "18 credits of courses in German literature, culture, and film taught in English or German.",
        "courses": [
          {"subject":"GERM","catalog":"259","title":"Introduction to German Literature 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Best starting point for the minor"},
          {"subject":"GERM","catalog":"260","title":"Introduction to German Literature 2","credits":3,"is_required":False,"recommended":True},
          {"subject":"GERM","catalog":"350","title":"Modernism and the Avant-Garde","credits":3,"is_required":False},
          {"subject":"GERM","catalog":None,"title":"Any GERM culture/literature course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # HISPANIC STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "hispanic_studies_major",
    "name": "Hispanic Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "An in-depth study of Spanish language and the culture of Spain and Latin America, "
      "covering literature, film, intellectual history, and cultural studies. "
      "Most upper-level courses are taught in Spanish."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/hispanic-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "language",
        "title": "Spanish Language Courses",
        "credits_needed": 12,
        "notes": "12 credits of Spanish language (HISP 210–HISP 315 or equivalent). Students may begin at elementary, intermediate, or advanced level.",
        "courses": [
          {"subject":"HISP","catalog":"210D1","title":"Spanish Language - Elementary 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Start here if no prior Spanish"},
          {"subject":"HISP","catalog":"210D2","title":"Spanish Language - Elementary 2","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"218","title":"Spanish Language Intensive - Elementary","credits":6,"is_required":False,"recommended":True,"recommendation_reason":"Faster path through elementary level"},
          {"subject":"HISP","catalog":"220D1","title":"Spanish Language - Intermediate 1","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"220D2","title":"Spanish Language - Intermediate 2","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"315","title":"Advanced Spanish Language","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "literature_culture",
        "title": "Hispanic Literature & Culture",
        "credits_needed": 24,
        "notes": "18–24 credits from HISP literature/culture courses. No more than 6 credits at 200-level. At least 9 credits at 300+ level. Courses typically taught in Spanish.",
        "max_credits_200": 6,
        "min_credits_400": 9,
        "courses": [
          {"subject":"HISP","catalog":"241","title":"Survey of Peninsular Literature 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Provides base for upper-level lit courses"},
          {"subject":"HISP","catalog":"242","title":"Survey of Peninsular Literature 2","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"243","title":"Survey of Spanish-American Literature 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"HISP","catalog":"244","title":"Survey of Spanish-American Literature 2","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"325","title":"Spanish Novel of the 19th Century","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"328","title":"Literature of Ideas: Latin America","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"333","title":"Theatre, Performance and Politics in Latin America","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"335","title":"Politics and Poetry in Latin America","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"345","title":"Contemporary Hispanic Cultural Studies","credits":3,"is_required":False,"recommended":True},
          {"subject":"HISP","catalog":None,"title":"Any HISP course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "hispanic_studies_minor",
    "name": "Hispanic Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "Provides a solid foundation on Spanish language and culture. "
      "Expandable to the Major Concentration."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/hispanic-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "language",
        "title": "Spanish Language",
        "credits_needed": 6,
        "notes": "At least 6 credits of Spanish language (HISP). Up to 12 credits of language may be counted.",
        "courses": [
          {"subject":"HISP","catalog":"210D1","title":"Spanish Language - Elementary 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Start here if no prior Spanish"},
          {"subject":"HISP","catalog":"218","title":"Spanish Language Intensive - Elementary","credits":6,"is_required":False,"recommended":True,"recommendation_reason":"Faster single-term path"},
          {"subject":"HISP","catalog":"220D1","title":"Spanish Language - Intermediate 1","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "culture_lit",
        "title": "Hispanic Culture & Literature",
        "credits_needed": 6,
        "notes": "6–18 credits from HISP culture/literature courses (not language courses). No more than 6 credits may be courses taught in English.",
        "courses": [
          {"subject":"HISP","catalog":"241","title":"Survey of Peninsular Literature 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"HISP","catalog":"243","title":"Survey of Spanish-American Literature 1","credits":3,"is_required":False,"recommended":True},
          {"subject":"HISP","catalog":"345","title":"Contemporary Hispanic Cultural Studies","credits":3,"is_required":False},
          {"subject":"HISP","catalog":None,"title":"Any HISP literature or culture course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # ITALIAN STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "italian_studies_major",
    "name": "Italian Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "An in-depth study of Italian language, literature, and culture from the "
      "Middle Ages to the present, with emphasis on literature, cinema, theatre, "
      "and Italian cultural identity."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/italian-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "language",
        "title": "Italian Language Courses",
        "credits_needed": 12,
        "notes": "12 credits of Italian language (ITAL 100–ITAL 255). Students may begin at elementary, intermediate, or advanced level.",
        "courses": [
          {"subject":"ITAL","catalog":"100","title":"Beginner's Italian (Intensive)","credits":6,"is_required":False,"recommended":True,"recommendation_reason":"Best entry point with no prior Italian"},
          {"subject":"ITAL","catalog":"200","title":"Intermediate Italian (Intensive)","credits":6,"is_required":False,"recommended":True},
          {"subject":"ITAL","catalog":"215D1","title":"Intermediate Italian 1","credits":3,"is_required":False},
          {"subject":"ITAL","catalog":"215D2","title":"Intermediate Italian 2","credits":3,"is_required":False},
          {"subject":"ITAL","catalog":"255","title":"Advanced Reading and Composition","credits":6,"is_required":False},
        ],
      },
      {
        "block_key": "literature_culture",
        "title": "Italian Literature & Culture",
        "credits_needed": 24,
        "notes": "24 credits of ITAL literature/culture courses. At least 9 credits at 300-level or above.",
        "min_credits_400": 9,
        "courses": [
          {"subject":"ITAL","catalog":"270","title":"Manzoni: Novel and Nationhood","credits":3,"is_required":False},
          {"subject":"ITAL","catalog":"281","title":"Masterpieces of Italian Literature 2","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Covers Renaissance to 20th century – essential survey"},
          {"subject":"ITAL","catalog":"310","title":"The Invention of Italian Literature","credits":3,"is_required":False,"recommended":True},
          {"subject":"ITAL","catalog":None,"title":"Any ITAL literature/culture course at 300+","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "italian_studies_minor",
    "name": "Italian Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "An introduction to Italian language and the key works and themes of Italian "
      "literature and culture. Expandable to the Major Concentration."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/italian-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "Italian Language & Culture",
        "credits_needed": 18,
        "notes": "18 credits of ITAL courses including at least 6 credits of language and 6 credits of literature/culture.",
        "courses": [
          {"subject":"ITAL","catalog":"100","title":"Beginner's Italian (Intensive)","credits":6,"is_required":False,"recommended":True,"recommendation_reason":"Efficient single-term entry"},
          {"subject":"ITAL","catalog":"215D1","title":"Intermediate Italian 1","credits":3,"is_required":False},
          {"subject":"ITAL","catalog":"281","title":"Masterpieces of Italian Literature 2","credits":3,"is_required":False,"recommended":True},
          {"subject":"ITAL","catalog":"310","title":"The Invention of Italian Literature","credits":3,"is_required":False},
          {"subject":"ITAL","catalog":None,"title":"Any ITAL course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # FRENCH (LANGUE ET LITTÉRATURE FRANÇAISES)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "french_major",
    "name": "Langue et littérature françaises – Concentration majeure (Études et pratiques littéraires)",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Étude approfondie de la langue et littérature françaises, incluant "
      "la littérature québécoise, française et francophone, ainsi que les "
      "théories littéraires contemporaines. Programme offert en français."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/litteratures-langue-francaise-traduction-creation/",
    "blocks": [
      {
        "block_key": "obligatoires",
        "title": "Cours obligatoires",
        "credits_needed": 9,
        "notes": "9 crédits de cours obligatoires.",
        "courses": [
          {"subject":"FRLT","catalog":"100","title":"Introduction aux études littéraires","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Cours fondamental de méthodologie littéraire"},
          {"subject":"FRLT","catalog":"200","title":"Histoire de la littérature française","credits":3,"is_required":True,"recommended":True},
          {"subject":"FRLT","catalog":"300","title":"Théories et pratiques littéraires","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "complementaires",
        "title": "Cours complémentaires",
        "credits_needed": 27,
        "notes": "27 crédits de cours FRLT au choix, dont au moins 9 crédits au niveau 400 ou plus.",
        "min_credits_400": 9,
        "courses": [
          {"subject":"FRLT","catalog":None,"title":"Tout cours FRLT au niveau 200 ou plus","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "french_minor",
    "name": "Langue et littérature françaises – Concentration mineure",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "Introduction à la langue et littérature françaises offrant "
      "une exploration des textes québécois, français et francophones. "
      "Programme offert en français."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/litteratures-langue-francaise-traduction-creation/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "Cours de littérature française",
        "credits_needed": 18,
        "notes": "18 crédits de cours FRLT. Cours offerts en français.",
        "courses": [
          {"subject":"FRLT","catalog":"100","title":"Introduction aux études littéraires","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Meilleur point de départ pour la mineure"},
          {"subject":"FRLT","catalog":"200","title":"Histoire de la littérature française","credits":3,"is_required":False,"recommended":True},
          {"subject":"FRLT","catalog":None,"title":"Tout cours FRLT","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # AFRICAN STUDIES (Minor – Major already seeded)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "african_studies_minor",
    "name": "African Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "An interdisciplinary introduction to the history, politics, culture, "
      "and societies of Africa. Draws on courses from History, Political Science, "
      "Sociology, Anthropology, and Islamic Studies."
    ),
    "ecalendar_url": "https://www.mcgill.ca/study/2024-2025/faculties/arts/undergraduate/programs/bachelor-arts-ba-minor-concentration-african-studies",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Course",
        "credits_needed": 3,
        "courses": [
          {"subject":"ISLA","catalog":"210","title":"Introduction to African Studies","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Gateway course required for the program"},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Complementary Courses",
        "credits_needed": 15,
        "notes": "15 credits from the approved list of courses in History, Political Science, Sociology, Anthropology, and Islamic Studies related to Africa.",
        "courses": [
          {"subject":"HIST","catalog":"201","title":"Modern African History","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Directly relevant; covers 20th century Africa"},
          {"subject":"POLI","catalog":"227","title":"Politics of the Developing World","credits":3,"is_required":False,"recommended":True},
          {"subject":"ANTH","catalog":"201","title":"Intro to Sociocultural Anthropology","credits":3,"is_required":False},
          {"subject":"ISLA","catalog":None,"title":"Any ISLA course related to Africa","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":None,"title":"Any SOCI course related to Africa","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # RELIGIOUS STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "religious_studies_major",
    "name": "Religious Studies – Major Concentration",
    "program_type": "major",
    "total_credits": 36,
    "description": (
      "Explores the history, beliefs, and practices of the world's religious traditions "
      "using a variety of scholarly approaches including historical, literary, anthropological, "
      "and philosophical methods."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/school-of-religious-studies/religious-studies-major-concentration-ba/",
    "blocks": [
      {
        "block_key": "intro",
        "title": "Introductory Courses",
        "credits_needed": 6,
        "notes": "6 credits of 200-level RELG introductory courses.",
        "courses": [
          {"subject":"RELG","catalog":"203","title":"World Religions","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Ideal broad survey to start with"},
          {"subject":"RELG","catalog":"207","title":"Religion and Culture","credits":3,"is_required":False,"recommended":True},
          {"subject":"RELG","catalog":"204","title":"Introduction to the Hebrew Bible","credits":3,"is_required":False},
          {"subject":"RELG","catalog":"206","title":"Introduction to the New Testament","credits":3,"is_required":False},
          {"subject":"RELG","catalog":"200","title":"Introduction to Religious Studies","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "upper_level",
        "title": "Upper-Level Courses",
        "credits_needed": 30,
        "notes": "30 credits of RELG courses at any level. At least 12 credits must be at the 300-level or above.",
        "min_credits_400": 6,
        "courses": [
          {"subject":"RELG","catalog":None,"title":"Any RELG course at 300+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  {
    "program_key": "religious_studies_minor",
    "name": "Religious Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "An introduction to the study of religion covering major world religious traditions "
      "through textual, historical, and comparative approaches."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/school-of-religious-studies/religious-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "Religious Studies Courses",
        "credits_needed": 18,
        "notes": "18 credits of RELG courses. At least 6 credits must be at the 300-level or above.",
        "min_credits_400": 0,
        "courses": [
          {"subject":"RELG","catalog":"203","title":"World Religions","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Best starting point; covers all major traditions"},
          {"subject":"RELG","catalog":"207","title":"Religion and Culture","credits":3,"is_required":False,"recommended":True},
          {"subject":"RELG","catalog":"200","title":"Introduction to Religious Studies","credits":3,"is_required":False},
          {"subject":"RELG","catalog":None,"title":"Any RELG course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # INFORMATION STUDIES
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "information_studies_minor",
    "name": "Information Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "Explores the principles of information organization, access, and literacy. "
      "Offered by the McGill School of Information Studies (SIS), covering "
      "archives, libraries, and digital information management."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/school-of-information-studies/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Course",
        "credits_needed": 3,
        "courses": [
          {"subject":"INFS","catalog":"250","title":"Foundations of Information Studies","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Gateway required course for all SIS programs"},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Complementary INFS Courses",
        "credits_needed": 15,
        "notes": "15 credits from INFS courses at 200-level or above.",
        "courses": [
          {"subject":"INFS","catalog":"256","title":"Knowledge Organization","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Core classification and cataloguing theory"},
          {"subject":"INFS","catalog":"277","title":"Archives and Records Management","credits":3,"is_required":False,"recommended":True},
          {"subject":"INFS","catalog":"321","title":"Information Literacy","credits":3,"is_required":False},
          {"subject":"INFS","catalog":None,"title":"Any INFS course at 200+ level","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # EAST ASIAN STUDIES – MINOR (Major already seeded)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "east_asian_studies_minor",
    "name": "East Asian Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "An interdisciplinary introduction to the cultures, languages, history, "
      "and social systems of China, Japan, and Korea."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/east-asian-studies/east-asian-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "East Asian Studies Courses",
        "credits_needed": 18,
        "notes": "18 credits from EAST courses. May include language courses (CHIN, JAPN, KORE).",
        "courses": [
          {"subject":"EAST","catalog":"211","title":"Introduction to East Asian Cultures","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Ideal broad entry point"},
          {"subject":"EAST","catalog":"215","title":"Modern China","credits":3,"is_required":False,"recommended":True},
          {"subject":"CHIN","catalog":"200D1","title":"Introductory Chinese 1","credits":3,"is_required":False},
          {"subject":"JAPN","catalog":"200D1","title":"Introductory Japanese 1","credits":3,"is_required":False},
          {"subject":"EAST","catalog":None,"title":"Any EAST course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # WORLD ISLAMIC & MIDDLE EASTERN STUDIES – MINOR
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "world_islamic_mideast_minor",
    "name": "World Islamic and Middle Eastern Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "An interdisciplinary introduction to the history, politics, religion, "
      "and cultures of the Islamic world and the Middle East."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/islamic-studies/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Course",
        "credits_needed": 3,
        "courses": [
          {"subject":"ISLA","catalog":"200","title":"Introduction to Islam","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Required gateway course"},
        ],
      },
      {
        "block_key": "complementary",
        "title": "Complementary Courses",
        "credits_needed": 15,
        "notes": "15 credits from approved ISLA, HIST, POLI, RELG courses related to the Islamic world and Middle East.",
        "courses": [
          {"subject":"ISLA","catalog":"220","title":"Introduction to the Quran","credits":3,"is_required":False,"recommended":True},
          {"subject":"ISLA","catalog":"315","title":"Ottoman State and Society to 1839","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"226","title":"Modern History of the Middle East","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":"341","title":"Foreign Policy: The Middle East","credits":3,"is_required":False},
          {"subject":"ISLA","catalog":None,"title":"Any ISLA course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # LIBERAL ARTS (Faculty Program)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "liberal_arts_major",
    "name": "Liberal Arts – Faculty Program",
    "program_type": "major",
    "total_credits": 60,
    "description": (
      "An interdisciplinary program that provides a broad foundation in the "
      "humanities and social sciences. Students choose from a wide range of "
      "disciplines with guidance from a faculty advisor to create a coherent "
      "intellectual profile."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/liberal-arts-program/",
    "blocks": [
      {
        "block_key": "humanities",
        "title": "Humanities Courses",
        "credits_needed": 18,
        "notes": "At least 18 credits in humanities disciplines (History, Philosophy, English, Linguistics, Classics, Art History, Religious Studies, etc.).",
        "courses": [
          {"subject":"HIST","catalog":None,"title":"Any HIST course","credits":3,"is_required":False,"recommended":True},
          {"subject":"PHIL","catalog":None,"title":"Any PHIL course","credits":3,"is_required":False,"recommended":True},
          {"subject":"ENGL","catalog":None,"title":"Any ENGL course","credits":3,"is_required":False},
          {"subject":"RELG","catalog":None,"title":"Any RELG course","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "social_sciences",
        "title": "Social Science Courses",
        "credits_needed": 18,
        "notes": "At least 18 credits in social science disciplines (Economics, Political Science, Sociology, Anthropology, Psychology, etc.).",
        "courses": [
          {"subject":"ECON","catalog":None,"title":"Any ECON course","credits":3,"is_required":False,"recommended":True},
          {"subject":"POLI","catalog":None,"title":"Any POLI course","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":None,"title":"Any SOCI course","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":None,"title":"Any PSYC course","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "electives",
        "title": "Additional Electives",
        "credits_needed": 24,
        "notes": "24 additional credits across Arts disciplines to reach 60 total. Students design this portion with their faculty advisor.",
        "courses": [
          {"subject":"ARTS","catalog":None,"title":"Any Faculty of Arts course","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # EUROPEAN LITERATURE AND CULTURE (Minor)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "european_lit_culture_minor",
    "name": "European Literature and Culture – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "A broad interdisciplinary introduction to the development of European "
      "culture through literature, philosophy, and the arts from the Middle Ages "
      "to the present. No prior knowledge of a European language required."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/european-literature-culture-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "required",
        "title": "Required Gateway Course",
        "credits_needed": 3,
        "courses": [
          {"subject":"LLCU","catalog":"210","title":"Introduction to European Literature and Culture","credits":3,"is_required":True,"recommended":True,"recommendation_reason":"Required gateway; excellent broad overview"},
        ],
      },
      {
        "block_key": "complementary",
        "title": "European Culture & Literature Electives",
        "credits_needed": 15,
        "notes": "15 credits from approved LLCU, GERM, HISP, ITAL, RUSS courses. No more than 6 credits from any single language area.",
        "courses": [
          {"subject":"LLCU","catalog":None,"title":"Any LLCU course (200+)","credits":3,"is_required":False,"recommended":True},
          {"subject":"GERM","catalog":"259","title":"Introduction to German Literature 1","credits":3,"is_required":False},
          {"subject":"HISP","catalog":"241","title":"Survey of Peninsular Literature 1","credits":3,"is_required":False},
          {"subject":"ITAL","catalog":"281","title":"Masterpieces of Italian Literature 2","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ──────────────────────────────────────────────────────────────────
  # LATIN AMERICAN & CARIBBEAN STUDIES (Minor)
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "latin_american_caribbean_minor",
    "name": "Latin American and Caribbean Studies – Minor Concentration",
    "program_type": "minor",
    "total_credits": 18,
    "description": (
      "An interdisciplinary minor focusing on the history, politics, cultures, "
      "and societies of Latin America and the Caribbean. Draws on History, "
      "Political Science, Sociology, Hispanic Studies, and Anthropology."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/languages-literatures-cultures/latin-american-caribbean-studies-minor-concentration-ba/",
    "blocks": [
      {
        "block_key": "courses",
        "title": "Latin American & Caribbean Studies Courses",
        "credits_needed": 18,
        "notes": "18 credits from approved courses across departments. At least 9 credits must be directly focused on Latin America or the Caribbean.",
        "courses": [
          {"subject":"HIST","catalog":"259","title":"History of Latin America to 1825","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Core historical foundation"},
          {"subject":"HIST","catalog":"260","title":"History of Latin America since 1825","credits":3,"is_required":False,"recommended":True},
          {"subject":"HISP","catalog":"243","title":"Survey of Spanish-American Literature 1","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"237","title":"Latin American Politics","credits":3,"is_required":False,"recommended":True},
          {"subject":"ANTH","catalog":None,"title":"Any ANTH course on Latin America","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ══════════════════════════════════════════════════════════════════
  # HONOURS PROGRAMS
  # Source: McGill eCalendar 2024-2025
  # ══════════════════════════════════════════════════════════════════

  # ── ECONOMICS HONOURS ─────────────────────────────────────────────
  {
    "program_key": "economics_honours",
    "name": "Economics – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 63,
    "description": (
      "The Honours program is a rigorous, research-oriented sequence designed for students "
      "who intend to pursue graduate studies or careers requiring advanced quantitative skills. "
      "Requires a minimum CGPA of 3.0 to enter and maintain. Includes a research thesis or "
      "directed research component in the final year."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/economics/economics-honours-ba/",
    "blocks": [
      {
        "block_key": "econ_hon_core",
        "title": "Required Core (27 credits)",
        "block_type": "required",
        "credits_needed": 27,
        "courses_needed": None,
        "group_name": None,
        "notes": "All nine courses are required.",
        "sort_order": 1,
        "courses": [
          {"subject":"ECON","catalog":"227D1","title":"Economic Statistics 1","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"227D2","title":"Economic Statistics 2","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"230D1","title":"Microeconomic Theory 1","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"230D2","title":"Microeconomic Theory 2","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"332","title":"Macroeconomic Theory: Majors 1","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"333","title":"Macroeconomic Theory: Majors 2","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"430D1","title":"Advanced Microeconomics 1","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"430D2","title":"Advanced Microeconomics 2","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"440","title":"Econometrics","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "econ_hon_macro",
        "title": "Advanced Macroeconomics (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Both required.",
        "sort_order": 2,
        "courses": [
          {"subject":"ECON","catalog":"450D1","title":"Advanced Macroeconomics 1","credits":3,"is_required":True},
          {"subject":"ECON","catalog":"450D2","title":"Advanced Macroeconomics 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "econ_hon_thesis",
        "title": "Honours Thesis or Research (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Choose thesis (480D1/D2) or directed research (479D1/D2).",
        "sort_order": 3,
        "courses": [
          {"subject":"ECON","catalog":"480D1","title":"Honours Thesis 1","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"480D2","title":"Honours Thesis 2","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"479D1","title":"Directed Research 1","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"479D2","title":"Directed Research 2","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "econ_hon_electives",
        "title": "ECON Electives (24 credits)",
        "block_type": "choose_credits",
        "credits_needed": 24,
        "courses_needed": None,
        "group_name": None,
        "notes": "24 credits of ECON courses at 300-level or above; at least 12 credits at 400-level.",
        "sort_order": 4,
        "courses": [
          {"subject":"ECON","catalog":"334","title":"Topics in Applied Econometrics","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"338","title":"Labour Economics","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"340","title":"Money and Banking","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"342","title":"Public Finance","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"352","title":"Environmental Economics","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"400","title":"International Trade","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"404","title":"Economic History","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"406","title":"Industrial Organisation","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"441","title":"Applied Econometrics 2","credits":3,"is_required":False},
          {"subject":"ECON","catalog":"460","title":"Game Theory","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── POLITICAL SCIENCE HONOURS ─────────────────────────────────────
  {
    "program_key": "political_science_honours",
    "name": "Political Science – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in Political Science offers intensive training in political theory, "
      "comparative politics, international relations, and Canadian politics. Requires "
      "a minimum CGPA of 3.0. Culminates in an honours thesis supervised by a faculty member."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/political-science/political-science-honours-ba/",
    "blocks": [
      {
        "block_key": "polsci_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"POLI","catalog":"211","title":"Introduction to Political Theory","credits":3,"is_required":True},
          {"subject":"POLI","catalog":"212","title":"Introduction to Comparative Politics","credits":3,"is_required":True},
          {"subject":"POLI","catalog":"213","title":"Introduction to International Relations","credits":3,"is_required":True},
          {"subject":"POLI","catalog":"214","title":"Introduction to Canadian Politics","credits":3,"is_required":True},
          {"subject":"POLI","catalog":"385","title":"Research Methods in Political Science","credits":3,"is_required":True},
          {"subject":"POLI","catalog":"386","title":"Quantitative Methods in Political Science","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "polsci_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Both parts required for Honours thesis.",
        "sort_order": 2,
        "courses": [
          {"subject":"POLI","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"POLI","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "polsci_hon_electives",
        "title": "POLI Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits of POLI courses above 200. At least 18 credits at 300-level or above; at least 9 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"POLI","catalog":"330","title":"Contemporary Political Theory","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"331","title":"Liberal Political Theory","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"340","title":"European Politics","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"350","title":"International Security","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"360","title":"Canadian Government and Politics","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"450","title":"Advanced Topics in Political Theory","credits":3,"is_required":False},
          {"subject":"POLI","catalog":"470","title":"Advanced Topics in International Relations","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── PSYCHOLOGY HONOURS ────────────────────────────────────────────
  {
    "program_key": "psychology_honours",
    "name": "Psychology – Honours (B.A./B.Sc.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 63,
    "description": (
      "The Honours program is required for students who wish to apply to graduate school "
      "in psychology. Requires a minimum CGPA of 3.0 and a grade of B or better in PSYC 204. "
      "Includes a supervised honours thesis (PSYC 461/462) or equivalent research training."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/psychology/psychology-honours-ba/",
    "blocks": [
      {
        "block_key": "psyc_hon_core",
        "title": "Required Core (27 credits)",
        "block_type": "required",
        "credits_needed": 27,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required. PSYC 204 must be completed with B or better to continue in Honours.",
        "sort_order": 1,
        "courses": [
          {"subject":"PSYC","catalog":"204","title":"Introduction to Psychological Statistics","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"305","title":"Research Methods and Statistics 1","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"306","title":"Research Methods and Statistics 2","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"212","title":"Biological Bases of Behaviour","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"213","title":"Abnormal Psychology","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"301","title":"Sensation and Perception","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"304","title":"Learning and Behaviour","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"310","title":"Developmental Psychology","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"315","title":"Social Psychology","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "psyc_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Both parts required. Conducted under supervision of a faculty member.",
        "sort_order": 2,
        "courses": [
          {"subject":"PSYC","catalog":"461","title":"Honours Research Thesis 1","credits":3,"is_required":True},
          {"subject":"PSYC","catalog":"462","title":"Honours Research Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "psyc_hon_electives",
        "title": "PSYC Electives (30 credits)",
        "block_type": "choose_credits",
        "credits_needed": 30,
        "courses_needed": None,
        "group_name": None,
        "notes": "30 credits of PSYC at 300-level or above; at least 9 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"PSYC","catalog":"311","title":"Cognitive Psychology","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"319","title":"Brain and Behaviour","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"340","title":"Personality","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"410","title":"Advanced Abnormal Psychology","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"413","title":"Advanced Developmental Psychology","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"433","title":"Cognitive Science","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"514","title":"Cognitive Neuroscience","credits":3,"is_required":False},
          {"subject":"PSYC","catalog":"538","title":"Human Memory","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── SOCIOLOGY HONOURS ─────────────────────────────────────────────
  {
    "program_key": "sociology_honours",
    "name": "Sociology – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in Sociology provides advanced training in sociological theory and research "
      "methods, culminating in an independent research thesis. Requires a minimum CGPA of 3.0 "
      "and is recommended for students considering graduate school."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/sociology/sociology-honours-ba/",
    "blocks": [
      {
        "block_key": "soci_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"SOCI","catalog":"210","title":"Social Research Methods","credits":3,"is_required":True},
          {"subject":"SOCI","catalog":"234","title":"Social Theory 1","credits":3,"is_required":True},
          {"subject":"SOCI","catalog":"235","title":"Social Theory 2","credits":3,"is_required":True},
          {"subject":"SOCI","catalog":"350","title":"Advanced Quantitative Methods","credits":3,"is_required":True},
          {"subject":"SOCI","catalog":"351","title":"Advanced Qualitative Methods","credits":3,"is_required":True},
          {"subject":"SOCI","catalog":"430","title":"Classical Sociological Theory","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "soci_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Independent research supervised by a faculty member.",
        "sort_order": 2,
        "courses": [
          {"subject":"SOCI","catalog":"480D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"SOCI","catalog":"480D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "soci_hon_electives",
        "title": "SOCI Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits of SOCI at 200-level or above; at least 18 credits at 300-level or above.",
        "sort_order": 3,
        "courses": [
          {"subject":"SOCI","catalog":"213","title":"Cities and Social Life","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"217","title":"Sociology of Gender","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"220","title":"Race, Ethnicity, and Society","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"254","title":"Religion and Society","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"330","title":"Stratification and Inequality","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"360","title":"Political Sociology","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"370","title":"Sociology of Law","credits":3,"is_required":False},
          {"subject":"SOCI","catalog":"440","title":"Global Sociology","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── HISTORY HONOURS ──────────────────────────────────────────────
  {
    "program_key": "history_honours",
    "name": "History – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in History is a research-intensive program that develops advanced "
      "historical analysis and writing skills. Students complete an independent thesis "
      "under faculty supervision. Recommended for students pursuing graduate studies or law."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/history-classical-studies/history-honours-ba/",
    "blocks": [
      {
        "block_key": "hist_hon_core",
        "title": "Required Core (12 credits)",
        "block_type": "required",
        "credits_needed": 12,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required. Historical Methods prepares students for thesis writing.",
        "sort_order": 1,
        "courses": [
          {"subject":"HIST","catalog":"198","title":"Historical Methods","credits":3,"is_required":True},
          {"subject":"HIST","catalog":"295","title":"Historical Concepts and Methods","credits":3,"is_required":True},
          {"subject":"HIST","catalog":"396","title":"Advanced Historical Writing","credits":3,"is_required":True},
          {"subject":"HIST","catalog":"498","title":"Advanced Seminar: Historiography","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "hist_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Independent archival or historiographical research.",
        "sort_order": 2,
        "courses": [
          {"subject":"HIST","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"HIST","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "hist_hon_fields",
        "title": "Field Electives (42 credits)",
        "block_type": "choose_credits",
        "credits_needed": 42,
        "courses_needed": None,
        "group_name": None,
        "notes": "42 credits of HIST courses. At least 18 credits in a single geographic or thematic field; at least 12 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"HIST","catalog":"215","title":"History of North America 1","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"216","title":"History of North America 2","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"219","title":"History of Europe: 1789 to Present","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"244","title":"Empire and Colonialism","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"303","title":"Canadian History: Politics","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"330","title":"Modern European History","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"400","title":"Advanced Seminar in History","credits":3,"is_required":False},
          {"subject":"HIST","catalog":"410","title":"Topics in Social History","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── LINGUISTICS HONOURS ──────────────────────────────────────────
  {
    "program_key": "linguistics_honours",
    "name": "Linguistics – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours program offers advanced training in core areas of linguistics: phonology, "
      "syntax, semantics, and phonetics. Includes an honours thesis and is strongly recommended "
      "for students planning graduate work in linguistics, cognitive science, or NLP."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/linguistics/linguistics-honours-ba/",
    "blocks": [
      {
        "block_key": "ling_hon_core",
        "title": "Required Core (24 credits)",
        "block_type": "required",
        "credits_needed": 24,
        "courses_needed": None,
        "group_name": None,
        "notes": "All eight required.",
        "sort_order": 1,
        "courses": [
          {"subject":"LING","catalog":"201","title":"Introduction to Linguistics","credits":3,"is_required":True},
          {"subject":"LING","catalog":"210","title":"Introduction to Speech Science","credits":3,"is_required":True},
          {"subject":"LING","catalog":"260","title":"Meaning in Language","credits":3,"is_required":True},
          {"subject":"LING","catalog":"355","title":"Syntax 1","credits":3,"is_required":True},
          {"subject":"LING","catalog":"360","title":"Phonology 1","credits":3,"is_required":True},
          {"subject":"LING","catalog":"455","title":"Syntax 2","credits":3,"is_required":True},
          {"subject":"LING","catalog":"460","title":"Phonology 2","credits":3,"is_required":True},
          {"subject":"LING","catalog":"370","title":"Semantics","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "ling_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original research in a core area of linguistics.",
        "sort_order": 2,
        "courses": [
          {"subject":"LING","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"LING","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "ling_hon_electives",
        "title": "Linguistics Electives (30 credits)",
        "block_type": "choose_credits",
        "credits_needed": 30,
        "courses_needed": None,
        "group_name": None,
        "notes": "30 credits of LING courses. At least 9 credits at 400-level or above.",
        "sort_order": 3,
        "courses": [
          {"subject":"LING","catalog":"315","title":"Historical Linguistics","credits":3,"is_required":False},
          {"subject":"LING","catalog":"320","title":"Language Acquisition","credits":3,"is_required":False},
          {"subject":"LING","catalog":"330","title":"Sociolinguistics","credits":3,"is_required":False},
          {"subject":"LING","catalog":"345","title":"Morphology","credits":3,"is_required":False},
          {"subject":"LING","catalog":"430","title":"Formal Semantics","credits":3,"is_required":False},
          {"subject":"LING","catalog":"440","title":"Pragmatics","credits":3,"is_required":False},
          {"subject":"LING","catalog":"520","title":"Experimental Linguistics","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── PHILOSOPHY HONOURS ───────────────────────────────────────────
  {
    "program_key": "philosophy_honours",
    "name": "Philosophy – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in Philosophy provides rigorous training in philosophical analysis, "
      "logic, ethics, epistemology, and metaphysics. The thesis component allows students "
      "to develop an original philosophical argument under faculty supervision."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/philosophy/philosophy-honours-ba/",
    "blocks": [
      {
        "block_key": "phil_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"PHIL","catalog":"210","title":"Introduction to Deductive Logic 1","credits":3,"is_required":True},
          {"subject":"PHIL","catalog":"230","title":"Introduction to Moral Theory","credits":3,"is_required":True},
          {"subject":"PHIL","catalog":"242","title":"Introduction to Modern Philosophy","credits":3,"is_required":True},
          {"subject":"PHIL","catalog":"310","title":"Intermediate Logic","credits":3,"is_required":True},
          {"subject":"PHIL","catalog":"320","title":"Epistemology","credits":3,"is_required":True},
          {"subject":"PHIL","catalog":"330","title":"Metaphysics","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "phil_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original contribution to a philosophical debate.",
        "sort_order": 2,
        "courses": [
          {"subject":"PHIL","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"PHIL","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "phil_hon_electives",
        "title": "Philosophy Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits of PHIL. At least 12 credits at 400-level; courses distributed across ethics, metaphysics/epistemology, and history of philosophy.",
        "sort_order": 3,
        "courses": [
          {"subject":"PHIL","catalog":"341","title":"Philosophy of Science 1","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"342","title":"Philosophy of Science 2","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"350","title":"Advanced Ethics","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"360","title":"Political Philosophy","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"411","title":"Topics in Philosophy of Logic and Mathematics","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"415","title":"Philosophy of Language","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"430","title":"Topics in Ethics","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"441","title":"Philosophy of Science 2","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"460","title":"Topics in Metaphysics and Epistemology","credits":3,"is_required":False},
          {"subject":"PHIL","catalog":"474","title":"Phenomenology","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── ANTHROPOLOGY HONOURS ─────────────────────────────────────────
  {
    "program_key": "anthropology_honours",
    "name": "Anthropology – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours program provides intensive training in sociocultural, biological, "
      "and archaeological anthropology. Students conduct original fieldwork or archival "
      "research and produce a supervised thesis. CGPA of 3.0 required to enter."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/anthropology/anthropology-honours-ba/",
    "blocks": [
      {
        "block_key": "anth_hon_core",
        "title": "Required Core (21 credits)",
        "block_type": "required",
        "credits_needed": 21,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"ANTH","catalog":"202","title":"Introduction to Social and Cultural Anthropology","credits":3,"is_required":True},
          {"subject":"ANTH","catalog":"203","title":"Introduction to Biological Anthropology","credits":3,"is_required":True},
          {"subject":"ANTH","catalog":"204","title":"Introduction to Archaeology","credits":3,"is_required":True},
          {"subject":"ANTH","catalog":"303","title":"Social and Cultural Theory","credits":3,"is_required":True},
          {"subject":"ANTH","catalog":"393","title":"Research Methods in Anthropology","credits":3,"is_required":True},
          {"subject":"ANTH","catalog":"494","title":"Honours Seminar","credits":3,"is_required":True},
          {"subject":"ANTH","catalog":"396","title":"Ethnographic Methods","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "anth_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original ethnographic or archival research.",
        "sort_order": 2,
        "courses": [
          {"subject":"ANTH","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"ANTH","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "anth_hon_electives",
        "title": "ANTH Electives (33 credits)",
        "block_type": "choose_credits",
        "credits_needed": 33,
        "courses_needed": None,
        "group_name": None,
        "notes": "33 credits of ANTH. At least 12 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"ANTH","catalog":"310","title":"Medical Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"315","title":"Anthropology of Religion","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"320","title":"Economic Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"403","title":"Advanced Theory in Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"410","title":"Topics in Sociocultural Anthropology","credits":3,"is_required":False},
          {"subject":"ANTH","catalog":"430","title":"Advanced Biological Anthropology","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── ART HISTORY HONOURS ─────────────────────────────────────────
  {
    "program_key": "art_history_honours",
    "name": "Art History – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours program offers advanced study in the history and theory of art from "
      "antiquity to the present. Students produce an original research thesis engaging "
      "primary sources and scholarly literature."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/art-history-communication-studies/art-history-honours-ba/",
    "blocks": [
      {
        "block_key": "arth_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"ARTH","catalog":"205","title":"History of Art: Antiquity and Middle Ages","credits":3,"is_required":True},
          {"subject":"ARTH","catalog":"206","title":"History of Art: Renaissance to Present","credits":3,"is_required":True},
          {"subject":"ARTH","catalog":"301","title":"Art Theory and Criticism","credits":3,"is_required":True},
          {"subject":"ARTH","catalog":"395","title":"Methods in Art History","credits":3,"is_required":True},
          {"subject":"ARTH","catalog":"400","title":"Advanced Seminar in Art History","credits":3,"is_required":True},
          {"subject":"ARTH","catalog":"430","title":"Contemporary Art Theory","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "arth_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original contribution to art history scholarship.",
        "sort_order": 2,
        "courses": [
          {"subject":"ARTH","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"ARTH","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "arth_hon_electives",
        "title": "Art History Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits of ARTH. At least 12 credits at 400-level; courses distributed across chronological periods.",
        "sort_order": 3,
        "courses": [
          {"subject":"ARTH","catalog":"310","title":"Topics in Medieval Art","credits":3,"is_required":False},
          {"subject":"ARTH","catalog":"320","title":"Renaissance Art","credits":3,"is_required":False},
          {"subject":"ARTH","catalog":"340","title":"Modern Art","credits":3,"is_required":False},
          {"subject":"ARTH","catalog":"350","title":"Canadian Art and Architecture","credits":3,"is_required":False},
          {"subject":"ARTH","catalog":"410","title":"Topics in 20th-Century Art","credits":3,"is_required":False},
          {"subject":"ARTH","catalog":"440","title":"Non-Western Art","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── INTERNATIONAL DEVELOPMENT STUDIES HONOURS ────────────────────
  {
    "program_key": "intl_development_honours",
    "name": "International Development Studies – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in International Development Studies combines political economy, "
      "global governance, and fieldwork methods to prepare students for graduate work "
      "or careers in international organisations, NGOs, and policy research."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/international-development/international-development-studies-honours-ba/",
    "blocks": [
      {
        "block_key": "idsc_hon_core",
        "title": "Required Core (21 credits)",
        "block_type": "required",
        "credits_needed": 21,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"IDSC","catalog":"200","title":"Introduction to International Development","credits":3,"is_required":True},
          {"subject":"IDSC","catalog":"210","title":"Political Economy of Development","credits":3,"is_required":True},
          {"subject":"IDSC","catalog":"220","title":"Social Dimensions of Development","credits":3,"is_required":True},
          {"subject":"IDSC","catalog":"300","title":"Research Methods in Development Studies","credits":3,"is_required":True},
          {"subject":"IDSC","catalog":"310","title":"Global Governance","credits":3,"is_required":True},
          {"subject":"IDSC","catalog":"410","title":"Advanced Seminar in Development Theory","credits":3,"is_required":True},
          {"subject":"IDSC","catalog":"495","title":"Honours Seminar","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "idsc_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Fieldwork or archival-based thesis.",
        "sort_order": 2,
        "courses": [
          {"subject":"IDSC","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"IDSC","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "idsc_hon_electives",
        "title": "IDSC Electives (33 credits)",
        "block_type": "choose_credits",
        "credits_needed": 33,
        "courses_needed": None,
        "group_name": None,
        "notes": "33 credits of IDSC or approved cognate courses. At least 9 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"IDSC","catalog":"320","title":"Environment and Development","credits":3,"is_required":False},
          {"subject":"IDSC","catalog":"330","title":"Agrarian Change and Food Systems","credits":3,"is_required":False},
          {"subject":"IDSC","catalog":"340","title":"Gender and Development","credits":3,"is_required":False},
          {"subject":"IDSC","catalog":"400","title":"Topics in International Development","credits":3,"is_required":False},
          {"subject":"IDSC","catalog":"420","title":"Development Finance","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── GEOGRAPHY HONOURS ────────────────────────────────────────────
  {
    "program_key": "geography_honours",
    "name": "Geography – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in Geography trains students in both human and physical geography methods "
      "including GIS, spatial analysis, and fieldwork. The thesis provides experience with "
      "independent geographic research."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/geography/geography-honours-ba/",
    "blocks": [
      {
        "block_key": "geog_hon_core",
        "title": "Required Core (21 credits)",
        "block_type": "required",
        "credits_needed": 21,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"GEOG","catalog":"201","title":"Physical Geography 1: Geomorphology","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"202","title":"Human Geography","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"203","title":"Statistics in Geography","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"303","title":"Quantitative Methods in Geography","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"314","title":"Geographic Information Systems","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"395","title":"Geographic Research Methods","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"430","title":"Advanced Seminar in Geography","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "geog_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original field or data-based research.",
        "sort_order": 2,
        "courses": [
          {"subject":"GEOG","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"GEOG","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "geog_hon_electives",
        "title": "Geography Electives (33 credits)",
        "block_type": "choose_credits",
        "credits_needed": 33,
        "courses_needed": None,
        "group_name": None,
        "notes": "33 credits of GEOG. At least 9 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"GEOG","catalog":"310","title":"Urban Geography","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"320","title":"Political Geography","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"330","title":"Economic Geography","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"340","title":"Cultural Geography","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"410","title":"Advanced Urban Studies","credits":3,"is_required":False},
          {"subject":"GEOG","catalog":"420","title":"Advanced GIS","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── CLASSICS HONOURS ─────────────────────────────────────────────
  {
    "program_key": "classics_honours",
    "name": "Classics – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in Classics offers intensive study of ancient Greek and Latin languages, "
      "literature, history, and archaeology. The thesis can focus on textual, historical, "
      "or archaeological topics and is conducted in consultation with a faculty supervisor."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/history-classical-studies/classics-honours-ba/",
    "blocks": [
      {
        "block_key": "clas_hon_languages",
        "title": "Language Requirements (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "6 credits of Greek and 6 credits of Latin required; 6 additional credits in one language.",
        "sort_order": 1,
        "courses": [
          {"subject":"GREK","catalog":"201","title":"Intermediate Greek 1","credits":3,"is_required":True},
          {"subject":"GREK","catalog":"202","title":"Intermediate Greek 2","credits":3,"is_required":True},
          {"subject":"LATN","catalog":"201","title":"Intermediate Latin 1","credits":3,"is_required":True},
          {"subject":"LATN","catalog":"202","title":"Intermediate Latin 2","credits":3,"is_required":True},
          {"subject":"GREK","catalog":"301","title":"Advanced Greek","credits":3,"is_required":False},
          {"subject":"LATN","catalog":"301","title":"Advanced Latin","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "clas_hon_core",
        "title": "Required Classics Courses (12 credits)",
        "block_type": "required",
        "credits_needed": 12,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 2,
        "courses": [
          {"subject":"CLAS","catalog":"325","title":"Greek Historiography","credits":3,"is_required":True},
          {"subject":"CLAS","catalog":"326","title":"Latin Literature and Culture","credits":3,"is_required":True},
          {"subject":"CLAS","catalog":"395","title":"Methods in Classical Studies","credits":3,"is_required":True},
          {"subject":"CLAS","catalog":"430","title":"Advanced Seminar in Classics","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "clas_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Thesis in Greek, Latin, history, or classical archaeology.",
        "sort_order": 3,
        "courses": [
          {"subject":"CLAS","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"CLAS","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "clas_hon_electives",
        "title": "Classics Electives (24 credits)",
        "block_type": "choose_credits",
        "credits_needed": 24,
        "courses_needed": None,
        "group_name": None,
        "notes": "24 credits from CLAS, GREK, LATN, or HIST (ancient). At least 9 credits at 400-level.",
        "sort_order": 4,
        "courses": [
          {"subject":"CLAS","catalog":"310","title":"Greek and Roman Mythology","credits":3,"is_required":False},
          {"subject":"CLAS","catalog":"330","title":"Greek Philosophy","credits":3,"is_required":False},
          {"subject":"CLAS","catalog":"340","title":"Roman History","credits":3,"is_required":False},
          {"subject":"CLAS","catalog":"350","title":"Ancient Near East","credits":3,"is_required":False},
          {"subject":"CLAS","catalog":"410","title":"Topics in Greek Literature","credits":3,"is_required":False},
          {"subject":"CLAS","catalog":"420","title":"Topics in Roman Literature","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── GSFSJ HONOURS ───────────────────────────────────────────────
  {
    "program_key": "gsfsj_honours",
    "name": "Gender, Sexuality, Feminist & Social Justice Studies – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours program offers advanced interdisciplinary training in feminist theory, "
      "queer studies, and social justice praxis. The thesis allows students to conduct "
      "original research using intersectional and feminist methodologies."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/gender-sexuality-feminist-studies/gender-sexuality-feminist-social-justice-studies-honours-ba/",
    "blocks": [
      {
        "block_key": "gsfsj_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"GSFS","catalog":"200","title":"Introduction to Feminist and Gender Studies","credits":3,"is_required":True},
          {"subject":"GSFS","catalog":"201","title":"Introduction to Queer Studies","credits":3,"is_required":True},
          {"subject":"GSFS","catalog":"300","title":"Feminist Theory","credits":3,"is_required":True},
          {"subject":"GSFS","catalog":"310","title":"Research Methods in GSFSJ","credits":3,"is_required":True},
          {"subject":"GSFS","catalog":"400","title":"Advanced Feminist Theory","credits":3,"is_required":True},
          {"subject":"GSFS","catalog":"495","title":"Honours Seminar","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "gsfsj_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original interdisciplinary feminist research.",
        "sort_order": 2,
        "courses": [
          {"subject":"GSFS","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"GSFS","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "gsfsj_hon_electives",
        "title": "GSFSJ & Cognate Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits from GSFS or approved cognate courses. At least 9 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"GSFS","catalog":"320","title":"Gender and Sexuality in the Media","credits":3,"is_required":False},
          {"subject":"GSFS","catalog":"330","title":"Transnational Feminisms","credits":3,"is_required":False},
          {"subject":"GSFS","catalog":"340","title":"Race, Gender, and Social Justice","credits":3,"is_required":False},
          {"subject":"GSFS","catalog":"410","title":"Topics in Feminist Theory","credits":3,"is_required":False},
          {"subject":"GSFS","catalog":"420","title":"Queer Theory","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── JEWISH STUDIES HONOURS ────────────────────────────────────────
  {
    "program_key": "jewish_studies_honours",
    "name": "Jewish Studies – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in Jewish Studies offers advanced interdisciplinary study of Jewish "
      "history, thought, literature, and culture. Students conduct original research "
      "leading to an honours thesis under faculty supervision."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/jewish-studies/jewish-studies-honours-ba/",
    "blocks": [
      {
        "block_key": "jwst_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"JWST","catalog":"200","title":"Introduction to Jewish Studies","credits":3,"is_required":True},
          {"subject":"JWST","catalog":"201","title":"The Jewish Tradition: Texts and Interpretations","credits":3,"is_required":True},
          {"subject":"JWST","catalog":"300","title":"Jewish History: Ancient to Medieval","credits":3,"is_required":True},
          {"subject":"JWST","catalog":"301","title":"Jewish History: Modern Period","credits":3,"is_required":True},
          {"subject":"JWST","catalog":"395","title":"Methods in Jewish Studies","credits":3,"is_required":True},
          {"subject":"JWST","catalog":"430","title":"Advanced Seminar in Jewish Studies","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "jwst_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original research in any area of Jewish Studies.",
        "sort_order": 2,
        "courses": [
          {"subject":"JWST","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"JWST","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "jwst_hon_electives",
        "title": "Jewish Studies Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits from JWST. At least 9 credits at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"JWST","catalog":"310","title":"Holocaust Studies","credits":3,"is_required":False},
          {"subject":"JWST","catalog":"320","title":"Zionism and the State of Israel","credits":3,"is_required":False},
          {"subject":"JWST","catalog":"330","title":"Jewish Literature","credits":3,"is_required":False},
          {"subject":"JWST","catalog":"340","title":"Kabbalah and Jewish Mysticism","credits":3,"is_required":False},
          {"subject":"JWST","catalog":"410","title":"Topics in Modern Jewish History","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── EAST ASIAN STUDIES HONOURS ───────────────────────────────────
  {
    "program_key": "east_asian_studies_honours",
    "name": "East Asian Studies – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in East Asian Studies combines advanced language training with interdisciplinary "
      "study of the history, literature, religion, and cultures of East Asia. Students complete "
      "an independent thesis in consultation with a faculty supervisor."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/east-asian-studies/east-asian-studies-honours-ba/",
    "blocks": [
      {
        "block_key": "east_hon_language",
        "title": "Language Requirement (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "Advanced proficiency in Chinese, Japanese, or Korean; 18 credits in one East Asian language.",
        "sort_order": 1,
        "courses": [
          {"subject":"CHIN","catalog":"301","title":"Advanced Chinese 1","credits":3,"is_required":False},
          {"subject":"CHIN","catalog":"302","title":"Advanced Chinese 2","credits":3,"is_required":False},
          {"subject":"CHIN","catalog":"401","title":"Classical Chinese Texts","credits":3,"is_required":False},
          {"subject":"JAPN","catalog":"301","title":"Advanced Japanese 1","credits":3,"is_required":False},
          {"subject":"JAPN","catalog":"302","title":"Advanced Japanese 2","credits":3,"is_required":False},
          {"subject":"KORE","catalog":"301","title":"Advanced Korean 1","credits":3,"is_required":False},
        ],
      },
      {
        "block_key": "east_hon_core",
        "title": "Required EAST Core (12 credits)",
        "block_type": "required",
        "credits_needed": 12,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 2,
        "courses": [
          {"subject":"EAST","catalog":"230","title":"Introduction to East Asian Civilizations 1","credits":3,"is_required":True},
          {"subject":"EAST","catalog":"231","title":"Introduction to East Asian Civilizations 2","credits":3,"is_required":True},
          {"subject":"EAST","catalog":"395","title":"Research Methods in East Asian Studies","credits":3,"is_required":True},
          {"subject":"EAST","catalog":"430","title":"Advanced Seminar in East Asian Studies","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "east_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Original research using primary sources in an East Asian language.",
        "sort_order": 3,
        "courses": [
          {"subject":"EAST","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"EAST","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "east_hon_electives",
        "title": "EAST & Language Electives (24 credits)",
        "block_type": "choose_credits",
        "credits_needed": 24,
        "courses_needed": None,
        "group_name": None,
        "notes": "24 credits from EAST or advanced language courses. At least 9 credits at 400-level.",
        "sort_order": 4,
        "courses": [
          {"subject":"EAST","catalog":"310","title":"Chinese Literature in Translation","credits":3,"is_required":False},
          {"subject":"EAST","catalog":"320","title":"Japanese Culture and Society","credits":3,"is_required":False},
          {"subject":"EAST","catalog":"330","title":"History of East Asian Buddhism","credits":3,"is_required":False},
          {"subject":"EAST","catalog":"410","title":"Topics in Chinese History","credits":3,"is_required":False},
          {"subject":"EAST","catalog":"420","title":"Topics in Japanese Literature","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── RELIGIOUS STUDIES HONOURS ────────────────────────────────────
  {
    "program_key": "religious_studies_honours",
    "name": "Religious Studies – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in Religious Studies examines the world's religious traditions through "
      "historical, anthropological, literary, and philosophical lenses. The thesis can "
      "engage any religious tradition or theoretical problem in the discipline."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/religious-studies/religious-studies-honours-ba/",
    "blocks": [
      {
        "block_key": "relg_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"RELG","catalog":"207","title":"Introduction to Judaism","credits":3,"is_required":True},
          {"subject":"RELG","catalog":"208","title":"Introduction to Christianity","credits":3,"is_required":True},
          {"subject":"RELG","catalog":"203","title":"Introduction to Hinduism","credits":3,"is_required":True},
          {"subject":"RELG","catalog":"204","title":"Introduction to Buddhism","credits":3,"is_required":True},
          {"subject":"RELG","catalog":"395","title":"Research Methods in Religious Studies","credits":3,"is_required":True},
          {"subject":"RELG","catalog":"430","title":"Advanced Seminar in Religious Studies","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "relg_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Independent research on a religious tradition or theoretical problem.",
        "sort_order": 2,
        "courses": [
          {"subject":"RELG","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"RELG","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "relg_hon_electives",
        "title": "RELG Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits of RELG. At least 9 credits at 400-level; at least two traditions represented.",
        "sort_order": 3,
        "courses": [
          {"subject":"RELG","catalog":"305","title":"Islam","credits":3,"is_required":False},
          {"subject":"RELG","catalog":"310","title":"Mysticism in the World Religions","credits":3,"is_required":False},
          {"subject":"RELG","catalog":"320","title":"Ritual and Symbol","credits":3,"is_required":False},
          {"subject":"RELG","catalog":"330","title":"Religion and Ethics","credits":3,"is_required":False},
          {"subject":"RELG","catalog":"410","title":"Topics in Religious Studies","credits":3,"is_required":False},
          {"subject":"RELG","catalog":"420","title":"Religion and Modernity","credits":3,"is_required":False},
        ],
      },
    ],
  },

  # ── WORLD ISLAMIC AND MIDDLE EAST STUDIES HONOURS ────────────────
  {
    "program_key": "world_islamic_mideast_honours",
    "name": "World Islamic and Middle East Studies – Honours (B.A.)",
    "program_type": "honours",
    "faculty": "Faculty of Arts",
    "total_credits": 60,
    "description": (
      "The Honours in World Islamic and Middle East Studies provides advanced interdisciplinary "
      "training in the history, religion, politics, and culture of the Middle East and the "
      "broader Islamic world. The thesis requires primary source engagement."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/islamic-studies/world-islamic-middle-east-studies-honours-ba/",
    "blocks": [
      {
        "block_key": "isla_hon_core",
        "title": "Required Core (18 credits)",
        "block_type": "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name": None,
        "notes": "All required.",
        "sort_order": 1,
        "courses": [
          {"subject":"ISLA","catalog":"200","title":"Introduction to Islam","credits":3,"is_required":True},
          {"subject":"ISLA","catalog":"210","title":"Introduction to the Middle East","credits":3,"is_required":True},
          {"subject":"ISLA","catalog":"300","title":"Islamic Thought and Civilization","credits":3,"is_required":True},
          {"subject":"ISLA","catalog":"310","title":"Middle Eastern History: Modern Period","credits":3,"is_required":True},
          {"subject":"ISLA","catalog":"395","title":"Research Methods in Islamic Studies","credits":3,"is_required":True},
          {"subject":"ISLA","catalog":"430","title":"Advanced Seminar in Islamic Studies","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "isla_hon_thesis",
        "title": "Honours Thesis (6 credits)",
        "block_type": "required",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name": None,
        "notes": "Thesis using primary sources; Arabic or other relevant language strongly recommended.",
        "sort_order": 2,
        "courses": [
          {"subject":"ISLA","catalog":"490D1","title":"Honours Thesis 1","credits":3,"is_required":True},
          {"subject":"ISLA","catalog":"490D2","title":"Honours Thesis 2","credits":3,"is_required":True},
        ],
      },
      {
        "block_key": "isla_hon_electives",
        "title": "ISLA Electives (36 credits)",
        "block_type": "choose_credits",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name": None,
        "notes": "36 credits from ISLA or approved cognate courses (RELG, HIST, POLI). At least 9 at 400-level.",
        "sort_order": 3,
        "courses": [
          {"subject":"ISLA","catalog":"320","title":"Gender and Islam","credits":3,"is_required":False},
          {"subject":"ISLA","catalog":"330","title":"Political Islam","credits":3,"is_required":False},
          {"subject":"ISLA","catalog":"340","title":"Sufism and Islamic Mysticism","credits":3,"is_required":False},
          {"subject":"ISLA","catalog":"410","title":"Topics in Islamic History","credits":3,"is_required":False},
          {"subject":"ISLA","catalog":"420","title":"Modern Arab Literature","credits":3,"is_required":False},
        ],
      },
    ],
  },

# ──────────────────────────────────────────────────────────────────
  # SCIENCE FOR ARTS STUDENTS
  # ──────────────────────────────────────────────────────────────────
  {
    "program_key": "science_for_arts_students_minor",
    "name": "Science for Arts Students – Minor Concentration",
    "program_type": "minor",
    "faculty": "Faculty of Arts",
    "total_credits": 18,
    "description": (
      "Designed for Arts students who wish to gain a broad understanding of the natural "
      "sciences. Students complete courses across multiple science disciplines. No single "
      "subject may contribute more than 6 credits."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/programs/",
    "blocks": [
      {
        "block_key": "science_courses",
        "title": "Science Courses",
        "block_type": "choose_credits",
        "credits_needed": 18,
        "notes": (
          "18 credits from approved science courses. No more than 6 credits from "
          "any single subject. Courses must be from: BIOL, CHEM, EPSC, MATH, PHYS, "
          "ATOC, GEOG (physical), ENVR, or COMP."
        ),
        "sort_order": 1,
        "courses": [
          {"subject":"BIOL","catalog":"111","title":"Principles: Organismal Biology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Accessible intro to biology; no prerequisites"},
          {"subject":"BIOL","catalog":"112","title":"Cell and Molecular Biology","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Pairs well with BIOL 111"},
          {"subject":"CHEM","catalog":"110","title":"General Chemistry 1","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Foundational chemistry; widely applicable"},
          {"subject":"CHEM","catalog":"120","title":"General Chemistry 2","credits":3,"is_required":False},
          {"subject":"PHYS","catalog":"101","title":"Introductory Physics – Mechanics","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Introductory physics for non-majors"},
          {"subject":"PHYS","catalog":"102","title":"Introductory Physics – Electromagnetism","credits":3,"is_required":False},
          {"subject":"MATH","catalog":"133","title":"Linear Algebra and Geometry","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Useful across many fields including CS and economics"},
          {"subject":"MATH","catalog":"140","title":"Calculus 1","credits":3,"is_required":False},
          {"subject":"EPSC","catalog":"201","title":"Understanding Planet Earth","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Very popular; engaging and accessible for non-science students"},
          {"subject":"EPSC","catalog":"210","title":"Earth and Life History","credits":3,"is_required":False},
          {"subject":"ATOC","catalog":"185","title":"Natural Disasters","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Popular science elective; covers earthquakes, hurricanes, etc."},
          {"subject":"ENVR","catalog":"200","title":"The Global Environment","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Interdisciplinary; relevant to current environmental issues"},
          {"subject":"COMP","catalog":"202","title":"Foundations of Programming","credits":3,"is_required":False,"recommended":True,"recommendation_reason":"Highly practical; complements any Arts major"},
        ],
      },
    ],
  },
]
# ──────────────────────────────────────────────────────────────────
# Database seed function
# ──────────────────────────────────────────────────────────────────

def seed_degree_requirements(supabase):
    """
    Insert all Arts degree requirements into Supabase.
    Safe to re-run: uses upsert on program_key, then deletes+reinserts blocks.

    Block types stored in DB:
      required       — every course must be taken
      choose_credits — take credits_needed credits from list
      choose_courses — take courses_needed courses from list
      group          — named sub-group (Group A/B/C) feeding a parent rule
      multi_group    — parent: "X credits from Group A AND Y from Group B"
      pool_group     — parent: "at least X credits from Groups A+B+C combined"
      level_elective — any courses at a given level range
    """
    inserted_programs = 0
    inserted_blocks = 0
    inserted_courses = 0

    for prog in ARTS_PROGRAMS:
        # ── Upsert program ──────────────────────────────────────────
        prog_data = {
            "program_key":  prog["program_key"],
            "name":         prog["name"],
            "faculty":      prog.get("faculty", "Faculty of Arts"),
            "program_type": prog["program_type"],
            "total_credits": prog.get("total_credits") or 0,
            "description":  prog.get("description"),
            "ecalendar_url": prog.get("ecalendar_url"),
        }
        result = supabase.table("degree_programs").upsert(
            prog_data, on_conflict="program_key"
        ).execute()
        prog_id = result.data[0]["id"]
        inserted_programs += 1

        # ── Clean re-seed blocks ────────────────────────────────────
        supabase.table("requirement_blocks").delete().eq("program_id", prog_id).execute()

        for i, block in enumerate(prog.get("blocks", [])):
            # Build constraint_notes: merge scraped constraint_notes + legacy notes
            constraint_notes = block.get("constraint_notes") or block.get("notes") or ""

            block_data = {
                "program_id":       prog_id,
                "block_key":        block.get("block_key", f"block_{i}"),
                "title":            block.get("title", ""),
                # New fields
                "block_type":       block.get("block_type", "choose_credits"),
                "group_name":       block.get("group_name"),
                "courses_needed":   block.get("courses_needed"),
                "constraint_notes": constraint_notes,
                # Legacy / existing fields
                "credits_needed":   block.get("credits_needed"),
                "min_level":        block.get("min_level"),
                "max_credits_200":  block.get("max_credits_200"),
                "min_credits_400":  block.get("min_credits_400"),
                "notes":            block.get("notes", ""),
                "sort_order":       block.get("sort_order", i),
            }
            block_result = supabase.table("requirement_blocks").insert(block_data).execute()
            block_id = block_result.data[0]["id"]
            inserted_blocks += 1

            for j, course in enumerate(block.get("courses", [])):
                # Infer is_required from block_type if not explicitly set
                is_required = course.get("is_required", False)
                if block.get("block_type") == "required":
                    is_required = True

                course_data = {
                    "block_id":           block_id,
                    "subject":            course.get("subject", ""),
                    "catalog":            course.get("catalog"),
                    "title":              course.get("title", ""),
                    "credits":            course.get("credits", 3),
                    "is_required":        is_required,
                    "choose_from_group":  course.get("choose_from_group"),
                    "choose_n_credits":   course.get("choose_n_credits"),
                    "notes":              course.get("notes"),
                    "recommended":        course.get("recommended", False),
                    "recommendation_reason": course.get("recommendation_reason"),
                    "sort_order":         j,
                }
                supabase.table("requirement_courses").insert(course_data).execute()
                inserted_courses += 1

    return {
        "programs": inserted_programs,
        "blocks":   inserted_blocks,
        "courses":  inserted_courses,
    }


if __name__ == "__main__":
    import os
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from api.utils.supabase_client import get_supabase
    supabase = get_supabase()
    stats = seed_degree_requirements(supabase)
    print(f"Seeded: {stats['programs']} programs, {stats['blocks']} blocks, {stats['courses']} courses")
