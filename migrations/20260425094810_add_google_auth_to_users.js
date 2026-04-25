/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('password_hash').nullable().alter();
    table.string('google_id').unique().nullable();
    table.string('auth_provider').defaultTo('local').notNullable();
    table.string('avatar_url').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('password_hash').notNullable().alter();
    table.dropColumn('google_id');
    table.dropColumn('auth_provider');
    table.dropColumn('avatar_url');
  });
};
