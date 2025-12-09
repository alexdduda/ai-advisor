from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional

from api.utils.supabase_client import (
    get_user_by_id,
    get_supabase
)

router = APIRouter()

class UserCreate(BaseModel):
    id: str  # ← Add this - the Supabase Auth user ID
    email: EmailStr
    username: Optional[str] = None
    major: Optional[str] = None
    year: Optional[int] = None
    interests: Optional[str] = None
    current_gpa: Optional[float] = None

class UserUpdate(BaseModel):
    major: Optional[str] = None
    year: Optional[int] = None
    interests: Optional[str] = None
    current_gpa: Optional[float] = None

@router.post("/")
async def create_new_user(user: UserCreate):
    """Create a new user profile"""
    try:
        supabase = get_supabase()
        
        # Prepare user data - include the ID from auth
        user_data = user.dict()
        
        # Remove None values
        user_data = {k: v for k, v in user_data.items() if v is not None}
        
        print(f"Creating user with data: {user_data}")
        
        # Insert into database
        response = supabase.table('users').insert(user_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        print(f"User creation response: {response}")
        return {"user": response.data[0]}
        
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ... rest of the file stays the same