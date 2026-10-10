import pytest
import io
from fastapi.testclient import TestClient
from app.main import app
from app.services.crop_doctor import crop_doctor_service
from app.schemas.chat import SafetyStatus

client = TestClient(app)

MOCK_JPEG_BYTES = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + b"blast_disease_paddy_leaf_sample" * 10
MOCK_PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"fall_armyworm_maize_whorl_sample" * 10


def test_diagnose_valid_paddy_blast():
    res = crop_doctor_service.diagnose(
        image_bytes=MOCK_JPEG_BYTES,
        filename="paddy_blast_leaf.jpg",
        crop_hint="paddy",
        locale="en"
    )
    assert res.crop == "paddy"
    assert "Blast" in res.detected_pest_disease
    assert res.confidence >= 0.75
    assert res.confidence_level == "HIGH_CONFIDENCE"
    assert "Tricyclazole" in res.recommended_chemical
    assert res.cibrc_safety_status == SafetyStatus.SAFE
    assert len(res.citations) > 0
    assert len(res.cultural_management) > 0


def test_diagnose_valid_maize_fall_armyworm():
    res = crop_doctor_service.diagnose(
        image_bytes=MOCK_PNG_BYTES,
        filename="maize_fall_armyworm.png",
        crop_hint="maize",
        locale="en"
    )
    assert res.crop == "maize"
    assert "Fall Armyworm" in res.detected_pest_disease
    assert "Emamectin" in res.recommended_chemical
    assert res.pre_harvest_interval_days == 14
    assert res.cibrc_safety_status == SafetyStatus.SAFE


def test_diagnose_invalid_image_raises_error():
    with pytest.raises(ValueError) as exc:
        crop_doctor_service.diagnose(
            image_bytes=b"plain text file disguised as image",
            filename="bad_file.txt"
        )
    assert "Invalid image format" in str(exc.value)


def test_crop_doctor_api_multipart_endpoint():
    file_obj = io.BytesIO(MOCK_JPEG_BYTES)
    response = client.post(
        "/v1/crop-doctor/diagnose",
        files={"file": ("leaf_test.jpg", file_obj, "image/jpeg")},
        data={"crop_hint": "paddy", "locale": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "paddy"
    assert "Blast" in data["detected_pest_disease"]
    assert "mandatory_field_disclaimer" in data
