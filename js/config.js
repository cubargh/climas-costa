export const CITIES = [
  { name: "San Clemente del Tuyú", slug: "san-clemente-del-tuyu", lat: -36.36, lon: -56.72 },
  { name: "Las Toninas",           slug: "las-toninas",           lat: -36.47, lon: -56.70 },
  { name: "Santa Teresita",        slug: "santa-teresita",        lat: -36.54, lon: -56.70 },
  { name: "Mar del Tuyú",          slug: "mar-del-tuyu",          lat: -36.58, lon: -56.69 },
  { name: "Costa del Este",        slug: "costa-del-este",        lat: -36.62, lon: -56.69 },
  { name: "Aguas Verdes",          slug: "aguas-verdes",          lat: -36.65, lon: -56.69 },
  { name: "La Lucila del Mar",     slug: "la-lucila-del-mar",     lat: -36.66, lon: -56.69 },
  { name: "San Bernardo",          slug: "san-bernardo",          lat: -36.69, lon: -56.69 },
  { name: "Mar de Ajó",            slug: "mar-de-ajo",            lat: -36.72, lon: -56.68 },
  { name: "Nueva Atlantis",        slug: "nueva-atlantis",        lat: -36.78, lon: -56.72 },
  { name: "Pinamar",               slug: "pinamar",               lat: -37.11, lon: -56.86 },
  { name: "Ostende",               slug: "ostende",               lat: -37.15, lon: -56.88 },
  { name: "Valeria del Mar",       slug: "valeria-del-mar",       lat: -37.16, lon: -56.89 },
  { name: "Cariló",                slug: "carilo",                lat: -37.17, lon: -56.90 },
  { name: "Villa Gesell",          slug: "villa-gesell",          lat: -37.26, lon: -56.97 },
  { name: "Mar de las Pampas",     slug: "mar-de-las-pampas",     lat: -37.33, lon: -57.02 },
  { name: "Mar Azul",              slug: "mar-azul",              lat: -37.35, lon: -57.03 },
  { name: "Mar del Plata",         slug: "mar-del-plata",         lat: -38.00, lon: -57.56 },
  { name: "Miramar",               slug: "miramar",               lat: -38.27, lon: -57.84 },
  { name: "Mar del Sur",           slug: "mar-del-sur",           lat: -38.35, lon: -57.99 },
  { name: "Necochea",              slug: "necochea",              lat: -38.55, lon: -58.74 },
  { name: "Claromecó",             slug: "claromeco",             lat: -38.86, lon: -60.08 },
  { name: "Reta",                  slug: "reta",                  lat: -38.89, lon: -60.33 },
  { name: "Monte Hermoso",         slug: "monte-hermoso",         lat: -38.98, lon: -61.30 },
  { name: "Pehuen-Có",             slug: "pehuen-co",             lat: -39.00, lon: -61.55 },
];

export const WMO_CODES = {
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

export const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function getCityBySlug(slug) {
  return CITIES.find(c => c.slug === slug);
}

export function getCityIndex(slug) {
  return CITIES.findIndex(c => c.slug === slug);
}
