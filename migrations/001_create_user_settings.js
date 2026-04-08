/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if table exists first
  const exists = await knex.schema.hasTable('user_settings');
  if (exists) {
    console.log('Table user_settings already exists, skipping creation');
    return;
  }
  
  return knex.schema.createTable('user_settings', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.specificType('revision_schedule', 'INTEGER[]').notNullable().defaultTo('{1, 4, 7, 14, 30, 60, 90}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique('user_id');
    table.index('user_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_settings');
};
