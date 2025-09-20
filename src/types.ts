/**
 * Core type definitions for playscript-js
 */

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
  data?: Script;
  errors: ParseError[];
  warnings: string[];
}