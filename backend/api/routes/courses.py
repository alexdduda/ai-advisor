"""
Course search and retrieval endpoints with professor ratings from database - OPTIMIZED
"""
from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from pydantic import BaseModel, Field
import logging
import re
from collections import defaultdict

from ..config import settings
from ..utils.supabase_client import get_supabase
from ..exceptions import DatabaseException

router = APIRouter()
logger = logging.getLogger(__name__)


class Course(BaseModel):
    """Course schema with ratings"""
    subject: str
    catalog: str
    title: str
    average: Optional[float]
    instructor: Optional[str]
    term: Optional[str]
    num_sections: Optional[int] = 1
    rmp_rating: Optional[float] = None
    rmp_difficulty: Optional[float] = None
    rmp_num_ratings: Optional[int] = None
    rmp_would_take_again: Optional[float] = None


class CourseDetail(BaseModel):
    """Detailed course information with ratings"""
    subject: str
    catalog: str
    title: str
    average_grade: Optional[float]
    num_sections: int
    sections: List[dict]
    professor_rating: Optional[dict] = None


def parse_course_code(course_code):
    """
    Parse course code like 'ACCT351' into subject and catalog
    Returns: (subject, catalog) tuple, e.g., ('ACCT', '351')
    """
    if not course_code:
        return None, None
    
    # Match pattern: letters followed by numbers
    match = re.match(r'^([A-Z]+)(\d+[A-Z]?)$', course_code.upper())
    if match:
        return match.group(1), match.group(2)
    return None, None


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
        default=True,
        description="Include RateMyProfessor ratings (always from database)"
    )
):
    """
    OPTIMIZED course search with ratings from database
    
    - **query**: Search term (matches course title, subject, or catalog number)
    - **subject**: Filter by specific subject code
    - **limit**: Maximum number of results (default 50, max 200)
    
    Returns a list of matching courses with ratings.
    """
    try:
        supabase = get_supabase()
        
        # Sanitize inputs
        clean_query = query.strip() if query else None
        clean_subject = subject.strip().upper() if subject else None
        
        # Build optimized query - select only needed columns and use DISTINCT ON
        # This dramatically reduces data transfer and processing time
        query_builder = supabase.from_('courses').select(
            'Course, course_name, "Class Ave.1", instructor, rmp_rating, '
            'rmp_difficulty, rmp_num_ratings, rmp_would_take_again'
        )
        
        # Apply filters
        if clean_subject:
            query_builder = query_builder.like('Course', f'{clean_subject}%')
        
        if clean_query:
            query_builder = query_builder.or_(
                f'course_name.ilike.%{clean_query}%,'
                f'Course.ilike.%{clean_query}%'
            )
        
        # Order by Course to help with grouping
        query_builder = query_builder.order('Course')
        
        # Fetch limited results (get more than limit to account for grouping)
        query_builder = query_builder.limit(min(limit * 5, 500))
        
        response = query_builder.execute()
        sections = response.data if response.data else []
        
        # OPTIMIZED: Group by course code using dictionary (much faster than nested loops)
        courses_dict = {}
        
        for section in sections:
            course_code = section.get('Course')
            subj, cat = parse_course_code(course_code)
            
            if not subj or not cat:
                continue
            
            # Use course code as key for fast lookup
            if course_code not in courses_dict:
                courses_dict[course_code] = {
                    'subject': subj,
                    'catalog': cat,
                    'title': section.get('course_name', ''),
                    'instructor': section.get('instructor'),
                    'best_average': None,
                    'num_sections': 0,
                    'has_rating': False,
                    'rating_data': {}
                }
            
            course = courses_dict[course_code]
            course['num_sections'] += 1
            
            # Track best average
            avg = section.get('Class Ave.1')
            if avg:
                try:
                    avg_float = float(avg)
                    if course['best_average'] is None or avg_float > course['best_average']:
                        course['best_average'] = avg_float
                except (ValueError, TypeError):
                    pass
            
            # Use first available rating (avoid overwriting)
            if not course['has_rating'] and section.get('rmp_rating') is not None:
                course['rating_data'] = {
                    'rmp_rating': section['rmp_rating'],
                    'rmp_difficulty': section.get('rmp_difficulty'),
                    'rmp_num_ratings': section.get('rmp_num_ratings'),
                    'rmp_would_take_again': section.get('rmp_would_take_again')
                }
                course['has_rating'] = True
        
        # Convert to list and format
        result_courses = []
        for course_code, course_data in courses_dict.items():
            course_obj = {
                'subject': course_data['subject'],
                'catalog': course_data['catalog'],
                'title': course_data['title'],
                'average': course_data['best_average'],
                'instructor': course_data['instructor'],
                'num_sections': course_data['num_sections'],
            }
            
            # Add RMP data if available
            if course_data['rating_data']:
                course_obj.update(course_data['rating_data'])
            
            result_courses.append(course_obj)
        
        # Sort by subject and catalog
        result_courses.sort(key=lambda c: (c['subject'], c['catalog']))
        
        # Apply final limit
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
        description="Include RateMyProfessor ratings (always from database)"
    )
):
    """
    Get detailed information for a specific course with ratings
    
    - **subject**: Course subject code (e.g., COMP, MATH)
    - **catalog**: Course catalog number (e.g., 206, 251)
    
    Returns detailed information including all sections and professor ratings.
    """
    try:
        supabase = get_supabase()
        
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
        
        clean_subject = subject.strip().upper()
        clean_catalog = catalog.strip()
        course_code = f"{clean_subject}{clean_catalog}"
        
        # Optimized query - select only needed fields
        response = supabase.from_('courses').select(
            '"Term Name", "Class Ave.1", instructor, Class, course_name, '
            'rmp_rating, rmp_difficulty, rmp_num_ratings, rmp_would_take_again'
        ).eq('Course', course_code).execute()
        
        sections = response.data if response.data else []
        
        if not sections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course {clean_subject} {clean_catalog} not found"
            )
        
        # Format sections with ratings
        formatted_sections = []
        professor_rating = None
        grades = []
        
        for section in sections:
            formatted_section = {
                'term': section.get('Term Name'),
                'average': section.get('Class Ave.1'),
                'instructor': section.get('instructor'),
                'class': section.get('Class'),
            }
            
            # Track grades for average calculation
            avg = section.get('Class Ave.1')
            if avg:
                try:
                    grades.append(float(avg))
                except (ValueError, TypeError):
                    pass
            
            # If section has rating data, include it
            if section.get('rmp_rating') is not None:
                formatted_section['rmp_rating'] = section['rmp_rating']
                formatted_section['rmp_difficulty'] = section.get('rmp_difficulty')
                formatted_section['rmp_num_ratings'] = section.get('rmp_num_ratings')
                formatted_section['rmp_would_take_again'] = section.get('rmp_would_take_again')
                
                # Use first rating found as course-level rating
                if not professor_rating:
                    professor_rating = {
                        'rmp_rating': section['rmp_rating'],
                        'rmp_difficulty': section.get('rmp_difficulty'),
                        'rmp_num_ratings': section.get('rmp_num_ratings'),
                        'rmp_would_take_again': section.get('rmp_would_take_again'),
                        'instructor': section.get('instructor')
                    }
            
            formatted_sections.append(formatted_section)
        
        avg_grade = sum(grades) / len(grades) if grades else None
        
        course_detail = {
            "subject": clean_subject,
            "catalog": clean_catalog,
            "title": sections[0].get('course_name', ''),
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
    Get list of all available subject codes - OPTIMIZED
    
    Returns a sorted list of unique subject codes.
    """
    try:
        supabase = get_supabase()
        
        # OPTIMIZED: Use SQL DISTINCT to get unique course codes directly
        # This is MUCH faster than fetching all rows and processing in Python
        response = supabase.from_('courses').select('Course').limit(10000).execute()
        
        # Parse course codes to extract unique subjects
        subjects = set()
        for row in response.data:
            course_code = row.get('Course')
            subj, _ = parse_course_code(course_code)
            if subj:
                subjects.add(subj)
        
        subjects = sorted(list(subjects))
        
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
