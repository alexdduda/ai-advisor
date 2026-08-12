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

# Floor, not a target: a drop below this means someone shrank the seeds again.
#
# Moved from 8760 by two verified corrections against McGill:
#   Economics for Management  -7 courses  (its Complementary block is published
#       as a rule — "other 200-, 300- and 400-level ECON courses, excluding
#       those below 210" — not a list, so 8 hand-picked rows became one
#       `ECON 210+` wildcard)
#   International Management  +6 courses, +2 blocks (rebuilt to the catalogue:
#       BUSA 356 required, the 17-course International Business Component, and
#       placeholder blocks for the external minor and language/experiential
#       requirements McGill does not enumerate)
#   bcom_core_economics       +1 program, +1 block, +12 courses (the Management
#       Core as it applies to the Economics major — 36 credits over 12 courses,
#       without MGCR 293/294)
# Raise this floor deliberately when a verified correction changes it — never
# lower it to make a failing run pass.
MIN_PROGRAMS, MIN_BLOCKS, MIN_COURSES = 300, 1234, 8771


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


class TestBComProgramKeys:
    """Every B.Com. major the profile UI offers must resolve to a seeded program.

    toProgramKey() in DegreePlanningView.jsx builds a program_key from the
    student's major name via a slug map, then fetches it. Two slugs did not
    match anything seeded — 'ob_hr' and 'intl_management' produced
    ob_hr_major_bcom and intl_management_major_bcom, where the real keys are
    organizational_behaviour_hr_major_bcom and
    international_management_major_bcom. Students in those two majors got a 404
    and a completely empty requirements tab, silently.

    This mirrors the slug map so a future rename breaks a test instead of a
    student's degree plan.
    """

    # Mirrors mgmtSlugMap in DegreePlanningView.jsx
    SLUGS = {
        'Accounting': 'accounting',
        'Finance': 'finance',
        'Marketing': 'marketing',
        'Business Analytics': 'business_analytics',
        'Strategic Management': 'strategic_management',
        'Information Technology Management': 'it_management',
        'Organizational Behaviour and Human Resources': 'organizational_behaviour_hr',
        'International Management': 'international_management',
        'Managing for Sustainability': 'managing_sustainability',
        'Retail Management': 'retail_management',
        'Economics for Management Students': 'economics_management',
        'Mathematics and Statistics for Management': 'math_stats_management',
    }

    def _keys(self):
        import importlib
        m = importlib.import_module('api.seeds.management_degree_requirements')
        return {p['program_key'] for p in m.MANAGEMENT_PROGRAMS}

    def test_every_major_slug_resolves(self):
        keys = self._keys()
        missing = {n: f'{s}_major_bcom' for n, s in self.SLUGS.items()
                   if f'{s}_major_bcom' not in keys}
        assert not missing, f'B.Com. majors with no seeded program: {missing}'

    def test_core_and_its_economics_variant_both_exist(self):
        keys = self._keys()
        assert 'bcom_core' in keys
        assert 'bcom_core_economics' in keys

    def test_economics_reconciles_with_mcgill(self):
        """36-credit Core + 33-credit major = the 69 McGill publishes."""
        import importlib
        m = importlib.import_module('api.seeds.management_degree_requirements')
        by = {p['program_key']: p for p in m.MANAGEMENT_PROGRAMS}
        assert by['bcom_core_economics']['total_credits'] == 36
        assert by['economics_management_major_bcom']['total_credits'] == 33
        assert (by['bcom_core_economics']['total_credits']
                + by['economics_management_major_bcom']['total_credits']) == 69

    def test_standard_majors_reconcile_on_the_42_credit_core(self):
        import importlib
        m = importlib.import_module('api.seeds.management_degree_requirements')
        by = {p['program_key']: p for p in m.MANAGEMENT_PROGRAMS}
        core = by['bcom_core']['total_credits']
        assert core == 42
        for k in ('marketing_major_bcom', 'accounting_major_bcom', 'finance_major_bcom'):
            assert core + by[k]['total_credits'] == 72, k

    def test_economics_core_omits_the_substituted_courses(self):
        import importlib
        m = importlib.import_module('api.seeds.management_degree_requirements')
        by = {p['program_key']: p for p in m.MANAGEMENT_PROGRAMS}
        codes = {f"{c['subject']} {c['catalog']}"
                 for b in by['bcom_core_economics']['blocks']
                 for c in (b.get('courses') or [])}
        # ECON 230D1/D2 replaces MGCR 293; ECON 332 + 333 replace MGCR 294
        assert 'MGCR 293' not in codes
        assert 'MGCR 294' not in codes
        assert 'MGCR 211' in codes and len(codes) == 12


class TestHonoursProgramKeys:
    """Honours students must land on an honours program that exists.

    profile.is_honours was collected but never read by DegreePlanningView, so
    majorKey was always built with type 'major' and someone in Honours Physics
    saw the Physics Major requirements — different courses, different total.

    toProgramKey has always understood type 'honours'; nothing passed it. Now it
    does, with the plain major key kept as a fallback for majors that have no
    honours variant. These tests mirror the suffix rules so a rename breaks here
    rather than in a student's plan.
    """

    def _keys(self):
        import importlib
        keys = set()
        for mod, var in MODULES.items():
            m = importlib.import_module(f'api.seeds.{mod}')
            keys |= {p['program_key'] for p in getattr(m, var)}
        return keys

    def test_honours_keys_exist_for_the_faculties_that_use_them(self):
        keys = self._keys()
        # (slug, suffix) mirroring toProgramKey: science -> _honours_bsc,
        # arts/general -> _honours, management -> _honours_bcom
        expected = [
            'physics_honours_bsc',                  # a real is_honours user
            'history_honours',                      # a real is_honours user
            'cs_honours_bsc',
            'anthropology_honours',
            'investment_management_honours_bcom',
        ]
        missing = [k for k in expected if k not in keys]
        assert not missing, f'honours programs the UI would request but that do not exist: {missing}'

    def test_a_major_without_an_honours_variant_still_has_its_major(self):
        """The fallback target must exist, or turning on is_honours would send
        the student to a tab with nothing in it."""
        keys = self._keys()
        assert 'retail_management_honours_bcom' not in keys   # no honours variant
        assert 'retail_management_major_bcom' in keys          # so the fallback resolves

    def test_investment_management_exists_only_as_honours(self):
        """Why the fallback is one-directional: there is no Investment
        Management *major*, so a student in it must mark is_honours."""
        keys = self._keys()
        assert 'investment_management_honours_bcom' in keys
        assert 'investment_management_major_bcom' not in keys
