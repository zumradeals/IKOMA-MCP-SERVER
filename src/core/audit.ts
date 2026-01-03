import { appendFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { AuditEntry, Role } from './types.js';
import { config } from './config.js';
import { redactObject } from './security.js';

export async function initAuditLog(): Promise<void> {
  const dir = dirname(config.auditLog);
  await mkdir(dir, { recursive: true });
}

export async function logAudit(entry: Omit<AuditEntry, 'timestamp'>): Promise<void> {
  const fullEntry: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    arguments: redactObject(entry.arguments),
  };
  
  const line = JSON.stringify(fullEntry) + '\n';
  
  try {
    await appendFile(config.auditLog, line, 'utf-8');
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

export async function auditCapabilityCall(
  requestId: string,
  capability: string,
  role: Role,
  args: Record<string, unknown>,
  handler: () => Promise<unknown>
): Promise<unknown> {
  const startTime = Date.now();
  
  try {
    const result = await handler();
    
    await logAudit({
      requestId,
      capability,
      role,
      arguments: args,
      result: 'success',
      duration: Date.now() - startTime,
    });
    
    return result;
  } catch (error) {
    await logAudit({
      requestId,
      capability,
      role,
      arguments: args,
      result: 'error',
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });
    
    throw error;
  }
}