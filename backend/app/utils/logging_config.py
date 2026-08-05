import logging
import sys

from app.core.config import settings


def configure_logging() -> None:
    """Configure root logging for the application."""
    logging.basicConfig(
        level=settings.log_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        stream=sys.stdout,
    )
