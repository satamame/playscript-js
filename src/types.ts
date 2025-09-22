/**
 * Core type definitions for playscript-js
 * Compatible with Python playscript package
 */

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
      if (text === undefined || text === null) {
        throw new Error('Argument "text" is required for the other types than EMPTY or CHARACTER.');
      }
    }

    if (name) this.name = name;
    if (text !== undefined) this.text = text;
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
        const parts = text.split(chrDelimiter);
        const name = parts[0];
        const textPart = parts.slice(1).join(' ');
        return new PScLine(lineType, name, textPart || '');
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

  toString(): string {
    const attrs = [PScLineType[this.type]];
    if (this.name) attrs.push(`"${this.name}"`);
    if (this.text) attrs.push(`"${this.text}"`);
    return `PScLine(${attrs.join(', ')})`;
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

  toString(): string {
    return `PSc(title="${this.title}", author="${this.author}", chars=${this.chars.length}, lines=${this.lines.length})`;
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



export class ParseError extends Error {
  constructor(
    message: string,
    public lineNumber: number,
    public column: number = 0
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export interface ParseResult {
  success: boolean;
  data?: PSc;
  errors: ParseError[];
  warnings: string[];
}