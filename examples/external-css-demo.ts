import { readFileSync } from 'fs';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JftnParser } from '../src/parser';
import { ScriptRenderer } from '../src/renderer';
import { PSc } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== 外部CSS読み込みデモ ===\n');

// 出力ディレクトリを作成
const outputDir = join(__dirname, 'out');
try {
  mkdirSync(outputDir, { recursive: true });
} catch {
  // ディレクトリが既に存在する場合はエラーを無視
}

// JFTNファイルを読み込み
const jftnPath = join(__dirname, 'sample-script.jftn');
const jftnContent = readFileSync(jftnPath, 'utf-8');

console.log('1. JFTN ファイル読み込み:');
console.log(`ファイル: ${jftnPath}`);

// パース実行
const parser = new JftnParser();
const parseResult = parser.parse(jftnContent);

console.log('\n2. パース実行');
if (!parseResult.success) {
  console.error('❌ パースエラー:', parseResult.errors);
  process.exit(1);
}

const script = parseResult.data as PSc;
console.log('✅ パース成功!');
console.log('Debug - parseResult:', parseResult);
console.log('Debug - script:', script);
console.log(`タイトル: ${script?.title || 'なし'}`);
console.log(`作者: ${script?.author || 'なし'}`);
console.log(`総行数: ${script?.lines?.length || 0}`);

// レンダラーを作成（外部CSSファイルを使用）
const renderer = new ScriptRenderer();

console.log('\n3. 外部CSSファイルを使用したレンダリング');

// 横書きレンダリング
const horizontalHtml = renderer.renderToHTML(script, {
  writingMode: 'horizontal',
  theme: 'light',
});

const horizontalOutputPath = join(outputDir, 'external-css-horizontal.html');
writeFileSync(horizontalOutputPath, horizontalHtml, 'utf-8');
console.log(`✅ 横書き版: ${horizontalOutputPath}`);

// 縦書きレンダリング（ライトテーマ）
const verticalLightHtml = renderer.renderToHTML(script, {
  writingMode: 'vertical',
  theme: 'light',
});

const verticalLightOutputPath = join(
  outputDir,
  'external-css-vertical-light.html'
);
writeFileSync(verticalLightOutputPath, verticalLightHtml, 'utf-8');
console.log(`✅ 縦書きライト版: ${verticalLightOutputPath}`);

// 縦書きレンダリング（ダークテーマ）
const verticalDarkHtml = renderer.renderToHTML(script, {
  writingMode: 'vertical',
  theme: 'dark',
});

const verticalDarkOutputPath = join(
  outputDir,
  'external-css-vertical-dark.html'
);
writeFileSync(verticalDarkOutputPath, verticalDarkHtml, 'utf-8');
console.log(`✅ 縦書きダーク版: ${verticalDarkOutputPath}`);

console.log('\n=== デモ完了 ===');
console.log('\n📁 CSSファイルの場所:');
console.log('- src/styles/base.css (基本スタイル)');
console.log('- src/styles/horizontal.css (横書き専用)');
console.log('- src/styles/vertical.css (縦書き専用)');
console.log('- src/styles/theme-light.css (ライトテーマ)');
console.log('- src/styles/theme-dark.css (ダークテーマ)');
console.log('\n📄 生成されたHTMLファイル:');
console.log('- external-css-horizontal.html');
console.log('- external-css-vertical-light.html');
console.log('- external-css-vertical-dark.html');
console.log(
  '\n💡 CSSファイルを編集すると、次回のレンダリングから反映されます！'
);
