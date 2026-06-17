// Which carwash this browser tab belongs to.
// Production: <slug>.formacar.app → 'slug'. Locally / on the apex domain there is
// no tenant subdomain, so fall back to VITE_CARWASH_SLUG (build-time) or 'formacar'.

const RESERVED = new Set(['www', 'app', 'api', 'admin', 'localhost']);

export function getCarwashSlug() {
  const host = window.location.hostname; // no port
  const labels = host.split('.');

  // Need at least sub.domain.tld for a real subdomain.
  if (labels.length >= 3) {
    const first = labels[0].toLowerCase();
    if (first && !RESERVED.has(first) && !/^\d+$/.test(first)) {
      return first;
    }
  }

  return import.meta.env.VITE_CARWASH_SLUG || 'formacar';
}
