import fs from 'fs';
import path from 'path';
import Ajv, { ErrorObject } from 'ajv';

export interface Rule {
  id: string;
  title: string;
  category: string;
  content: string;
  severity?: string;
  tags?: string[];
}

export interface AnalysisResult {
  totalRules: number;
  missingCategories: Rule[];
  duplicateTitles: Rule[];
  emptyContents: Rule[];
  categoryStats: Record<string, number>;
}

export function loadRulebase(filePath: string): Rule[] {
  const abs = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(raw) as Rule[];
}

export function validateRulebase(rulebase: any, schemaPath: string): { valid: boolean; errors?: ErrorObject[] } {
  const absSchema = path.resolve(__dirname, '..', schemaPath);
  const schemaRaw = fs.readFileSync(absSchema, 'utf-8');
  const schema = JSON.parse(schemaRaw);
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(rulebase);
  return { valid: Boolean(valid), errors: validate.errors || undefined };
}

export function findMissingCategories(rulebase: Rule[]): Rule[] {
  return rulebase.filter(rule => !rule.category || rule.category.trim() === '');
}

export function findDuplicateTitles(rulebase: Rule[]): Rule[] {
  const count: Record<string, number> = {};
  rulebase.forEach(rule => { count[rule.title] = (count[rule.title] || 0) + 1; });
  return rulebase.filter(rule => count[rule.title] > 1);
}

export function findEmptyContents(rulebase: Rule[]): Rule[] {
  return rulebase.filter(rule => !rule.content || rule.content.trim() === '');
}

export function getCategoryStats(rulebase: Rule[]): Record<string, number> {
  return rulebase.reduce<Record<string, number>>((acc, rule) => {
    const cat = rule.category || 'undefined';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
}

export function formatMarkdown(result: AnalysisResult): string {
  let md = `# Rulebase Analysis\n\n`;
  md += `- Total Rules: **${result.totalRules}**\n`;
  md += `- Missing Categories: **${result.missingCategories.length}**\n`;
  md += `- Duplicate Titles: **${result.duplicateTitles.length}**\n`;
  md += `- Empty Contents: **${result.emptyContents.length}**\n\n`;
  md += `## Category Stats\n\n`;
  md += `| Category | Count |\n|---|---|\n`;
  for (const [cat, cnt] of Object.entries(result.categoryStats)) {
    md += `| ${cat} | ${cnt} |\n`;
  }
  md += `\n## Details\n\n`;
  if (result.missingCategories.length) {
    md += `### Rules with Missing Categories\n`;
    result.missingCategories.forEach(r => { md += `- [${r.id}] ${r.title}\n`; });
    md += `\n`;
  }
  if (result.duplicateTitles.length) {
    md += `### Rules with Duplicate Titles\n`;
    result.duplicateTitles.forEach(r => { md += `- [${r.id}] ${r.title}\n`; });
    md += `\n`;
  }
  if (result.emptyContents.length) {
    md += `### Rules with Empty Contents\n`;
    result.emptyContents.forEach(r => { md += `- [${r.id}] ${r.title}\n`; });
    md += `\n`;
  }
  return md;
} 