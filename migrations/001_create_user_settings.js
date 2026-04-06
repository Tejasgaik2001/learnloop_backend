const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'learnloop_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
});

const migrationSQL = `
-- User Settings Table for Custom Revision Schedules
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision_schedule INTEGER[] NOT NULL DEFAULT '{1, 4, 7, 14, 30, 60, 90}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add column to existing users (if not exists, will use defaults)
-- Note: Users will get default schedule on first settings fetch
`;

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🚀 Running migration: Create user_settings table...');
    
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Table "user_settings" created with:');
    console.log('   - Custom revision schedule array');
    console.log('   - Default: [1, 4, 7, 14, 30, 60, 90] days');
    console.log('   - Per-user settings');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
