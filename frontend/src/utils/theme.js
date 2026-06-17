// Apply a carwash's brand colors by overriding the global CSS variables the whole
// UI is built on. Two configurable colors, both meaningful:
//   primary  → --accent-rgb : the dominant accent (buttons, lines, glows, borders,
//              section tints). All rgba(var(--accent-rgb), …) variants follow it.
//   secondary→ --accent2-rgb: the secondary tint family + the dark end of gradients
//              (so buttons/gradients read as a two-tone primary→secondary).
// Brand-only theming: we remap the palette, we don't restyle layouts.

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
    const rgb = hexToRgb(primary);
    root.style.setProperty('--red', primary);
    if (rgb) root.style.setProperty('--accent-rgb', rgb.join(', '));
    // --red-glow / --border-red derive from --accent-rgb in CSS, no need to set them
  }

  const secondary = config.accent_color;
  if (secondary) {
    const rgb = hexToRgb(secondary);
    root.style.setProperty('--red-dark', secondary);
    if (rgb) root.style.setProperty('--accent2-rgb', rgb.join(', '));
  }
}
