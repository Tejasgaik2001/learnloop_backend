/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('revisions', function(table) {
    table.integer('revision_day'); // 1, 4, or 7
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('revisions', function(table) {
    table.dropColumn('revision_day');
  });
};
