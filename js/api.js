import { CITIES } from './config.js';

function buildForecastUrl() {
  const lats = CITIES.map(c => c.lat).join(",");
  const lons = CITIES.map(c => c.lon).join(",");
  return `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset` +
    `&timezone=America/Argentina/Buenos_Aires&forecast_days=7`;
}

function buildMarineUrl() {
  const lats = CITIES.map(c => c.lat).join(",");
  const lons = CITIES.map(c => c.lon).join(",");
  return `https://api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}` +
    `&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature` +
    `&daily=wave_height_max,wave_period_max,wave_direction_dominant` +
    `&timezone=America/Argentina/Buenos_Aires&forecast_days=7`;
}

export async function fetchWeatherData() {
  const [forecastRes, marineRes] = await Promise.all([
    fetch(buildForecastUrl()),
    fetch(buildMarineUrl()).catch(() => null),
  ]);

  if (!forecastRes.ok) throw new Error(`Forecast HTTP ${forecastRes.status}`);
  const forecastData = await forecastRes.json();
  const forecast = Array.isArray(forecastData) ? forecastData : [forecastData];

  let marine = null;
  if (marineRes && marineRes.ok) {
    const marineData = await marineRes.json();
    marine = Array.isArray(marineData) ? marineData : [marineData];
  }

  // Merge marine data into forecast
  for (let i = 0; i < forecast.length; i++) {
    forecast[i].marine = marine ? marine[i] : null;
  }

  return forecast;
}
