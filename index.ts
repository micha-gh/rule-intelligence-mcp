#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import OpenAI from 'openai';
import {
  loadRulebase,
  validateRulebase,
  findMissingCategories,
  findDuplicateTitles,
  findEmptyContents,
  getCategoryStats,
  formatMarkdown,
  AnalysisResult
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
  .command(
    'analyze',
    'Analyze the rulebase',
    () => {},
    args => {
      const rb = loadRulebase(args.rulebase as string);
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
      const result: AnalysisResult = {
        totalRules: rb.length,
        missingCategories: missing,
        duplicateTitles: duplicates,
        emptyContents: empty,
        categoryStats: stats
      };
      if ((args.format as string) === 'md') {
        console.log(formatMarkdown(result));
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
      const rb: any = loadRulebase(args.rulebase as string);
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
      appendInteraction('edit', { id: args.id, changes });
    }
  )
  .command(
    'suggest',
    'Suggest new rules via OpenAI LLM',
    () => {},
    async args => {
      const rb = loadRulebase(args.rulebase as string);
      const history = loadHistory(5);
      const openai = new OpenAI();
      let prompt = history.length
        ? `Previous interactions: ${JSON.stringify(history, null, 2)}\n\nHere is the current rulebase: ${JSON.stringify(rb, null, 2)}`
        : `Here is the current rulebase: ${JSON.stringify(rb, null, 2)}`;
      prompt += `\n\nPlease suggest 3 new rules, each with id, title, category, content, severity, tags in JSON array format.`;
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant for generating code rules.' },
            { role: 'user', content: prompt }
          ]
        });
        const suggestions = response.choices?.[0]?.message?.content;
        console.log(suggestions);
        appendInteraction('suggest', suggestions);
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
      const entries = loadHistory(args.limit as number);
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