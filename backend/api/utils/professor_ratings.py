"""
RateMyProfessor integration for professor ratings
McGill University ID: 1439
"""
import logging
from typing import Optional, Dict, List
import requests
from functools import lru_cache

logger = logging.getLogger(__name__)

# McGill University's RateMyProfessor ID
MCGILL_SCHOOL_ID = "1439"

class RateMyProfessorClient:
    """
    Client for fetching professor ratings from RateMyProfessor
    Uses their GraphQL API
    """
    
    BASE_URL = "https://www.ratemyprofessors.com/graphql"
    
    def __init__(self, school_id: str = MCGILL_SCHOOL_ID):
        self.school_id = school_id
        self.headers = {
            "Authorization": "Basic dGVzdDp0ZXN0",
            "Content-Type": "application/json",
        }
    
    @lru_cache(maxsize=500)
    def search_professor(self, professor_name: str) -> Optional[Dict]:
        """
        Search for a professor by name at McGill
        
        Args:
            professor_name: Full or partial name of professor
            
        Returns:
            Dict with professor info or None if not found
        """
        try:
            query = """
            query NewSearchTeachersQuery($query: TeacherSearchQuery!) {
              newSearch {
                teachers(query: $query, first: 5) {
                  edges {
                    node {
                      id
                      legacyId
                      firstName
                      lastName
                      school {
                        name
                        id
                      }
                      department
                      avgRating
                      avgDifficulty
                      numRatings
                      wouldTakeAgainPercent
                    }
                  }
                }
              }
            }
            """
            
            variables = {
                "query": {
                    "text": professor_name,
                    "schoolID": self.school_id
                }
            }
            
            response = requests.post(
                self.BASE_URL,
                json={"query": query, "variables": variables},
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"RMP API error: {response.status_code}")
                return None
            
            data = response.json()
            edges = data.get("data", {}).get("newSearch", {}).get("teachers", {}).get("edges", [])
            
            if not edges:
                logger.info(f"No professor found for: {professor_name}")
                return None
            
            # Return first match
            professor = edges[0]["node"]
            
            return {
                "id": professor["legacyId"],
                "first_name": professor["firstName"],
                "last_name": professor["lastName"],
                "department": professor.get("department", "Unknown"),
                "avg_rating": round(professor["avgRating"], 2) if professor.get("avgRating") else None,
                "avg_difficulty": round(professor["avgDifficulty"], 2) if professor.get("avgDifficulty") else None,
                "num_ratings": professor.get("numRatings", 0),
                "would_take_again_percent": round(professor["wouldTakeAgainPercent"]) if professor.get("wouldTakeAgainPercent") else None,
                "rmp_url": f"https://www.ratemyprofessors.com/professor/{professor['legacyId']}"
            }
            
        except requests.exceptions.Timeout:
            logger.error("RateMyProfessor API timeout")
            return None
        except Exception as e:
            logger.exception(f"Error searching professor: {e}")
            return None
    
    def get_professor_by_id(self, professor_id: str) -> Optional[Dict]:
        """
        Get professor details by RMP ID
        
        Args:
            professor_id: RateMyProfessor legacy ID
            
        Returns:
            Dict with professor info or None if not found
        """
        try:
            query = """
            query TeacherRatingsPageQuery($id: ID!) {
              node(id: $id) {
                ... on Teacher {
                  id
                  legacyId
                  firstName
                  lastName
                  department
                  school {
                    name
                    id
                  }
                  avgRating
                  avgDifficulty
                  numRatings
                  wouldTakeAgainPercent
                }
              }
            }
            """
            
            variables = {"id": professor_id}
            
            response = requests.post(
                self.BASE_URL,
                json={"query": query, "variables": variables},
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            professor = data.get("data", {}).get("node", {})
            
            if not professor:
                return None
            
            return {
                "id": professor["legacyId"],
                "first_name": professor["firstName"],
                "last_name": professor["lastName"],
                "department": professor.get("department", "Unknown"),
                "avg_rating": round(professor["avgRating"], 2) if professor.get("avgRating") else None,
                "avg_difficulty": round(professor["avgDifficulty"], 2) if professor.get("avgDifficulty") else None,
                "num_ratings": professor.get("numRatings", 0),
                "would_take_again_percent": round(professor["wouldTakeAgainPercent"]) if professor.get("wouldTakeAgainPercent") else None,
                "rmp_url": f"https://www.ratemyprofessors.com/professor/{professor['legacyId']}"
            }
            
        except Exception as e:
            logger.exception(f"Error getting professor by ID: {e}")
            return None


# Singleton instance
_client = None

def get_rmp_client() -> RateMyProfessorClient:
    """Get or create RateMyProfessor client singleton"""
    global _client
    if _client is None:
        _client = RateMyProfessorClient()
    return _client


def search_professor_rating(professor_name: str) -> Optional[Dict]:
    """
    Convenience function to search for professor ratings
    
    Args:
        professor_name: Full or partial professor name
        
    Returns:
        Dict with rating info or None
    """
    client = get_rmp_client()
    return client.search_professor(professor_name)


def enrich_course_with_professor_ratings(course: Dict) -> Dict:
    """
    Add professor ratings to a course dict if instructor exists
    
    Args:
        course: Course dict with 'instructor' field
        
    Returns:
        Course dict with added 'professor_rating' field
    """
    instructor = course.get("instructor")
    
    if not instructor or instructor.lower() in ["tba", "staff", "unknown", ""]:
        course["professor_rating"] = None
        return course
    
    rating = search_professor_rating(instructor)
    course["professor_rating"] = rating
    
    return course