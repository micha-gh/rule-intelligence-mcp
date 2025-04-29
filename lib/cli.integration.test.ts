import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('CLI integration', () => {
  const cli = 'ts-node';
  const entry = path.resolve(__dirname, '../index.ts');
  const rulebasePath = path.resolve(__dirname, '../rulebase-sample.json');
  const memoryPath = path.resolve(__dirname, '../memory.json');

  beforeEach(() => {
    if (fs.existsSync(memoryPath)) fs.unlinkSync(memoryPath);
  });

  it('analyzes rulebase and outputs JSON', () => {
    const result = spawnSync(cli, [entry, 'analyze', '-r', rulebasePath, '-f', 'json'], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.totalRules).toBeGreaterThan(0);
    expect(Array.isArray(out.missingCategories)).toBe(true);
  });

  it('validates rulebase successfully', () => {
    const result = spawnSync(cli, [entry, 'validate', '-r', rulebasePath], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/valid/i);
  });

  it('edits a rule and logs to memory', () => {
    const result = spawnSync(cli, [entry, 'edit', 'rule-1', '--title', 'New Title', '-r', rulebasePath], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/updated/i);
    // Check memory
    const mem = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
    expect(mem.some((m: any) => m.type === 'edit')).toBe(true);
  });

  it('memory:list shows edit interaction', () => {
    // First, edit
    spawnSync(cli, [entry, 'edit', 'rule-1', '--title', 'Another Title', '-r', rulebasePath], { encoding: 'utf-8' });
    // Then, list
    const result = spawnSync(cli, [entry, 'memory:list'], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/edit/);
  });

  it('memory:clear empties the memory bank', () => {
    // Add something
    spawnSync(cli, [entry, 'edit', 'rule-1', '--title', 'Clear Test', '-r', rulebasePath], { encoding: 'utf-8' });
    // Clear
    const result = spawnSync(cli, [entry, 'memory:clear'], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/cleared/i);
    // Should be empty
    const mem = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
    expect(mem.length).toBe(0);
  });

  it('suggest returns suggestions and logs to memory (if OPENAI_API_KEY set)', () => {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Skipping suggest integration test: no OPENAI_API_KEY set');
      return;
    }
    const result = spawnSync(cli, [entry, 'suggest', '-r', rulebasePath], { encoding: 'utf-8', env: process.env, timeout: 20000 });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/\[/); // Should output a JSON array or similar
    // Check memory
    const mem = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
    expect(mem.some((m: any) => m.type === 'suggest')).toBe(true);
  });

  it('analyze filters by status', () => {
    const result = spawnSync(cli, [entry, 'analyze', '-r', rulebasePath, '--status', 'active', '-f', 'json'], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.totalRules).toBeGreaterThan(0);
    // All rules should have status active
    const rb = require(rulebasePath);
    const filtered = rb.filter((r: any) => r.status === 'active');
    expect(out.totalRules).toBe(filtered.length);
  });

  it('analyze filters by tag', () => {
    const result = spawnSync(cli, [entry, 'analyze', '-r', rulebasePath, '--tag', 'php', '-f', 'json'], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    const out = JSON.parse(result.stdout);
    // All rules should have tag php
    const rb = require(rulebasePath);
    const filtered = rb.filter((r: any) => Array.isArray(r.tags) && r.tags.includes('php'));
    expect(out.totalRules).toBe(filtered.length);
  });

  it('analyze filters by tag and status', () => {
    const result = spawnSync(cli, [entry, 'analyze', '-r', rulebasePath, '--tag', 'php,style', '--status', 'active', '-f', 'json'], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    const out = JSON.parse(result.stdout);
    // All rules should have status active and at least one of the tags
    const rb = require(rulebasePath);
    const tags = ['php', 'style'];
    const filtered = rb.filter((r: any) => r.status === 'active' && Array.isArray(r.tags) && tags.some(tag => r.tags.includes(tag)));
    expect(out.totalRules).toBe(filtered.length);
  });
}); 