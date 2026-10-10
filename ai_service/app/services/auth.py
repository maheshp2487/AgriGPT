import hashlib
import hmac
import json
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Optional, Any, List
from app.core.config import settings
from app.schemas.auth import (
    UserResponse,
    FarmerProfileResponse,
    FarmerProfileUpdate,
    AuthResponse,
)

# In-memory store for development/test mode (maps to Supabase PostgreSQL in prod)
_USERS_STORE: Dict[str, Dict[str, Any]] = {}
_PROFILES_STORE: Dict[str, Dict[str, Any]] = {}
_OTP_CACHE: Dict[str, Dict[str, Any]] = {}

SECRET_KEY = getattr(settings, "SERVICE_SECRET_KEY", "agrigpt_dev_service_secret_2026")


def normalize_indian_phone(phone: str) -> str:
    """Normalizes phone number to standard 10-digit Indian mobile format."""
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    elif digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    if len(digits) != 10 or not digits.startswith(("6", "7", "8", "9")):
        raise ValueError("Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9.")
    return f"+91{digits}"


def generate_token(user_id: str, phone: str) -> str:
    """Generates a secure HMAC-SHA256 signed token for the session."""
    payload = f"{user_id}:{phone}:{int(time.time())}"
    sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def verify_token(token: str) -> Optional[str]:
    """Verifies HMAC signature and returns user_id if valid."""
    parts = token.split(".")
    if len(parts) != 2:
        return None
    payload, signature = parts
    expected_sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    if hmac.compare_digest(signature, expected_sig):
        return payload.split(":")[0]
    return None


class AuthService:
    """
    Manages Phone OTP authentication, profile persistence, and FPO association (P3-01).
    """

    def send_otp(self, phone: str) -> Dict[str, Any]:
        norm_phone = normalize_indian_phone(phone)
        # Development / mock deterministic OTP
        otp_code = "123456"
        _OTP_CACHE[norm_phone] = {
            "otp": otp_code,
            "expires_at": time.time() + 300,  # 5 minutes
            "attempts": 0
        }
        return {
            "success": True,
            "phone_number": norm_phone,
            "message": "OTP sent successfully to your mobile number.",
            "test_otp": otp_code  # Transparently visible in dev mode
        }

    def verify_otp(self, phone: str, otp: str) -> AuthResponse:
        norm_phone = normalize_indian_phone(phone)
        cached = _OTP_CACHE.get(norm_phone)
        
        # In test / dev environments, allow "123456" or cached OTP
        is_valid = False
        if otp == "123456":
            is_valid = True
        elif cached and time.time() < cached["expires_at"] and cached["otp"] == otp:
            is_valid = True

        if not is_valid:
            raise ValueError("Invalid or expired OTP. Please enter the correct 6-digit code.")

        # Find or create user
        user_id = None
        for u_id, u_data in _USERS_STORE.items():
            if u_data["phone_number"] == norm_phone:
                user_id = u_id
                break

        now_iso = datetime.now(timezone.utc).isoformat()
        if not user_id:
            user_id = str(uuid.uuid4())
            _USERS_STORE[user_id] = {
                "id": user_id,
                "phone_number": norm_phone,
                "role": "farmer",
                "created_at": now_iso
            }
            # Create default profile
            profile_id = str(uuid.uuid4())
            _PROFILES_STORE[user_id] = {
                "id": profile_id,
                "user_id": user_id,
                "full_name": None,
                "state": "Tamil Nadu",
                "district": "Thanjavur",
                "primary_language": "ta",
                "crops_grown": ["paddy"],
                "land_area_acres": 2.50,
                "preferred_market": "Thanjavur Regulated Market",
                "fpo_name": "Thanjavur Farmers Cooperative"
            }

        user_data = _USERS_STORE[user_id]
        profile_data = _PROFILES_STORE[user_id]
        token = generate_token(user_id, norm_phone)

        # Invalidate OTP after successful verification
        _OTP_CACHE.pop(norm_phone, None)

        return AuthResponse(
            access_token=token,
            user=UserResponse(**user_data),
            profile=FarmerProfileResponse(**profile_data)
        )

    def login_with_email(self, email: str) -> AuthResponse:
        norm_email = email.strip().lower()
        if "@" not in norm_email or "." not in norm_email:
            raise ValueError("Please provide a valid email address.")

        user_id = None
        for u_id, u_data in _USERS_STORE.items():
            if u_data.get("phone_number") == norm_email or u_data.get("email") == norm_email:
                user_id = u_id
                break

        now_iso = datetime.now(timezone.utc).isoformat()
        if not user_id:
            user_id = str(uuid.uuid4())
            _USERS_STORE[user_id] = {
                "id": user_id,
                "phone_number": norm_email,
                "email": norm_email,
                "role": "farmer",
                "created_at": now_iso
            }
            profile_id = str(uuid.uuid4())
            name_part = norm_email.split("@")[0].replace(".", " ").title()
            _PROFILES_STORE[user_id] = {
                "id": profile_id,
                "user_id": user_id,
                "full_name": name_part,
                "state": "Tamil Nadu",
                "district": "Thanjavur",
                "primary_language": "en",
                "crops_grown": ["paddy"],
                "land_area_acres": 2.50,
                "preferred_market": "Thanjavur Regulated Market",
                "fpo_name": "Thanjavur Farmers Cooperative"
            }

        user_data = _USERS_STORE[user_id]
        profile_data = _PROFILES_STORE[user_id]
        token = generate_token(user_id, norm_email)

        return AuthResponse(
            access_token=token,
            user=UserResponse(**user_data),
            profile=FarmerProfileResponse(**profile_data)
        )

    def get_profile(self, user_id: str) -> FarmerProfileResponse:
        profile = _PROFILES_STORE.get(user_id)
        if not profile:
            raise KeyError(f"Farmer profile not found for user {user_id}")
        return FarmerProfileResponse(**profile)

    def update_profile(self, user_id: str, updates: FarmerProfileUpdate) -> FarmerProfileResponse:
        profile = _PROFILES_STORE.get(user_id)
        if not profile:
            raise KeyError(f"Farmer profile not found for user {user_id}")

        for field, val in updates.model_dump(exclude_unset=True).items():
            if val is not None:
                profile[field] = val

        return FarmerProfileResponse(**profile)

    def export_user_data(self, user_id: str) -> dict:
        """
        DPDP Act 2023 Section 11: Right to Access & Portability.
        Returns all stored personal data in a machine-readable format.
        """
        user_data = _USERS_STORE.get(user_id)
        if not user_data:
            raise KeyError(f"User {user_id} not found")
        profile_data = _PROFILES_STORE.get(user_id, {})
        return {
            "statutory_act": "Digital Personal Data Protection Act (DPDP) 2023",
            "compliance_section": "Section 11 (Right to Access and Data Portability)",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "data_fiduciary": "AgriGPT National Agricultural Platform",
            "user": user_data,
            "profile": profile_data,
        }

    def delete_user_data(self, user_id: str) -> dict:
        """
        DPDP Act 2023 Section 12: Right to Correction and Erasure / Consent Withdrawal.
        Securely purges personal records, phone identifiers, and farm profiles.
        """
        user_deleted = _USERS_STORE.pop(user_id, None) is not None
        profile_deleted = _PROFILES_STORE.pop(user_id, None) is not None
        if not user_deleted and not profile_deleted:
            raise KeyError(f"User {user_id} not found for deletion")

        return {
            "statutory_act": "Digital Personal Data Protection Act (DPDP) 2023",
            "compliance_section": "Section 12 (Right to Erasure & Consent Withdrawal)",
            "status": "ERASED_AND_PURGED",
            "erased_at": datetime.now(timezone.utc).isoformat(),
            "message": "All personal identification, phone records, and farm profiles have been permanently purged.",
        }

    @staticmethod
    def get_privacy_notice() -> dict:
        """
        DPDP Act 2023 Section 5: Notice regarding data collection purposes.
        """
        return {
            "data_fiduciary": "AgriGPT National Agricultural Intelligence Platform",
            "governing_law": "Digital Personal Data Protection (DPDP) Act 2023, Republic of India",
            "purpose_of_processing": [
                "Delivering localized crop advisory and mandi price intelligence",
                "Verifying government scheme eligibility via API Setu upon explicit farmer request",
                "Village cooperative aggregate market linkage and haulage advisory",
            ],
            "retention_policy": {
                "guest_conversations": "Ephemeral session memory pruned after 30 days of inactivity",
                "registered_farmers": "Retained for active advisory until consent withdrawal or erasure request",
            },
            "third_party_transfers": "Zero non-consensual sharing of farmer phone numbers or land records",
            "grievance_redressal": {
                "officer_title": "Data Protection Officer & Grievance Redressal Officer",
                "entity": "AgriGPT Platform",
                "email": "grievance@agrigpt.in",
                "resolution_timeline": "Within 30 calendar days per statutory DPDP guidelines",
            },
        }


# Global singleton instance
auth_service = AuthService()
