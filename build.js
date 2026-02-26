#!/usr/bin/env node
/**
 * build.js — Generates individual city pages and sitemap for SEO.
 * Run: node build.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Parse CITIES from config.js (avoid import since it uses export)
const configSrc = readFileSync(join(import.meta.dirname, 'js', 'config.js'), 'utf-8');
const citiesMatch = configSrc.match(/export const CITIES = (\[[\s\S]*?\]);/);
if (!citiesMatch) { console.error('Could not parse CITIES'); process.exit(1); }
const CITIES = eval(citiesMatch[1]);

const DOMAIN = 'https://climadelacosta.com.ar';
const BASE = import.meta.dirname;

// Read index.html as template base
const indexHtml = readFileSync(join(BASE, 'index.html'), 'utf-8');

function buildCityPage(city) {
  const title = `Clima en ${city.name} | Pronóstico por hora y por día`;
  const desc = `Pronóstico del clima en ${city.name}, costa atlántica de Buenos Aires. Temperatura actual, sensación térmica, humedad, viento, lluvia, índice UV, temperatura del agua y olas por hora y por día.`;
  const url = `${DOMAIN}/${city.slug}`;

  let html = indexHtml;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Replace canonical
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}">`);

  // Replace meta description
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}">`);

  // Replace OG tags
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="Clima en ${city.name} - Costa Atlántica">`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}">`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}">`);

  // Replace Twitter tags
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="Clima en ${city.name} - Costa Atlántica">`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${desc}">`);

  // Add city-slug meta tag after theme-color
  html = html.replace(
    /<meta name="theme-color"[^>]*>/,
    `<meta name="theme-color" content="#0f1b2d">\n  <meta name="city-slug" content="${city.slug}">`
  );

  // Update structured data — add BreadcrumbList
  const breadcrumb = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "${DOMAIN}/" },
      { "@type": "ListItem", "position": 2, "name": "${city.name}", "item": "${url}" }
    ]
  }
  </script>`;

  // Insert before </head>
  html = html.replace('</head>', `  ${breadcrumb}\n</head>`);

  // Fix relative paths for subdirectory (css, js, icons, manifest)
  html = html.replace(/href="style\.css"/g, 'href="/style.css"');
  html = html.replace(/href="\/manifest\.json"/g, 'href="/manifest.json"');
  html = html.replace(/src="js\//g, 'src="/js/');

  return html;
}

function buildSitemap() {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
`;
  for (const city of CITIES) {
    xml += `  <url>
    <loc>${DOMAIN}/${city.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }
  xml += '</urlset>\n';
  return xml;
}

// Generate city pages
let count = 0;
for (const city of CITIES) {
  const dir = join(BASE, city.slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const html = buildCityPage(city);
  writeFileSync(join(dir, 'index.html'), html);
  count++;
}
console.log(`Generated ${count} city pages`);

// Generate sitemap
writeFileSync(join(BASE, 'sitemap.xml'), buildSitemap());
console.log(`Generated sitemap.xml with ${count + 1} URLs`);
