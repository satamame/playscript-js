/**
 * ScriptRenderer 機能のデモ
 * 台本データから HTML への変換を実演
 */

import { JftnParser, ScriptRenderer } from '../src/index.js';

console.log('=== ScriptRenderer 機能デモ ===\n');

// 1. JFTN ファイルを読み込み
import { readFileSync } from 'fs';
import { join } from 'path';

const jftnFilePath = join(
  import.meta.dirname || __dirname,
  'sample-script.jftn'
);
const jftnScript = readFileSync(jftnFilePath, 'utf8');

console.log('1. JFTN ファイル読み込み:');
console.log(`ファイル: ${jftnFilePath}`);
console.log('内容:');
console.log(jftnScript);
console.log('\n' + '='.repeat(50) + '\n');

// 2. パースして台本データを作成
console.log('2. パース実行');
const parser = new JftnParser();
const result = parser.parse(jftnScript);

if (!result.success || !result.data) {
  console.log('❌ パースエラー:');
  result.errors.forEach(error => {
    console.log(`  ${error.message}`);
  });
  process.exit(1);
}

console.log('✅ パース成功!');
const script = result.data;
console.log(`タイトル: ${script.title}`);
console.log(`作者: ${script.author}`);
console.log(`総行数: ${script.lines.length}`);
console.log();

// 3. HTML レンダリング (デフォルト設定)
console.log('3. HTML レンダリング (デフォルト設定)');
const renderer = new ScriptRenderer();
const html = renderer.renderToHTML(script);

console.log('HTML 出力 (最初の500文字):');
console.log(html.substring(0, 500) + '...');
console.log();

// 4. カスタム設定でのレンダリング
console.log('4. カスタム設定でのレンダリング');

const customHtml = renderer.renderToHTML(script, {
  theme: 'dark',
  fontSize: 18,
  customCSS: `
    .script-container {
      border: 2px solid #333;
      border-radius: 8px;
    }
    .script-title {
      color: #ff6b6b;
    }
  `,
});

console.log('カスタム HTML 出力 (最初の500文字):');
console.log(customHtml.substring(0, 500) + '...');
console.log();

// 5. 個別要素のレンダリング
console.log('5. 個別要素のレンダリング例');
script.lines.slice(0, 5).forEach((line, index) => {
  const elementHtml = renderer.renderElement(line);
  console.log(`要素 ${index + 1} (${line.type}): ${elementHtml}`);
});
console.log();

// 6. CSS のみ生成
console.log('6. CSS のみ生成');
const css = renderer.generateCSS({
  theme: 'light',
  writingMode: 'vertical',
  fontSize: 14,
});

console.log('生成された CSS (最初の300文字):');
console.log(css.substring(0, 300) + '...');
console.log();

// 7. HTML ファイルとして出力
console.log('7. HTML ファイル出力');
import { writeFileSync } from 'fs';
let htmlFilePath: string;

try {
  htmlFilePath = join(import.meta.dirname || __dirname, 'out/render.html');
  writeFileSync(htmlFilePath, html, 'utf8');
  console.log(`✅ ${htmlFilePath} に出力しました`);

  htmlFilePath = join(
    import.meta.dirname || __dirname,
    'out/render-custom.html'
  );
  writeFileSync(htmlFilePath, customHtml, 'utf8');
  console.log(`✅ ${htmlFilePath} に出力しました`);
} catch (error) {
  console.log('❌ ファイル出力エラー:', error);
}

console.log('\n=== デモ完了 ===');
