import fs from 'fs';
import path from 'path';

export interface Interaction {
  timestamp: string;
  type: 'suggest' | 'edit';
  payload: any;
}

function getMemoryFile(memoryPath?: string) {
  return path.resolve(process.cwd(), memoryPath || 'memory.json');
}

function ensureMemoryFile(memoryPath?: string) {
  const file = getMemoryFile(memoryPath);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf-8');
  }
}

export function appendInteraction(type: Interaction['type'], payload: any, memoryPath?: string): void {
  ensureMemoryFile(memoryPath);
  const file = getMemoryFile(memoryPath);
  const raw = fs.readFileSync(file, 'utf-8');
  let arr: Interaction[] = [];
  try { arr = JSON.parse(raw); } catch {}
  arr.push({ timestamp: new Date().toISOString(), type, payload });
  fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf-8');
}

export function loadHistory(limit?: number, memoryPath?: string): Interaction[] {
  ensureMemoryFile(memoryPath);
  const file = getMemoryFile(memoryPath);
  const raw = fs.readFileSync(file, 'utf-8');
  let arr: Interaction[] = [];
  try { arr = JSON.parse(raw); } catch {}
  if (limit && limit > 0) {
    return arr.slice(-limit);
  }
  return arr;
}

export function clearHistory(memoryPath?: string): void {
  const file = getMemoryFile(memoryPath);
  fs.writeFileSync(file, '[]', 'utf-8');
} 