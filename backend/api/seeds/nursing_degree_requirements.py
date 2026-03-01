"""
McGill Ingram School of Nursing – Degree Requirements Seed Data
Source: McGill eCalendar 2024-2025 & Ingram School of Nursing website
https://www.mcgill.ca/study/2024-2025/faculties/nursing/
https://www.mcgill.ca/nursing/programs/bachelor-programs/

This file covers the two undergraduate nursing programs:
  1. Bachelor of Science (Nursing) – B.Sc.(N.)  (103 credits)
  2. Bachelor of Nursing (Integrated) – B.N.I.   ( 65 credits, 92 total with 27 advanced standing)

Accuracy notes:
  - The B.Sc.(N.) is a 3-year degree (103 credits) for CEGEP entrants, or 4 years
    (136–137 credits) for high-school/out-of-province entrants who complete a U0 science year.
  - The B.N.I. is for holders of the 180.A.0 DEC in Nursing from a Quebec CEGEP;
    students receive 27 credits of advanced standing and complete 65 credits at McGill.
  - The B.N.I. is offered in two delivery modes: on-campus and fully online.
  - IPEA courses (500, 501, 502, 503) are interprofessional education activities worth
    0 credits but mandatory for graduation – they appear on the transcript as Pass/Fail.
  - French language proficiency (B2 level) is required for full nursing licensure in Quebec.
  - Both programs are accredited by the Canadian Association of Schools of Nursing (CASN).
  - Completion of B.Sc.(N.) or B.N.I. entitles graduates to sit licensure examinations
    in Quebec (OIIQ) and across Canada.
  - 9 elective credits required for B.Sc.(N.) U1 entrants (3 credits at 300-level or above);
    6 elective credits for U0 high-school entrants (3 credits at 300-level or above).

Course prefix key:
  NUR1  Nursing (Ingram School of Nursing)
  IPEA  Interprofessional Education Activities (0-credit workshops)
  EDPE  Educational Psychology (EDPE 375 = Introduction to Statistics)
  PSYC  Psychology (PSYC 204 = Statistics equivalent)
  BIOL  Biology
  CHEM  Chemistry
  PHYS  Physics (U0 prerequisites)
  ANAT  Anatomy (U0 prerequisite)
  PHGY  Physiology (U0 prerequisite)
"""

import logging
logger = logging.getLogger(__name__)


NURSING_PROGRAMS = [

  # ════════════════════════════════════════════════════════════════════════
  #  B.Sc.(N.) – NURSING  (103 credits)
  # ════════════════════════════════════════════════════════════════════════
  {
    "program_key":   "bscn_nursing",
    "name":          "Bachelor of Science (Nursing) – B.Sc.(N.) (103 credits)",
    "program_type":  "major",
    "faculty":       "Ingram School of Nursing",
    "total_credits": 103,
    "description": (
      "The B.Sc.(N.) is a 3-year program (103 credits) for CEGEP-prepared students "
      "that focuses on complex and contemporary nursing issues. High school and "
      "out-of-province entrants complete an additional U0 science year (~33–34 credits) "
      "before beginning the three-year nursing sequence. The program prepares graduates "
      "for entry-level nursing practice and for sitting licensure examinations in Quebec "
      "(OIIQ) and Canada. Accredited by the Canadian Association of Schools of Nursing "
      "since 1990 (full accreditation until 2031). French B2 proficiency is required "
      "for full licensure in Quebec. Students with a completed bachelor's degree may "
      "transfer to the MScA-N Qualifying Year after U2 summer."
    ),
    "ecalendar_url": (
      "https://www.mcgill.ca/study/2024-2025/faculties/nursing/undergraduate/programs/"
      "bachelor-science-nursing-bscn-nursing"
    ),
    "blocks": [

      # ── U0 (Freshman Science Prerequisites) ───────────────────────────
      {
        "block_key":      "bscn_u0_prerequisites",
        "title":          "U0 Science Prerequisites (for high school / out-of-province entrants only)",
        "block_type":     "required",
        "credits_needed": 33,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "CEGEP entrants are exempt from U0 and begin directly in U1. "
          "High school, out-of-province, mature, and IB students typically need all of these. "
          "All math and science courses must have been completed within the last five years."
        ),
        "courses": [
          {"subject": "BIOL", "catalog": "112",  "title": "Cell and Molecular Biology", "credits": 3, "is_required": True},
          {"subject": "CHEM", "catalog": "110",  "title": "General Chemistry 1", "credits": 3, "is_required": True},
          {"subject": "CHEM", "catalog": "120",  "title": "General Chemistry 2", "credits": 3, "is_required": True},
          {"subject": "CHEM", "catalog": "212",  "title": "Organic Chemistry", "credits": 3, "is_required": True},
          {"subject": "PHYS", "catalog": "101",  "title": "Introductory Physics – Mechanics", "credits": 3, "is_required": True},
          {"subject": "PHYS", "catalog": "102",  "title": "Introductory Physics – Electromagnetism & Optics", "credits": 3, "is_required": True},
          {"subject": "ANAT", "catalog": "261",  "title": "Introduction to Human Anatomy", "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "209",  "title": "Mammalian Physiology 1", "credits": 3, "is_required": True},
          {"subject": "PHGY", "catalog": "210",  "title": "Mammalian Physiology 2", "credits": 3, "is_required": True},
          {"subject": "PSYC", "catalog": "204",  "title": "Basic Statistical Methods (or EDPE 375)", "credits": 3, "is_required": False,
           "notes": "PSYC 204 or EDPE 375 accepted. Counts toward program electives."},
        ],
      },

      # ── U1 Year ───────────────────────────────────────────────────────
      {
        "block_key":      "bscn_u1_required",
        "title":          "Year 1 (U1) – Required Courses",
        "block_type":     "required",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Taken over Fall, Winter, and Summer terms of U1.",
        "courses": [
          {"subject": "NUR1", "catalog": "200",  "title": "Introduction to the Nursing Profession", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "209",  "title": "Pathophysiology for Nursing 1", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "210",  "title": "Pathophysiology for Nursing 2", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "222",  "title": "Foundations of Nursing Practice", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "224",  "title": "Individual and Family Development Across Lifespans 1", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "225",  "title": "Individual and Family Development Across Lifespans 2", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "230",  "title": "Supporting Health and Healing Capacities 1", "credits": 2, "is_required": True},
          {"subject": "NUR1", "catalog": "231",  "title": "Supporting Health and Healing Capacities 2", "credits": 1, "is_required": True},
          {"subject": "NUR1", "catalog": "234",  "title": "Promoting Adult Health Development (Clinical)", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "235",  "title": "Health Assessment Across the Lifespan", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "233",  "title": "Promoting Young Family Development (Clinical)", "credits": 2, "is_required": True},
          {"subject": "IPEA", "catalog": "500",  "title": "Interprofessional Education Activity 1 (0 credits, Pass/Fail)", "credits": 0, "is_required": True,
           "notes": "Mandatory IPE workshop – non-credit, appears on transcript."},
          {"subject": "IPEA", "catalog": "501",  "title": "Interprofessional Education Activity 2 (0 credits, Pass/Fail)", "credits": 0, "is_required": True},
          {"subject": "PSYC", "catalog": "204",  "title": "Basic Statistical Methods (or EDPE 375)", "credits": 3, "is_required": True,
           "notes": "PSYC 204 or EDPE 375. Required unless exempted by prior CEGEP stats (≥75%)."},
        ],
      },

      # ── U2 Year ───────────────────────────────────────────────────────
      {
        "block_key":      "bscn_u2_required",
        "title":          "Year 2 (U2) – Required Courses",
        "block_type":     "required",
        "credits_needed": 32,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Taken over Fall and Winter terms of U2.",
        "courses": [
          {"subject": "NUR1", "catalog": "300",  "title": "Pharmacology for Nursing", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "301",  "title": "Nursing Science and Research", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "312",  "title": "Mental Health Nursing", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "318",  "title": "Advanced Clinical Nursing: Complex Medical-Surgical", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "320",  "title": "Nursing in Community Health", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "327",  "title": "Nursing Clinical Practicum (U2)", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "329",  "title": "Integrated Seminar in Nursing", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "338",  "title": "Health and Illness Across the Lifespan: Advanced Topics", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "339",  "title": "Interprofessional Dimensions of Health Care", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "502",  "title": "Interprofessional Education Activity 3 (0 credits, Pass/Fail)", "credits": 0, "is_required": True},
        ],
      },

      # ── U3 Year ───────────────────────────────────────────────────────
      {
        "block_key":      "bscn_u3_required",
        "title":          "Year 3 (U3) – Required Courses",
        "block_type":     "required",
        "credits_needed": 26,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Taken over Fall and Winter terms of U3. Includes capstone clinical placements.",
        "courses": [
          {"subject": "NUR1", "catalog": "423",  "title": "Advanced Nursing Practice – Critical Care or Community", "credits": 4, "is_required": False,
           "notes": "Students choose NUR1 423 or NUR1 424 (community or critical care consolidation)."},
          {"subject": "NUR1", "catalog": "424",  "title": "Advanced Nursing Practice – Acute Care Consolidation", "credits": 4, "is_required": False},
          {"subject": "NUR1", "catalog": "432",  "title": "Health Systems and Professional Practice", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "434",  "title": "Capstone Consolidation Clinical 1", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "435",  "title": "Capstone Consolidation Clinical 2", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "529",  "title": "Transition to Practice 1", "credits": 3, "is_required": True,
           "notes": "NUR1 529 section 001 paired with NUR1 530 section 002, or vice versa."},
          {"subject": "NUR1", "catalog": "530",  "title": "Transition to Practice 2", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "503",  "title": "Interprofessional Education Activity 4 (0 credits, Pass/Fail)", "credits": 0, "is_required": True},
        ],
      },

      # ── Electives ─────────────────────────────────────────────────────
      {
        "block_key":      "bscn_electives",
        "title":          "Electives",
        "block_type":     "choose_credits",
        "credits_needed": 9,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "9 elective credits (for CEGEP/U1 entrants), at the 200–500 level, "
          "with at least 3 credits at the 300-level or above. "
          "Students entering at U0 need only 6 elective credits. "
          "Upper-level courses (300+) are advised for students planning graduate studies."
        ),
        "courses": [],
      },

    ],
  },

  # ════════════════════════════════════════════════════════════════════════
  #  B.N.I. – BACHELOR OF NURSING (INTEGRATED)  (65 credits at McGill)
  # ════════════════════════════════════════════════════════════════════════
  {
    "program_key":   "bni_nursing",
    "name":          "Bachelor of Nursing (Integrated) – B.N.I. (65 credits at McGill)",
    "program_type":  "major",
    "faculty":       "Ingram School of Nursing",
    "total_credits": 65,
    "description": (
      "The B.N.I. is a 2-year, 5-semester accelerated completion program (65 credits "
      "at McGill) for holders of the 180.A.0 DEC in Nursing from a Quebec CEGEP. "
      "Students are admitted at the U2 level with 27 credits of advanced standing "
      "(total program = 92 credits). The program expands students' knowledge base, "
      "strengthens critical thinking, and prepares them for baccalaureate-level nursing "
      "roles. Offered in two modalities: on-campus and fully online. Online students "
      "must register in online course sections (020-series). Applicants must apply "
      "within three years of obtaining their DEC 180.A.0. CASN accredited. "
      "Elective requirement: 6 credits (at least 3 credits at 300-level or above)."
    ),
    "ecalendar_url": (
      "https://www.mcgill.ca/study/2024-2025/faculties/nursing/undergraduate/programs/"
      "bachelor-nursing-bni-integrated-nursing"
    ),
    "blocks": [

      # ── BNI Year 1 (U2) ───────────────────────────────────────────────
      {
        "block_key":      "bni_u2_required",
        "title":          "BNI Year 1 (U2) – Required Courses",
        "block_type":     "required",
        "credits_needed": 36,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Delivered over Fall, Winter, and Summer terms.",
        "courses": [
          {"subject": "NUR1", "catalog": "209",  "title": "Pathophysiology for Nursing 1", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "210",  "title": "Pathophysiology for Nursing 2", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "222",  "title": "Foundations of Nursing Practice", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "312",  "title": "Mental Health Nursing", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "318",  "title": "Advanced Clinical Nursing: Complex Medical-Surgical", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "320",  "title": "Nursing in Community Health", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "327",  "title": "Nursing Clinical Practicum", "credits": 4, "is_required": True},
          {"subject": "NUR1", "catalog": "338",  "title": "Health and Illness Across the Lifespan: Advanced Topics", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "339",  "title": "Interprofessional Dimensions of Health Care", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "434",  "title": "Capstone Consolidation Clinical 1 (or NUR1 435 equivalent)", "credits": 4, "is_required": True},
          {"subject": "EDPE", "catalog": "375",  "title": "Introduction to Statistics (or PSYC 204)", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "500",  "title": "Interprofessional Education Activity 1 (0 credits)", "credits": 0, "is_required": True},
          {"subject": "IPEA", "catalog": "501",  "title": "Interprofessional Education Activity 2 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

      # ── BNI Year 2 (U3) ───────────────────────────────────────────────
      {
        "block_key":      "bni_u3_required",
        "title":          "BNI Year 2 (U3) – Required Courses",
        "block_type":     "required",
        "credits_needed": 23,
        "courses_needed": None,
        "group_name":     None,
        "notes": "Delivered over Fall and Winter terms.",
        "courses": [
          {"subject": "NUR1", "catalog": "300",  "title": "Pharmacology for Nursing", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "301",  "title": "Nursing Science and Research", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "329",  "title": "Integrated Seminar in Nursing", "credits": 3, "is_required": True},
          {"subject": "NUR1", "catalog": "423",  "title": "Advanced Nursing Practice – Critical Care or Community", "credits": 4, "is_required": False,
           "notes": "Choose NUR1 423 or NUR1 424 for consolidation clinical."},
          {"subject": "NUR1", "catalog": "424",  "title": "Advanced Nursing Practice – Acute Care Consolidation", "credits": 4, "is_required": False},
          {"subject": "NUR1", "catalog": "432",  "title": "Health Systems and Professional Practice", "credits": 3, "is_required": True},
          {"subject": "IPEA", "catalog": "502",  "title": "Interprofessional Education Activity 3 (0 credits)", "credits": 0, "is_required": True},
          {"subject": "IPEA", "catalog": "503",  "title": "Interprofessional Education Activity 4 (0 credits)", "credits": 0, "is_required": True},
        ],
      },

      # ── Electives ─────────────────────────────────────────────────────
      {
        "block_key":      "bni_electives",
        "title":          "Electives",
        "block_type":     "choose_credits",
        "credits_needed": 6,
        "courses_needed": None,
        "group_name":     None,
        "notes": (
          "6 elective credits (at least 3 credits at the 300-level or above). "
          "May be taken in U2 Summer or U3 Winter term. "
          "Electives may be taken in any order as long as prerequisites are met and "
          "the course fits within the nursing timetable."
        ),
        "courses": [],
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
    """Seed all Ingram School of Nursing degree programs into the database."""
    stats = {"programs": 0, "blocks": 0, "courses": 0, "errors": []}

    for prog in NURSING_PROGRAMS:
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

    logger.info(f"Nursing seed complete: {stats}")
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
