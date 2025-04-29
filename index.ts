#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';
import {
  loadRulebase,
  validateRulebase,
  findMissingCategories,
  findDuplicateTitles,
  findEmptyContents,
  getCategoryStats,
  formatMarkdown,
  AnalysisResult,
  formatCSV,
  formatHTML
} from './lib/analyze';
import { loadHistory, appendInteraction, clearHistory } from './lib/memory';

const argv = yargs(hideBin(process.argv))
  .scriptName('rule-intelligence-mcp')
  .usage('$0 <command> [options]')
  .option('rulebase', {
    alias: 'r',
    type: 'string',
    default: 'rulebase-sample.json',
    description: 'Path to the rulebase JSON file'
  })
  .option('schema', {
    alias: 's',
    type: 'string',
    default: 'rule-schema.json',
    description: 'Path to the JSON schema file'
  })
  .option('format', {
    alias: 'f',
    choices: ['json', 'md'] as const,
    default: 'json',
    description: 'Output format (json or md)'
  })
  .option('status', {
    type: 'string',
    description: 'Filter rules by status (e.g. active, deprecated)'
  })
  .option('tag', {
    type: 'string',
    description: 'Filter rules by tag (comma-separated for multiple)'
  })
  .option('format-in', {
    type: 'string',
    description: 'Input rulebase format (json, yaml, toml, md). Auto-detected by file extension.'
  })
  .option('output', {
    alias: 'o',
    choices: ['json', 'md', 'csv', 'html'] as const,
    default: 'json',
    description: 'Output format (json, md, csv, html)'
  })
  .option('plugin', {
    type: 'string',
    description: 'Path to a JS plugin file for custom analysis (exports a function)' 
  })
  .option('llm-provider', {
    type: 'string',
    description: 'LLM provider (e.g. openai, azure, local)' 
  })
  .option('llm-api-url', {
    type: 'string',
    description: 'LLM API base URL (for custom providers)'
  })
  .option('llm-model', {
    type: 'string',
    description: 'LLM model name (e.g. gpt-3.5-turbo)'
  })
  .option('memory', {
    type: 'string',
    default: 'memory.json',
    description: 'Path to memory bank file (default: memory.json)'
  })
  .command(
    'analyze',
    'Analyze the rulebase',
    () => {},
    args => {
      let rb = loadRulebaseFlexible(args.rulebase as string, args['format-in'] as string);
      // Filter by status
      if (args.status) {
        rb = rb.filter((r: any) => r.status === args.status);
      }
      // Filter by tag(s)
      if (args.tag) {
        const tags = (args.tag as string).split(',').map(t => t.trim());
        rb = rb.filter((r: any) => Array.isArray(r.tags) && tags.some(tag => r.tags.includes(tag)));
      }
      const { valid, errors } = validateRulebase(rb, args.schema as string);
      if (!valid) {
        console.error('Rulebase validation failed:');
        console.error(errors);
        process.exit(1);
      }
      const missing = findMissingCategories(rb);
      const duplicates = findDuplicateTitles(rb);
      const empty = findEmptyContents(rb);
      const stats = getCategoryStats(rb);
      const result: AnalysisResult & Record<string, any> = {
        totalRules: rb.length,
        missingCategories: missing,
        duplicateTitles: duplicates,
        emptyContents: empty,
        categoryStats: stats
      };
      // Plugin support
      if (args.plugin) {
        let pluginFn;
        try {
          const pluginPath = path.resolve(process.cwd(), args.plugin as string);
          pluginFn = require(pluginPath);
          if (pluginFn && typeof pluginFn === 'object' && typeof pluginFn.default === 'function') {
            pluginFn = pluginFn.default;
          }
        } catch (e) {
          const err = e as Error;
          console.error('Failed to load plugin:', err.message);
          process.exit(1);
        }
        try {
          const pluginResult = pluginFn(rb, result);
          if (pluginResult && typeof pluginResult === 'object') {
            Object.assign(result, pluginResult);
          }
        } catch (e) {
          const err = e as Error;
          console.error('Plugin execution failed:', err.message);
          process.exit(1);
        }
      }
      if ((args.output as string) === 'md') {
        console.log(formatMarkdown(result));
      } else if ((args.output as string) === 'csv') {
        console.log(formatCSV(result));
      } else if ((args.output as string) === 'html') {
        console.log(formatHTML(result));
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    }
  )
  .command(
    'validate',
    'Validate the rulebase against schema',
    () => {},
    args => {
      const rb: any = loadRulebaseFlexible(args.rulebase as string, args['format-in'] as string);
      const { valid, errors } = validateRulebase(rb, args.schema as string);
      if (valid) {
        console.log('Rulebase is valid.');
      } else {
        console.error('Validation errors:');
        console.error(errors);
        process.exit(1);
      }
    }
  )
  .command(
    'edit <id>',
    'Edit a rule in the rulebase',
    y =>
      y
        .positional('id', { type: 'string', describe: 'ID of the rule to edit' })
        .option('title', { type: 'string', describe: 'New title for the rule' })
        .option('category', { type: 'string', describe: 'New category for the rule' })
        .option('content', { type: 'string', describe: 'New content for the rule' })
        .option('severity', { type: 'string', describe: 'New severity for the rule' })
        .option('tags', { type: 'array', describe: 'New tags for the rule' }),
    args => {
      const file = args.rulebase as string;
      const abs = path.resolve(process.cwd(), file);
      const raw = fs.readFileSync(abs, 'utf-8');
      const rb: any[] = JSON.parse(raw);
      const idx = rb.findIndex(r => r.id === args.id);
      if (idx < 0) {
        console.error('Rule not found:', args.id);
        process.exit(1);
      }
      const rule = rb[idx];
      const changes: Record<string, any> = {};
      ['title', 'category', 'content', 'severity', 'tags'].forEach(key => {
        if (args[key]) {
          (rule as any)[key] = args[key];
          changes[key] = args[key];
        }
      });
      fs.writeFileSync(abs, JSON.stringify(rb, null, 2), 'utf-8');
      console.log(`Rule ${args.id} updated.`);
      appendInteraction('edit', { id: args.id, changes }, args.memory as string);
    }
  )
  .command(
    'suggest',
    'Suggest new rules via OpenAI LLM',
    () => {},
    async args => {
      const rb = loadRulebase(args.rulebase as string);
      const history = loadHistory(5, args.memory as string);
      let OpenAI;
      try {
        OpenAI = require('openai');
      } catch {
        console.error('The "openai" package is required for this feature. Install it with: npm install openai');
        process.exit(1);
      }
      const openai = new OpenAI({
        baseURL: args['llm-api-url'] as string | undefined,
        apiKey: process.env.OPENAI_API_KEY
      });
      const model = (args['llm-model'] as string) || 'gpt-3.5-turbo';
      let prompt = history.length
        ? `Previous interactions: ${JSON.stringify(history, null, 2)}\n\nHere is the current rulebase: ${JSON.stringify(rb, null, 2)}`
        : `Here is the current rulebase: ${JSON.stringify(rb, null, 2)}`;
      prompt += `\n\nPlease suggest 3 new rules, each with id, title, category, content, severity, tags in JSON array format.`;
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant for generating code rules.' },
            { role: 'user', content: prompt }
          ]
        });
        const suggestions = response.choices?.[0]?.message?.content;
        console.log(suggestions);
        appendInteraction('suggest', suggestions, args.memory as string);
      } catch (err: any) {
        console.error('OpenAI request failed:', err.message);
        process.exit(1);
      }
    }
  )
  .command(
    'watch',
    'Watch rulebase file and re-run analysis on change',
    () => {},
    args => {
      let chokidar;
      try {
        chokidar = require('chokidar');
      } catch {
        console.error('The "chokidar" package is required for this feature. Install it with: npm install chokidar');
        process.exit(1);
      }
      const file = args.rulebase as string;
      console.log(`Watching ${file} for changes...`);
      chokidar.watch(file).on('change', () => {
        console.log(`\nDetected change in ${file}. Re-analyzing...`);
        const rb = loadRulebase(file);
        const { valid, errors } = validateRulebase(rb, args.schema as string);
        if (!valid) {
          console.error('Validation failed:', errors);
          return;
        }
        const missing = findMissingCategories(rb);
        const duplicates = findDuplicateTitles(rb);
        const empty = findEmptyContents(rb);
        const stats = getCategoryStats(rb);
        const result: AnalysisResult = {
          totalRules: rb.length,
          missingCategories: missing,
          duplicateTitles: duplicates,
          emptyContents: empty,
          categoryStats: stats
        };
        console.log(JSON.stringify(result, null, 2));
      });
    }
  )
  .command(
    'memory:list',
    'List saved memory interactions',
    y => y.option('limit', { alias: 'l', type: 'number', describe: 'Max entries to show' }),
    args => {
      const entries = loadHistory(args.limit as number, args.memory as string);
      console.log(JSON.stringify(entries, null, 2));
    }
  )
  .command(
    'memory:clear',
    'Clear saved memory interactions',
    () => {},
    () => {
      clearHistory();
      console.log('Memory cleared.');
    }
  )
  .demandCommand(1, 'Please specify a command')
  .help()
  .strict()
  .parse();

function loadRulebaseFlexible(filePath: string, formatIn?: string): any[] {
  const abs = path.resolve(process.cwd(), filePath);
  const ext = path.extname(abs).toLowerCase();
  let format = formatIn || ext.replace(/^\./, '');
  let raw = fs.readFileSync(abs, 'utf-8');
  if (format === 'json') {
    return JSON.parse(raw);
  } else if (format === 'yaml' || format === 'yml') {
    let yaml;
    try { yaml = require('js-yaml'); } catch {
      console.error('YAML input requires "js-yaml". Install with: npm install js-yaml');
      process.exit(1);
    }
    return yaml.load(raw);
  } else if (format === 'toml') {
    let toml;
    try { toml = require('toml'); } catch {
      console.error('TOML input requires "toml". Install with: npm install toml');
      process.exit(1);
    }
    return toml.parse(raw);
  } else if (format === 'md' || format === 'markdown') {
    let matter;
    try { matter = require('gray-matter'); } catch {
      console.error('Markdown input requires "gray-matter". Install with: npm install gray-matter');
      process.exit(1);
    }
    const parsed = matter(raw);
    if (Array.isArray(parsed.data.rules)) return parsed.data.rules;
    if (Array.isArray(parsed.content)) return parsed.content;
    try { return JSON.parse(parsed.content); } catch {}
    return [];
  } else {
    console.error(`Unknown rulebase format: ${format}`);
    process.exit(1);
  }
} 