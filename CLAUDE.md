# Clima de la Costa

Weather app for 25 coastal cities along the Buenos Aires Atlantic coast.
Live at **https://climadelacosta.com.ar** — hosted on GitHub Pages with Cloudflare DNS.

## Tech Stack

- **Vanilla JS** (ES modules, no framework/bundler)
- **Leaflet** + MarkerCluster for interactive map
- **Bootstrap Icons** via CDN
- **Open-Meteo API** (forecast + marine endpoints, no API key needed)
- **PWA** with service worker (network-first API, cache-first static)
- **Static site generation** via `build.js` for individual city pages

## Project Structure

```
/
├── index.html              Main page template (also used by build.js)
├── style.css               All styles, single file
├── build.js                Generates 25 city pages + sitemap.xml
├── manifest.json           PWA manifest
├── sw.js                   Service worker (offline support)
├── og-image.png            Social sharing image
├── icons/                  PWA icons (192, 512)
├── js/
│   ├── main.js             App entry point, state, init, SPA routing
│   ├── config.js           CITIES array (25 cities), WMO codes, day names
│   ├── api.js              fetchWeatherData() — forecast + marine APIs
│   ├── cards.js            renderCard(), renderHourly(), renderDaily()
│   ├── map.js              Leaflet map, markers, clusters, popups
│   ├── ui.js               Helpers: tempColor, windArrow, uvLabel, etc.
│   ├── router.js           getActiveCitySlug(), renderCityDetail()
│   ├── search.js           Accent-insensitive city filtering
│   ├── geolocation.js      Nearest city detection via browser API
│   └── favorites.js        localStorage favorites (exported but unused)
└── {city-slug}/            25 generated city directories
    └── index.html          City-specific page (SEO meta, same JS)
```

## Architecture

### Data Flow

1. `main.js` calls `api.js:fetchWeatherData()` on init and every 30 min
2. API fetches forecast + marine data for all 25 cities in parallel
3. Data stored in `weatherData` array (one object per city)
4. `setView()` renders either map (`map.js`) or card list (`cards.js`)
5. SPA navigation via `history.pushState` — no page reloads between views

### Views

- **Map view**: Leaflet map with temp-colored markers, clustering, popups
- **List view**: Card grid (single column mobile, auto-fill desktop)
- **City detail**: Single card with prev/next navigation (SPA)
- **Modes**: Hourly (48h scrollable) or Daily (7-day rows)

### Key Patterns

- All internal links intercepted for SPA routing (`handleLinkClick` on `#cities`)
- View preference (map/list) persisted in `localStorage`
- Geolocation sorts nearest city to top with "Cerca de vos" badge
- Share button uses Web Share API with clipboard fallback
- Hourly scroll synced across all visible cards
- Marine data (water temp, wave height) fails gracefully if API is down

## CSS Design

- **Background**: Vertical gradient from dark ocean → sky blue
- **Cards**: White, rounded (16px), subtle shadow, hover lift
- **Controls**: Glass-morphism (`backdrop-filter: blur`)
- **Responsive breakpoint**: 720px
  - Desktop: multi-column grid (`minmax(370px, 1fr)`)
  - Mobile: single column (`minmax(0, 1fr)`)
- **Temperature colors**: Cyan (cold) → green → orange → red (hot)
- **UV badges**: 5 levels (green/yellow/orange/red/purple)
- **City detail**: `max-width: 700px`, `min-width: 0; overflow: hidden` to prevent grid blowout from hourly scroll content

## Build & Deploy

```bash
# Generate city pages and sitemap
node build.js

# Serve locally for testing
python3 -m http.server 8080

# Deploy: push to master, GitHub Pages auto-deploys
git push origin master
```

`build.js` reads `index.html` as a template, replaces SEO meta tags per city, fixes relative paths to absolute (`/style.css`, `/js/`), adds BreadcrumbList structured data, and writes `{slug}/index.html` for each city.

**Always re-run `node build.js` after changing `index.html`** — the city pages are copies of the template.

## CDN Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| Bootstrap Icons | 1.13.1 | UI icons (weather details, nav, share) |
| Leaflet | 1.9.4 | Interactive map |
| Leaflet MarkerCluster | 1.5.3 | Map marker grouping |
| Inter (Google Fonts) | 400-700 | Typography |

## API Details

- **Forecast**: `api.open-meteo.com/v1/forecast` — current + 48h hourly + 7d daily
- **Marine**: `api.open-meteo.com/v1/marine` — wave height, water temp, wave period
- **Timezone**: `America/Argentina/Buenos_Aires`
- Both APIs accept multiple locations via comma-separated lat/lon
- No API key required, no rate limit headers observed

## Monetization

- Google AdSense (`ca-pub-3848418952970070`, slot `5357074626`)
- Mobile sticky bottom banner (hidden on desktop)
- Dismissible via close button

## SEO

- Individual city pages with unique titles, descriptions, canonical URLs
- Open Graph + Twitter Card meta tags
- JSON-LD structured data (WebSite, WebApplication, BreadcrumbList)
- `sitemap.xml` generated by build.js with hourly changefreq
- Keyword-rich SEO content section in footer area

## Common Tasks

### Add a new city
1. Add entry to `CITIES` array in `js/config.js` (maintain north-to-south order)
2. Run `node build.js` to generate its page
3. Update the SEO content paragraph in `index.html` if desired

### Change styling
- All styles in single `style.css` file
- CSS variables in `:root` for colors
- Mobile overrides in `@media (max-width: 720px)` block at bottom

### Debug API issues
- Check browser console — `api.js` logs errors
- Marine API can fail independently (null marine data is handled)
- Service worker may serve stale cached data — clear in DevTools > Application
