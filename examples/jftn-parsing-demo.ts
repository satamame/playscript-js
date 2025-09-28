/**
 * JFTN パース機能のデモ
 * JFTN 文字列から PSc オブジェクトへの変換を実演
 */

import { JftnParser, PScLineType } from '../src/index.js';

console.log('=== JFTN パース機能デモ ===\n');

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

// 2. パーサーでパース (デフォルト: 空行を含めない)
console.log('2. パース実行 (空行を含めない)');
const parser = new JftnParser();
const result = parser.parse(jftnScript);

if (result.success && result.data) {
  console.log('✅ パース成功!');
  console.log();

  const script = result.data;

  // 3. パース結果の表示
  console.log('3. パース結果:');
  console.log(`タイトル: ${script.title}`);
  console.log(`作者: ${script.author}`);
  console.log(`登場人物: ${script.chars.join(', ')}`);
  console.log(`総行数: ${script.lines.length}`);
  console.log();

  // 4. 各行の詳細表示
  console.log('4. 各行の詳細:');
  script.lines.forEach((line, index) => {
    const lineNum = (index + 1).toString().padStart(2, '0');
    const type = line.type.toString().padEnd(20);
    const name = line.name ? `[${line.name}]` : '';
    const text = line.text || '';
    console.log(`${lineNum}: ${type} ${name} ${text}`);
  });
  console.log();

  // 5. JSON 出力
  console.log('5. JSON 形式での出力:');
  const jsonData = script.toJSON();
  console.log(JSON.stringify(jsonData, null, 2));
} else {
  console.log('❌ パースエラー:');
  result.errors.forEach(error => {
    console.log(`  行 ${error.lineNumber}: ${error.message}`);
  });
}

if (result.warnings.length > 0) {
  console.log('\n⚠️ 警告:');
  result.warnings.forEach(warning => {
    console.log(`  ${warning}`);
  });
}

// 6. 空行を含める場合のテスト
console.log('\n' + '='.repeat(50));
console.log('6. 空行を含める場合のパース結果:');
const parserWithEmptyLines = new JftnParser({ includeEmptyLines: true });
const resultWithEmptyLines = parserWithEmptyLines.parse(jftnScript);

if (resultWithEmptyLines.success && resultWithEmptyLines.data) {
  const scriptWithEmptyLines = resultWithEmptyLines.data;
  console.log(`総行数 (空行含む): ${scriptWithEmptyLines.lines.length}`);
  console.log('空行の位置:');
  scriptWithEmptyLines.lines.forEach((line, index) => {
    if (line.type === PScLineType.EMPTY) {
      const lineNum = (index + 1).toString().padStart(2, '0');
      console.log(`  ${lineNum}: EMPTY`);
    }
  });

  console.log();
  console.log('7. 空行を含む場合の各行詳細:');
  scriptWithEmptyLines.lines.forEach((line, index) => {
    const lineNum = (index + 1).toString().padStart(2, '0');
    const type = line.type.toString().padEnd(20);
    const name = line.name ? `[${line.name}]` : '';
    const text = line.text || '';
    console.log(`${lineNum}: ${type} ${name} ${text}`);
  });

  console.log();
  console.log('8. 空行を含む場合の JSON 形式での出力:');
  const jsonDataWithEmptyLines = scriptWithEmptyLines.toJSON();
  console.log(JSON.stringify(jsonDataWithEmptyLines, null, 2));
}

console.log('\n=== デモ完了 ===');
