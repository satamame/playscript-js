import { JftnParser, ScriptRenderer } from '../src/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { writeFileSync } from 'fs';

const jftnFilePath = join(import.meta.dirname || __dirname, 'madam.jftn');
const jftnScript = readFileSync(jftnFilePath, 'utf8');

const parser = new JftnParser();
const result = parser.parse(jftnScript);

if (!result.success || !result.data) {
  console.log('❌ パースエラー:');
  result.errors.forEach(error => {
    console.log(`  ${error.message}`);
  });
  process.exit(1);
}

const renderer = new ScriptRenderer();
const html = renderer.renderToHTML(result.data);

const htmlFilePath = join(import.meta.dirname || __dirname, 'out/madam.html');
writeFileSync(htmlFilePath, html, 'utf8');
