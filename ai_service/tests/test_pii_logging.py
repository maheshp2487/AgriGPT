from app.core.logging import sanitize_pii


def test_sanitize_indian_phone_numbers():
    text = "Farmer Ramesh with mobile 9876543210 called from Thanjavur."
    sanitized = sanitize_pii(text)
    assert "9876543210" not in sanitized
    assert "[PHONE_REDACTED]" in sanitized
    assert "Thanjavur" in sanitized


def test_sanitize_aadhaar_numbers():
    text = "Verified farmer eKYC with Aadhaar 2345 6789 0123 successfully."
    sanitized = sanitize_pii(text)
    assert "2345 6789 0123" not in sanitized
    assert "[AADHAAR_REDACTED]" in sanitized


def test_truncate_gps_precision():
    text = "Location query at coordinates lat=10.7871234, lon=79.1378567."
    sanitized = sanitize_pii(text)
    assert "10.7871234" not in sanitized
    assert "10.78**" in sanitized
