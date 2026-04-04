/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Generate password hash for "password123"
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash('password123', 10);

  // Insert sample users
  await knex('users').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'John Developer',
      email: 'john@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Sarah Engineer',
      email: 'sarah@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Mike Coder',
      email: 'mike@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
