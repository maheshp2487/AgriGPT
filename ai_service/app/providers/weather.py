import math
from datetime import date, datetime
from typing import Any, Dict, List, Optional
import httpx
from dateutil import parser as date_parser

from app.core.config import settings
from app.core.logging import logger
from app.schemas.weather import (
    AgrometAdvisory,
    Coordinates,
    CurrentWeather,
    DailyForecastDay,
    LocationInfo,
    SprayingSuitability,
    WeatherAttribution,
    WeatherDataPayload,
    WeatherDataType,
    WeatherQueryResponse,
)


def calculate_wet_bulb_temperature(t_c: float, rh_pct: float) -> float:
    """
    Calculates wet bulb temperature in °C using Stull's psychrometric approximation.
    Valid for standard sea-level pressures and ambient conditions.
    """
    rh = max(1.0, min(100.0, rh_pct))
    t = t_c

    tw = (
        t * math.atan(0.151977 * math.pow(rh + 8.313659, 0.5))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * math.pow(rh, 1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )
    return round(tw, 2)


def calculate_delta_t(t_c: float, rh_pct: float) -> float:
    """
    Delta T = Dry Bulb Temperature - Wet Bulb Temperature.
    Optimal agricultural spraying window is typically 2°C to 8°C.
    """
    tw = calculate_wet_bulb_temperature(t_c, rh_pct)
    delta_t = round(t_c - tw, 2)
    return max(0.0, delta_t)


class OpenMeteoWeatherProvider:
    """
    Authoritative server-side adapter for Numerical Weather Prediction (NWP) forecasts
    via Open-Meteo API. Operates under CC BY 4.0 license.
    """

    def __init__(self, http_client: Optional[httpx.AsyncClient] = None):
        self._client = http_client

    def _get_client(self) -> httpx.AsyncClient:
        if self._client:
            return self._client
        return httpx.AsyncClient(timeout=settings.WEATHER_TIMEOUT_SECONDS)

    def evaluate_spraying_suitability(
        self,
        t_c: float,
        rh_pct: float,
        wind_kmh: float,
        gusts_kmh: float,
        rain_prob_pct: int
    ) -> AgrometAdvisory:
        """
        Calculates multi-parameter spraying window based on Delta T, wind limits,
        thermal inversion risk, and wash-off precipitation.
        Never asserts unconditional safety.
        """
        delta_t = calculate_delta_t(t_c, rh_pct)

        # 1. Thermal inversion check (very low wind causes spray drift entrapment)
        is_inversion_risk = wind_kmh < 3.0
        # 2. High wind drift check
        is_drift_risk = wind_kmh > 15.0 or gusts_kmh > 22.0
        # 3. Wash-off precipitation risk
        is_washoff_risk = rain_prob_pct >= 40.0
        # 4. Evaporation & droplet survival (Delta T)
        is_evap_risk = delta_t > 8.0
        is_runoff_risk = delta_t < 2.0

        if is_washoff_risk or is_drift_risk:
            suitability = SprayingSuitability.UNFAVORABLE
            advice = (
                f"Unfavorable for spraying: High rain risk ({rain_prob_pct}%) or excessive wind ({wind_kmh} km/h). "
                f"Chemical may wash off or drift onto non-target areas."
            )
        elif is_inversion_risk:
            suitability = SprayingSuitability.MARGINAL
            advice = (
                f"Marginal window: Calm wind ({wind_kmh} km/h) carries surface temperature inversion risk. "
                f"Fine droplets may remain suspended. Avoid fine droplet nozzles."
            )
        elif is_evap_risk:
            suitability = SprayingSuitability.MARGINAL
            advice = (
                f"Marginal window: High Delta T ({delta_t}°C) indicates rapid droplet evaporation before reaching canopy. "
                f"Use coarser droplet nozzles or postpone to early morning/evening."
            )
        elif is_runoff_risk:
            suitability = SprayingSuitability.MARGINAL
            advice = (
                f"Marginal window: Very low Delta T ({delta_t}°C) with high humidity. Chemical drying will be slow. "
                f"Ensure foliage is not wet from dew."
            )
        else:
            suitability = SprayingSuitability.FAVORABLE
            advice = (
                f"Estimated favorable spraying window: Delta T ({delta_t}°C) is optimal (2–8°C) and wind ({wind_kmh} km/h) "
                f"is within safe application limits with low rain risk ({rain_prob_pct}%)."
            )

        return AgrometAdvisory(
            spraying_suitability=suitability,
            delta_t_c=delta_t,
            wind_speed_kmh=wind_kmh,
            wind_gusts_kmh=gusts_kmh,
            rain_prob_next_6h_pct=rain_prob_pct,
            advisory_text_en=advice,
            pollinator_warning_en="Protect pollinators: Avoid spraying flowering crops during peak bee foraging hours (09:00 - 15:00).",
            disclaimer_en=(
                "Weather suitability is an estimate based on numerical weather prediction models. Field conditions vary. "
                "Always verify on-site wind direction and read the specific agrochemical label for rainfastness guidelines."
            ),
            irrigation_advice_en=(
                "Hold irrigation if rain probability exceeds 60%; otherwise schedule regular light irrigation based on soil moisture."
            ),
            heat_stress_alert=(t_c >= 38.0)
        )

    async def get_forecast(
        self,
        district: str,
        state: str,
        lat: float,
        lon: float
    ) -> WeatherQueryResponse:
        """
        Fetches current weather and 5-day daily forecast from Open-Meteo.
        """
        if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
            raise ValueError(f"Invalid geographical coordinates: lat={lat}, lon={lon}")

        client = self._get_client()
        params: Dict[str, Any] = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,precipitation",
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
            "timezone": "Asia/Kolkata",
            "forecast_days": 5
        }

        try:
            response = await client.get(settings.OPEN_METEO_BASE_URL, params=params)
            if response.status_code != 200:
                raise RuntimeError(f"Open-Meteo returned status {response.status_code}: {response.text}")

            data = response.json()
            curr = data.get("current", {})
            daily = data.get("daily", {})
            hourly = data.get("hourly", {})

            temp_c = float(curr.get("temperature_2m", 28.0))
            humidity = int(curr.get("relative_humidity_2m", 70))
            wind_speed = float(curr.get("wind_speed_10m", 8.0))
            wind_gusts = float(curr.get("wind_gusts_10m", 12.0))

            # Calculate next 6h precipitation probability from hourly array
            hourly_rain = hourly.get("precipitation_probability", [])
            rain_prob_next_6h = max(hourly_rain[:6]) if hourly_rain else 10

            condition_desc = "Clear" if rain_prob_next_6h < 20 else "Partly Cloudy" if rain_prob_next_6h < 50 else "Rain Possible"

            agromet = self.evaluate_spraying_suitability(
                t_c=temp_c,
                rh_pct=float(humidity),
                wind_kmh=wind_speed,
                gusts_kmh=wind_gusts,
                rain_prob_pct=rain_prob_next_6h
            )

            # Build 5-day daily forecast list
            daily_forecast: List[DailyForecastDay] = []
            dates = daily.get("time", [])
            max_temps = daily.get("temperature_2m_max", [])
            min_temps = daily.get("temperature_2m_min", [])
            rain_sums = daily.get("precipitation_sum", [])
            rain_probs = daily.get("precipitation_probability_max", [])

            for i in range(len(dates)):
                daily_forecast.append(
                    DailyForecastDay(
                        date=date_parser.parse(dates[i]).date(),
                        temp_max_c=float(max_temps[i]) if i < len(max_temps) else temp_c + 2,
                        temp_min_c=float(min_temps[i]) if i < len(min_temps) else temp_c - 4,
                        rain_sum_mm=float(rain_sums[i]) if i < len(rain_sums) else 0.0,
                        rain_probability_pct=int(rain_probs[i]) if i < len(rain_probs) else 0
                    )
                )

            return WeatherQueryResponse(
                success=True,
                data=WeatherDataPayload(
                    location=LocationInfo(
                        district=district,
                        state=state,
                        coordinates=Coordinates(lat=lat, lon=lon)
                    ),
                    current=CurrentWeather(
                        temperature_c=temp_c,
                        relative_humidity_pct=humidity,
                        wind_speed_kmh=wind_speed,
                        wind_gusts_kmh=wind_gusts,
                        precipitation_prob_pct=rain_prob_next_6h,
                        condition=condition_desc
                    ),
                    agromet_advisory=agromet,
                    daily_forecast=daily_forecast,
                    source_attribution=WeatherAttribution(
                        data_type=WeatherDataType.NUMERICAL_MODEL_FORECAST,
                        provider="Open-Meteo NWP (ECMWF / GFS)",
                        license="Creative Commons Attribution 4.0 International (CC BY 4.0)",
                        attribution_text="Weather forecast data provided by Open-Meteo.com",
                        model_run_time=datetime.now()
                    )
                )
            )
        finally:
            if not self._client:
                await client.aclose()


weather_provider = OpenMeteoWeatherProvider()
