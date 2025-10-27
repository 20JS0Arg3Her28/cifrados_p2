from app.utils.sanitize import sanitize_for_output
from app.auth.utils import get_password_hash, verify_password


def test_sanitize_basic_cases():
    cases = [
        ("<script>alert(1)</script>", "&lt;script&gt;alert(1)&lt;/script&gt;"),
        ("Normal", "Normal"),
        ("", ""),
    ]
    for txt, expected in cases:
        assert sanitize_for_output(txt) == expected


def test_password_hash_and_verify():
    pwd = "StrongP@ssw0rd"
    hashed = get_password_hash(pwd)
    assert hashed and isinstance(hashed, str)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrong", hashed) is False
