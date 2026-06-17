// Which carwash this browser tab belongs to. Resolved once at startup and cached,
// so later client-side navigation (e.g. into /crm) doesn't change the tenant.
//
// Priority:
//   1. /m/<slug>            — path-based, free shareable link (no custom domain)
//   2. ?carwash=<slug>      — explicit override
//   3. <slug>.domain.tld    — subdomain (needs a custom/wildcard domain)
//   4. VITE_CARWASH_SLUG    — build-time env (e.g. a per-deploy override)
//   5. 'formacar'           — default

const RESERVED = new Set(['www', 'app', 'api', 'admin', 'localhost']);

let cached = null;

function derive() {
  // 1. /m/<slug>
  const pathMatch = window.location.pathname.match(/^\/m\/([a-z0-9-]+)/i);
  if (pathMatch) return pathMatch[1].toLowerCase();

  // 2. ?carwash=<slug>
  const q = new URLSearchParams(window.location.search).get('carwash');
  if (q) return q.trim().toLowerCase();

  // 3. subdomain (sub.domain.tld)
  const labels = window.location.hostname.split('.');
  if (labels.length >= 3) {
    const first = labels[0].toLowerCase();
    if (first && !RESERVED.has(first) && !/^\d+$/.test(first)) {
      return first;
    }
  }

  // 4 + 5. build-time env, then default
  return import.meta.env.VITE_CARWASH_SLUG || 'formacar';
}

export function getCarwashSlug() {
  if (cached === null) cached = derive();
  return cached;
}
