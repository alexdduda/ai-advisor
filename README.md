# McGill AI Academic Advisor 🎓

An intelligent, AI-powered web application designed to help McGill University students plan their academic journey. The application combines statistical analysis of historical grade data with a conversational AI interface powered by **Claude 3 Opus** to provide personalized course recommendations, grade predictions, and academic advice.

🌐 **Live Application**: [ai-advisor-pi.vercel.app](https://ai-advisor-pi.vercel.app)

## ✨ Features

### 🤖 AI Chat Advisor
Conversational interface powered by **Claude 3 Opus** (Anthropic's most capable model) to answer questions about courses, prerequisites, and career paths with context-aware responses. The AI has access to your complete chat history and student profile for truly personalized advice.

### 🔐 User Authentication
Secure authentication system with:
- Email/password registration and login
- Persistent user sessions with JWT tokens
- Secure password hashing
- User profile management

### 💾 Persistent Chat History
- Automatically saves your conversation history to Supabase cloud database
- Access past discussions from any device
- Conversations are linked to your user profile
- Complete message history maintained for context-aware AI responses

### 📊 Grade Prediction
Uses historical data and your current GPA to estimate your performance in future courses with intelligent analysis algorithms.

### 🎯 Smart Course Recommendations
Suggests courses based on:
- Your major and academic year
- Personal interests and preferences
- Preferred difficulty level
- Real historical grade data from McGill students

### 📈 Difficulty Analysis
Provides detailed course difficulty breakdowns based on crowdsourced class averages from McGill students, helping you make informed decisions about course selection.

### 🗂️ Interactive Course Explorer
Browse and search through McGill's course catalog with:
- Detailed course information
- Historical grade distributions
- Difficulty ratings
- Prerequisite information

### 🎨 McGill-Branded UI
Professional, modern dashboard design featuring:
- McGill's official colors (red #ED1B2F)
- Clean, intuitive interface
- Responsive design for all devices
- Beautiful split-screen authentication pages

### ⚡ Real-time AI Responses
- Streaming responses from Claude Opus
- Token usage tracking
- Enhanced error handling with user-friendly messages
- Conversation context maintained across sessions

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0 with Vite
- **Styling**: CSS3 with McGill branding
- **HTTP Client**: Axios
- **Markdown Rendering**: react-markdown
- **Deployment**: Vercel

### Backend
- **Framework**: Python FastAPI with async support
- **Server**: Uvicorn (ASGI server)
- **API**: RESTful endpoints with Pydantic validation
- **Authentication**: JWT tokens with secure hashing

### Database
- **Platform**: Supabase (PostgreSQL)
- **ORM**: SQLAlchemy 2.0 with async support
- **Driver**: asyncpg
- **Features**: User profiles, chat history, course data

### AI Engine
- **Model**: Anthropic Claude 3 Opus (`claude-opus-4-20250514`)
- **Max Tokens**: 4096 for detailed responses
- **Integration**: Official Anthropic Python SDK
- **Features**: Conversation history, system prompts, streaming support

### Data Processing
- **Libraries**: Pandas, NumPy
- **Purpose**: CSV data seeding and statistical analysis of course grades

## 🚀 Local Development Setup

### Prerequisites
- **Python**: 3.9 or higher
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Git**: For cloning the repository

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-advisor.git
cd ai-advisor
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

#### Install Dependencies

```bash
# Install all Python packages
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Create .env file
touch .env
```

Add the following variables to your `.env` file:

```env
# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_API_KEY_HERE

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
```

**Note**: The backend uses the Supabase service role key (not the anon key) for full database access.

**Getting your API keys:**

- **Anthropic API Key**: 
  1. Sign up at [console.anthropic.com](https://console.anthropic.com)
  2. Create an API key from the dashboard
  3. Copy the key (starts with `sk-ant-api03-`)

- **Supabase Configuration**: 
  1. Create a project at [supabase.com](https://supabase.com)
  2. Go to Project Settings → API
  3. Copy the **Project URL** (for both frontend and backend)
  4. For **backend**: Copy the **service_role** key (under "Project API keys")
  5. For **frontend**: Copy the **anon/public** key (under "Project API keys")

#### Run the Backend Server

```bash
# Make sure you're in the backend directory with venv activated
uvicorn api.main:app --reload
```

The backend server will start at `http://localhost:8000`

You can verify it's running by visiting `http://localhost:8000/docs` to see the interactive API documentation.

### 3. Frontend Setup

Open a new terminal window/tab (keep the backend running).

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

#### Configure Frontend Environment

Create a `.env` file in the `frontend` directory:

```bash
# Create .env file
touch .env
```

Add the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=http://localhost:8000/api
```

**Note**: 
- The frontend uses the Supabase **anon/public** key (not the service role key)
- For production, change `VITE_API_URL` to your deployed backend URL

#### Run the Frontend Development Server

```bash
# Start the development server
npm run dev
```

The frontend will start at `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the McGill AI Advisor login page. Create an account to start using the application!

## 📝 Development Workflow

### Running Both Servers Simultaneously

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn api.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Making Changes

- **Frontend changes**: Hot Module Replacement (HMR) is enabled - changes will appear instantly
- **Backend changes**: The server will auto-reload when you save Python files
- **Database schema changes**: Modify `backend/database.py` and restart the server

### Testing the AI Chat

1. Create an account or log in
2. Fill out your student profile (major, year, interests, GPA)
3. Start chatting with the AI advisor
4. Try questions like:
   - "What are some good computer science courses for beginners?"
   - "Can you recommend courses for my major?"
   - "What's the average grade for COMP 251?"

**Security Note**: Never commit your `.env` files to version control. The `.gitignore` file is configured to exclude them.

## 📁 Project Structure

```
ai-advisor/
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── chat.py          # AI chat endpoints
│   │   │   ├── profile.py       # User profile endpoints
│   │   │   └── courses.py       # Course data endpoints
│   │   ├── utils/
│   │   │   └── supabase_client.py # Database operations
│   │   ├── config.py            # Configuration management
│   │   └── exceptions.py        # Custom exceptions
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # SQLAlchemy models
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables (not tracked)
│   ├── vercel.json              # Vercel serverless config
│   └── ClassAverageCrowdSourcing.csv
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Auth.css
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Dashboard.css
│   │   │   ├── Chat/
│   │   │   │   ├── Chat.jsx
│   │   │   │   └── Chat.css
│   │   │   └── Profile/
│   │   │       ├── Profile.jsx
│   │   │       └── Profile.css
│   │   ├── App.jsx              # Main application component
│   │   ├── App.css              # Global styles
│   │   └── main.jsx             # React entry point
│   ├── public/                  # Static assets
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js           # Vite configuration
│   └── .env                     # Frontend environment variables
│
├── .gitignore
├── LICENSE
└── README.md
```

## 🔍 Key Files Explained

### Understanding Supabase Keys

The project uses **two different** Supabase keys for security:

1. **Anon/Public Key** (Frontend - `VITE_SUPABASE_ANON_KEY`):
   - Safe to expose in client-side code
   - Has limited permissions based on Row Level Security (RLS) policies
   - Used for user authentication and authorized data access
   
2. **Service Role Key** (Backend - `SUPABASE_SERVICE_KEY`):
   - **Never** expose this in client-side code
   - Has full admin access to bypass RLS policies
   - Used for server-side operations that need elevated privileges
   - Keep this secret and only use it in backend code

### Backend

- **`main.py`**: FastAPI application initialization, CORS configuration, route mounting
- **`database.py`**: SQLAlchemy models for users, messages, courses, and profiles
- **`api/routes/chat.py`**: Claude Opus integration, chat history management
- **`api/routes/auth.py`**: User registration, login, JWT token generation
- **`api/config.py`**: Centralized configuration using Pydantic Settings
- **`api/utils/supabase_client.py`**: Database operations and queries

### Frontend

- **`App.jsx`**: Main application with routing and authentication state
- **`components/Dashboard/Dashboard.jsx`**: Main dashboard with navigation
- **`components/Chat/Chat.jsx`**: AI chat interface with markdown rendering
- **`components/Profile/Profile.jsx`**: User profile management
- **`components/Auth/Login.jsx`**: Authentication forms with validation

## 🔧 Configuration

### Backend Configuration (`backend/api/config.py`)

The application uses Pydantic Settings for centralized configuration management:

```python
class Settings(BaseSettings):
    anthropic_api_key: str
    supabase_url: str
    supabase_service_key: str
    # ... other settings
    
    class Config:
        env_file = ".env"
```

All environment variables are loaded from the `.env` file and validated on startup.

### Frontend API Client

Axios instance with base URL configuration:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

Supabase client initialization:

```javascript
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## 🐛 Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'X'"**
- Ensure your virtual environment is activated
- Run `pip install -r requirements.txt` again

**"Connection to database failed"**
- Verify your `SUPABASE_URL` is correct
- Check that your `SUPABASE_SERVICE_KEY` is the service_role key (not anon key)
- Ensure your Supabase project is running
- Test the connection by visiting your Supabase project dashboard

**"Invalid API key"**
- Verify your `ANTHROPIC_API_KEY` is correct
- Check that you have credits in your Anthropic account

### Frontend Issues

**"Failed to fetch" or CORS errors**
- Ensure backend server is running on `http://localhost:8000`
- Verify `VITE_API_URL` in frontend `.env` is set to `http://localhost:8000/api`
- Check that both frontend and backend are using the same Supabase project
- Make sure you're using the correct Supabase keys (anon key for frontend, service key for backend)

**"npm: command not found"**
- Install Node.js from [nodejs.org](https://nodejs.org)

**Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Database Issues

**Tables not created**
- The application creates tables automatically on first run
- Check database connection logs in backend console
- Verify your database user has CREATE privileges

## 📊 API Documentation

When the backend is running, visit:
- **Interactive API docs**: `http://localhost:8000/docs`
- **Alternative docs**: `http://localhost:8000/redoc`

### Key Endpoints

```
POST   /api/auth/register      # Create new user account
POST   /api/auth/login         # Authenticate user
GET    /api/auth/me            # Get current user info

POST   /api/chat/send          # Send message to AI
GET    /api/chat/history       # Get chat history

GET    /api/profile            # Get user profile
PUT    /api/profile            # Update user profile

GET    /api/courses            # Get all courses
GET    /api/courses/search     # Search courses
```

## 🧪 Future Roadmap

- [x] **Real Claude AI Integration**: Implemented with Claude 3 Opus
- [x] **Persistent Chat History**: Implemented with Supabase
- [x] **User Authentication**: Implemented with JWT
- [x] **Production Deployment**: Deployed on Vercel
- [ ] **Prerequisite Checking**: Implement a DAG (Directed Acyclic Graph) to validate course requirements
- [ ] **Machine Learning Enhancement**: Replace heuristic grade prediction with Scikit-Learn regression models
- [ ] **Password Reset**: Email-based password recovery
- [ ] **Email Verification**: Verify user emails on registration
- [ ] **OAuth Providers**: Google and Microsoft SSO
- [ ] **Mobile App**: React Native mobile application
- [ ] **Course Schedule Builder**: Visual semester planning with conflict detection
- [ ] **Peer Reviews**: Community-driven course reviews and ratings
- [ ] **Export Conversations**: Download chat history as PDF or text
- [ ] **Voice Input**: Speech-to-text for accessibility

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add comments for complex logic
- Test your changes locally before submitting
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Course Data**: Sourced from McGill student crowdsourcing efforts
- **AI Technology**: Powered by Anthropic's Claude 3 Opus
- **Database**: Hosted on Supabase
- **Deployment**: Vercel serverless platform
- **Built for**: McGill University students

## 📧 Contact & Support

- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Questions**: Use GitHub Discussions for general questions
- **Email**: [Your contact email]

## 🌟 Star History

If you find this project helpful, please consider giving it a star on GitHub!

---

**Made with ❤️ for McGill students**

*Last updated: December 2025*
