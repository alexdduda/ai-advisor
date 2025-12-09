from supabase import create_client, Client
from functools import lru_cache
import os

@lru_cache()
def get_supabase() -> Client:
    """Create a singleton Supabase client"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")  # Service key for backend
    
    if not url or not key:
        raise ValueError("Supabase credentials not configured")
    
    return create_client(url, key)

# Helper functions
async def get_user_by_id(user_id: str) -> dict:
    """Get user by ID"""
    try:
        supabase = get_supabase()
        response = supabase.table('users').select('*').eq('id', user_id).single().execute()
        return response.data
    except Exception as e:
        print(f"Error getting user by id {user_id}: {str(e)}")
        raise

async def get_user_by_email(email: str) -> dict:
    """Get user by email"""
    try:
        supabase = get_supabase()
        response = supabase.table('users').select('*').eq('email', email).single().execute()
        return response.data
    except Exception as e:
        print(f"Error getting user by email {email}: {str(e)}")
        raise

async def create_user(email: str, username: str = None, **kwargs) -> dict:
    """Create new user"""
    try:
        supabase = get_supabase()
        user_data = {
            'email': email,
            'username': username,
            **kwargs
        }
        # Remove None values
        user_data = {k: v for k, v in user_data.items() if v is not None}
        
        print(f"Creating user with data: {user_data}")
        response = supabase.table('users').insert(user_data).execute()
        print(f"User creation response: {response}")
        
        if not response.data:
            raise Exception("No data returned from user creation")
            
        return response.data[0]
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise

async def get_chat_history(user_id: str, limit: int = 50) -> list:
    """Get user's chat history"""
    try:
        supabase = get_supabase()
        response = supabase.table('chat_messages')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=False)\
            .limit(limit)\
            .execute()
        return response.data
    except Exception as e:
        print(f"Error getting chat history: {str(e)}")
        raise

async def save_message(user_id: str, role: str, content: str) -> dict:
    """Save a chat message"""
    try:
        supabase = get_supabase()
        message_data = {
            'user_id': user_id,
            'role': role,
            'content': content
        }
        response = supabase.table('chat_messages').insert(message_data).execute()
        return response.data[0]
    except Exception as e:
        print(f"Error saving message: {str(e)}")
        raise

async def search_courses(query: str = None, subject: str = None, limit: int = 100) -> list:
    """Search for courses"""
    try:
        supabase = get_supabase()
        
        query_builder = supabase.table('courses').select('*')
        
        if subject:
            query_builder = query_builder.eq('subject', subject)
        
        if query:
            query_builder = query_builder.or_(
                f'title.ilike.%{query}%,subject.ilike.%{query}%,catalog.ilike.%{query}%'
            )
        
        response = query_builder.limit(limit).execute()
        return response.data
    except Exception as e:
        print(f"Error searching courses: {str(e)}")
        raise