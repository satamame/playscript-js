# Design Document

## Overview

台本データを扱うためのライブラリを開発します。主に日本式 Fountain 記法 (.jftn) をサポートし、台本の解析、構造化、HTML レンダリング機能を提供します。このライブラリは再利用可能なnpmパッケージとして公開し、将来的に他の台本フォーマットにも対応できる拡張性を持たせます。

### プロジェクト構成
```
playscript-js/
├── src/
│   ├── index.ts              # メインエクスポート
│   ├── parser.ts             # パーサー実装
│   ├── renderer.ts           # HTML レンダラー
│   ├── pdf/                  # PDF レンダラー
│   │   ├── index.ts          # PDF レンダラーエクスポート
│   │   ├── lightweight.ts    # PDFKit ベース (軽量版)
│   │   └── advanced.ts       # Puppeteer ベース (高機能版)
│   ├── types.ts              # 型定義
│   ├── utils.ts              # ユーティリティ
│   └── rules.ts              # 日本式記法ルール
├── tests/                    # テスト
│   ├── parser.test.ts
│   ├── renderer.test.ts
│   ├── pdf/                  # PDF テスト
│   │   ├── lightweight.test.ts
│   │   └── advanced.test.ts
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
- **LightweightPdfRenderer**: 台本データを PDF に変換 (PDFKit 使用、軽量版)
- **AdvancedPdfRenderer**: 台本データを PDF に変換 (Puppeteer 使用、高機能版)
- **Script**: 汎用的な台本データモデル
- **Types**: 型定義とインターフェース
- **Utils**: 日本語処理ユーティリティ
- **Rules**: JFTN 記法のパース規則

## Components and Interfaces

### 型定義

```typescript
// types.ts - Python PSc/PScLine 互換構造

// Python PScLineType に対応する列挙型
export enum PScLineType {
  TITLE = 0,                   // Title
  AUTHOR = 1,                  // Author name
  CHARSHEADLINE = 2,           // Headline of character list
  CHARACTER = 3,               // Character
  H1 = 4,                      // Headline of scene (level 1)
  H2 = 5,                      // Headline of scene (level 2)
  H3 = 6,                      // Headline of scene (level 3)
  DIRECTION = 7,               // Direction
  DIALOGUE = 8,                // Dialogue
  ENDMARK = 9,                 // End mark
  COMMENT = 10,                // Comment
  EMPTY = 11,                  // Empty line
  CHARACTER_CONTINUED = 12,    // Following lines of Character
  DIRECTION_CONTINUED = 13,    // Following lines of Direction
  DIALOGUE_CONTINUED = 14,     // Following lines of Dialogue
  COMMENT_CONTINUED = 15       // Following lines of Comment
}

// Python PScLine に対応するクラス
export class PScLine {
  public type: PScLineType;
  public name?: string;        // 登場人物行、セリフ行の名前部分
  public text?: string;        // テキスト部分

  constructor(lineType: PScLineType, name?: string, text?: string) {
    this.type = lineType;

    // 登場人物行またはセリフ行なら、name 属性が必須
    if (this.type === PScLineType.CHARACTER || this.type === PScLineType.DIALOGUE) {
      if (!name) {
        throw new Error('Argument "name" is required for type CHARACTER or DIALOGUE.');
      }
    }

    // 空行でも登場人物行でもなければ、text 属性が必須
    if (this.type !== PScLineType.EMPTY && this.type !== PScLineType.CHARACTER) {
      if (!text) {
        throw new Error('Argument "text" is required for the other types than EMPTY or CHARACTER.');
      }
    }

    if (name) this.name = name;
    if (text) this.text = text;
  }

  // Python の from_text メソッドに対応
  static fromText(lineType: PScLineType, text: string, options?: {
    defaultName?: string;
    dlgBrackets?: [string, string];
  }): PScLine {
    const { defaultName = '*', dlgBrackets = ['「', '」'] } = options || {};
    
    text = text.trim();

    if (lineType === PScLineType.CHARACTER) {
      // 名前とテキストを分割
      const chrDelimiter = /[:\s]\s*/;
      if (!chrDelimiter.test(text)) {
        return new PScLine(lineType, text, '');
      } else {
        const [name, ...rest] = text.split(chrDelimiter);
        return new PScLine(lineType, name, rest.join(' '));
      }
    }

    if (lineType === PScLineType.DIALOGUE) {
      let name = '';
      const dlgDelimiter = new RegExp(`\\s*[\\s${dlgBrackets[0]}]`);
      
      if (dlgDelimiter.test(text)) {
        const parts = text.split(dlgDelimiter);
        name = parts[0];
        text = parts.slice(1).join('');
      }

      if (!name) {
        name = defaultName;
      }

      // 閉じ括弧を除去
      if (text.endsWith(dlgBrackets[1])) {
        text = text.slice(0, -1);
      }

      return new PScLine(lineType, name, text);
    }

    return new PScLine(lineType, undefined, text);
  }

  // JSON シリアライゼーション用 (Python 互換)
  toJSON(): any {
    const result: any = { 
      class: 'PScLine',
      type: PScLineType[this.type] // 列挙型の名前を文字列として出力
    };
    if (this.name !== undefined) result.name = this.name;
    if (this.text !== undefined) result.text = this.text;
    return result;
  }

  // JSON デシリアライゼーション用 (Python 互換)
  static fromJSON(json: any): PScLine {
    const lineType = PScLineType[json.type as keyof typeof PScLineType];
    return new PScLine(lineType, json.name, json.text);
  }
}

// Python PSc に対応するクラス
export class PSc {
  public title: string;
  public author: string;
  public chars: string[];      // 登場人物のリスト
  public lines: PScLine[];     // 台本行オブジェクトのリスト

  constructor(options?: {
    title?: string;
    author?: string;
    chars?: string[];
    lines?: PScLine[];
  }) {
    const { title = '', author = '', chars = [], lines = [] } = options || {};
    this.title = title;
    this.author = author;
    this.chars = chars;
    this.lines = Array.from(lines); // イテラブルをリストに変換
  }

  // Python の from_lines メソッドに対応
  static fromLines(lines: PScLine[]): PSc {
    return new PSc({ lines });
  }

  // JSON シリアライゼーション用 (Python 互換)
  toJSON(): any {
    return {
      class: 'PSc',
      title: this.title,
      author: this.author,
      chars: this.chars,
      lines: this.lines.map(line => line.toJSON())
    };
  }

  // JSON デシリアライゼーション用 (Python 互換)
  static fromJSON(json: any): PSc {
    return new PSc({
      title: json.title || '',
      author: json.author || '',
      chars: json.chars || [],
      lines: (json.lines || []).map((lineJson: any) => PScLine.fromJSON(lineJson))
    });
  }
}

// ユーティリティ関数 - Python の lines_from_types_and_texts に対応
export function linesFromTypesAndTexts(lineTypes: PScLineType[], texts: string[]): PScLine[] {
  const lines: PScLine[] = [];
  for (let i = 0; i < Math.min(lineTypes.length, texts.length); i++) {
    const line = PScLine.fromText(lineTypes[i], texts[i]);
    lines.push(line);
  }
  return lines;
}

// 後方互換性のための型エイリアス
export type ElementType = PScLineType;
export type ScriptElement = PScLine;
export type Script = PSc;

// parser.ts
export class JftnParser {
  private context: ParsingContext;
  
  parse(text: string): PSc;
  parseElement(line: string, lineNumber: number, previousElement?: PScLine): PScLine | null;
  parseMetadata(lines: PScLine[]): { title: string; author: string; chars: string[] };
  updateContext(element: PScLine, isEmpty: boolean): void;
}

interface ParsingContext {
  lastElementType: PScLineType | null;
  afterEmptyLine: boolean;
  afterEndmark: boolean;
}
```

### HTML レンダラー

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
  
  render(script: PSc, options?: RenderOptions): string;
  renderToHTML(script: PSc, options?: RenderOptions): string;
  renderElement(element: PScLine): string;
  generateCSS(options?: RenderOptions): string;
  
  // 特定要素のレンダリング
  private renderTitle(element: PScLine): string;
  private renderAuthor(element: PScLine): string;
  private renderHeading(element: PScLine): string;
  private renderCharacter(element: PScLine): string;
  private renderDialogue(element: PScLine): string;
  private renderDirection(element: PScLine): string;
  private renderComment(element: PScLine): string;
  private renderEndmark(element: PScLine): string;
}
```

### PDF レンダラー

```typescript
// pdf/index.ts
export interface PdfRenderOptions {
  pageSize?: 'A4' | 'Letter' | 'B5';
  writingMode?: 'horizontal' | 'vertical';
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  theme?: 'light' | 'dark';
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  header?: {
    enabled: boolean;
    content?: string;
    fontSize?: number;
    color?: string;
  };
  footer?: {
    enabled: boolean;
    showPageNumber: boolean;
    pageNumberFormat?: 'number' | 'japanese' | 'custom';
    customFormat?: string;
    fontSize?: number;
    color?: string;
  };
  pageBreaks?: {
    beforeScene: boolean;
    avoidCharacterSplit: boolean;
    avoidDialogueSplit: boolean;
  };
  customCSS?: string;
}

// 共通インターフェース
export interface PdfRenderer {
  renderToPdf(script: PSc, options?: PdfRenderOptions): Promise<Buffer>;
  renderToPdfFile(script: PSc, filePath: string, options?: PdfRenderOptions): Promise<void>;
}

// 軽量版 PDF レンダラー (PDFKit 使用)
export class LightweightPdfRenderer implements PdfRenderer {
  constructor(options?: PdfRenderOptions);
  
  renderToPdf(script: PSc, options?: PdfRenderOptions): Promise<Buffer>;
  renderToPdfFile(script: PSc, filePath: string, options?: PdfRenderOptions): Promise<void>;
  
  // 内部メソッド
  private createDocument(options?: PdfRenderOptions): PDFDocument;
  private renderElement(doc: PDFDocument, element: PScLine, options?: PdfRenderOptions): void;
  private calculateLayout(script: PSc, options?: PdfRenderOptions): LayoutInfo;
}

// 高機能版 PDF レンダラー (Puppeteer 使用)
export class AdvancedPdfRenderer implements PdfRenderer {
  private puppeteer: any;
  
  constructor(options?: PdfRenderOptions);
  
  renderToPdf(script: PSc, options?: PdfRenderOptions): Promise<Buffer>;
  renderToPdfFile(script: PSc, filePath: string, options?: PdfRenderOptions): Promise<void>;
  
  // 内部メソッド
  private generatePdfHTML(script: PSc, options?: PdfRenderOptions): string;
  private generatePdfCSS(options?: PdfRenderOptions): string;
  private createPuppeteerConfig(options?: PdfRenderOptions): PuppeteerPDFOptions;
  private formatPageNumber(pageNum: number, totalPages: number, format: string): string;
}

// ファクトリー関数
export type PdfRendererType = 'lightweight' | 'advanced';

export function createPdfRenderer(type: PdfRendererType = 'lightweight'): PdfRenderer {
  if (type === 'advanced') {
    return new AdvancedPdfRenderer();
  }
  return new LightweightPdfRenderer();
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
セリフは PScLine として処理され、Python の構造と同じ「name」と「text」の属性を持つ:

1. **パース処理**:
   - 空行に続く@で始まる行がセリフの開始
   - 例: `@太郎`
   - その後、空行が現れるまでの行がセリフのテキスト
   - 例: `こんにちは。`

2. **PScLine 構造**:
   - `type`: `PScLineType.DIALOGUE`
   - `name`: 人物名 (@ マークなし)
   - `text`: セリフのテキスト部分 (複数行の場合は結合)

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
  new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは。\n今日はいい天気ですね。'),
  new PScLine(PScLineType.DIALOGUE, '花子', 'そうですね。\n散歩日和です。')
]
```

#### JSON 互換性

Python の PSc/PScLine と JSON を介して完全に互換:

```typescript
// TypeScript → JSON → Python
const script = new PSc({ 
  title: '台本', 
  lines: [
    new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは')
  ] 
});
const json = JSON.stringify(script.toJSON());
// Python で psc_loads(json) で復元可能

// Python → JSON → TypeScript  
const pythonJson = `{
  "class": "PSc",
  "title": "台本",
  "author": "作者",
  "chars": ["太郎", "花子"],
  "lines": [
    {
      "class": "PScLine",
      "type": "DIALOGUE",
      "name": "太郎",
      "text": "こんにちは"
    }
  ]
}`;
const script = PSc.fromJSON(JSON.parse(pythonJson));
```

#### Python 互換 JSON 形式

Python の JSON エンコーダと同じ形式:

**PScLine の JSON 形式:**
```json
{
  "class": "PScLine",
  "type": "DIALOGUE",
  "name": "太郎",
  "text": "こんにちは"
}
```

**PSc の JSON 形式:**
```json
{
  "class": "PSc", 
  "title": "台本のタイトル",
  "author": "作者名",
  "chars": ["太郎", "花子"],
  "lines": [...]
}
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
    return PScLineType.CHARACTER;
  },
  
  // 登場人物行の後に空行を挟んで、見出し・セリフ・エンドマークでない行はコメント
  afterCharacterWithEmptyLine: (line: string) => {
    if (!isHeading(line) && !isDialogue(line) && !isEndmark(line)) {
      return PScLineType.COMMENT;
    }
    return null;
  },
  
  // セリフ開始 (@ 行) の後は空行を挟まない限りセリフテキストが続く
  afterDialogueStart: (line: string, isEmpty: boolean) => {
    if (isEmpty) return null; // 空行でセリフ終了
    return PScLineType.DIALOGUE_CONTINUED; // セリフテキストの継続
  },
  
  // 空行の後に、見出し・セリフ・エンドマークでない行はト書き
  afterEmptyLine: (line: string) => {
    if (!isHeading(line) && !isDialogue(line) && !isEndmark(line)) {
      return PScLineType.DIRECTION;
    }
    return null;
  },
  
  // エンドマークの後にある行はコメント
  afterEndmark: (line: string) => {
    return PScLineType.COMMENT;
  }
};
```

## PDF レンダリング仕様

### 実装アプローチ

PDF レンダラーは2つの実装を提供します:

#### 軽量版 (LightweightPdfRenderer)
- **ライブラリ**: PDFKit (~2MB)
- **特徴**: 軽量、基本機能、横書き中心
- **対応機能**: 基本レイアウト、日本語フォント、ページ番号
- **制限**: 縦書き対応は限定的、高度な組版機能なし

#### 高機能版 (AdvancedPdfRenderer)
- **ライブラリ**: Puppeteer (~300MB、オプショナル依存)
- **特徴**: 高機能、完全な縦書き対応、高度な組版
- **対応機能**: HTML/CSS ベースの完全なレイアウト制御
- **制限**: パッケージサイズが大きい

### パッケージ設計

```json
{
  "name": "playscript-js",
  "dependencies": {
    "pdfkit": "^0.13.0"
  },
  "optionalDependencies": {
    "puppeteer": "^21.0.0"
  },
  "peerDependencies": {
    "puppeteer": "^21.0.0"
  },
  "peerDependenciesMeta": {
    "puppeteer": {
      "optional": true
    }
  }
}
```

### 使用例

```typescript
import { createPdfRenderer, PSc, PScLine, PScLineType } from 'playscript-js';

// Python 互換の台本データ作成
const script = new PSc({
  title: '台本のタイトル',
  author: '作者名',
  lines: [
    new PScLine(PScLineType.TITLE, undefined, '台本のタイトル'),
    new PScLine(PScLineType.AUTHOR, undefined, '作者名'),
    new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは'),
    // ...
  ]
});

// 軽量版 (常に利用可能)
const lightRenderer = createPdfRenderer('lightweight');
const pdfBuffer = await lightRenderer.renderToPdf(script);

// 高機能版 (Puppeteer が必要)
try {
  const advancedRenderer = createPdfRenderer('advanced');
  const pdfBuffer = await advancedRenderer.renderToPdf(script, {
    writingMode: 'vertical'
  });
} catch (error) {
  console.log('Advanced PDF features require puppeteer. Install with: npm install puppeteer');
  // 軽量版にフォールバック
}

// JSON 互換性 (Python の psc_dumps/psc_loads と互換)
const json = JSON.stringify(script.toJSON());
const restoredScript = PSc.fromJSON(JSON.parse(json));

// Python との相互運用例
// Python: psc_dumps(psc_obj) → TypeScript: PSc.fromJSON(JSON.parse(json))
// TypeScript: JSON.stringify(psc.toJSON()) → Python: psc_loads(json)
```

### 軽量版レイアウト (PDFKit)

```typescript
// pdf/lightweight.ts
export class LightweightPdfRenderer implements PdfRenderer {
  private renderVerticalText(doc: PDFDocument, text: string, x: number, y: number): void {
    // 文字単位での縦書き配置
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charY = y + (i * this.fontSize);
      
      // 句読点のぶら下げ処理
      if (this.isPunctuation(char) && this.isLineEnd(charY)) {
        // 簡易ぶら下げ処理
        charY += this.fontSize * 0.5;
      }
      
      doc.text(char, x, charY, { width: this.fontSize, align: 'center' });
    }
  }

  private calculateVerticalLayout(script: PSc): LayoutInfo {
    // 縦書きレイアウトの座標計算
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const lineSpacing = this.fontSize + this.lineSpacing;
    
    return {
      maxLines: Math.floor((pageWidth - this.margins.left - this.margins.right) / lineSpacing),
      maxCharsPerLine: Math.floor((pageHeight - this.margins.top - this.margins.bottom) / this.fontSize)
    };
  }
}
```

### 高機能版レイアウト (Puppeteer)

```typescript
// pdf/advanced.ts - PDF 専用の CSS テンプレート
const PDF_CSS_TEMPLATE = `
@page {
  size: {{pageSize}};
  margin: {{margins.top}}mm {{margins.right}}mm {{margins.bottom}}mm {{margins.left}}mm;
  
  {{#if header.enabled}}
  @top-center {
    content: "{{header.content}}";
    font-family: {{fontFamily}};
    font-size: {{header.fontSize}}px;
    color: {{header.color}};
  }
  {{/if}}
  
  {{#if footer.enabled}}
  @bottom-center {
    content: {{#if footer.showPageNumber}}"{{footer.customFormat}}"{{/if}};
    font-family: {{fontFamily}};
    font-size: {{footer.fontSize}}px;
    color: {{footer.color}};
  }
  {{/if}}
}

/* 改ページ制御 */
{{#if pageBreaks.beforeScene}}
.scene-heading {
  page-break-before: always;
}
{{/if}}

{{#if pageBreaks.avoidCharacterSplit}}
.character-name {
  page-break-after: avoid;
}
{{/if}}

{{#if pageBreaks.avoidDialogueSplit}}
.dialogue-block {
  page-break-inside: avoid;
}
{{/if}}

/* 縦書き対応 */
{{#if writingMode.vertical}}
body {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.page-number {
  writing-mode: horizontal-tb;
}
{{/if}}
`;
```

### ページ番号フォーマット

```typescript
// ページ番号のフォーマット種類
export type PageNumberFormat = 
  | 'number'     // 1, 2, 3...
  | 'japanese'   // 一, 二, 三...
  | 'dash'       // - 1 -, - 2 -...
  | 'custom';    // ユーザー定義

// フォーマット実装例
private formatPageNumber(pageNum: number, totalPages: number, format: PageNumberFormat, customFormat?: string): string {
  switch (format) {
    case 'number':
      return `${pageNum}`;
    case 'japanese':
      return this.toJapaneseNumber(pageNum);
    case 'dash':
      return `- ${pageNum} -`;
    case 'custom':
      return customFormat
        ?.replace('{{page}}', pageNum.toString())
        ?.replace('{{total}}', totalPages.toString()) || `${pageNum}`;
    default:
      return `${pageNum}`;
  }
}

private toJapaneseNumber(num: number): string {
  const japanese = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (num < 10) return japanese[num];
  // 10以上の場合の実装...
  return num.toString();
}
```

### 高機能版設定 (Puppeteer)

```typescript
// pdf/advanced.ts
export class AdvancedPdfRenderer implements PdfRenderer {
  constructor(options?: PdfRenderOptions) {
    try {
      this.puppeteer = require('puppeteer');
    } catch (error) {
      throw new Error(
        'Advanced PDF features require puppeteer. Install with: npm install puppeteer'
      );
    }
  }

  private createPuppeteerConfig(options: PdfRenderOptions): PuppeteerPDFOptions {
    return {
      format: options.pageSize || 'A4',
      printBackground: true,
      displayHeaderFooter: options.header?.enabled || options.footer?.enabled,
      headerTemplate: options.header?.enabled ? this.generateHeaderTemplate(options.header) : '',
      footerTemplate: options.footer?.enabled ? this.generateFooterTemplate(options.footer) : '',
      margin: {
        top: `${options.margins?.top || 25}mm`,
        bottom: `${options.margins?.bottom || 25}mm`,
        left: `${options.margins?.left || 20}mm`,
        right: `${options.margins?.right || 20}mm`
      },
      preferCSSPageSize: true
    };
  }

  async renderToPdf(script: PSc, options?: PdfRenderOptions): Promise<Buffer> {
    const browser = await this.puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const html = this.generatePdfHTML(script, options);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf(this.createPuppeteerConfig(options));
      
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }
}
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

### PDF レンダラーエラー

```typescript
export class PdfRenderError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'PdfRenderError';
  }
}

export interface PdfRenderResult {
  success: boolean;
  data?: Buffer;
  error?: PdfRenderError;
  warnings: string[];
}



## Testing Strategy

### パーサーライブラリ

1. **パーサーテスト**
   - 各記法要素のパース機能
   - 日本語文字の処理
   - エラーケースの処理

2. **HTML レンダラーテスト**
   - HTML 出力の正確性
   - 縦書き・横書き変換
   - CSS スタイルの適用

3. **PDF レンダラーテスト**
   - PDF 生成の正確性
   - ページ番号の表示
   - 改ページ制御
   - ヘッダー・フッターの表示
   - 縦書き PDF の生成

4. **統合テスト**
   - 完全な脚本ファイルのパース→HTML レンダリング
   - 完全な脚本ファイルのパース→PDF 生成
   - 複雑な記法の組み合わせ

5. **テストデータ**
   - 標準的な JFTN 脚本サンプル
   - エッジケース (空行、特殊文字など)
   - HTML 出力の期待値
   - PDF 出力のビジュアル回帰テスト



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

### PDF 生成
- **軽量版**: PDFKit (~2MB、必須依存)
- **高機能版**: Puppeteer (~300MB、オプショナル依存)

### 開発環境
- **CI/CD**: GitHub Actions
- **バージョン管理**: Semantic Versioning
- **ドキュメント**: TypeDoc

### パッケージサイズ
- **基本パッケージ**: ~2-3MB (PDFKit 含む)
- **高機能版追加時**: ~300MB (Puppeteer 追加時のみ)
- **HTML のみ使用**: ~1MB (PDF 機能を使わない場合)