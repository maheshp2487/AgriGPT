from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class SprayingSuitability(str, Enum):
    FAVORABLE = "FAVORABLE"
    MARGINAL = "MARGINAL"
    UNFAVORABLE = "UNFAVORABLE"


class WeatherDataType(str, Enum):
    NUMERICAL_MODEL_FORECAST = "NUMERICAL_MODEL_FORECAST"
    STATION_OBSERVATION = "STATION_OBSERVATION"


class Coordinates(BaseModel):
    lat: float
    lon: float


class LocationInfo(BaseModel):
    district: str
    state: str
    coordinates: Coordinates


class CurrentWeather(BaseModel):
    temperature_c: float
    relative_humidity_pct: int
    wind_speed_kmh: float
    wind_gusts_kmh: float
    precipitation_prob_pct: int
    condition: str


class AgrometAdvisory(BaseModel):
    spraying_suitability: SprayingSuitability
    delta_t_c: float = Field(..., description="Calculated Delta T (Dry Bulb minus Wet Bulb) in Celsius")
    wind_speed_kmh: float
    wind_gusts_kmh: float
    rain_prob_next_6h_pct: int
    advisory_text_en: str
    pollinator_warning_en: str
    disclaimer_en: str
    irrigation_advice_en: str
    heat_stress_alert: bool = False


class DailyForecastDay(BaseModel):
    date: date
    temp_max_c: float
    temp_min_c: float
    rain_sum_mm: float
    rain_probability_pct: int


class WeatherAttribution(BaseModel):
    data_type: WeatherDataType = WeatherDataType.NUMERICAL_MODEL_FORECAST
    provider: str
    license: str
    attribution_text: str
    model_run_time: Optional[datetime] = None


class WeatherDataPayload(BaseModel):
    location: LocationInfo
    current: CurrentWeather
    agromet_advisory: AgrometAdvisory
    daily_forecast: List[DailyForecastDay]
    source_attribution: WeatherAttribution


class WeatherQueryResponse(BaseModel):
    success: bool
    data: WeatherDataPayload
