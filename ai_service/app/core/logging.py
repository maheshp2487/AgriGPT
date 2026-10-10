import json
import logging
import re
import sys
from typing import Any, Dict


PHONE_REGEX = re.compile(r"\b[6-9]\d{9}\b")
AADHAAR_REGEX = re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")
GPS_PRECISION_REGEX = re.compile(r"(\b-?\d{1,3}\.\d{2})\d{2,8}\b")


def sanitize_pii(text: str) -> str:
    """
    Redacts sensitive Indian farmer PII and truncates high-precision GPS.
    """
    if not isinstance(text, str):
        return text

    # Redact phone numbers
    redacted = PHONE_REGEX.sub("[PHONE_REDACTED]", text)
    # Redact Aadhaar numbers
    redacted = AADHAAR_REGEX.sub("[AADHAAR_REDACTED]", redacted)
    # Truncate high-precision GPS coordinates to 2 decimal places (~1.1km)
    redacted = GPS_PRECISION_REGEX.sub(r"\1**", redacted)
    return redacted


class PIISafeJsonFormatter(logging.Formatter):
    """
    Emits single-line JSON logs with automatic PII sanitization.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": sanitize_pii(record.getMessage()),
        }

        if hasattr(record, "correlation_id"):
            log_entry["correlation_id"] = record.correlation_id
        elif hasattr(record, "request_id"):
            log_entry["correlation_id"] = record.request_id

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, ensure_ascii=False)


def setup_logger(name: str = "agrigpt", level: str = "INFO") -> logging.Logger:
    logr = logging.getLogger(name)
    logr.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Avoid duplicate handlers
    if not logr.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(PIISafeJsonFormatter())
        logr.addHandler(handler)

    logr.propagate = False
    return logr


def get_logger(name: str = "agrigpt") -> logging.Logger:
    return setup_logger(name)


logger = setup_logger()
