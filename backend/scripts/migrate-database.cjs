const { DataSource } = require('typeorm');
const { createDatabaseOptions } = require('../dist/database/database-options');

async function main() {
  let source;
  try {
    if (!process.env.DATABASE_URL?.trim()) throw Object.assign(new Error(), { code: 'MISSING_DATABASE_URL' });
    const options = createDatabaseOptions(process.env);
    // The initial migration is deliberately scoped to the app's private schema.
    if (options.schema !== 'echowave') throw Object.assign(new Error(), { code: 'UNEXPECTED_SCHEMA' });
    source = new DataSource({ ...options, synchronize: false });
    await source.initialize();
    const existing = await source.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['echowave']);
    if (existing.length && !existing.some(row => row.tablename === 'migrations')) {
      throw Object.assign(new Error(), { code: 'EXISTING_UNMANAGED_TABLES' });
    }
    await source.query('CREATE SCHEMA IF NOT EXISTS "echowave"');
    await source.query('REVOKE ALL ON SCHEMA "echowave" FROM PUBLIC');
    const applied = await source.runMigrations({ transaction: 'all' });
    const drift = await source.driver.createSchemaBuilder().log();
    if (drift.upQueries.length) throw Object.assign(new Error(), { code: 'SCHEMA_NEEDS_REVIEW' });
    const counts = await source.query(
      'SELECT count(*)::int AS tables, count(*) FILTER (WHERE rowsecurity)::int AS protected_tables FROM pg_tables WHERE schemaname = $1 AND tablename <> $2',
      ['echowave', 'migrations'],
    );
    console.log(JSON.stringify({
      migrationsApplied: applied.map(migration => migration.name),
      appTables: counts[0].tables,
      tablesWithRowSecurity: counts[0].protected_tables,
      schemaMatchesEntities: true,
    }));
  } catch (error) {
    // Do not serialize driver errors or options: these can contain credentials.
    const code = error?.driverError?.code || error?.code || 'UNKNOWN';
    console.error(`Database initialization failed (${code}). Review the app schema and migration configuration.`);
    process.exitCode = 1;
  } finally {
    if (source?.isInitialized) await source.destroy();
  }
}

main();
