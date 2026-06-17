import logging
logger = logging.getLogger(__name__)

def run():
    try:
        pass
    except ValueError as exc:
        logger.exception("failed", exc_info=exc)
