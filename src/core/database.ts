import pg from 'pg';
import { config } from './config.js';
import { DatabaseInfo } from './types.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: 'postgres', // Connect to default DB for admin operations
      user: config.postgres.user,
      password: config.postgres.password,
    });
  }
  return pool;
}

export function getAppPool(appName: string): pg.Pool {
  return new Pool({
    host: config.postgres.host,
    port: config.postgres.port,
    database: appName,
    user: config.postgres.user,
    password: config.postgres.password,
  });
}

export async function createDatabase(appName: string): Promise<void> {
  const adminPool = getPool();
  
  // Check if database exists
  const checkResult = await adminPool.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [appName]
  );
  
  if (checkResult.rows.length > 0) {
    throw new Error(`Database ${appName} already exists`);
  }
  
  // Create database (cannot use parameterized query for DB name)
  const safeName = appName.replace(/[^a-zA-Z0-9_]/g, '');
  await adminPool.query(`CREATE DATABASE ${safeName}`);
}

export async function dropDatabase(appName: string): Promise<void> {
  const adminPool = getPool();
  
  // Terminate existing connections
  await adminPool.query(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
  `, [appName]);
  
  // Drop database
  const safeName = appName.replace(/[^a-zA-Z0-9_]/g, '');
  await adminPool.query(`DROP DATABASE IF EXISTS ${safeName}`);
}

export async function databaseExists(appName: string): Promise<boolean> {
  const adminPool = getPool();
  const result = await adminPool.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [appName]
  );
  return result.rows.length > 0;
}

export async function getDatabaseInfo(appName: string): Promise<DatabaseInfo> {
  const exists = await databaseExists(appName);
  
  if (!exists) {
    return {
      exists: false,
      name: appName,
    };
  }
  
  const appPool = getAppPool(appName);
  
  try {
    // Get database size
    const sizeResult = await appPool.query(`
      SELECT pg_size_pretty(pg_database_size($1)) as size
    `, [appName]);
    
    // Get table list
    const tablesResult = await appPool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    return {
      exists: true,
      name: appName,
      size: sizeResult.rows[0]?.size,
      tables: tablesResult.rows.map(r => r.tablename),
    };
  } finally {
    await appPool.end();
  }
}

export async function executeMigration(appName: string, sql: string): Promise<void> {
  const appPool = getAppPool(appName);
  
  try {
    await appPool.query(sql);
  } finally {
    await appPool.end();
  }
}

export async function executeSeed(appName: string, sql: string): Promise<void> {
  return executeMigration(appName, sql);
}

export async function createBackup(appName: string, backupName: string): Promise<string> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const backupPath = `/var/backups/ikoma/${backupName}`;
  
  await execAsync(`mkdir -p /var/backups/ikoma`);
  
  await execAsync(
    `pg_dump -h ${config.postgres.host} -p ${config.postgres.port} -U ${config.postgres.user} ${appName} > ${backupPath}`,
    {
      env: {
        ...process.env,
        PGPASSWORD: config.postgres.password,
      },
    }
  );
  
  return backupPath;
}