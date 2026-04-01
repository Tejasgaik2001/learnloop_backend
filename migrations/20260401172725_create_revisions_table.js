/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('revisions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('topic_id').notNullable();
    table.uuid('user_id').notNullable();
    table.timestamp('due_date').notNullable();
    table.string('confidence'); // forgot, partial, strong
    table.timestamp('next_due_date');
    table.string('status').defaultTo('pending'); // pending, completed, missed
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users');
    table.index('topic_id');
    table.index('due_date');
    table.index(['user_id', 'due_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('revisions');
};
