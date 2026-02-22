"""
Chat endpoints with AI integration and session management
"""
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import anthropic
import logging
import uuid

from api.utils.supabase_client import (
    get_user_by_id,
    get_chat_history,
    save_message,
    delete_chat_history,
    get_user_sessions,
    delete_chat_session
)
from api.config import settings
from api.exceptions import UserNotFoundException, DatabaseException

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    """Chat message schema"""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    """Chat request schema"""
    message: str = Field(..., min_length=1, max_length=4000)
    user_id: str
    session_id: Optional[str] = None

    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "message": "What are some good computer science courses for a beginner?",
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "session_id": "optional-session-uuid"
            }
        }


class ChatResponse(BaseModel):
    """Chat response schema"""
    response: str
    user_id: str
    session_id: str
    tokens_used: Optional[int] = None


# ── Context builder ───────────────────────────────────────────────────────────

def build_system_context(user: dict) -> str:
    """
    Build a rich system context for Claude using all available student data.
    Fetches favorites, completed courses, current courses, and calendar events
    from Supabase to give Claude full context about the student.
    Falls back to minimal context if the extended fetch fails.
    """
    try:
        # Import here to avoid circular imports
        from api.routes.cards import fetch_student_context, build_rich_context
        ctx = fetch_student_context(user["id"])
        return build_rich_context(ctx) + """

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHAT MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are now answering a direct question from the student.
- Answer helpfully, specifically, and concisely (2–4 paragraphs max)
- Reference actual McGill course codes and data from the profile above where relevant
- Do not repeat back the student's profile to them — just answer their question
- Be encouraging and honest about trade-offs
"""
    except Exception as e:
        logger.warning(f"Extended context fetch failed, falling back to minimal context: {e}")
        return f"""You are an AI academic advisor for McGill University students.

Student Profile:
- Major: {user.get('major', 'Undeclared')}
- Year: {user.get('year', 'Not specified')}
- Interests: {user.get('interests', 'Not specified')}
- Current GPA: {user.get('current_gpa', 'Not specified')}

Your responsibilities:
1. Provide personalized course recommendations based on the student's profile
2. Help with course selection and academic planning
3. Answer questions about prerequisites and course requirements
4. Offer study advice and academic guidance
5. Predict potential performance based on historical grade data when available

Guidelines:
- Be friendly, encouraging, and supportive
- Provide specific, actionable advice
- Reference actual McGill courses when relevant
- Be honest about limitations in your knowledge
- Suggest consulting official McGill resources when appropriate
- Keep responses concise but informative (aim for 2-4 paragraphs)
"""


def format_chat_history(messages: List[dict]) -> List[dict]:
    """Format chat history for Claude API"""
    return [
        {"role": msg["role"], "content": msg["content"]}
        for msg in messages
    ]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message and get AI response

    - **message**: The user's message (1-4000 characters)
    - **user_id**: The user's unique identifier
    - **session_id**: Optional session ID for continuing a conversation
    """
    try:
        MAX_MESSAGE_LENGTH = 4000
        if len(request.message) > MAX_MESSAGE_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Message too long. Maximum {MAX_MESSAGE_LENGTH} characters."
            )

        session_id = request.session_id or str(uuid.uuid4())
        logger.info(f"Processing message for session: {session_id}")

        # Verify user exists and get profile
        user = get_user_by_id(request.user_id)

        # Save user message
        save_message(request.user_id, "user", request.message, session_id)

        # Get chat history for this session only
        history = get_chat_history(request.user_id, session_id=session_id, limit=10)

        # Build enriched system context
        system_context = build_system_context(user)

        # Prepare messages for Claude
        CHAT_CONTEXT_MESSAGES = 8
        recent_history = history[-CHAT_CONTEXT_MESSAGES:] if len(history) > CHAT_CONTEXT_MESSAGES else history
        formatted_history = format_chat_history(recent_history)
        formatted_history.append({
            "role": "user",
            "content": request.message
        })

        # Call Claude
        try:
            api_key = settings.ANTHROPIC_API_KEY
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment")

            client = anthropic.Anthropic(api_key=api_key)

            logger.info(f"Calling Claude with {len(formatted_history)} messages for session {session_id}")

            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2048,
                system=system_context,
                messages=formatted_history
            )

            assistant_response = message.content[0].text
            tokens_used = message.usage.input_tokens + message.usage.output_tokens

            logger.info(f"AI response generated. Tokens used: {tokens_used}")

        except anthropic.APIError as e:
            logger.error(f"Anthropic API error: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable. Please try again in a moment."
            )
        except Exception as e:
            logger.exception(f"Unexpected error calling Claude API: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error generating AI response"
            )

        # Save assistant response
        save_message(request.user_id, "assistant", assistant_response, session_id)

        return ChatResponse(
            response=assistant_response,
            user_id=request.user_id,
            session_id=session_id,
            tokens_used=tokens_used
        )

    except UserNotFoundException:
        raise
    except DatabaseException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your message"
        )


@router.get("/history/{user_id}", response_model=dict)
async def get_history(
    user_id: str,
    session_id: Optional[str] = Query(None, description="Optional session ID filter"),
    limit: int = Query(default=50, ge=1, le=200)
):
    """
    Get user's chat history, optionally filtered by session

    - **user_id**: The user's unique identifier
    - **session_id**: Optional session ID to filter messages
    - **limit**: Maximum number of messages to return (1-200, default 50)
    """
    try:
        get_user_by_id(user_id)
        messages = get_chat_history(user_id, session_id=session_id, limit=limit)
        return {
            "messages": messages,
            "count": len(messages),
            "session_id": session_id
        }
    except UserNotFoundException:
        raise
    except DatabaseException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error getting chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving chat history"
        )


@router.get("/sessions/{user_id}", response_model=dict)
async def get_sessions(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100)
):
    """
    Get all chat sessions for a user

    - **user_id**: The user's unique identifier
    - **limit**: Maximum number of sessions to return (1-100, default 20)
    """
    try:
        get_user_by_id(user_id)
        sessions = get_user_sessions(user_id, limit=limit)
        return {
            "sessions": sessions,
            "count": len(sessions)
        }
    except UserNotFoundException:
        raise
    except DatabaseException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error getting sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving sessions"
        )


@router.delete("/session/{user_id}/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def clear_session(user_id: str, session_id: str):
    """
    Delete a specific chat session

    - **user_id**: The user's unique identifier
    - **session_id**: The session to delete
    """
    try:
        get_user_by_id(user_id)
        delete_chat_session(user_id, session_id)
        logger.info(f"Session {session_id} deleted for user: {user_id}")
        return None
    except UserNotFoundException:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except DatabaseException as e:
        logger.error(f"Failed to delete session {session_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete session")
    except Exception as e:
        logger.exception(f"Unexpected error deleting session: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred")


@router.delete("/history/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history(user_id: str):
    """
    Clear ALL chat history for a user (all sessions)

    - **user_id**: The user's unique identifier
    """
    try:
        get_user_by_id(user_id)
        delete_chat_history(user_id)
        logger.info(f"All chat history cleared for user: {user_id}")
        return None
    except UserNotFoundException:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except DatabaseException as e:
        logger.error(f"Failed to clear chat history for {user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to clear chat history. Please try again.")
    except Exception as e:
        logger.exception(f"Unexpected error clearing chat history: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred")