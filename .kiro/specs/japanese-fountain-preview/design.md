# Design Document

## Overview

台本データを扱うためのライブラリを開発します。主に日本式Fountain記法 (.jftn) をサポートし、台本の解析、構造化、HTMLレンダリング機能を提供します。このライブラリは再利用可能なnpmパッケージとして公開し、将来的に他の台本フォーマットにも対応できる拡張性を持たせます。

### プロジェクト構成
```
playscript-js/
├── src/
│   ├── index.ts              # メインエクスポート
│   ├── parser.ts             # パーサー実装
│   ├── renderer.ts           # HTMLレンダラー
│   ├── types.ts              # 型定義
│   ├── utils.ts              # ユーティリティ
│   └── rules.ts              # 日本式記法ルール
├── tests/                    # テスト
│   ├── parser.test.ts
│   ├── renderer.test.ts
│   ├── utils.test.ts
│   └── fixtures/             # テスト用サンプルファイル
├── dist/                     # ビルド出力
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Architecture

### 台本データライブラリ (playscript-js)

#### 責務
- 台本ファイルの解析 (主に JFTN 記法)
- 台本データの構造化と管理
- HTML レンダリング機能の提供
- 将来的な他フォーマット対応の基盤
- 型安全な API の提供

#### 主要コンポーネント
- **JftnParser**: JFTN テキストを台本データに変換
- **ScriptRenderer**: 台本データを HTML に変換
- **Script**: 汎用的な台本データモデル
- **Types**: 型定義とインターフェース
- **Utils**: 日本語処理ユーティリティ
- **Rules**: JFTN 記法のパース規則

## Components and Interfaces

### 型定義

```typescript
// types.ts
export interface ScriptMetadata {
  title?: string;
  author?: string;
  source?: string;
  draftDate?: string;
  contact?: string;
}

export type ElementType = 
  | 'title'           // 題名
  | 'author'          // 著者名
  | 'charsheadline'   // 登場人物見出し
  | 'character'       // 登場人物
  | 'h1'              // 柱 (レベル 1)
  | 'h2'              // 柱 (レベル 2)
  | 'h3'              // 柱 (レベル 3)
  | 'direction'       // ト書き
  | 'dialogue'        // セリフ (人物名とテキストを含む)
  | 'endmark'         // エンドマーク
  | 'comment';        // コメント

/**
 * 用語定義: 「見出し」
 * 
 * ScriptElement の文脈において「見出し」と言った場合、
 * 以下の ElementType の総称を指す:
 * 
 * - 'charsheadline' (登場人物見出し)
 * - 'h1' (柱レベル 1)
 * - 'h2' (柱レベル 2)
 * - 'h3' (柱レベル 3)
 */
export type HeadingElementType = 'charsheadline' | 'h1' | 'h2' | 'h3';

export interface ScriptElement {
  type: ElementType;
  content: string;
  metadata?: Record<string, any>;
  lineNumber: number;
}

// セリフ要素の特別なインターフェース
export interface DialogueElement extends ScriptElement {
  type: 'dialogue';
  content: string;  // セリフのテキスト部分
  metadata: {
    character: string;  // 人物名 (@マークなし)
    [key: string]: any;
  };
}

export type ScriptFormat = 'jftn' | 'fountain' | 'fdx'; // 将来の拡張用

export interface Script {
  metadata: ScriptMetadata;
  elements: ScriptElement[];
  format: ScriptFormat;
  rawText: string;
}

// parser.ts
export class JftnParser {
  private context: ParsingContext;
  
  parse(text: string): Script;
  parseElement(line: string, lineNumber: number, previousElement?: ScriptElement): ScriptElement | null;
  parseMetadata(text: string): ScriptMetadata;
  updateContext(element: ScriptElement, isEmpty: boolean): void;
}

interface ParsingContext {
  lastElementType: ElementType | null;
  afterEmptyLine: boolean;
  afterEndmark: boolean;
}
```

### HTMLレンダラー

```typescript
// renderer.ts
export interface RenderOptions {
  writingMode?: 'horizontal' | 'vertical';
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  theme?: 'light' | 'dark';
  includeCSS?: boolean;
  customCSS?: string;
}

export class ScriptRenderer {
  constructor(options?: RenderOptions);
  
  render(script: Script, options?: RenderOptions): string;
  renderToHTML(script: Script, options?: RenderOptions): string;
  renderElement(element: ScriptElement): string;
  generateCSS(options?: RenderOptions): string;
  
  // 特定要素のレンダリング
  private renderTitle(element: ScriptElement): string;
  private renderAuthor(element: ScriptElement): string;
  private renderHeading(element: ScriptElement): string;
  private renderCharacter(element: ScriptElement): string;
  private renderDialogue(element: ScriptElement): string;
  private renderDirection(element: ScriptElement): string;
  private renderComment(element: ScriptElement): string;
  private renderEndmark(element: ScriptElement): string;
}
```

### ユーティリティ関数

```typescript
// utils.ts
export function isHeading(line: string): boolean;
export function isDialogue(line: string): boolean;
export function isEndmark(line: string): boolean;
export function normalizeText(text: string): string;
export function extractMetadata(lines: string[]): ScriptMetadata;
export function convertToVerticalText(text: string): string;
export function formatJapaneseText(text: string, writingMode: 'horizontal' | 'vertical'): string;
```

## Data Models

### JFTN記法の拡張

標準 Fountain に加えて、以下の日本語特有の記法をサポート:

1. **全角文字対応**
   - 全角括弧: 「」()
   - 全角コロン: :
   - 全角ピリオド: 。

2. **縦書き対応記号**
   - ダッシュ → 縦線変換
   - 括弧の向き調整
   - 数字の縦中横処理

3. **日本語キャラクター名**
   - ひらがな・カタカナ・漢字対応
   - 長い名前の改行処理

### パース規則

#### セリフの構造
セリフは1つの Element として処理され、「人物名」と「テキスト」の情報を含む:

1. **パース処理**:
   - 空行に続く@で始まる行がセリフの開始
   - 例: `@太郎`
   - その後、空行が現れるまでの行がセリフのテキスト
   - 例: `こんにちは。`

2. **Element 構造**:
   - `type`: `'dialogue'`
   - `content`: セリフのテキスト部分 (複数行の場合は結合)
   - `metadata.character`: 人物名 (@ マークなし)
   - `lineNumber`: @ で始まる行の行番号

#### セリフの例

```
@太郎
こんにちは。
今日はいい天気ですね。

@花子
そうですね。
散歩日和です。
```

上記は以下のようにパースされる:

```typescript
[
  {
    type: 'dialogue',
    content: 'こんにちは。\n今日はいい天気ですね。',
    metadata: { character: '太郎' },
    lineNumber: 1
  },
  {
    type: 'dialogue', 
    content: 'そうですね。\n散歩日和です。',
    metadata: { character: '花子' },
    lineNumber: 5
  }
]
```

#### パース規則の実装

```typescript
// JFTN 記法 (ウェブページ仕様準拠)
const JFTN_RULES = {
  // メタデータ
  title: /^Title:\s*(.+)$/i,
  author: /^Author:\s*(.+)$/i,
  
  // 登場人物一覧ヘッドライン
  charsheadline: /^#\s*登場人物$/,
  
  // 登場人物
  character: /^##\s*(.+)$/,
  
  // シーンヘッドライン
  h1: /^#\s*(.+)$/,
  h2: /^##\s*(.+)$/,
  h3: /^###\s*(.+)$/,
  
  // セリフ (キャラクター名) - @ で始まる行
  dialogue_character: /^@(.+)$/,
  
  // 終了マーク
  endmark: /^THE END$/i,
  
  // 空行
  empty: /^\s*$/
};

// 文脈依存パース規則
const CONTEXT_RULES = {
  // 登場人物行の後は空行を挟まない限り登場人物行が続く
  afterCharsheadline: (line: string, isEmpty: boolean) => {
    if (isEmpty) return null; // 空行で文脈終了
    return 'character';
  },
  
  // 登場人物行の後に空行を挟んで、見出し・セリフ・エンドマークでない行はコメント
  afterCharacterWithEmptyLine: (line: string) => {
    if (!isHeading(line) && !isDialogue(line) && !isEndmark(line)) {
      return 'comment';
    }
    return null;
  },
  
  // セリフ開始 (@ 行) の後は空行を挟まない限りセリフテキストが続く
  afterDialogueStart: (line: string, isEmpty: boolean) => {
    if (isEmpty) return null; // 空行でセリフ終了
    return 'dialogue_text'; // セリフテキストの継続
  },
  
  // 空行の後に、見出し・セリフ・エンドマークでない行はト書き
  afterEmptyLine: (line: string) => {
    if (!isHeading(line) && !isDialogue(line) && !isEndmark(line)) {
      return 'direction';
    }
    return null;
  },
  
  // エンドマークの後にある行はコメント
  afterEndmark: (line: string) => {
    return 'comment';
  }
};
```

## Error Handling

### パーサーライブラリ

```typescript
export class ParseError extends Error {
  constructor(
    message: string,
    public lineNumber: number,
    public column: number
  ) {
    super(message);
  }
}

export interface ParseResult {
  success: boolean;
  data?: Script;
  errors: ParseError[];
  warnings: string[];
}
```



## Testing Strategy

### パーサーライブラリ

1. **パーサーテスト**
   - 各記法要素のパース機能
   - 日本語文字の処理
   - エラーケースの処理

2. **レンダラーテスト**
   - HTML 出力の正確性
   - 縦書き・横書き変換
   - CSS スタイルの適用

3. **統合テスト**
   - 完全な脚本ファイルのパース→レンダリング
   - 複雑な記法の組み合わせ

4. **テストデータ**
   - 標準的な JFTN 脚本サンプル
   - エッジケース (空行、特殊文字など)
   - HTML 出力の期待値



### テスト環境

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

## 技術スタック

### パーサーライブラリ
- **言語**: TypeScript
- **ビルドツール**: Rollup / esbuild
- **テスト**: Jest
- **リンター**: ESLint + Prettier
- **パッケージマネージャー**: npm
- **公開**: npm registry

### 開発環境
- **CI/CD**: GitHub Actions
- **バージョン管理**: Semantic Versioning
- **ドキュメント**: TypeDoc