import { API_BASE_URL } from "../api/axiosClient";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function resolveMediaUrl(path) {
  if (!path || typeof path !== "string") {
    return null;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed}`;
}

export function buildProductPlaceholder(label = "SportShop") {
  const safeLabel = String(label).trim().slice(0, 32) || "SportShop";
  const xmlLabel = escapeXml(safeLabel);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#7f1d1d"/>
        </linearGradient>
      </defs>
      <rect width="900" height="700" fill="url(#g)"/>
      <circle cx="150" cy="120" r="140" fill="rgba(255,255,255,0.16)"/>
      <circle cx="820" cy="620" r="210" fill="rgba(255,255,255,0.10)"/>
      <text x="450" y="360" text-anchor="middle" fill="#ffffff" font-size="56" font-weight="700" font-family="Outfit, Arial, sans-serif">
        ${xmlLabel}
      </text>
      <text x="450" y="420" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="28" font-weight="500" font-family="Plus Jakarta Sans, Arial, sans-serif">
        Premium Sports Gear
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
