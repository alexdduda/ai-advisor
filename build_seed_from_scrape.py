"""
build_seed_from_scrape.py
─────────────────────────
Reads arts_programs_scraped.json (output of scrape_arts_full.py)
and writes backend/api/seeds/arts_degree_requirements.py

Run AFTER scrape_arts_full.py:
  python3 build_seed_from_scrape.py

Preserves all block_type semantics:
  required       → is_required=True on every course
  choose_credits → credits_needed=N, is_required=False
  choose_courses → courses_needed=N, is_required=False
  group          → labeled sub-block inside a multi_group parent
  multi_group    → constraint logged in notes
  pool_group     → constraint logged in notes
"""

import json, re, os, sys

# ── Paths ─────────────────────────────────────────────────────────
SCRAPE_FILE = "arts_programs_scraped.json"
OUT_FILE    = "backend/api/seeds/arts_degree_requirements.py"

def load_scrape():
    if not os.path.exists(SCRAPE_FILE):
        print(f"ERROR: {SCRAPE_FILE} not found. Run scrape_arts_full.py first.")
        sys.exit(1)
    with open(SCRAPE_FILE, encoding='utf-8') as f:
        return json.load(f)

def build_constraint_note(constraints):
    """Build a human-readable notes string from constraints list."""
    parts = []
    for c in constraints:
        ct = c.get('type','')
        if ct == 'multi_group':
            groups = ", ".join(f"{g['credits']}cr from {g['group']}" for g in c['groups'])
            parts.append(f"Group rule: {groups}")
        elif ct == 'pool_group':
            parts.append(f"Pool rule: at least {c['min_credits']} credits from {c['group_text']} combined")
        elif ct == 'max_level_credits':
            parts.append(f"Max {c['max_credits']} credits at {c['level']}-level")
        elif ct == 'min_level_credits':
            parts.append(f"At least {c['min_credits']} credits at {c['level']}-level")
        elif ct == 'max_special_topics':
            parts.append("Max 1 Special Topics course")
        elif ct == 'note':
            # Only keep short notes
            txt = c.get('rule_text','')
            if len(txt) < 200:
                parts.append(txt)
    return " | ".join(parts)

def escape_str(s):
    """Escape a string for Python source embedding."""
    if s is None:
        return 'None'
    return json.dumps(str(s))   # JSON double-quote string, valid Python

def render_course(c, indent=10):
    pad = " " * indent
    subj    = escape_str(c.get('subject',''))
    cat     = escape_str(c.get('catalog',''))
    title   = escape_str(c.get('title',''))
    credits = c.get('credits', 3)
    is_req  = str(bool(c.get('is_required', False)))
    return (f'{pad}{{"subject":{subj},"catalog":{cat},'
            f'"title":{title},"credits":{credits},"is_required":{is_req}}}')

def render_block(b, prog_key, indent=6):
    pad   = " " * indent
    pad2  = " " * (indent + 2)
    pad3  = " " * (indent + 4)

    bkey        = escape_str(b.get('block_key', ''))
    title       = escape_str(b.get('title', ''))
    btype       = escape_str(b.get('block_type', 'choose_credits'))
    group_name  = escape_str(b.get('group_name'))
    credits_n   = b.get('credits_needed')
    courses_n   = b.get('courses_needed')
    notes       = escape_str(b.get('notes', ''))
    sort        = b.get('sort_order', 1)

    credits_str = str(credits_n) if credits_n is not None else 'None'
    courses_str = str(courses_n) if courses_n is not None else 'None'

    courses = b.get('courses', [])
    course_lines = ",\n".join(render_course(c, indent + 4) for c in courses)

    return f"""{pad}{{
{pad2}"block_key": {bkey},
{pad2}"title": {title},
{pad2}"block_type": {btype},
{pad2}"group_name": {group_name},
{pad2}"credits_needed": {credits_str},
{pad2}"courses_needed": {courses_str},
{pad2}"notes": {notes},
{pad2}"sort_order": {sort},
{pad2}"courses": [
{course_lines}
{pad2}],
{pad}}}"""

def render_program(prog):
    key        = escape_str(prog['program_key'])
    name       = escape_str(prog['name'])
    ptype      = escape_str(prog['program_type'])
    faculty    = escape_str(prog.get('faculty', 'Faculty of Arts'))
    total_cr   = prog.get('total_credits') or 'None'
    desc       = escape_str(prog.get('description', ''))
    url        = escape_str(prog.get('ecalendar_url', ''))

    # Constraint note
    constraint_note = build_constraint_note(prog.get('constraints', []))
    constraint_str  = escape_str(constraint_note) if constraint_note else '""'

    blocks = prog.get('blocks', [])
    block_lines = ",\n".join(render_block(b, prog['program_key']) for b in blocks)

    return f"""  {{
    "program_key": {key},
    "name": {name},
    "program_type": {ptype},
    "faculty": {faculty},
    "total_credits": {total_cr},
    "description": {desc},
    "ecalendar_url": {url},
    "constraint_notes": {constraint_str},
    "blocks": [
{block_lines}
    ],
  }}"""

def main():
    data = load_scrape()
    programs = [p for p in data if 'error' not in p]
    failed   = [p['program_key'] for p in data if 'error' in p]

    print(f"Building seed from {len(programs)} programs ({len(failed)} skipped with errors)...")
    if failed:
        print(f"Skipped: {', '.join(failed)}")

    # ── File header ──
    header = '''"""
arts_degree_requirements.py
─────────────────────────────
Auto-generated by build_seed_from_scrape.py
Source: McGill Course Catalogue (coursecatalogue.mcgill.ca)

Block types:
  required       — every course must be taken
  choose_credits — take credits_needed credits from list
  choose_courses — take courses_needed courses from list
  group          — named group (Group A/B/C) feeding a parent rule
  multi_group    — "X credits from Group A AND Y from Group B"
  pool_group     — "at least X credits total from Groups A+B+C combined"
  level_elective — any courses from a given level range
"""

ARTS_PROGRAMS = [
'''

    footer = '''
]


def seed_arts_programs(supabase_client):
    """
    Upsert all Arts programs and their blocks into Supabase.
    Call this from the /api/degree-requirements/seed endpoint.
    """
    from .degree_requirements import seed_program  # local import
    results = []
    for prog in ARTS_PROGRAMS:
        try:
            result = seed_program(supabase_client, prog)
            results.append({"program_key": prog["program_key"], "status": "ok"})
        except Exception as e:
            results.append({"program_key": prog["program_key"], "status": "error", "detail": str(e)})
    return results
'''

    program_strs = ",\n".join(render_program(p) for p in programs)

    output = header + program_strs + footer

    # Ensure output dir exists
    os.makedirs(os.path.dirname(OUT_FILE) or '.', exist_ok=True)
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(output)

    print(f"\n✓ Written → {OUT_FILE}")
    print(f"  {len(programs)} programs, "
          f"{sum(len(p.get('blocks',[])) for p in programs)} blocks, "
          f"{sum(sum(len(b.get('courses',[])) for b in p.get('blocks',[])) for p in programs)} courses")

if __name__ == "__main__":
    main()
