const { Client } = require('pg');
const { createDatabaseOptions } = require('../dist/database/database-options');

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('Add DATABASE_URL to backend/.env.deploy.local before running this check.');
    process.exitCode = 1;
    return;
  }
  let client;
  try {
    const options = createDatabaseOptions(process.env);
    client = new Client({
      connectionString: options.url,
      ssl: options.ssl,
      connectionTimeoutMillis: 15000,
    });
    await client.connect();
    await client.query('SELECT 1');
    console.log('Database connection verified over TLS. No tables or data were changed.');
  } catch (error) {
    const code = String(error?.code || 'unknown');
    const hints = {
      '28P01': 'Check the database password in your connection string.',
      ENOTFOUND: 'Copy the Session pooler URI directly from Supabase Connect.',
      ECONNREFUSED: 'Check the Session pooler hostname and port.',
      SELF_SIGNED_CERT_IN_CHAIN: 'Download the database CA certificate from Supabase and set DB_SSL_CA_FILE.',
      UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'Download the database CA certificate from Supabase and set DB_SSL_CA_FILE.',
    };
    // Never print a driver error object: it may contain connection credentials.
    console.error(`Database connection check failed (${code}). ${hints[code] || 'Check the saved connection settings and network access.'}`);
    process.exitCode = 1;
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

main();
