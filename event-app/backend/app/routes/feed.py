from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import get_current_user_id
from ..config import settings
from ..supabase_client import get_service_client

router = APIRouter(prefix="/api/feed", tags=["feed"])


def _event_id() -> str:
    client = get_service_client()
    event = client.table("events").select("id").eq("slug", settings.event_slug).single().execute().data
    if not event:
        raise HTTPException(status_code=404, detail="Event not configured")
    return event["id"]


@router.get("")
def list_posts():
    client = get_service_client()
    return (
        client.table("feed_posts")
        .select("id, image_url, caption, created_at, profiles(full_name, avatar_url), feed_comments(id, body, created_at, profiles(full_name))")
        .eq("event_id", _event_id())
        .eq("is_hidden", False)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
        .data
    )


class NewPost(BaseModel):
    image_url: str | None = None
    caption: str


@router.post("")
def create_post(body: NewPost, user_id: str = Depends(get_current_user_id)):
    if not body.image_url and not body.caption.strip():
        raise HTTPException(status_code=400, detail="Post needs a photo or caption")
    client = get_service_client()
    res = (
        client.table("feed_posts")
        .insert({"event_id": _event_id(), "user_id": user_id, "image_url": body.image_url, "caption": body.caption})
        .execute()
    )
    return res.data[0]


class NewComment(BaseModel):
    body: str


@router.post("/{post_id}/comments")
def create_comment(post_id: str, body: NewComment, user_id: str = Depends(get_current_user_id)):
    if not body.body.strip():
        raise HTTPException(status_code=400, detail="Comment can't be empty")
    client = get_service_client()
    res = client.table("feed_comments").insert({"post_id": post_id, "user_id": user_id, "body": body.body}).execute()
    return res.data[0]


@router.post("/going")
def toggle_going(user_id: str = Depends(get_current_user_id)):
    client = get_service_client()
    event_id = _event_id()
    existing = client.table("attendance").select("*").eq("event_id", event_id).eq("user_id", user_id).execute().data
    if existing:
        client.table("attendance").delete().eq("event_id", event_id).eq("user_id", user_id).execute()
        return {"going": False}
    client.table("attendance").insert({"event_id": event_id, "user_id": user_id, "status": "going"}).execute()
    return {"going": True}
