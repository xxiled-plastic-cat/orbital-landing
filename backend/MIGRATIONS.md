# Database Migrations Guide

This backend uses a custom migration system built on Sequelize to manage database schema changes.

## Migration Commands

### Run all pending migrations
```bash
npm run migrate:up
```

### Rollback the last migration
```bash
npm run migrate:down
```

### Check migration status
```bash
npm run migrate:status
```

## Migration Files

Migrations are stored in `src/migrations/` and follow this naming convention:
```
YYYYMMDDHHMMSS-description.js
```

Example: `20241023000001-create-markets.js`

## Current Migrations

1. **20241023000001-create-markets.js**
   - Creates the `markets` table
   - Adds indexes for marketId, assetId, and isActive

2. **20241023000002-create-loan-records.js**
   - Creates the `loan_records` table
   - Adds indexes for loanId, borrower, marketId, status, healthFactor, and borrowedAt

3. **20241023000003-create-deposit-records.js**
   - Creates the `deposit_records` table
   - Adds indexes for depositId, depositor, marketId, status, and depositedAt

4. **20241023000004-create-user-stats.js**
   - Creates the `user_stats` table
   - Adds indexes for address and lastActivityAt

## Migration Tracking

The system automatically creates a `sequelize_meta` table to track which migrations have been executed. This ensures migrations are only run once.

## Creating a New Migration

1. Create a new file in `src/migrations/` with the timestamp format:
```bash
# Example: Add a new column to markets
touch src/migrations/20241023120000-add-tvl-to-markets.js
```

2. Use this template:
```javascript
export const up = async (queryInterface, Sequelize) => {
  // Add your schema changes here
  await queryInterface.addColumn('markets', 'tvl', {
    type: Sequelize.DECIMAL(30, 6),
    defaultValue: 0
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Revert your schema changes here
  await queryInterface.removeColumn('markets', 'tvl');
};
```

3. Run the migration:
```bash
npm run migrate:up
```

## Migration Best Practices

1. **Always include both `up` and `down` functions** - This allows rolling back changes if needed

2. **Use transactions** - The migration runner automatically wraps each migration in a transaction

3. **Test rollbacks** - Always test that your `down` function properly reverts changes

4. **Keep migrations small** - Each migration should focus on a single change

5. **Never modify existing migrations** - Once a migration has been run in production, create a new migration to make changes

6. **Use timestamps** - The YYYYMMDDHHMMSS format ensures migrations run in order

## Common Migration Operations

### Add a column
```javascript
await queryInterface.addColumn('table_name', 'column_name', {
  type: Sequelize.STRING,
  allowNull: true
});
```

### Remove a column
```javascript
await queryInterface.removeColumn('table_name', 'column_name');
```

### Add an index
```javascript
await queryInterface.addIndex('table_name', ['column_name'], {
  name: 'table_name_column_name_idx'
});
```

### Remove an index
```javascript
await queryInterface.removeIndex('table_name', 'table_name_column_name_idx');
```

### Change column type
```javascript
await queryInterface.changeColumn('table_name', 'column_name', {
  type: Sequelize.INTEGER
});
```

### Rename a column
```javascript
await queryInterface.renameColumn('table_name', 'old_name', 'new_name');
```

### Raw SQL queries
```javascript
await queryInterface.sequelize.query('CREATE INDEX CONCURRENTLY ...');
```

## First Time Setup

When setting up a new environment:

1. Ensure your `.env` file has the correct `DATABASE_URL`
2. Run migrations:
```bash
npm run migrate:up
```

3. Verify the status:
```bash
npm run migrate:status
```

## Troubleshooting

### Migration fails partway through
The migration runner uses transactions, so partial changes will be rolled back automatically. Fix the migration file and run again.

### Need to reset the database
```bash
# Rollback all migrations one by one
npm run migrate:down  # repeat until all are rolled back

# Or manually drop all tables and run migrations again
npm run migrate:up
```

### Check what's been executed
```bash
npm run migrate:status
```

This will show which migrations have been executed and which are pending.

