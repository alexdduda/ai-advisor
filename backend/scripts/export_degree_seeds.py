#!/usr/bin/env python3
"""
Regenerate the degree-requirement seed data from production.

WHY THIS EXISTS
---------------
The seed files and the production database drifted badly. Production held ~2100
more course rows than the seeds across 239 of 292 programs, and every seed
function "upserts the program, then deletes+reinserts its blocks" — so running
POST /api/degree-requirements/seed would have destroyed real requirement data
(`traduction_major` 59 course rows -> 3, `east_asian_studies_minor` 56 -> 5).

Production is the source of truth. This script exports it back into the seed
files so a reseed is a no-op rather than a data loss event.

HOW IT WORKS
------------
Each seed module assigns one list literal (ARTS_AREA_STUDIES = [...]). We locate
that assignment with `ast`, then replace *only* its source span. Everything else
in the file — module docstring, imports, the seed_degree_requirements()
function, comments outside the list — is preserved byte for byte.

Comments *inside* a replaced list are lost. That is the accepted cost; the data
they annotated (notes, constraint_notes) lives in the database columns and
survives the round trip.

USAGE
-----
    cd backend && venv/bin/python scripts/export_degree_seeds.py          # write
    cd backend && venv/bin/python scripts/export_degree_seeds.py --check  # dry run

--check exits non-zero if any file would change, so CI can assert the seeds
still match whatever the database holds.
"""
from __future__ import annotations

import argparse
import ast
import collections
import importlib
import os
import pathlib
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SEEDS = pathlib.Path(__file__).resolve().parent.parent / "api" / "seeds"

# module file (in api/seeds) -> the list variable it defines
DATA_MODULES = {
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

# Where a production program lands if no seed file claims it yet.
FACULTY_HOME = {
    "Faculty of Arts": "arts_area_studies",
    "Faculty of Science": "science_degree_requirements_part3",
    "Faculty of Engineering": "engineering_degree_requirements",
    "Desautels Faculty of Management": "management_degree_requirements",
    "Schulich School of Music": "music_degree_requirements",
    "Faculty of Education": "education_degree_requirements",
    "Faculty of Law": "law_degree_requirements",
}
FALLBACK_HOME = "arts_area_studies"

# Field order in the emitted literals. Only keys the seeders actually read.
PROG_FIELDS = ["program_key", "name", "program_type", "faculty",
               "total_credits", "description", "ecalendar_url"]
BLOCK_FIELDS = ["block_key", "title", "block_type", "group_name", "credits_needed",
                "courses_needed", "min_level", "max_credits_200", "min_credits_400",
                "constraint_notes", "notes", "sort_order"]
COURSE_FIELDS = ["subject", "catalog", "title", "credits", "is_required",
                 "choose_from_group", "choose_n_credits", "recommended",
                 "recommendation_reason", "notes"]
# Values equal to these are omitted (they are the seeder's own defaults).
COURSE_DEFAULTS = {"is_required": False, "recommended": False, "credits": None}


def fetch_production():
    from api.utils.supabase_client import get_supabase
    sb = get_supabase()

    def page(table):
        rows, off = [], 0
        while True:
            batch = sb.table(table).select("*").range(off, off + 999).execute().data
            if not batch:
                break
            rows += batch
            off += 1000
            if len(batch) < 1000:
                break
        return rows

    return page("degree_programs"), page("requirement_blocks"), page("requirement_courses")


def lit(v, indent):
    """Render a Python literal with stable, readable formatting."""
    pad = " " * indent
    if isinstance(v, dict):
        if not v:
            return "{}"
        inner = ",\n".join(f'{pad}  "{k}": {lit(val, indent + 2)}' for k, val in v.items())
        return "{\n" + inner + f",\n{pad}}}"
    if isinstance(v, list):
        if not v:
            return "[]"
        inner = ",\n".join(f"{pad}  {lit(x, indent + 2)}" for x in v)
        return "[\n" + inner + f",\n{pad}]"
    return repr(v)


def build_programs(programs, blocks, courses):
    by_prog = collections.defaultdict(list)
    for b in blocks:
        by_prog[b["program_id"]].append(b)
    by_block = collections.defaultdict(list)
    for c in courses:
        by_block[c["block_id"]].append(c)

    out = {}
    for p in programs:
        pd = {k: p.get(k) for k in PROG_FIELDS if p.get(k) not in (None, "")}
        blks = []
        for i, b in enumerate(sorted(by_prog[p["id"]],
                                     key=lambda x: (x.get("sort_order") if x.get("sort_order") is not None else 0,
                                                    x.get("block_key") or ""))):
            bd = {k: b.get(k) for k in BLOCK_FIELDS if b.get(k) not in (None, "")}
            bd.setdefault("block_key", f"block_{i}")
            bd["sort_order"] = b.get("sort_order") if b.get("sort_order") is not None else i
            crs = []
            for c in sorted(by_block[b["id"]],
                            key=lambda x: (x.get("sort_order") if x.get("sort_order") is not None else 0,
                                           x.get("subject") or "", x.get("catalog") or "")):
                cd = {}
                for k in COURSE_FIELDS:
                    val = c.get(k)
                    if val in (None, ""):
                        continue
                    if k in COURSE_DEFAULTS and val == COURSE_DEFAULTS[k]:
                        continue
                    cd[k] = val
                if cd:
                    crs.append(cd)
            if crs:
                bd["courses"] = crs
            blks.append(bd)
        pd["blocks"] = blks
        out[p["program_key"]] = pd
    return out


def current_assignment(path: pathlib.Path, var: str):
    """Return (start_line, end_line) 1-indexed inclusive for `var = [...]`."""
    tree = ast.parse(path.read_text())
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == var for t in node.targets
        ):
            return node.lineno, node.end_lineno
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report drift, write nothing")
    args = ap.parse_args()

    programs, blocks, courses = fetch_production()
    print(f"production: {len(programs)} programs, {len(blocks)} blocks, {len(courses)} courses")
    prod = build_programs(programs, blocks, courses)
    faculty_of = {p["program_key"]: p.get("faculty") for p in programs}

    # Which module currently owns each program_key, preserving existing order.
    owner, order = {}, collections.defaultdict(list)
    for mod, var in DATA_MODULES.items():
        m = importlib.import_module(f"api.seeds.{mod}")
        for p in getattr(m, var, []):
            k = p["program_key"]
            if k in owner:            # arts_degree_requirements re-exports; first wins
                continue
            owner[k] = mod
            order[mod].append(k)

    homeless = [k for k in prod if k not in owner]
    for k in sorted(homeless):
        mod = FACULTY_HOME.get(faculty_of.get(k), FALLBACK_HOME)
        owner[k] = mod
        order[mod].append(k)
        print(f"  + {k} -> {mod} (had no seed home)")

    dropped = [k for k in owner if k not in prod]
    for k in dropped:
        print(f"  - {k} dropped (in seeds, not in production)")

    changed = []
    for mod, var in DATA_MODULES.items():
        keys = [k for k in order[mod] if k in prod]
        path = SEEDS / f"{mod}.py"
        span = current_assignment(path, var)
        if span is None:
            print(f"  ! {mod}: no `{var} = ...` assignment found, skipped")
            continue
        body = ",\n".join("  " + lit(prod[k], 2) for k in keys)
        new_assign = f"{var} = [\n{body},\n]" if keys else f"{var} = []"

        lines = path.read_text().split("\n")
        start, end = span[0] - 1, span[1]
        rebuilt = "\n".join(lines[:start] + new_assign.split("\n") + lines[end:])
        if rebuilt != path.read_text():
            changed.append((mod, len(keys)))
            if not args.check:
                path.write_text(rebuilt)

    verb = "would change" if args.check else "rewrote"
    print(f"\n{verb} {len(changed)} of {len(DATA_MODULES)} data modules")
    for mod, n in changed:
        print(f"   {mod:<44} {n} programs")
    if args.check and changed:
        sys.exit(1)


if __name__ == "__main__":
    main()
