import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

// Create migrations tracking table
async function createMigrationsTable() {
  const [results] = await sequelize.query(`
    CREATE TABLE IF NOT EXISTS sequelize_meta (
      name VARCHAR(255) PRIMARY KEY
    );
  `);
  return results;
}

// Get executed migrations
async function getExecutedMigrations() {
  const [results] = await sequelize.query(
    'SELECT name FROM sequelize_meta ORDER BY name;'
  );
  return results.map(r => r.name);
}

// Record migration
async function recordMigration(name) {
  await sequelize.query(
    'INSERT INTO sequelize_meta (name) VALUES (?);',
    { replacements: [name] }
  );
}

// Remove migration record
async function removeMigration(name) {
  await sequelize.query(
    'DELETE FROM sequelize_meta WHERE name = ?;',
    { replacements: [name] }
  );
}

// Get pending migrations
async function getPendingMigrations() {
  const files = await readdir(__dirname);
  const migrationFiles = files
    .filter(f => f.match(/^\d{14}-.*\.js$/) && f !== 'runner.js' && f !== 'config.js')
    .sort();

  const executed = await getExecutedMigrations();
  return migrationFiles.filter(f => !executed.includes(f));
}

// Run migrations UP
async function migrateUp() {
  try {
    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    await createMigrationsTable();

    const pending = await getPendingMigrations();
    
    if (pending.length === 0) {
      console.log('✨ No pending migrations to run');
      return;
    }

    console.log(`📋 Found ${pending.length} pending migration(s):\n`);

    for (const file of pending) {
      console.log(`⏳ Running migration: ${file}`);
      
      const migration = await import(join(__dirname, file));
      
      const transaction = await sequelize.transaction();
      try {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        await recordMigration(file);
        await transaction.commit();
        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations DOWN
async function migrateDown() {
  try {
    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    await createMigrationsTable();

    const executed = await getExecutedMigrations();
    
    if (executed.length === 0) {
      console.log('✨ No migrations to rollback');
      return;
    }

    const lastMigration = executed[executed.length - 1];
    console.log(`⏳ Rolling back migration: ${lastMigration}`);

    const migration = await import(join(__dirname, lastMigration));
    
    const transaction = await sequelize.transaction();
    try {
      await migration.down(sequelize.getQueryInterface(), Sequelize);
      await removeMigration(lastMigration);
      await transaction.commit();
      console.log(`✅ Rolled back: ${lastMigration}\n`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    console.log('🎉 Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Show migration status
async function migrateStatus() {
  try {
    await sequelize.authenticate();
    await createMigrationsTable();

    const files = await readdir(__dirname);
    const migrationFiles = files
      .filter(f => f.match(/^\d{14}-.*\.js$/) && f !== 'runner.js' && f !== 'config.js')
      .sort();

    const executed = await getExecutedMigrations();

    console.log('\n📊 Migration Status:\n');
    console.log('─'.repeat(70));
    
    if (migrationFiles.length === 0) {
      console.log('No migrations found');
    } else {
      for (const file of migrationFiles) {
        const status = executed.includes(file) ? '✅ Executed' : '⏳ Pending';
        console.log(`${status}  ${file}`);
      }
    }
    
    console.log('─'.repeat(70));
    console.log(`\nTotal: ${migrationFiles.length} | Executed: ${executed.length} | Pending: ${migrationFiles.length - executed.length}\n`);
  } catch (error) {
    console.error('❌ Error checking status:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case 'up':
    migrateUp();
    break;
  case 'down':
    migrateDown();
    break;
  case 'status':
    migrateStatus();
    break;
  default:
    console.log(`
🗄️  Database Migration Tool

Usage:
  npm run migrate up      - Run all pending migrations
  npm run migrate down    - Rollback the last migration
  npm run migrate status  - Show migration status
    `);
    process.exit(0);
}

