import { config as loadEnv } from 'dotenv';
import { Config } from './types.js';

loadEnv();

export function loadConfig(): Config {
  const serverMode = (process.env.SERVER_MODE || 'hybrid') as 'mcp' | 'http' | 'hybrid';
  
  return {
    serverMode,
    mcpEnabled: process.env.MCP_ENABLED === 'true',
    httpEnabled: process.env.HTTP_ENABLED === 'true',
    httpPort: parseInt(process.env.HTTP_PORT || '3000', 10),
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'ikoma',
      user: process.env.POSTGRES_USER || 'ikoma',
      password: process.env.POSTGRES_PASSWORD || '',
    },
    apiKeyHash: process.env.API_KEY_HASH || '',
    appsRoot: process.env.APPS_ROOT || '/srv/apps',
    auditLog: process.env.AUDIT_LOG || '/var/log/ikoma/audit.jsonl',
    dockerSocket: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
  };
}

export const config = loadConfig();