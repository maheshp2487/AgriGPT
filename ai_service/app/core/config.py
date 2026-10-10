from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    AgriGPT AI & Integration Service Configuration.
    Loaded from environment variables with fallback to local defaults.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core Application Settings
    APP_NAME: str = "AgriGPT AI & Integration Service"
    ENVIRONMENT: str = Field(default="development", description="development | staging | production")
    LOG_LEVEL: str = Field(default="INFO", description="DEBUG | INFO | WARNING | ERROR")

    # Service-to-Service Security
    SERVICE_SHARED_SECRET: SecretStr = Field(
        default=SecretStr("development_shared_secret_min_32_chars_long"),
        description="Shared secret key verified on incoming Next.js BFF requests"
    )

    # OGD India AGMARKNET Provider
    OGD_API_KEY: SecretStr = Field(
        default=SecretStr(""),
        description="OGD India API Key from data.gov.in"
    )
    OGD_RESOURCE_ID: str = Field(
        default="9ef84268-d588-465a-a308-a864a43d0070",
        description="Resource ID for Current Daily Price of Various Commodities from Various Markets (Mandi)"
    )
    OGD_BASE_URL: str = Field(
        default="https://api.data.gov.in/resource",
        description="OGD India Resource Base URL"
    )
    OGD_TIMEOUT_SECONDS: float = Field(
        default=4.0,
        description="Timeout in seconds for upstream AGMARKNET queries"
    )

    # Weather Provider (Open-Meteo as default NWP provider)
    OPEN_METEO_BASE_URL: str = Field(
        default="https://api.open-meteo.com/v1/forecast",
        description="Open-Meteo Numerical Weather Prediction API endpoint"
    )
    WEATHER_TIMEOUT_SECONDS: float = Field(
        default=4.0,
        description="Timeout in seconds for weather API queries"
    )

    # IMD Enterprise Provider (Pending formal MoU)
    IMD_API_ENABLED: bool = Field(
        default=False,
        description="Whether IMD Enterprise API is enabled (requires static IP whitelisting)"
    )
    IMD_API_BASE_URL: str = Field(
        default="https://api.imd.gov.in",
        description="IMD API Management Platform base URL"
    )

    # Supabase / Database Persistence
    DATABASE_URL: str = Field(default="", description="PostgreSQL connection string")

    # API Setu (National Data Exchange) Gateway Settings
    API_SETU_ENABLED: bool = Field(default=True, description="Enable API Setu gateway adapter")
    API_SETU_MODE: str = Field(default="SANDBOX", description="SANDBOX | PRODUCTION")
    API_SETU_BASE_URL: str = Field(
        default="https://apisetu.gov.in/api/v1",
        description="Official API Setu production endpoint"
    )
    API_SETU_CLIENT_ID: str = Field(default="", description="API Setu registered Client ID")
    API_SETU_CLIENT_SECRET: SecretStr = Field(
        default=SecretStr(""),
        description="API Setu registered Client Secret"
    )
    API_SETU_TOKEN_TTL_SECONDS: int = Field(
        default=3600,
        description="OAuth2 bearer token validity in seconds"
    )


settings = Settings()
