const db     = require('../db/knex');
const bcrypt = require('bcryptjs');

// The carwash whose slug backs the no-subdomain fallback in resolveTenant.
// Deactivating it would 404 every fallback request (incl. login on localhost/apex).
const DEFAULT_SLUG = process.env.DEFAULT_CARWASH_SLUG || 'formacar';

// Public-safe-ish carwash view for the platform owner (who legitimately sees all).
function publicCarwash(c) {
  return {
    id: c.id, slug: c.slug, name: c.name,
    primary_color: c.primary_color, accent_color: c.accent_color,
    checklist_enabled: !!c.checklist_enabled, is_active: !!c.is_active,
    is_default: c.slug === DEFAULT_SLUG, // can't be deactivated (login fallback)
    created_at: c.created_at,
  };
}

/**
 * Clone a carwash's whole catalog to a freshly created carwash so it's usable
 * immediately. Runs inside the caller's transaction. Remaps foreign keys
 * (service_pricing references services + car_types) to the new rows.
 */
async function cloneCatalog(trx, fromId, toId) {
  const reinsert = async (table, row, overrides = {}) => {
    const { id, created_at, updated_at, ...rest } = row;
    const [r] = await trx(table).insert({ ...rest, ...overrides, carwash_id: toId }).returning('id');
    return r?.id ?? r;
  };

  const carTypeMap = {};
  for (const ct of await trx('car_types').where({ carwash_id: fromId })) {
    carTypeMap[ct.id] = await reinsert('car_types', ct);
  }

  const serviceMap = {};
  for (const s of await trx('services').where({ carwash_id: fromId })) {
    serviceMap[s.id] = await reinsert('services', s);
  }

  for (const p of await trx('service_pricing').where({ carwash_id: fromId })) {
    if (!serviceMap[p.service_id] || !carTypeMap[p.car_type_id]) continue;
    await reinsert('service_pricing', p, {
      service_id: serviceMap[p.service_id],
      car_type_id: carTypeMap[p.car_type_id],
    });
  }

  for (const e of await trx('additional_services').where({ carwash_id: fromId })) {
    await reinsert('additional_services', e);
  }
  for (const sl of await trx('time_slots').where({ carwash_id: fromId })) {
    await reinsert('time_slots', sl);
  }
  for (const it of await trx('checklist_items').where({ carwash_id: fromId })) {
    await reinsert('checklist_items', it);
  }
}

// GET /api/admin/carwashes — all carwashes with light stats
exports.listCarwashes = async (req, res, next) => {
  try {
    const carwashes = await db('carwashes').orderBy('id');
    const result = await Promise.all(carwashes.map(async (c) => {
      const [{ cnt: orders }] = await db('orders').where({ carwash_id: c.id }).count('id as cnt');
      const [{ cnt: admins }] = await db('users').where({ carwash_id: c.id }).count('id as cnt');
      return { ...publicCarwash(c), order_count: Number(orders), admin_count: Number(admins) };
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/carwashes — create a carwash + its first admin, clone a catalog
exports.createCarwash = async (req, res, next) => {
  try {
    const {
      slug, name, admin_login, admin_password,
      primary_color, accent_color, template_carwash_id,
    } = req.body;

    if (!slug || !name || !admin_login || !admin_password) {
      return res.status(400).json({ error: 'slug, name, admin_login и admin_password обязательны' });
    }
    const cleanSlug = String(slug).trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return res.status(400).json({ error: 'slug: только латиница, цифры и дефис' });
    }
    if (await db('carwashes').where({ slug: cleanSlug }).first()) {
      return res.status(409).json({ error: 'Мойка с таким slug уже существует' });
    }

    const fromId = template_carwash_id || 1; // clone the catalog from this carwash

    const created = await db.transaction(async (trx) => {
      const [cwRow] = await trx('carwashes').insert({
        slug: cleanSlug,
        name,
        primary_color: primary_color || '#e60000',
        accent_color: accent_color || '#bf0000',
        checklist_enabled: true,
        is_active: true,
      }).returning('id');
      const carwashId = cwRow?.id ?? cwRow;

      await cloneCatalog(trx, fromId, carwashId);

      await trx('users').insert({
        login: String(admin_login).trim(),
        password_hash: await bcrypt.hash(admin_password, 10),
        role: 'carwash_admin',
        carwash_id: carwashId,
      });

      return trx('carwashes').where({ id: carwashId }).first();
    });

    res.status(201).json(publicCarwash(created));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/carwashes/:id — activate/deactivate or tweak top-level fields
exports.updateCarwash = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ALLOWED = ['name', 'is_active', 'primary_color', 'accent_color', 'checklist_enabled'];
    const upd = {};
    for (const f of ALLOWED) if (req.body[f] !== undefined) upd[f] = req.body[f];
    if (Object.keys(upd).length === 0) {
      return res.status(400).json({ error: 'Нет полей для обновления' });
    }

    const carwash = await db('carwashes').where({ id }).first();
    if (!carwash) return res.status(404).json({ error: 'Мойка не найдена' });

    // Guard: never deactivate the default carwash — it backs the login fallback.
    if ('is_active' in upd && !upd.is_active && carwash.slug === DEFAULT_SLUG) {
      return res.status(400).json({ error: 'Нельзя выключить мойку по умолчанию — на неё завязан вход без поддомена' });
    }

    upd.updated_at = new Date().toISOString();

    const changed = await db('carwashes').where({ id }).update(upd);
    if (!changed) return res.status(404).json({ error: 'Мойка не найдена' });

    const c = await db('carwashes').where({ id }).first();
    res.json(publicCarwash(c));
  } catch (err) {
    next(err);
  }
};
