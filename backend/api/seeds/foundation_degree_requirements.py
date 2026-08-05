"""
McGill Foundation (U0 / Freshman) Year – Degree Requirements Seed Data

The Foundation year is the 30-credit first year taken by students admitted to a
120-credit degree (i.e. entering from outside Quebec / without CEGEP). Before
this seed existed the app had no program to match U0 work against, so every
Foundation course fell through to the Electives pool — which is wrong: U0 is a
program in its own right, distinct from both the major/minor and free electives.

Sources (fetched 2026-08-05):
  Arts       https://www.mcgill.ca/oasis/students/new-ba-students/foundation-u0
             https://coursecatalogue.mcgill.ca/en/undergraduate/arts/degree-requirements/about-program/foundation-program-general-ba/
  Science    https://www.mcgill.ca/sousa/new-students/courseselection/bscu0
             https://coursecatalogue.mcgill.ca/en/undergraduate/science/overview-programs-offered/sci-foundation-program/foundation-year/
  B.A. & Sc. https://www.mcgill.ca/sousa/new-students/courseselection/bascu0
             https://coursecatalogue.mcgill.ca/en/undergraduate/arts-science/overview-programs-offered/basc-foundation-year-program/foundation-year-program-basc/

WILDCARD ROWS
-------------
The Arts category lists ("Approved Foundation Courses") run to several hundred
courses and are re-published every year, so pinning them here would go stale and
would bury the UI under 300 rows. Instead each category block carries one
per-subject wildcard row ("Any 200-level Philosophy course"), which
`frontend/src/utils/requirementMatch.js` resolves via wildcardBand(). This
matches a course to the right *category* — which is what the student needs to
see — and every block's `notes` links the official list for the exact eligible
courses.

NO DOUBLE COUNTING
------------------
McGill's rule, stated on both the Arts and B.A. & Sc. pages: courses taken for
the Foundation (U0) program cannot also be counted toward any other program.
The frontend enforces this — see FOUNDATION_PROGRAM_KEYS in
DegreePlanningView.jsx, which strips Foundation-claimed courses from every other
program's progress before anything else is counted.
"""

# Official approved-course lists, linked from each block's notes.
_ARTS_LIST_URL = (
    "https://www.mcgill.ca/oasis/students/new-ba-students/foundation-u0/"
    "approved-foundation-courses"
)
_SCI_LIST_URL = "https://www.mcgill.ca/sousa/new-students/courseselection/bscu0"
_BASC_LIST_URL = "https://www.mcgill.ca/sousa/new-students/courseselection/bascu0"

_NO_OVERLAP_NOTE = (
    "Courses used for the Foundation (U0) program cannot also count toward your "
    "major, minor or concentration."
)


def _wild(subject: str, level: int, subject_name: str, credits: int = 3) -> dict:
    """A per-subject wildcard requirement row.

    The title format ("Any 200-level Philosophy course") is what wildcardBand()
    in requirementMatch.js parses to derive the subject + catalog band, so keep
    the wording — changing it silently stops the row matching anything.
    """
    return {
        "subject": subject,
        "catalog": str(level),
        "title": f"Any {level}-level {subject_name} course",
        "credits": credits,
        "is_required": False,
    }


# ── Arts category subject bands ───────────────────────────────────────────────
# Subjects confirmed on the Arts OASIS approved-course list. Levels reflect
# where that subject's Foundation-eligible courses actually sit (most Arts
# introductory courses at McGill are 200-level; language and writing courses
# start at 100).

_ARTS_HUMANITIES_ROWS = [
    _wild("AFRI", 200, "African Studies"),
    _wild("ARTH", 200, "Art History"),
    _wild("CATH", 200, "Catholic Studies"),
    _wild("CLAS", 200, "Classics"),
    _wild("COMS", 200, "Communication Studies"),
    _wild("EAST", 200, "East Asian Studies"),
    _wild("ENGL", 200, "English"),
    _wild("GERM", 200, "German Studies"),
    _wild("HISP", 200, "Hispanic Studies"),
    _wild("INDG", 200, "Indigenous Studies"),
    _wild("ITAL", 200, "Italian Studies"),
    _wild("JWST", 200, "Jewish Studies"),
    _wild("LLCU", 200, "Languages, Literatures and Cultures"),
    _wild("PHIL", 200, "Philosophy"),
    _wild("RELG", 200, "Religious Studies"),
    _wild("RUSS", 200, "Russian"),
    _wild("WCOM", 100, "Writing and Communication"),
    _wild("WCOM", 200, "Writing and Communication"),
    {"subject": "AFYR", "catalog": "101", "title": "Complex Problems 1", "credits": 3, "is_required": False},
    {"subject": "AFYR", "catalog": "102", "title": "Complex Problems 2", "credits": 3, "is_required": False},
]

_ARTS_LANGUAGES_ROWS = [
    _wild("FRSL", 100, "French as a Second Language"),
    _wild("FRSL", 200, "French as a Second Language"),
    _wild("FREN", 200, "French"),
    _wild("CLAS", 200, "Classics (Latin / Ancient Greek)"),
    {"subject": "EAST", "catalog": "220", "title": "First Level Korean", "credits": 9, "is_required": False},
    {"subject": "EAST", "catalog": "230", "title": "First Level Chinese", "credits": 9, "is_required": False},
    {"subject": "EAST", "catalog": "240", "title": "First Level Japanese", "credits": 9, "is_required": False},
]

# Confirmed Social Sciences departments for the Arts Foundation categories.
_ARTS_SOCIAL_SCIENCES_ROWS = [
    _wild("ANTH", 200, "Anthropology"),
    _wild("ECON", 200, "Economics"),
    _wild("HIST", 200, "History"),
    _wild("LING", 200, "Linguistics"),
    _wild("POLI", 200, "Political Science"),
    _wild("SOCI", 200, "Sociology"),
]

_ARTS_MATH_SCIENCE_ROWS = [
    _wild("MATH", 100, "Mathematics"),
    _wild("MATH", 200, "Mathematics"),
    _wild("BIOL", 100, "Biology"),
    _wild("CHEM", 100, "Chemistry"),
    _wild("PHYS", 100, "Physics"),
    _wild("GEOG", 200, "Geography"),
    {"subject": "PSYC", "catalog": "100", "title": "Introduction to Psychology", "credits": 3, "is_required": False},
    {"subject": "COMP", "catalog": "202", "title": "Foundations of Programming", "credits": 3, "is_required": False},
    {"subject": "ATOC", "catalog": "100", "title": "Extreme-Weather and Climate-Change Physics", "credits": 3, "is_required": False},
    {"subject": "ESYS", "catalog": "104", "title": "The Earth System", "credits": 3, "is_required": False},
]

# ── Science Foundation approved course rows ───────────────────────────────────

_SCI_MATH_ROWS = [
    {"subject": "MATH", "catalog": "139", "title": "Calculus 1 with Precalculus", "credits": 4, "is_required": False},
    {"subject": "MATH", "catalog": "140", "title": "Calculus 1", "credits": 3, "is_required": False, "recommended": True, "recommendation_reason": "Standard Calculus 1 for students with high school calculus"},
    {"subject": "MATH", "catalog": "141", "title": "Calculus 2", "credits": 4, "is_required": False, "recommended": True, "recommendation_reason": "Follows MATH 139/140 — take in Winter"},
    {"subject": "MATH", "catalog": "150", "title": "Calculus A", "credits": 4, "is_required": False},
    {"subject": "MATH", "catalog": "151", "title": "Calculus B", "credits": 4, "is_required": False},
    {"subject": "MATH", "catalog": "133", "title": "Linear Algebra and Geometry", "credits": 3, "is_required": False, "recommended": True, "recommendation_reason": "Counts as the third MATH course and is a prerequisite for most U1 programs"},
]

_SCI_BCP_ROWS = [
    {"subject": "BIOL", "catalog": "111", "title": "Principles: Organismal Biology", "credits": 3, "is_required": False},
    {"subject": "BIOL", "catalog": "112", "title": "Cell and Molecular Biology", "credits": 3, "is_required": False},
    {"subject": "CHEM", "catalog": "110", "title": "General Chemistry 1", "credits": 4, "is_required": False},
    {"subject": "CHEM", "catalog": "120", "title": "General Chemistry 2", "credits": 4, "is_required": False},
    {"subject": "PHYS", "catalog": "101", "title": "Introductory Physics - Mechanics", "credits": 4, "is_required": False},
    {"subject": "PHYS", "catalog": "102", "title": "Introductory Physics - Electromagnetism", "credits": 4, "is_required": False},
    {"subject": "PHYS", "catalog": "131", "title": "Mechanics and Waves", "credits": 4, "is_required": False},
    {"subject": "PHYS", "catalog": "142", "title": "Electromagnetism and Optics", "credits": 4, "is_required": False},
]

_SCI_OTHER_APPROVED_ROWS = [
    {"subject": "COMP", "catalog": "202", "title": "Foundations of Programming", "credits": 3, "is_required": False},
    {"subject": "PSYC", "catalog": "100", "title": "Introduction to Psychology", "credits": 3, "is_required": False},
    {"subject": "ATOC", "catalog": "100", "title": "Extreme-Weather and Climate-Change Physics", "credits": 3, "is_required": False},
    {"subject": "ESYS", "catalog": "104", "title": "The Earth System", "credits": 3, "is_required": False},
    {"subject": "GEOG", "catalog": "205", "title": "Global Change: Past, Present and Future", "credits": 3, "is_required": False},
]


def _dedupe(*row_lists) -> list:
    """Concatenate requirement rows, dropping repeats of the same subject+catalog.

    The B.A. & Sc. Arts block pools all three Arts categories, and CLAS appears
    in both Humanities and Languages — without this the block would render the
    same row twice and insert a duplicate DB row.
    """
    seen, out = set(), []
    for rows in row_lists:
        for row in rows:
            key = (row.get("subject", ""), row.get("catalog"))
            if key in seen:
                continue
            seen.add(key)
            out.append(row)
    return out


FOUNDATION_PROGRAMS = [

    # ══════════════════════════════════════════════════════════════════
    # Faculty of Arts — Foundation Program (General B.A.)
    # ══════════════════════════════════════════════════════════════════
    {
        "program_key": "foundation_arts_ba",
        "name": "Foundation Program – General (B.A.) (U0)",
        "program_type": "foundation",
        "faculty": "Faculty of Arts",
        "total_credits": 30,
        "description": (
            "The 30-credit Foundation (U0) year taken by B.A. students admitted to a "
            "120-credit degree. 18 of the 30 credits must be Foundation core courses, "
            "with a minimum of 6 credits in 3 of the 4 categories. Foundation courses "
            "must be passed with a grade of C or better and cannot be taken S/U, and "
            "they cannot also count toward a major, minor or concentration."
        ),
        "ecalendar_url": (
            "https://coursecatalogue.mcgill.ca/en/undergraduate/arts/degree-requirements/"
            "about-program/foundation-program-general-ba/"
        ),
        "blocks": [
            {
                "block_key": "foundation_arts_social_sciences",
                "title": "Category: Social Sciences (6 credits)",
                "block_type": "choose_credits",
                "credits_needed": 6,
                "sort_order": 1,
                "notes": (
                    "One of the four Foundation categories — you need at least 6 credits "
                    f"in 3 of the 4. Approved courses: {_ARTS_LIST_URL}. {_NO_OVERLAP_NOTE}"
                ),
                "constraint_notes": "Maximum 12 credits from any one department across the Foundation core.",
                "courses": _ARTS_SOCIAL_SCIENCES_ROWS,
            },
            {
                "block_key": "foundation_arts_humanities",
                "title": "Category: Humanities (6 credits)",
                "block_type": "choose_credits",
                "credits_needed": 6,
                "sort_order": 2,
                "notes": (
                    "One of the four Foundation categories — you need at least 6 credits "
                    f"in 3 of the 4. Approved courses: {_ARTS_LIST_URL}. {_NO_OVERLAP_NOTE}"
                ),
                "constraint_notes": "Maximum 12 credits from any one department across the Foundation core.",
                "courses": _ARTS_HUMANITIES_ROWS,
            },
            {
                "block_key": "foundation_arts_languages",
                "title": "Category: Languages (6 credits)",
                "block_type": "choose_credits",
                "credits_needed": 6,
                "sort_order": 3,
                "notes": (
                    "One of the four Foundation categories — you need at least 6 credits "
                    f"in 3 of the 4. Approved courses: {_ARTS_LIST_URL}. {_NO_OVERLAP_NOTE}"
                ),
                "constraint_notes": "Maximum 12 credits from any one department across the Foundation core.",
                "courses": _ARTS_LANGUAGES_ROWS,
            },
            {
                "block_key": "foundation_arts_math_science",
                "title": "Category: Mathematics & Science (6 credits)",
                "block_type": "choose_credits",
                "credits_needed": 6,
                "sort_order": 4,
                "notes": (
                    "One of the four Foundation categories — you need at least 6 credits "
                    f"in 3 of the 4. Approved courses: {_ARTS_LIST_URL}. {_NO_OVERLAP_NOTE}"
                ),
                "constraint_notes": "Maximum 12 credits from any one department across the Foundation core.",
                "courses": _ARTS_MATH_SCIENCE_ROWS,
            },
            {
                "block_key": "foundation_arts_electives",
                "title": "Foundation Electives (12 credits)",
                "block_type": "level_elective",
                "credits_needed": 12,
                "min_level": 100,
                "sort_order": 5,
                "notes": (
                    "The remaining 12 credits of the 30-credit U0 year. These may be further "
                    "Foundation courses or free electives. Use the \"Counts toward\" selector "
                    "on the Electives tab to place a course here."
                ),
                "constraint_notes": (
                    "Maximum 18 credits from any single Foundation category; maximum 12 credits "
                    "from any one department."
                ),
                "courses": [],
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════
    # Faculty of Science — Foundation Program (B.Sc.)
    # ══════════════════════════════════════════════════════════════════
    {
        "program_key": "foundation_science_bsc",
        "name": "Foundation Program (B.Sc.) (U0)",
        "program_type": "foundation",
        "faculty": "Faculty of Science",
        "total_credits": 30,
        "description": (
            "The 30-credit Foundation (U0) year taken by B.Sc. students admitted to a "
            "120-credit degree. It must include at least seven courses from the Approved "
            "Foundation Year Science Courses list, six of which satisfy either 2 MATH + 4 "
            "BIOL/CHEM/PHYS courses, or 3 MATH + 3 BIOL/CHEM/PHYS courses. Foundation "
            "courses cannot also count toward a major, minor or concentration."
        ),
        "ecalendar_url": (
            "https://coursecatalogue.mcgill.ca/en/undergraduate/science/"
            "overview-programs-offered/sci-foundation-program/foundation-year/"
        ),
        "blocks": [
            {
                "block_key": "foundation_sci_math",
                "title": "Mathematics (2–3 approved courses)",
                "block_type": "choose_credits",
                "credits_needed": 7,
                "sort_order": 1,
                "notes": (
                    "Take 2 MATH courses if you are taking 4 science courses, or 3 MATH "
                    f"courses if you are taking 3. Full approved list: {_SCI_LIST_URL}. "
                    f"{_NO_OVERLAP_NOTE}"
                ),
                "constraint_notes": (
                    "Normally one Calculus 1 course (MATH 139/140/150) plus one Calculus 2 "
                    "course (MATH 141/151); MATH 133 may serve as the third."
                ),
                "courses": _SCI_MATH_ROWS,
            },
            {
                "block_key": "foundation_sci_bcp",
                "title": "Biology, Chemistry and Physics (3–4 approved courses)",
                "block_type": "choose_credits",
                "credits_needed": 14,
                "sort_order": 2,
                "notes": (
                    "Choose 3 or 4 courses here to pair with your MATH courses so that six "
                    "Foundation courses satisfy the 2+4 or 3+3 rule. Take the courses your "
                    f"intended U1 program requires. Full approved list: {_SCI_LIST_URL}. "
                    f"{_NO_OVERLAP_NOTE}"
                ),
                "courses": _SCI_BCP_ROWS,
            },
            {
                "block_key": "foundation_sci_other_approved",
                "title": "Other Approved Foundation Science Courses (max 2)",
                "block_type": "choose_credits",
                "credits_needed": 3,
                "sort_order": 3,
                "notes": (
                    "These count as approved Foundation science courses but not toward the "
                    "BIOL/CHEM/PHYS requirement. At most 2 of them may be used."
                ),
                "courses": _SCI_OTHER_APPROVED_ROWS,
            },
            {
                "block_key": "foundation_sci_electives",
                "title": "Foundation Electives (6 credits)",
                "block_type": "level_elective",
                "credits_needed": 6,
                "min_level": 100,
                "sort_order": 4,
                "notes": (
                    "The remainder of the 30-credit U0 year. Use the \"Counts toward\" "
                    "selector on the Electives tab to place a course here."
                ),
                "constraint_notes": (
                    "At most 6 credits (3 per term) may be taken outside the Faculties of "
                    "Arts and of Science during the Foundation program."
                ),
                "courses": [],
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════
    # B.A. & Sc. — Foundation Program (interfaculty)
    # ══════════════════════════════════════════════════════════════════
    {
        "program_key": "foundation_basc",
        "name": "Foundation Program (B.A. & Sc.) (U0)",
        "program_type": "foundation",
        "faculty": "Bachelor of Arts and Science",
        "total_credits": 30,
        "description": (
            "The 30-credit Foundation (U0) year for B.A. & Sc. students admitted to a "
            "120-credit degree: an Arts component of at least 9 credits drawn from two of "
            "the three Arts categories, plus a Science component of two MATH courses and "
            "three science courses. Foundation courses must be passed with a grade of C or "
            "better, cannot be taken S/U, and cannot also count toward another program."
        ),
        "ecalendar_url": (
            "https://coursecatalogue.mcgill.ca/en/undergraduate/arts-science/"
            "overview-programs-offered/basc-foundation-year-program/foundation-year-program-basc/"
        ),
        "blocks": [
            {
                "block_key": "foundation_basc_math",
                "title": "Science Component – Mathematics (2 courses)",
                "block_type": "choose_credits",
                "credits_needed": 7,
                "sort_order": 1,
                "notes": (
                    "One Calculus 1 course (MATH 139/140/150) and one Calculus 2 course "
                    f"(MATH 141/151), or MATH 133. Approved list: {_BASC_LIST_URL}. "
                    f"{_NO_OVERLAP_NOTE}"
                ),
                "courses": _SCI_MATH_ROWS,
            },
            {
                "block_key": "foundation_basc_science",
                "title": "Science Component – Foundational Sciences (3 courses)",
                "block_type": "choose_credits",
                "credits_needed": 10,
                "sort_order": 2,
                "notes": (
                    "Three courses from BIOL 111/112, CHEM 110/120, PHYS 101/131/102/142. "
                    "At most 2 may be COMP 202, ESYS 104 or PSYC 100."
                ),
                "courses": _dedupe(_SCI_BCP_ROWS, [
                    {"subject": "COMP", "catalog": "202", "title": "Foundations of Programming", "credits": 3, "is_required": False, "notes": "Max 2 courses from COMP 202 / ESYS 104 / PSYC 100"},
                    {"subject": "ESYS", "catalog": "104", "title": "The Earth System", "credits": 3, "is_required": False, "notes": "Max 2 courses from COMP 202 / ESYS 104 / PSYC 100"},
                    {"subject": "PSYC", "catalog": "100", "title": "Introduction to Psychology", "credits": 3, "is_required": False, "notes": "Max 2 courses from COMP 202 / ESYS 104 / PSYC 100"},
                ]),
            },
            {
                "block_key": "foundation_basc_arts",
                "title": "Arts Component (9 credits, from 2 of 3 categories)",
                "block_type": "choose_credits",
                "credits_needed": 9,
                "sort_order": 3,
                "notes": (
                    "At least 9 credits of Arts courses from two of Humanities, Languages "
                    "and Social Sciences. Maximum 2 courses from one category and maximum 2 "
                    f"from any one department. Approved list: {_BASC_LIST_URL}."
                ),
                "constraint_notes": (
                    "Courses from outside the Faculties of Arts and of Science cannot be used "
                    "toward this requirement."
                ),
                "courses": _dedupe(
                    _ARTS_SOCIAL_SCIENCES_ROWS,
                    _ARTS_HUMANITIES_ROWS,
                    _ARTS_LANGUAGES_ROWS,
                ),
            },
            {
                "block_key": "foundation_basc_electives",
                "title": "Foundation Electives (4 credits)",
                "block_type": "level_elective",
                "credits_needed": 4,
                "min_level": 100,
                "sort_order": 4,
                "notes": (
                    "The remainder of the 30-credit U0 year. Use the \"Counts toward\" "
                    "selector on the Electives tab to place a course here."
                ),
                "courses": [],
            },
        ],
    },
]


# ──────────────────────────────────────────────────────────────────
# Database seed function — same contract as the other faculty seeds:
# upsert on program_key, then delete + reinsert blocks and courses.
# ──────────────────────────────────────────────────────────────────

def seed_degree_requirements(supabase):
    """Insert the Foundation (U0) programs into Supabase. Safe to re-run."""
    inserted_programs = 0
    inserted_blocks = 0
    inserted_courses = 0

    for prog in FOUNDATION_PROGRAMS:
        prog_data = {
            "program_key":   prog["program_key"],
            "name":          prog["name"],
            "faculty":       prog.get("faculty", "Faculty of Arts"),
            "program_type":  prog["program_type"],
            "total_credits": prog.get("total_credits") or 0,
            "description":   prog.get("description"),
            "ecalendar_url": prog.get("ecalendar_url"),
        }
        result = supabase.table("degree_programs").upsert(
            prog_data, on_conflict="program_key"
        ).execute()
        prog_id = result.data[0]["id"]
        inserted_programs += 1

        supabase.table("requirement_blocks").delete().eq("program_id", prog_id).execute()

        for i, block in enumerate(prog.get("blocks", [])):
            constraint_notes = block.get("constraint_notes") or block.get("notes") or ""

            block_result = supabase.table("requirement_blocks").insert({
                "program_id":       prog_id,
                "block_key":        block.get("block_key", f"block_{i}"),
                "title":            block.get("title", ""),
                "block_type":       block.get("block_type", "choose_credits"),
                "group_name":       block.get("group_name"),
                "courses_needed":   block.get("courses_needed"),
                "constraint_notes": constraint_notes,
                "credits_needed":   block.get("credits_needed"),
                "min_level":        block.get("min_level"),
                "max_credits_200":  block.get("max_credits_200"),
                "min_credits_400":  block.get("min_credits_400"),
                "notes":            block.get("notes", ""),
                "sort_order":       block.get("sort_order", i),
            }).execute()
            block_id = block_result.data[0]["id"]
            inserted_blocks += 1

            courses_batch = []
            for j, course in enumerate(block.get("courses", [])):
                is_required = course.get("is_required", False)
                if block.get("block_type") == "required":
                    is_required = True
                courses_batch.append({
                    "block_id":              block_id,
                    "subject":               course.get("subject", ""),
                    "catalog":               course.get("catalog"),
                    "title":                 course.get("title", ""),
                    "credits":               course.get("credits", 3),
                    "is_required":           is_required,
                    "choose_from_group":     course.get("choose_from_group"),
                    "choose_n_credits":      course.get("choose_n_credits"),
                    "notes":                 course.get("notes"),
                    "recommended":           course.get("recommended", False),
                    "recommendation_reason": course.get("recommendation_reason"),
                    "sort_order":            j,
                })
            for chunk_start in range(0, len(courses_batch), 50):
                chunk = courses_batch[chunk_start:chunk_start + 50]
                if chunk:
                    supabase.table("requirement_courses").insert(chunk).execute()
                    inserted_courses += len(chunk)

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
    stats = seed_degree_requirements(get_supabase())
    print(f"Seeded: {stats['programs']} programs, {stats['blocks']} blocks, {stats['courses']} courses")
