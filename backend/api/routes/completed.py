"""
Completed courses tracking endpoints
"""
from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from pydantic import BaseModel, Field
import logging
from datetime import datetime

from ..config import settings
from ..utils.supabase_client import get_supabase
from ..exceptions import DatabaseException

router = APIRouter()
logger = logging.getLogger(__name__)


class CompletedCourse(BaseModel):
    """Completed course schema"""
    course_code: str = Field(..., min_length=1, max_length=20)
    course_title: str = Field(..., min_length=1, max_length=200)
    subject: str = Field(..., min_length=2, max_length=4)
    catalog: str = Field(..., min_length=1, max_length=10)
    term: str = Field(..., min_length=1, max_length=20)
    year: int = Field(..., ge=2000, le=2100)
    grade: Optional[str] = Field(None, max_length=10)
    credits: int = Field(default=3, ge=0, le=12)


class CompletedCourseUpdate(BaseModel):
    """Update schema for completed course"""
    term: Optional[str] = Field(None, min_length=1, max_length=20)
    year: Optional[int] = Field(None, ge=2000, le=2100)
    grade: Optional[str] = Field(None, max_length=10)
    credits: Optional[int] = Field(None, ge=0, le=12)


@router.get("/{user_id}", response_model=dict)
async def get_completed_courses(
    user_id: str,
    limit: int = Query(
        default=200,
        ge=1,
        le=500,
        description="Maximum number of completed courses to return"
    )
):
    """
    Get all completed courses for a user
    
    - **user_id**: UUID of the user
    - **limit**: Maximum number of results
    
    Returns a list of completed courses sorted by year and term.
    """
    try:
        # Validate user_id format (basic UUID check)
        if not user_id or len(user_id) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        
        # Query database
        supabase = get_supabase()
        response = supabase.table('completed_courses') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('year', desc=True) \
            .order('term') \
            .limit(limit) \
            .execute()
        
        completed_courses = response.data if response.data else []
        
        logger.info(f"Retrieved {len(completed_courses)} completed courses for user {user_id}")
        
        return {
            "completed_courses": completed_courses,
            "count": len(completed_courses),
            "user_id": user_id
        }
        
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching completed courses for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching completed courses"
        )


@router.post("/{user_id}", response_model=dict)
async def add_completed_course(
    user_id: str,
    course: CompletedCourse
):
    """
    Add a completed course for a user
    
    - **user_id**: UUID of the user
    - **course**: Course data including code, title, term, year, grade, etc.
    
    Returns the created completed course record.
    """
    try:
        logger.info(f"Received request to add completed course: {course.dict()}")
        # Validate user_id format
        if not user_id or len(user_id) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        
        # Check if course already exists for this user
        supabase = get_supabase()
        existing = supabase.table('completed_courses') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('course_code', course.course_code) \
            .execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Course {course.course_code} is already marked as completed"
            )
        
        # Prepare course data
        course_data = {
            'user_id': user_id,
            'course_code': course.course_code,
            'course_title': course.course_title,
            'subject': course.subject.upper(),
            'catalog': course.catalog,
            'term': course.term,
            'year': course.year,
            'grade': course.grade,
            'credits': course.credits,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Insert into database
        response = supabase.table('completed_courses') \
            .insert(course_data) \
            .execute()
        
        if not response.data:
            raise DatabaseException("Failed to insert completed course")
        
        created_course = response.data[0]
        
        logger.info(f"Added completed course {course.course_code} for user {user_id}")
        
        return {
            "success": True,
            "course": created_course,
            "message": f"Successfully marked {course.course_code} as completed"
        }
        
    except HTTPException:
        raise
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Error adding completed course for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while adding completed course"
        )


@router.patch("/{user_id}/{course_code}", response_model=dict)
async def update_completed_course(
    user_id: str,
    course_code: str,
    updates: CompletedCourseUpdate
):
    """
    Update a completed course (e.g., change grade or term)
    
    - **user_id**: UUID of the user
    - **course_code**: Course code to update (e.g., "COMP 202")
    - **updates**: Fields to update
    
    Returns the updated course record.
    """
    try:
        # Validate inputs
        if not user_id or len(user_id) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        
        if not course_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course code is required"
            )
        
        # Build update dict (only include non-None values)
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No updates provided"
            )
        
        # Update database
        supabase = get_supabase()
        response = supabase.table('completed_courses') \
            .update(update_data) \
            .eq('user_id', user_id) \
            .eq('course_code', course_code) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Completed course {course_code} not found for user"
            )
        
        updated_course = response.data[0]
        
        logger.info(f"Updated completed course {course_code} for user {user_id}")
        
        return {
            "success": True,
            "course": updated_course,
            "message": f"Successfully updated {course_code}"
        }
        
    except HTTPException:
        raise
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Error updating completed course {course_code} for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating completed course"
        )


@router.delete("/{user_id}/{course_code}", response_model=dict)
async def remove_completed_course(
    user_id: str,
    course_code: str
):
    """
    Remove a completed course
    
    - **user_id**: UUID of the user
    - **course_code**: Course code to remove (e.g., "COMP 202")
    
    Returns success confirmation.
    """
    try:
        # Validate inputs
        if not user_id or len(user_id) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        
        if not course_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course code is required"
            )
        
        # Delete from database
        supabase = get_supabase()
        response = supabase.table('completed_courses') \
            .delete() \
            .eq('user_id', user_id) \
            .eq('course_code', course_code) \
            .execute()
        
        logger.info(f"Removed completed course {course_code} for user {user_id}")
        
        return {
            "success": True,
            "deleted": course_code,
            "message": f"Successfully removed {course_code} from completed courses"
        }
        
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Error removing completed course {course_code} for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while removing completed course"
        )
