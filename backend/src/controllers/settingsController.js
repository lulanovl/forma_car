const db = require('../db/knex');

// Fields a carwash admin may read/edit for their own carwash.
const EDITABLE = [
  'name',
  'logo_url',
  'primary_color',
  'accent_color',
  'hero_title',
  'hero_subtitle',
  'hero_image_url',
  'phone',
  'address',
  'instagram_url',
  'telegram_bot_token',
  'telegram_chat_id',
  'checklist_enabled',
];

// GET /api/settings — the current carwash's full editable settings (admin only)
exports.getSettings = async (req, res, next) => {
  try {
    const c = await db('carwashes').where({ id: req.carwashId }).first();
    if (!c) return res.status(404).json({ error: 'Автомойка не найдена' });

    const out = { id: c.id, slug: c.slug };
    for (const f of EDITABLE) out[f] = c[f];
    out.checklist_enabled = !!c.checklist_enabled;
    res.json(out);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings — update the current carwash's settings
exports.updateSettings = async (req, res, next) => {
  try {
    const upd = {};
    for (const f of EDITABLE) {
      if (req.body[f] !== undefined) upd[f] = req.body[f];
    }
    if (Object.keys(upd).length === 0) {
      return res.status(400).json({ error: 'Нет полей для обновления' });
    }
    upd.updated_at = new Date().toISOString();

    const changed = await db('carwashes').where({ id: req.carwashId }).update(upd);
    if (!changed) return res.status(404).json({ error: 'Автомойка не найдена' });

    const c = await db('carwashes').where({ id: req.carwashId }).first();
    const out = { id: c.id, slug: c.slug };
    for (const f of EDITABLE) out[f] = c[f];
    out.checklist_enabled = !!c.checklist_enabled;
    res.json(out);
  } catch (err) {
    next(err);
  }
};
