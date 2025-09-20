import { JftnParser, ScriptRenderer, VERSION } from '../src';

describe('Basic functionality', () => {
  test('exports are available', () => {
    expect(JftnParser).toBeDefined();
    expect(ScriptRenderer).toBeDefined();
    expect(VERSION).toBe('0.1.0');
  });

  test('parser can be instantiated', () => {
    const parser = new JftnParser();
    expect(parser).toBeInstanceOf(JftnParser);
  });

  test('renderer can be instantiated', () => {
    const renderer = new ScriptRenderer();
    expect(renderer).toBeInstanceOf(ScriptRenderer);
  });

  test('parser returns valid result structure', () => {
    const parser = new JftnParser();
    const result = parser.parse('test content');
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});