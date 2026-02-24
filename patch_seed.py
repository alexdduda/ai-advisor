"""
patch_seed.py
─────────────
Run from your project root (same folder as frontend/ and backend/):
  python3 patch_seed.py

Does two things:
  1. Adds Cognitive Science Minor entry at the top of ARTS_PROGRAMS
  2. Replaces the seed function with one that handles block_type / group_name / courses_needed
"""

import re, sys

TARGET = "backend/api/seeds/arts_degree_requirements.py"

COG_SCI_ENTRY = '''  {
    "program_key": "cognitive_science_minor",
    "name": "Cognitive Science – Minor (B.Sc.)",
    "program_type": "minor",
    "faculty": "Faculty of Arts",
    "total_credits": 24,
    "description": (
      "Open to Arts and Science students. Explore the interdisciplinary study of cognition. "
      "Complete a minimum of 9 credits each in two of four areas: Computer Science & Mathematics, "
      "Linguistics, Philosophy, or Psychology. Minimum 6 credits must be at 400–500 level."
    ),
    "ecalendar_url": "https://coursecatalogue.mcgill.ca/en/undergraduate/science/programs/cognitive-science/cognitive-science-minor-bsc/",
    "constraints": [
      {"type": "min_level_credits", "min_credits": 6, "level": 400, "rule_text": "Students must take a minimum of 6 credits at the 400 to 500 level."},
      {"type": "note", "rule_text": "Students complete a minimum of 9 credits each in two areas."},
      {"type": "note", "rule_text": "Students may not take any courses from their home department(s)."},
    ],
    "blocks": [
      {
        "block_key": "cogs_required", "title": "Required Course",
        "block_type": "required", "credits_needed": 3, "courses_needed": None,
        "group_name": None, "notes": "Must be taken by all students in the minor.", "sort_order": 1,
        "courses": [
          {"subject": "PSYC", "catalog": "433", "title": "Cognitive Science", "credits": 3, "is_required": True},
        ],
      },
      {
        "block_key": "cogs_comp_sci_math", "title": "Computer Science and Mathematics",
        "block_type": "group", "credits_needed": None, "courses_needed": None,
        "group_name": "Group – Computer Science and Mathematics",
        "notes": "Min 9 credits in two of the four areas. Min 6 total credits at 400–500 level across all complementary courses. Cannot take courses from home department.",
        "sort_order": 2,
        "courses": [
          {"subject": "COMP", "catalog": "206", "title": "Introduction to Software Systems", "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "230", "title": "Logic and Computability", "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "250", "title": "Introduction to Computer Science", "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "251", "title": "Algorithms and Data Structures", "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "302", "title": "Programming Languages and Paradigms", "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "330", "title": "Theory of Computation", "credits": 3, "is_required": False},
          {"subject": "COMP", "catalog": "527", "title": "Logic and Computation", "credits": 3, "is_required": False},
          {"subject": "MATH", "catalog": "240", "title": "Discrete Structures", "credits": 3, "is_required": False},
          {"subject": "MATH", "catalog": "318", "title": "Mathematical Logic", "credits": 3, "is_required": False},
        ],
      },
      {
        "block_key": "cogs_linguistics", "title": "Linguistics",
        "block_type": "group", "credits_needed": None, "courses_needed": None,
        "group_name": "Group – Linguistics",
        "notes": "Any LING course at the 300, 400, or 500 level also qualifies.", "sort_order": 3,
        "courses": [
          {"subject": "LING", "catalog": "201", "title": "Introduction to Linguistics", "credits": 3, "is_required": False},
          {"subject": "LING", "catalog": "210", "title": "Introduction to Speech Science", "credits": 3, "is_required": False},
          {"subject": "LING", "catalog": "260", "title": "Meaning in Language", "credits": 3, "is_required": False},
        ],
      },
      {
        "block_key": "cogs_philosophy", "title": "Philosophy",
        "block_type": "group", "credits_needed": None, "courses_needed": None,
        "group_name": "Group – Philosophy", "notes": "", "sort_order": 4,
        "courses": [
          {"subject": "PHIL", "catalog": "210", "title": "Introduction to Deductive Logic 1", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "221", "title": "Introduction to History and Philosophy of Science 2", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "306", "title": "Philosophy of Mind", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "310", "title": "Intermediate Logic", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "311", "title": "Philosophy of Mathematics", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "341", "title": "Philosophy of Science 1", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "411", "title": "Topics in Philosophy of Logic and Mathematics", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "415", "title": "Philosophy of Language", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "441", "title": "Philosophy of Science 2", "credits": 3, "is_required": False},
          {"subject": "PHIL", "catalog": "474", "title": "Phenomenology", "credits": 3, "is_required": False},
        ],
      },
      {
        "block_key": "cogs_psychology", "title": "Psychology",
        "block_type": "group", "credits_needed": None, "courses_needed": None,
        "group_name": "Group – Psychology", "notes": "", "sort_order": 5,
        "courses": [
          {"subject": "PSYC", "catalog": "212", "title": "Perception", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "213", "title": "Cognition", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "301", "title": "Animal Learning and Theory", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "304", "title": "Child Development", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "310", "title": "Intelligence", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "311", "title": "Human Cognition and the Brain", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "315", "title": "Computational Psychology", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "319", "title": "Computational Models - Cognition", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "340", "title": "Psychology of Language", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "410", "title": "Special Topics in Neuropsychology", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "413", "title": "Cognitive Development", "credits": 3, "is_required": False},
          {"subject": "PSYC", "catalog": "538", "title": "Categorization, Communication and Consciousness", "credits": 3, "is_required": False},
        ],
      },
    ],
  },

'''

NEW_SEED_FUNCTION = '''def seed_degree_requirements(supabase):
    """
    Insert all Arts degree requirements into Supabase.
    Safe to re-run: upserts programs, deletes+reinserts blocks each run.

    Block types:
      required       — every course must be taken
      choose_credits — take credits_needed credits from list
      choose_courses — take courses_needed courses from list
      group          — named sub-group (Group A/B/C) feeding a parent rule
      multi_group    — parent: X credits from Group A AND Y from Group B
      pool_group     — parent: at least X credits from Groups A+B+C combined
      level_elective — any courses at a given level range
    """
    inserted_programs = 0
    inserted_blocks = 0
    inserted_courses = 0

    for prog in ARTS_PROGRAMS:
        # ── Upsert program ──────────────────────────────────────────
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

        # ── Clean re-seed blocks ────────────────────────────────────
        supabase.table("requirement_blocks").delete().eq("program_id", prog_id).execute()

        for i, block in enumerate(prog.get("blocks", [])):
            constraint_notes = block.get("constraint_notes") or block.get("notes") or ""

            block_data = {
                "program_id":       prog_id,
                "block_key":        block.get("block_key", f"block_{i}"),
                "title":            block.get("title", ""),
                "block_type":       block.get("block_type", "choose_credits"),
                "group_name":       block.get("group_name"),
                "credits_needed":   block.get("credits_needed"),
                "courses_needed":   block.get("courses_needed"),
                "constraint_notes": constraint_notes,
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
                is_required = course.get("is_required", False)
                if block.get("block_type") == "required":
                    is_required = True

                course_data = {
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
                }
                supabase.table("requirement_courses").insert(course_data).execute()
                inserted_courses += 1

    return {
        "programs": inserted_programs,
        "blocks":   inserted_blocks,
        "courses":  inserted_courses,
    }
'''

# ─────────────────────────────────────────────────────────────────
def main():
    try:
        with open(TARGET, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"ERROR: {TARGET} not found. Run from your project root.")
        sys.exit(1)

    original_len = len(content)

    # ── 1. Add CogSci entry if not already present ──
    if "cognitive_science_minor" in content:
        print("✓ Cognitive Science entry already present — skipping.")
    else:
        marker = "ARTS_PROGRAMS = ["
        idx = content.find(marker)
        if idx == -1:
            # Try generated format
            marker = "ARTS_PROGRAMS = [\n"
            idx = content.find(marker)
        if idx == -1:
            print("ERROR: Could not find ARTS_PROGRAMS list in file.")
            sys.exit(1)
        insert_at = idx + len(marker) + 1  # after the newline
        content = content[:insert_at] + COG_SCI_ENTRY + content[insert_at:]
        print("✓ Added Cognitive Science Minor entry.")

    # ── 2. Replace seed function ──
    # Match from "def seed_degree_requirements" to end of function
    seed_pattern = re.compile(
        r'def seed_degree_requirements\(supabase\):.*?return \{[^}]+\}',
        re.DOTALL
    )
    if seed_pattern.search(content):
        content = seed_pattern.sub(NEW_SEED_FUNCTION.strip(), content, count=1)
        print("✓ Updated seed function with block_type / group_name support.")
    else:
        # Append if not found
        content += "\n\n" + NEW_SEED_FUNCTION
        print("✓ Appended new seed function (old one not found).")

    with open(TARGET, "w", encoding="utf-8") as f:
        f.write(content)

    # ── Report ──
    from importlib.util import spec_from_file_location, module_from_spec
    spec = spec_from_file_location("arts", TARGET)
    mod  = module_from_spec(spec)
    spec.loader.exec_module(mod)
    programs = mod.ARTS_PROGRAMS
    n_blocks  = sum(len(p.get("blocks", [])) for p in programs)
    n_courses = sum(sum(len(b.get("courses", [])) for b in p.get("blocks", [])) for p in programs)
    print(f"\n✓ Done. {TARGET}")
    print(f"  {len(programs)} programs | {n_blocks} blocks | {n_courses} courses")
    print(f"  File size: {original_len:,} → {len(content):,} bytes")

if __name__ == "__main__":
    main()
