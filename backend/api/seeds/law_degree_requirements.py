"""
McGill Faculty of Law – BCL/JD Degree Requirements Seed Data
Source: McGill Law Student Affairs Office (2025-2026)
https://www.mcgill.ca/law-studies/bcljd-studies/structure/courses

Program: Bachelor of Civil Law / Juris Doctor (BCL/JD)
  - 105 credits total
  - 47 credits required
  - 12 credits complementary (4 groups × 3 cr each)
  - 46 credits elective
  - 1 research paper (writing requirement)

Admission note: Students must have completed at least 60 university credits
before being admitted to the BCL/JD program. Law courses use unique subject
codes: LAWG, PUB2, PUB3, PRV2–5, PROC, PRAC, BUS1–2, CMPL, LEEL, IDFC.

Accuracy notes:
  - Verified from official McGill Law SAO pages (February 2026)
  - Enrollment as of 2020 curriculum (current intake)
  - All first-year courses offered in both English and French
  - Upper-year courses in either French or English
"""

LAW_PROGRAMS = [
  {
    "program_key": 'law_bcl_jd',
    "name": 'Bachelor of Civil Law / Juris Doctor (BCL/JD)',
    "program_type": 'major',
    "faculty": 'Faculty of Law',
    "total_credits": 105,
    "description": "The BCL/JD is McGill's unique dual-degree law program, integrating the Civil Law and Common Law traditions in a single three-year curriculum taught bilingually. Graduates receive both the Bachelor of Civil Law (BCL) and the Juris Doctor (JD), qualifying them to practise in Quebec (civil law jurisdiction) and all common law provinces. Admission requires at least 60 completed university credits. The 105-credit program consists of 47 required credits, 12 complementary credits across four groups, 46 elective credits from Faculty offerings, and one research paper (writing requirement).",
    "ecalendar_url": 'https://coursecatalogue.mcgill.ca/en/undergraduate/law/programs/law-bcl-jd/',
    "blocks": [
      {
        "block_key": 'law_bcl_jd_required_first_year',
        "title": 'Required Courses – First Year (33 credits)',
        "block_type": 'required',
        "credits_needed": 33,
        "constraint_notes": 'The following 33 credits of courses may be taken only in the first year.',
        "notes": 'The following 33 credits of courses may be taken only in the first year.',
        "sort_order": 1,
        "courses": [
          {
            "subject": 'LAWG',
            "catalog": '100D1',
            "title": 'Contractual Obligations',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '100D2',
            "title": 'Contractual Obligations',
            "credits": 3.0,
            "is_required": True,
            "notes": 'See LAWG 100D1 for course description.',
          },
          {
            "subject": 'LAWG',
            "catalog": '101D1',
            "title": 'Extra-Contractual Obligations/Torts',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '101D2',
            "title": 'Extra-Contractual Obligations/Torts',
            "credits": 3.0,
            "is_required": True,
            "notes": 'See LAWG 101D1 for course description.',
          },
          {
            "subject": 'LAWG',
            "catalog": '102D1',
            "title": 'Criminal Justice',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '102D2',
            "title": 'Criminal Justice',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '103',
            "title": 'Indigenous Legal Traditions',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '110D1',
            "title": 'Integration Workshop',
            "credits": 1.5,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '110D2',
            "title": 'Integration Workshop',
            "credits": 1.5,
            "is_required": True,
          },
          {
            "subject": 'PUB2',
            "catalog": '101D1',
            "title": 'Constitutional Law',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'PUB2',
            "catalog": '101D2',
            "title": 'Constitutional Law',
            "credits": 3.0,
            "is_required": True,
            "notes": 'See PUB2 101D1 for course description.',
          },
          {
            "subject": 'PUB3',
            "catalog": '116',
            "title": 'Foundations',
            "credits": 3.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'law_bcl_jd_required_second_year',
        "title": 'Required Courses – Second Year (13 credits)',
        "block_type": 'required',
        "credits_needed": 13,
        "constraint_notes": 'The following 13 credits of courses may be taken only in the second year.',
        "notes": 'The following 13 credits of courses may be taken only in the second year.',
        "sort_order": 2,
        "courses": [
          {
            "subject": 'LAWG',
            "catalog": '210',
            "title": 'Legal Ethics and Professionalism',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '220D1',
            "title": 'Property',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LAWG',
            "catalog": '220D2',
            "title": 'Property',
            "credits": 3.0,
            "is_required": True,
            "notes": 'See LAWG 220D1 for description.',
          },
          {
            "subject": 'PROC',
            "catalog": '124',
            "title": 'Judicial Institutions and Civil Procedure',
            "credits": 4.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'law_bcl_jd_required_any_year',
        "title": 'Required Courses – Any Year (1 credit)',
        "block_type": 'required',
        "credits_needed": 1,
        "constraint_notes": 'The following 1 credit course may be taken in any year after completing the first year.',
        "notes": 'The following 1 credit course may be taken in any year after completing the first year.',
        "sort_order": 3,
        "courses": [
          {
            "subject": 'PRAC',
            "catalog": '200',
            "title": 'Advocacy',
            "credits": 1.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'law_bcl_jd_complementary',
        "title": 'Complementary Courses (12 credits)',
        "block_type": 'multi_group',
        "credits_needed": 12,
        "constraint_notes": '3 credits from each of four groups: Civil Law Immersion, Common Law Immersion, Social Diversity/Human Rights/Indigenous Law, and a 4th group not captured in the available catalogue text.',
        "notes": '3 credits from each of four groups: Civil Law Immersion, Common Law Immersion, Social Diversity/Human Rights/Indigenous Law, and a 4th group not captured in the available catalogue text.',
        "sort_order": 4,
      },
      {
        "block_key": 'law_bcl_jd_complementary_civil_law_immersion',
        "title": 'Civil Law Immersion Courses (3 credits)',
        "block_type": 'group',
        "group_name": 'Civil Law Immersion Courses',
        "credits_needed": 3,
        "constraint_notes": '3 credits from the following list of civil law courses.',
        "notes": '3 credits from the following list of civil law courses.',
        "sort_order": 5,
        "courses": [
          {
            "subject": 'BUS2',
            "catalog": '561',
            "title": 'Insurance',
            "credits": 3.0,
            "choose_from_group": 'Civil Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Civil Law Tradition.',
          },
          {
            "subject": 'LAWG',
            "catalog": '506',
            "title": 'Advanced Civil Law Property',
            "credits": 3.0,
            "choose_from_group": 'Civil Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Civil Law Tradition. Not currently offered.',
          },
          {
            "subject": 'PROC',
            "catalog": '200',
            "title": 'Advanced Civil Law Obligations',
            "credits": 3.0,
            "choose_from_group": 'Civil Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Civil Law Tradition.',
          },
          {
            "subject": 'PRV1',
            "catalog": '549',
            "title": 'Contrats nommés/Nominate Contracts',
            "credits": 3.0,
            "choose_from_group": 'Civil Law Immersion Courses',
          },
          {
            "subject": 'PRV2',
            "catalog": '270',
            "title": 'Law of Persons',
            "credits": 3.0,
            "choose_from_group": 'Civil Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Civil Law Tradition. Not currently offered.',
          },
          {
            "subject": 'PRV4',
            "catalog": '548',
            "title": 'Administration Property of Another and Trusts',
            "credits": 3.0,
            "choose_from_group": 'Civil Law Immersion Courses',
          },
        ],
      },
      {
        "block_key": 'law_bcl_jd_complementary_common_law_immersion',
        "title": 'Common Law Immersion Courses (3 credits)',
        "block_type": 'group',
        "group_name": 'Common Law Immersion Courses',
        "credits_needed": 3,
        "constraint_notes": '3 credits from the following list of common law courses.',
        "notes": '3 credits from the following list of common law courses.',
        "sort_order": 6,
        "courses": [
          {
            "subject": 'PRV3',
            "catalog": '200',
            "title": 'Advanced Common Law Obligations',
            "credits": 3.0,
            "choose_from_group": 'Common Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Common Law Tradition.',
          },
          {
            "subject": 'PRV3',
            "catalog": '534',
            "title": 'Remedies',
            "credits": 3.0,
            "choose_from_group": 'Common Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Common Law Tradition.',
          },
          {
            "subject": 'PRV4',
            "catalog": '500',
            "title": 'Restitution',
            "credits": 3.0,
            "choose_from_group": 'Common Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Common Law Tradition. Not currently offered.',
          },
          {
            "subject": 'PRV4',
            "catalog": '549',
            "title": 'Equity and Trusts',
            "credits": 3.0,
            "choose_from_group": 'Common Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Common Law Tradition.',
          },
          {
            "subject": 'PRV5',
            "catalog": '582',
            "title": 'Advanced Torts',
            "credits": 3.0,
            "choose_from_group": 'Common Law Immersion Courses',
            "notes": 'This course provides an opportunity for immersion in the culture, epistemology and practices of the Common Law Tradition.',
          },
        ],
      },
      {
        "block_key": 'law_bcl_jd_complementary_social_diversity',
        "title": 'Social Diversity, Human Rights and Indigenous Law Courses (3 credits)',
        "block_type": 'group',
        "group_name": 'Social Diversity, Human Rights and Indigenous Law Courses',
        "credits_needed": 3,
        "constraint_notes": 'Students must take at least 3 credits from the following courses. List is truncated in the available catalogue text; only partial course list captured.',
        "notes": 'Students must take at least 3 credits from the following courses. List is truncated in the available catalogue text; only partial course list captured.',
        "sort_order": 7,
        "courses": [
          {
            "subject": 'CMPL',
            "catalog": '500',
            "title": 'Indigenous Peoples and the State',
            "credits": 3.0,
            "choose_from_group": 'Social Diversity, Human Rights and Indigenous Law Courses',
          },
          {
            "subject": 'CMPL',
            "catalog": '504',
            "title": 'Feminist Legal Theory',
            "credits": 3.0,
            "choose_from_group": 'Social Diversity, Human Rights and Indigenous Law Courses',
            "notes": 'Not currently offered.',
          },
          {
            "subject": 'CMPL',
            "catalog": '511',
            "title": 'Social Diversity and Law',
            "credits": 3.0,
            "choose_from_group": 'Social Diversity, Human Rights and Indigenous Law Courses',
            "notes": 'Not currently offered.',
          },
          {
            "subject": 'CMPL',
            "catalog": '516',
            "title": 'International Development Law',
            "credits": 3.0,
            "choose_from_group": 'Social Diversity, Human Rights and Indigenous Law Courses',
          },
          {
            "subject": 'CMPL',
            "catalog": '565',
            "title": 'International Humanitarian Law',
            "credits": 3.0,
            "choose_from_group": 'Social Diversity, Human Rights and Indigenous Law Courses',
            "notes": 'Course description truncated in catalogue page. Not currently offered per available text.',
          },
        ],
      },
    ],
  },
]


def seed_degree_requirements(supabase):
    """
    Insert all Faculty of Law (BCL/JD) degree requirements into Supabase.
    Safe to re-run: uses upsert on program_key, then deletes+reinserts blocks.
    """
    inserted_programs = 0
    inserted_blocks = 0
    inserted_courses = 0

    for prog in LAW_PROGRAMS:
        # ── Upsert program ──────────────────────────────────────────
        prog_data = {
            "program_key":   prog["program_key"],
            "name":          prog["name"],
            "faculty":       prog.get("faculty", "Faculty of Law"),
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
                "courses_needed":   block.get("courses_needed"),
                "constraint_notes": constraint_notes,
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
    import os, sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from api.utils.supabase_client import get_supabase
    supabase = get_supabase()
    stats = seed_degree_requirements(supabase)
    print(f"Seeded: {stats['programs']} programs, {stats['blocks']} blocks, {stats['courses']} courses")
