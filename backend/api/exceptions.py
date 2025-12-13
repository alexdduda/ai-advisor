"""
Custom exceptions and error handlers
"""
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from enum import Enum
from typing import Optional, Any
import logging

logger = logging.getLogger(__name__)


class ErrorCode(str, Enum):
    """Standardized error codes"""
    # General
    INTERNAL_ERROR = "internal_error"
    VALIDATION_ERROR = "validation_error"
    NOT_FOUND = "not_found"
    
    # Authentication
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    INVALID_TOKEN = "invalid_token"
    TOKEN_EXPIRED = "token_expired"
    
    # Users
    USER_NOT_FOUND = "user_not_found"
    USER_ALREADY_EXISTS = "user_already_exists"
    PROFILE_CREATE_FAILED = "profile_create_failed"
    
    # Database
    DATABASE_ERROR = "database_error"
    DATABASE_CONNECTION_ERROR = "database_connection_error"
    
    # Chat
    CHAT_HISTORY_ERROR = "chat_history_error"
    MESSAGE_TOO_LONG = "message_too_long"
    AI_SERVICE_ERROR = "ai_service_error"
    
    # Courses
    COURSE_NOT_FOUND = "course_not_found"
    COURSE_SEARCH_ERROR = "course_search_error"
    
    # Rate Limiting
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"


class ErrorResponse(BaseModel):
    """Standardized error response"""
    code: ErrorCode
    message: str
    details: Optional[Any] = None
    request_id: Optional[str] = None


class AppException(HTTPException):
    """Base application exception"""
    def __init__(
        self,
        status_code: int,
        code: ErrorCode,
        message: str,
        details: Optional[Any] = None
    ):
        self.code = code
        self.details = details
        super().__init__(status_code=status_code, detail=message)


# Specific Exceptions
class UserNotFoundException(AppException):
    def __init__(self, user_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code=ErrorCode.USER_NOT_FOUND,
            message=f"User not found",
            details={"user_id": user_id}
        )


class UserAlreadyExistsException(AppException):
    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code=ErrorCode.USER_ALREADY_EXISTS,
            message="A user with this email already exists",
            details={"email": email}
        )


class DatabaseException(AppException):
    def __init__(self, operation: str, details: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code=ErrorCode.DATABASE_ERROR,
            message=f"Database operation failed: {operation}",
            details={"operation": operation, "error": details}
        )


class AIServiceException(AppException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code=ErrorCode.AI_SERVICE_ERROR,
            message="AI service temporarily unavailable",
            details=details
        )


class MessageTooLongException(AppException):
    def __init__(self, length: int, max_length: int):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=ErrorCode.MESSAGE_TOO_LONG,
            message=f"Message too long. Maximum {max_length} characters allowed",
            details={"length": length, "max_length": max_length}
        )


class RateLimitException(AppException):
    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code=ErrorCode.RATE_LIMIT_EXCEEDED,
            message="Too many requests. Please try again later",
            details={"retry_after": retry_after}
        )


# Error Handlers
async def app_exception_handler(request: Request, exc: AppException):
    """Handler for custom application exceptions"""
    logger.error(
        f"AppException: {exc.code} - {exc.detail}",
        extra={
            "code": exc.code,
            "status_code": exc.status_code,
            "path": request.url.path,
            "details": exc.details
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.detail,
            "details": exc.details
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler for Pydantic validation errors"""
    logger.warning(
        f"Validation error on {request.url.path}",
        extra={"errors": exc.errors()}
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "code": ErrorCode.VALIDATION_ERROR,
            "message": "Invalid request data",
            "details": exc.errors()
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handler for unexpected exceptions"""
    logger.exception(
        f"Unexpected error on {request.url.path}: {str(exc)}",
        exc_info=exc
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": ErrorCode.INTERNAL_ERROR,
            "message": "An unexpected error occurred",
            "details": None  # Never expose internal error details in production
        }
    )