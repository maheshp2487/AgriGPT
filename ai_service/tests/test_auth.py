import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth import (
    normalize_indian_phone,
    auth_service,
    generate_token,
    verify_token,
)
from app.schemas.auth import FarmerProfileUpdate

client = TestClient(app)


def test_normalize_indian_phone():
    assert normalize_indian_phone("9876543210") == "+919876543210"
    assert normalize_indian_phone("+919876543210") == "+919876543210"
    assert normalize_indian_phone("09876543210") == "+919876543210"
    assert normalize_indian_phone("919876543210") == "+919876543210"

    with pytest.raises(ValueError):
        normalize_indian_phone("12345")

    with pytest.raises(ValueError):
        normalize_indian_phone("5876543210")  # Invalid Indian mobile start digit


def test_token_generation_and_verification():
    user_id = "test-uuid-1234"
    phone = "+919876543210"
    token = generate_token(user_id, phone)
    assert token is not None
    assert "." in token

    verified_user_id = verify_token(token)
    assert verified_user_id == user_id

    # Tampered token
    tampered = token[:-1] + ("1" if token[-1] == "0" else "0")
    assert verify_token(tampered) is None


def test_auth_service_otp_flow_and_profile():
    phone = "9840123456"
    send_res = auth_service.send_otp(phone)
    assert send_res["success"] is True
    assert send_res["phone_number"] == "+919840123456"
    assert "test_otp" in send_res

    # Verify OTP
    verify_res = auth_service.verify_otp(phone, "123456")
    assert verify_res.access_token is not None
    assert verify_res.user.phone_number == "+919840123456"
    assert verify_res.profile.state == "Tamil Nadu"

    # Get Profile
    user_id = verify_res.user.id
    prof = auth_service.get_profile(user_id)
    assert prof.user_id == user_id

    # Update Profile
    updated = auth_service.update_profile(
        user_id,
        FarmerProfileUpdate(
            full_name="Murugan Ramanathan",
            district="Nagapattinam",
            crops_grown=["paddy", "groundnut"],
            land_area_acres=4.5
        )
    )
    assert updated.full_name == "Murugan Ramanathan"
    assert updated.district == "Nagapattinam"
    assert updated.crops_grown == ["paddy", "groundnut"]
    assert updated.land_area_acres == 4.5


def test_auth_api_endpoints():
    phone = "9123456780"
    # 1. Send OTP
    send_resp = client.post("/v1/auth/otp/send", json={"phone_number": phone})
    assert send_resp.status_code == 200
    assert send_resp.json()["success"] is True

    # 2. Verify OTP
    verify_resp = client.post("/v1/auth/otp/verify", json={"phone_number": phone, "otp": "123456"})
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    token = data["access_token"]
    assert token is not None

    # 3. Get Profile with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    prof_resp = client.get("/v1/auth/profile", headers=headers)
    assert prof_resp.status_code == 200
    assert prof_resp.json()["state"] == "Tamil Nadu"

    # 4. Update Profile
    update_resp = client.put(
        "/v1/auth/profile",
        headers=headers,
        json={"full_name": "Ramesh Patel", "state": "Gujarat", "crops_grown": ["cotton"]}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["full_name"] == "Ramesh Patel"
    assert update_resp.json()["state"] == "Gujarat"

    # 5. Unauthorized access check
    unauth_resp = client.get("/v1/auth/profile", headers={"Authorization": "Bearer invalid_token"})
    assert unauth_resp.status_code == 401
