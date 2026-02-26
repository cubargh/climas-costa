import { CITIES } from './config.js';
import { fetchWeatherData } from './api.js';
import { renderMap, invalidateMap, flyToCity } from './map.js';
import { renderCard, renderHourly, renderDaily, syncHourlyScroll } from './cards.js';
import { setupSearch, clearSearch } from './search.js';
import { detectNearestCity } from './geolocation.js';
import { getActiveCitySlug, renderCityDetail } from './router.js';

let currentMode = "hourly";
let currentView = localStorage.getItem("view") || "map";
let weatherData = null;
let nearestSlug = null;
let lastUpdate = null;

// --- Rendering ---

function renderList() {
  if (!weatherData) return;
  const citiesEl = document.getElementById("cities");

  const citySlug = getActiveCitySlug();
  if (citySlug) {
    const detail = renderCityDetail(citySlug, weatherData, renderCard, currentMode, nearestSlug);
    if (detail) {
      citiesEl.innerHTML = detail;
      if (currentMode === "hourly") syncHourlyScroll();
      return;
    }
  }

  // Sort: nearest first, then original order
  const indices = CITIES.map((_, i) => i);
  indices.sort((a, b) => {
    const aNearest = CITIES[a].slug === nearestSlug ? 0 : 1;
    const bNearest = CITIES[b].slug === nearestSlug ? 0 : 1;
    if (aNearest !== bNearest) return aNearest - bNearest;
    return a - b;
  });

  let html = "";
  for (const i of indices) {
    html += renderCard(CITIES[i], weatherData[i], currentMode, nearestSlug);
  }
  citiesEl.innerHTML = html;
  if (currentMode === "hourly") syncHourlyScroll();
}

function updateTimestamp() {
  const el = document.getElementById('last-update');
  if (!el || !lastUpdate) return;
  const h = String(lastUpdate.getHours()).padStart(2, '0');
  const m = String(lastUpdate.getMinutes()).padStart(2, '0');
  el.textContent = `Actualizado: ${h}:${m}`;
}

// --- View / Mode ---

function setView(view) {
  currentView = view;
  localStorage.setItem("view", view);
  const mapEl = document.getElementById("map-container");
  const listEl = document.getElementById("cities");
  const forecastToggle = document.getElementById("forecast-toggle");
  const searchToggle = document.getElementById("btn-search-toggle");
  const searchBar = document.getElementById("search-bar");

  document.getElementById("btn-view-map").classList.toggle("active", view === "map");
  document.getElementById("btn-view-list").classList.toggle("active", view === "list");

  if (view === "map") {
    mapEl.classList.remove("hidden");
    listEl.classList.add("hidden");
    forecastToggle.classList.add("hidden");
    if (searchToggle) searchToggle.classList.add("hidden");
    if (searchBar) searchBar.classList.add("hidden");
    renderMap(weatherData);
    invalidateMap();
  } else {
    mapEl.classList.add("hidden");
    listEl.classList.remove("hidden");
    forecastToggle.classList.remove("hidden");
    if (searchToggle) searchToggle.classList.remove("hidden");
    renderList();
  }
}

function setMode(mode) {
  currentMode = mode;
  document.getElementById("btn-hourly").classList.toggle("active", mode === "hourly");
  document.getElementById("btn-daily").classList.toggle("active", mode === "daily");
  renderList();
}

// --- Search integration ---

function onSearchFilter(matches) {
  const cards = document.querySelectorAll('.city-card');
  if (!matches) {
    cards.forEach(c => c.classList.remove('hidden'));
    return;
  }
  const slugs = new Set(matches.map(m => m.city.slug));
  cards.forEach(card => {
    card.classList.toggle('hidden', !slugs.has(card.dataset.slug));
  });

  // If map view, zoom to matches
  if (currentView === 'map' && matches.length > 0) {
    if (matches.length === 1) {
      flyToCity(matches[0].city);
    }
  }
}

// --- Load ---

async function loadWeather() {
  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");
  const controlsEl = document.querySelector(".controls");
  const searchBarEl = document.getElementById("search-bar");

  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  document.getElementById("cities").innerHTML = "";

  // Hide controls while loading
  if (!weatherData) {
    if (controlsEl) controlsEl.classList.add("hidden");
    if (searchBarEl) searchBarEl.classList.add("hidden");
  }

  try {
    weatherData = await fetchWeatherData();
    lastUpdate = new Date();
    updateTimestamp();
    loadingEl.classList.add("hidden");
    if (controlsEl) controlsEl.classList.remove("hidden");

    setView(currentView);
  } catch (err) {
    console.error("Error fetching weather:", err);
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
    if (controlsEl) controlsEl.classList.remove("hidden");
  }
}

// --- SPA navigation ---

function navigateTo(path) {
  history.pushState(null, '', path);
  setView("list");
  window.scrollTo(0, 0);
}

function handleLinkClick(e) {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
  if (href === '/' || /^\/[a-z0-9-]+\/?$/.test(href)) {
    e.preventDefault();
    navigateTo(href);
  }
}

async function handleShare(e) {
  const btn = e.target.closest('.share-btn');
  if (!btn) return;
  const text = decodeURIComponent(btn.dataset.share);
  if (navigator.share) {
    try { await navigator.share({ text }); } catch {}
  } else {
    await navigator.clipboard.writeText(text);
    btn.classList.add('shared');
    setTimeout(() => btn.classList.remove('shared'), 1500);
  }
}

// --- Init ---

function init() {
  // SPA link interception + share buttons
  document.getElementById("cities").addEventListener("click", handleLinkClick);
  document.getElementById("cities").addEventListener("click", handleShare);

  // Browser back/forward
  window.addEventListener("popstate", () => {
    if (weatherData) setView("list");
  });

  // Event listeners
  document.getElementById("btn-view-map").addEventListener("click", () => setView("map"));
  document.getElementById("btn-view-list").addEventListener("click", () => setView("list"));
  document.getElementById("btn-hourly").addEventListener("click", () => setMode("hourly"));
  document.getElementById("btn-daily").addEventListener("click", () => setMode("daily"));

  const retryBtn = document.querySelector("#error button");
  if (retryBtn) retryBtn.addEventListener("click", loadWeather);

  const adClose = document.querySelector(".ad-close");
  if (adClose) adClose.addEventListener("click", () => {
    document.getElementById("mobile-ad-banner")?.remove();
  });

  // Search toggle
  const searchToggleBtn = document.getElementById("btn-search-toggle");
  const searchBarEl = document.getElementById("search-bar");
  if (searchToggleBtn && searchBarEl) {
    searchToggleBtn.addEventListener("click", () => {
      const isOpen = !searchBarEl.classList.contains("hidden");
      searchBarEl.classList.toggle("hidden", isOpen);
      searchToggleBtn.classList.toggle("active", !isOpen);
      if (!isOpen) {
        const input = document.getElementById("city-search");
        if (input) input.focus();
      } else {
        const input = document.getElementById("city-search");
        if (input) { input.value = ''; }
        onSearchFilter(null);
      }
    });
  }

  // Search
  setupSearch(onSearchFilter);

  // Geolocation
  detectNearestCity((city) => {
    nearestSlug = city.slug;
    if (weatherData && currentView === 'list') renderList();
  });

  // City detail page check
  const citySlug = getActiveCitySlug();
  if (citySlug) {
    currentView = "list";
  }

  // Load data
  loadWeather();

  // Auto-refresh every 30 minutes
  setInterval(loadWeather, 30 * 60 * 1000);

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

init();
