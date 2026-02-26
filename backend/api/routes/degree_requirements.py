"""
backend/api/routes/degree_requirements.py

Endpoints for degree requirement programs, blocks, and courses.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from ..config import settings
from ..utils.supabase_client import get_supabase, with_retry

router = APIRouter()


@router.get("/programs")
def list_programs(
    faculty: Optional[str] = Query(None),
    program_type: Optional[str] = Query(None),  # major, minor, honours
):
    """List all degree programs, optionally filtered."""
    def _run():
        supabase = get_supabase()
        q = supabase.table("degree_programs").select("*")
        if faculty:
            q = q.eq("faculty", faculty)
        if program_type:
            q = q.eq("program_type", program_type)
        return q.order("name").execute().data

    try:
        return with_retry("list_programs", _run)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/programs/{program_key}")
def get_program(program_key: str):
    """Get full program details including all requirement blocks and courses."""

    # 1 — Fetch program row
    def _get_prog():
        supabase = get_supabase()
        result = (
            supabase.table("degree_programs")
            .select("*")
            .eq("program_key", program_key)
            .limit(1)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Program not found")
        return result.data[0]

    try:
        program = with_retry("get_program:prog", _get_prog)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Program not found")

    prog_id = program["id"]

    # 2 — Fetch requirement blocks
    def _get_blocks():
        supabase = get_supabase()
        return (
            supabase.table("requirement_blocks")
            .select("*")
            .eq("program_id", prog_id)
            .order("sort_order")
            .execute()
            .data
        )

    try:
        blocks = with_retry("get_program:blocks", _get_blocks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 3 — Fetch all courses for every block in one query
    block_ids = [b["id"] for b in blocks]
    if block_ids:
        def _get_courses():
            supabase = get_supabase()
            return (
                supabase.table("requirement_courses")
                .select("*")
                .in_("block_id", block_ids)
                .order("sort_order")
                .execute()
                .data
            )

        try:
            courses_data = with_retry("get_program:courses", _get_courses)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        courses_by_block = {}
        for c in courses_data:
            courses_by_block.setdefault(c["block_id"], []).append(c)
    else:
        courses_by_block = {}

    # Attach courses to blocks
    for block in blocks:
        block["courses"] = courses_by_block.get(block["id"], [])

    program["blocks"] = blocks
    return program


@router.get("/programs/{program_key}/recommended")
def get_recommended_courses(program_key: str):
    """Return only recommended courses for a program with reasons."""

    def _run():
        supabase = get_supabase()
        prog_result = (
            supabase.table("degree_programs")
            .select("id")
            .eq("program_key", program_key)
            .limit(1)
            .execute()
        )
        if not prog_result.data:
            raise HTTPException(status_code=404, detail="Program not found")
        prog_id = prog_result.data[0]["id"]

        blocks_result = (
            supabase.table("requirement_blocks")
            .select("id, name")
            .eq("program_id", prog_id)
            .execute()
        )
        block_ids = [b["id"] for b in blocks_result.data]
        if not block_ids:
            return []

        courses_result = (
            supabase.table("requirement_courses")
            .select("subject, catalog, title, credits, recommendation_reason, block_id")
            .in_("block_id", block_ids)
            .eq("recommended", True)
            .execute()
        )
        block_names = {b["id"]: b["name"] for b in blocks_result.data}
        recs = []
        for c in courses_result.data:
            recs.append({
                **c,
                "block_name": block_names.get(c["block_id"], ""),
            })
        return recs

    try:
        return with_retry("get_recommended_courses", _run)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seed")
def seed_requirements(
    faculty: Optional[str] = Query(
        None,
        description="arts | science | engineering | arts_science | management | education | all (default: all)"

    )
):
    """
    Seed degree requirement programs into the database.
    Delegates to each faculty seed file which handles the correct schema.
    """
    def _run():
        supabase = get_supabase()
        results = {}

        run_arts       = faculty in (None, "all", "arts")
        run_sci        = faculty in (None, "all", "science")
        run_eng        = faculty in (None, "all", "engineering")
        run_arts_sci   = faculty in (None, "all", "arts_science")
        run_management = faculty in (None, "all", "management")
        run_education  = faculty in (None, "all", "education")

        if run_arts:
            from ..seeds.arts_degree_requirements import seed_degree_requirements as seed_arts
            results["arts"] = seed_arts(supabase)

        if run_eng:
            from ..seeds.engineering_degree_requirements import seed_degree_requirements as seed_eng
            results["engineering"] = seed_eng(supabase)

        if run_sci:
            from ..seeds.science_degree_requirements import seed_degree_requirements as seed_sci
            results["science"] = seed_sci(supabase)

        if run_arts_sci:
            from ..seeds.arts_science_degree_requirements import seed_degree_requirements as seed_basc
            results["arts_science"] = seed_basc(supabase)

        if run_management:
            from ..seeds.management_degree_requirements import seed_degree_requirements as seed_mgmt
            results["management"] = seed_mgmt(supabase)

        if run_education:
            from ..seeds.education_degree_requirements import seed_degree_requirements as seed_edu
            results["education"] = seed_edu(supabase)

        return {"success": True, "seeded": results}

    try:
        return with_retry("seed_requirements", _run)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
