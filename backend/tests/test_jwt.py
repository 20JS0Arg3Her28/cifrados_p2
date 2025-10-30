import pytest
from unittest.mock import patch
from app.auth.jwt import create_access_token, decode_token, register_jti_in_store, is_jti_revoked


def test_create_and_decode_access_token():
    token = create_access_token({"sub": "user-1"}, scope="user")
    assert isinstance(token, str)
    payload = decode_token(token, expected_type="access")
    assert payload is not None
    assert payload.get("sub") == "user-1"


def test_register_jti_not_implemented():
    """Test that register_jti_in_store raises NotImplementedError"""
    from datetime import datetime, timezone
    with pytest.raises(NotImplementedError):
        register_jti_in_store("test-jti", datetime.now(timezone.utc), "access")


def test_is_jti_revoked_not_implemented():
    """Test that is_jti_revoked raises NotImplementedError"""
    with pytest.raises(NotImplementedError):
        is_jti_revoked("test-jti")


def test_secret_key_missing():
    """Test that missing SECRET_KEY raises RuntimeError"""
    # We need to reload the module without SECRET_KEY
    import sys
    import importlib

    # Save original module
    if 'app.auth.jwt' in sys.modules:
        original_module = sys.modules['app.auth.jwt']

    # Remove module to force reload
    if 'app.auth.jwt' in sys.modules:
        del sys.modules['app.auth.jwt']

    # Mock environment variable to be None
    with patch.dict('os.environ', {}, clear=True):
        with pytest.raises(RuntimeError, match="SECRET_KEY no definido"):
            importlib.import_module('app.auth.jwt')

    # Restore original module
    if 'original_module' in locals():
        sys.modules['app.auth.jwt'] = original_module
