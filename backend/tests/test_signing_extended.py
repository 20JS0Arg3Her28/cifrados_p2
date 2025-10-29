import pytest
from app.crypto.signing import (
    sign_data,
    verify_signature,
    sign_data_ecdsa,
    verify_signature_ecdsa
)
from app.crypto.crypto import generate_rsa_keys, generate_ecc_keys, str_to_bytes, bytes_to_str
from Crypto.PublicKey import RSA, ECC
import base64


class TestRSASigning:
    """Extended tests for RSA signing operations"""

    def test_sign_and_verify_rsa_success(self):
        """Test successful RSA signing and verification"""
        private_key, public_key = generate_rsa_keys()
        private_key_bytes = str_to_bytes(private_key)
        public_key_bytes = str_to_bytes(public_key)

        data = "Important message to sign"
        signature = sign_data(data, private_key_bytes)

        assert verify_signature(data, signature, public_key_bytes) is True

    def test_verify_signature_with_wrong_data(self):
        """Test RSA verification fails with modified data"""
        private_key, public_key = generate_rsa_keys()
        private_key_bytes = str_to_bytes(private_key)
        public_key_bytes = str_to_bytes(public_key)

        data = "Original message"
        signature = sign_data(data, private_key_bytes)

        # Verification should fail with modified data
        assert verify_signature("Modified message", signature, public_key_bytes) is False

    def test_verify_signature_with_wrong_signature(self):
        """Test RSA verification fails with invalid signature"""
        private_key, public_key = generate_rsa_keys()
        public_key_bytes = str_to_bytes(public_key)

        data = "Test message"
        fake_signature = base64.b64encode(b"fake signature data").decode('utf-8')

        # Verification should fail with fake signature
        assert verify_signature(data, fake_signature, public_key_bytes) is False

    def test_verify_signature_with_wrong_key(self):
        """Test RSA verification fails with different public key"""
        private_key1, _ = generate_rsa_keys()
        _, public_key2 = generate_rsa_keys()

        private_key1_bytes = str_to_bytes(private_key1)
        public_key2_bytes = str_to_bytes(public_key2)

        data = "Test message"
        signature = sign_data(data, private_key1_bytes)

        # Verification should fail with different public key
        assert verify_signature(data, signature, public_key2_bytes) is False

    def test_verify_signature_with_invalid_base64(self):
        """Test RSA verification handles invalid base64 signature"""
        _, public_key = generate_rsa_keys()
        public_key_bytes = str_to_bytes(public_key)

        data = "Test message"
        invalid_signature = "not-valid-base64!@#$"

        # Should return False for invalid base64
        assert verify_signature(data, invalid_signature, public_key_bytes) is False

    def test_verify_signature_with_invalid_key(self):
        """Test RSA verification handles invalid public key"""
        private_key, _ = generate_rsa_keys()
        private_key_bytes = str_to_bytes(private_key)

        data = "Test message"
        signature = sign_data(data, private_key_bytes)

        # Invalid key bytes
        invalid_key = b"not a valid key"

        # Should return False for invalid key
        assert verify_signature(data, signature, invalid_key) is False


class TestECDSASigning:
    """Extended tests for ECDSA signing operations"""

    def test_sign_and_verify_ecdsa_success(self):
        """Test successful ECDSA signing and verification"""
        private_key, public_key = generate_ecc_keys()

        data = "Important message to sign with ECDSA"
        signature = sign_data_ecdsa(data, private_key)

        assert verify_signature_ecdsa(data, signature, public_key) is True

    def test_verify_signature_ecdsa_with_wrong_data(self):
        """Test ECDSA verification fails with modified data"""
        private_key, public_key = generate_ecc_keys()

        data = "Original ECDSA message"
        signature = sign_data_ecdsa(data, private_key)

        # Verification should fail with modified data
        assert verify_signature_ecdsa("Modified ECDSA message", signature, public_key) is False

    def test_verify_signature_ecdsa_with_wrong_signature(self):
        """Test ECDSA verification fails with invalid signature"""
        _, public_key = generate_ecc_keys()

        data = "Test ECDSA message"
        # Create a fake signature with proper base64 encoding
        fake_signature = bytes_to_str(b"fake ecdsa signature data that is long enough")

        # Verification should fail with fake signature
        assert verify_signature_ecdsa(data, fake_signature, public_key) is False

    def test_verify_signature_ecdsa_with_wrong_key(self):
        """Test ECDSA verification fails with different public key"""
        private_key1, _ = generate_ecc_keys()
        _, public_key2 = generate_ecc_keys()

        data = "Test ECDSA message"
        signature = sign_data_ecdsa(data, private_key1)

        # Verification should fail with different public key
        assert verify_signature_ecdsa(data, signature, public_key2) is False

    def test_verify_signature_ecdsa_with_invalid_signature_format(self):
        """Test ECDSA verification handles invalid signature format"""
        _, public_key = generate_ecc_keys()

        data = "Test message"
        # Invalid signature that can't be decoded
        invalid_signature = "invalid-signature-format!@#$"

        # Should return False for invalid signature
        assert verify_signature_ecdsa(data, invalid_signature, public_key) is False

    def test_verify_signature_ecdsa_with_invalid_key(self):
        """Test ECDSA verification handles invalid public key"""
        private_key, _ = generate_ecc_keys()

        data = "Test message"
        signature = sign_data_ecdsa(data, private_key)

        # Invalid key string
        invalid_key = "not a valid ECC key"

        # Should return False for invalid key
        assert verify_signature_ecdsa(data, signature, invalid_key) is False

    def test_sign_ecdsa_with_bytes_key(self):
        """Test ECDSA signing with PEM key string"""
        private_key, public_key = generate_ecc_keys()

        # Use the key directly (it's already in the correct PEM string format)
        data = "Test message with PEM key"
        signature = sign_data_ecdsa(data, private_key)

        # Should verify successfully
        assert verify_signature_ecdsa(data, signature, public_key) is True

    def test_sign_data_with_unicode(self):
        """Test signing data with unicode characters"""
        private_key, public_key = generate_ecc_keys()

        data = "Mensaje con caracteres especiales: áéíóú ñ 中文 🔐"
        signature = sign_data_ecdsa(data, private_key)

        assert verify_signature_ecdsa(data, signature, public_key) is True

    def test_sign_data_rsa_with_unicode(self):
        """Test RSA signing data with unicode characters"""
        private_key, public_key = generate_rsa_keys()
        private_key_bytes = str_to_bytes(private_key)
        public_key_bytes = str_to_bytes(public_key)

        data = "RSA: Mensaje con caracteres especiales: áéíóú ñ 中文 🔐"
        signature = sign_data(data, private_key_bytes)

        assert verify_signature(data, signature, public_key_bytes) is True

    def test_sign_empty_string(self):
        """Test signing an empty string"""
        private_key, public_key = generate_ecc_keys()

        data = ""
        signature = sign_data_ecdsa(data, private_key)

        assert verify_signature_ecdsa(data, signature, public_key) is True

    def test_sign_rsa_empty_string(self):
        """Test RSA signing an empty string"""
        private_key, public_key = generate_rsa_keys()
        private_key_bytes = str_to_bytes(private_key)
        public_key_bytes = str_to_bytes(public_key)

        data = ""
        signature = sign_data(data, private_key_bytes)

        assert verify_signature(data, signature, public_key_bytes) is True

    def test_sign_large_data(self):
        """Test signing large data"""
        private_key, public_key = generate_ecc_keys()

        # Create large data (10KB)
        data = "x" * 10000
        signature = sign_data_ecdsa(data, private_key)

        assert verify_signature_ecdsa(data, signature, public_key) is True

    def test_sign_rsa_large_data(self):
        """Test RSA signing large data"""
        private_key, public_key = generate_rsa_keys()
        private_key_bytes = str_to_bytes(private_key)
        public_key_bytes = str_to_bytes(public_key)

        # Create large data (10KB)
        data = "x" * 10000
        signature = sign_data(data, private_key_bytes)

        assert verify_signature(data, signature, public_key_bytes) is True
