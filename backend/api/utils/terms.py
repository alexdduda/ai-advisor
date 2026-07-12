"""
McGill term windows — backend mirror of frontend/src/lib/termDates.js.
Per https://www.mcgill.ca/importantdates/key-dates (padded so the boundaries
hold year-over-year):
  Fall:   Aug 25 - Dec 31
  Winter: Jan 1  - Apr 30
  Summer: May 1  - Aug 24
"""
from datetime import date, datetime, timezone

TERM_ORDER = {"Winter": 0, "Summer": 1, "Fall": 2}


def get_active_term(today: date | None = None) -> tuple[str, int]:
    """Return (term, year) for the semester containing `today` (UTC default)."""
    d = today or datetime.now(timezone.utc).date()
    if d.month <= 4:
        return "Winter", d.year
    if d.month < 8 or (d.month == 8 and d.day < 25):
        return "Summer", d.year
    return "Fall", d.year


def split_current_courses(courses: list[dict], today: date | None = None):
    """Split current_courses rows into (active, upcoming_by_term).

    Rows without term/year (legacy, pre-migration) count as active so they
    never silently vanish from AI context — same rule as the frontend.
    upcoming_by_term is a list of ((term, year), [courses]) sorted
    chronologically.
    """
    active_term, active_year = get_active_term(today)
    active: list[dict] = []
    upcoming: dict[tuple[str, int], list[dict]] = {}
    for c in courses or []:
        term, year = c.get("term"), c.get("year")
        if not term or not year:
            active.append(c)
        elif term == active_term and int(year) == active_year:
            active.append(c)
        else:
            upcoming.setdefault((term, int(year)), []).append(c)
    ordered = sorted(upcoming.items(), key=lambda kv: (kv[0][1], TERM_ORDER.get(kv[0][0], 3)))
    return active, ordered
