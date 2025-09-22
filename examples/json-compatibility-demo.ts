/**
 * JSON シリアライゼーション機能のデモ
 * Python playscript パッケージとの互換性を実演
 */

import {
  PScLine,
  PScLineType,
  PSc,
  linesFromTypesAndTexts,
} from '../src/types';

console.log('=== JSON シリアライゼーション機能デモ ===\n');

// 1. 基本的な台本データの作成
console.log('1. 基本的な台本データの作成');
const script = new PSc({
  title: '短編台本',
  author: '山田太郎',
  chars: ['太郎', '花子'],
  lines: [
    new PScLine(PScLineType.TITLE, undefined, '短編台本'),
    new PScLine(PScLineType.AUTHOR, undefined, '山田太郎'),
    new PScLine(PScLineType.CHARSHEADLINE, undefined, '登場人物'),
    new PScLine(PScLineType.CHARACTER, '太郎', '主人公、20代男性'),
    new PScLine(PScLineType.CHARACTER, '花子', 'ヒロイン、20代女性'),
    new PScLine(PScLineType.EMPTY),
    new PScLine(PScLineType.H1, undefined, 'シーン1 - 公園'),
    new PScLine(PScLineType.EMPTY),
    new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは、花子さん'),
    new PScLine(PScLineType.DIALOGUE, '花子', 'あら、太郎さん。こんにちは'),
    new PScLine(PScLineType.DIRECTION, undefined, '太郎が花子に近づく'),
    new PScLine(PScLineType.DIALOGUE, '太郎', '今日はいい天気ですね'),
    new PScLine(PScLineType.DIALOGUE, '花子', 'そうですね。散歩日和です'),
    new PScLine(PScLineType.EMPTY),
    new PScLine(PScLineType.ENDMARK, undefined, 'THE END'),
  ],
});

console.log(`作成した台本: ${script.toString()}`);
console.log();

// 2. JSON シリアライゼーション
console.log('2. JSON シリアライゼーション (Python 互換形式)');
const jsonData = script.toJSON();
const jsonString = JSON.stringify(jsonData, null, 2);
console.log('JSON 形式:');
console.log(jsonString);
console.log();

// 3. JSON デシリアライゼーション
console.log('3. JSON デシリアライゼーション');
const restoredScript = PSc.fromJSON(JSON.parse(jsonString));
console.log(`復元した台本: ${restoredScript.toString()}`);
console.log('データの整合性チェック:');
console.log(`- タイトル一致: ${script.title === restoredScript.title}`);
console.log(`- 作者一致: ${script.author === restoredScript.author}`);
console.log(
  `- 登場人物一致: ${JSON.stringify(script.chars) === JSON.stringify(restoredScript.chars)}`
);
console.log(
  `- 行数一致: ${script.lines.length === restoredScript.lines.length}`
);
console.log();

// 4. Python 互換 JSON の例 (Python から来たデータを想定)
console.log('4. Python 互換 JSON の読み込み例');
const pythonJsonExample = `{
  "class": "PSc",
  "title": "Python からの台本",
  "author": "Python 開発者",
  "chars": ["アリス", "ボブ"],
  "lines": [
    {
      "class": "PScLine",
      "type": "TITLE",
      "text": "Python からの台本"
    },
    {
      "class": "PScLine",
      "type": "AUTHOR", 
      "text": "Python 開発者"
    },
    {
      "class": "PScLine",
      "type": "DIALOGUE",
      "name": "アリス",
      "text": "Python から TypeScript へようこそ！"
    },
    {
      "class": "PScLine",
      "type": "DIALOGUE",
      "name": "ボブ",
      "text": "JSON を通じて完全に互換性があります"
    }
  ]
}`;

const pythonScript = PSc.fromJSON(JSON.parse(pythonJsonExample));
console.log(`Python からの台本: ${pythonScript.toString()}`);
console.log('セリフの内容:');
pythonScript.lines.forEach((line, index) => {
  if (line.type === PScLineType.DIALOGUE) {
    console.log(`  ${line.name}: "${line.text}"`);
  }
});
console.log();

// 5. linesFromTypesAndTexts ユーティリティの使用例
console.log('5. linesFromTypesAndTexts ユーティリティの使用例');
const types = [
  PScLineType.TITLE,
  PScLineType.AUTHOR,
  PScLineType.DIALOGUE,
  PScLineType.DIALOGUE,
  PScLineType.DIRECTION,
];

const texts = [
  'ユーティリティデモ',
  'デモ作者',
  '太郎 おはようございます',
  '花子 おはようございます、太郎さん',
  '二人が挨拶を交わす',
];

const utilityLines = linesFromTypesAndTexts(types, texts);
const utilityScript = PSc.fromLines(utilityLines);

console.log('ユーティリティで作成した台本:');
utilityScript.lines.forEach((line, index) => {
  console.log(
    `  ${index + 1}. ${PScLineType[line.type]}: ${line.name ? `"${line.name}" ` : ''}${line.text ? `"${line.text}"` : ''}`
  );
});
console.log();

// 6. 個別の PScLine の JSON 処理例
console.log('6. 個別の PScLine の JSON 処理例');
const sampleLines = [
  new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは'),
  new PScLine(PScLineType.DIRECTION, undefined, '太郎が手を振る'),
  new PScLine(PScLineType.EMPTY),
  new PScLine(PScLineType.CHARACTER, '花子', 'ヒロイン'),
];

console.log('各行の JSON 形式:');
sampleLines.forEach((line, index) => {
  const lineJson = line.toJSON();
  console.log(`  ${index + 1}. ${JSON.stringify(lineJson)}`);
});
console.log();

// 7. エラーハンドリングの例
console.log('7. エラーハンドリングの例');
try {
  // 不正な JSON からの復元を試行
  const invalidJson = {
    class: 'PSc',
    lines: [
      {
        class: 'PScLine',
        type: 'INVALID_TYPE',
        text: 'テスト',
      },
    ],
  };

  PSc.fromJSON(invalidJson);
} catch (error) {
  console.log(
    `エラーをキャッチ: ${error instanceof Error ? error.message : error}`
  );
}

try {
  // 必須パラメータなしでの PScLine 作成を試行
  new PScLine(PScLineType.DIALOGUE); // name が必須だがない
} catch (error) {
  console.log(
    `エラーをキャッチ: ${error instanceof Error ? error.message : error}`
  );
}

console.log();
console.log('=== デモ完了 ===');
console.log(
  'このデモは Python playscript パッケージとの完全な JSON 互換性を示しています。'
);
console.log('TypeScript で作成したデータを JSON 経由で Python に送信し、');
console.log(
  'Python で作成したデータを JSON 経由で TypeScript で読み込むことができます。'
);
