"""
McGill School of Physical and Occupational Therapy (SPOT) – Degree Requirements Seed Data
Source: McGill eCalendar 2024-2025 & SPOT website
https://www.mcgill.ca/study/2024-2025/faculties/spot/
https://www.mcgill.ca/spot/programs/

This file covers the two undergraduate rehabilitation science programs:
  1. B.Sc.(Rehab.Sc.) – Major in Physical Therapy   (90 credits)
  2. B.Sc.(Rehab.Sc.) – Major in Occupational Therapy (90 credits)

Accuracy notes:
  - Both programs are 90-credit, 3-year programs (for CEGEP entrants).
  - Students must complete a total of 90 course credits, successfully complete ALL
    curriculum courses, maintain Satisfactory Standing, and hold a CGPA ≥ 2.3
    in OT/PT curriculum courses to graduate.
  - Both programs are FULL-TIME ONLY due to the sequential, clinical nature of coursework.
  - Graduates MUST continue to the professional master's (M.Sc.A.PT. or M.Sc.A.OT.)
    to be eligible for licensure. Entry to MScA requires a minimum CGPA of 3.0.
  - IPEA courses (500, 501, 502, 503) are interprofessional education activities worth
    0 credits, mandatory for graduation.
  - French B2 proficiency is required for clinical placements in Quebec institutions.
  - Intrafaculty transfers between PT and OT are not available once admitted.
  - POTH courses (prefix) are shared by both programs; PHTH = PT-specific; OCC1 = OT-specific.
  - POTH 204 (Statistics) is waived for students with a CEGEP stats course ≥75%;
    such students must take an additional 3-credit complementary course instead.
  - Complementary courses may be chosen from: Psychology (lifespan development recommended),
    Management (personnel/private practice), Academic Writing, Sociology/Anthropology,
    French/English second language (max 6 credits), Sports Medicine Practicum (3 credits),
    or one personal interest course (max 3 credits).

Course prefix key:
  POTH  Physical & Occupational Therapy (shared by both programs)
  PHTH  Physical Therapy (PT-specific courses)
  OCC1  Occupational Therapy (OT-specific courses)
  ANAT  Anatomy
  PHGY  Physiology
  IPEA  Interprofessional Education Activities (0-credit)
"""

import logging
logger = logging.getLogger(__name__)


SPOT_PROGRAMS = [

  # ════════════════════════════════════════════════════════════════════════
  #  B.Sc.(Rehab.Sc.) – MAJOR IN PHYSICAL THERAPY  (90 credits)
  # ════════════════════════════════════════════════════════════════════════
  {
    "program_key":   "bsc_rehab_physical_therapy",
    "name":          "B.Sc. (Rehabilitation Science) – Major in Physical Therapy (90 credits)",
    "program_type":  "major",
    "faculty":       "School of Physical and Occupational Therapy",
    "total_credits": 90,
    "description": (
      "The B.Sc.(Rehab.Sc.) in Physical Therapy is a 3-year full-time program "
      "preparing students for entry to the professional M.Sc.A. in Physical Therapy. "
      "The program emphasizes the biological sciences underpinning rehabilitation, "
      "clinical reasoning, exercise science, and evidence-based practice. "
      "Students complete a core of anatomy, physiology, biomechanics, and statistics, "
      "followed by PT-specific coursework in assessment, therapeutic exercise, "
      "neurorehabilitation, and cardiorespiratory care, along with clinical practicum "
      "experiences. Graduates with CGPA ≥ 3.0 are eligible to apply for the M.Sc.A.PT. "
      "program that begins the summer after graduation. CGPA ≥ 2.3 in PT curriculum is "
      "required throughout. Full-time study only."
    ),
    "ecalendar_url": (
      "https://www.mcgill.ca/study/2024-2025/faculties/spot/undergraduate/programs/"
      "bachelor-science-bsc-rehabilitation-science-major-physical-therapy"
    ),
    "blocks": [

      # ── U1 Year (Shared Core) ─────────────────────────────────────────
      {
        "block_key":      "pt_u1_core",
        "title":          "Year 1 (U1) – Core Sciences",
        "block_type":     "required",
        "credits_needed": 27,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Courses shared between PT and OT programs in U1.",
        "courses": [
          {"subject": "ANAT", "catalog": "315",  "title": "Anatomy of the Limbs and Back", "credits": 3, "is_required": True},
          {"subject": "ANAT", "catalog": "316",  "title": "Anatomy of the Head and Trunk", "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "209",  "title": "Mammalian Physiology 1", "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "210",  "title": "Mammalian Physiology 2", "credits": 3, "is_required": True},
          {"subject": "POTH", "catalog": "204",  "title": "Introduction to Statistics for OT/PT", "credits": 3, "is_required": True,
           "notes": "Waived if CEGEP stats ≥75%; replace with an additional 3-credit complementary course."},
          {"subject": "POTH", "catalog": "225",  "title": "Introduction to Biomechanics in Rehabilitation Sciences", "credits": 3, "is_required": True},
          {"subject": "POTH", "catalog": "250",  "title": "Introduction to Professional Practice 2", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "245",  "title": "Introduction to Professional Practice 1 (PT)", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "500",  "title": "Interprofessional Education Activity 1 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

      # ── U1 Complementary Courses ──────────────────────────────────────
      {
        "block_key":      "pt_u1_complementary",
        "title":          "Year 1 (U1) – Complementary Courses",
        "block_type":     "choose_credits",
        "credits_needed": 3,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "1 complementary course chosen from: Psychology (lifespan development recommended), "
          "Management (private practice), Academic Writing, Sociology/Anthropology, "
          "French/English second language (max 6 cr.), or Sports Medicine Practicum."
        ),
        "courses": [],
      },

      # ── U2 Year (PT Core) ─────────────────────────────────────────────
      {
        "block_key":      "pt_u2_required",
        "title":          "Year 2 (U2) – Physical Therapy Core",
        "block_type":     "required",
        "credits_needed": 33,
        "courses_needed": None,
        "group_name":     None,
        "notes": "U2 PT-specific and shared required courses.",
        "courses": [
          {"subject": "ANAT", "catalog": "321",  "title": "Functional Neuroanatomy", "credits": 3, "is_required": False,
           "notes": "Students choose ANAT 321 or ANAT 323 (not both)."},
          {"subject": "ANAT", "catalog": "323",  "title": "Introduction to Neuroanatomy", "credits": 3, "is_required": False},
          {"subject": "POTH", "catalog": "455",  "title": "Evidence-Based Practice in Rehabilitation Sciences", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "340",  "title": "Assessment in Physical Therapy 1", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "341",  "title": "Assessment in Physical Therapy 2", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "450",  "title": "Introduction to PT Clinical Practice", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "482",  "title": "Introduction to Health, Fitness, and Lifestyle", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "551",  "title": "Therapeutic Exercise", "credits": 3, "is_required": True},
          {"subject": "POTH", "catalog": "305",  "title": "Statistics for Experimental Design", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "501",  "title": "Interprofessional Education Activity 2 (0 credits)", "credits": 0, "is_required": True},
          {"subject": "IPEA", "catalog": "502",  "title": "Interprofessional Education Activity 3 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

      # ── U2 Complementary ──────────────────────────────────────────────
      {
        "block_key":      "pt_u2_complementary",
        "title":          "Year 2 (U2) – Complementary Courses",
        "block_type":     "choose_credits",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name":     None,
        "notes": "2 complementary courses from approved areas (see U1 note above).",
        "courses": [],
      },

      # ── U3 Year (Advanced PT) ─────────────────────────────────────────
      {
        "block_key":      "pt_u3_required",
        "title":          "Year 3 (U3) – Advanced Physical Therapy",
        "block_type":     "required",
        "credits_needed": 21,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Advanced PT courses plus integration seminar and PT research project.",
        "courses": [
          {"subject": "PHTH", "catalog": "552",  "title": "Neurorehabilitation in PT", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "553",  "title": "Musculoskeletal and Sports Rehabilitation", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "554",  "title": "PT Cardiorespiratory Rehabilitation", "credits": 2, "is_required": True},
          {"subject": "PHTH", "catalog": "570",  "title": "Integration Seminar in PT", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "571",  "title": "Research Methods in PT", "credits": 3, "is_required": True},
          {"subject": "PHTH", "catalog": "572",  "title": "PT Clinical Placement", "credits": 4, "is_required": True},
          {"subject": "IPEA", "catalog": "503",  "title": "Interprofessional Education Activity 4 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

    ],
  },

  # ════════════════════════════════════════════════════════════════════════
  #  B.Sc.(Rehab.Sc.) – MAJOR IN OCCUPATIONAL THERAPY  (90 credits)
  # ════════════════════════════════════════════════════════════════════════
  {
    "program_key":   "bsc_rehab_occupational_therapy",
    "name":          "B.Sc. (Rehabilitation Science) – Major in Occupational Therapy (90 credits)",
    "program_type":  "major",
    "faculty":       "School of Physical and Occupational Therapy",
    "total_credits": 90,
    "description": (
      "The B.Sc.(Rehab.Sc.) in Occupational Therapy is a 3-year full-time program "
      "preparing students for entry to the professional M.Sc.A. in Occupational Therapy. "
      "The program emphasizes occupation-focused reasoning, human development across "
      "the lifespan, mental health, neurorehabilitation, and community practice. "
      "Students complete a core of anatomy, physiology, biomechanics, and statistics, "
      "followed by OT-specific coursework in professional practice, occupational "
      "performance frameworks, and practice in psychiatry, pediatrics, and geriatrics. "
      "Graduates with CGPA ≥ 3.0 are eligible to apply for the M.Sc.A.OT. program "
      "that begins the summer after graduation. CGPA ≥ 2.3 in OT curriculum required "
      "throughout. Full-time study only."
    ),
    "ecalendar_url": (
      "https://www.mcgill.ca/study/2024-2025/faculties/spot/undergraduate/programs/"
      "bachelor-science-bsc-rehabilitation-science-major-occupational-therapy"
    ),
    "blocks": [

      # ── U1 Year (Shared Core) ─────────────────────────────────────────
      {
        "block_key":      "ot_u1_core",
        "title":          "Year 1 (U1) – Core Sciences",
        "block_type":     "required",
        "credits_needed": 27,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Courses shared between OT and PT programs in U1.",
        "courses": [
          {"subject": "ANAT", "catalog": "315",  "title": "Anatomy of the Limbs and Back", "credits": 3, "is_required": True},
          {"subject": "ANAT", "catalog": "316",  "title": "Anatomy of the Head and Trunk", "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "209",  "title": "Mammalian Physiology 1", "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "210",  "title": "Mammalian Physiology 2", "credits": 3, "is_required": True},
          {"subject": "POTH", "catalog": "204",  "title": "Introduction to Statistics for OT/PT", "credits": 3, "is_required": True,
           "notes": "Waived if CEGEP stats ≥75%."},
          {"subject": "POTH", "catalog": "225",  "title": "Introduction to Biomechanics in Rehabilitation Sciences", "credits": 3, "is_required": True},
          {"subject": "POTH", "catalog": "250",  "title": "Introduction to Professional Practice 2", "credits": 3, "is_required": True},
          {"subject": "OCC1", "catalog": "245",  "title": "Introduction to Professional Practice 1 (OT)", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "500",  "title": "Interprofessional Education Activity 1 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

      # ── U1 Complementary ──────────────────────────────────────────────
      {
        "block_key":      "ot_u1_complementary",
        "title":          "Year 1 (U1) – Complementary Courses",
        "block_type":     "choose_credits",
        "credits_needed": 3,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "1 complementary course: Psychology (lifespan development), Management, "
          "Academic Writing, Sociology/Anthropology, or second language (max 6 cr.)."
        ),
        "courses": [],
      },

      # ── U2 Year (OT Core) ─────────────────────────────────────────────
      {
        "block_key":      "ot_u2_required",
        "title":          "Year 2 (U2) – Occupational Therapy Core",
        "block_type":     "required",
        "credits_needed": 33,
        "courses_needed": None,
        "group_name":     None,
        "notes": None,
        "courses": [
          {"subject": "ANAT", "catalog": "323",  "title": "Introduction to Neuroanatomy", "credits": 3, "is_required": False,
           "notes": "Students choose ANAT 321 or ANAT 323 (not both)."},
          {"subject": "ANAT", "catalog": "321",  "title": "Functional Neuroanatomy", "credits": 3, "is_required": False},
          {"subject": "POTH", "catalog": "455",  "title": "Evidence-Based Practice in Rehabilitation Sciences", "credits": 3, "is_required": True},
          {"subject": "POTH", "catalog": "305",  "title": "Statistics for Experimental Design", "credits": 3, "is_required": True},
          {"subject": "OCC1", "catalog": "443",  "title": "Occupation, Aging, and Disability", "credits": 3, "is_required": True},
          {"subject": "OCC1", "catalog": "450",  "title": "Occupational Performance and Participation 1", "credits": 3, "is_required": True},
          {"subject": "OCC1", "catalog": "451",  "title": "Occupational Performance and Participation 2", "credits": 3, "is_required": True},
          {"subject": "OCC1", "catalog": "452",  "title": "Mental Health Occupational Therapy", "credits": 3, "is_required": True},
          {"subject": "OCC1", "catalog": "453",  "title": "Pediatric Occupational Therapy", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "501",  "title": "Interprofessional Education Activity 2 (0 credits)", "credits": 0, "is_required": True},
          {"subject": "IPEA", "catalog": "502",  "title": "Interprofessional Education Activity 3 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

      # ── U2 Complementary ──────────────────────────────────────────────
      {
        "block_key":      "ot_u2_complementary",
        "title":          "Year 2 (U2) – Complementary Courses",
        "block_type":     "choose_credits",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name":     None,
        "notes": "2 complementary courses from approved areas.",
        "courses": [],
      },

      # ── U3 Year (Advanced OT) ─────────────────────────────────────────
      {
        "block_key":      "ot_u3_required",
        "title":          "Year 3 (U3) – Advanced Occupational Therapy",
        "block_type":     "required",
        "credits_needed": 21,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Advanced OT courses, therapeutic strategies practicum, and research methods.",
        "courses": [
          {"subject": "OCC1", "catalog": "500",  "title": "Therapeutic Strategies in OT 1 (D1/D2 series)", "credits": 8, "is_required": True,
           "notes": "OCC1 500D1 followed by OCC1 500D2 in consecutive terms."},
          {"subject": "OCC1", "catalog": "545",  "title": "Therapeutic Strategies in OT 2", "credits": 8, "is_required": True},
          {"subject": "OCC1", "catalog": "546",  "title": "OT Integration Seminar", "credits": 3, "is_required": True},
          {"subject": "OCC1", "catalog": "550",  "title": "Research Methods in OT", "credits": 2, "is_required": True},
          {"subject": "IPEA", "catalog": "503",  "title": "Interprofessional Education Activity 4 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

    ],
  },

]


# ──────────────────────────────────────────────────────────────────────────
#  Helper Functions
# ──────────────────────────────────────────────────────────────────────────

def _upsert_program(supabase, prog: dict) -> str:
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
    """Seed all SPOT degree programs into the database."""
    stats = {"programs": 0, "blocks": 0, "courses": 0, "errors": []}

    for prog in SPOT_PROGRAMS:
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

    logger.info(f"SPOT seed complete: {stats}")
    return stats


if __name__ == "__main__":
    import os, sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
    from api.utils.supabase_client import get_supabase
    supabase = get_supabase()
    result = seed_degree_requirements(supabase)
    print(f"Seeded: {result['programs']} programs, {result['blocks']} blocks, {result['courses']} courses")
    if result["errors"]:
        print(f"Errors ({len(result['errors'])}):")
        for e in result["errors"]:
            print(f"  {e}")
