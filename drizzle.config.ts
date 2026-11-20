import { defineConfig } from 'drizzle-kit';

// drizzle-kit no carga .env solo: se lee aquí (sin imprimir nada).
try { process.loadEnvFile('.env'); } catch { /* sin .env: se usa el entorno */ }

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE ?? '' },
});
