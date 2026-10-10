from pydantic import BaseModel
from typing import Dict, Any


class HealthResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    version: str = "1.0.0"
    dependencies: Dict[str, Any]
