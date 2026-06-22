"""Pydantic request models for the clubs feature."""
from typing import Optional
from pydantic import BaseModel, Field, field_validator

from ...config import settings
from .helpers import convert_to_24h


class ClubSubmission(BaseModel):
    name:              str            = Field(..., min_length=2, max_length=100)
    description:       str            = Field(..., min_length=2, max_length=1000)
    category:          Optional[str]  = Field(None, max_length=60)
    contact_email:     Optional[str]  = Field(None, max_length=200)
    website_url:       Optional[str]  = None
    meeting_schedule:  Optional[str]  = Field(None, max_length=300)
    location:          Optional[str]  = Field(None, max_length=200)
    is_private:        bool           = False
    executive_emails:  str             = Field(..., min_length=2, max_length=500)
    join_instructions: Optional[str]  = Field(None, max_length=2000)
    application_url:   Optional[str]  = None


class JoinClubRequest(BaseModel):
    club_id: str
    requester_name: Optional[str] = None
    requester_email: Optional[str] = None
    requester_linkedin: Optional[str] = None


class UpdateClubRequest(BaseModel):
    name:              Optional[str]  = Field(None, min_length=2, max_length=100)
    description:       Optional[str]  = Field(None, max_length=1000)
    category:          Optional[str]  = Field(None, max_length=60)
    contact_email:     Optional[str]  = Field(None, max_length=200)
    website_url:       Optional[str]  = None
    meeting_schedule:  Optional[str]  = Field(None, max_length=300)
    location:          Optional[str]  = Field(None, max_length=200)
    is_private:        Optional[bool] = None
    executive_emails:  Optional[str]  = Field(None, max_length=500)
    join_instructions: Optional[str]  = Field(None, max_length=2000)
    application_url:   Optional[str]  = None
    logo_url:          Optional[str]  = Field(None, max_length=500)

    @field_validator("logo_url")
    @classmethod
    def _validate_logo_url(cls, v: Optional[str]) -> Optional[str]:
        """
        SEC: ensure logo_url is one of our own Supabase Storage public URLs.
        Without this, an admin (or compromised account) could point logo_url at
        any URL — useful as a tracking pixel, beacon, or XSS vector via SVG.
        Empty/None is allowed (= remove logo).
        """
        if not v or not v.strip():
            return None
        from urllib.parse import urlparse
        parsed = urlparse(v.strip())
        if parsed.scheme != "https":
            raise ValueError("logo_url must be https")
        expected_host = urlparse(settings.SUPABASE_URL).netloc
        if not expected_host or expected_host not in parsed.netloc:
            raise ValueError("logo_url must point to our Supabase Storage")
        if "/storage/v1/object/public/club-logos/" not in parsed.path:
            raise ValueError("logo_url must reference the club-logos bucket")
        return v.strip()


class JoinRequestAction(BaseModel):
    action: str  # "approve" or "deny"


class ClubEventCreate(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=200)
    description: Optional[str]  = Field(None, max_length=1000)
    date:        str            = Field(...)  # YYYY-MM-DD
    time:        Optional[str]  = None        # HH:MM (auto-converts 12h format)
    end_time:    Optional[str]  = None        # HH:MM (auto-converts 12h format)
    location:    Optional[str]  = Field(None, max_length=200)
    join_link:   Optional[str]  = Field(None, max_length=500)
    recurrence:  Optional[str]  = None        # null, 'weekly_monday', 'biweekly_tuesday', etc.

    @field_validator('time', 'end_time', mode='before')
    @classmethod
    def normalize_time(cls, v):
        return convert_to_24h(v)


class ClubAnnouncementCreate(BaseModel):
    title:     str           = Field(..., min_length=1, max_length=200)
    body:      str           = Field(..., min_length=1, max_length=2000)
    event_id:  Optional[str] = None
    join_link: Optional[str] = Field(None, max_length=500)


class ManagerInviteCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    message: Optional[str] = Field(None, max_length=500)


class ManagerInviteAction(BaseModel):
    action: str  # 'accept' | 'deny'
