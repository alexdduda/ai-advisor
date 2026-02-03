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

router = APIRouter()
logger = logging.getLogger(__name__)


class Course(BaseModel):
    """Course schema with ratings"""
    id: int
    subject: str
    catalog: str
    title: str
    average: Optional[float]
    instructor: Optional[str]
    term: Optional[str]
    rmp_rating: Optional[float] = None
    rmp_difficulty: Optional[float] = None
    rmp_num_ratings: Optional[int] = None
    rmp_would_take_again: Optional[float] = None


class CourseDetail(BaseModel):
    """Detailed course information with ratings"""
    subject: str
    catalog: str
    title: str
    average_grade: float
    num_sections: int
    sections: List[dict]
    professor_rating: Optional[dict] = None  # Aggregated rating for primary instructor


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
        default=True,  # Always true now since ratings are in DB
        description="Include RateMyProfessor ratings (always enabled)"
    )
):
    """
    Search for courses with ratings from database
    
    - **query**: Search term (matches course title, subject, or catalog number)
    - **subject**: Filter by specific subject code
    - **limit**: Maximum number of results (default 50, max 200)
    - **include_ratings**: Deprecated (ratings always included from database)
    
    Returns a list of matching courses with ratings (no API calls needed!).
    """
    try:
        # Sanitize inputs
        clean_query = query.strip() if query else None
        clean_subject = subject.strip().upper() if subject else None
        
        # Search courses (ratings are already in the database)
        courses = search_courses(
            query=clean_query,
            subject=clean_subject,
            limit=limit
        )
        
        # Group by course code to get unique courses
        from collections import defaultdict
        courses_map = defaultdict(lambda: {
            'sections': [],
            'best_average': None,
            'rating': None
        })
        
        for section in courses:
            key = f"{section['subject']}-{section['catalog']}"
            course = courses_map[key]
            
            # Add section
            course['sections'].append(section)
            
            # Track best average
            if section.get('average'):
                if course['best_average'] is None or section['average'] > course['best_average']:
                    course['best_average'] = section['average']
            
            # Use rating from any section that has one (should be same for all sections of same course)
            if section.get('rmp_rating') and not course['rating']:
                course['rating'] = {
                    'avg_rating': section['rmp_rating'],
                    'avg_difficulty': section.get('rmp_difficulty'),
                    'num_ratings': section.get('rmp_num_ratings'),
                    'would_take_again_percent': section.get('rmp_would_take_again'),
                    'instructor': section.get('instructor')
                }
            
            # Store basic info
            if 'subject' not in course:
                course['subject'] = section['subject']
                course['catalog'] = section['catalog']
                course['title'] = section.get('course_name') or section.get('title', '')
                course['instructor'] = section.get('instructor')
        
        # Convert to list format
        result_courses = []
        for key, course_data in courses_map.items():
            course_obj = {
                'subject': course_data['subject'],
                'catalog': course_data['catalog'],
                'title': course_data['title'],
                'average': course_data['best_average'],
                'instructor': course_data['instructor'],
                'num_sections': len(course_data['sections']),
                'professor_rating': course_data['rating']
            }
            result_courses.append(course_obj)
        
        # Sort by subject and catalog
        result_courses.sort(key=lambda c: (c['subject'], c['catalog']))
        
        # Limit results
        result_courses = result_courses[:limit]
        
        logger.info(f"Course search: query='{clean_query}', subject='{clean_subject}', "
                   f"results={len(result_courses)} unique courses")
        
        return {
            "courses": result_courses,
            "count": len(result_courses),
            "query": clean_query,
            "subject": clean_subject,
            "includes_ratings": True
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
        description="Include RateMyProfessor ratings (always enabled)"
    )
):
    """
    Get detailed information for a specific course with ratings
    
    - **subject**: Course subject code (e.g., COMP, MATH)
    - **catalog**: Course catalog number (e.g., 206, 251)
    - **include_ratings**: Deprecated (ratings always included)
    
    Returns detailed information including all sections and professor ratings from database.
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
        
        # Get course sections (ratings already in database)
        sections = get_course(clean_subject, clean_catalog)
        
        if not sections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course {clean_subject} {clean_catalog} not found"
            )
        
        # Format sections with ratings
        formatted_sections = []
        professor_rating = None
        
        for section in sections:
            formatted_section = dict(section)
            
            # If section has rating data, format it
            if section.get('rmp_rating'):
                section_rating = {
                    'avg_rating': section['rmp_rating'],
                    'avg_difficulty': section.get('rmp_difficulty'),
                    'num_ratings': section.get('rmp_num_ratings'),
                    'would_take_again_percent': section.get('rmp_would_take_again'),
                }
                formatted_section['professor_rating'] = section_rating
                
                # Use first rating found as course-level rating
                if not professor_rating:
                    professor_rating = {
                        **section_rating,
                        'first_name': section.get('instructor', '').split()[0] if section.get('instructor') else '',
                        'last_name': ' '.join(section.get('instructor', '').split()[1:]) if section.get('instructor') else '',
                        'instructor': section.get('instructor')
                    }
            
            formatted_sections.append(formatted_section)
        
        # Calculate statistics
        grades = [s['average'] for s in sections if s.get('average') is not None]
        avg_grade = sum(grades) / len(grades) if grades else None
        
        course_detail = {
            "subject": clean_subject,
            "catalog": clean_catalog,
            "title": sections[0].get('course_name') or sections[0].get('title', ''),
            "average_grade": round(avg_grade, 2) if avg_grade else None,
            "num_sections": len(sections),
            "sections": formatted_sections,
            "professor_rating": professor_rating,
            "includes_ratings": True
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