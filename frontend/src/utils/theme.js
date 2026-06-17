// Apply a carwash's brand colors by overriding the global CSS variables the whole
// UI is built on (--red is the accent used across site + CRM). Brand-only theming:
// we remap the existing palette, we don't restyle layouts.

function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function applyTheme(config) {
  if (!config) return;
  const root = document.documentElement;

  const primary = config.primary_color;
  if (primary) {
    root.style.setProperty('--red', primary);
    const rgb = hexToRgb(primary);
    if (rgb) {
      root.style.setProperty('--red-glow', `rgba(${rgb.join(',')},0.4)`);
      root.style.setProperty('--border-red', `rgba(${rgb.join(',')},0.35)`);
    }
  }

  const accent = config.accent_color;
  if (accent) root.style.setProperty('--red-dark', accent);
}
