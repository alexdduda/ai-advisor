"""
McGill Arts Programs Scraper — Full Requirement Structure
Fetches every program page and parses all requirement block types:

  BLOCK TYPES:
  - required       : every course in the list MUST be taken
  - choose_credits : take N credits from this list (your choice which)
  - choose_courses : take exactly N courses from this list
  - group          : named group (Group A / Group B / etc.)
  - multi_group    : "X credits from Group A AND Y credits from Group B"
  - pool_group     : "at least X credits total from Groups A+B+C combined"
  - level_elective : "N credits from any SUBJ courses at 300+ level"

  Also captures:
  - Level constraints: "no more than 6cr at 200-level"
  - Course-level constraints: "only 3 credits may be at 400/500 level"
  - Program notes

Run: python3 scrape_arts_full.py
Output: arts_programs_scraped.json
"""

import requests, re, json, time, sys
from bs4 import BeautifulSoup

BASE = "https://coursecatalogue.mcgill.ca"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; McGillAdvisorScraper/1.0)"}

# ─────────────────────────────────────────────────────────────────
# COMPLETE ARTS PROGRAM URL LIST
# ─────────────────────────────────────────────────────────────────
PROGRAMS = [
    # ── ANTHROPOLOGY ──────────────────────────────────────────────
    ("anthropology_minor",          "Anthropology – Minor Concentration",               "minor",
     "/en/undergraduate/arts/programs/anthropology/anthropology-minor-concentration-ba/"),
    ("anthropology_major",          "Anthropology – Major Concentration",               "major",
     "/en/undergraduate/arts/programs/anthropology/anthropology-major-concentration-ba/"),
    ("anthropology_honours",        "Anthropology – Honours",                           "honours",
     "/en/undergraduate/arts/programs/anthropology/anthropology-honours-ba/"),

    # ── ART HISTORY & COMMUNICATION STUDIES ───────────────────────
    ("art_history_minor",           "Art History – Minor Concentration",                "minor",
     "/en/undergraduate/arts/programs/art-history-communication-studies/art-history-minor-concentration-ba/"),
    ("comm_studies_minor",          "Communication Studies – Minor",                    "minor",
     "/en/undergraduate/arts/programs/art-history-communication-studies/communication-studies-minor-concentration-ba/"),
    ("art_history_major",           "Art History – Major Concentration",                "major",
     "/en/undergraduate/arts/programs/art-history-communication-studies/art-history-major-concentration-ba/"),
    ("art_history_honours",         "Art History – Honours",                            "honours",
     "/en/undergraduate/arts/programs/art-history-communication-studies/art-history-honours-ba/"),

    # ── COMPUTER SCIENCE ──────────────────────────────────────────
    ("computer_science_arts_minor", "Computer Science – Minor Concentration",           "minor",
     "/en/undergraduate/arts/programs/computer-science/computer-science-minor-concentration-ba/"),
    ("computer_science_arts_major", "Computer Science – Major Concentration",           "major",
     "/en/undergraduate/arts/programs/computer-science/computer-science-major-concentration-ba/"),
    ("software_engineering_major",  "Software Engineering – Major Concentration",       "major",
     "/en/undergraduate/arts/programs/computer-science/software-engineering-major-concentration-ba/"),

    # ── EAST ASIAN STUDIES ────────────────────────────────────────
    ("east_asian_lang_lit_minor",   "East Asian Language and Literature – Minor",       "minor",
     "/en/undergraduate/arts/programs/east-asian-studies/east-asian-language-literature-minor-concentration-ba/"),
    ("east_asian_cultural_minor",   "East Asian Cultural Studies – Minor",              "minor",
     "/en/undergraduate/arts/programs/east-asian-studies/east-asian-cultural-studies-minor-concentration-ba/"),
    ("east_asian_studies_major",    "East Asian Studies – Major Concentration",         "major",
     "/en/undergraduate/arts/programs/east-asian-studies/east-asian-studies-major-concentration-ba/"),
    ("east_asian_studies_honours",  "East Asian Studies – Honours",                    "honours",
     "/en/undergraduate/arts/programs/east-asian-studies/east-asian-studies-honours-ba/"),

    # ── ECONOMICS ─────────────────────────────────────────────────
    ("economics_minor",             "Economics – Minor Concentration",                  "minor",
     "/en/undergraduate/arts/programs/economics/economics-minor-concentration-ba/"),
    ("economics_major",             "Economics – Major Concentration",                  "major",
     "/en/undergraduate/arts/programs/economics/economics-major-concentration-ba/"),
    ("economics_honours",           "Economics – Honours",                              "honours",
     "/en/undergraduate/arts/programs/economics/economics-honours-ba/"),

    # ── ENGLISH ───────────────────────────────────────────────────
    ("english_literature_minor",    "English – Literature Minor",                       "minor",
     "/en/undergraduate/arts/programs/english/english-literature-minor-concentration-ba/"),
    ("english_drama_minor",         "English – Drama and Theatre Minor",                "minor",
     "/en/undergraduate/arts/programs/english/english-drama-theatre-minor-concentration-ba/"),
    ("english_cultural_minor",      "English – Cultural Studies Minor",                 "minor",
     "/en/undergraduate/arts/programs/english/english-cultural-studies-minor-concentration-ba/"),
    ("english_literature_major",    "English – Literature Major",                       "major",
     "/en/undergraduate/arts/programs/english/english-literature-major-concentration-ba/"),
    ("english_cultural_major",      "English – Cultural Studies Major",                 "major",
     "/en/undergraduate/arts/programs/english/english-cultural-studies-major-concentration-ba/"),
    ("english_drama_major",         "English – Drama and Theatre Major",                "major",
     "/en/undergraduate/arts/programs/english/english-drama-theatre-major-concentration-ba/"),
    ("english_literature_honours",  "English – Literature Honours",                     "honours",
     "/en/undergraduate/arts/programs/english/english-literature-honours-ba/"),
    ("medieval_studies_minor",      "Medieval Studies – Minor",                         "minor",
     "/en/undergraduate/arts/programs/english/medieval-studies-minor-concentration-ba/"),
    ("world_cinemas_minor",         "World Cinemas – Minor",                            "minor",
     "/en/undergraduate/arts/programs/english/world-cinemas-minor-concentration-ba/"),

    # ── GENDER, SEXUALITY, AND FEMINIST STUDIES ───────────────────
    ("gsfsj_minor",                 "Gender, Sexuality, Feminist & Social Justice – Minor", "minor",
     "/en/undergraduate/arts/programs/gender-sexuality-feminist-studies/gender-sexuality-feminist-social-justice-studies-minor-concentration-ba/"),
    ("gsfsj_major",                 "Gender, Sexuality, Feminist & Social Justice – Major", "major",
     "/en/undergraduate/arts/programs/gender-sexuality-feminist-studies/gender-sexuality-feminist-social-justice-studies-major-concentration-ba/"),
    ("gsfsj_honours",               "Gender, Sexuality, Feminist & Social Justice – Honours","honours",
     "/en/undergraduate/arts/programs/gender-sexuality-feminist-studies/gender-sexuality-feminist-social-justice-studies-honours-ba/"),

    # ── GEOGRAPHY ─────────────────────────────────────────────────
    ("geography_minor",             "Geography – Minor Concentration",                  "minor",
     "/en/undergraduate/arts/programs/geography/geography-minor-concentration-ba/"),
    ("geography_urban_minor",       "Geography (Urban Studies) – Minor",                "minor",
     "/en/undergraduate/arts/programs/geography/geography-urban-studies-minor-concentration-ba/"),
    ("gis_remote_sensing_minor",    "GIS and Remote Sensing – Minor",                   "minor",
     "/en/undergraduate/arts/programs/geography/gis-remote-sensing-minor-concentration-ba/"),
    ("health_geography_minor",      "Health Geography – Minor",                         "minor",
     "/en/undergraduate/arts/programs/geography/health-geography-minor-concentration-ba/"),
    ("geography_major",             "Geography – Major Concentration",                  "major",
     "/en/undergraduate/arts/programs/geography/geography-major-concentration-ba/"),
    ("geography_urban_major",       "Geography (Urban Studies) – Major",                "major",
     "/en/undergraduate/arts/programs/geography/geography-urban-studies-major-concentration-ba/"),
    ("geography_honours",           "Geography – Honours",                              "honours",
     "/en/undergraduate/arts/programs/geography/geography-honours-ba/"),

    # ── HISTORY AND CLASSICAL STUDIES ─────────────────────────────
    ("history_minor",               "History – Minor Concentration",                    "minor",
     "/en/undergraduate/arts/programs/history-classical-studies/history-minor-concentration-ba/"),
    ("history_major",               "History – Major Concentration",                    "major",
     "/en/undergraduate/arts/programs/history-classical-studies/history-major-concentration-ba/"),
    ("history_honours",             "History – Honours",                                "honours",
     "/en/undergraduate/arts/programs/history-classical-studies/history-honours-ba/"),
    ("classics_minor",              "Classics – Minor Concentration",                   "minor",
     "/en/undergraduate/arts/programs/history-classical-studies/classics-minor-concentration-ba/"),
    ("classics_major",              "Classics – Major Concentration",                   "major",
     "/en/undergraduate/arts/programs/history-classical-studies/classics-major-concentration-ba/"),
    ("classics_honours",            "Classics – Honours",                               "honours",
     "/en/undergraduate/arts/programs/history-classical-studies/classics-honours-ba/"),
    ("south_asian_studies_minor",   "South Asian Studies – Minor",                      "minor",
     "/en/undergraduate/arts/programs/history-classical-studies/south-asian-studies-minor-concentration-ba/"),

    # ── INSTITUTE FOR THE STUDY OF CANADA ─────────────────────────
    ("canadian_studies_minor",      "Canadian Studies – Minor Concentration",           "minor",
     "/en/undergraduate/arts/programs/institute-study/canadian-studies-minor-concentration-ba/"),
    ("canadian_studies_major",      "Canadian Studies – Major Concentration",           "major",
     "/en/undergraduate/arts/programs/institute-study/canadian-studies-major-concentration-ba/"),
    ("indigenous_studies_minor",    "Indigenous Studies – Minor",                       "minor",
     "/en/undergraduate/arts/programs/institute-study/indigenous-studies-minor-concentration-ba/"),
    ("quebec_studies_minor",        "Quebec Studies & Community-Engaged Learning – Minor","minor",
     "/en/undergraduate/arts/programs/institute-study/quebec-studies-community-engaged-learning-minor-concentration-ba/"),

    # ── INTERNATIONAL DEVELOPMENT ─────────────────────────────────
    ("intl_development_minor",      "International Development Studies – Minor",        "minor",
     "/en/undergraduate/arts/programs/international-development/international-development-studies-minor-concentration-ba/"),
    ("intl_development_major",      "International Development Studies – Major",        "major",
     "/en/undergraduate/arts/programs/international-development/international-development-studies-major-concentration-ba/"),
    ("intl_development_honours",    "International Development Studies – Honours",      "honours",
     "/en/undergraduate/arts/programs/international-development/international-development-studies-honours-ba/"),

    # ── ISLAMIC STUDIES ───────────────────────────────────────────
    ("african_studies_minor",       "African Studies – Minor Concentration",            "minor",
     "/en/undergraduate/arts/programs/islamic-studies/african-studies-minor-concentration-ba/"),
    ("african_studies_major",       "African Studies – Major Concentration",            "major",
     "/en/undergraduate/arts/programs/islamic-studies/african-studies-major-concentration-ba/"),
    ("arabic_language_minor",       "Arabic Language – Minor",                          "minor",
     "/en/undergraduate/arts/programs/islamic-studies/arabic-language-minor-concentration-ba/"),
    ("persian_language_minor",      "Persian Language – Minor",                         "minor",
     "/en/undergraduate/arts/programs/islamic-studies/persian-language-minor-concentration-ba/"),
    ("turkish_language_minor",      "Turkish Language – Minor",                         "minor",
     "/en/undergraduate/arts/programs/islamic-studies/turkish-language-minor-concentration-ba/"),
    ("world_islamic_mideast_minor", "World Islamic and Middle East Studies – Minor",    "minor",
     "/en/undergraduate/arts/programs/islamic-studies/world-islamic-middle-east-studies-minor-concentration-ba/"),
    ("world_islamic_mideast_major", "World Islamic and Middle East Studies – Major",    "major",
     "/en/undergraduate/arts/programs/islamic-studies/world-islamic-middle-east-studies-major-concentration-ba/"),
    ("world_islamic_mideast_honours","World Islamic and Middle East Studies – Honours", "honours",
     "/en/undergraduate/arts/programs/islamic-studies/world-islamic-middle-east-studies-honours-ba/"),

    # ── JEWISH STUDIES ────────────────────────────────────────────
    ("jewish_studies_minor",        "Jewish Studies – Minor Concentration",             "minor",
     "/en/undergraduate/arts/programs/jewish-studies/jewish-studies-minor-concentration-ba/"),
    ("jewish_studies_major",        "Jewish Studies – Major Concentration",             "major",
     "/en/undergraduate/arts/programs/jewish-studies/jewish-studies-major-concentration-ba/"),
    ("jewish_studies_honours",      "Jewish Studies – Honours",                         "honours",
     "/en/undergraduate/arts/programs/jewish-studies/jewish-studies-honours-ba/"),

    # ── LANGUAGES, LITERATURES, AND CULTURES ─────────────────────
    ("european_lit_culture_minor",  "European Literature and Culture – Minor",          "minor",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/european-literature-culture-minor-concentration-ba/"),
    ("german_language_minor",       "German Language – Minor",                          "minor",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/german-language-minor-concentration-ba/"),
    ("german_studies_minor",        "German Studies – Minor Concentration",             "minor",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/german-studies-minor-concentration-ba/"),
    ("german_studies_major",        "German Studies – Major Concentration",             "major",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/german-studies-major-concentration-ba/"),
    ("hispanic_studies_minor",      "Hispanic Studies – Minor Concentration",           "minor",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/hispanic-studies-minor-concentration-ba/"),
    ("hispanic_studies_major",      "Hispanic Studies – Major Concentration",           "major",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/hispanic-studies-major-concentration-ba/"),
    ("italian_studies_minor",       "Italian Studies – Minor Concentration",            "minor",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/italian-studies-minor-concentration-ba/"),
    ("italian_studies_major",       "Italian Studies – Major Concentration",            "major",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/italian-studies-major-concentration-ba/"),
    ("latin_american_caribbean_minor","Latin American and Caribbean Studies – Minor",   "minor",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/latin-american-caribbean-studies-minor-concentration-ba/"),
    ("latin_american_caribbean_major","Latin American and Caribbean Studies – Major",   "major",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/latin-american-caribbean-studies-major-concentration-ba/"),
    ("liberal_arts_major",          "Liberal Arts – Major Concentration",               "major",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/liberal-arts-major-concentration-ba/"),
    ("russian_minor",               "Russian – Minor Concentration",                    "minor",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/russian-minor-concentration-ba/"),
    ("russian_major",               "Russian – Major Concentration",                    "major",
     "/en/undergraduate/arts/programs/languages-literatures-cultures/russian-major-concentration-ba/"),

    # ── LINGUISTICS ───────────────────────────────────────────────
    ("linguistics_minor",           "Linguistics – Minor Concentration",                "minor",
     "/en/undergraduate/arts/programs/linguistics/linguistics-minor-concentration-ba/"),
    ("linguistics_major",           "Linguistics – Major Concentration",                "major",
     "/en/undergraduate/arts/programs/linguistics/linguistics-major-concentration-ba/"),
    ("linguistics_honours",         "Linguistics – Honours",                            "honours",
     "/en/undergraduate/arts/programs/linguistics/linguistics-honours-ba/"),

    # ── LITTÉRATURES DE LANGUE FRANÇAISE ─────────────────────────
    ("french_lit_minor",            "Langue et littérature françaises – Études littéraires – Mineure","minor",
     "/en/undergraduate/arts/programs/litteratures-langue-francaise-traduction-creation/langue-et-litterature-francaises-etudes-et-pratiques-litteraires-concentration-mineure/"),
    ("french_lit_major",            "Langue et littérature françaises – Études littéraires – Majeure","major",
     "/en/undergraduate/arts/programs/litteratures-langue-francaise-traduction-creation/langue-et-litterature-francaises-etudes-et-pratiques-litteraires-concentration-ba/"),
    ("french_translation_minor",    "Langue et littérature françaises – Traduction – Mineure",       "minor",
     "/en/undergraduate/arts/programs/litteratures-langue-francaise-traduction-creation/langue-et-litt-francaises-traduction-concentration-mineure/"),
    ("french_translation_major",    "Langue et littérature françaises – Traduction – Majeure",       "major",
     "/en/undergraduate/arts/programs/litteratures-langue-francaise-traduction-creation/langue-et-litterature-francaises-traduction-concentration-ba/"),

    # ── PHILOSOPHY ────────────────────────────────────────────────
    ("philosophy_minor",            "Philosophy – Minor Concentration",                 "minor",
     "/en/undergraduate/arts/programs/philosophy/philosophy-minor-concentration-ba/"),
    ("philosophy_major",            "Philosophy – Major Concentration",                 "major",
     "/en/undergraduate/arts/programs/philosophy/philosophy-major-concentration-ba/"),
    ("philosophy_honours",          "Philosophy – Honours",                             "honours",
     "/en/undergraduate/arts/programs/philosophy/philosophy-honours-ba/"),

    # ── POLITICAL SCIENCE ─────────────────────────────────────────
    ("political_science_minor",     "Political Science – Minor Concentration",          "minor",
     "/en/undergraduate/arts/programs/political-science/political-science-minor-concentration-ba/"),
    ("political_science_major",     "Political Science – Major Concentration",          "major",
     "/en/undergraduate/arts/programs/political-science/political-science-major-concentration-ba/"),
    ("political_science_honours",   "Political Science – Honours",                      "honours",
     "/en/undergraduate/arts/programs/political-science/political-science-honours-ba/"),

    # ── RELIGIOUS STUDIES ─────────────────────────────────────────
    ("religious_studies_minor",     "Religious Studies – Minor Concentration",          "minor",
     "/en/undergraduate/arts/programs/religious-studies/religious-studies-minor-concentration-ba/"),
    ("religious_studies_major",     "Religious Studies – Major Concentration",          "major",
     "/en/undergraduate/arts/programs/religious-studies/religious-studies-major-concentration-ba/"),
    ("religious_studies_honours",   "Religious Studies – Honours",                      "honours",
     "/en/undergraduate/arts/programs/religious-studies/religious-studies-honours-ba/"),

    # ── SOCIAL STUDIES OF MEDICINE ────────────────────────────────
    ("social_studies_medicine_minor","Social Studies of Medicine – Minor",              "minor",
     "/en/undergraduate/arts/programs/social-studies-medicine/social-studies-medicine-minor-concentration-ba/"),

    # ── SOCIOLOGY ─────────────────────────────────────────────────
    ("sociology_minor",             "Sociology – Minor Concentration",                  "minor",
     "/en/undergraduate/arts/programs/sociology/sociology-minor-concentration-ba/"),
    ("sociology_major",             "Sociology – Major Concentration",                  "major",
     "/en/undergraduate/arts/programs/sociology/sociology-major-concentration-ba/"),
    ("sociology_honours",           "Sociology – Honours",                              "honours",
     "/en/undergraduate/arts/programs/sociology/sociology-honours-ba/"),

    # ── INFORMATION STUDIES ───────────────────────────────────────
    ("information_studies_minor",   "Information Studies – Minor",                      "minor",
     "/en/undergraduate/arts/programs/information-studies/information-studies-minor-concentration-ba/"),

    # ── ARTS PROGRAMS FROM OTHER FACULTIES ────────────────────────
    ("cognitive_science_minor",     "Cognitive Science – Minor",                        "minor",
     "/en/undergraduate/arts/programs/cognitive-science/cognitive-science-minor-concentration-ba/"),
    ("education_arts_minor",        "Education for Arts Students – Minor",              "minor",
     "/en/undergraduate/arts/programs/education-arts-students/education-arts-students-minor-concentration-ba/"),
    ("educational_psychology_minor","Educational Psychology – Minor",                   "minor",
     "/en/undergraduate/arts/programs/educational-psychology/educational-psychology-minor-concentration-ba/"),
    ("psychology_minor",            "Psychology – Minor Concentration",                 "minor",
     "/en/undergraduate/arts/programs/psychology/psychology-minor-concentration-ba/"),
    ("psychology_major",            "Psychology – Major Concentration",                 "major",
     "/en/undergraduate/arts/programs/psychology/psychology-major-concentration-ba/"),
    ("psychology_honours",          "Psychology – Honours",                             "honours",
     "/en/undergraduate/arts/programs/psychology/psychology-honours-ba/"),
]

# URL map for ecalendar_url lookup
URL_MAP = {key: path for key, _, _, path in PROGRAMS}


# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────
def fetch_page(url):
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            if r.status_code == 200:
                return r.text
            print(f"    HTTP {r.status_code}")
            return None
        except Exception as e:
            print(f"    Error (try {attempt+1}): {e}")
            time.sleep(3)
    return None

def clean(el):
    if isinstance(el, str):
        return re.sub(r'\s+', ' ', el).strip()
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip()

def parse_credits(text):
    m = re.search(r'\b(\d+)\b', text)
    return int(m.group(1)) if m else 3

def slugify(text, prefix=""):
    s = re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')[:40]
    return f"{prefix}_{s}" if prefix else s


# ─────────────────────────────────────────────────────────────────
# COURSE ROW PARSER
# ─────────────────────────────────────────────────────────────────
def parse_course_row(row):
    """
    Parse a <tr> into a course dict.
    Handles: SUBJ 123 / Title / Credits columns
    Returns None for header rows or non-course rows.
    """
    cells = [clean(td) for td in row.find_all(['td', 'th'])]
    if len(cells) < 2:
        return None

    code_raw = cells[0]
    title_raw = cells[1] if len(cells) > 1 else ""
    credits_raw = cells[2] if len(cells) > 2 else "3"

    # Skip obvious headers
    if code_raw.lower() in ('course', 'code', 'courses', '', 'course code'):
        return None
    if title_raw.lower() in ('title', 'course title', 'name'):
        return None

    # Extract course code — handles SUBJ 123, SUBJ 123D1, SUBJ 123N1
    m = re.match(r'^([A-Z]{2,5})\s+([0-9][A-Z0-9]{2,5})\b', code_raw)
    if not m:
        # Maybe the code is in an <a> inside the cell
        link = row.find('a')
        if link:
            link_text = clean(link)
            m = re.match(r'^([A-Z]{2,5})\s+([0-9][A-Z0-9]{2,5})\b', link_text)
    if not m:
        return None

    subject = m.group(1)
    catalog = m.group(2)

    # Credits
    try:
        credits = int(re.search(r'\b(\d+)\b', credits_raw).group(1))
    except:
        credits = 3

    # Title cleanup
    title = re.sub(r'\s*\.\s*$', '', title_raw).strip()

    return {"subject": subject, "catalog": catalog, "title": title, "credits": credits}


# ─────────────────────────────────────────────────────────────────
# BLOCK TYPE DETECTION
# ─────────────────────────────────────────────────────────────────
def detect_block_type(heading_text):
    """
    Returns: (block_type, credits_needed, courses_needed)
    """
    t = heading_text.lower().strip()

    # Required / compulsory
    if re.match(r'required|compulsory|must (take|complete)', t):
        return "required", None, None

    # "Group A" / "Group B" labels
    if re.match(r'group\s+[a-zA-Z0-9]', t):
        return "group", None, None

    # "X credits from the following" / "select X credits"
    m = re.search(r'(\d+)\s+credits?\s+(selected\s+from|from\s+the\s+following|from\s+(?:any\s+of\s+)?the\s+following)', t)
    if m:
        return "choose_credits", int(m.group(1)), None

    # "at least X credits"
    m = re.search(r'at\s+least\s+(\d+)\s+credits?', t)
    if m:
        return "choose_credits", int(m.group(1)), None

    # "X credits" as a standalone constraint
    m = re.match(r'^(\d+)\s+credits?$', t)
    if m:
        return "choose_credits", int(m.group(1)), None

    # "choose / select X courses"
    m = re.search(r'(?:choose|select|pick)\s+(\d+)\s+(?:of\s+the\s+following\s+)?courses?', t)
    if m:
        return "choose_courses", None, int(m.group(1))

    # "one of the following"
    if re.search(r'\bone\s+(?:of\s+the\s+following|course\s+from)', t):
        return "choose_courses", None, 1

    # "two of the following"
    m = re.search(r'\b(two|three|four|five|six|seven|eight)\b\s+(?:of\s+the\s+following|courses?\s+from)', t)
    if m:
        word_to_num = {"two":2,"three":3,"four":4,"five":5,"six":6,"seven":7,"eight":8}
        return "choose_courses", None, word_to_num.get(m.group(1), 1)

    # "electives" / "additional courses"
    if re.search(r'elective|additional\s+course|remaining\s+credit', t):
        return "choose_credits", None, None

    # Default: choose_credits (most blocks are "pick courses from list")
    return "choose_credits", None, None


# ─────────────────────────────────────────────────────────────────
# CONSTRAINT EXTRACTOR
# ─────────────────────────────────────────────────────────────────
def extract_constraints(soup):
    """
    Scan all paragraph text for constraint patterns.
    Returns list of constraint dicts.
    """
    constraints = []
    seen = set()

    for p in soup.find_all(['p', 'li']):
        text = clean(p)
        if text in seen or len(text) < 15:
            continue
        seen.add(text)
        t = text.lower()

        # ── "X credits from Group A and Y credits from Group B" ──
        multi = re.findall(r'(\d+)\s+credits?\s+from\s+group\s+([a-zA-Z0-9]+)', t)
        if len(multi) >= 2:
            constraints.append({
                "type": "multi_group",
                "groups": [{"credits": int(x[0]), "group": f"Group {x[1].upper()}"} for x in multi],
                "rule_text": text,
            })
            continue

        # ── "at least X credits from Groups A, B and C combined" ──
        m = re.search(r'at\s+least\s+(\d+)\s+credits?\s+(?:total\s+)?from\s+(?:groups?\s+)?(.+?)\s+combined', t)
        if m:
            constraints.append({
                "type": "pool_group",
                "min_credits": int(m.group(1)),
                "group_text": m.group(2),
                "rule_text": text,
            })
            continue

        # ── "no more than X credits at/from the Y00-level" ──
        m = re.search(r'no\s+more\s+than\s+(\d+)\s+credits?\s+(?:may\s+be\s+)?(?:at|from)\s+the\s+(\d)00[- ]level', t)
        if m:
            constraints.append({
                "type": "max_level_credits",
                "max_credits": int(m.group(1)),
                "level": int(m.group(2)) * 100,
                "rule_text": text,
            })
            continue

        # ── "only X credits may be at the 400 or 500 level" ──
        m = re.search(r'only\s+(\d+)\s+credits?\s+(?:of\s+which\s+)?(?:can|may)\s+be\s+at\s+the\s+(\d)00', t)
        if m:
            constraints.append({
                "type": "max_level_credits",
                "max_credits": int(m.group(1)),
                "level": int(m.group(2)) * 100,
                "rule_text": text,
            })
            continue

        # ── "at least X credits must be at the 300/400/500-level" ──
        m = re.search(r'at\s+least\s+(\d+)\s+credits?\s+(?:must\s+be|of\s+which\s+must\s+be)\s+(?:at\s+)?(?:the\s+)?(\d)00[- ]level', t)
        if m:
            constraints.append({
                "type": "min_level_credits",
                "min_credits": int(m.group(1)),
                "level": int(m.group(2)) * 100,
                "rule_text": text,
            })
            continue

        # ── "only 1 Special Topic course can be taken" ──
        if re.search(r'only\s+\d+\s+special\s+topic', t):
            constraints.append({
                "type": "max_special_topics",
                "rule_text": text,
            })
            continue

        # ── General program notes worth keeping ──
        if re.search(r'(prerequisite|restriction|note:|students\s+must|students\s+should|program\s+note)', t):
            constraints.append({
                "type": "note",
                "rule_text": text,
            })

    return constraints


# ─────────────────────────────────────────────────────────────────
# MAIN PARSER
# ─────────────────────────────────────────────────────────────────
def parse_program_page(html, program_key, program_name, program_type):
    soup = BeautifulSoup(html, 'html.parser')

    # ── Total credits from <h1> ──
    total_credits = None
    h1 = soup.find('h1')
    if h1:
        m = re.search(r'\((\d+)\s+credits?\)', clean(h1), re.I)
        if m:
            total_credits = int(m.group(1))

    # ── Description: first substantial <p> after h1 ──
    description = ""
    content = soup.select_one('#contentarea') or soup.find('main') or soup.body
    if content:
        for p in content.find_all('p'):
            t = clean(p)
            if len(t) > 80 and not t.startswith('Note:') and 'cookie' not in t.lower():
                description = t
                break

    # ── Extract all constraints (level rules, group rules, notes) ──
    constraints = extract_constraints(soup)

    # ── Find all course tables ──
    # McGill uses <table> elements with thead Course/Title/Credits headers
    all_tables = content.find_all('table') if content else []
    blocks = []

    for t_idx, table in enumerate(all_tables):
        courses = []
        for row in table.find_all('tr'):
            c = parse_course_row(row)
            if c:
                courses.append(c)

        if not courses:
            continue

        # ── Find the heading that precedes this table ──
        heading_text = ""
        notes_chunks = []

        # Walk backwards through siblings to find context
        sibling = table.find_previous_sibling()
        depth = 0
        while sibling and depth < 8:
            if sibling.name in ('h2', 'h3', 'h4', 'h5', 'h6'):
                heading_text = clean(sibling)
                break
            if sibling.name == 'p':
                pt = clean(sibling)
                if pt and len(pt) > 5:
                    notes_chunks.insert(0, pt)
                    # If this looks like a heading (short, no period), use it
                    if len(pt) < 80 and not pt.endswith('.') and not heading_text:
                        heading_text = pt
                        notes_chunks = notes_chunks[1:]
            elif sibling.name in ('strong', 'b'):
                t = clean(sibling)
                if t and len(t) < 100:
                    heading_text = t
                    break
            sibling = sibling.find_previous_sibling()
            depth += 1

        # Also check if the table has a <caption> or header row
        caption = table.find('caption')
        if caption:
            heading_text = clean(caption) or heading_text

        first_row = table.find('tr')
        if first_row and not heading_text:
            th_cells = first_row.find_all('th')
            if th_cells:
                th_text = clean(th_cells[0])
                if th_text.lower() not in ('course', 'code', 'courses', 'course code'):
                    heading_text = th_text

        if not heading_text:
            heading_text = f"Requirements {t_idx + 1}"

        # ── Detect block type ──
        block_type, credits_needed, courses_needed = detect_block_type(heading_text)

        # ── Check for group identifier in surrounding text ──
        group_name = None
        group_m = re.search(r'\bgroup\s+([A-Za-z0-9]+)\b', heading_text, re.I)
        if group_m:
            group_name = f"Group {group_m.group(1).upper()}"
            block_type = "group"

        # ── Mark required flag per course ──
        is_req = (block_type == "required")
        for c in courses:
            c['is_required'] = is_req

        block = {
            "block_key": f"{program_key}_{t_idx}",
            "title": heading_text,
            "block_type": block_type,
            "group_name": group_name,
            "credits_needed": credits_needed,
            "courses_needed": courses_needed,
            "notes": " | ".join(notes_chunks) if notes_chunks else "",
            "sort_order": t_idx + 1,
            "courses": courses,
        }
        blocks.append(block)

    # ── If no tables found, try to extract from <ul>/<ol> lists ──
    if not blocks and content:
        ul_blocks = []
        for ul in content.find_all(['ul', 'ol']):
            courses = []
            for li in ul.find_all('li'):
                text = clean(li)
                m = re.match(r'^([A-Z]{2,5})\s+([0-9]\w{2,5})\s*[-–]\s*(.+?)(?:\s+\((\d+)\s+credits?\))?\.?$', text)
                if m:
                    try:
                        credits = int(m.group(4)) if m.group(4) else 3
                    except:
                        credits = 3
                    courses.append({
                        "subject": m.group(1), "catalog": m.group(2),
                        "title": m.group(3).strip(), "credits": credits, "is_required": False,
                    })
            if courses:
                # Find preceding heading
                heading = ""
                prev = ul.find_previous_sibling()
                if prev and prev.name in ('h2','h3','h4','p','strong'):
                    heading = clean(prev)
                block_type, credits_needed, courses_needed = detect_block_type(heading)
                ul_blocks.append({
                    "block_key": f"{program_key}_list_{len(ul_blocks)}",
                    "title": heading or "Courses",
                    "block_type": block_type,
                    "group_name": None,
                    "credits_needed": credits_needed,
                    "courses_needed": courses_needed,
                    "notes": "",
                    "sort_order": len(ul_blocks) + 1,
                    "courses": courses,
                })
        blocks = ul_blocks

    return {
        "program_key": program_key,
        "name": program_name,
        "program_type": program_type,
        "faculty": "Faculty of Arts",
        "total_credits": total_credits,
        "description": description,
        "ecalendar_url": BASE + URL_MAP[program_key],
        "constraints": constraints,
        "blocks": blocks,
    }


# ─────────────────────────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────────────────────────
def main():
    results = []
    total = len(PROGRAMS)
    print(f"Scraping {total} Arts programs...\n")

    for i, (key, name, ptype, path) in enumerate(PROGRAMS):
        url = BASE + path
        print(f"[{i+1:3d}/{total}] {key}")

        html = fetch_page(url)
        if not html:
            results.append({"program_key": key, "name": name, "program_type": ptype,
                             "faculty": "Faculty of Arts", "error": "fetch_failed", "url": url})
            continue

        try:
            prog = parse_program_page(html, key, name, ptype)
            n_blocks  = len(prog['blocks'])
            n_courses = sum(len(b['courses']) for b in prog['blocks'])
            n_constraints = len(prog['constraints'])
            print(f"         ✓ {prog['total_credits'] or '?'}cr | {n_blocks} blocks | "
                  f"{n_courses} courses | {n_constraints} constraints")
            results.append(prog)
        except Exception as e:
            import traceback
            print(f"         ✗ PARSE ERROR: {e}")
            traceback.print_exc()
            results.append({"program_key": key, "name": name, "error": str(e)})

        time.sleep(0.4)

    out = "arts_programs_scraped.json" 
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    success = sum(1 for r in results if 'error' not in r)
    failed  = [r['program_key'] for r in results if 'error' in r]
    print(f"\n{'─'*60}")
    print(f"Done: {success}/{total} programs scraped → {out}")
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(failed)}")


if __name__ == "__main__":
    main()
