"""The single shared APIRouter every clubs/*.py module decorates directly.

Avoids nested include_router() calls entirely (which trip FastAPI's
"prefix and path cannot both be empty" check, since list_clubs is
registered at path "") — every feature module just imports `router` from
here and adds routes to the same instance, exactly like the original
single-file clubs.py did.
"""
from fastapi import APIRouter

router = APIRouter()
