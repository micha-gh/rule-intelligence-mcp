import {
  findMissingCategories,
  findDuplicateTitles,
  findEmptyContents,
  getCategoryStats,
  validateRulebase
} from './analyze';
import path from 'path';

describe('analyze.ts', () => {
  const rulebase = [
    { id: '1', title: 'A', category: 'Cat1', content: 'foo' },
    { id: '2', title: 'B', category: '', content: 'bar' },
    { id: '3', title: 'A', category: 'Cat1', content: '' },
    { id: '4', title: 'C', category: 'Cat2', content: 'baz' }
  ];

  it('finds missing categories', () => {
    const res = findMissingCategories(rulebase);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('2');
  });

  it('finds duplicate titles', () => {
    const res = findDuplicateTitles(rulebase);
    expect(res.map(r => r.id)).toEqual(expect.arrayContaining(['1', '3']));
  });

  it('finds empty contents', () => {
    const res = findEmptyContents(rulebase);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('3');
  });

  it('gets category stats', () => {
    const res = getCategoryStats(rulebase);
    expect(res['Cat1']).toBe(2);
    expect(res['Cat2']).toBe(1);
  });

  it('validates rulebase against schema', () => {
    const schemaPath = path.resolve(__dirname, '../rule-schema.json');
    const { valid, errors } = validateRulebase(rulebase, schemaPath);
    expect(valid).toBe(true);
    expect(errors).toBeUndefined();
  });

  it('detects invalid rulebase', () => {
    const invalid = [{ foo: 'bar' }];
    const schemaPath = path.resolve(__dirname, '../rule-schema.json');
    const { valid, errors } = validateRulebase(invalid, schemaPath);
    expect(valid).toBe(false);
    expect(errors).toBeDefined();
  });
}); 