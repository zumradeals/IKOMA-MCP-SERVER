import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { nanoid } from 'nanoid';
import { CAPABILITIES, getCapability } from '../core/capabilities.js';
import { hasPermission } from '../core/roles.js';
import { auditCapabilityCall } from '../core/audit.js';
import type { Role, ExecutionContext } from '../core/types.js';

export async function startMCPServer(defaultRole: Role = 'operator'): Promise<void> {
  const server = new Server(
    {
      name: 'ikoma-mcp',
      version: '2.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: CAPABILITIES.map(cap => ({
        name: cap.name,
        description: cap.description,
        inputSchema: cap.schema,
      })),
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    const capability = getCapability(name);
    
    if (!capability) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Capability not found',
              capability: name,
            }),
          },
        ],
      };
    }
    
    // Check role permission
    if (!hasPermission(defaultRole, capability.requiredRole)) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Insufficient permissions',
              required: capability.requiredRole,
              current: defaultRole,
            }),
          },
        ],
      };
    }
    
    const requestId = nanoid();
    const context: ExecutionContext = {
      role: defaultRole,
      requestId,
      timestamp: new Date(),
    };
    
    try {
      const result = await auditCapabilityCall(
        requestId,
        name,
        defaultRole,
        args || {},
        () => capability.handler(args || {}, context)
      );
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
              capability: name,
            }),
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('IKOMA MCP Server started (stdio mode)');
  console.error(`Role: ${defaultRole}`);
  console.error(`Tools available: ${CAPABILITIES.length}`);
  console.error('Tool names:', CAPABILITIES.map(c => c.name).join(', '));
}