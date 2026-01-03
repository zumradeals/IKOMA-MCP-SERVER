#!/usr/bin/env node

import { config } from './core/config.js';
import { initAuditLog } from './core/audit.js';
import { startMCPServer } from './mcp/server.js';
import { startHTTPServer } from './http/server.js';
import type { Role } from './core/types.js';

async function main() {
  // Initialize audit log
  await initAuditLog();
  
  const mode = process.argv[2] || config.serverMode;
  const role = (process.env.IKOMA_ROLE || 'operator') as Role;
  
  console.error(`Starting IKOMA MCP v2.0 in ${mode} mode`);
  
  switch (mode) {
    case 'mcp':
      if (!config.mcpEnabled) {
        console.error('MCP mode disabled in configuration');
        process.exit(1);
      }
      await startMCPServer(role);
      break;
      
    case 'http':
      if (!config.httpEnabled) {
        console.error('HTTP mode disabled in configuration');
        process.exit(1);
      }
      await startHTTPServer();
      break;
      
    case 'hybrid':
      if (config.mcpEnabled && config.httpEnabled) {
        // Start HTTP in background
        startHTTPServer().catch(err => {
          console.error('HTTP server error:', err);
        });
        
        // Start MCP in foreground (stdio)
        await startMCPServer(role);
      } else if (config.mcpEnabled) {
        await startMCPServer(role);
      } else if (config.httpEnabled) {
        await startHTTPServer();
      } else {
        console.error('No server mode enabled');
        process.exit(1);
      }
      break;
      
    default:
      console.error(`Unknown mode: ${mode}`);
      console.error('Usage: ikoma-mcp [mcp|http|hybrid]');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});