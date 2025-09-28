import { JftnParser } from './dist/index.js';

const testScript1 = `# 登場人物
太郎: 主人公
花子: ヒロイン

これはプロローグです

# シーン1`;

const testScript2 = `# 登場人物

太郎: 主人公

これはプロローグです`;

const testScript3 = `# 登場人物

これはプロローグです`;

console.log('=== 登場人物行後のコメントテスト ===\n');

const parser = new JftnParser();

console.log('テスト1: 登場人物行の後に空行、その後コメント');
console.log(testScript1);
console.log();

const result1 = parser.parse(testScript1);
if (result1.success && result1.data) {
  result1.data.lines.forEach((line, index) => {
    const lineNum = (index + 1).toString().padStart(2, '0');
    const type = line.type.toString().padEnd(15);
    const name = line.name ? `[${line.name}]` : '';
    const text = line.text || '';
    console.log(`${lineNum}: ${type} ${name} ${text}`);
  });
}

console.log('\n' + '='.repeat(30) + '\n');

console.log('テスト2: 見出し直後に空行、登場人物行、空行、コメント');
console.log(testScript2);
console.log();

const result2 = parser.parse(testScript2);
if (result2.success && result2.data) {
  result2.data.lines.forEach((line, index) => {
    const lineNum = (index + 1).toString().padStart(2, '0');
    const type = line.type.toString().padEnd(15);
    const name = line.name ? `[${line.name}]` : '';
    const text = line.text || '';
    console.log(`${lineNum}: ${type} ${name} ${text}`);
  });
}

console.log('\n' + '='.repeat(30) + '\n');

console.log('テスト3: 見出し直後に空行、その後すぐコメント（登場人物行なし）');
console.log(testScript3);
console.log();

const result3 = parser.parse(testScript3);
if (result3.success && result3.data) {
  result3.data.lines.forEach((line, index) => {
    const lineNum = (index + 1).toString().padStart(2, '0');
    const type = line.type.toString().padEnd(15);
    const name = line.name ? `[${line.name}]` : '';
    const text = line.text || '';
    console.log(`${lineNum}: ${type} ${name} ${text}`);
  });
}
