"""
Supabase client with improved error handling and typing

Fixes applied:
  #10 – Complete type hints on all public functions (add_favorite, is_favorited, etc.)
  #11 – Added check_database_health() for connection health checks
"""
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
import logging
import uuid

from api.config import settings
from api.exceptions import DatabaseException, UserNotFoundException

logger = logging.getLogger(__name__)

# Singleton client
_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get Supabase client (singleton)"""
    global _supabase_client
    
    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
            logger.info("Supabase client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise DatabaseException("initialization", str(e))
    
    return _supabase_client


# ── FIX #11: Health check for database connection ────────────────────────
def check_database_health() -> bool:
    """
    Verify that the Supabase connection is alive.
    Returns True if healthy, False otherwise.
    """
    try:
        supabase = get_supabase()
        supabase.table("users").select("id").limit(1).execute()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# User Operations
def get_user_by_id(user_id: str) -> Dict[str, Any]:
    """Get user by ID"""
    try:
        supabase = get_supabase()
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        
        if not response.data:
            raise UserNotFoundException(user_id)
        
        return response.data[0]
    except UserNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        raise DatabaseException("get_user", str(e))


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    try:
        supabase = get_supabase()
        response = supabase.table('users').select('*').eq('email', email).execute()
        
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Error getting user by email: {e}")
        raise DatabaseException("get_user_by_email", str(e))


def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create new user"""
    try:
        supabase = get_supabase()
        
        # Remove None values
        cleaned_data = {k: v for k, v in user_data.items() if v is not None}
        
        logger.info(f"Creating user profile with ID: {cleaned_data.get('id')}")
        
        response = supabase.table('users').insert(cleaned_data).execute()
        
        if not response.data:
            raise DatabaseException("create_user", "No data returned from insert")
        
        logger.info(f"User profile created: {response.data[0].get('id')}")
        return response.data[0]
        
    except Exception as e:
        error_str = str(e)
        logger.error(f"Error creating user: {error_str}")
        
        # Check if it's a duplicate key violation
        if 'duplicate key' in error_str.lower() or '23505' in error_str:
            user_id = user_data.get('id')
            logger.warning(f"Duplicate detected for user ID: {user_id}")
            
            # Check if it's the ID that's duplicate (profile exists)
            if 'users_pkey' in error_str or f'({user_id})' in error_str:
                logger.info("Profile with this ID already exists, fetching it...")
                try:
                    existing = get_user_by_id(user_id)
                    return existing
                except:
                    pass
            
            # If it's email duplicate, this is a data issue
            # Try to fetch by ID anyway
            if 'email' in error_str:
                logger.error("Email duplicate but ID doesn't exist - data inconsistency!")
                # Try to find and return the existing user by ID
                try:
                    existing = get_user_by_id(user_id)
                    logger.info(f"Found existing user by ID: {user_id}")
                    return existing
                except UserNotFoundException:
                    # Profile truly doesn't exist, but email is taken
                    # This means there's old data - we need to update the old record
                    logger.error(f"Email exists but user ID {user_id} not found - orphaned email")
                    raise DatabaseException(
                        "create_user", 
                        "Email already in use by another account"
                    )
        
        raise DatabaseException("create_user", error_str)


def update_user(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update user - FIXED to allow None values to clear fields"""
    try:
        supabase = get_supabase()
        
        # DO NOT remove None values - we need them to clear fields in the database!
        # The old code was: cleaned_updates = {k: v for k, v in updates.items() if v is not None}
        # This prevented clearing fields by sending null
        
        response = supabase.table('users')\
            .update(updates)\
            .eq('id', user_id)\
            .execute()
        
        if not response.data:
            raise UserNotFoundException(user_id)
        
        logger.info(f"User updated: {user_id}")
        return response.data[0]
    except UserNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        raise DatabaseException("update_user", str(e))


# Chat Operations
def get_chat_history(user_id: str, session_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Get user's chat history, optionally filtered by session"""
    try:
        supabase = get_supabase()
        query = supabase.table('chat_messages')\
            .select('*')\
            .eq('user_id', user_id)
        
        # Filter by session if provided
        if session_id:
            query = query.eq('session_id', session_id)
        
        response = query\
            .order('created_at', desc=False)\
            .limit(min(limit, 200))\
            .execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Error getting chat history for {user_id}: {e}")
        raise DatabaseException("get_chat_history", str(e))

def get_user_sessions(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Get all chat sessions for a user with message counts"""
    try:
        supabase = get_supabase()
        
        # Get all messages in ASCENDING order (oldest first)
        all_messages = supabase.table('chat_messages')\
            .select('session_id, created_at, content, role')\
            .eq('user_id', user_id)\
            .not_.is_('session_id', 'null')\
            .order('created_at', desc=False)\
            .execute()
        
        # Group by session and track first user message
        sessions_dict = {}
        for msg in all_messages.data:
            sid = msg['session_id']
            if sid not in sessions_dict:
                sessions_dict[sid] = {
                    'session_id': sid,
                    'last_updated': msg['created_at'],
                    'message_count': 0,
                    'first_user_message': None
                }
            
            # Capture FIRST user message for title
            if msg['role'] == 'user' and sessions_dict[sid]['first_user_message'] is None:
                sessions_dict[sid]['first_user_message'] = msg['content'][:50]
            
            # Update last_updated to most recent
            if msg['created_at'] > sessions_dict[sid]['last_updated']:
                sessions_dict[sid]['last_updated'] = msg['created_at']
            
            sessions_dict[sid]['message_count'] += 1
        
        # Build final list
        sessions = []
        for sid, data in sessions_dict.items():
            sessions.append({
                'session_id': sid,
                'last_message': data['first_user_message'] or 'Chat Session',
                'last_updated': data['last_updated'],
                'message_count': data['message_count']
            })
        
        # Sort by last_updated descending (most recent first)
        sessions.sort(key=lambda x: x['last_updated'], reverse=True)
        
        return sessions[:limit]
    except Exception as e:
        logger.error(f"Error getting user sessions for {user_id}: {e}")
        return []

def save_message(user_id: str, role: str, content: str, session_id: Optional[str] = None) -> Dict[str, Any]:
    """Save a chat message with optional session_id"""
    try:
        supabase = get_supabase()
        
        # Generate new session_id if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
            logger.info(f"Generated new session_id: {session_id}")
        
        message_data = {
            'user_id': user_id,
            'role': role,
            'content': content[:settings.MAX_MESSAGE_LENGTH],
            'session_id': session_id
        }
        response = supabase.table('chat_messages').insert(message_data).execute()
        
        if not response.data:
            raise DatabaseException("save_message", "No data returned")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error saving message: {e}")
        raise DatabaseException("save_message", str(e))


def delete_chat_session(user_id: str, session_id: str) -> None:
    """Delete a specific chat session"""
    try:
        supabase = get_supabase()
        response = supabase.table('chat_messages')\
            .delete()\
            .eq('user_id', user_id)\
            .eq('session_id', session_id)\
            .execute()
        
        logger.info(f"Deleted session {session_id} for user {user_id}")
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {e}")
        raise DatabaseException("delete_session", str(e))


# Course Operations
def search_courses(
    query: Optional[str] = None,
    subject: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Search for courses using old column structure
    
    Database columns:
    - Class: Full class identifier (e.g., "ACCT351-201601")
    - Course: Course code (e.g., "ACCT351")
    - Term Name: Term (e.g., "W2016")
    - Class Ave: Letter grade (e.g., "A", "B+")
    - Class Ave.1: Numeric GPA (e.g., 3.0, 3.3)
    - course_name: Course title
    - instructor: Professor name
    - rmp_rating: RMP rating (1-5)
    - rmp_difficulty: RMP difficulty (1-5)
    - rmp_num_ratings: Number of RMP ratings
    - rmp_would_take_again: Percentage who would take again
    
    Performance note: For faster queries, ensure these indexes exist:
    CREATE INDEX idx_courses_course ON courses(Course);
    CREATE INDEX idx_courses_course_name ON courses(course_name);
    
    Args:
        query: Search term for course name or code
        subject: Filter by subject code (e.g., 'COMP', 'MATH')
        limit: Maximum number of results
    
    Returns:
        List of course dictionaries
    """
    try:
        supabase = get_supabase()
        
        # Start with base query
        db_query = supabase.table('courses').select('*')
        
        # Filter by subject using the 'Course' column (e.g., 'COMP206' starts with 'COMP')
        if subject:
            db_query = db_query.like('Course', f'{subject.upper()}%')
        
        # Search in course_name or Course columns
        if query:
            clean_query = query.strip()[:100]
            db_query = db_query.or_(
                f'course_name.ilike.%{clean_query}%,'
                f'Course.ilike.%{clean_query}%'
            )
        
        # Apply limit and execute
        db_query = db_query.limit(limit)
        response = db_query.execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        raise DatabaseException(f"Database query failed: {str(e)}")


def get_course(course_code: str) -> List[Dict[str, Any]]:
    """
    Get all sections for a specific course using old column structure
    
    Args:
        course_code: Full course code (e.g., 'COMP206', 'MATH140')
    
    Returns:
        List of section dictionaries for the course
    """
    try:
        supabase = get_supabase()
        
        # Query by the 'Course' column which contains the full course code
        response = supabase.table('courses').select('*').eq('Course', course_code.upper()).execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        raise DatabaseException(f"Database query failed: {str(e)}")


def delete_chat_history(user_id: str) -> None:
    """Delete all chat messages for a user"""
    try:
        supabase = get_supabase()
        response = supabase.table('chat_messages')\
            .delete()\
            .eq('user_id', user_id)\
            .execute()
        
        logger.info(f"Deleted chat history for user {user_id}")
    except Exception as e:
        logger.error(f"Error deleting chat history for {user_id}: {e}")
        raise DatabaseException("delete_chat_history", str(e))


# Favorites Operations (FIX #10: complete type hints on all parameters)
def get_favorites(user_id: str) -> List[Dict[str, Any]]:
    """Get all favorited courses for a user"""
    try:
        supabase = get_supabase()
        response = supabase.table('favorites')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        
        return response.data if response.data else []
    except Exception as e:
        logger.error(f"Error getting favorites for {user_id}: {e}")
        raise DatabaseException("get_favorites", str(e))


def add_favorite(
    user_id: str,
    course_code: str,
    course_title: str,
    subject: str,
    catalog: str,
) -> Dict[str, Any]:
    """Add a course to user's favorites"""
    try:
        supabase = get_supabase()
        
        favorite_data: Dict[str, str] = {
            'user_id': user_id,
            'course_code': course_code,
            'course_title': course_title,
            'subject': subject,
            'catalog': catalog
        }
        
        response = supabase.table('favorites').insert(favorite_data).execute()
        
        if not response.data:
            raise DatabaseException("add_favorite", "No data returned from insert")
        
        logger.info(f"Added favorite {course_code} for user {user_id}")
        return response.data[0]
    except Exception as e:
        error_str = str(e)
        logger.error(f"Error adding favorite: {error_str}")
        
        # Check if already favorited
        if 'duplicate key' in error_str.lower() or '23505' in error_str:
            raise DatabaseException("add_favorite", "Course already in favorites")
        
        raise DatabaseException("add_favorite", error_str)


def remove_favorite(user_id: str, course_code: str) -> None:
    """Remove a course from user's favorites"""
    try:
        supabase = get_supabase()
        response = supabase.table('favorites')\
            .delete()\
            .eq('user_id', user_id)\
            .eq('course_code', course_code)\
            .execute()
        
        logger.info(f"Removed favorite {course_code} for user {user_id}")
    except Exception as e:
        logger.error(f"Error removing favorite: {e}")
        raise DatabaseException("remove_favorite", str(e))


def is_favorited(user_id: str, course_code: str) -> bool:
    """Check if a course is favorited by user"""
    try:
        supabase = get_supabase()
        response = supabase.table('favorites')\
            .select('id')\
            .eq('user_id', user_id)\
            .eq('course_code', course_code)\
            .execute()
        
        return len(response.data) > 0 if response.data else False
    except Exception as e:
        logger.error(f"Error checking favorite: {e}")
        return False
