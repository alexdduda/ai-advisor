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
  - INDS 125/225/323/423/424 are integrated assessment courses (0 credits each).
  - Elective credits (ELEC 400=4cr, ELEC 401-403=3cr each, ELEC 404=3cr optional).
  - Med-P is a 1-year qualifying year registered in the Faculty of Science.
    Students must achieve CGPA >= 3.5 with all required-course grades >= B.
  - CPR/AED (Level C+) certification is required and must remain current.
  - MCAT score and CASPer test are required for MDCM admission.
"""

import logging
logger = logging.getLogger(__name__)

MEDICINE_PROGRAMS = [
  {
    "program_key": 'mdcm_medicine',
    "name": 'Doctor of Medicine & Master of Surgery (M.D.,C.M.) - 200-204 credits',
    "program_type": 'major',
    "faculty": 'Faculty of Medicine and Health Sciences',
    "total_credits": 200,
    "description": "The M.D.,C.M. is McGill's flagship four-year medical degree. The curriculum is organised into four components: Physicianship (longitudinal), Fundamentals of Medicine and Dentistry (FMD, Year 1 and first half of Year 2), Transition to Clinical Practice (TCP, second half of Year 2), and Clerkship (Years 3-4). Three overarching themes run throughout: Social Accountability; Professional Identity and Practice; and Basic Science, Critical Thinking & Knowledge Translation. Graduates may practice only in supervised postgraduate residency settings, not independently.",
    "ecalendar_url": 'https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/programs/mdcm/',
    "blocks": [
      {
        "block_key": 'mdcm_medicine_fmd',
        "title": 'Fundamentals of Medicine and Dentistry (92 credits)',
        "block_type": 'required',
        "credits_needed": 92,
        "notes": 'Year 1 and first part of Year 2. Includes system-based courses (INDS 111-118), integrated assessments (INDS 125J1-J3), research fundamentals (INDS 123J1-J3, INDS 223), longitudinal family medicine (INDS 124J1-J3), and advanced courses (INDS 211, INDS 212).',
        "sort_order": 1,
        "courses": [
          {
            "subject": 'INDS',
            "catalog": '111',
            "title": 'Molecules to Global Health',
            "credits": 6.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '112',
            "title": 'Respiration',
            "credits": 6.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '113',
            "title": 'Circulation',
            "credits": 8.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '114',
            "title": 'Digestion and Metabolism',
            "credits": 8.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '115',
            "title": 'Renal',
            "credits": 6.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '116',
            "title": 'Defense',
            "credits": 6.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '117',
            "title": 'Infection',
            "credits": 6.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '118',
            "title": 'Movement',
            "credits": 6.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '123J1',
            "title": 'Research Fundamentals 1',
            "credits": 1.0,
            "is_required": True,
            "notes": 'Fall 2026',
          },
          {
            "subject": 'INDS',
            "catalog": '123J2',
            "title": 'Research Fundamentals 1',
            "credits": 1.0,
            "is_required": True,
            "notes": 'Winter 2027',
          },
          {
            "subject": 'INDS',
            "catalog": '123J3',
            "title": 'Research Fundamentals 1',
            "credits": 1.0,
            "is_required": True,
            "notes": 'Summer 2026, Summer 2027',
          },
          {
            "subject": 'INDS',
            "catalog": '124J1',
            "title": 'Longitudinal Family Medicine Experience',
            "credits": 1.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'INDS',
            "catalog": '124J2',
            "title": 'Longitudinal Family Medicine Experience',
            "credits": 1.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'INDS',
            "catalog": '124J3',
            "title": 'Longitudinal Family Medicine Experience',
            "credits": 1.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'INDS',
            "catalog": '125J1',
            "title": 'FMD Integrated Assessment 1',
            "credits": 0.0,
            "is_required": True,
            "notes": 'Fall 2026',
          },
          {
            "subject": 'INDS',
            "catalog": '125J2',
            "title": 'FMD Integrated Assessment 1',
            "credits": 0.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'INDS',
            "catalog": '125J3',
            "title": 'FMD Integrated Assessment 1',
            "credits": 0.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'INDS',
            "catalog": '211',
            "title": 'Reproduction, Sexuality and Hormonal Function',
            "credits": 7.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '212',
            "title": 'Human Behaviour',
            "credits": 12.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '223',
            "title": 'Research Fundamentals 2',
            "credits": 1.5,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '225',
            "title": 'FMD Integrated Assessment 2',
            "credits": 0.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
        ],
      },
      {
        "block_key": 'mdcm_medicine_tcp',
        "title": 'Transition to Clinical Practice (25 credits)',
        "block_type": 'required',
        "credits_needed": 25,
        "notes": 'Second half of Year 2. Includes clinical rotations in Family Medicine, Internal Medicine, Neurology, Pediatrics, Surgery, Radiology, Ophthalmology, plus integrated assessment and transition preparation.',
        "sort_order": 2,
        "courses": [
          {
            "subject": 'FMED',
            "catalog": '301',
            "title": 'TCP Family Medicine',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'IMED',
            "catalog": '301',
            "title": 'TCP Internal Medicine',
            "credits": 6.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '224J1',
            "title": 'Community Health Alliance Project - C.H.A.P.',
            "credits": 0.7,
            "is_required": True,
            "notes": 'Fall 2026',
          },
          {
            "subject": 'INDS',
            "catalog": '224J2',
            "title": 'Community Health Alliance Project - C.H.A.P.',
            "credits": 0.7,
            "is_required": True,
            "notes": 'Winter 2027',
          },
          {
            "subject": 'INDS',
            "catalog": '224J3',
            "title": 'Community Health Alliance Project - C.H.A.P.',
            "credits": 0.7,
            "is_required": True,
            "notes": 'Summer 2026, Summer 2027',
          },
          {
            "subject": 'INDS',
            "catalog": '305',
            "title": 'Transition to Clerkship',
            "credits": 2.0,
            "is_required": True,
          },
          {
            "subject": 'INDS',
            "catalog": '323',
            "title": 'TCP Integrated Assessment',
            "credits": 0.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'NEUR',
            "catalog": '301',
            "title": 'TCP Neurology',
            "credits": 2.0,
            "is_required": True,
          },
          {
            "subject": 'OPTH',
            "catalog": '300',
            "title": 'TCP Ophthalmology',
            "credits": 1.0,
            "is_required": True,
          },
          {
            "subject": 'PAED',
            "catalog": '301',
            "title": 'TCP Pediatrics',
            "credits": 2.0,
            "is_required": True,
          },
          {
            "subject": 'RADD',
            "catalog": '301',
            "title": 'TCP Radiology',
            "credits": 1.0,
            "is_required": True,
          },
          {
            "subject": 'SURG',
            "catalog": '301',
            "title": 'TCP Surgery',
            "credits": 4.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'mdcm_medicine_clerkship',
        "title": 'Clerkship (84 credits)',
        "block_type": 'required',
        "credits_needed": 84,
        "notes": 'Years 3 and 4. Includes core clerkship rotations in Family Medicine, Internal Medicine, Pediatrics, Surgery, plus specialty rotations and electives.',
        "sort_order": 3,
        "courses": [
          {
            "subject": 'ANAE',
            "catalog": '401',
            "title": 'Anesthesia Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '401',
            "title": 'Elective 1 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '402',
            "title": 'Elective 2 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '403',
            "title": 'Elective 3 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '404',
            "title": 'Elective 4 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '405',
            "title": 'Elective 5 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '406',
            "title": 'Elective 6 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '407',
            "title": 'Elective 7 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '408',
            "title": 'Elective 8 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'ELEC',
            "catalog": '409',
            "title": 'Elective 9 Clerkship',
            "credits": 2.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'FMED',
            "catalog": '405',
            "title": 'Family Medicine Clerkship',
            "credits": 8.0,
            "is_required": True,
          },
          {
            "subject": 'IMED',
            "catalog": '401',
            "title": 'Internal Medicine Clerkship',
            "credits": 8.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'IMED',
            "catalog": '407',
            "title": 'Geriatric Medicine Clerkship',
            "credits": 4.0,
            "is_required": True,
            "notes": 'Not currently offered',
          },
          {
            "subject": 'INDS',
            "catalog": '408',
            "title": 'Emergency Medicine Clerkship',
            "credits": 4.0,
            "is_required": True,
            "notes": 'Not currently offered. Page text truncated at end of description.',
          },
        ],
      },
    ],
  },
  {
    "program_key": 'medp_medicine',
    "name": 'Medicine Preparatory Program (Med-P) - B.Sc. (30 credits)',
    "program_type": 'diploma',
    "faculty": 'Faculty of Medicine and Health Sciences',
    "total_credits": 30,
    "description": "The Med-P is a one-year qualifying program for immediate graduates of the Quebec Collegial (CEGEP) system who have been conditionally admitted to the M.D.,C.M. program. Students are registered in the Faculty of Science and must complete 30 credits. Promotion into Year 1 of the MDCM requires CGPA >= 3.5 with all required-course grades of 'B' or higher (passing grades suffice for complementary courses). Failing to meet requirements allows transfer into a B.Sc. with the right to reapply later. Also offered in French at Campus Outaouais (UQO). Full details: mcgill.ca/medadmissions/programs/med-p",
    "ecalendar_url": 'https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/programs/medicine-preparatory-program/',
    "blocks": [
      {
        "block_key": 'medp_required_sciences',
        "title": 'Required Science Courses - Minimum Grade B',
        "block_type": 'required',
        "credits_needed": 15,
        "notes": 'All five courses require a minimum grade of B for promotion into the MDCM. BIOL 200 is a prerequisite for BIOL 201. PHGY 209 and PHGY 210 require prior CEGEP-level Biology, Chemistry, and Physics. At Campus Outaouais (UQO), francophone equivalents are offered by McGill Faculty of Science professors.',
        "sort_order": 0,
        "courses": [
          {
            "subject": 'BIOL',
            "catalog": '200',
            "title": 'Cellular Biology and Molecular Medicine',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BIOL',
            "catalog": '201',
            "title": 'Cellular Biology & Metabolism',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BIOL',
            "catalog": '202',
            "title": 'Genetics',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'PHGY',
            "catalog": '209',
            "title": 'Mammalian Physiology 1',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'PHGY',
            "catalog": '210',
            "title": 'Mammalian Physiology 2',
            "credits": 3.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'medp_statistics',
        "title": 'Statistics Requirement',
        "block_type": 'required',
        "credits_needed": 3,
        "notes": 'MATH 203 is required for all Med-P students who did not complete an equivalent statistics course during CEGEP. Students with an approved CEGEP statistics equivalent are exempt and must replace it with an approved complementary science course. At Campus Outaouais, the equivalent UQO course satisfies this requirement.',
        "sort_order": 1,
        "courses": [
          {
            "subject": 'MATH',
            "catalog": '203',
            "title": 'Principles of Statistics',
            "credits": 3.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'medp_complementary_sciences',
        "title": 'Complementary Science Electives',
        "block_type": 'choose_credits',
        "credits_needed": 12,
        "notes": "Students complete approved Faculty of Science courses to reach the 30-credit total. A passing grade suffices (no 'B' minimum). Common choices listed below; consult an academic advisor for the current approved list.",
        "sort_order": 2,
        "courses": [
          {
            "subject": 'CHEM',
            "catalog": '212',
            "title": 'Organic Chemistry 1',
            "credits": 3.0,
          },
          {
            "subject": 'CHEM',
            "catalog": '222',
            "title": 'Organic Chemistry 2',
            "credits": 3.0,
          },
          {
            "subject": 'BIOL',
            "catalog": '300',
            "title": 'Molecular Biology',
            "credits": 3.0,
          },
          {
            "subject": 'BIOL',
            "catalog": '301',
            "title": 'Biochemistry',
            "credits": 3.0,
          },
          {
            "subject": 'PHGY',
            "catalog": '311',
            "title": 'Neurophysiology',
            "credits": 3.0,
          },
          {
            "subject": 'PSYC',
            "catalog": '211',
            "title": 'Introduction to Learning and Behaviour',
            "credits": 3.0,
          },
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
