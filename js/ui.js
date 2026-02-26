import { WMO_CODES } from './config.js';

export function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: "Desconocido", icon: "❓" };
}

export function windDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

export function windArrow(deg) {
  return `<span class="wind-arrow" style="display:inline-block;transform:rotate(${deg + 180}deg)">↑</span>`;
}

export function tempColor(temp) {
  if (temp <= 5) return '#4fc3f7';
  if (temp <= 10) return '#81d4fa';
  if (temp <= 15) return '#b3e5fc';
  if (temp <= 20) return '#aed581';
  if (temp <= 25) return '#ffb74d';
  if (temp <= 30) return '#ff8a65';
  if (temp <= 35) return '#ef5350';
  return '#d32f2f';
}

export function uvLabel(uv) {
  if (uv <= 2) return { text: "Bajo", cls: "uv-low" };
  if (uv <= 5) return { text: "Moderado", cls: "uv-mod" };
  if (uv <= 7) return { text: "Alto", cls: "uv-high" };
  if (uv <= 10) return { text: "Muy alto", cls: "uv-vhigh" };
  return { text: "Extremo", cls: "uv-extreme" };
}

export function formatTime(isoString) {
  const dt = new Date(isoString);
  const h = dt.getHours();
  const m = String(dt.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function getCurrentHourIndex(hourlyTimes) {
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

export function rainClass(precip) {
  if (precip >= 80) return ' rain-heavy';
  if (precip >= 50) return ' rain-likely';
  return '';
}
