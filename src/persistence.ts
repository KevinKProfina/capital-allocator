import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureFile(filePath: string, initialValue: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(initialValue, null, 2), 'utf8');
  }
}

export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, fallback);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}
