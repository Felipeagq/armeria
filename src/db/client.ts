// Conexión a PostgreSQL (variable DATABASE). Solo servidor: no importar desde componentes de cliente.
// La conexión se crea al primer uso (no al importar) para que `next build` no falle si falta DATABASE, y se reutiliza
// entre recargas en desarrollo.
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Db = PostgresJsDatabase<typeof schema>;
const g = globalThis as unknown as { __armeriaDb?: { sql: ReturnType<typeof postgres>; db: Db } };

export function getDb(): Db {
  if (g.__armeriaDb) return g.__armeriaDb.db;
  const url = process.env.DATABASE;
  if (!url) throw new Error('Falta la variable de entorno DATABASE (URL de PostgreSQL).');
  // prepare:false: compatible con los pools de conexiones (Neon pooler / pgbouncer)
  const sql = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 15, prepare: false, ssl: 'prefer' });
  const db = drizzle(sql, { schema });
  g.__armeriaDb = { sql, db };
  return db;
}

/** Cierra la conexión (scripts de línea de comandos). */
export async function cerrarDb() {
  if (g.__armeriaDb) { await g.__armeriaDb.sql.end({ timeout: 5 }); g.__armeriaDb = undefined; }
}

export * from './schema';
