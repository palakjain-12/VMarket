/**
 * Global application configuration
 * All numeric env vars are given string fallbacks **before** parseInt,
 * so TypeScript no longer sees a possible `undefined`.
 */
export default () => ({
  /** Server */
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  /** Database */
  database: {
    url: process.env.DATABASE_URL ?? '', // empty string = “unset” sentinel
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS ?? '10', 10),
    minConnections: parseInt(process.env.DB_MIN_CONNECTIONS ?? '2', 10),
  },

  /** JWT */
  jwt: {
    secret: process.env.JWT_SECRET ?? 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  /** CORS */
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },

  /** Rate‑limiting */
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },
});
