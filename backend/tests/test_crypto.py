import os
import json
from Crypto.PublicKey import RSA
from app.crypto.crypto import (
    encrypt_bytes,
    decrypt_bytes,
    generate_rsa_keys,
    cifrar_mensaje_individual,
    descifrar_mensaje_individual,
    cifrar_mensaje_grupal,
    descifrar_mensaje_grupal,
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
