/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Add new fields to revisions table
    .alterTable('revisions', function(table) {
      table.integer('missed_count').defaultTo(0);
      table.string('revision_pattern').defaultTo('1-4-7-15-30');
      table.timestamp('completed_at');
      table.string('schedule_type').defaultTo('fixed'); // 'fixed' or 'shifted'
    })
    // Create revision_history table
    .createTable('revision_history', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('revision_id').notNullable();
      table.uuid('user_id').notNullable();
      table.integer('revision_day').notNullable(); // Day number in the pattern (1, 4, 7, etc.)
      table.timestamp('scheduled_date').notNullable();
      table.timestamp('completed_date');
      table.string('status').notNullable(); // 'completed', 'missed', 'pending'
      table.string('confidence'); // forgot, partial, strong
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('revision_id').references('id').inTable('revisions').onDelete('CASCADE');
      table.foreign('user_id').references('id').inTable('users');
      table.index('revision_id');
      table.index('user_id');
      table.index('scheduled_date');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('revisions', function(table) {
      table.dropColumn('missed_count');
      table.dropColumn('revision_pattern');
      table.dropColumn('completed_at');
      table.dropColumn('schedule_type');
    })
    .dropTable('revision_history');
};
