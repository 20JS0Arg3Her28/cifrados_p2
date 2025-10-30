import pytest
from fastapi import HTTPException
from app.auth.dependencies import get_current_user
from app.auth.jwt import create_token
from datetime import timedelta


def test_get_current_user_valid_token():
    """Test get_current_user with a valid access token."""
    # Create a valid access token
    token = create_token(
        data={"sub": "testuser"},
        expires_delta=timedelta(minutes=30),
        token_type="access"
    )

    # Call get_current_user with the valid token
    result = get_current_user(token=token)

    # Should return the username (from 'sub' claim)
    assert result == "testuser"


def test_get_current_user_invalid_token():
    """Test get_current_user with an invalid token."""
    invalid_token = "invalid.jwt.token"

    # Should raise HTTPException with 401 status
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(token=invalid_token)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"


def test_get_current_user_wrong_token_type():
    """Test get_current_user with a refresh token (wrong type)."""
    # Create a refresh token instead of access token
    refresh_token = create_token(
        data={"sub": "testuser"},
        expires_delta=timedelta(hours=1),
        token_type="refresh"
    )

    # Should raise HTTPException because it expects access token
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(token=refresh_token)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"
