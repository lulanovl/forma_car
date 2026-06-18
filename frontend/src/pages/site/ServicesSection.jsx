import { useState, useEffect } from 'react';
import { getServices } from '../../api/index.js';
import Icon from '../../components/Icon.jsx';

// Per-service presentation: a short, scannable benefit line (mobile users read
// little — one clear sentence beats a bullet list), an icon used as the photo
// fallback, and the image slug. Drop a photo at /services/{slug}.jpg and the
// card upgrades from the icon fallback to the photo automatically.
const SERVICE_META = {
  'Стандартная мойка':    { slug: 'standard',   icon: 'droplet',     benefit: 'Кузов, диски, стёкла и сушка микрофиброй' },
  'Трёхфазная мойка':     { slug: 'three-phase', icon: 'layers',      benefit: 'Пена, мойка и полировка в три этапа' },
  'Премиум мойка':        { slug: 'premium',     icon: 'sparkles',    benefit: 'Наружная мойка, салон и полировка кузова' },
  'Химчистка':            { slug: 'dryclean',    icon: 'spray',       benefit: 'Глубокая чистка салона до текстиля' },
  'Полировка + керамика': { slug: 'ceramic',     icon: 'shield',      benefit: 'Нанокерамика и защита кузова на 2–3 года' },
  'Мойка днища':          { slug: 'underbody',   icon: 'droplets',    benefit: 'Высокое давление, удаление соли и грязи' },
  'Антикор днища':        { slug: 'anticor',     icon: 'shieldCheck', benefit: 'Защита днища от ржавчины и коррозии' },
};

function minPrice(pricing) {
  if (!pricing || !pricing.length) return null;
  return pricing.reduce((m, p) => Math.min(m, Number(p.price)), Infinity);
}

// Image slot with graceful fallback: shows the photo if it loads, otherwise a
// large branded icon on a tinted gradient. `src` is the owner-uploaded photo if
// set, else the bundled per-service default; null/failed → icon only.
function ServiceMedia({ src, icon, popular }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="svc-card-media">
      {src && ok && (
        <img
          className="svc-card-img"
          src={src}
          alt=""
          loading="lazy"
          onError={() => setOk(false)}
        />
      )}
      <span className="svc-card-icon"><Icon name={icon} size={56} strokeWidth={1.4} /></span>
      {popular && <span className="svc-card-badge">Популярный</span>}
    </div>
  );
}

export default function ServicesSection({ onPick }) {
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServices()
      .then((data) => {
        setServices(data);
        // Update footer services list
        const footerList = document.getElementById('footer-services-list');
        if (footerList) {
          footerList.innerHTML = data.map(s => `<li><a href="#">${s.name}</a></li>`).join('');
        }
      })
      .catch(() => setError('Не удалось загрузить услуги'));
  }, []);

  if (error) {
    return <div style={{ padding: '2rem', color: 'var(--gray)' }}>{error}</div>;
  }

  if (!services.length) {
    return <div id="services-grid"><div className="loading" /></div>;
  }

  return (
    <div id="services-grid">
      <div className="svc-grid">
        {services.map((svc) => {
          const meta = SERVICE_META[svc.name] || { slug: null, icon: 'droplet', benefit: svc.description };
          const popular = svc.name === 'Трёхфазная мойка';
          const from = minPrice(svc.pricing);
          // Owner-uploaded photo wins; otherwise the bundled per-service default.
          const imgSrc = svc.image_url || (meta.slug ? `/services/${meta.slug}.jpg` : null);

          return (
            <button
              key={svc.id}
              type="button"
              className={`svc-card${popular ? ' svc-card-popular' : ''}`}
              onClick={() => onPick(svc)}
            >
              <ServiceMedia src={imgSrc} icon={meta.icon} popular={popular} />
              <div className="svc-card-body">
                <h3 className="svc-card-title">{svc.name}</h3>
                <p className="svc-card-benefit">{meta.benefit}</p>
                <div className="svc-card-foot">
                  <span className="svc-card-price">
                    {from != null
                      ? <>от {from.toLocaleString('ru-RU')} <small>сом</small></>
                      : <small>Цена по запросу</small>}
                  </span>
                  <span className="svc-card-cta">Выбрать<Icon name="back" size={16} className="svc-card-cta-arrow" /></span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
