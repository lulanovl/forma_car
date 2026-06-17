// Postgres doesn't advance a serial sequence when a row is inserted with an
// explicit id (as the seeds do for stable FK references). The next auto-insert
// then reuses an id and fails with a duplicate-key error. These helpers realign
// the sequences to MAX(id). No-op on SQLite (dev), which has no sequences.

async function resetSequence(knex, table, column = 'id') {
  if (knex.client.config.client !== 'pg') return;
  await knex.raw(
    'SELECT setval(pg_get_serial_sequence(?, ?), (SELECT COALESCE(MAX(??), 1) FROM ??))',
    [table, column, column, table]
  );
}

async function resetSequences(knex, tables) {
  for (const t of tables) await resetSequence(knex, t);
}

// Tenant-owned tables with serial PKs that seeds populate / the app inserts into.
const TENANT_TABLES = [
  'carwashes', 'users',
  'services', 'staff', 'time_slots', 'checklist_items',
  'car_types', 'service_pricing', 'additional_services',
  'orders', 'clients', 'order_checklist',
];

module.exports = { resetSequence, resetSequences, TENANT_TABLES };
