# McGill AI Academic Advisor

A full-stack web application that helps McGill University students navigate course selection, track academic progress, and get personalized advice — powered by Anthropic's Claude API.

**Live at**: [ai-advisor-pi.vercel.app](https://ai-advisor-pi.vercel.app)

---

## What It Does

Students create a profile (major, year, GPA, interests) and then interact with the app through several core features:

**AI Chat** — A conversational advisor powered by Claude that has full context on the student's profile, completed courses, current enrollment, saved courses, and calendar. It gives specific, personalized guidance using real McGill course codes and historical grade data.

**Proactive Advisor Cards** — AI-generated briefing cards that surface things the student needs to know: deadline warnings, prerequisite gaps, GPA insights, degree progress, and course recommendations. Students can also ask freeform questions that return as cards in their feed.

**Course Explorer** — Search McGill's course catalog with historical grade distributions (crowdsourced GPA averages per section/term), instructor info, and live RateMyProfessor ratings including quality, difficulty, and "would take again" percentages.

**Course Tracking** — Save courses to favorites, mark courses as completed (with grade and term), and flag current semester enrollments. This data feeds into the AI advisor's context for better recommendations.

**Academic Calendar** — A full calendar view with personal events, McGill academic dates, and auto-generated final exam entries based on your current courses. Supports configurable reminders via email or SMS.

**Bilingual Interface** — Full English/French language support across the entire UI.

**Theming** — Light, dark, and auto themes with a comprehensive CSS variable system built around McGill's brand colors.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7, CSS3 with CSS variables |
| Backend | Python FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL) with Row Level Security |
| AI | Anthropic Claude API (claude-opus model) |
| Auth | Supabase Auth + JWT |
| Deployment | Vercel (both frontend and backend as serverless) |
| Data | Crowdsourced CSV of ~10k+ McGill course sections with historical grades, professor ratings via RateMyProfessor scraping |

Key frontend libraries: Axios, react-markdown, react-icons, @supabase/supabase-js, remark-gfm.

---

## Project Structure

```
├── backend/
│   ├── api/
│   │   ├── main.py                    # FastAPI app, middleware, route registration
│   │   ├── config.py                  # Pydantic Settings (env validation)
│   │   ├── exceptions.py              # Custom exception handlers
│   │   ├── routes/
│   │   │   ├── chat.py                # AI chat with Claude (session management, context building)
│   │   │   ├── cards.py               # Proactive advisor cards (generate, ask, thread)
│   │   │   ├── courses.py             # Course search and details
│   │   │   ├── users.py               # User profile CRUD
│   │   │   ├── favorites.py           # Saved/bookmarked courses
│   │   │   ├── completed.py           # Completed courses with grades
│   │   │   ├── current.py             # Current semester enrollment
│   │   │   ├── suggestions.py         # Course suggestions engine
│   │   │   └── notifications.py       # Notification preferences
│   │   └── utils/
│   │       └── supabase_client.py     # Database operations
│   ├── ClassAverageCrowdSourcing.csv  # Historical grade data (~10k+ sections)
│   ├── requirements.txt
│   └── vercel.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root component, auth flow, routing
│   │   ├── theme.css                  # Full light/dark theme variable system
│   │   ├── contexts/
│   │   │   ├── LanguageContext.jsx     # i18n (EN/FR translations)
│   │   │   └── ThemeContext.jsx        # Light/dark/auto theme
│   │   ├── components/
│   │   │   ├── Auth/                  # Login/register screens
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx      # Main app shell + state management
│   │   │   │   ├── Sidebar.jsx        # Navigation, settings popup
│   │   │   │   ├── CoursesPanel.jsx   # Course explorer with RMP ratings
│   │   │   │   ├── SavedCoursesView.jsx  # Favorites/completed/current tabs
│   │   │   │   ├── CalendarTab.jsx    # Calendar with exam auto-detection
│   │   │   │   └── ChatTab.jsx        # AI chat interface
│   │   │   ├── ProfessorRating/       # RateMyProfessor display components
│   │   │   └── Profile/               # Profile editing + settings
│   │   └── lib/
│   │       ├── api.js                 # Axios client, chat/courses/users APIs
│   │       ├── favoritesAPI.js
│   │       ├── completedCoursesAPI.js
│   │       └── currentCoursesAPI.js
│   ├── package.json
│   └── .env.production
```

---

## API Endpoints

The backend exposes these route groups under `/api`:

| Prefix | Purpose |
|--------|---------|
| `/api/chat` | Send messages, get history, manage sessions |
| `/api/cards` | Generate AI briefing cards, ask questions, threaded follow-ups |
| `/api/courses` | Search courses, get details by subject/catalog, list subjects |
| `/api/users` | Create/read/update user profiles |
| `/api/favorites` | Add/remove/list saved courses |
| `/api/completed` | Add/remove completed courses (with grade, term) |
| `/api/current` | Add/remove current semester courses |
| `/api/suggestions` | AI-powered course suggestions |
| `/api/notifications` | Notification preference management |

Interactive docs available at `/docs` when running locally.

---

## Local Development

### Prerequisites

Python 3.9+, Node.js 18+, a Supabase project, and an Anthropic API key.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

```bash
uvicorn api.main:app --reload
# Runs at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
# Runs at http://localhost:5173
```

**Important**: The backend uses the Supabase **service role** key (full access). The frontend uses the **anon/public** key (restricted by RLS policies). Never expose the service key in client code.

---

## How the AI Context Works

When a student sends a chat message or requests advisor cards, the backend builds a rich context prompt that includes their full profile (major, minors, concentration, faculty, year, GPA, interests), all completed courses with grades, current enrollment, saved/bookmarked courses, upcoming calendar events, and advanced standing credits. This context is sent as a system prompt to Claude so every response is grounded in the student's actual academic situation.

The cards system uses a separate prompt that asks Claude to generate 3–6 high-value briefing cards categorized as deadlines, degree progress, course recommendations, grade insights, planning tips, or opportunities. Cards can also be generated from student questions via the "ask" endpoint.

---

## Contributing

Fork the repo, create a feature branch, and open a pull request. Follow existing code conventions, test locally, and keep commit messages clear.

---

## License

MIT