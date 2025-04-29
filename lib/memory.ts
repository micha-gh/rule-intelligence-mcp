import fs from 'fs';
import path from 'path';

export interface Interaction {
  timestamp: string;
  type: 'suggest' | 'edit';
  payload: any;
}

const memoryFile = path.resolve(process.cwd(), 'memory.json');

function ensureMemoryFile() {
  if (!fs.existsSync(memoryFile)) {
    fs.writeFileSync(memoryFile, '[]', 'utf-8');
  }
}

export function appendInteraction(type: Interaction['type'], payload: any): void {
  ensureMemoryFile();
  const raw = fs.readFileSync(memoryFile, 'utf-8');
  let arr: Interaction[] = [];
  try { arr = JSON.parse(raw); } catch {}
  arr.push({ timestamp: new Date().toISOString(), type, payload });
  fs.writeFileSync(memoryFile, JSON.stringify(arr, null, 2), 'utf-8');
}

export function loadHistory(limit?: number): Interaction[] {
  ensureMemoryFile();
  const raw = fs.readFileSync(memoryFile, 'utf-8');
  let arr: Interaction[] = [];
  try { arr = JSON.parse(raw); } catch {}
  if (limit && limit > 0) {
    return arr.slice(-limit);
  }
  return arr;
}

export function clearHistory(): void {
  fs.writeFileSync(memoryFile, '[]', 'utf-8');
} 