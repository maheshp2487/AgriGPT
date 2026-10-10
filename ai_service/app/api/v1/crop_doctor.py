from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from app.schemas.crop_doctor import CropDoctorResponse
from app.services.crop_doctor import crop_doctor_service

router = APIRouter(prefix="/crop-doctor", tags=["crop-doctor"])


@router.post("/diagnose", response_model=CropDoctorResponse)
async def diagnose_crop_image(
    file: UploadFile = File(...),
    crop_hint: Optional[str] = Form(None),
    locale: Optional[str] = Form("en")
):
    try:
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds maximum permitted limit (5MB)."
            )

        result = crop_doctor_service.diagnose(
            image_bytes=contents,
            filename=file.filename or "",
            crop_hint=crop_hint,
            locale=locale or "en"
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diagnostic pipeline error: {str(e)}"
        )
