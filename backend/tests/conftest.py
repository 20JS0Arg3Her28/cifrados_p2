import os
import sys
from pathlib import Path
import pytest

# Ensure minimal secrets for crypto/jwt
os.environ.setdefault("SECRET_KEY", "testsecretkey")
os.environ.setdefault("APP_SECRET", "appsecret-for-tests")
os.environ.setdefault("SESSION_SECRET_KEY", "session-secret")

# Set DATABASE_URL for tests (SQLite in-memory for testing)
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Ensure 'app' package is importable when running locally
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

@pytest.fixture(autouse=True)
def patch_jti_store(monkeypatch):
    """Patch JWT JTI store hooks so token creation doesn't raise NotImplementedError."""
    from app.auth import jwt as jwtmod
    monkeypatch.setattr(jwtmod, "register_jti_in_store", lambda jti, expires_at, token_type: None, raising=False)
    monkeypatch.setattr(jwtmod, "is_jti_revoked", lambda jti: False, raising=False)
    yield
