"""
Supabase client with improved error handling and typing
"""
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
import logging

from config import settings
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
    """Update user"""
    try:
        supabase = get_supabase()
        
        # Remove None values
        cleaned_updates = {k: v for k, v in updates.items() if v is not None}
        
        response = supabase.table('users')\
            .update(cleaned_updates)\
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
def get_chat_history(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Get user's chat history"""
    try:
        supabase = get_supabase()
        response = supabase.table('chat_messages')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=False)\
            .limit(min(limit, 200))\
            .execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Error getting chat history for {user_id}: {e}")
        raise DatabaseException("get_chat_history", str(e))


def save_message(user_id: str, role: str, content: str) -> Dict[str, Any]:
    """Save a chat message"""
    try:
        supabase = get_supabase()
        message_data = {
            'user_id': user_id,
            'role': role,
            'content': content[:settings.MAX_MESSAGE_LENGTH]  # Truncate if needed
        }
        response = supabase.table('chat_messages').insert(message_data).execute()
        
        if not response.data:
            raise DatabaseException("save_message", "No data returned")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error saving message: {e}")
        raise DatabaseException("save_message", str(e))


# Course Operations
def search_courses(
    query: Optional[str] = None,
    subject: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Search for courses"""
    try:
        supabase = get_supabase()
        
        query_builder = supabase.table('courses').select('*')
        
        if subject:
            query_builder = query_builder.eq('subject', subject.upper())
        
        if query:
            # Sanitize query
            clean_query = query.strip()[:100]
            query_builder = query_builder.or_(
                f'title.ilike.%{clean_query}%,'
                f'subject.ilike.%{clean_query}%,'
                f'catalog.ilike.%{clean_query}%'
            )
        
        response = query_builder.limit(min(limit, settings.MAX_SEARCH_LIMIT)).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error searching courses: {e}")
        raise DatabaseException("search_courses", str(e))


def get_course(subject: str, catalog: str) -> List[Dict[str, Any]]:
    """Get specific course sections"""
    try:
        supabase = get_supabase()
        response = supabase.table('courses')\
            .select('*')\
            .eq('subject', subject.upper())\
            .eq('catalog', catalog)\
            .execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Error getting course {subject} {catalog}: {e}")
        raise DatabaseException("get_course", str(e))