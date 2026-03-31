import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { JftnParser } from '../src/parser';
import { ScriptRenderer } from '../src/renderer';
import { PSc } from '../src/types';

const __dirname = import.meta.dirname;

// 出力ディレクトリを作成
const outDir = join(__dirname, 'out');
mkdirSync(outDir, { recursive: true });

// JFTN ファイルを読み込んでパース
const jftnContent = readFileSync(join(__dirname, 'sample-script.jftn'), 'utf-8');
const parser = new JftnParser();
const result = parser.parse(jftnContent);

if (!result.success || !result.data) {
  console.error('パースエラー:', result.errors);
  process.exit(1);
}

const script = result.data as PSc;
console.log(`タイトル: ${script.title}`);
console.log(`作者: ${script.author}`);
console.log(`行数: ${script.lines.length}`);

// デフォルト設定でレンダリング
const renderer = new ScriptRenderer();
const html = renderer.renderToHTML(script);

const outputPath = join(outDir, 'render.html');
writeFileSync(outputPath, html, 'utf-8');
console.log(`✅ ${outputPath} に出力しました`);
