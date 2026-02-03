"""
Course search and retrieval endpoints with professor ratings from database
"""
from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from pydantic import BaseModel, Field
import logging
import re

from ..config import settings
from ..utils.supabase_client import search_courses, get_course
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
    Search for courses with ratings from database
    
    - **query**: Search term (matches course title, subject, or catalog number)
    - **subject**: Filter by specific subject code
    - **limit**: Maximum number of results (default 50, max 200)
    - **include_ratings**: Ratings always included from database
    
    Returns a list of matching courses with ratings.
    """
    try:
        # Sanitize inputs
        clean_query = query.strip() if query else None
        clean_subject = subject.strip().upper() if subject else None
        
        # Search courses (ratings are already in the database)
        sections = search_courses(
            query=clean_query,
            subject=clean_subject,
            limit=limit * 10  # Get more to account for grouping
        )
        
        # Group by course code to get unique courses
        from collections import defaultdict
        courses_map = defaultdict(lambda: {
            'sections': [],
            'best_average': None,
            'rating': None
        })
        
        for section in sections:
            # Parse the 'Course' column (e.g., "ACCT351") into subject and catalog
            course_code = section.get('Course')
            subj, cat = parse_course_code(course_code)
            
            if not subj or not cat:
                continue
            
            key = f"{subj}-{cat}"
            course = courses_map[key]
            
            # Add section
            course['sections'].append(section)
            
            # Track best average - use 'Class Ave.1' column (numeric GPA like 3.0, 3.3)
            avg = section.get('Class Ave.1')
            if avg:
                try:
                    avg_float = float(avg)
                    if course['best_average'] is None or avg_float > course['best_average']:
                        course['best_average'] = avg_float
                except (ValueError, TypeError):
                    pass
            
            # Use rating from any section that has one
            if section.get('rmp_rating') is not None and course['rating'] is None:
                course['rating'] = {
                    'rmp_rating': section['rmp_rating'],
                    'rmp_difficulty': section.get('rmp_difficulty'),
                    'rmp_num_ratings': section.get('rmp_num_ratings'),
                    'rmp_would_take_again': section.get('rmp_would_take_again')
                }
            
            # Store basic info
            if 'subject' not in course:
                course['subject'] = subj
                course['catalog'] = cat
                course['title'] = section.get('course_name', '')
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
            }
            
            # Add RMP data if available
            if course_data['rating']:
                course_obj.update(course_data['rating'])
            
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
        description="Include RateMyProfessor ratings (always from database)"
    )
):
    """
    Get detailed information for a specific course with ratings
    
    - **subject**: Course subject code (e.g., COMP, MATH)
    - **catalog**: Course catalog number (e.g., 206, 251)
    - **include_ratings**: Ratings always included from database
    
    Returns detailed information including all sections and professor ratings.
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
        
        # Construct course code for old database structure
        course_code = f"{clean_subject}{clean_catalog}"
        
        # Get course sections (ratings already in database)
        sections = get_course(course_code)
        
        if not sections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course {clean_subject} {clean_catalog} not found"
            )
        
        # Format sections with ratings
        formatted_sections = []
        professor_rating = None
        
        for section in sections:
            formatted_section = {
                'term': section.get('Term Name'),  # Old column
                'average': section.get('Class Ave.1'),  # Old column - numeric GPA
                'instructor': section.get('instructor'),
                'class': section.get('Class'),  # Full class identifier
            }
            
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
        
        # Calculate statistics
        grades = []
        for s in sections:
            avg = s.get('Class Ave.1')
            if avg:
                try:
                    grades.append(float(avg))
                except (ValueError, TypeError):
                    pass
        
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
    Get list of all available subject codes
    
    Returns a sorted list of unique subject codes (e.g., COMP, MATH, PHYS).
    """
    try:
        # Get all courses and extract unique subjects from course codes
        all_sections = search_courses(limit=settings.MAX_SEARCH_LIMIT)
        
        # Parse course codes to extract subjects
        subjects = set()
        for section in all_sections:
            course_code = section.get('Course')
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