import { createHash } from 'crypto';
import { config } from './config.js';

const SECRET_PATTERNS = [
  /password["\s]*[:=]["\s]*([^"\s,}]+)/gi,
  /secret["\s]*[:=]["\s]*([^"\s,}]+)/gi,
  /token["\s]*[:=]["\s]*([^"\s,}]+)/gi,
  /api[_-]?key["\s]*[:=]["\s]*([^"\s,}]+)/gi,
  /auth["\s]*[:=]["\s]*([^"\s,}]+)/gi,
];

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function verifyApiKey(providedKey: string): boolean {
  const hash = hashApiKey(providedKey);
  return hash === config.apiKeyHash;
}

export function redactSecrets(text: string): string {
  let redacted = text;
  
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, (match, capture) => {
      return match.replace(capture, '***REDACTED***');
    });
  }
  
  return redacted;
}

export function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('password') || 
        lowerKey.includes('secret') || 
        lowerKey.includes('token') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('auth')) {
      result[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = redactObject(value as Record<string, unknown>);
    } else if (typeof value === 'string') {
      result[key] = redactSecrets(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

export function validatePath(requestedPath: string, appName: string): boolean {
  const normalizedPath = requestedPath.replace(/\\/g, '/').replace(/\/+/g, '/');
  const allowedPrefix = `${config.appsRoot}/${appName}/`.replace(/\/+/g, '/');
  const fullPath = normalizedPath.startsWith('/') 
    ? normalizedPath 
    : `${allowedPrefix}${normalizedPath}`;
  
  if (fullPath.includes('..')) {
    return false;
  }
  
  return fullPath.startsWith(allowedPrefix);
}

export function sanitizeAppName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '');
}