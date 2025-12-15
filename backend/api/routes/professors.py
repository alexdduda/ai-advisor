"""
Professor ratings endpoints using RateMyProfessor integration
"""
from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
import logging

from ..utils.professor_ratings import (
    search_professor_rating,
    get_rmp_client
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/search", response_model=dict)
async def search_professor(
    name: str = Query(
        ...,
        min_length=2,
        max_length=100,
        description="Professor name to search for"
    )
):
    """
    Search for a professor on RateMyProfessor
    
    - **name**: Professor's full or partial name
    
    Returns professor rating information from RateMyProfessor including:
    - Average rating (out of 5.0)
    - Average difficulty (out of 5.0)
    - Number of ratings
    - Would take again percentage
    - Direct link to RateMyProfessor profile
    """
    try:
        clean_name = name.strip()
        
        if not clean_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Professor name cannot be empty"
            )
        
        logger.info(f"Searching for professor: {clean_name}")
        
        rating = search_professor_rating(clean_name)
        
        if not rating:
            return {
                "found": False,
                "message": f"No ratings found for professor: {clean_name}",
                "professor": None
            }
        
        logger.info(f"Found professor: {rating['first_name']} {rating['last_name']}")
        
        return {
            "found": True,
            "professor": rating
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error searching professor: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while searching for professor ratings"
        )


@router.get("/{professor_id}", response_model=dict)
async def get_professor_by_id(professor_id: str):
    """
    Get professor details by RateMyProfessor ID
    
    - **professor_id**: RateMyProfessor legacy ID
    
    Returns detailed professor information.
    """
    try:
        client = get_rmp_client()
        professor = client.get_professor_by_id(professor_id)
        
        if not professor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Professor with ID {professor_id} not found"
            )
        
        return {"professor": professor}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error getting professor by ID: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving professor details"
        )