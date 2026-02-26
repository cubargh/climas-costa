import { CITIES } from './config.js';
import { getWeatherInfo, windArrow, tempColor, getCurrentHourIndex } from './ui.js';

let map = null;
let mapMarkers = [];
let markerClusterGroup = null;

export function initMap() {
  if (map) return;

  // Fit bounds to all cities
  const lats = CITIES.map(c => c.lat);
  const lons = CITIES.map(c => c.lon);
  const bounds = L.latLngBounds(
    [Math.min(...lats) - 0.3, Math.min(...lons) - 0.5],
    [Math.max(...lats) + 0.3, Math.max(...lons) + 0.5]
  );

  map = L.map("map-container", {
    zoomControl: true,
    attributionControl: true,
  }).fitBounds(bounds);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 16,
  }).addTo(map);
}

export function renderMap(weatherData) {
  if (!weatherData) return;
  initMap();

  // Clear existing
  if (markerClusterGroup) {
    map.removeLayer(markerClusterGroup);
  }
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];

  // Use marker cluster if available
  const useCluster = typeof L.markerClusterGroup === 'function';
  if (useCluster) {
    markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 35,
      disableClusteringAtZoom: 11,
      iconCreateFunction: (cluster) => {
        const markers = cluster.getAllChildMarkers();
        let sum = 0;
        markers.forEach(m => { sum += m.options._temp || 0; });
        const avg = Math.round(sum / markers.length);
        const color = tempColor(avg);
        return L.divIcon({
          className: '',
          html: `<div class="map-cluster" style="border-color:${color}"><span>${avg}°</span><small>${markers.length} ciudades</small></div>`,
          iconSize: [70, 40],
          iconAnchor: [35, 20],
        });
      }
    });
  }

  for (let i = 0; i < CITIES.length; i++) {
    const city = CITIES[i];
    const current = weatherData[i].current;
    const daily = weatherData[i].daily;
    const marine = weatherData[i].marine;
    const w = getWeatherInfo(current.weather_code);
    const temp = Math.round(current.temperature_2m);
    const color = tempColor(temp);

    // Marine data
    let waterTemp = null;
    let waveHeight = null;
    if (marine && marine.hourly) {
      const hIdx = getCurrentHourIndex(marine.hourly.time);
      const sst = marine.hourly.sea_surface_temperature;
      const wh = marine.hourly.wave_height;
      if (sst && sst[hIdx] != null) waterTemp = Math.round(sst[hIdx]);
      if (wh && wh[hIdx] != null) waveHeight = wh[hIdx].toFixed(1);
    }

    const markerHtml = `<div class="map-marker" style="border-color:${color}">
      <span class="map-marker-icon">${w.icon}</span>
      <span class="map-marker-temp" style="color:${color}">${temp}°</span>
    </div>`;

    const icon = L.divIcon({
      className: "",
      html: markerHtml,
      iconSize: null,
      iconAnchor: [30, 15],
    });

    // Popup
    let popupExtra = '';
    if (waterTemp !== null) popupExtra += `<dt>Agua</dt><dd>${waterTemp}°C</dd>`;
    if (waveHeight !== null) popupExtra += `<dt>Olas</dt><dd>${waveHeight}m</dd>`;

    const popup = `<div class="map-popup">
      <div class="popup-name">${city.name}</div>
      <div class="popup-desc">${w.icon} ${w.desc}</div>
      <dl class="popup-details">
        <dt>Temperatura</dt><dd style="color:${color};font-weight:700">${temp}°C</dd>
        <dt>Sensación</dt><dd>${Math.round(current.apparent_temperature)}°C</dd>
        <dt>Min / Máx</dt><dd>${Math.round(daily.temperature_2m_min[0])}° / ${Math.round(daily.temperature_2m_max[0])}°</dd>
        <dt>Humedad</dt><dd>${current.relative_humidity_2m}%</dd>
        <dt>Viento</dt><dd>${Math.round(current.wind_speed_10m)} km/h ${windArrow(current.wind_direction_10m)}</dd>
        ${popupExtra}
      </dl>
    </div>`;

    const marker = L.marker([city.lat, city.lon], { icon, _temp: temp })
      .bindPopup(popup, { maxWidth: 240 });

    if (useCluster) {
      markerClusterGroup.addLayer(marker);
    } else {
      marker.addTo(map);
    }
    mapMarkers.push(marker);
  }

  if (useCluster) {
    map.addLayer(markerClusterGroup);
  }
}

export function invalidateMap() {
  if (map) setTimeout(() => map.invalidateSize(), 100);
}

export function flyToCity(city) {
  if (!map) return;
  map.flyTo([city.lat, city.lon], 12);
  const idx = CITIES.indexOf(city);
  if (mapMarkers[idx]) mapMarkers[idx].openPopup();
}
