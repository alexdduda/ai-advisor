"""
McGill Faculty of Medicine and Health Sciences – Degree Requirements Seed Data
Source: McGill eCalendar 2024-2025 & Course Catalogue
https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/
https://www.mcgill.ca/study/2024-2025/faculties/medicine/

Programs covered:
  1. Doctor of Medicine & Master of Surgery (M.D.,C.M.) – 200-204 credits
  2. Medicine Preparatory Program (Med-P, B.Sc.) – 30 credits

Accuracy notes:
  - MDCM curriculum undergoes annual review; the eCalendar carries a standing
    disclaimer that details are subject to change.
  - The MDCM is a 4-year program structured into 4 components:
      * Physicianship — longitudinal across all 4 years
      * Fundamentals of Medicine and Dentistry (FMD) — Year 1 & first half of Year 2
      * Transition to Clinical Practice (TCP) — second half of Year 2
      * Clerkship — Years 3 & 4
  - Most MDCM courses use the "INDS" (Interdisciplinary Studies) prefix and are
    shared between Medicine (MDCM) and Dentistry (DMD) students in Years 1-2.
  - INDS 125/225/325/423/424 are integrated assessment courses (0 credits each).
  - Elective credits (ELEC 400-404): 4 required = 200-credit total; 5th optional
    brings the maximum to 204 credits.
  - Med-P is a 1-year qualifying year registered in the Faculty of Science.
    Students must achieve CGPA >= 3.5 with all required-course grades >= B.
  - CPR/AED (Level C+) certification is required and must remain current.
  - MCAT score and CASPer test are required for MDCM admission.
"""

import logging
logger = logging.getLogger(__name__)

MEDICINE_PROGRAMS = [

  # ============================================================================
  #  DOCTOR OF MEDICINE & MASTER OF SURGERY (M.D.,C.M.) - 200-204 CREDITS
  # ============================================================================
  {
    "program_key":   "mdcm_medicine",
    "name":          "Doctor of Medicine & Master of Surgery (M.D.,C.M.) - 200-204 credits",
    "program_type":  "major",
    "faculty":       "Faculty of Medicine and Health Sciences",
    "total_credits": 200,
    "ecalendar_url": (
        "https://coursecatalogue.mcgill.ca/en/undergraduate/"
        "medicine-health-sciences/professional/programs/mdcm/"
    ),
    "description": (
        "The M.D.,C.M. is McGill's flagship four-year medical degree. The curriculum "
        "is organised into four components: Physicianship (longitudinal), Fundamentals "
        "of Medicine and Dentistry (FMD, Year 1 and first half of Year 2), Transition "
        "to Clinical Practice (TCP, second half of Year 2), and Clerkship (Years 3-4). "
        "Three overarching themes run throughout: Social Accountability; Professional "
        "Identity and Practice; and Basic Science, Critical Thinking & Knowledge "
        "Translation. Graduates may practice only in supervised postgraduate residency "
        "settings, not independently. Full details: mcgill.ca/ugme"
    ),
    "blocks": [

      {
        "block_key":      "mdcm_physicianship",
        "title":          "Physicianship - Longitudinal (Years 1-4)",
        "block_type":     "required",
        "credits_needed": 14,
        "notes": (
            "Physicianship runs continuously across all four years, developing the dual "
            "roles of the physician as professional and healer. Includes Clinical Method "
            "1 (Y1), Clinical Method 2 & 3 (Y2), the Community Health Alliance Program "
            "(CHAP, Y2), Mindful Medical Practice (Y2), Medical Ethics and Health Law "
            "(Y2), Formation of the Professional & Healer (Y3), and the longitudinal "
            "Physician Apprenticeship 4 (D1/D2). Students are assigned in groups of "
            "6-7 to an Osler Fellow mentor throughout the program."
        ),
        "courses": [
          {"subject": "INDS", "catalog": "121J1",  "title": "Clinical Method 1",                            "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "121J2",  "title": "Clinical Method 1",                            "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "121J3",  "title": "Clinical Method 1",                            "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "221",    "title": "Clinical Method 2",                            "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "222",    "title": "Community Health Alliance Program (CHAP)",     "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "224",    "title": "Medical Ethics and Health Law",                "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "226",    "title": "Mindful Medical Practice",                     "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "321",    "title": "Clinical Method 3",                            "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "323",    "title": "Formation of the Professional & Healer",       "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "422D1",  "title": "Physician Apprenticeship 4",                   "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "422D2",  "title": "Physician Apprenticeship 4",                   "credits": 1, "is_required": True},
        ],
      },

      {
        "block_key":      "mdcm_fmd_year1_systems",
        "title":          "Fundamentals of Medicine and Dentistry - Systems Courses (Year 1)",
        "block_type":     "required",
        "credits_needed": 52,
        "notes": (
            "Year 1 FMD uses an integrated systems-based approach covering anatomy, "
            "physiology, pathology, and therapeutics simultaneously for each organ system. "
            "Teaching methods include lectures, laboratory sessions, small group teaching, "
            "and independent study. Open only to M.D.,C.M. and D.M.D. students. "
            "Integrated assessments (INDS 125J1/J2/J3) span all three terms; credit is "
            "awarded only if all three J-sections are completed consecutively."
        ),
        "courses": [
          {"subject": "INDS", "catalog": "111",    "title": "Molecules to Global Health",  "credits": 6, "is_required": True},
          {"subject": "INDS", "catalog": "112",    "title": "Respiration",                 "credits": 6, "is_required": True},
          {"subject": "INDS", "catalog": "113",    "title": "Circulation",                 "credits": 8, "is_required": True},
          {"subject": "INDS", "catalog": "114",    "title": "Digestion and Metabolism",    "credits": 8, "is_required": True},
          {"subject": "INDS", "catalog": "115",    "title": "Renal",                       "credits": 6, "is_required": True},
          {"subject": "INDS", "catalog": "116",    "title": "Defense",                     "credits": 6, "is_required": True},
          {"subject": "INDS", "catalog": "117",    "title": "Endocrine",                   "credits": 6, "is_required": True},
          {"subject": "INDS", "catalog": "118",    "title": "Movement",                    "credits": 6, "is_required": True},
          {"subject": "INDS", "catalog": "125J1",  "title": "FMD Integrated Assessment 1", "credits": 0, "is_required": True},
          {"subject": "INDS", "catalog": "125J2",  "title": "FMD Integrated Assessment 1", "credits": 0, "is_required": True},
          {"subject": "INDS", "catalog": "125J3",  "title": "FMD Integrated Assessment 1", "credits": 0, "is_required": True},
        ],
      },

      {
        "block_key":      "mdcm_fmd_year1_longitudinal",
        "title":          "Fundamentals of Medicine and Dentistry - Longitudinal Courses (Year 1)",
        "block_type":     "required",
        "credits_needed": 6,
        "notes": (
            "INDS 123 (Research Fundamentals 1) runs across all three terms of Year 1; "
            "no credit is awarded unless all three J-sections are completed consecutively. "
            "RF1 focuses on formulating a research proposal. INDS 124 (Longitudinal Family "
            "Medicine Experience) pairs each MDCM student with a family physician preceptor "
            "from the very first month of medical school for early clinical exposure."
        ),
        "courses": [
          {"subject": "INDS", "catalog": "123J1",  "title": "Research Fundamentals 1",                 "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "123J2",  "title": "Research Fundamentals 1",                 "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "123J3",  "title": "Research Fundamentals 1",                 "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "124J1",  "title": "Longitudinal Family Medicine Experience",  "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "124J2",  "title": "Longitudinal Family Medicine Experience",  "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "124J3",  "title": "Longitudinal Family Medicine Experience",  "credits": 1, "is_required": True},
        ],
      },

      {
        "block_key":      "mdcm_fmd_year2",
        "title":          "Fundamentals of Medicine and Dentistry - Year 2 (First Half)",
        "block_type":     "required",
        "credits_needed": 19,
        "notes": (
            "The FMD component continues into the first half of Year 2 with two major "
            "systems blocks: Reproduction & Sexuality (6 cr) and Human Behaviour (12 cr, "
            "covering psychiatry and neuroscience). Research Fundamentals 2 (1.5 cr) is "
            "completed concurrently. INDS 225 is the FMD Integrated Assessment 2."
        ),
        "courses": [
          {"subject": "INDS", "catalog": "211",  "title": "Reproduction and Sexuality",  "credits": 6,   "is_required": True},
          {"subject": "INDS", "catalog": "212",  "title": "Human Behaviour",             "credits": 12,  "is_required": True},
          {"subject": "INDS", "catalog": "223",  "title": "Research Fundamentals 2",     "credits": 1.5, "is_required": True},
          {"subject": "INDS", "catalog": "225",  "title": "FMD Integrated Assessment 2", "credits": 0,   "is_required": True},
        ],
      },

      {
        "block_key":      "mdcm_tcp",
        "title":          "Transition to Clinical Practice (TCP) - Year 2 (Second Half)",
        "block_type":     "required",
        "credits_needed": 27,
        "notes": (
            "TCP bridges classroom learning and active patient care. Students consolidate "
            "history-taking, physical examination, and clinical reasoning through clinical "
            "apprentice sessions across Internal Medicine, Neurology, Family Medicine, "
            "Pediatrics, Surgery, Radiology, and Ophthalmology. Concludes with a short "
            "Transition to Clerkship course (INDS 301)."
        ),
        "courses": [
          {"subject": "IMED", "catalog": "301",  "title": "TCP Internal Medicine",              "credits": 7, "is_required": True},
          {"subject": "FMED", "catalog": "301",  "title": "TCP Family Medicine",                "credits": 3, "is_required": True},
          {"subject": "ANAE", "catalog": "301",  "title": "TCP Anesthesia",                     "credits": 2, "is_required": True},
          {"subject": "NEUR", "catalog": "301",  "title": "TCP Neurology",                      "credits": 4, "is_required": True},
          {"subject": "PAED", "catalog": "301",  "title": "TCP Pediatrics",                     "credits": 3, "is_required": True},
          {"subject": "SURG", "catalog": "301",  "title": "TCP Surgery",                        "credits": 4, "is_required": True},
          {"subject": "DIAD", "catalog": "301",  "title": "TCP Diagnostic Imaging / Radiology", "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "301",  "title": "Transition to Clerkship",            "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "325",  "title": "TCP Integrated Assessment",          "credits": 0, "is_required": True},
        ],
      },

      {
        "block_key":      "mdcm_clerkship_year3",
        "title":          "Clerkship - Year 3",
        "block_type":     "required",
        "credits_needed": 41,
        "notes": (
            "Year 3 Clerkship places students in active patient care under supervision "
            "across all core disciplines. Rotation sequence varies by student stream. "
            "Sites include the MUHC Glen Campus, Montreal General Hospital, Jewish General "
            "Hospital, Montreal Children's Hospital, and affiliated community hospitals. "
            "INDS 423 is Clerkship Integrated Assessment 1 (progress test + OSCE)."
        ),
        "courses": [
          {"subject": "INDS", "catalog": "423",  "title": "Clerkship Integrated Assessment 1", "credits": 0, "is_required": True},
          {"subject": "IMED", "catalog": "401",  "title": "Internal Medicine Clerkship",        "credits": 8, "is_required": True},
          {"subject": "SURG", "catalog": "401",  "title": "Surgery Clerkship",                  "credits": 8, "is_required": True},
          {"subject": "FMED", "catalog": "405",  "title": "Family Medicine Clerkship",          "credits": 6, "is_required": True},
          {"subject": "PSYT", "catalog": "401",  "title": "Psychiatric Medicine Clerkship",     "credits": 6, "is_required": True},
          {"subject": "PAED", "catalog": "401",  "title": "Pediatrics Clerkship",               "credits": 6, "is_required": True},
          {"subject": "OBGY", "catalog": "401",  "title": "Obstetrics & Gynecology Clerkship",  "credits": 6, "is_required": True},
          {"subject": "ELEC", "catalog": "400",  "title": "Clinical / Research Elective 1",     "credits": 1, "is_required": True},
        ],
      },

      {
        "block_key":      "mdcm_clerkship_year4",
        "title":          "Clerkship - Year 4",
        "block_type":     "required",
        "credits_needed": 20,
        "notes": (
            "Year 4 includes senior rotations in Geriatric Medicine (IMED 407), Emergency "
            "Medicine (INDS 408), Anesthesia (ANAE 401), Public Health & Preventive "
            "Medicine (INDS 427), Putting It All Together (INDS 426), and Transition to "
            "Residency (INDS 428). Significant elective time is available for CaRMS "
            "preparation. ELEC 404 (Elective 5) is optional and brings the degree total "
            "to a maximum of 204 credits. INDS 424 is Clerkship Integrated Assessment 2."
        ),
        "courses": [
          {"subject": "INDS", "catalog": "424",  "title": "Clerkship Integrated Assessment 2",              "credits": 0, "is_required": True},
          {"subject": "ANAE", "catalog": "401",  "title": "Anesthesia Clerkship",                           "credits": 2, "is_required": True},
          {"subject": "IMED", "catalog": "407",  "title": "Geriatric Medicine Clerkship",                   "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "408",  "title": "Emergency Medicine Clerkship",                   "credits": 4, "is_required": True},
          {"subject": "INDS", "catalog": "427",  "title": "Public Health & Preventive Medicine Clerkship",  "credits": 1, "is_required": True},
          {"subject": "INDS", "catalog": "426",  "title": "Putting It All Together: Basic Science, Medicine and Society", "credits": 2, "is_required": True},
          {"subject": "INDS", "catalog": "428",  "title": "Transition to Residency",                        "credits": 2, "is_required": True},
          {"subject": "ELEC", "catalog": "401",  "title": "Clinical / Research Elective 2",                 "credits": 1, "is_required": True},
          {"subject": "ELEC", "catalog": "402",  "title": "Clinical / Research Elective 3",                 "credits": 1, "is_required": True},
          {"subject": "ELEC", "catalog": "403",  "title": "Clinical / Research Elective 4",                 "credits": 1, "is_required": True},
          {"subject": "ELEC", "catalog": "404",  "title": "Clinical / Research Elective 5 (optional)",      "credits": 1, "is_required": False},
        ],
      },

    ],
  },

  # ============================================================================
  #  MEDICINE PREPARATORY PROGRAM (Med-P) - B.Sc. 30 CREDITS
  # ============================================================================
  {
    "program_key":   "medp_medicine",
    "name":          "Medicine Preparatory Program (Med-P) - B.Sc. (30 credits)",
    "program_type":  "diploma",
    "faculty":       "Faculty of Medicine and Health Sciences",
    "total_credits": 30,
    "ecalendar_url": (
        "https://coursecatalogue.mcgill.ca/en/undergraduate/"
        "medicine-health-sciences/professional/programs/medicine-preparatory-program/"
    ),
    "description": (
        "The Med-P is a one-year qualifying program for immediate graduates of the Quebec "
        "Collegial (CEGEP) system who have been conditionally admitted to the M.D.,C.M. "
        "program. Students are registered in the Faculty of Science and must complete "
        "30 credits. Promotion into Year 1 of the MDCM requires CGPA >= 3.5 with all "
        "required-course grades of 'B' or higher (passing grades suffice for complementary "
        "courses). Failing to meet requirements allows transfer into a B.Sc. with the "
        "right to reapply later. Also offered in French at Campus Outaouais (UQO). "
        "Full details: mcgill.ca/medadmissions/programs/med-p"
    ),
    "blocks": [

      {
        "block_key":      "medp_required_sciences",
        "title":          "Required Science Courses - Minimum Grade B",
        "block_type":     "required",
        "credits_needed": 15,
        "notes": (
            "All five courses require a minimum grade of B for promotion into the MDCM. "
            "BIOL 200 is a prerequisite for BIOL 201. PHGY 209 and PHGY 210 require prior "
            "CEGEP-level Biology, Chemistry, and Physics. At Campus Outaouais (UQO), "
            "francophone equivalents are offered by McGill Faculty of Science professors."
        ),
        "courses": [
          {"subject": "BIOL", "catalog": "200", "title": "Cellular Biology and Molecular Medicine", "credits": 3, "is_required": True},
          {"subject": "BIOL", "catalog": "201", "title": "Cellular Biology & Metabolism",           "credits": 3, "is_required": True},
          {"subject": "BIOL", "catalog": "202", "title": "Genetics",                                "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "209", "title": "Mammalian Physiology 1",                  "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "210", "title": "Mammalian Physiology 2",                  "credits": 3, "is_required": True},
        ],
      },

      {
        "block_key":      "medp_statistics",
        "title":          "Statistics Requirement",
        "block_type":     "required",
        "credits_needed": 3,
        "notes": (
            "MATH 203 is required for all Med-P students who did not complete an equivalent "
            "statistics course during CEGEP. Students with an approved CEGEP statistics "
            "equivalent are exempt and must replace it with an approved complementary "
            "science course. At Campus Outaouais, the equivalent UQO course satisfies "
            "this requirement."
        ),
        "courses": [
          {"subject": "MATH", "catalog": "203", "title": "Principles of Statistics", "credits": 3, "is_required": True},
        ],
      },

      {
        "block_key":      "medp_complementary_sciences",
        "title":          "Complementary Science Electives",
        "block_type":     "choose_credits",
        "credits_needed": 12,
        "notes": (
            "Students complete approved Faculty of Science courses to reach the 30-credit "
            "total. A passing grade suffices (no 'B' minimum). Common choices listed below; "
            "consult an academic advisor for the current approved list."
        ),
        "courses": [
          {"subject": "CHEM", "catalog": "212", "title": "Organic Chemistry 1",                         "credits": 3, "is_required": False},
          {"subject": "CHEM", "catalog": "222", "title": "Organic Chemistry 2",                         "credits": 3, "is_required": False},
          {"subject": "BIOL", "catalog": "300", "title": "Molecular Biology",                           "credits": 3, "is_required": False},
          {"subject": "BIOL", "catalog": "301", "title": "Biochemistry",                               "credits": 3, "is_required": False},
          {"subject": "PHGY", "catalog": "311", "title": "Neurophysiology",                            "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "211", "title": "Introduction to Learning and Behaviour",     "credits": 3, "is_required": False},
        ],
      },

    ],
  },

]


# ============================================================================
#  HELPER FUNCTIONS  (mirrors dentistry_degree_requirements.py exactly)
# ============================================================================

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
    """Seed all Medicine & Health Sciences programs into the database."""
    stats = {"programs": 0, "blocks": 0, "courses": 0, "errors": []}

    for prog in MEDICINE_PROGRAMS:
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

    logger.info(f"Medicine seed complete: {stats}")
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
