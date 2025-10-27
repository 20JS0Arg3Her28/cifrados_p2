from app.crypto.hashing import generate_hash, verify_hash


def test_hashing_deterministic_and_verify():
    v1 = generate_hash("hello")
    v2 = generate_hash("hello")
    assert v1 == v2
    assert verify_hash("hello", v1) is True
    assert verify_hash("bye", v1) is False
