from fastapi import Header, HTTPException
from jose import JWTError, jwt

from .config import settings
from .supabase_client import get_service_client


def get_current_user_id(authorization: str = Header(...)) -> str:
    """Validates the Supabase-issued JWT sent by the frontend and returns
    the user's id. Mirrors Symbolos's auth pattern: every protected route
    depends on this rather than trusting a client-supplied user id."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject")
    return user_id


def require_staff(user_id: str) -> None:
    client = get_service_client()
    row = client.table("profiles").select("is_staff").eq("id", user_id).single().execute()
    if not row.data or not row.data.get("is_staff"):
        raise HTTPException(status_code=403, detail="Staff access required")
