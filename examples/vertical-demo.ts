/**
 * 縦書きレンダリング機能のデモ
 * 日本語縦書き台本の表示を実演
 */

import { JftnParser, ScriptRenderer } from '../src/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('=== 縦書きレンダリング機能デモ ===\n');

// 1. JFTN ファイルを読み込み
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

// 出力フォルダを作成
const outDir = join(import.meta.dirname || __dirname, 'out');
try {
  mkdirSync(outDir, { recursive: true });
} catch (error) {
  // フォルダが既に存在する場合は無視
}

// 3. 横書きレンダリング（比較用）
console.log('3. 横書きレンダリング');
const horizontalRenderer = new ScriptRenderer();
const horizontalHtml = horizontalRenderer.renderToHTML(script, {
  writingMode: 'horizontal',
});

writeFileSync(join(outDir, 'vertical-demo-horizontal.html'), horizontalHtml);
console.log('✅ 横書き版: examples/out/vertical-demo-horizontal.html');

// 4. 縦書きレンダリング（ライトテーマ）
console.log('4. 縦書きレンダリング（ライトテーマ）');
const verticalRenderer = new ScriptRenderer();
const verticalHtml = verticalRenderer.renderToHTML(script, {
  writingMode: 'vertical',
  theme: 'light',
});

writeFileSync(join(outDir, 'vertical-demo-light.html'), verticalHtml);
console.log('✅ 縦書きライト版: examples/out/vertical-demo-light.html');

// 5. 縦書きレンダリング（ダークテーマ）
console.log('5. 縦書きレンダリング（ダークテーマ）');
const verticalDarkHtml = verticalRenderer.renderToHTML(script, {
  writingMode: 'vertical',
  theme: 'dark',
});

writeFileSync(join(outDir, 'vertical-demo-dark.html'), verticalDarkHtml);
console.log('✅ 縦書きダーク版: examples/out/vertical-demo-dark.html');

// 6. カスタムCSS付き縦書き
console.log('6. カスタムCSS付き縦書き');
const customVerticalHtml = verticalRenderer.renderToHTML(script, {
  writingMode: 'vertical',
  customCSS: `
    /* カスタム縦書きスタイル */
    .script-container[data-writing-mode="vertical"] {
      background: linear-gradient(to left, #fffef8, #f8f5f0);
    }
    
    .script-container[data-writing-mode="vertical"] .scene-heading-1 {
      border: 3px double #8B4513;
      background: rgba(255, 248, 220, 0.9);
      color: #8B4513;
    }
    
    .script-container[data-writing-mode="vertical"] .dialogue[data-character="太郎"] .character-name {
      color: #1e40af;
      background: rgba(30, 64, 175, 0.1);
      border-radius: 4px;
    }
    
    .script-container[data-writing-mode="vertical"] .dialogue[data-character="花子"] .character-name {
      color: #be185d;
      background: rgba(190, 24, 93, 0.1);
      border-radius: 4px;
    }
  `,
});

writeFileSync(join(outDir, 'vertical-demo-custom.html'), customVerticalHtml);
console.log('✅ カスタム縦書き版: examples/out/vertical-demo-custom.html');

console.log('\n=== デモ完了 ===');
console.log(
  '\nexamples/out/ フォルダ内の生成されたHTMLファイルをブラウザで開いて縦書き表示を確認してください！'
);
