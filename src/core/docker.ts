import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DockerComposeOptions {
  cwd: string;
  env?: Record<string, string>;
}

export async function dockerComposeUp(options: DockerComposeOptions): Promise<string> {
  const { stdout } = await execAsync('docker compose up -d', {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
  });
  return stdout;
}

export async function dockerComposeDown(options: DockerComposeOptions): Promise<string> {
  const { stdout } = await execAsync('docker compose down', {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
  });
  return stdout;
}

export async function dockerComposeRestart(options: DockerComposeOptions): Promise<string> {
  const { stdout } = await execAsync('docker compose restart', {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
  });
  return stdout;
}

export async function dockerComposeLogs(options: DockerComposeOptions, tail: number = 100): Promise<string> {
  const { stdout } = await execAsync(`docker compose logs --tail=${tail}`, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
  });
  return stdout;
}

export async function dockerComposePs(options: DockerComposeOptions): Promise<string> {
  const { stdout } = await execAsync('docker compose ps --format json', {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
  });
  return stdout;
}

export async function isDockerRunning(appPath: string): Promise<boolean> {
  try {
    const output = await dockerComposePs({ cwd: appPath });
    const containers = output.trim() ? JSON.parse(`[${output.trim().split('\n').join(',')}]`) : [];
    return containers.some((c: { State: string }) => c.State === 'running');
  } catch {
    return false;
  }
}