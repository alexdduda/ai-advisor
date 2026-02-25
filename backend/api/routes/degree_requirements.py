"""
backend/api/routes/degree_requirements.py

Endpoints for degree requirement programs, blocks, and courses.
"""

from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional, List
from ..config import settings
from ..utils.supabase_client import get_supabase

router = APIRouter()


@router.get("/programs")
def list_programs(
    faculty: Optional[str] = Query(None),
    program_type: Optional[str] = Query(None),  # major, minor, honours
):
    """List all degree programs, optionally filtered."""
    supabase = get_supabase()
    q = supabase.table("degree_programs").select("*")
    if faculty:
        q = q.eq("faculty", faculty)
    if program_type:
        q = q.eq("program_type", program_type)
    result = q.order("name").execute()
    return result.data


@router.get("/programs/{program_key}")
def get_program(program_key: str):
    """Get full program details including all requirement blocks and courses."""
    supabase = get_supabase()

    # Get program — use limit(1) instead of .single() to avoid exception on missing row
    try:
        prog_result = (
            supabase.table("degree_programs")
            .select("*")
            .eq("program_key", program_key)
            .limit(1)
            .execute()
        )
        if not prog_result.data:
            raise HTTPException(status_code=404, detail="Program not found")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Program not found")

    program = prog_result.data[0]
    prog_id = program["id"]

    # Get blocks
    blocks_result = (
        supabase.table("requirement_blocks")
        .select("*")
        .eq("program_id", prog_id)
        .order("sort_order")
        .execute()
    )
    blocks = blocks_result.data

    # Get all courses for all blocks at once
    block_ids = [b["id"] for b in blocks]
    if block_ids:
        courses_result = (
            supabase.table("requirement_courses")
            .select("*")
            .in_("block_id", block_ids)
            .order("sort_order")
            .execute()
        )
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
    supabase = get_supabase()

    prog_result = (
        supabase.table("degree_programs")
        .select("id, name")
        .eq("program_key", program_key)
        .single()
        .execute()
    )
    if not prog_result.data:
        raise HTTPException(status_code=404, detail="Program not found")

    prog_id = prog_result.data["id"]

    blocks_result = (
        supabase.table("requirement_blocks")
        .select("id, title, block_key")
        .eq("program_id", prog_id)
        .execute()
    )
    block_ids = [b["id"] for b in blocks_result.data]
    block_map = {b["id"]: b for b in blocks_result.data}

    if not block_ids:
        return []

    courses_result = (
        supabase.table("requirement_courses")
        .select("*")
        .in_("block_id", block_ids)
        .eq("recommended", True)
        .order("sort_order")
        .execute()
    )

    for c in courses_result.data:
        c["block_title"] = block_map.get(c["block_id"], {}).get("title", "")

    return courses_result.data


@router.post("/seed")
def seed_requirements(faculty: Optional[str] = Query(None, description="arts | engineering | arts_science | all (default: all)")):
    """
    Seed degree requirements into the database.
    - faculty=arts        → seed only Faculty of Arts programs
    - faculty=engineering → seed only Faculty of Engineering programs
    - faculty=arts_science → seed only B.A. & Sc. interfaculty programs
    - faculty=all or omit → seed all three
    """
    try:
        supabase = get_supabase()
        results = {}

        run_arts     = faculty in (None, "all", "arts")
        run_eng      = faculty in (None, "all", "engineering")
        run_arts_sci = faculty in (None, "all", "arts_science")

        if run_arts:
            from ..seeds.arts_degree_requirements import seed_degree_requirements as seed_arts
            results["arts"] = seed_arts(supabase)

        if run_eng:
            from ..seeds.engineering_degree_requirements import seed_degree_requirements as seed_eng
            results["engineering"] = seed_eng(supabase)

        if run_arts_sci:
            from ..seeds.arts_science_degree_requirements import seed_degree_requirements as seed_arts_science
            results["arts_science"] = seed_arts_science(supabase)

        return {"success": True, "seeded": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))