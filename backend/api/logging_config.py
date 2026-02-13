"""
backend/api/logging_config.py

"""
import logging
import logging.handlers
import sys
import os
import json
from datetime import datetime, timezone

from .config import settings


class JSONFormatter(logging.Formatter):
    """Structured JSON formatter for production log aggregation."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Attach request_id if present
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id

        # Attach extra fields passed via `extra={...}`
        for key in ("code", "status_code", "path", "details"):
            if hasattr(record, key):
                log_entry[key] = getattr(record, key)

        # Attach exception info
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str)


def setup_logging() -> logging.Logger:
    """Configure application logging with console + optional file output."""

    # ── Determine log level ──────────────────────────────────────────────
    log_level_name = os.getenv("LOG_LEVEL", "DEBUG" if settings.DEBUG else "INFO")
    log_level = getattr(logging, log_level_name.upper(), logging.INFO)

    # ── Console handler (always active) ──────────────────────────────────
    if settings.ENVIRONMENT == "production":
        console_formatter = JSONFormatter()
    else:
        console_formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(log_level)

    # ── File handler with rotation (if LOG_FILE is set) ──────────────────
    log_file = os.getenv("LOG_FILE")  # e.g. "logs/app.log"
    file_handler = None

    if log_file:
        log_dir = os.path.dirname(log_file)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)

        file_handler = logging.handlers.RotatingFileHandler(
            filename=log_file,
            maxBytes=10 * 1024 * 1024,  # 10 MB per file
            backupCount=5,              # keep 5 rotated files
            encoding="utf-8",
        )
        file_handler.setFormatter(JSONFormatter())  # always JSON on disk
        file_handler.setLevel(log_level)

    # ── Root logger ──────────────────────────────────────────────────────
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    # Remove any previously attached handlers (avoid duplicates on reload)
    root_logger.handlers.clear()
    root_logger.addHandler(console_handler)
    if file_handler:
        root_logger.addHandler(file_handler)

    # ── Third-party noise reduction ──────────────────────────────────────
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)

    root_logger.info(
        "Logging configured — level=%s, file=%s, format=%s",
        log_level_name,
        log_file or "(console only)",
        "json" if settings.ENVIRONMENT == "production" else "text",
    )

    return root_logger