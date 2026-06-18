import { useState, useEffect, useRef } from 'react';
import ServicesSection from './ServicesSection.jsx';
import BookingForm from './BookingForm.jsx';
import Icon from '../../components/Icon.jsx';

function CountUp({ to, decimals = 0, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const spanRef = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const inc = to / steps;
        let cur = 0;
        const id = setInterval(() => {
          cur += inc;
          if (cur >= to) { cur = to; clearInterval(id); }
          setVal(cur);
        }, duration / steps);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val);
  return <span ref={spanRef}>{display}{suffix}</span>;
}

export default function SitePage({ config }) {
  const [preSelectService, setPreSelectService] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Per-carwash branding with safe fallbacks to the built-in FormaCar defaults.
  const brandName = config?.name || 'FormaCar';
  const heroSubtitle = config?.hero_subtitle
    || `${brandName} — профессиональный уход за вашим автомобилем. Запишитесь онлайн, выберите удобное время и приезжайте без очереди.`;
  const phone = config?.phone || '+996 — — —';
  const address = config?.address || 'Бишкек, Кыргызстан';

  // WhatsApp is the same number as the phone — wa.me needs digits only.
  const phoneDigits = (config?.phone || '').replace(/\D/g, '');
  const hasWhatsapp = phoneDigits.length >= 9;
  // Instagram: accept a full URL or a bare @handle / handle.
  const instagramRaw = (config?.instagram_url || '').trim();
  const instagramUrl = instagramRaw
    ? (/^https?:\/\//i.test(instagramRaw) ? instagramRaw : `https://instagram.com/${instagramRaw.replace(/^@/, '')}`)
    : '';

  function scrollToBooking(svc = null) {
    if (svc) setPreSelectService(svc);
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  function scrollTo(id) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      {/* NAV */}
      <nav id="main-nav">
        <div className="nav-logo" onClick={() => window.scrollTo(0, 0)}>
          <div>
            <span>{brandName}</span>
            <span className="sub">Premium Car Wash</span>
          </div>
        </div>
        <ul>
          <li><a onClick={() => scrollTo('services')}>Услуги</a></li>
          <li><a onClick={() => scrollToBooking()}>Запись</a></li>
          <li><a onClick={() => scrollTo('why')}>О нас</a></li>
          <li><a onClick={() => scrollTo('contact')}>Контакты</a></li>
        </ul>
        <div className="nav-right">
          <button className="btn-nav" onClick={() => scrollToBooking()}>Записаться</button>
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Меню"
          >
            <span className={menuOpen ? 'burger-line open' : 'burger-line'}></span>
            <span className={menuOpen ? 'burger-line open' : 'burger-line'}></span>
            <span className={menuOpen ? 'burger-line open' : 'burger-line'}></span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          <a onClick={() => scrollTo('services')}>Услуги</a>
          <a onClick={() => scrollToBooking()}>Запись</a>
          <a onClick={() => scrollTo('why')}>О нас</a>
          <a onClick={() => scrollTo('contact')}>Контакты</a>
        </div>
      )}
      {menuOpen && <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />}

      {/* HERO */}
      <section className="hero">
        {/* Background photo: owner-uploaded (config.hero_image_url) or the
            bundled /hero.jpg default. A missing file simply doesn't paint (no
            broken-image icon), so the dark base + faint orbs stay a clean fallback. */}
        <div className="hero-bg" style={{ backgroundImage: `url(${config?.hero_image_url || '/hero.jpg'})` }} />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="hero-content">
          <div className="hero-eyebrow">Премиальная автомойка · Бишкек</div>
          <h1>
            <span className="line1">ЧИСТОТА</span>
            <span className="line2">ВЫСОКОГО</span>
            <span className="line3">КЛАССА</span>
          </h1>
          <p className="hero-sub">{heroSubtitle}</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => scrollToBooking()}>Записаться онлайн</button>
            <button className="hero-link" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Смотреть услуги</button>
          </div>
        </div>
        <div className="stats-bar">
          <div className="stat-item"><div><div className="stat-num"><CountUp to={1200} suffix="+" /></div><div className="stat-label">Клиентов</div></div></div>
          <div className="stat-item"><div><div className="stat-num"><CountUp to={4.9} decimals={1} /></div><div className="stat-label">Рейтинг</div></div></div>
          <div className="stat-item"><div><div className="stat-num"><CountUp to={3} /></div><div className="stat-label">Года на рынке</div></div></div>
          <div className="stat-item"><div><div className="stat-num"><CountUp to={100} suffix="%" /></div><div className="stat-label">Гарантия</div></div></div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section services-bg">
        <div className="section-label">Услуги</div>
        <div className="section-title">ВЫБЕРИТЕ <span className="accent">ПРОГРАММУ</span></div>
        <ServicesSection onPick={scrollToBooking} />
      </section>

      {/* BOOKING */}
      <section id="booking" className="section">
        <div className="section-label">Онлайн-запись</div>
        <div className="section-title">ЗАПИСАТЬСЯ <span className="accent">БЕЗ ОЧЕРЕДИ</span></div>
        <BookingForm preSelectService={preSelectService} />
      </section>

      {/* WHY */}
      <section id="why" className="section services-bg">
        <div className="section-label">Почему FormaCar</div>
        <div className="section-title">НАШ <span className="accent">СТАНДАРТ</span></div>
        <div className="why-grid">
          <div className="why-item">
            <div className="why-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3"/>
                <path d="M9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9V3z"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <div className="why-title">Профессиональная химия</div>
            <div className="why-desc">Используем только сертифицированную автохимию. Безопасно для лакокрасочного покрытия и пластика.</div>
          </div>
          <div className="why-item">
            <div className="why-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3.5 3.5"/>
              </svg>
            </div>
            <div className="why-title">Запись без ожидания</div>
            <div className="why-desc">Выберите точное время онлайн — мы гарантируем, что мастер будет готов именно к вашему приезду.</div>
          </div>
          <div className="why-item">
            <div className="why-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v6c0 4.5 3.25 8.75 9 10 5.75-1.25 9-5.5 9-10V7L12 2z"/>
                <path d="M8.5 12.5l2.5 2.5 4.5-4.5"/>
              </svg>
            </div>
            <div className="why-title">Гарантия качества</div>
            <div className="why-desc">Если результат вас не устроит — исправим бесплатно. Мы отвечаем за каждый автомобиль.</div>
          </div>
          <div className="why-item">
            <div className="why-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3"/>
                <circle cx="16" cy="8" r="2.5"/>
                <path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6"/>
                <path d="M16 14c1.66 0 4 .83 4 2.5V20"/>
              </svg>
            </div>
            <div className="why-title">Опытная команда</div>
            <div className="why-desc">Каждый мастер прошёл обучение и сертификацию. За 3 года — более 1200 довольных клиентов.</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="footer-top">
          <div>
            <span className="footer-logo">{brandName}</span>
            <div className="footer-desc">Premium Car Wash. Профессиональный уход за вашим автомобилем. Запись онлайн — без очередей.</div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Контакты</div>
            <ul className="footer-contacts">
              <li><a href="#"><Icon name="pin" size={16} />{address}</a></li>
              <li><a href={hasWhatsapp ? `tel:+${phoneDigits}` : '#'}><Icon name="phone" size={16} />{phone}</a></li>
              {hasWhatsapp && (
                <li><a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={16} />WhatsApp</a></li>
              )}
              {instagramUrl && (
                <li><a href={instagramUrl} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={16} />Instagram</a></li>
              )}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 <span className="footer-red">{brandName}</span> Premium Car Wash. Все права защищены.</p>
        </div>
      </footer>
    </>
  );
}
