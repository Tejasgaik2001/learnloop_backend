/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('topics', function(table) {
    table.string('source_url');
    table.string('problem_type');
    table.text('key_concept');
    table.text('expected_output');
    table.text('mistake');
    table.string('difficulty');
    table.string('revision_pattern');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('topics', function(table) {
    table.dropColumn('source_url');
    table.dropColumn('problem_type');
    table.dropColumn('key_concept');
    table.dropColumn('expected_output');
    table.dropColumn('mistake');
    table.dropColumn('difficulty');
    table.dropColumn('revision_pattern');
  });
};
