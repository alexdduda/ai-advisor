#!/usr/bin/env python3
"""
course_search_diagnostic.py

Run this from the backend/ directory to audit your course search data.
It tests the Supabase connection, checks for common data issues in the
courses table, and prints a summary report.

Usage:
    cd backend
    python course_search_diagnostic.py
"""

import os
import sys
from collections import Counter, defaultdict

# Allow imports from the api package
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from api.utils.supabase_client import get_supabase

def run_diagnostic():
    print("=" * 60)
    print("COURSE SEARCH DIAGNOSTIC")
    print("=" * 60)

    supabase = get_supabase()

    # ── 1. Total row count ───────────────────────────────────────
    print("\n[1] Total rows in courses table...")
    result = supabase.table("courses").select("Course", count="exact").execute()
    total = result.count
    print(f"    Total rows: {total:,}")

    # ── 2. Sample a few rows to check column names ───────────────
    print("\n[2] Checking column structure (first 3 rows)...")
    sample = supabase.table("courses").select("*").limit(3).execute()
    if sample.data:
        cols = list(sample.data[0].keys())
        print(f"    Columns: {cols}")
    else:
        print("    ERROR: No data returned at all!")
        return

    # ── 3. Check for null Course codes ───────────────────────────
    print("\n[3] Checking for null/empty Course codes...")
    null_result = supabase.table("courses").select("Course").is_("Course", "null").execute()
    null_count = len(null_result.data)
    print(f"    Rows with null Course: {null_count}")

    # ── 4. Spot-check common courses ─────────────────────────────
    print("\n[4] Spot-checking common courses (COMP 202, MATH 240, BIOL 112)...")
    test_courses = [("COMP", "202"), ("MATH", "240"), ("BIOL", "112"), ("CHEM", "110"), ("PSYC", "100")]
    for subject, catalog in test_courses:
        code = f"{subject}{catalog}"
        r = supabase.table("courses").select("Course", count="exact").eq("Course", code).execute()
        count = r.count or 0
        status = "✓" if count > 0 else "✗ MISSING"
        print(f"    {code}: {count} sections  {status}")

    # ── 5. RMP data coverage ─────────────────────────────────────
    print("\n[5] RateMyProfessor data coverage...")
    rmp_result = supabase.table("courses").select("rmp_rating").not_.is_("rmp_rating", "null").execute()
    rmp_count = len(rmp_result.data) if rmp_result.data else 0
    rmp_pct = (rmp_count / total * 100) if total else 0
    print(f"    Rows with RMP rating: {rmp_count:,} / {total:,} ({rmp_pct:.1f}%)")

    # ── 6. Check for negative/sentinel RMP values ────────────────
    print("\n[6] Checking for sentinel RMP values (rmp_rating = -1 or 0)...")
    sentinel = supabase.table("courses").select("Course").lte("rmp_rating", 0).not_.is_("rmp_rating", "null").execute()
    sentinel_count = len(sentinel.data) if sentinel.data else 0
    print(f"    Rows with rmp_rating <= 0: {sentinel_count:,}")
    if sentinel_count > 0:
        print("    ⚠  These are likely placeholder -1.0 values from the CSV.")
        print("       Consider treating rmp_rating <= 0 as NULL in the search query.")

    # ── 7. Check average/grade data ──────────────────────────────
    print("\n[7] Grade average coverage...")
    avg_result = supabase.table("courses").select('"Class Ave"').not_.is_('"Class Ave"', "null").execute()
    avg_count = len(avg_result.data) if avg_result.data else 0
    avg_pct = (avg_count / total * 100) if total else 0
    print(f"    Rows with Class Ave: {avg_count:,} / {total:,} ({avg_pct:.1f}%)")

    # ── 8. Unique subject codes ───────────────────────────────────
    print("\n[8] Unique subject codes (first 20)...")
    subj_result = supabase.table("courses").select("Course").execute()
    if subj_result.data:
        subjects = set()
        for row in subj_result.data:
            course = row.get("Course", "")
            if course:
                # Extract alphabetic prefix
                subj = ''.join(c for c in course if c.isalpha())
                subjects.add(subj)
        sorted_subj = sorted(subjects)
        print(f"    Total unique subjects: {len(sorted_subj)}")
        print(f"    Sample: {sorted_subj[:20]}")

    # ── 9. Check Term Name format ─────────────────────────────────
    print("\n[9] Term Name format check (sample of distinct values)...")
    term_result = supabase.table("courses").select('"Term Name"').limit(500).execute()
    if term_result.data:
        terms = Counter(r.get("Term Name") for r in term_result.data)
        print(f"    Sample terms: {dict(list(terms.most_common(10)))}")

    # ── Summary ──────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total rows:          {total:,}")
    print(f"  RMP coverage:        {rmp_pct:.1f}%")
    print(f"  Grade avg coverage:  {avg_pct:.1f}%")
    print(f"  Sentinel RMP rows:   {sentinel_count:,}")
    if sentinel_count > 5000:
        print("  ⚠  High sentinel count — update courses.py to filter rmp_rating > 0")
    if avg_pct < 50:
        print("  ⚠  Low grade average coverage — check CSV import")
    print("\nDone.")


if __name__ == "__main__":
    run_diagnostic()