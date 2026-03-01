"""
McGill Faculty of Dental Medicine and Oral Health Sciences – Degree Requirements Seed Data
Source: McGill eCalendar 2024-2025 & Course Catalogue
https://coursecatalogue.mcgill.ca/en/undergraduate/dentistry/
https://www.mcgill.ca/study/2024-2025/faculties/dentistry/

This file covers the two undergraduate dentistry programs:
  1. Doctor of Dental Medicine (D.M.D.) – Four-Year Program  (221 credits)
  2. Dental Preparatory Year (Dent-P) – B.Sc. year          ( 30 credits)

Accuracy notes:
  - The DMD curriculum is under constant revision (official eCalendar disclaimer).
  - Year 1 courses are shared with the Faculty of Medicine and Health Sciences
    (INDS 111–119 are the Fundamentals of Medicine and Dentistry block).
  - The 2024-2025 curriculum introduced new DENT 1xx course numbers
    (DENT 111, 112, 114) that replace older DENT 101 series for incoming Y1 students.
  - Clinical Years 3–4 involve rotations at external sites:
      • Oral & Maxillofacial Surgery – Montreal General Hospital
      • Paediatric Dentistry – Montreal Children's Hospital
      • Jim Lund Dental Clinic – Welcome Hall Mission (St. Henri)
      • Alan Edwards Pain Management Unit – Montreal General Hospital
  - Dent-P students must maintain CGPA ≥ 3.5 with all required-course grades ≥ B
    to be promoted into Year 1 of the D.M.D. program.
  - French language proficiency equivalent to B2 intermediate is required by the
    start of Year 3 clinical practice courses.
  - All D.M.D. students must purchase a McGill Instrument Kit from the Faculty.
  - CPR/AED certification (level C+ or C) must be current throughout the program.
  - DAT (Dental Aptitude Test) is NOT required for Fall 2023 or Fall 2024 entry;
    future cycles are under review.
  - CASPer test is mandatory for all applicants.
"""

import logging
logger = logging.getLogger(__name__)

DENTISTRY_PROGRAMS = [

  # ══════════════════════════════════════════════════════════════════════
  #  DOCTOR OF DENTAL MEDICINE (D.M.D.) – FOUR-YEAR PROGRAM (221 credits)
  # ══════════════════════════════════════════════════════════════════════
  {
    "program_key":   "dmd_dentistry",
    "name":          "Doctor of Dental Medicine (D.M.D.) Dentistry – Four-Year Program (221 credits)",
    "program_type":  "major",   # professional degree – mapped to "major" (DB constraint)
    "faculty":       "Faculty of Dental Medicine and Oral Health Sciences",
    "total_credits": 221,
    "description": (
      "The D.M.D. program is an innovative four-year professional degree focused on "
      "evidence-based oral health practice, social justice, and leadership. Years 1–2 "
      "include the Fundamentals of Medicine and Dentistry (FMD) taught jointly with the "
      "Faculty of Medicine and Health Sciences (INDS courses), plus DENT-specific "
      "pre-clinical simulation labs. Year 2 transitions to advanced pre-clinical skills. "
      "Years 3–4 are predominantly clinical practice in the state-of-the-art undergraduate "
      "teaching clinic, with hospital rotations at the Montreal General, Montreal Children's, "
      "and community clinics. Graduates are eligible for licensure by the Ordre des dentistes "
      "du Québec and by other provincial bodies across Canada. Admission requires a completed "
      "120-credit bachelor's degree (any discipline), science prerequisites, and CASPer test. "
      "French B2 proficiency is required by the start of Year 3 clinical courses."
    ),
    "ecalendar_url": (
      "https://www.mcgill.ca/study/2024-2025/faculties/dentistry/undergraduate/programs/"
      "doctor-dental-medicine-dmd-dentistry-four-year-program"
    ),
    "blocks": [

      # ── Year 1: Fundamentals of Medicine & Dentistry (FMD) ─────────────
      {
        "block_key":      "dmd_year1_fmd",
        "title":          "Year 1 – Fundamentals of Medicine and Dentistry (FMD)",
        "block_type":     "required",
        "credits_needed": None,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "All Year 1 courses are required. INDS courses (111–119) are taught jointly with "
          "MD,CM students and cover organ systems from the molecular to the global level. "
          "DENT 111J1/J2/J3 runs across Fall, Winter, and Summer terms as a J-series "
          "(must all be completed in consecutive terms). "
          "IPEA 500 and 501 are non-credit interprofessional workshops. "
          "DENT 113D1/D2 (Community Oral Health Services) may not be offered every year – "
          "confirm scheduling on Minerva."
        ),
        "sort_order": 1,
        "courses": [
          # --- FMD shared (INDS) ---
          {"subject": "INDS", "catalog": "111", "title": "Molecules to Global Health",
           "credits": 6, "is_required": True, "recommended": True,
           "recommendation_reason": "First FMD block – molecular biology, pathology pharmacology, and health care systems; opens Year 1 Fall"},
          {"subject": "INDS", "catalog": "112", "title": "Respiration",
           "credits": 6, "is_required": True, "recommended": True,
           "recommendation_reason": "Respiratory system anatomy, physiology, pathology; Year 1 Fall"},
          {"subject": "INDS", "catalog": "113", "title": "Circulation",
           "credits": 8, "is_required": True, "recommended": True,
           "recommendation_reason": "Cardiovascular anatomy, physiology, and pathology; Year 1 Fall"},
          {"subject": "INDS", "catalog": "114", "title": "Digestion and Metabolism",
           "credits": 8, "is_required": True, "recommended": True,
           "recommendation_reason": "GI and hepatobiliary systems, metabolic disorders; Year 1 Winter"},
          {"subject": "INDS", "catalog": "115", "title": "Renal",
           "credits": 6, "is_required": True, "recommended": True,
           "recommendation_reason": "Renal physiology, electrolytes, and renal pathology; Year 1 Winter"},
          {"subject": "INDS", "catalog": "116", "title": "Defense",
           "credits": 6, "is_required": True, "recommended": True,
           "recommendation_reason": "Infectious diseases, immunology, dermatology; Year 1 Summer"},
          {"subject": "INDS", "catalog": "117", "title": "Infection",
           "credits": 6, "is_required": True, "recommended": True,
           "recommendation_reason": "Endocrine disorders; Year 1 Summer"},
          {"subject": "INDS", "catalog": "119J1", "title": "Clinical Method 1",
           "credits": 1, "is_required": True, "recommended": True,
           "recommendation_reason": "Medical interviewing, physical exam, and case history writing; Fall"},
          {"subject": "INDS", "catalog": "119J2", "title": "Clinical Method 1",
           "credits": 1, "is_required": True, "recommended": True,
           "recommendation_reason": "Continuation; Winter"},
          {"subject": "INDS", "catalog": "119J3", "title": "Clinical Method 1",
           "credits": 1, "is_required": True, "recommended": True,
           "recommendation_reason": "Continuation; Summer"},
          # --- DENT Year 1 ---
          {"subject": "DENT", "catalog": "111J1", "title": "Introduction to Dentistry",
           "credits": 2, "is_required": True, "recommended": True,
           "recommendation_reason": "Foundations of dentistry, oral biology, dental public health; Year 1 Fall"},
          {"subject": "DENT", "catalog": "111J2", "title": "Introduction to Dentistry",
           "credits": 2, "is_required": True, "recommended": True,
           "recommendation_reason": "Continuation; Year 1 Winter"},
          {"subject": "DENT", "catalog": "111J3", "title": "Introduction to Dentistry",
           "credits": 2, "is_required": True, "recommended": True,
           "recommendation_reason": "Continuation; Year 1 Summer"},
          {"subject": "DENT", "catalog": "112",   "title": "Oral Medicine and Manifestation of Systemic Diseases",
           "credits": 4, "is_required": True, "recommended": True,
           "recommendation_reason": "Oral manifestations of systemic diseases, diagnosis and management; Year 1 Winter"},
          {"subject": "DENT", "catalog": "113D1", "title": "Community Oral Health Services 1",
           "credits": 0.5, "is_required": True, "recommended": True,
           "recommendation_reason": "Reducing oral health disparities in underserved communities; confirm scheduling on Minerva"},
          {"subject": "DENT", "catalog": "113D2", "title": "Community Oral Health Services 1",
           "credits": 0.5, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 113D1; must be taken consecutively"},
          {"subject": "DENT", "catalog": "114D1", "title": "Head and Neck Anatomy and Histology",
           "credits": 3, "is_required": True, "recommended": True,
           "recommendation_reason": "Head and neck dissection, histology, pain pathways; Year 1 Winter"},
          {"subject": "DENT", "catalog": "114D2", "title": "Head and Neck Anatomy and Histology",
           "credits": 3, "is_required": True, "recommended": True,
           "recommendation_reason": "Continuation; Year 1 Summer"},
          {"subject": "DENT", "catalog": "125D1", "title": "Oral Health Research 1",
           "credits": 0.5, "is_required": True, "recommended": True,
           "recommendation_reason": "Introduction to research fundamentals and activities at the faculty"},
          {"subject": "DENT", "catalog": "125D2", "title": "Oral Health Research 1",
           "credits": 0.5, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 125D1"},
          {"subject": "DENT", "catalog": "210",   "title": "Introduction to Oral Medicine and Oral Diagnosis",
           "credits": 1, "is_required": True, "recommended": True,
           "recommendation_reason": "Patient workup, differential diagnosis, treatment planning; prereq: DENT 101J1/J2/J3 or DENT 111J1/J2/J3"},
          # --- Interprofessional (non-credit) ---
          {"subject": "IPEA", "catalog": "500",   "title": "Roles in Interprofessional Teams",
           "credits": 0, "is_required": True, "recommended": True,
           "recommendation_reason": "Non-credit half-day workshop on interprofessional team roles; Year 1 Fall"},
          {"subject": "IPEA", "catalog": "501",   "title": "Communication in Interprofessional Teams",
           "credits": 0, "is_required": True, "recommended": True,
           "recommendation_reason": "Non-credit workshop on communication in healthcare teams; Year 1 Winter"},
        ],
      },

      # ── Year 2 FMD (continued) ──────────────────────────────────────────
      {
        "block_key":      "dmd_year2_fmd",
        "title":          "Year 2 – Fundamentals of Medicine (continued)",
        "block_type":     "required",
        "credits_needed": None,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "INDS 211 and 212 complete the FMD shared curriculum. Both require successful "
          "completion of all Promotion Period I courses (Year 1 block) before enrolment."
        ),
        "sort_order": 2,
        "courses": [
          {"subject": "INDS", "catalog": "211", "title": "Reproduction and Sexuality",
           "credits": 6, "is_required": True, "recommended": True,
           "recommendation_reason": "Reproductive anatomy, physiology, pathology; Year 2 Fall"},
          {"subject": "INDS", "catalog": "212", "title": "Human Behaviour",
           "credits": 12, "is_required": True, "recommended": True,
           "recommendation_reason": "Psychiatry, neurology, and CNS pathology; Year 2 Fall"},
        ],
      },

      # ── Year 2 DENT-specific ────────────────────────────────────────────
      {
        "block_key":      "dmd_year2_dent",
        "title":          "Year 2 – Dental Sciences and Pre-Clinical Skills",
        "block_type":     "required",
        "credits_needed": None,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "Year 2 builds dental science knowledge and begins simulation lab training. "
          "DENT 231/232 may not be offered in 2024-2025 for incoming students – check "
          "Minerva. DENT 242J1/J2/J3 (Restorative Dentistry Operative) is the primary "
          "psychomotor-skills lab, covering tooth preparation and direct restorations. "
          "DENT 243 (Endodontics A) covers root canal fundamentals with simulation lab."
        ),
        "sort_order": 3,
        "courses": [
          {"subject": "DENT", "catalog": "213D1", "title": "Community Oral Health Services 2",
           "credits": 0.5, "is_required": True, "recommended": True,
           "recommendation_reason": "Community clinic program continuation; Year 2"},
          {"subject": "DENT", "catalog": "213D2", "title": "Community Oral Health Services 2",
           "credits": 0.5, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 213D1"},
          {"subject": "DENT", "catalog": "222D1", "title": "Radiology",
           "credits": 1.5, "is_required": True, "recommended": True,
           "recommendation_reason": "Radiation physics, imaging, caries/perio/periapical radiographic interpretation; Year 2 Winter"},
          {"subject": "DENT", "catalog": "222D2", "title": "Radiology",
           "credits": 1.5, "is_required": True, "recommended": True,
           "recommendation_reason": "Continuation; Year 2 Summer"},
          {"subject": "DENT", "catalog": "225D1", "title": "Oral Health Research 2",
           "credits": 1, "is_required": True, "recommended": True,
           "recommendation_reason": "Research design and hands-on research experience; prereq: DENT 125D1/D2"},
          {"subject": "DENT", "catalog": "225D2", "title": "Oral Health Research 2",
           "credits": 1, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 225D1"},
          {"subject": "DENT", "catalog": "231",   "title": "Professional Identity Development",
           "credits": 2, "is_required": True, "recommended": True,
           "recommendation_reason": "Social justice, equity, diversity, interprofessional relations; Year 2"},
          {"subject": "DENT", "catalog": "232",   "title": "Dental Public Health A",
           "credits": 3, "is_required": True, "recommended": True,
           "recommendation_reason": "Oral health, sustainable dentistry, patient-centred care; Year 2"},
          {"subject": "DENT", "catalog": "240",   "title": "Dental Anatomy and Occlusion",
           "credits": 3, "is_required": True, "recommended": True,
           "recommendation_reason": "Tooth anatomy, occlusal principles; foundational for all restorative work; Year 2"},
          {"subject": "DENT", "catalog": "241",   "title": "Cariology",
           "credits": 3, "is_required": True, "recommended": True,
           "recommendation_reason": "Evidence-based caries diagnosis, risk assessment, minimal intervention; Year 2"},
          {"subject": "DENT", "catalog": "242J1", "title": "Restorative Dentistry (Operative)",
           "credits": 2, "is_required": True, "recommended": True,
           "recommendation_reason": "Psychomotor simulation lab – tooth prep, direct restorations, biomaterials; Year 2"},
          {"subject": "DENT", "catalog": "242J2", "title": "Restorative Dentistry (Operative)",
           "credits": 2, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 242J1"},
          {"subject": "DENT", "catalog": "242J3", "title": "Restorative Dentistry (Operative)",
           "credits": 2, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 242J2"},
          {"subject": "DENT", "catalog": "243",   "title": "Endodontics A",
           "credits": 4, "is_required": True, "recommended": True,
           "recommendation_reason": "Fundamental endodontic therapy concepts and psychomotor skill development; Year 2"},
        ],
      },

      # ── Years 3–4: Pre-Clinical and Clinical Practice ───────────────────
      {
        "block_key":      "dmd_years34_clinical",
        "title":          "Years 3–4 – Pre-Clinical and Clinical Practice",
        "block_type":     "required",
        "credits_needed": None,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "Years 3 and 4 consist predominantly of clinical practice courses in the "
          "undergraduate teaching clinic and hospital rotations. The curriculum is "
          "under constant revision (per eCalendar disclaimer). "
          "Key discipline areas covered include: Orthodontics (tooth movement / "
          "management of malocclusion), Prosthodontics (fixed and removable prosthetics, "
          "edentulous restorations), Endodontics B (advanced root canal), "
          "Periodontics, Oral Surgery, Paediatric Dentistry (rotation at "
          "Montreal Children's Hospital), Oral Medicine and Oral Pathology, "
          "Oral and Maxillofacial Radiology, Dental Public Health B, and "
          "Comprehensive Patient Care clinic. "
          "French B2 proficiency is required by the start of Year 3. "
          "Course codes seen in recent eCalendars include DENT 215 (Orthodontics), "
          "DENT 221 (Tooth Loss), DENT 244 (Paediatric Dentistry A), and various "
          "DENT 3xx–4xx clinical rotations. Consult your program adviser and Minerva "
          "for the complete up-to-date course list."
        ),
        "sort_order": 4,
        "courses": [
          # Courses verified from 2023-2024 eCalendar / search results
          {"subject": "DENT", "catalog": "215D1", "title": "Tooth Movement (Orthodontics)",
           "credits": 1.75, "is_required": True, "recommended": True,
           "recommendation_reason": "Orthodontics: concepts, malocclusion management, simulation lab; Year 2/3"},
          {"subject": "DENT", "catalog": "215D2", "title": "Tooth Movement (Orthodontics)",
           "credits": 1.75, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 215D1"},
          {"subject": "DENT", "catalog": "221D1", "title": "Tooth Loss",
           "credits": 2.5, "is_required": True, "recommended": True,
           "recommendation_reason": "Edentulism: partial and complete restorations, extensive lab and clinical components"},
          {"subject": "DENT", "catalog": "221D2", "title": "Tooth Loss",
           "credits": 2.5, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 221D1"},
          {"subject": "DENT", "catalog": "244D1", "title": "Pediatric Dentistry A",
           "credits": 2, "is_required": True, "recommended": True,
           "recommendation_reason": "Pediatric oral health and clinical dentistry; includes rotation at Montreal Children's Hospital"},
          {"subject": "DENT", "catalog": "244D2", "title": "Pediatric Dentistry A",
           "credits": 2, "is_required": True, "recommended": False,
           "notes": "Continuation of DENT 244D1"},
        ],
      },

    ],
  },

  # ══════════════════════════════════════════════════════════════════════
  #  DENTAL PREPARATORY YEAR (DENT-P) – B.Sc. (30 credits)
  # ══════════════════════════════════════════════════════════════════════
  {
    "program_key":   "dentp_bsc",
    "name":          "Dental Preparatory Year (Dent-P) – B.Sc. (30 credits)",
    "program_type":  "diploma",  # preparatory year – mapped to "diploma" (DB constraint)
    "faculty":       "Faculty of Dental Medicine and Oral Health Sciences",
    "total_credits": 30,
    "description": (
      "The Dent-P Year is a one-year preparatory program for direct CEGEP graduates "
      "(Quebec residents only) who wish to enter the four-year D.M.D. program. "
      "Students are registered in the Faculty of Science during the preparatory year "
      "and must complete 30 credits: 18 credits of required sciences + 12 credits of "
      "humanities/electives. Students must maintain a CGPA of ≥ 3.5 with all individual "
      "grades ≥ B in required courses and passing grades in complementary courses to be "
      "promoted into D.M.D. Year 1. Application deadline is March 1 (vs November 1 "
      "for the direct 4-year D.M.D.). Dent-P is open only to current final-year CEGEP "
      "Sciences Profile students who are Quebec residents. University-level students and "
      "students outside Quebec are NOT eligible for this program. CASPer test is required. "
      "Students who do not meet promotion criteria may transfer into a B.Sc. and reapply "
      "to the D.M.D. after completing their undergraduate degree."
    ),
    "ecalendar_url": (
      "https://www.mcgill.ca/study/2024-2025/faculties/dentistry/undergraduate/programs/"
      "bachelor-science-bsc-dental-preparatory-dent-p"
    ),
    "blocks": [

      {
        "block_key":      "dentp_sciences",
        "title":          "Required Science Courses (18 credits)",
        "block_type":     "required",
        "credits_needed": 18,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "18 credits of university-level science courses required. The specific course "
          "list is determined at admission and is designed to bridge CEGEP-level preparation "
          "to university-level expectations. Typical required courses cover biology "
          "(cell and molecular), chemistry, organic chemistry, physics, and mathematics. "
          "All required courses must be passed with a grade of B or higher. "
          "These credits count toward a B.Sc. if the student does not proceed to DMD."
        ),
        "sort_order": 1,
        "courses": [
          {"subject": "BIOL",  "catalog": "112",  "title": "Cell and Molecular Biology",
           "credits": 3, "is_required": True, "recommended": True,
           "recommendation_reason": "Core cell biology – typically required for science-stream Dent-P students"},
          {"subject": "CHEM",  "catalog": "120",  "title": "General Chemistry 1",
           "credits": 4, "is_required": True, "recommended": True,
           "recommendation_reason": "University-level general chemistry; builds on CEGEP NYA/NYB"},
          {"subject": "CHEM",  "catalog": "212",  "title": "Organic Chemistry 1",
           "credits": 3, "is_required": True, "recommended": True,
           "recommendation_reason": "Organic chemistry; required CEGEP prerequisite included XV"},
          {"subject": "PHYS",  "catalog": "101",  "title": "Introductory Physics – Mechanics",
           "credits": 4, "is_required": True, "recommended": True,
           "recommendation_reason": "University physics continuation; builds on CEGEP NYA/NYB"},
          {"subject": "MATH",  "catalog": "141",  "title": "Calculus 2",
           "credits": 4, "is_required": True, "recommended": True,
           "recommendation_reason": "Calculus continuation; prereq: CEGEP Math NYC or equivalent"},
        ],
      },

      {
        "block_key":      "dentp_humanities",
        "title":          "Complementary Humanities / Elective Courses (12 credits)",
        "block_type":     "choose_credits",
        "credits_needed": 12,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "12 credits of humanities, social sciences, or elective courses are required "
          "to round out the 30-credit Dent-P year. Passing grades are required (B not "
          "mandatory). Courses are selected to broaden education in preparation for a "
          "patient-facing professional career. The Faculty of Dentistry encourages "
          "courses that develop interpersonal skills, active listening, empathy, and "
          "cultural competence. Examples include psychology, sociology, ethics, "
          "communication, or language courses. "
          "Confirm specific approved electives with the Dent-P program coordinator."
        ),
        "sort_order": 2,
        "courses": [
          {"subject": "PSYC",  "catalog": "100",  "title": "Introduction to Psychology",
           "credits": 3, "is_required": False, "recommended": True,
           "recommendation_reason": "Strongly recommended – develops understanding of human behaviour and patient communication skills"},
          {"subject": "SOCI",  "catalog": "210",  "title": "Introduction to Sociology",
           "credits": 3, "is_required": False, "recommended": True,
           "recommendation_reason": "Understanding social determinants of health; relevant to dentistry's social justice mission"},
          {"subject": "POTH",  "catalog": "498",  "title": "Health Ethics",
           "credits": 3, "is_required": False, "recommended": True,
           "recommendation_reason": "Health care ethics; excellent preparation for professional practice"},
          {"subject": "FRSL",  "catalog": "100",  "title": "Intensive French",
           "credits": 3, "is_required": False, "recommended": True,
           "recommendation_reason": "French proficiency is required by Year 3 DMD; starting early is highly recommended"},
        ],
      },

    ],
  },

]


# ═══════════════════════════════════════════════════════════════════════════════
#  Seed helper – same upsert pattern as all other seed files
# ═══════════════════════════════════════════════════════════════════════════════

def _upsert_program(supabase, prog: dict) -> str:
    """Insert or update one program record, returning its DB id."""
    key = prog["program_key"]

    existing = (
        supabase.table("degree_programs")
        .select("id")
        .eq("program_key", key)
        .limit(1)
        .execute()
    )

    payload = {
        "program_key":   key,
        "name":          prog["name"],
        "program_type":  prog["program_type"],
        "faculty":       prog["faculty"],
        "total_credits": prog["total_credits"],
        "description":   prog.get("description", ""),
        "ecalendar_url": prog.get("ecalendar_url", ""),
    }

    if existing.data:
        prog_id = existing.data[0]["id"]
        supabase.table("degree_programs").update(payload).eq("id", prog_id).execute()
        logger.info(f"Updated program: {key}")
    else:
        result = supabase.table("degree_programs").insert(payload).execute()
        prog_id = result.data[0]["id"]
        logger.info(f"Inserted program: {key}")

    return prog_id


def _upsert_block(supabase, prog_id: str, block: dict, sort_order: int) -> str:
    """Insert or update one requirement block, returning its DB id."""
    key = block["block_key"]

    existing = (
        supabase.table("requirement_blocks")
        .select("id")
        .eq("block_key", key)
        .limit(1)
        .execute()
    )

    payload = {
        "program_id":     prog_id,
        "block_key":      key,
        "title":          block["title"],
        "block_type":     block["block_type"],
        "credits_needed": block.get("credits_needed"),
        "courses_needed": block.get("courses_needed"),
        "group_name":     block.get("group_name"),
        "notes":          block.get("notes", ""),
        "sort_order":     sort_order,
    }

    if existing.data:
        block_id = existing.data[0]["id"]
        supabase.table("requirement_blocks").update(payload).eq("id", block_id).execute()
    else:
        result = supabase.table("requirement_blocks").insert(payload).execute()
        block_id = result.data[0]["id"]

    return block_id


def _upsert_courses(supabase, block_id: str, courses: list) -> None:
    """Delete existing courses for a block and re-insert fresh."""
    supabase.table("requirement_courses").delete().eq("block_id", block_id).execute()

    for i, c in enumerate(courses):
        supabase.table("requirement_courses").insert({
            "block_id":              block_id,
            "subject":               c["subject"],
            "catalog":               c["catalog"],
            "title":                 c.get("title", ""),
            "credits":               c.get("credits", 3),
            "is_required":           c.get("is_required", False),
            "recommended":           c.get("recommended", False),
            "recommendation_reason": c.get("recommendation_reason", ""),
            "choose_from_group":     c.get("choose_from_group", None),
            "choose_n_credits":      c.get("choose_n_credits", None),
            "notes":                 c.get("notes", ""),
            "sort_order":            i,
        }).execute()


def seed_degree_requirements(supabase) -> dict:
    """Seed all Dentistry degree programs into the database."""
    stats = {"programs": 0, "blocks": 0, "courses": 0, "errors": []}

    for prog in DENTISTRY_PROGRAMS:
        try:
            prog_id = _upsert_program(supabase, prog)
            stats["programs"] += 1

            for i, block in enumerate(prog.get("blocks", [])):
                try:
                    block_id = _upsert_block(supabase, prog_id, block, i)
                    stats["blocks"] += 1

                    courses = block.get("courses", [])
                    _upsert_courses(supabase, block_id, courses)
                    stats["courses"] += len(courses)

                except Exception as e:
                    msg = f"Block error [{prog['program_key']} / {block.get('block_key')}]: {e}"
                    logger.error(msg)
                    stats["errors"].append(msg)

        except Exception as e:
            msg = f"Program error [{prog.get('program_key')}]: {e}"
            logger.error(msg)
            stats["errors"].append(msg)

    logger.info(f"Dentistry seed complete: {stats}")
    return stats


if __name__ == "__main__":
    import os, sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
    from api.utils.supabase_client import get_supabase
    supabase = get_supabase()
    stats = seed_degree_requirements(supabase)
    print(f"Seeded: {stats['programs']} programs, {stats['blocks']} blocks, {stats['courses']} courses")
    if stats.get("errors"):
        print(f"Errors: {stats['errors']}")
