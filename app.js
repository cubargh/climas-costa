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
  return `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=America/Argentina/Buenos_Aires&forecast_days=7`;
}

function renderCard(city, data, index) {
  const current = data.current;
  const daily = data.daily;
  const weather = getWeatherInfo(current.weather_code);
  const todayMax = daily.temperature_2m_max[0];
  const todayMin = daily.temperature_2m_min[0];

  let forecastHtml = "";
  for (let i = 1; i < daily.time.length; i++) {
    const date = new Date(daily.time[i] + "T12:00:00");
    const dayName = DAY_NAMES[date.getDay()];
    const fw = getWeatherInfo(daily.weather_code[i]);
    const precip = daily.precipitation_probability_max[i];
    const precipText = precip > 0 ? `${precip}% lluvia` : "";

    forecastHtml += `
      <div class="forecast-day">
        <span class="forecast-day-name">${dayName}</span>
        <span class="forecast-day-icon">${fw.icon}</span>
        <span class="forecast-day-precip">${precipText}</span>
        <span class="forecast-day-temps">
          <span class="hi">${Math.round(daily.temperature_2m_max[i])}°</span>
          <span class="lo">${Math.round(daily.temperature_2m_min[i])}°</span>
        </span>
      </div>`;
  }

  return `
    <div class="city-card" id="card-${index}">
      <div class="card-current" onclick="toggleCard(${index})">
        <div class="card-header">
          <span class="city-name">${city.name}</span>
          <span class="weather-icon">${weather.icon}</span>
        </div>
        <div class="temp-main">${Math.round(current.temperature_2m)}<span class="unit">°C</span></div>
        <div class="weather-desc">${weather.desc} &middot; ST ${Math.round(current.apparent_temperature)}°</div>
        <div class="card-details">
          <div class="detail">
            <div class="detail-label">Min / Máx</div>
            <div class="detail-value temp-range"><span class="lo">${Math.round(todayMin)}°</span> / <span class="hi">${Math.round(todayMax)}°</span></div>
          </div>
          <div class="detail">
            <div class="detail-label">Humedad</div>
            <div class="detail-value">${current.relative_humidity_2m}%</div>
          </div>
          <div class="detail">
            <div class="detail-label">Viento</div>
            <div class="detail-value">${Math.round(current.wind_speed_10m)} km/h ${windDirection(current.wind_direction_10m)}</div>
          </div>
        </div>
      </div>
      <div class="expand-hint" onclick="toggleCard(${index})">
        <span class="arrow">▼</span> Pronóstico 6 días
      </div>
      <div class="card-forecast">
        <div class="forecast-days">
          <div class="forecast-title">Próximos días</div>
          ${forecastHtml}
        </div>
      </div>
    </div>`;
}

function toggleCard(index) {
  document.getElementById(`card-${index}`).classList.toggle("expanded");
}

async function loadWeather() {
  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");
  const citiesEl = document.getElementById("cities");

  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  citiesEl.innerHTML = "";

  try {
    const res = await fetch(buildApiUrl());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const results = await res.json();

    // Open-Meteo returns an array when multiple locations are queried
    const dataArray = Array.isArray(results) ? results : [results];

    let html = "";
    for (let i = 0; i < CITIES.length; i++) {
      html += renderCard(CITIES[i], dataArray[i], i);
    }

    citiesEl.innerHTML = html;
    loadingEl.classList.add("hidden");
  } catch (err) {
    console.error("Error fetching weather:", err);
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
  }
}

loadWeather();
