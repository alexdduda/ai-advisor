"""
Structural guarantees for the degree-requirement seeds.

These exist because the seeds and production drifted far enough apart that
running POST /api/degree-requirements/seed would have DESTROYED real data:
production held ~2100 more course rows than the seeds across 239 of 292
programs, and every seed fn "upserts the program, then deletes+reinserts its
blocks" (traduction_major would have gone from 59 course rows to 3).

The seeds are now generated from production by scripts/export_degree_seeds.py.
These tests can't reach the database, so they pin the structural invariants
that make such a regression obvious locally and in CI.
"""
import collections
import importlib

import pytest

MODULES = {
    "arts_social_sciences": "ARTS_SOCIAL_SCIENCES",
    "arts_humanities": "ARTS_HUMANITIES",
    "arts_area_studies": "ARTS_AREA_STUDIES",
    "arts_honours": "ARTS_HONOURS",
    "arts_languages_specialty": "ARTS_LANGUAGES_SPECIALTY",
    "arts_math_stats_env": "ARTS_MATH_STATS_ENV",
    "science_degree_requirements": "SCIENCE_PROGRAMS",
    "science_degree_requirements_part2": "SCIENCE_PROGRAMS_PART2",
    "science_degree_requirements_part3": "SCIENCE_PROGRAMS_PART3",
    "engineering_degree_requirements": "ENGINEERING_PROGRAMS",
    "arts_science_degree_requirements": "ARTS_SCIENCE_PROGRAMS",
    "management_degree_requirements": "MANAGEMENT_PROGRAMS",
    "education_degree_requirements": "EDUCATION_PROGRAMS",
    "environment_degree_requirements": "ENVIRONMENT_PROGRAMS",
    "law_degree_requirements": "LAW_PROGRAMS",
    "aes_degree_requirements": "AES_PROGRAMS",
    "dentistry_degree_requirements": "DENTISTRY_PROGRAMS",
    "medicine_degree_requirements": "MEDICINE_PROGRAMS",
    "music_degree_requirements": "MUSIC_PROGRAMS",
    "nursing_degree_requirements": "NURSING_PROGRAMS",
    "spot_degree_requirements": "SPOT_PROGRAMS",
    "foundation_degree_requirements": "FOUNDATION_PROGRAMS",
}

# Production had 299 programs / 1231 blocks / 8760 courses when the seeds were
# generated. A large drop means someone shrank the seeds again.
MIN_PROGRAMS, MIN_BLOCKS, MIN_COURSES = 299, 1231, 8760


def all_programs():
    out = []
    for mod, var in MODULES.items():
        m = importlib.import_module(f"api.seeds.{mod}")
        out += [(mod, p) for p in getattr(m, var)]
    return out


@pytest.fixture(scope="module")
def programs():
    return all_programs()


def test_every_module_still_defines_its_list():
    for mod, var in MODULES.items():
        m = importlib.import_module(f"api.seeds.{mod}")
        assert isinstance(getattr(m, var, None), list), f"{mod}.{var} missing"


def test_no_duplicate_program_keys(programs):
    counts = collections.Counter(p["program_key"] for _, p in programs)
    dupes = {k: n for k, n in counts.items() if n > 1}
    assert not dupes, f"duplicate program_key across seed modules: {dupes}"


def test_seed_volume_has_not_shrunk(programs):
    """The regression that started all this was the seeds being far thinner
    than production. Fail loudly rather than silently deleting rows."""
    blocks = sum(len(p.get("blocks") or []) for _, p in programs)
    courses = sum(len(b.get("courses") or [])
                  for _, p in programs for b in (p.get("blocks") or []))
    assert len(programs) >= MIN_PROGRAMS, f"programs shrank to {len(programs)}"
    assert blocks >= MIN_BLOCKS, f"blocks shrank to {blocks}"
    assert courses >= MIN_COURSES, f"courses shrank to {courses}"


def test_required_program_fields_present(programs):
    for mod, p in programs:
        for f in ("program_key", "name", "program_type", "faculty"):
            assert p.get(f), f"{mod}:{p.get('program_key')} missing {f}"
        # faculty is NOT NULL in degree_programs — a null here 500s the seed run
        assert isinstance(p["faculty"], str) and p["faculty"].strip()


def test_blocks_carry_a_block_key(programs):
    """block_key is NOT NULL in requirement_blocks."""
    for mod, p in programs:
        for b in p.get("blocks") or []:
            assert b.get("block_key"), f"{mod}:{p['program_key']} block missing block_key"


def test_courses_are_identifiable(programs):
    """Every course row needs a subject OR a title.

    Not every row has a subject, and that is legitimate: agec_bsc_agenvsc
    carries adviser-approved placeholders like "Introductory Statistics Course"
    with no subject or catalog at all. What is never acceptable is a row with
    neither — nothing could match it and nothing could render it.
    """
    for mod, p in programs:
        for b in p.get("blocks") or []:
            for c in b.get("courses") or []:
                assert c.get("subject") or c.get("title"), (
                    f"{mod}:{p['program_key']} has an unidentifiable course row: {c}"
                )
