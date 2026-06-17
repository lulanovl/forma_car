const bcrypt = require('bcryptjs');

/**
 * Phase 0 seed: the existing FormaCar data becomes carwash #1, plus the first
 * platform owner and the carwash #1 admin.
 *
 * Unlike the other seeds, this one is INSERT-IF-MISSING (no .del()): these rows
 * are credentials/tenant identity and must survive redeploys without being
 * clobbered. Passwords come from env (with a dev fallback) and are bcrypt-hashed.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // ── Carwash #1 = the existing single-tenant FormaCar ──
  const existing = await knex('carwashes').where({ id: 1 }).first();
  if (!existing) {
    await knex('carwashes').insert({
      id: 1,
      slug: 'formacar',
      name: 'FormaCar',
      primary_color: '#e60000',
      accent_color: '#bf0000',
      hero_title: 'FormaCar',
      hero_subtitle: 'Премиальная мойка и детейлинг',
      checklist_enabled: true,
      is_active: true,
    });
  }

  // ── Users ──
  const cost = 10;
  const fallback = process.env.ADMIN_PASSWORD || 'admin123';

  const desiredUsers = [
    {
      id: 1,
      login: process.env.PLATFORM_OWNER_LOGIN || 'owner',
      password: process.env.PLATFORM_OWNER_PASSWORD || fallback,
      role: 'platform_owner',
      carwash_id: null,
    },
    {
      id: 2,
      login: process.env.CARWASH1_ADMIN_LOGIN || 'formacar',
      password: process.env.CARWASH1_ADMIN_PASSWORD || fallback,
      role: 'carwash_admin',
      carwash_id: 1,
    },
  ];

  for (const u of desiredUsers) {
    const found = await knex('users').where({ id: u.id }).first();
    if (found) continue; // never overwrite an existing account
    await knex('users').insert({
      id: u.id,
      login: u.login,
      password_hash: await bcrypt.hash(u.password, cost),
      role: u.role,
      carwash_id: u.carwash_id,
    });
  }
};
