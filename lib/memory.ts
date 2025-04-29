import fs from 'fs';
import path from 'path';

export interface MemoryEntry {
  timestamp: string;
  type: 'suggest' | 'edit';
  payload: any;
}

const memoryFile = path.resolve(process.cwd(), 'memory.json');

function loadAll(): MemoryEntry[] {
  if (!fs.existsSync(memoryFile)) return [];
  try {
    const raw = fs.readFileSync(memoryFile, 'utf-8');
    return JSON.parse(raw) as MemoryEntry[];
  } catch {
    return [];
  }
}

export function loadHistory(limit?: number): MemoryEntry[] {
  const all = loadAll();
  if (limit && all.length > limit) {
    return all.slice(-limit);
  }
  return all;
}

export function appendInteraction(type: 'suggest' | 'edit', payload: any): void {
  const all = loadAll();
  all.push({ timestamp: new Date().toISOString(), type, payload });
  fs.writeFileSync(memoryFile, JSON.stringify(all, null, 2), 'utf-8');
}

export function clearHistory(): void {
  fs.writeFileSync(memoryFile, JSON.stringify([], null, 2), 'utf-8');
} 