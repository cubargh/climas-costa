import { CITIES, DAY_NAMES } from './config.js';
import { getWeatherInfo, windArrow, tempColor, uvLabel, getCurrentHourIndex, rainClass } from './ui.js';

export function renderHourly(data) {
  const hourly = data.hourly;
  const startIdx = getCurrentHourIndex(hourly.time);
  const count = 48;
  let html = '<div class="forecast-hourly">';

  for (let i = startIdx; i < Math.min(startIdx + count, hourly.time.length); i++) {
    const dt = new Date(hourly.time[i]);
    const hour = dt.getHours();
    const isNow = i === startIdx;
    const ampm = hour === 0 ? "" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`;
    const label = isNow ? "Ahora" : ampm;
    const dayBoundary = hour === 0 && !isNow;
    const w = getWeatherInfo(hourly.weather_code[i]);
    const precip = hourly.precipitation_probability[i];
    const wind = Math.round(hourly.wind_speed_10m[i]);
    const windDir = hourly.wind_direction_10m ? hourly.wind_direction_10m[i] : 0;
    const temp = Math.round(hourly.temperature_2m[i]);

    let dayLabel = "";
    if (dayBoundary) dayLabel = DAY_NAMES[dt.getDay()];

    html += `<div class="hour-slot${isNow ? " now" : ""}${rainClass(precip)}">`;
    if (dayLabel) {
      html += `<span class="hour-time" style="color:var(--warm);font-size:0.6rem">${dayLabel}</span>`;
    }
    html += `<span class="hour-time">${label}</span>`;
    html += `<span class="hour-icon">${w.icon}</span>`;
    html += `<span class="hour-temp" style="color:${tempColor(temp)}">${temp}°</span>`;
    html += `<span class="hour-precip">${precip}%</span>`;
    html += `<span class="hour-wind">${wind} ${windArrow(windDir)}</span>`;
    html += `</div>`;
  }

  html += "</div>";
  return html;
}

export function renderDaily(data) {
  const daily = data.daily;
  let html = '<div class="forecast-daily">';

  for (let i = 0; i < daily.time.length; i++) {
    const dt = new Date(daily.time[i] + "T12:00:00");
    const dayName = i === 0 ? "Hoy" : DAY_NAMES[dt.getDay()];
    const w = getWeatherInfo(daily.weather_code[i]);
    const precip = daily.precipitation_probability_max[i];
    const hi = Math.round(daily.temperature_2m_max[i]);
    const lo = Math.round(daily.temperature_2m_min[i]);
    const uvMax = daily.uv_index_max ? Math.round(daily.uv_index_max[i]) : null;
    const uvInfo = uvMax !== null ? uvLabel(uvMax) : null;

    html += `<div class="daily-row">`;
    html += `<span class="daily-day">${dayName}</span>`;
    html += `<span class="daily-icon">${w.icon}</span>`;
    html += `<span class="daily-precip">${precip}%${uvInfo ? ` <span class="uv-badge ${uvInfo.cls}">UV ${uvMax}</span>` : ''}</span>`;
    html += `<span class="daily-temps"><span class="hi" style="color:${tempColor(hi)}">${hi}°</span><span class="lo" style="color:${tempColor(lo)}">${lo}°</span></span>`;
    html += `</div>`;
  }

  html += "</div>";
  return html;
}

export function renderCard(city, data, currentMode, nearestSlug) {
  const current = data.current;
  const daily = data.daily;
  const weather = getWeatherInfo(current.weather_code);
  const forecast = currentMode === "hourly" ? renderHourly(data) : renderDaily(data);
  const precipToday = daily.precipitation_probability_max[0];
  const temp = Math.round(current.temperature_2m);
  const windGust = current.wind_gusts_10m ? Math.round(current.wind_gusts_10m) : null;
  const windSpeed = Math.round(current.wind_speed_10m);
  const windDir = current.wind_direction_10m;

  // UV
  const uvMax = daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : null;
  const uvInfo = uvMax !== null ? uvLabel(uvMax) : null;

  // Marine
  const marine = data.marine;
  let waterTemp = null;
  let waveHeight = null;
  if (marine && marine.hourly) {
    const hIdx = getCurrentHourIndex(marine.hourly.time);
    const sst = marine.hourly.sea_surface_temperature;
    const wh = marine.hourly.wave_height;
    if (sst && sst[hIdx] != null) waterTemp = Math.round(sst[hIdx]);
    if (wh && wh[hIdx] != null) waveHeight = wh[hIdx].toFixed(1);
  }

  const isNearest = city.slug === nearestSlug;

  // Wind text
  let windText = `${windSpeed} km/h ${windArrow(windDir)}`;

  // Marine items
  let marineItems = '';
  if (waterTemp !== null) marineItems += `<span class="detail-item"><i class="bi bi-water"></i> Agua ${waterTemp}°</span>`;
  if (waveHeight !== null) marineItems += `<span class="detail-item"><i class="bi bi-water"></i> Olas ${waveHeight}m</span>`;

  // Share button (uses Web Share API with clipboard fallback)
  const shareText = `Clima en ${city.name}: ${temp}°C, ${weather.desc}. Mirá el pronóstico: https://climadelacosta.com.ar/${city.slug}`;
  const shareBtn = `<button class="share-btn" data-share="${encodeURIComponent(shareText)}" aria-label="Compartir"><i class="bi bi-share"></i></button>`;

  return `
    <div class="city-card" data-slug="${city.slug}" data-index="${CITIES.indexOf(city)}">
      <div class="card-current">
        <span class="current-icon">${weather.icon}</span>
        <div class="current-info">
          <div class="city-name-row">
            <a href="/${city.slug}" class="city-name">${city.name}</a>
            ${isNearest ? '<span class="nearest-badge">Cerca de vos</span>' : ''}
          </div>
          <div class="current-meta">${weather.desc} · ST ${Math.round(current.apparent_temperature)}°${uvInfo ? ` · <span class="uv-badge ${uvInfo.cls}">UV ${uvMax}</span>` : ''}</div>
          <div class="current-details">
            <span class="detail-item"><i class="bi bi-cloud-rain"></i> ${precipToday}%</span>
            <span class="detail-item"><i class="bi bi-droplet"></i> ${current.relative_humidity_2m}%</span>
            <span class="detail-item"><i class="bi bi-wind"></i> ${windText}</span>
            ${marineItems}
          </div>
        </div>
        <div class="current-right">
          <div class="current-temp" style="color:${tempColor(temp)}">${temp}<span class="unit">°C</span></div>
          ${shareBtn}
        </div>
      </div>
      <div class="card-forecast">${forecast}</div>
    </div>`;
}

export function syncHourlyScroll() {
  const strips = document.querySelectorAll(".forecast-hourly");
  let syncing = false;
  strips.forEach(strip => {
    strip.addEventListener("scroll", () => {
      if (syncing) return;
      syncing = true;
      const left = strip.scrollLeft;
      strips.forEach(other => {
        if (other !== strip) other.scrollLeft = left;
      });
      syncing = false;
    });
  });
}
