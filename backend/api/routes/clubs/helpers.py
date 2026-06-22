"""Small pure-function helpers shared across the clubs feature."""
import re
from typing import Optional, List

# ── Hardcoded starter clubs seeded by major keywords ─────────────────────────
MAJOR_CLUB_MAP = {
    "computer science": ["McGill AI Society", "HackMcGill", "McGill Robotics", "McGill Cybersecurity Club"],
    "software":         ["HackMcGill", "McGill AI Society", "McGill Cybersecurity Club"],
    "engineering":      ["McGill Robotics", "McGill Engineering Students' Society", "Formula SAE McGill"],
    "mathematics":      ["McGill Mathematics & Statistics Society", "McGill AI Society"],
    "physics":          ["McGill Physics Society", "McGill Astronomy Society"],
    "biology":          ["McGill Biology Society", "McGill Pre-Med Society", "McGill Genetics Society"],
    "chemistry":        ["McGill Chemistry Society", "McGill Pre-Med Society"],
    "medicine":         ["McGill Pre-Med Society", "McGill Medical Ethics Society"],
    "business":         ["McGill Finance Association", "McGill Management Consulting Group", "McGill Marketing Association"],
    "management":       ["McGill Finance Association", "McGill Management Consulting Group", "McGill Entrepreneurship Society"],
    "economics":        ["McGill Economics Students' Association", "McGill Finance Association"],
    "law":              ["McGill Law Students' Association", "McGill Moot Court Society", "McGill International Law Society"],
    "arts":             ["McGill Arts Undergraduate Society", "McGill Debate Society", "Le Moyne Literary Review"],
    "psychology":       ["McGill Psychology Student Association", "McGill Mental Health Awareness Club"],
    "philosophy":       ["McGill Philosophy Society", "McGill Debate Society"],
    "music":            ["McGill Music Students' Association", "McGill Jazz Orchestra"],
    "political":        ["McGill Model UN", "McGill Debate Society", "McGill International Relations Council"],
    "environment":      ["McGill Sustainability Association", "McGill Outdoors Club"],
    "architecture":     ["McGill Architecture Students' Association"],
    "nursing":          ["McGill Nursing Students' Society"],
    "education":        ["McGill Education Student Society"],
}

DEFAULT_STARTERS = [
    "McGill Debate Society",
    "McGill Model UN",
    "HackMcGill",
    "McGill AI Society",
    "McGill Outdoors Club",
]

# Fields that should NEVER appear in a clubs listing response served to a
# non-manager. The auditor pulled organizer emails of every club via this
# endpoint — they were embedded in the row payload. (SEC FIX #4.)
CLUB_LIST_PII_FIELDS = (
    "contact_email",
    "executive_emails",
    "created_by",
    "admin_emails",
    "owner_email",
)


def strip_club_pii(row: dict) -> dict:
    return {k: v for k, v in row.items() if k not in CLUB_LIST_PII_FIELDS}


def display_name_from_email(email: Optional[str]) -> str:
    """
    Derive the public display name shown to club managers/admins from a user's
    McGill email: take the part before '@', then the segment before the first
    dot, and capitalize it.
      'first.last@mail.mcgill.ca' -> 'First'
    Used in places where we DON'T want to expose the user's custom username.
    Falls back to 'Member' if email is missing or malformed.
    """
    if not email or '@' not in email:
        return "Member"
    local = email.split('@', 1)[0].strip()
    if not local:
        return "Member"
    first = local.split('.', 1)[0]
    return first.capitalize() if first else "Member"


def get_starter_names(major: Optional[str]) -> List[str]:
    """Return a list of club names relevant to the user's major."""
    if not major:
        return DEFAULT_STARTERS
    major_lower = major.lower()
    for keyword, names in MAJOR_CLUB_MAP.items():
        if keyword in major_lower:
            return names
    return DEFAULT_STARTERS


def convert_to_24h(v: Optional[str]) -> Optional[str]:
    """Convert time strings like '2:00 PM' to '14:00' (HH:MM 24h format)."""
    if not v:
        return None
    v = v.strip()
    # Already HH:MM 24h format
    if re.match(r'^\d{2}:\d{2}$', v):
        return v
    # Handle "H:MM" without AM/PM (e.g. "2:00")
    if re.match(r'^\d{1,2}:\d{2}$', v) and 'AM' not in v.upper() and 'PM' not in v.upper():
        return v.zfill(5)
    # Handle 12h format like "2:00 PM" or "12:30 AM"
    m = re.match(r'^(\d{1,2}):(\d{2})\s*(AM|PM)$', v, re.IGNORECASE)
    if m:
        h = int(m.group(1))
        mins = m.group(2)
        period = m.group(3).upper()
        if period == 'PM' and h != 12:
            h += 12
        if period == 'AM' and h == 12:
            h = 0
        return f"{h:02d}:{mins}"
    return v  # fallback
