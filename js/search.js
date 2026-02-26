import { CITIES } from './config.js';

function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function setupSearch(onFilter) {
  const input = document.getElementById('city-search');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = normalize(input.value.trim());
    if (!q) {
      onFilter(null);
      return;
    }
    const matches = CITIES
      .map((c, i) => ({ city: c, index: i }))
      .filter(({ city }) => normalize(city.name).includes(q));
    onFilter(matches);
  });
}

export function clearSearch() {
  const input = document.getElementById('city-search');
  if (input) input.value = '';
}
