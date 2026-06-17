const { resetSequences, TENANT_TABLES } = require('../sequences');

/**
 * Runs last in a full `npm run seed`. After the catalog seeds insert rows with
 * explicit ids, realign every Postgres sequence so the app's next INSERT (e.g.
 * creating a service, or cloning a catalog for a new carwash) doesn't hit a
 * duplicate-key error. No-op on SQLite.
 *
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await resetSequences(knex, TENANT_TABLES);
};
