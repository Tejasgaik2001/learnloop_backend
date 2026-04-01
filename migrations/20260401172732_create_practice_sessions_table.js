/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('practice_sessions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('topic_id').notNullable();
    table.uuid('user_id').notNullable();
    table.text('question').notNullable();
    table.text('answer').notNullable();
    table.string('result').notNullable(); // correct, partial, incorrect
    table.timestamp('completed_at').defaultTo(knex.fn.now());
    
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users');
    table.index('topic_id');
    table.index('user_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('practice_sessions');
};
