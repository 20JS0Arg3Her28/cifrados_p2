from app.crypto.signing import sign_data, verify_signature, sign_data_ecdsa, verify_signature_ecdsa
from Crypto.PublicKey import RSA, ECC


def test_rsa_sign_and_verify():
    rsa_key = RSA.generate(2048)
    private_pem = rsa_key.export_key()
    public_pem = rsa_key.publickey().export_key()
    msg = "message"
    sig = sign_data(msg, private_pem)
    assert verify_signature(msg, sig, public_pem) is True
    # Tamper should fail
    assert verify_signature(msg + "x", sig, public_pem) is False


def test_ecdsa_sign_and_verify():
    ecc_key = ECC.generate(curve='P-256')
    private_pem = ecc_key.export_key(format='PEM')
    public_pem = ecc_key.public_key().export_key(format='PEM')
    msg = "hola"
    sig = sign_data_ecdsa(msg, private_pem)
    assert verify_signature_ecdsa(msg, sig, public_pem) is True
    assert verify_signature_ecdsa(msg + "!", sig, public_pem) is False
