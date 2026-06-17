---
'@awesome-pushup-standards/error-logging': minor
---

The `bare-except` audit now detects `except Exception:` and `except BaseException:` in addition to bare `except:`. These overly broad handlers suppress all exceptions and hide errors — they should be replaced with specific exception types.

Specific handlers like `except ValueError:` or `except KeyError:` remain unaffected (score: 1).
