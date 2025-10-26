from app.auth.jwt import create_access_token, decode_token


def test_create_and_decode_access_token():
    token = create_access_token({"sub": "user-1"}, scope="user")
    assert isinstance(token, str)
    payload = decode_token(token, expected_type="access")
    assert payload is not None
    assert payload.get("sub") == "user-1"
