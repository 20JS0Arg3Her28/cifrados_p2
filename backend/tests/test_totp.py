import pyotp
from app.auth.totp import generate_totp_secret, verify_totp_token


def test_generate_and_verify_totp():
    secret = generate_totp_secret()
    assert isinstance(secret, str) and len(secret) >= 16
    current = pyotp.TOTP(secret).now()
    assert verify_totp_token(secret, current) is True
    assert verify_totp_token(secret, "000000") is False
