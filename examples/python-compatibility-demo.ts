/**
 * Demonstration of Python playscript package compatibility
 * This shows how to create data that can be exchanged with Python via JSON
 */

import { PSc, PScLine, PScLineType } from '../src/types';

// Create a script using TypeScript
const script = new PSc({
  title: '互換性テスト台本',
  author: 'TypeScript 作者',
  chars: ['太郎', '花子', 'ナレーター'],
  lines: [
    new PScLine(PScLineType.TITLE, undefined, '互換性テスト台本'),
    new PScLine(PScLineType.AUTHOR, undefined, 'TypeScript 作者'),
    new PScLine(PScLineType.EMPTY),
    new PScLine(PScLineType.CHARSHEADLINE, undefined, '登場人物'),
    new PScLine(PScLineType.CHARACTER, '太郎', '主人公'),
    new PScLine(PScLineType.CHARACTER, '花子', 'ヒロイン'),
    new PScLine(PScLineType.CHARACTER, 'ナレーター'),
    new PScLine(PScLineType.EMPTY),
    new PScLine(PScLineType.H1, undefined, '第一場'),
    new PScLine(
      PScLineType.DIRECTION,
      undefined,
      '舞台は学校の教室。太郎と花子が向かい合って座っている。'
    ),
    new PScLine(PScLineType.DIALOGUE, '太郎', 'おはよう、花子さん。'),
    new PScLine(PScLineType.DIALOGUE, '花子', 'おはようございます、太郎くん。'),
    new PScLine(PScLineType.DIRECTION, undefined, '二人は微笑み合う。'),
    new PScLine(
      PScLineType.DIALOGUE,
      'ナレーター',
      'こうして二人の一日が始まった。'
    ),
    new PScLine(PScLineType.EMPTY),
    new PScLine(PScLineType.ENDMARK, undefined, 'THE END'),
  ],
});

console.log('=== TypeScript で作成した台本 ===');
console.log(script.toString());
console.log();

// Serialize to JSON (compatible with Python psc_dumps)
const jsonString = JSON.stringify(script.toJSON(), null, 2);
console.log('=== JSON シリアライゼーション (Python psc_dumps 互換) ===');
console.log(jsonString);
console.log();

// Deserialize from JSON (compatible with Python psc_loads)
const restoredScript = PSc.fromJSON(JSON.parse(jsonString));
console.log('=== JSON から復元した台本 ===');
console.log(restoredScript.toString());
console.log();

// Verify round-trip compatibility
const isIdentical =
  script.title === restoredScript.title &&
  script.author === restoredScript.author &&
  JSON.stringify(script.chars) === JSON.stringify(restoredScript.chars) &&
  script.lines.length === restoredScript.lines.length &&
  script.lines.every((line, i) => {
    const restored = restoredScript.lines[i];
    return (
      line.type === restored.type &&
      line.name === restored.name &&
      line.text === restored.text
    );
  });

console.log('=== 互換性検証 ===');
console.log(`Round-trip 互換性: ${isIdentical ? '✅ 成功' : '❌ 失敗'}`);
console.log();

// Example of Python-generated JSON that should be readable
const pythonGeneratedJson = `{
  "class": "PSc",
  "title": "Python で作成した台本",
  "author": "Python 作者",
  "chars": ["登場人物A", "登場人物B"],
  "lines": [
    {
      "class": "PScLine",
      "type": "TITLE",
      "text": "Python で作成した台本"
    },
    {
      "class": "PScLine",
      "type": "AUTHOR", 
      "text": "Python 作者"
    },
    {
      "class": "PScLine",
      "type": "DIALOGUE",
      "name": "登場人物A",
      "text": "これは Python から来たデータです"
    },
    {
      "class": "PScLine",
      "type": "DIALOGUE",
      "name": "登場人物B", 
      "text": "TypeScript で読めますか？"
    }
  ]
}`;

console.log('=== Python 生成 JSON の読み込みテスト ===');
try {
  const pythonScript = PSc.fromJSON(JSON.parse(pythonGeneratedJson));
  console.log('✅ Python 生成 JSON の読み込み成功');
  console.log(pythonScript.toString());
  console.log();

  // Show individual lines
  console.log('=== 行の詳細 ===');
  pythonScript.lines.forEach((line, i) => {
    console.log(`${i + 1}: ${line.toString()}`);
  });
} catch (error) {
  console.log('❌ Python 生成 JSON の読み込み失敗:', error);
}
