"""Security Utilities"""
from passlib.context import CryptContext
import pyotp
from urllib.parse import quote
import random
import string

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def generate_2fa_secret() -> str:
    return pyotp.random_base32()

def build_otpauth_url(secret: str, email: str, issuer: str = "ENConsultingApp") -> str:
    label = f"{issuer}:{email}"
    return f"otpauth://totp/{quote(label)}?secret={secret}&issuer={quote(issuer)}&digits=6"

def generate_reset_code() -> str:
    return ''.join(random.choices(string.digits, k=6))
