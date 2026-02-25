"""
backend/api/routes/degree_requirements.py

Endpoints for degree requirement programs, blocks, and courses.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from ..utils.supabase_client import get_supabase, with_retry

router = APIRouter()


@router.get("/programs")
def list_programs(
    faculty: Optional[str] = Query(None),
    program_type: Optional[str] = Query(None),  # major, minor, honours
):
    """List all degree programs, optionally filtered."""
    def _fetch():
        supabase = get_supabase()
        q = supabase.table("degree_programs").select("*")
        if faculty:
            q = q.eq("faculty", faculty)
        if program_type:
            q = q.eq("program_type", program_type)
        return q.order("name").execute()

    try:
        result = with_retry("list_programs", _fetch)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/programs/{program_key}")
def get_program(program_key: str):
    """Get full program details including all requirement blocks and courses."""

    # Get program
    def _fetch_program():
        supabase = get_supabase()
        return (
            supabase.table("degree_programs")
            .select("*")
            .eq("program_key", program_key)
            .limit(1)
            .execute()
        )

    try:
        prog_result = with_retry("get_program:program", _fetch_program)
        if not prog_result.data:
            raise HTTPException(status_code=404, detail="Program not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    program = prog_result.data[0]
    prog_id = program["id"]

    # Get blocks
    def _fetch_blocks():
        supabase = get_supabase()
        return (
            supabase.table("requirement_blocks")
            .select("*")
            .eq("program_id", prog_id)
            .order("sort_order")
            .execute()
        )

    try:
        blocks_result = with_retry("get_program:blocks", _fetch_blocks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    blocks = blocks_result.data

    # Get all courses for all blocks at once
    block_ids = [b["id"] for b in blocks]
    if block_ids:
        def _fetch_courses():
            supabase = get_supabase()
            return (
                supabase.table("requirement_courses")
                .select("*")
                .in_("block_id", block_ids)
                .order("sort_order")
                .execute()
            )

        try:
            courses_result = with_retry("get_program:courses", _fetch_courses)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        courses_by_block = {}
        for c in courses_result.data:
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

    def _fetch_program():
        supabase = get_supabase()
        return (
            supabase.table("degree_programs")
            .select("id, name")
            .eq("program_key", program_key)
            .limit(1)
            .execute()
        )

    try:
        prog_result = with_retry("get_recommended:program", _fetch_program)
        if not prog_result.data:
            raise HTTPException(status_code=404, detail="Program not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    prog_id = prog_result.data[0]["id"]

    def _fetch_blocks():
        supabase = get_supabase()
        return (
            supabase.table("requirement_blocks")
            .select("id, title, block_key")
            .eq("program_id", prog_id)
            .execute()
        )

    try:
        blocks_result = with_retry("get_recommended:blocks", _fetch_blocks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    block_ids = [b["id"] for b in blocks_result.data]
    block_map = {b["id"]: b for b in blocks_result.data}

    if not block_ids:
        return []

    def _fetch_courses():
        supabase = get_supabase()
        return (
            supabase.table("requirement_courses")
            .select("*")
            .in_("block_id", block_ids)
            .eq("recommended", True)
            .order("sort_order")
            .execute()
        )

    try:
        courses_result = with_retry("get_recommended:courses", _fetch_courses)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    for c in courses_result.data:
        c["block_title"] = block_map.get(c["block_id"], {}).get("title", "")

    return courses_result.data


@router.post("/seed")
def seed_requirements(faculty: Optional[str] = Query(None, description="arts | engineering | all (default: all)")):
    """
    Seed degree requirements into the database.
    - faculty=arts        → seed only Faculty of Arts programs
    - faculty=engineering → seed only Faculty of Engineering programs
    - faculty=all or omit → seed both
    """
    try:
        supabase = get_supabase()
        results = {}

        run_arts = faculty in (None, "all", "arts")
        run_eng  = faculty in (None, "all", "engineering")

        if run_arts:
            from ..seeds.arts_degree_requirements import seed_degree_requirements as seed_arts
            results["arts"] = seed_arts(supabase)

        if run_eng:
            from ..seeds.engineering_degree_requirements import seed_degree_requirements as seed_eng
            results["engineering"] = seed_eng(supabase)

        return {"success": True, "seeded": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))