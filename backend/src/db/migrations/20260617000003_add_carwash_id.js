/**
 * Multi-tenant Phase 1: attach every tenant-owned table to a carwash.
 *
 * carwash_id is added as a plain indexed integer with DEFAULT 1 (not a hard FK /
 * NOT NULL constraint) on purpose:
 *   - DEFAULT 1 backfills all existing rows to carwash #1 (the original FormaCar)
 *     and protects against NULLs if any code path forgets to set it.
 *   - Avoiding ALTER COLUMN ... NOT NULL and ADD FOREIGN KEY keeps this migration
 *     portable to SQLite (dev), which can't do those without a full table rebuild.
 *   - Presence is enforced in the application layer (controllers always set and
 *     filter by carwash_id).
 *
 * Also swaps the two GLOBAL unique constraints for per-carwash composites so two
 * carwashes can reuse the same order number / client phone.
 *
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  const tenantTables = [
    'services',
    'car_types',
    'service_pricing',
    'additional_services',
    'checklist_items',
    'time_slots',
    'staff',
    'orders',
    'clients',
  ];

  for (const t of tenantTables) {
    await knex.schema.alterTable(t, (table) => {
      table.integer('carwash_id').unsigned().notNullable().defaultTo(1);
      table.index('carwash_id', `${t}_carwash_id_idx`);
    });
    // Explicit backfill in case the engine didn't apply DEFAULT to existing rows.
    await knex(t).whereNull('carwash_id').update({ carwash_id: 1 });
  }

  // orders.order_number: global unique → unique per carwash
  await knex.schema.alterTable('orders', (table) => {
    table.dropUnique(['order_number']);
  });
  await knex.schema.alterTable('orders', (table) => {
    table.unique(['carwash_id', 'order_number'], 'orders_carwash_order_number_unique');
  });

  // clients.phone: global unique → unique per carwash
  await knex.schema.alterTable('clients', (table) => {
    table.dropUnique(['phone']);
  });
  await knex.schema.alterTable('clients', (table) => {
    table.unique(['carwash_id', 'phone'], 'clients_carwash_phone_unique');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropUnique(['carwash_id', 'order_number'], 'orders_carwash_order_number_unique');
    table.unique(['order_number']);
  });
  await knex.schema.alterTable('clients', (table) => {
    table.dropUnique(['carwash_id', 'phone'], 'clients_carwash_phone_unique');
    table.unique(['phone']);
  });

  const tenantTables = [
    'services',
    'car_types',
    'service_pricing',
    'additional_services',
    'checklist_items',
    'time_slots',
    'staff',
    'orders',
    'clients',
  ];
  for (const t of tenantTables) {
    await knex.schema.alterTable(t, (table) => {
      table.dropIndex('carwash_id', `${t}_carwash_id_idx`);
      table.dropColumn('carwash_id');
    });
  }
};
