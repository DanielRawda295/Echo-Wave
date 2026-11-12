import { createDatabaseOptions } from './database-options';

describe('database deployment configuration', () => {
  it('retains the local database and automatic schema setup for development', () => {
    const options = createDatabaseOptions({ DB_NAME: 'development' });
    expect(options.database).toBe('development');
    expect(options.schema).toBe('public');
    expect(options.synchronize).toBe(true);
  });

  it('never synchronizes a hosted database, even outside production', () => {
    const options = createDatabaseOptions({ DATABASE_URL: 'postgresql://user:password@example.com:5432/postgres' });
    expect(options.synchronize).toBe(false);
    expect(options.schema).toBe('echowave');
    expect(options.ssl).toEqual({ rejectUnauthorized: true });
  });

  it('does not allow connection-string options to weaken TLS', () => {
    const options = createDatabaseOptions({
      DATABASE_URL: 'postgresql://user:password@example.com/postgres?sslmode=disable&ssl=0',
      DB_SSL_CA: 'certificate\\nnext-line',
    });
    expect(options.url).not.toContain('sslmode');
    expect(options.url).not.toContain('ssl=');
    expect(options.ssl).toEqual({ rejectUnauthorized: true, ca: 'certificate\nnext-line' });
  });

  it('requires an explicit hosted URL in production', () => {
    expect(() => createDatabaseOptions({ NODE_ENV: 'production' })).toThrow('Set DATABASE_URL');
  });

  it('encodes a separately saved password without changing its value', () => {
    const password = 'example@pass#word:%20/?';
    const options = createDatabaseOptions({
      DATABASE_URL: 'postgresql://postgres.project:[YOUR-PASSWORD]@example.com:5432/postgres',
      DB_PASS: password,
    });
    expect(decodeURIComponent(new URL(options.url!).password)).toBe(password);
    expect(() => createDatabaseOptions({ DATABASE_URL: 'postgresql://user:[YOUR-PASSWORD]@example.com/postgres' }))
      .toThrow('Set DB_PASS');
  });

  it('rejects malformed configuration without echoing private connection values', () => {
    expect(() => createDatabaseOptions({ DATABASE_URL: 'private-invalid-value' })).toThrow('DATABASE_URL must be a valid PostgreSQL connection string.');
    expect(() => createDatabaseOptions({ DB_SCHEMA: 'bad;schema' })).toThrow('DB_SCHEMA must be');
  });
});
