/**
 * Per-tenant Instagram link, editable from the CRM. Nullable; the footer hides
 * the Instagram contact when it's empty. (WhatsApp needs no column — it's derived
 * from the phone number as a wa.me link.)
 *
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('carwashes', (table) => {
    table.text('instagram_url');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('carwashes', (table) => {
    table.dropColumn('instagram_url');
  });
};
