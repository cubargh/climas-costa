const STORAGE_KEY = 'favorites';

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function toggleFavorite(slug) {
  const favs = getFavorites();
  const idx = favs.indexOf(slug);
  if (idx === -1) {
    favs.push(slug);
  } else {
    favs.splice(idx, 1);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  return favs;
}

export function isFavorite(slug) {
  return getFavorites().includes(slug);
}
