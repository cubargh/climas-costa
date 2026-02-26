const CITIES = [
  { name: "San Clemente del Tuyú", lat: -36.36, lon: -56.72 },
  { name: "Las Toninas",           lat: -36.47, lon: -56.70 },
  { name: "Santa Teresita",        lat: -36.54, lon: -56.70 },
  { name: "Mar del Tuyú",          lat: -36.58, lon: -56.69 },
  { name: "Costa del Este",        lat: -36.62, lon: -56.69 },
  { name: "Aguas Verdes",          lat: -36.65, lon: -56.69 },
  { name: "La Lucila del Mar",     lat: -36.66, lon: -56.69 },
  { name: "San Bernardo",          lat: -36.69, lon: -56.69 },
  { name: "Mar de Ajó",            lat: -36.72, lon: -56.68 },
  { name: "Nueva Atlantis",        lat: -36.78, lon: -56.72 },
  { name: "Pinamar",               lat: -37.11, lon: -56.86 },
  { name: "Ostende",               lat: -37.15, lon: -56.88 },
  { name: "Valeria del Mar",       lat: -37.16, lon: -56.89 },
  { name: "Cariló",                lat: -37.17, lon: -56.90 },
  { name: "Villa Gesell",          lat: -37.26, lon: -56.97 },
  { name: "Mar de las Pampas",     lat: -37.33, lon: -57.02 },
  { name: "Mar Azul",              lat: -37.35, lon: -57.03 },
  { name: "Mar del Plata",         lat: -38.00, lon: -57.56 },
  { name: "Miramar",               lat: -38.27, lon: -57.84 },
  { name: "Mar del Sur",           lat: -38.35, lon: -57.99 },
  { name: "Necochea",              lat: -38.55, lon: -58.74 },
  { name: "Claromecó",             lat: -38.86, lon: -60.08 },
  { name: "Reta",                  lat: -38.89, lon: -60.33 },
  { name: "Monte Hermoso",         lat: -38.98, lon: -61.30 },
  { name: "Pehuen-Có",             lat: -39.00, lon: -61.55 },
];

const WMO_CODES = {
  0:  { desc: "Despejado",            icon: "☀️" },
  1:  { desc: "Mayormente despejado", icon: "🌤️" },
  2:  { desc: "Parcialmente nublado", icon: "⛅" },
  3:  { desc: "Nublado",              icon: "☁️" },
  45: { desc: "Niebla",               icon: "🌫️" },
  48: { desc: "Niebla escarchada",    icon: "🌫️" },
  51: { desc: "Llovizna leve",        icon: "🌦️" },
  53: { desc: "Llovizna moderada",    icon: "🌦️" },
  55: { desc: "Llovizna intensa",     icon: "🌦️" },
  56: { desc: "Llovizna helada",      icon: "🌧️" },
  57: { desc: "Llovizna helada",      icon: "🌧️" },
  61: { desc: "Lluvia leve",          icon: "🌧️" },
  63: { desc: "Lluvia moderada",      icon: "🌧️" },
  65: { desc: "Lluvia intensa",       icon: "🌧️" },
  66: { desc: "Lluvia helada",        icon: "🌧️" },
  67: { desc: "Lluvia helada intensa",icon: "🌧️" },
  71: { desc: "Nevada leve",          icon: "🌨️" },
  73: { desc: "Nevada moderada",      icon: "🌨️" },
  75: { desc: "Nevada intensa",       icon: "🌨️" },
  77: { desc: "Granizo",              icon: "🌨️" },
  80: { desc: "Chaparrones leves",    icon: "🌦️" },
  81: { desc: "Chaparrones moderados",icon: "🌦️" },
  82: { desc: "Chaparrones fuertes",  icon: "🌧️" },
  85: { desc: "Nevada leve",          icon: "🌨️" },
  86: { desc: "Nevada intensa",       icon: "🌨️" },
  95: { desc: "Tormenta",             icon: "⛈️" },
  96: { desc: "Tormenta con granizo", icon: "⛈️" },
  99: { desc: "Tormenta con granizo", icon: "⛈️" },
};

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

let currentMode = "hourly";
let currentView = "map";
let weatherData = null;
let map = null;
let mapMarkers = [];

function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: "Desconocido", icon: "❓" };
}

function windDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

function buildApiUrl() {
  const lats = CITIES.map(c => c.lat).join(",");
  const lons = CITIES.map(c => c.lon).join(",");
  return `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
    `&timezone=America/Argentina/Buenos_Aires&forecast_days=7`;
}

// --- Map ---

function initMap() {
  if (map) return;
  map = L.map("map-container", {
    zoomControl: true,
    attributionControl: true,
  }).setView([-37.8, -58.5], 8);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 16,
  }).addTo(map);
}

function renderMap() {
  if (!weatherData) return;
  initMap();

  // Clear existing markers
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];

  for (let i = 0; i < CITIES.length; i++) {
    const city = CITIES[i];
    const current = weatherData[i].current;
    const daily = weatherData[i].daily;
    const w = getWeatherInfo(current.weather_code);
    const temp = Math.round(current.temperature_2m);

    const icon = L.divIcon({
      className: "",
      html: `<div class="map-marker">
        <span class="map-marker-icon">${w.icon}</span>
        <span class="map-marker-temp">${temp}°</span>
      </div>`,
      iconSize: null,
      iconAnchor: [30, 15],
    });

    const popup = `<div class="map-popup">
      <div class="popup-name">${city.name}</div>
      <div class="popup-desc">${w.icon} ${w.desc}</div>
      <dl class="popup-details">
        <dt>Temperatura</dt><dd>${temp}°C</dd>
        <dt>Sensación</dt><dd>${Math.round(current.apparent_temperature)}°C</dd>
        <dt>Min / Máx</dt><dd>${Math.round(daily.temperature_2m_min[0])}° / ${Math.round(daily.temperature_2m_max[0])}°</dd>
        <dt>Humedad</dt><dd>${current.relative_humidity_2m}%</dd>
        <dt>Viento</dt><dd>${Math.round(current.wind_speed_10m)} km/h ${windDirection(current.wind_direction_10m)}</dd>
      </dl>
    </div>`;

    const marker = L.marker([city.lat, city.lon], { icon })
      .bindPopup(popup, { maxWidth: 220 })
      .addTo(map);
    mapMarkers.push(marker);
  }
}

// --- List view ---

function getCurrentHourIndex(hourlyTimes) {
  const now = new Date();
  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < hourlyTimes.length; i++) {
    const diff = Math.abs(new Date(hourlyTimes[i]).getTime() - now.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}

function renderHourly(data) {
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

    let dayLabel = "";
    if (dayBoundary) {
      dayLabel = DAY_NAMES[dt.getDay()];
    }

    html += `<div class="hour-slot${isNow ? " now" : ""}">`;
    if (dayLabel) {
      html += `<span class="hour-time" style="color:var(--warm);font-size:0.6rem">${dayLabel}</span>`;
    }
    html += `<span class="hour-time">${label}</span>`;
    html += `<span class="hour-icon">${w.icon}</span>`;
    html += `<span class="hour-temp">${Math.round(hourly.temperature_2m[i])}°</span>`;
    html += `<span class="hour-precip">${precip > 0 ? precip + "%" : ""}</span>`;
    html += `<span class="hour-wind">${wind} km/h</span>`;
    html += `</div>`;
  }

  html += "</div>";
  return html;
}

function renderDaily(data) {
  const daily = data.daily;
  let html = '<div class="forecast-daily">';

  for (let i = 0; i < daily.time.length; i++) {
    const dt = new Date(daily.time[i] + "T12:00:00");
    const dayName = i === 0 ? "Hoy" : DAY_NAMES[dt.getDay()];
    const w = getWeatherInfo(daily.weather_code[i]);
    const precip = daily.precipitation_probability_max[i];

    html += `<div class="daily-row">`;
    html += `<span class="daily-day">${dayName}</span>`;
    html += `<span class="daily-icon">${w.icon}</span>`;
    html += `<span class="daily-precip">${precip > 0 ? precip + "% lluvia" : ""}</span>`;
    html += `<span class="daily-temps"><span class="hi">${Math.round(daily.temperature_2m_max[i])}°</span><span class="lo">${Math.round(daily.temperature_2m_min[i])}°</span></span>`;
    html += `</div>`;
  }

  html += "</div>";
  return html;
}

function renderCard(city, data, index) {
  const current = data.current;
  const daily = data.daily;
  const weather = getWeatherInfo(current.weather_code);
  const forecast = currentMode === "hourly" ? renderHourly(data) : renderDaily(data);
  const precipToday = daily.precipitation_probability_max[0];

  return `
    <div class="city-card">
      <div class="card-current">
        <span class="current-icon">${weather.icon}</span>
        <div class="current-info">
          <div class="city-name">${city.name}</div>
          <div class="current-meta">${weather.desc} · ST ${Math.round(current.apparent_temperature)}°</div>
          <div class="current-details">
            <span>🌧️ ${precipToday}%</span>
            <span>💧 ${current.relative_humidity_2m}%</span>
            <span>💨 ${Math.round(current.wind_speed_10m)} km/h ${windDirection(current.wind_direction_10m)}</span>
          </div>
        </div>
        <div class="current-temp">${Math.round(current.temperature_2m)}<span class="unit">°C</span></div>
      </div>
      <div class="card-forecast">${forecast}</div>
    </div>`;
}

function renderList() {
  if (!weatherData) return;
  const citiesEl = document.getElementById("cities");
  let html = "";
  for (let i = 0; i < CITIES.length; i++) {
    html += renderCard(CITIES[i], weatherData[i], i);
  }
  citiesEl.innerHTML = html;
}

// --- View switching ---

function setView(view) {
  currentView = view;
  const mapEl = document.getElementById("map-container");
  const listEl = document.getElementById("cities");
  const forecastToggle = document.getElementById("forecast-toggle");

  document.getElementById("btn-view-map").classList.toggle("active", view === "map");
  document.getElementById("btn-view-list").classList.toggle("active", view === "list");

  if (view === "map") {
    mapEl.classList.remove("hidden");
    listEl.classList.add("hidden");
    forecastToggle.classList.add("hidden");
    renderMap();
    // Leaflet needs a nudge after becoming visible
    setTimeout(() => map && map.invalidateSize(), 100);
  } else {
    mapEl.classList.add("hidden");
    listEl.classList.remove("hidden");
    forecastToggle.classList.remove("hidden");
    renderList();
  }
}

function setMode(mode) {
  currentMode = mode;
  document.getElementById("btn-hourly").classList.toggle("active", mode === "hourly");
  document.getElementById("btn-daily").classList.toggle("active", mode === "daily");
  renderList();
}

async function loadWeather() {
  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");

  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  document.getElementById("cities").innerHTML = "";

  try {
    const res = await fetch(buildApiUrl());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const results = await res.json();
    weatherData = Array.isArray(results) ? results : [results];
    loadingEl.classList.add("hidden");
    setView(currentView);
  } catch (err) {
    console.error("Error fetching weather:", err);
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
  }
}

loadWeather();
