/**
 * Real auth for multi-tenant. Replaces the single global ADMIN_PASSWORD.
 *   - role 'platform_owner'  → you; carwash_id is null; can manage all carwashes
 *   - role 'carwash_admin'   → a carwash owner; scoped to their carwash_id
 * Passwords are stored as bcrypt hashes (never plaintext).
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('login').notNullable();
    table.string('password_hash').notNullable();
    table.string('role').notNullable().defaultTo('carwash_admin'); // platform_owner | carwash_admin
    table
      .integer('carwash_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('carwashes')
      .onDelete('CASCADE');
    table.timestamps(true, true);

    // login is unique within a carwash (platform_owner has carwash_id = null)
    table.unique(['carwash_id', 'login']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
