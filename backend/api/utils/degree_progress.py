"""
Server-side degree-progress computation for the AI advisor's prompt grounding.

Why this exists: cards.py and chat.py used to trust a `degree_progress`
string computed CLIENT-SIDE (DegreePlanningView.jsx's calcRingProgress /
progressSummaryText) and passed in the request body. That value only exists
once the student has actually rendered the Degree Planning tab in the
current browser session — if the AI advisor runs before that (the common
case, since Brief cards generate from the Home tab), the prompt's whole
"DEGREE PROGRESS" section was blank, and the model was left to eyeball
completed-vs-total credits from the raw course list alone.

Concretely this produced self-contradictory, wrong numbers: a card claimed
"Anthropology minor is 18/30 credits; completed 18" for a student who had
only completed ANTH 209 (3 credits) toward an 18-credit minor, with the
other 15 credits still registered (not completed) across two future terms.
None of those numbers matched any real combination of the student's data —
the model just made them up because it had nothing to ground on.

This module ports the matching logic from two frontend files so the same
numbers are always available, computed fresh on the backend, regardless of
what the frontend has or hasn't rendered yet:
  - frontend/src/utils/requirementMatch.js       (wildcard/exact course matching)
  - frontend/src/components/Dashboard/DegreePlanningView.jsx
      (toProgramKey, matchTransfer, calcRingProgress)

Scope: covers primary major, primary minor, extra majors, extra minors —
the vast majority of students. Deliberately does NOT replicate the BCom
"core"/concentration tabs or the BASc multi-track "science" split; those
hinge on additional faculty-specific detection (`isMgmt`,
`bascIsMultiTrack`) not ported here. Students in those programs simply get
no grounding for those specific extra tabs — not a regression versus
before this module existed, just not (yet) covered.

Keep this in sync with the two JS files above if their matching rules
change — there is no shared module between the two runtimes.
"""
from __future__ import annotations

import logging
import re
from typing import Optional

from .supabase_client import get_supabase

logger = logging.getLogger(__name__)


# ── toProgramKey (ported from DegreePlanningView.jsx) ──────────────────────

def _fallback_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9_]", "", re.sub(r"\s+", "_", name.lower()))


_DENTISTRY_MAP = {
    'Doctor of Dental Medicine (D.M.D.) – Four-Year Program': 'dmd_dentistry',
    'Dental Preparatory Year (Dent-P)': 'dentp_bsc',
}

_AES_MAP = {
    'Environmental Biology':                       'envbio_bsc_agenvsc',
    'Environmental Biology (Honours)':             'envbio_honours_bsc_agenvsc',
    'Agricultural Economics':                      'agec_bsc_agenvsc',
    'Life Sciences (Biological and Agricultural)': 'lifesci_bsc_agenvsc',
    'Bioresource Engineering':                     'bree_beng',
}

_ENV_MAP = {
    'Ecological Determinants of Health in Society': 'environment_ecological_determinants_ba',
    "Economics and the Earth's Environment":        'environment_economics_earth_ba',
    'Environment and Development':                  'environment_development_ba',
}

_BASC_MAP = {
    'Cognitive Science':                              'cogs_interfaculty',
    'Cognitive Science (Honours)':                    'cogs_honours',
    'Sustainability, Science and Society':             'sss_interfaculty',
    'Sustainability, Science and Society (Honours)':   'sss_honours',
    'Environment':                                     'environment_interfaculty',
    'Environment (Honours)':                            'environment_honours',
}

_SCI_MAP = {
    'Computer Science':                  'cs',
    'Software Engineering':              'software_engineering',
    'Mathematics':                       'mathematics',
    'Statistics':                        'statistics',
    'Applied Mathematics':               'applied_mathematics',
    'Physics':                           'physics',
    'Biology':                           'biology',
    'Chemistry':                         'chemistry',
    'Biochemistry':                      'biochemistry',
    'Neuroscience':                      'neuroscience',
    'Physiology':                        'physiology',
    'Microbiology and Immunology':       'micro_immuno',
    'Earth and Planetary Sciences':      'earth_planetary',
    'Atmospheric and Oceanic Sciences':  'atmos_oceanic',
    'Environmental Science':             'environmental_science',
    'Geography':                         'geography_sci',
}

_MGMT_MAP = {
    'Accounting':                                    'accounting',
    'Finance':                                        'finance',
    'Marketing':                                      'marketing',
    'Business Analytics':                             'business_analytics',
    'Strategic Management':                           'strategic_management',
    'Information Technology Management':               'it_management',
    'Organizational Behaviour and Human Resources':   'ob_hr',
    'International Management':                       'intl_management',
    'Managing for Sustainability':                    'managing_sustainability',
    'Retail Management':                              'retail_management',
    'Economics for Management Students':               'economics_management',
    'Mathematics and Statistics for Management':       'math_stats_management',
    'Investment Management':                          'investment_management',
}

# Arts + Engineering catch-all (same flat map as the JS source's bottom `map`)
_GENERAL_MAP = {
    'Anthropology': 'anthropology',
    'Art History': 'art_history',
    'Economics': 'economics',
    'Political Science': 'political_science',
    'Psychology': 'psychology',
    'Sociology': 'sociology',
    'Linguistics': 'linguistics',
    'History': 'history',
    'Philosophy': 'philosophy',
    'English': 'english_literature',
    'English Literature': 'english_literature',
    'Communication Studies': 'communication_studies',
    'International Development Studies': 'intl_development',
    'International Development': 'intl_development',
    'Gender, Sexuality, Feminist and Social Justice Studies': 'gsfsj',
    'Canadian Studies': 'canadian_studies',
    'Classical Studies': 'classics',
    'Classics': 'classics',
    'Jewish Studies': 'jewish_studies',
    'East Asian Studies': 'east_asian_studies',
    'Geography': 'geography',
    'Computer Science': 'computer_science_arts',
    'Supplemental Computer Science': 'supplemental_computer_science',
    'German Studies': 'german_studies',
    'Hispanic Studies': 'hispanic_studies',
    'Italian Studies': 'italian_studies',
    'Religious Studies': 'religious_studies',
    'African Studies': 'african_studies',
    'Information Studies': 'information_studies',
    'Latin American and Caribbean Studies': 'latin_american_caribbean',
    'Liberal Arts': 'liberal_arts',
    'French': 'french',
    'French Language and Literature': 'french',
    'Cognitive Science': 'cognitive_science',
    'European Literature and Culture': 'european_lit_culture',
    'World Islamic and Middle East Studies': 'world_islamic_middle_east',
    'Science for Arts Students': 'science_for_arts_students',
    'Science for Arts': 'science_for_arts_students',
    'Software Engineering': 'software_engineering_coop',
    'Computer Engineering': 'computer_engineering',
    'Electrical Engineering': 'electrical_engineering',
    'Mechanical Engineering': 'mechanical_engineering',
    'Civil Engineering': 'civil_engineering',
    'Chemical Engineering': 'chemical_engineering',
    'Bioengineering': 'bioengineering',
    'Mining Engineering': 'mining_engineering',
    'Materials Engineering': 'materials_engineering_coop',
}


def to_program_key(name: Optional[str], type_: str = 'major', faculty: str = '') -> Optional[str]:
    """Map a profile major/minor/concentration name to a program_key.

    Faithful port of toProgramKey() in DegreePlanningView.jsx — see that
    function for the authoritative version if the two ever disagree.
    """
    if not name:
        return None
    # Strip trailing degree designators like "(B.A.)", "(B.Sc.)", "(Honours)"
    stripped = re.sub(r"\s*\([^)]+\)\s*$", "", name).strip()
    name = stripped or name

    fl = (faculty or '').lower()
    is_sci = 'science' in fl and 'arts & science' not in fl and 'arts and science' not in fl
    is_basc = 'arts & science' in fl or 'arts and science' in fl
    is_env = 'environment' in fl or 'bieler' in fl
    is_law = 'faculty of law' in fl or fl == 'law'
    is_aes = 'agricultural and environmental' in fl or 'agri-env' in fl or fl == 'aes'
    is_dentistry = 'dental medicine' in fl or 'dentistry' in fl

    if is_law:
        return 'law_bcl_jd'

    if is_dentistry:
        if name in _DENTISTRY_MAP:
            return _DENTISTRY_MAP[name]
        return 'dmd_dentistry'

    if is_aes:
        if name in _AES_MAP:
            return _AES_MAP[name]
        if type_ == 'honours':
            return 'envbio_honours_bsc_agenvsc'

    if is_env:
        if name in _ENV_MAP:
            return _ENV_MAP[name]
        if type_ == 'minor':
            return 'environment_minor_ba'
        if type_ == 'diploma':
            return 'environment_diploma'

    if is_basc:
        if name in _BASC_MAP:
            return f"{_BASC_MAP[name]}_basc"
        # Fall through to arts/science maps for multi-track

    if is_sci:
        slug = _SCI_MAP.get(name) or _fallback_slug(name)
        return f"{slug}_{type_}_bsc"

    if 'management' in fl or 'desautels' in fl:
        slug = _MGMT_MAP.get(name) or _fallback_slug(name)
        if type_ == 'honours':
            return f"{slug}_honours_bcom"
        if type_ == 'concentration':
            return f"{slug}_concentration_bcom"
        return f"{slug}_major_bcom"

    slug = _GENERAL_MAP.get(name) or _fallback_slug(name)
    return f"{slug}_{type_}"


# ── requirementMatch.js port ────────────────────────────────────────────────

def _key_of(subject: str, catalog) -> str:
    return f"{subject or ''} {catalog or ''}".upper()


def wildcard_band(req: dict) -> Optional[dict]:
    """If `req` is a wildcard placeholder ("Any 200-level X course"), return
    {subject, min, max}; else None. Port of wildcardBand() in requirementMatch.js."""
    if not req:
        return None
    title = (req.get('title') or '').lower()
    looks_wild = bool(re.search(r'\bany\b', title)) and bool(re.search(r'level', title))
    if not looks_wild:
        return None

    subject = (req.get('subject') or '').upper()
    if not subject:
        return None

    m = re.search(r'(\d{3})\s*\+', title)
    if m:
        return {'subject': subject, 'min': int(m.group(1)), 'max': float('inf')}

    m = re.search(r'(\d{3})\s*-?\s*level', title)
    if m:
        lvl = int(m.group(1))
        return {'subject': subject, 'min': lvl, 'max': lvl + 99}

    if re.search(r'upper[\s-]*level', title):
        return {'subject': subject, 'min': 300, 'max': float('inf')}

    try:
        cat = int(req.get('catalog'))
        if cat % 100 == 0:
            return {'subject': subject, 'min': cat, 'max': cat + 99}
    except (TypeError, ValueError):
        pass
    return None


def explicitly_claimed_course_keys(blocks: list) -> set:
    """Every course code appearing as a real (non-wildcard) requirement row
    anywhere in a program's blocks. Port of explicitlyClaimedCourseKeys()."""
    claimed = set()
    for block in blocks or []:
        for c in (block or {}).get('courses') or []:
            if not c.get('catalog') or wildcard_band(c):
                continue
            claimed.add(_key_of(c.get('subject'), c.get('catalog')))
    return claimed


def block_wildcard_matches(block: dict, user_courses: list, exclude_keys: Optional[set] = None) -> list:
    """Return the user courses that satisfy a block's *wildcard* portion.
    Port of blockWildcardMatches()."""
    courses = (block or {}).get('courses') or []
    bands = [b for b in (wildcard_band(c) for c in courses) if b]
    min_level = (block or {}).get('min_level') or 0
    legacy_applies = any(not c.get('catalog') for c in courses) or min_level > 0
    if not legacy_applies and not bands:
        return []

    block_subjects = {(c.get('subject') or '').upper() for c in courses if c.get('subject')}

    out = []
    for uc in user_courses:
        key = _key_of(uc.get('subject'), uc.get('catalog'))
        if exclude_keys and key in exclude_keys:
            continue
        uc_subj = (uc.get('subject') or '').upper()
        try:
            uc_lvl = int(uc.get('catalog'))
        except (TypeError, ValueError):
            uc_lvl = None
        in_band = any(
            b['subject'] == uc_subj and uc_lvl is not None and b['min'] <= uc_lvl <= b['max']
            for b in bands
        )
        in_legacy = legacy_applies and uc_subj in block_subjects
        if in_legacy and min_level > 0 and (uc_lvl is None or uc_lvl < min_level):
            in_legacy = False
        if in_band or in_legacy:
            out.append(uc)
    return out


# ── matchTransfer (ported from DegreePlanningView.jsx) ─────────────────────

def _normalize_code(code: str) -> str:
    code = (code or '').upper()
    code = re.sub(r'([A-Z])(\d)', r'\1 \2', code)
    code = re.sub(r'\s+', ' ', code).strip()
    return code


def match_transfer(req: dict, advanced_standing: list) -> bool:
    if not req.get('catalog'):
        return False
    key = _normalize_code(f"{req.get('subject')} {req.get('catalog')}")
    return any(_normalize_code(t.get('course_code')) == key for t in (advanced_standing or []))


# ── calcRingProgress (ported from DegreePlanningView.jsx) ──────────────────

def calc_ring_progress(
    prog: Optional[dict],
    completed_courses: list,
    advanced_standing: list,
    course_allocations: dict,
    overlap_keys: set,
) -> dict:
    """Returns {pct, earned, total} for one program. Port of calcRingProgress()."""
    if not prog:
        return {'pct': 0, 'earned': 0, 'total': 36}
    prog_key = prog.get('program_key')
    total = prog.get('total_credits') or 36
    blocks = prog.get('blocks') or []
    claims = explicitly_claimed_course_keys(blocks)

    earned = 0.0
    seen_db = set()
    seen_user = set()

    # Phase 1: exact matches (transfer excluded, in-progress excluded)
    for b in blocks:
        for c in (b or {}).get('courses') or []:
            if not c.get('catalog'):
                continue
            key = _key_of(c.get('subject'), c.get('catalog'))
            if key in seen_db:
                continue
            seen_db.add(key)
            if match_transfer(c, advanced_standing):
                continue
            if key in overlap_keys and course_allocations.get(key) and course_allocations[key] != prog_key:
                continue
            uc = next(
                (u for u in completed_courses if _key_of(u.get('subject'), u.get('catalog')) == key),
                None,
            )
            if uc:
                earned += float(uc.get('credits') or c.get('credits') or 3)
                seen_user.add(key)

    # Phase 2: wildcard blocks, capped at each block's credit need
    for b in blocks:
        needed = (b or {}).get('credits_needed')
        needed = needed if needed is not None else float('inf')
        got = 0.0
        for uc in block_wildcard_matches(b, completed_courses, claims):
            if got >= needed:
                break
            uc_key = _key_of(uc.get('subject'), uc.get('catalog'))
            if uc_key in seen_db or uc_key in seen_user:
                continue
            if uc_key in overlap_keys and course_allocations.get(uc_key) and course_allocations[uc_key] != prog_key:
                continue
            credits = float(uc.get('credits') or 3)
            earned += credits
            got += credits
            seen_user.add(uc_key)

    # Phase 3: courses manually assigned to this program from the Electives tab
    completed_keys = {_key_of(u.get('subject'), u.get('catalog')) for u in completed_courses}
    for uc in completed_courses:
        uc_key = _key_of(uc.get('subject'), uc.get('catalog'))
        if uc_key in seen_user or uc_key not in completed_keys:
            continue
        if match_transfer(uc, advanced_standing):
            continue
        if course_allocations.get(uc_key) == prog_key:
            earned += float(uc.get('credits') or 3)
            seen_user.add(uc_key)

    pct = min(100, round((earned / total) * 100)) if total else 0
    return {'pct': pct, 'earned': earned, 'total': total}


# ── DB fetch + top-level entry point ────────────────────────────────────────

def _fetch_program(program_key: str) -> Optional[dict]:
    """Same 3-query shape as GET /programs/{program_key} in degree_requirements.py."""
    try:
        sb = get_supabase()
        prog_result = (
            sb.table('degree_programs').select('*').eq('program_key', program_key).limit(1).execute()
        )
        if not prog_result.data:
            return None
        program = prog_result.data[0]
        prog_id = program['id']

        blocks = (
            sb.table('requirement_blocks').select('*').eq('program_id', prog_id)
            .order('sort_order').execute().data or []
        )
        block_ids = [b['id'] for b in blocks]
        courses_by_block: dict = {}
        if block_ids:
            courses_data = (
                sb.table('requirement_courses')
                .select('id, block_id, subject, catalog, title, credits, is_required, notes')
                .in_('block_id', block_ids).order('sort_order').execute().data or []
            )
            for c in courses_data:
                courses_by_block.setdefault(c['block_id'], []).append(c)
        for block in blocks:
            block['courses'] = courses_by_block.get(block['id'], [])
        program['blocks'] = blocks
        return program
    except Exception as exc:
        logger.warning("degree_progress: failed to fetch program %s: %s", program_key, type(exc).__name__)
        return None


def compute_degree_progress_summary(user: dict, completed_courses: list, user_id: str) -> str:
    """Server-side equivalent of DegreePlanningView.jsx's progressSummaryText.

    Returns a string like:
      "Computer Science: 67% complete (24/36 credits)
       Anthropology: 17% complete (3/18 credits)"
    or "" if the student has no major/minor set (nothing to report).

    Always computed fresh — does not depend on the frontend having rendered
    the Degree Planning tab this session.
    """
    faculty = user.get('faculty') or ''
    major = user.get('major')
    minor = user.get('minor')
    other_majors = [m for m in (user.get('other_majors') or []) if m]
    other_minors = [m for m in (user.get('other_minors') or []) if m]
    advanced_standing = user.get('advanced_standing') or []

    is_basc = faculty == 'Bachelor of Arts and Science'
    major_faculty = 'Faculty of Arts & Science' if is_basc else faculty

    major_key = to_program_key(major, 'major', major_faculty)
    minor_key = to_program_key(minor, 'minor', faculty)
    extra_major_keys = [(m, to_program_key(m, 'major', faculty)) for m in other_majors]
    extra_major_keys = [(m, k) for m, k in extra_major_keys if k and k != major_key]
    extra_minor_keys = [(m, to_program_key(m, 'minor', faculty)) for m in other_minors]
    extra_minor_keys = [(m, k) for m, k in extra_minor_keys if k and k != minor_key]

    tabs = []
    if major_key:
        tabs.append((major, major_key))
    tabs.extend(extra_major_keys)
    if minor_key:
        tabs.append((minor, minor_key))
    tabs.extend(extra_minor_keys)

    if not tabs:
        return ""

    programs = {key: _fetch_program(key) for _, key in tabs}

    # course_allocations: user's manual elective→program assignments
    course_allocations: dict = {}
    try:
        rows = (
            get_supabase().table('course_allocations')
            .select('course_code, program_key').eq('user_id', user_id).execute().data or []
        )
        course_allocations = {r['course_code']: r['program_key'] for r in rows}
    except Exception as exc:
        logger.warning("degree_progress: failed to fetch course_allocations: %s", type(exc).__name__)

    # overlap_keys: course codes appearing in 2+ of the student's programs
    counts: dict = {}
    for prog in programs.values():
        if not prog:
            continue
        for b in prog.get('blocks') or []:
            for c in (b or {}).get('courses') or []:
                if not c.get('catalog'):
                    continue
                key = _key_of(c.get('subject'), c.get('catalog'))
                counts[key] = counts.get(key, 0) + 1
    overlap_keys = {k for k, n in counts.items() if n > 1}

    lines = []
    for label, key in tabs:
        prog = programs.get(key)
        if not prog:
            continue
        r = calc_ring_progress(prog, completed_courses, advanced_standing, course_allocations, overlap_keys)
        earned = r['earned']
        earned_str = str(int(earned)) if earned == int(earned) else str(earned)
        lines.append(f"{label}: {r['pct']}% complete ({earned_str}/{r['total']} credits)")

    return "\n".join(lines)
