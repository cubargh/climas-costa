import { getCityBySlug, getCityIndex, CITIES } from './config.js';

export function getActiveCitySlug() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (path && getCityBySlug(path)) return path;

  return null;
}

export function renderCityDetail(slug, weatherData, renderCardFn, currentMode, nearestSlug) {
  const city = getCityBySlug(slug);
  const idx = getCityIndex(slug);
  if (!city || idx === -1 || !weatherData[idx]) return null;

  const prevIdx = idx > 0 ? idx - 1 : CITIES.length - 1;
  const nextIdx = idx < CITIES.length - 1 ? idx + 1 : 0;
  const prevCity = CITIES[prevIdx];
  const nextCity = CITIES[nextIdx];

  const card = renderCardFn(city, weatherData[idx], currentMode, nearestSlug);

  return `
    <div class="city-detail">
      <div class="city-detail-nav">
        <a href="/${prevCity.slug}" class="detail-nav-btn detail-nav-prev"><i class="bi bi-chevron-left"></i> ${prevCity.name}</a>
        <a href="/" class="detail-nav-btn detail-back">Ver todas</a>
        <a href="/${nextCity.slug}" class="detail-nav-btn detail-nav-next">${nextCity.name} <i class="bi bi-chevron-right"></i></a>
      </div>
      ${card}
    </div>`;
}
