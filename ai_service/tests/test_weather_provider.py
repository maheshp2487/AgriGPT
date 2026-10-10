import asyncio
import pytest
import httpx
from app.providers.weather import (
    OpenMeteoWeatherProvider,
    calculate_delta_t,
    calculate_wet_bulb_temperature,
)
from app.schemas.weather import SprayingSuitability, WeatherDataType


MOCK_OPEN_METEO_RESPONSE = {
    "current": {
        "time": "2026-10-10T14:00",
        "temperature_2m": 29.5,
        "relative_humidity_2m": 68,
        "wind_speed_10m": 8.5,
        "wind_gusts_10m": 12.0
    },
    "hourly": {
        "time": ["2026-10-10T14:00", "2026-10-10T15:00", "2026-10-10T16:00"],
        "precipitation_probability": [10, 15, 10]
    },
    "daily": {
        "time": ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14"],
        "temperature_2m_max": [33.0, 32.5, 31.8, 32.0, 33.2],
        "temperature_2m_min": [24.5, 24.0, 23.8, 24.2, 24.0],
        "precipitation_sum": [0.0, 1.2, 0.0, 0.0, 3.5],
        "precipitation_probability_max": [15, 35, 10, 20, 45]
    }
}


def test_delta_t_calculation():
    # At 30°C and 70% RH, wet bulb is ~25.5°C, Delta T is ~4.5°C (Optimal window)
    tw = calculate_wet_bulb_temperature(30.0, 70.0)
    delta_t = calculate_delta_t(30.0, 70.0)
    assert 24.0 <= tw <= 27.0
    assert 2.0 <= delta_t <= 6.0


def test_spraying_suitability_matrix():
    provider = OpenMeteoWeatherProvider()

    # Case 1: Optimal window
    adv = provider.evaluate_spraying_suitability(
        t_c=30.0, rh_pct=70.0, wind_kmh=8.0, gusts_kmh=12.0, rain_prob_pct=10
    )
    assert adv.spraying_suitability == SprayingSuitability.FAVORABLE
    assert "Estimated favorable" in adv.advisory_text_en
    assert "estimate" in adv.disclaimer_en.lower()

    # Case 2: Excessive wind drift
    adv_wind = provider.evaluate_spraying_suitability(
        t_c=30.0, rh_pct=70.0, wind_kmh=18.0, gusts_kmh=25.0, rain_prob_pct=10
    )
    assert adv_wind.spraying_suitability == SprayingSuitability.UNFAVORABLE

    # Case 3: Thermal inversion (very low wind)
    adv_inv = provider.evaluate_spraying_suitability(
        t_c=30.0, rh_pct=70.0, wind_kmh=1.5, gusts_kmh=3.0, rain_prob_pct=10
    )
    assert adv_inv.spraying_suitability == SprayingSuitability.MARGINAL
    assert "inversion" in adv_inv.advisory_text_en.lower()

    # Case 4: Rain wash-off risk
    adv_rain = provider.evaluate_spraying_suitability(
        t_c=30.0, rh_pct=70.0, wind_kmh=8.0, gusts_kmh=12.0, rain_prob_pct=60
    )
    assert adv_rain.spraying_suitability == SprayingSuitability.UNFAVORABLE


def test_weather_provider_forecast_mock():
    async def _test():
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(200, json=MOCK_OPEN_METEO_RESPONSE)

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport) as mock_client:
            provider = OpenMeteoWeatherProvider(http_client=mock_client)
            result = await provider.get_forecast(
                district="Thanjavur",
                state="Tamil Nadu",
                lat=10.787,
                lon=79.1378
            )

            assert result.success is True
            assert result.data.location.district == "Thanjavur"
            assert result.data.current.temperature_c == 29.5
            assert result.data.agromet_advisory.spraying_suitability == SprayingSuitability.FAVORABLE

            # Assert mandatory CC BY 4.0 attribution
            attr = result.data.source_attribution
            assert attr.data_type == WeatherDataType.NUMERICAL_MODEL_FORECAST
            assert "Open-Meteo" in attr.provider
            assert "CC BY 4.0" in attr.license

            # Assert 5-day forecast
            assert len(result.data.daily_forecast) == 5
            assert result.data.daily_forecast[0].temp_max_c == 33.0

    asyncio.run(_test())


def test_weather_provider_invalid_coordinates():
    async def _test():
        provider = OpenMeteoWeatherProvider()
        with pytest.raises(ValueError) as exc:
            await provider.get_forecast("Test", "Test", lat=95.0, lon=79.0)
        assert "Invalid geographical coordinates" in str(exc.value)

    asyncio.run(_test())
