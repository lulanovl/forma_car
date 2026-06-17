import { useState, useEffect } from 'react';
import { getCarwashes, createCarwash, updateCarwashAdmin } from '../../api/index.js';
import { toastSuccess, toastError } from '../../components/toast.js';

const fieldBox = { background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--white)', padding: '.6rem .8rem', borderRadius: '8px', width: '100%' };
const labelCol = { display: 'flex', flexDirection: 'column', gap: '.35rem' };
const labelTxt = { fontSize: '.8rem', color: 'var(--gray)' };

const EMPTY = { slug: '', name: '', admin_login: '', admin_password: '', primary_color: '#e60000', accent_color: '#bf0000' };

export default function PlatformPage({ onBackSite, onLogout }) {
  const [carwashes, setCarwashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCarwashes(await getCarwashes());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function field(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function submit() {
    if (!form.slug || !form.name || !form.admin_login || !form.admin_password) {
      toastError('Заполните slug, название, логин и пароль');
      return;
    }
    setCreating(true);
    try {
      await createCarwash(form);
      toastSuccess(`Мойка «${form.name}» создана`);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toastError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(cw) {
    try {
      const updated = await updateCarwashAdmin(cw.id, { is_active: !cw.is_active });
      setCarwashes(prev => prev.map(c => (c.id === cw.id ? { ...c, is_active: updated.is_active } : c)));
    } catch (err) {
      toastError(err.message);
    }
  }

  return (
    <div className="crm-wrap" style={{ display: 'block', padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="crm-page-title" style={{ margin: 0 }}>ПЛАТФОРМА · АВТОМОЙКИ</div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="crm-btn" style={{ width: 'auto' }} onClick={onBackSite}>← На сайт</button>
          <button className="crm-btn" style={{ width: 'auto' }} onClick={onLogout}>Выйти</button>
        </div>
      </div>

      {/* Create form */}
      <div className="crm-box" style={{ border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="crm-box-title">Новая автомойка</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', padding: '1rem 0' }}>
          <label style={labelCol}>
            <span style={labelTxt}>Slug (поддомен)</span>
            <input value={form.slug} onChange={e => field('slug', e.target.value)} placeholder="mojka1" style={fieldBox} />
          </label>
          <label style={labelCol}>
            <span style={labelTxt}>Название</span>
            <input value={form.name} onChange={e => field('name', e.target.value)} placeholder="Мойка №1" style={fieldBox} />
          </label>
          <label style={labelCol}>
            <span style={labelTxt}>Логин админа</span>
            <input value={form.admin_login} onChange={e => field('admin_login', e.target.value)} autoComplete="off" style={fieldBox} />
          </label>
          <label style={labelCol}>
            <span style={labelTxt}>Пароль админа</span>
            <input type="text" value={form.admin_password} onChange={e => field('admin_password', e.target.value)} autoComplete="off" style={fieldBox} />
          </label>
          <label style={labelCol}>
            <span style={labelTxt}>Основной цвет</span>
            <input type="color" value={form.primary_color} onChange={e => field('primary_color', e.target.value)}
              style={{ ...fieldBox, height: '42px', cursor: 'pointer', padding: '.2rem' }} />
          </label>
          <label style={labelCol}>
            <span style={labelTxt}>Дополнительный цвет</span>
            <input type="color" value={form.accent_color} onChange={e => field('accent_color', e.target.value)}
              style={{ ...fieldBox, height: '42px', cursor: 'pointer', padding: '.2rem' }} />
          </label>
        </div>
        <div style={{ color: 'var(--gray)', fontSize: '.8rem', marginBottom: '.8rem' }}>
          Каталог (услуги, типы кузова, цены, чек-лист, тайм-слоты) копируется из FormaCar — потом редактируется в её CRM.
        </div>
        <button className="btn-save-price" disabled={creating} onClick={submit}>
          {creating ? 'СОЗДАЁМ...' : 'СОЗДАТЬ МОЙКУ'}
        </button>
      </div>

      {/* List */}
      <div className="crm-box" style={{ border: '1px solid var(--border)' }}>
        <div className="crm-box-title">Все автомойки</div>
        {loading && <div className="loading" />}
        {error && <div style={{ padding: '1rem', color: 'var(--gray)' }}>{error}</div>}
        {!loading && !error && (
          <table>
            <thead>
              <tr><th>ID</th><th>Slug</th><th>Название</th><th>Заказы</th><th>Админы</th><th>Статус</th></tr>
            </thead>
            <tbody>
              {carwashes.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--gray)' }}>{c.id}</td>
                  <td style={{ fontWeight: 500 }}>{c.slug}</td>
                  <td>{c.name}</td>
                  <td>{c.order_count}</td>
                  <td>{c.admin_count}</td>
                  <td>
                    {c.is_default ? (
                      <span
                        title="Мойка по умолчанию — на неё завязан вход без поддомена, выключить нельзя"
                        style={{ color: 'var(--gray)', fontSize: '.85rem', cursor: 'default' }}
                      >
                        ● Активна (по умолчанию)
                      </span>
                    ) : (
                      <button
                        className="crm-btn"
                        style={{ width: 'auto', padding: '.3rem .7rem', color: c.is_active ? 'var(--red)' : 'var(--gray)' }}
                        onClick={() => toggleActive(c)}
                      >
                        {c.is_active ? '● Активна' : '○ Выключена'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
