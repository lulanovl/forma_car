/**
 * Multi-tenant: a row per carwash. Holds branding + per-carwash config.
 * Every tenant-owned table will reference carwashes.id (added in a later migration).
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('carwashes', (table) => {
    table.increments('id').primary();
    table.string('slug').notNullable().unique(); // subdomain key: <slug>.formacar.app
    table.string('name').notNullable();

    // Branding (theme is brand-only: logo + colors + hero copy)
    table.text('logo_url');
    table.string('primary_color').defaultTo('#e60000');
    table.string('accent_color').defaultTo('#bf0000');
    table.string('hero_title');
    table.text('hero_subtitle');

    // Contacts
    table.string('phone');
    table.string('address');

    // Per-carwash Telegram notifications (replaces global env token)
    table.string('telegram_bot_token');
    table.string('telegram_chat_id');

    // Feature flags
    table.boolean('checklist_enabled').defaultTo(true);
    table.boolean('is_active').defaultTo(true);

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('carwashes');
};
