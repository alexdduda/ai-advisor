"""
Course search and retrieval endpoints with optional professor ratings
"""
from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from pydantic import BaseModel, Field
import logging

from ..config import settings
from ..utils.supabase_client import search_courses, get_course
from ..exceptions import DatabaseException
from ..utils.professor_ratings import enrich_course_with_professor_ratings

router = APIRouter()
logger = logging.getLogger(__name__)


class Course(BaseModel):
    """Course schema"""
    id: int
    subject: str
    catalog: str
    title: str
    average: Optional[float]
    instructor: Optional[str]
    term: Optional[str]


class CourseDetail(BaseModel):
    """Detailed course information"""
    subject: str
    catalog: str
    title: str
    average_grade: float
    num_sections: int
    sections: List[dict]


@router.get("/search", response_model=dict)
async def search(
    query: Optional[str] = Query(
        None,
        min_length=1,
        max_length=100,
        description="Search query for course title, subject, or catalog number"
    ),
    subject: Optional[str] = Query(
        None,
        min_length=2,
        max_length=4,
        description="Filter by subject code (e.g., COMP, MATH)"
    ),
    limit: int = Query(
        default=settings.DEFAULT_SEARCH_LIMIT,
        ge=1,
        le=settings.MAX_SEARCH_LIMIT,
        description="Maximum number of results to return"
    ),
    include_ratings: bool = Query(
        default=False,
        description="Include RateMyProfessor ratings for instructors"
    )
):
    """
    Search for courses
    
    - **query**: Search term (matches course title, subject, or catalog number)
    - **subject**: Filter by specific subject code
    - **limit**: Maximum number of results (default 50, max 200)
    - **include_ratings**: If true, fetch RateMyProfessor ratings for instructors (slower)
    
    Returns a list of matching courses with basic information.
    """
    try:
        # Sanitize inputs
        clean_query = query.strip() if query else None
        clean_subject = subject.strip().upper() if subject else None
        
        # Search courses
        courses = search_courses(
            query=clean_query,
            subject=clean_subject,
            limit=limit
        )
        
        # Optionally enrich with professor ratings
        if include_ratings and courses:
            logger.info("Enriching courses with professor ratings...")
            # Only enrich first 10 to avoid rate limiting
            for i, course in enumerate(courses[:10]):
                try:
                    courses[i] = enrich_course_with_professor_ratings(course)
                except Exception as e:
                    logger.warning(f"Failed to enrich course {i} with ratings: {e}")
                    courses[i]["professor_rating"] = None
        
        logger.info(f"Course search: query='{clean_query}', subject='{clean_subject}', results={len(courses)}")
        
        return {
            "courses": courses,
            "count": len(courses),
            "query": clean_query,
            "subject": clean_subject,
            "includes_ratings": include_ratings
        }
        
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in course search: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while searching courses"
        )


@router.get("/{subject}/{catalog}", response_model=dict)
async def get_course_details(
    subject: str,
    catalog: str,
    include_ratings: bool = Query(
        default=True,
        description="Include RateMyProfessor ratings for instructors"
    )
):
    """
    Get detailed information for a specific course
    
    - **subject**: Course subject code (e.g., COMP, MATH)
    - **catalog**: Course catalog number (e.g., 206, 251)
    - **include_ratings**: If true, fetch RateMyProfessor ratings for instructors
    
    Returns detailed information including all sections, average grades, and professor ratings.
    """
    try:
        # Validate and sanitize inputs
        if not subject or len(subject) < 2 or len(subject) > 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subject code must be 2-4 characters"
            )
        
        if not catalog or len(catalog) < 1 or len(catalog) > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Catalog number must be 1-10 characters"
            )
        
        # Sanitize inputs
        clean_subject = subject.strip().upper()
        clean_catalog = catalog.strip()
        
        # Get course sections
        sections = get_course(clean_subject, clean_catalog)
        
        if not sections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course {clean_subject} {clean_catalog} not found"
            )
        
        # Enrich sections with professor ratings if requested
        if include_ratings:
            logger.info("Enriching sections with professor ratings...")
            for i, section in enumerate(sections):
                try:
                    sections[i] = enrich_course_with_professor_ratings(section)
                except Exception as e:
                    logger.warning(f"Failed to enrich section {i} with ratings: {e}")
                    sections[i]["professor_rating"] = None
        
        # Calculate statistics across all sections
        grades = [s['average'] for s in sections if s.get('average') is not None]
        avg_grade = sum(grades) / len(grades) if grades else None
        
        course_detail = {
            "subject": clean_subject,
            "catalog": clean_catalog,
            "title": sections[0]['title'],
            "average_grade": round(avg_grade, 2) if avg_grade else None,
            "num_sections": len(sections),
            "sections": sections,
            "includes_ratings": include_ratings
        }
        
        logger.info(f"Course details retrieved: {clean_subject} {clean_catalog}")
        
        return {"course": course_detail}
        
    except HTTPException:
        raise
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error getting course details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving course details"
        )


@router.get("/subjects", response_model=dict)
async def get_subjects():
    """
    Get list of all available subject codes
    
    Returns a sorted list of unique subject codes (e.g., COMP, MATH, PHYS).
    """
    try:
        # Get all courses and extract unique subjects
        all_courses = search_courses(limit=settings.MAX_SEARCH_LIMIT)
        
        subjects = sorted(list(set(course['subject'] for course in all_courses)))
        
        logger.info(f"Retrieved {len(subjects)} unique subjects")
        
        return {
            "subjects": subjects,
            "count": len(subjects)
        }
        
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error getting subjects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving subjects"
        )