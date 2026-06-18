/**
 * Per-tenant editable images:
 *   - services.image_url       — photo shown on each service card
 *   - carwashes.hero_image_url — homepage hero background
 *
 * Both nullable. When null the frontend falls back to the bundled static
 * defaults (/services/{slug}.jpg, /hero.jpg), so existing sites are unchanged.
 * Plain text columns — portable to SQLite (dev) and Postgres (prod).
 *
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('services', (table) => {
    table.text('image_url');
  });
  await knex.schema.alterTable('carwashes', (table) => {
    table.text('hero_image_url');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('services', (table) => {
    table.dropColumn('image_url');
  });
  await knex.schema.alterTable('carwashes', (table) => {
    table.dropColumn('hero_image_url');
  });
};
