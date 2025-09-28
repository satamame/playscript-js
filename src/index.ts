/**
 * playscript-js - A TypeScript library for parsing and rendering Japanese Fountain (JFTN) screenplay format
 */

export * from './types';
export * from './rules';
export * from './utils';

// Placeholder exports for future implementation
export { JftnParser } from './parser';
export { ScriptRenderer } from './renderer';
export type { RenderOptions } from './renderer';

// Version info
export const VERSION = '0.1.0';
