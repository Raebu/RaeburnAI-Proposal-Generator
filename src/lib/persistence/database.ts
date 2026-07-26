import { Pool, type PoolClient, type QueryResultRow } from 'pg';

let pool: Pool | undefined;

export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('database_not_configured');
  pool = new Pool({
    connectionString,
    max: Math.max(1, Math.min(Number(process.env.DATABASE_POOL_MAX ?? 10), 50)),
    connectionTimeoutMillis: Math.max(1000, Math.min(Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 5000), 30_000)),
    idleTimeoutMillis: 30_000,
    statement_timeout: Math.max(1000, Math.min(Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS ?? 10_000), 120_000)),
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });
  pool.on('error', () => {
    // The hosting platform should collect process-level errors without logging connection strings.
  });
  return pool;
}

export async function withTransaction<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function queryOne<T extends QueryResultRow>(text: string, values: unknown[]): Promise<T | null> {
  const result = await getPool().query<T>(text, values);
  return result.rows[0] ?? null;
}

export async function databaseReady(): Promise<boolean> {
  try {
    await getPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
