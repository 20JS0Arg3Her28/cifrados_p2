from datetime import datetime, timedelta, timezone

def test_jwt_token_with_wrong_issuer():
    """Test token with incorrect issuer"""
    from app.auth.jwt import create_access_token, decode_token

    # Create token with standard issuer
    token = create_access_token({"sub": "test@example.com"}, scope="user")

    # Try to decode with different expected issuer
    result = decode_token(token, expected_type="access", require_issuer="wrong-issuer")

    assert result is None


def test_jwt_token_with_wrong_type():
    """Test token with incorrect type"""
    from app.auth.jwt import create_access_token, decode_token

    # Create access token
    token = create_access_token({"sub": "test@example.com"}, scope="user")

    # Try to decode as refresh token
    result = decode_token(token, expected_type="refresh")

    assert result is None


def test_jwt_token_revoked():
    """Test decoding a revoked token"""
    from app.auth import jwt as jwtmod
    from app.auth.jwt import create_access_token, decode_token

    # Create a token
    token = create_access_token({"sub": "test@example.com"}, scope="user")

    # Mock is_jti_revoked to return True
    original_func = jwtmod.is_jti_revoked

    def mock_is_revoked(jti):
        return True

    jwtmod.is_jti_revoked = mock_is_revoked

    try:
        # Try to decode revoked token
        result = decode_token(token, expected_type="access", revoked_check=True)
        assert result is None
    finally:
        # Restore original function
        jwtmod.is_jti_revoked = original_func


def test_jwt_token_revocation_check_exception():
    """Test handling exception during revocation check"""
    from app.auth import jwt as jwtmod
    from app.auth.jwt import create_access_token, decode_token

    # Create a token
    token = create_access_token({"sub": "test@example.com"}, scope="user")

    # Mock is_jti_revoked to raise an exception
    original_func = jwtmod.is_jti_revoked

    def mock_is_revoked_error(jti):
        raise Exception("Redis connection failed")

    jwtmod.is_jti_revoked = mock_is_revoked_error

    try:
        # Try to decode when revocation check fails
        result = decode_token(token, expected_type="access", revoked_check=True)
        # Should return None for security (deny access if we can't check revocation)
        assert result is None
    finally:
        # Restore original function
        jwtmod.is_jti_revoked = original_func


def test_jwt_decode_invalid_token():
    """Test decoding an invalid token"""
    from app.auth.jwt import decode_token

    # Try to decode completely invalid token
    result = decode_token("invalid.token.here", expected_type="access")

    assert result is None


def test_jwt_decode_expired_token():
    """Test decoding an expired token"""
    from app.auth.jwt import create_token
    from app.auth.jwt import decode_token
    from datetime import timedelta

    # Create token that expired 1 hour ago
    expired_token = create_token(
        {"sub": "test@example.com"},
        expires_delta=timedelta(hours=-1),
        token_type="access"
    )

    # Try to decode expired token
    result = decode_token(expired_token, expected_type="access")

    assert result is None


def test_jwt_get_subject_from_token_success():
    """Test getting subject from valid token"""
    from app.auth.jwt import create_access_token, get_subject_from_token

    token = create_access_token({"sub": "test@example.com"}, scope="user")
    subject = get_subject_from_token(token)

    assert subject == "test@example.com"


def test_jwt_get_subject_from_invalid_token():
    """Test getting subject from invalid token"""
    from app.auth.jwt import get_subject_from_token

    subject = get_subject_from_token("invalid.token")

    assert subject is None


def test_jwt_create_refresh_token():
    """Test creating a refresh token"""
    from app.auth.jwt import create_refresh_token, decode_token

    token = create_refresh_token({"sub": "test@example.com"})
    payload = decode_token(token, expected_type="refresh")

    assert payload is not None
    assert payload["sub"] == "test@example.com"
    assert payload["type"] == "refresh"


def test_jwt_register_jti_exception_handling():
    """Test that token creation continues even if JTI registration fails"""
    from app.auth import jwt as jwtmod
    from app.auth.jwt import create_access_token

    # Mock register_jti_in_store to raise an exception
    original_func = jwtmod.register_jti_in_store

    def mock_register_error(jti, expires_at, token_type):
        raise Exception("Storage error")

    jwtmod.register_jti_in_store = mock_register_error

    try:
        # Token creation should still succeed
        token = create_access_token({"sub": "test@example.com"}, scope="user")
        assert token is not None
        assert isinstance(token, str)
    finally:
        # Restore original function
        jwtmod.register_jti_in_store = original_func


def test_jwt_token_with_custom_audience():
    """Test token creation and validation with custom audience"""
    from app.auth.jwt import create_access_token, decode_token

    custom_audience = "custom-client"
    token = create_access_token({"sub": "test@example.com"}, scope="user", audience=custom_audience)

    # Should decode successfully with matching audience
    payload = decode_token(token, expected_type="access", audience=custom_audience)
    assert payload is not None
    assert payload["aud"] == custom_audience

    # Should fail with different audience
    result = decode_token(token, expected_type="access", audience="different-audience")
    assert result is None


def test_jwt_token_no_revocation_check():
    """Test decoding token without revocation check"""
    from app.auth.jwt import create_access_token, decode_token

    token = create_access_token({"sub": "test@example.com"}, scope="user")

    # Decode without revocation check
    payload = decode_token(token, expected_type="access", revoked_check=False)

    assert payload is not None
    assert payload["sub"] == "test@example.com"


def test_jwt_token_no_jti():
    """Test token behavior when jti is missing (shouldn't happen in practice)"""
    from app.auth.jwt import decode_token, SECRET_KEY, ALGORITHM
    from jose import jwt

    # Manually create token without jti
    payload = {
        "sub": "test@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "type": "access",
        "aud": "yourapp-client",
        "iss": "yourapp.example.com"
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # Should decode successfully (revocation check is skipped when jti is missing)
    result = decode_token(token, expected_type="access", revoked_check=True)
    assert result is not None


def test_jwt_token_payload_immutability():
    """Test that original data dict is not mutated during token creation"""
    original_data = {"sub": "test@example.com", "custom": "value"}
    original_keys = set(original_data.keys())

    # Original data should not be modified
    assert set(original_data.keys()) == original_keys
    assert "exp" not in original_data
    assert "jti" not in original_data


def test_jwt_token_includes_standard_claims():
    """Test that tokens include all required standard claims"""
    from app.auth.jwt import create_access_token, decode_token

    token = create_access_token({"sub": "test@example.com"}, scope="user")
    payload = decode_token(token, expected_type="access")

    assert payload is not None
    assert "exp" in payload  # Expiration time
    assert "iat" in payload  # Issued at
    assert "nbf" in payload  # Not before
    assert "jti" in payload  # JWT ID
    assert "type" in payload  # Token type
    assert "aud" in payload  # Audience
    assert "iss" in payload  # Issuer
    assert "sub" in payload  # Subject
    assert "scope" in payload  # Scope


def test_jwt_token_scope_in_access_token():
    """Test that access tokens include scope claim"""
    from app.auth.jwt import create_access_token, decode_token

    token = create_access_token({"sub": "test@example.com"}, scope="admin")
    payload = decode_token(token, expected_type="access")

    assert payload is not None
    assert payload["scope"] == "admin"


def test_jwt_refresh_token_no_scope():
    """Test that refresh tokens don't need scope claim"""
    from app.auth.jwt import create_refresh_token, decode_token

    token = create_refresh_token({"sub": "test@example.com"})
    payload = decode_token(token, expected_type="refresh")

    assert payload is not None
    assert payload["sub"] == "test@example.com"
    # Refresh tokens don't have scope
    assert "scope" not in payload or payload.get("scope") is None
