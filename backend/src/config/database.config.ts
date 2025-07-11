import { registerAs } from '@nestjs/config';

/**
 * Stand‑alone database config namespace.
 * Uses the same nullish‑coalescing pattern as the global config.
 */
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL ?? '',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS ?? '10', 10),
  minConnections: parseInt(process.env.DB_MIN_CONNECTIONS ?? '2', 10),
}));
