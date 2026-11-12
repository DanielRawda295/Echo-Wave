import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export function createDatabaseOptions(
  env: NodeJS.ProcessEnv,
): PostgresConnectionOptions {
  const remoteUrl = env.DATABASE_URL?.trim();
  const production = env.NODE_ENV === 'production';
  const schema = env.DB_SCHEMA || (remoteUrl ? 'echowave' : 'public');
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
    throw new Error('DB_SCHEMA must be a lowercase PostgreSQL schema name.');
  }

  let connection: Partial<PostgresConnectionOptions>;
  if (remoteUrl) {
    let parsed: URL;
    try {
      parsed = new URL(remoteUrl);
    } catch {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection string.');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname) {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection string.');
    }
    if (decodeURIComponent(parsed.password) === '[YOUR-PASSWORD]') {
      if (!env.DB_PASS) {
        throw new Error('Set DB_PASS when DATABASE_URL contains the Supabase password placeholder.');
      }
      parsed.password = encodeURIComponent(env.DB_PASS);
    }

    // Keep TLS policy here: URL options must not disable certificate validation
    // or replace an explicitly configured provider CA certificate.
    for (const key of ['ssl', 'sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat']) {
      parsed.searchParams.delete(key);
    }
    const ca = env.DB_SSL_CA_FILE
      ? readFileSync(env.DB_SSL_CA_FILE, 'utf8')
      : env.DB_SSL_CA?.replace(/\\n/g, '\n');
    connection = {
      url: parsed.toString(),
      ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
    };
  } else {
    if (production) {
      throw new Error('Set DATABASE_URL before starting the production API.');
    }
    connection = {
      host: env.DB_HOST || 'localhost',
      port: Number(env.DB_PORT) || 5432,
      username: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
    };
  }

  return {
    type: 'postgres',
    ...connection,
    schema,
    entities: [join(__dirname, '../modules/**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: !production && !remoteUrl && env.DB_SYNCHRONIZE !== 'false',
    migrationsRun: false,
    logging: false,
    extra: { max: 5, connectionTimeoutMillis: 15000 },
  };
}
