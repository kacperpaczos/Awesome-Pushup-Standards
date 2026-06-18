# @awesome-pushup-standards/error-logging

## 0.2.0

### Minor Changes

- fef9c62: The `bare-except` audit now detects `except Exception:` and `except BaseException:` in addition to bare `except:`. These overly broad handlers suppress all exceptions and hide errors — they should be replaced with specific exception types.

  Specific handlers like `except ValueError:` or `except KeyError:` remain unaffected (score: 1).

## 0.1.0

### Minor Changes

- ec464e2: Initial public release of code-pushup plugins and presets.
