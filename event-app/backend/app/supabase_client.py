from functools import lru_cache

from supabase import Client, create_client

from .config import settings


@lru_cache
def get_service_client() -> Client:
    """Service-role client: bypasses RLS. Only used for trusted server-side
    writes (Stripe webhook issuing tickets, staff check-in, seeding lineup).
    Never expose this key to the frontend."""
    return create_client(settings.supabase_url, settings.supabase_service_key)
