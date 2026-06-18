import { useState, useEffect } from 'react';
import {
  getSettings, updateSettings,
  getChecklistItems, createChecklistItem, deleteChecklistItem,
  getAllServices, updateService, uploadImage,
} from '../../api/index.js';
import { applyTheme } from '../../utils/theme.js';
import { toastSuccess, toastError } from '../../components/toast.js';

const fieldBox = { background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--white)', padding: '.6rem .8rem', borderRadius: '8px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', padding: '1rem 0' };

// Reusable photo picker: uploads the chosen file to Vercel Blob (via the API),
// then hands the resulting URL back through onChange. Shows a live preview and a
// remove action. Toasts only on upload failure — callers handle success.
function ImageField({ value, onChange, kind, aspect = '16 / 10', width = 110 }) {
  const [busy, setBusy] = useState(false);
  async function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadImage(file, kind);
      onChange(url);
    } catch (err) {
      toastError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ width, aspectRatio: aspect, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--dark)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value
          ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: 'var(--gray)', fontSize: '.7rem' }}>нет фото</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        <label className="btn-save-price" style={{ margin: 0, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'ЗАГРУЗКА…' : (value ? 'Заменить фото' : 'Загрузить фото')}
          <input type="file" accept="image/*" onChange={onPick} disabled={busy} style={{ display: 'none' }} />
        </label>
        {value && !busy && (
          <button type="button" onClick={() => onChange(null)}
            style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '.78rem', textAlign: 'left', padding: 0 }}>
            Убрать фото
          </button>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [form, setForm] = useState(null);
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', category: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, it, svcs] = await Promise.all([getSettings(), getChecklistItems(), getAllServices()]);
      setForm(s);
      setItems(it);
      setServices(svcs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function field(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  // Service photos persist immediately (they're separate from the settings form).
  async function setServiceImage(id, url) {
    try {
      await updateService(id, { image_url: url });
      setServices(prev => prev.map(s => (s.id === id ? { ...s, image_url: url } : s)));
      toastSuccess(url ? 'Фото услуги обновлено' : 'Фото услуги убрано');
    } catch (err) {
      toastError(err.message);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const updated = await updateSettings({
        name: form.name,
        logo_url: form.logo_url,
        primary_color: form.primary_color,
        accent_color: form.accent_color,
        hero_title: form.hero_title,
        hero_subtitle: form.hero_subtitle,
        hero_image_url: form.hero_image_url,
        phone: form.phone,
        address: form.address,
        telegram_bot_token: form.telegram_bot_token,
        telegram_chat_id: form.telegram_chat_id,
        checklist_enabled: form.checklist_enabled,
      });
      setForm(updated);
      applyTheme(updated); // live re-skin the panel with the new brand colors
      toastSuccess('Настройки сохранены');
    } catch (err) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addItem() {
    if (!newItem.title.trim() || !newItem.category.trim()) return;
    try {
      const created = await createChecklistItem({ title: newItem.title.trim(), category: newItem.category.trim() });
      setItems(prev => [...prev, created]);
      setNewItem({ title: '', category: '' });
      toastSuccess('Пункт добавлен');
    } catch (err) {
      toastError(err.message);
    }
  }

  async function removeItem(id) {
    try {
      await deleteChecklistItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toastSuccess('Пункт удалён');
    } catch (err) {
      toastError(err.message);
    }
  }

  if (loading) return <><div className="crm-page-title">НАСТРОЙКИ</div><div className="loading" /></>;
  if (error || !form) return <><div className="crm-page-title">НАСТРОЙКИ</div><div style={{ padding: '2rem', color: 'var(--gray)' }}>{error || 'Нет данных'}</div></>;

  const Text = (k, label, type = 'text') => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
      <span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>{label}</span>
      <input type={type} value={form[k] ?? ''} onChange={e => field(k, e.target.value)} style={fieldBox} />
    </label>
  );

  const Color = (k, label, fallback) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
      <span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>{label}</span>
      <input type="color" value={form[k] || fallback} onChange={e => field(k, e.target.value)}
        style={{ height: '42px', width: '100%', background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }} />
    </label>
  );

  return (
    <>
      <div className="crm-page-title">НАСТРОЙКИ</div>

      {/* Брендинг */}
      <div className="crm-box" style={{ border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="crm-box-title">Брендинг</div>
        <div style={grid}>
          {Text('name', 'Название мойки')}
          {Color('primary_color', 'Основной цвет', '#e60000')}
          {Color('accent_color', 'Дополнительный цвет', '#bf0000')}
          {Text('hero_title', 'Заголовок на сайте')}
          {Text('hero_subtitle', 'Подзаголовок на сайте')}
          {Text('phone', 'Телефон')}
          {Text('address', 'Адрес')}
          {Text('logo_url', 'URL логотипа')}
        </div>
        <div style={{ color: 'var(--gray)', fontSize: '.8rem' }}>
          Основной цвет — кнопки, ссылки, свечения и рамки. Дополнительный — вторичные подсветки и градиенты.
          Выбирай контрастный к тёмному фону (не белый/очень светлый).
        </div>
      </div>

      {/* Фото */}
      <div className="crm-box" style={{ border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="crm-box-title">Фото</div>

        <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>Фон главного экрана (hero)</span>
          <ImageField
            value={form.hero_image_url} kind="hero" aspect="16 / 9" width={160}
            onChange={(url) => { field('hero_image_url', url); toastSuccess(url ? 'Фото загружено — нажмите «Сохранить настройки»' : 'Фото убрано — нажмите «Сохранить настройки»'); }}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>Фото услуг (на карточках) — сохраняются сразу</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '.8rem' }}>
            {services.map(svc => (
              <div key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{svc.name}</span>
                <ImageField value={svc.image_url} kind="service" onChange={(url) => setServiceImage(svc.id, url)} />
              </div>
            ))}
            {services.length === 0 && <div style={{ color: 'var(--gray)', fontSize: '.85rem' }}>Услуг нет.</div>}
          </div>
        </div>
      </div>

      {/* Чек-лист */}
      <div className="crm-box" style={{ border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="crm-box-title">Чек-лист проверки</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '1rem 0' }}>
          <input type="checkbox" checked={!!form.checklist_enabled}
            onChange={e => field('checklist_enabled', e.target.checked)}
            style={{ accentColor: 'var(--red)', width: '18px', height: '18px', cursor: 'pointer' }} />
          <span>Включить чек-лист для новых заказов</span>
        </label>

        {form.checklist_enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {items.map(it => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem', padding: '.5rem .8rem', background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <span><span style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{it.category}</span> · {it.title}</span>
                <button onClick={() => removeItem(it.id)} title="Удалить"
                  style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              </div>
            ))}
            {items.length === 0 && <div style={{ color: 'var(--gray)', fontSize: '.85rem' }}>Пунктов нет — чек-лист будет пустым.</div>}

            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
              <input placeholder="Категория" value={newItem.category}
                onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                style={{ ...fieldBox, flex: '1 1 120px' }} />
              <input placeholder="Название пункта" value={newItem.title}
                onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                style={{ ...fieldBox, flex: '2 1 200px' }} />
              <button className="btn-save-price" style={{ margin: 0 }} onClick={addItem}>Добавить</button>
            </div>
          </div>
        )}
      </div>

      {/* Telegram */}
      <div className="crm-box" style={{ border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="crm-box-title">Telegram-уведомления</div>
        <div style={grid}>
          {Text('telegram_bot_token', 'Bot token')}
          {Text('telegram_chat_id', 'Chat ID')}
        </div>
        <div style={{ color: 'var(--gray)', fontSize: '.8rem' }}>Заполните, чтобы получать уведомления о новых заказах в Telegram.</div>
      </div>

      <button className="btn-save-price" disabled={saving} onClick={save}>
        {saving ? 'СОХРАНЯЕМ...' : 'СОХРАНИТЬ НАСТРОЙКИ'}
      </button>
    </>
  );
}
