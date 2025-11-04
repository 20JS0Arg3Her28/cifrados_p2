import os
from app.crypto.crypto import (
    encrypt_bytes,
    decrypt_bytes,
    generate_rsa_keys,
    cifrar_mensaje_individual,
    descifrar_mensaje_individual,
    cifrar_mensaje_grupal,
    descifrar_mensaje_grupal,
    bytes_to_str,
    str_to_bytes,
)


def test_encrypt_decrypt_bytes_roundtrip(monkeypatch):
    # ensure secret present
    monkeypatch.setenv("APP_SECRET", "secret-for-tests")
    data = b"hello world"
    enc = encrypt_bytes(data)
    dec = decrypt_bytes(enc)
    assert dec == data


def test_rsa_hybrid_encryption_roundtrip():
    priv_b64, pub_b64 = generate_rsa_keys()
    # cifrar
    payload = cifrar_mensaje_individual("hola", pub_b64)
    assert isinstance(payload, str)
    # descifrar
    msg = descifrar_mensaje_individual(payload, priv_b64)
    assert msg == "hola"


def test_group_encryption_roundtrip():
    # AESGCM needs 32 bytes key (AES-256)
    key = os.urandom(32)
    data = cifrar_mensaje_grupal("group", key)
    assert isinstance(data, str)
    back = descifrar_mensaje_grupal(data, key)
    assert back == "group"


def test_descifrar_mensaje_individual_invalid():
    """Test error handling in descifrar_mensaje_individual (lines 89-91)"""
    priv_b64, pub_b64 = generate_rsa_keys()
    # Invalid JSON should trigger exception and return original data
    invalid_data = "not-json-data"
    result = descifrar_mensaje_individual(invalid_data, priv_b64)
    assert result == invalid_data


def test_descifrar_mensaje_grupal_invalid():
    """Test error handling in descifrar_mensaje_grupal (lines 110-112)"""
    key = os.urandom(32)
    # Invalid JSON should trigger exception and return original data
    invalid_data = "not-json-data"
    result = descifrar_mensaje_grupal(invalid_data, key)
    assert result == invalid_data


def test_bytes_to_str_with_string_input():
    """Test bytes_to_str when input is already a string (line 116)"""
    input_str = "already-a-string"
    result = bytes_to_str(input_str)
    assert result == input_str
    assert isinstance(result, str)


def test_str_to_bytes_with_bytes_input():
    """Test str_to_bytes when input is already bytes"""
    input_bytes = b"already-bytes"
    result = str_to_bytes(input_bytes)
    assert result == input_bytes
    assert isinstance(result, bytes)
