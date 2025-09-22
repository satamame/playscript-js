/**
 * JFTN (Japanese Fountain) parsing rules and patterns
 * Based on Japanese screenplay writing conventions
 */

import { PScLineType } from './types';

/**
 * JFTN 記法の正規表現パターン
 * 日本語脚本の慣習に基づいた記法をサポート
 */
export const JFTN_PATTERNS = {
  // メタデータ
  title: /^Title:\s*(.+)$/i,
  author: /^Author:\s*(.+)$/i,

  // 登場人物一覧ヘッドライン
  charsheadline: /^#\s*登場人物\s*$/,

  // 登場人物 (登場人物一覧内)
  character: /^##\s*(.+)$/,

  // シーンヘッドライン
  h1: /^#\s*(.+)$/,
  h2: /^##\s*(.+)$/,
  h3: /^###\s*(.+)$/,

  // セリフ開始 (@ で始まる行)
  dialogueStart: /^@(.+)$/,

  // 終了マーク (行頭に '> ' があれば何でも良い)
  endmark: /^>\s*(.*)$/,

  // 空行
  empty: /^\s*$/,

  // コメント (// で始まる行)
  comment: /^\/\/(.*)$/,

  // 強制的なト書き (() で囲まれた行)
  forcedDirection: /^\((.+)\)$/,

  // 強制的なセリフ ("" で囲まれた行)
  forcedDialogue: /^"(.+)"$/,
} as const;

/**
 * 日本語文字の判定パターン
 */
export const JAPANESE_PATTERNS = {
  // ひらがな
  hiragana: /[\u3040-\u309F]/,

  // カタカナ
  katakana: /[\u30A0-\u30FF]/,

  // 漢字
  kanji: /[\u4E00-\u9FAF]/,

  // 日本語文字全般
  japanese: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,

  // 全角記号
  fullwidthSymbols: /[！-～]/,

  // 全角括弧
  fullwidthBrackets: /[（）「」『』【】]/,

  // 全角句読点
  fullwidthPunctuation: /[、。]/,
} as const;

/**
 * 文脈依存パース状態
 */
export enum ParsingState {
  NORMAL = 'normal',
  IN_CHARACTER_LIST = 'in_character_list',
  AFTER_DIALOGUE_START = 'after_dialogue_start',
  AFTER_EMPTY_LINE = 'after_empty_line',
  AFTER_ENDMARK = 'after_endmark',
}

/**
 * パース文脈情報
 */
export interface ParsingContext {
  state: ParsingState;
  lastLineType: PScLineType | null;
  currentDialogueCharacter: string | null;
  characterList: string[];
  lineNumber: number;
}

/**
 * 文脈依存パース規則
 */
export const CONTEXT_RULES = {
  /**
   * 登場人物一覧内での処理
   */
  inCharacterList: (line: string, isEmpty: boolean): PScLineType | null => {
    if (isEmpty) {
      return null; // 空行で登場人物一覧終了
    }

    // 見出し、セリフ、エンドマークの場合は登場人物一覧終了
    if (isHeading(line) || isDialogueStart(line) || isEndmark(line)) {
      return null;
    }

    return PScLineType.CHARACTER;
  },

  /**
   * セリフ開始後の処理
   */
  afterDialogueStart: (line: string, isEmpty: boolean): PScLineType | null => {
    if (isEmpty) {
      return null; // 空行でセリフ終了
    }

    // 見出し、新しいセリフ、エンドマークの場合はセリフ終了
    if (isHeading(line) || isDialogueStart(line) || isEndmark(line)) {
      return null;
    }

    return PScLineType.DIALOGUE_CONTINUED;
  },

  /**
   * 空行後の処理
   */
  afterEmptyLine: (line: string): PScLineType | null => {
    // 見出し、セリフ、エンドマークの場合はそのまま
    if (isHeading(line) || isDialogueStart(line) || isEndmark(line)) {
      return null;
    }

    // コメントの場合はコメント
    if (isComment(line)) {
      return PScLineType.COMMENT;
    }

    // その他はト書き
    return PScLineType.DIRECTION;
  },

  /**
   * エンドマーク後の処理
   */
  afterEndmark: (line: string): PScLineType | null => {
    // エンドマーク後はすべてコメント
    return PScLineType.COMMENT;
  },
} as const;

/**
 * 行の種類を判定するユーティリティ関数群
 */

/**
 * 見出し行かどうかを判定
 */
export function isHeading(line: string): boolean {
  return (
    JFTN_PATTERNS.h1.test(line) ||
    JFTN_PATTERNS.h2.test(line) ||
    JFTN_PATTERNS.h3.test(line) ||
    JFTN_PATTERNS.charsheadline.test(line)
  );
}

/**
 * セリフ開始行かどうかを判定
 */
export function isDialogueStart(line: string): boolean {
  return JFTN_PATTERNS.dialogueStart.test(line);
}

/**
 * エンドマーク行かどうかを判定
 */
export function isEndmark(line: string): boolean {
  return JFTN_PATTERNS.endmark.test(line);
}

/**
 * コメント行かどうかを判定
 */
export function isComment(line: string): boolean {
  return JFTN_PATTERNS.comment.test(line);
}

/**
 * 空行かどうかを判定
 */
export function isEmpty(line: string): boolean {
  return JFTN_PATTERNS.empty.test(line);
}

/**
 * 日本語文字が含まれているかどうかを判定
 */
export function containsJapanese(text: string): boolean {
  return JAPANESE_PATTERNS.japanese.test(text);
}

/**
 * 全角文字が含まれているかどうかを判定
 */
export function containsFullwidth(text: string): boolean {
  return (
    JAPANESE_PATTERNS.fullwidthSymbols.test(text) ||
    JAPANESE_PATTERNS.fullwidthBrackets.test(text) ||
    JAPANESE_PATTERNS.japanese.test(text)
  );
}

/**
 * 行の種類を特定する
 */
export function identifyLineType(
  line: string,
  context: ParsingContext
): PScLineType | null {
  const trimmedLine = line.trim();

  // 空行
  if (isEmpty(trimmedLine)) {
    return PScLineType.EMPTY;
  }

  // メタデータ
  if (JFTN_PATTERNS.title.test(trimmedLine)) {
    return PScLineType.TITLE;
  }

  if (JFTN_PATTERNS.author.test(trimmedLine)) {
    return PScLineType.AUTHOR;
  }

  // 登場人物一覧ヘッドライン (H1より先に判定)
  if (JFTN_PATTERNS.charsheadline.test(trimmedLine)) {
    return PScLineType.CHARSHEADLINE;
  }

  // シーンヘッドライン
  if (JFTN_PATTERNS.h3.test(trimmedLine)) {
    return PScLineType.H3;
  }
  if (JFTN_PATTERNS.h2.test(trimmedLine)) {
    return PScLineType.H2;
  }
  if (JFTN_PATTERNS.h1.test(trimmedLine)) {
    return PScLineType.H1;
  }

  // セリフ開始
  if (JFTN_PATTERNS.dialogueStart.test(trimmedLine)) {
    return PScLineType.DIALOGUE;
  }

  // エンドマーク
  if (JFTN_PATTERNS.endmark.test(trimmedLine)) {
    return PScLineType.ENDMARK;
  }

  // コメント
  if (JFTN_PATTERNS.comment.test(trimmedLine)) {
    return PScLineType.COMMENT;
  }

  // 文脈依存の判定
  switch (context.state) {
    case ParsingState.IN_CHARACTER_LIST:
      return CONTEXT_RULES.inCharacterList(trimmedLine, false);

    case ParsingState.AFTER_DIALOGUE_START:
      return CONTEXT_RULES.afterDialogueStart(trimmedLine, false);

    case ParsingState.AFTER_EMPTY_LINE:
      return CONTEXT_RULES.afterEmptyLine(trimmedLine);

    case ParsingState.AFTER_ENDMARK:
      return CONTEXT_RULES.afterEndmark(trimmedLine);

    default:
      // 通常状態では、明示的でない行はト書きとして扱う
      return PScLineType.DIRECTION;
  }
}

/**
 * パース文脈を更新する
 */
export function updateParsingContext(
  context: ParsingContext,
  lineType: PScLineType,
  line: string
): ParsingContext {
  const newContext: ParsingContext = {
    ...context,
    lastLineType: lineType,
    lineNumber: context.lineNumber + 1,
  };

  switch (lineType) {
    case PScLineType.CHARSHEADLINE:
      newContext.state = ParsingState.IN_CHARACTER_LIST;
      break;

    case PScLineType.DIALOGUE:
      newContext.state = ParsingState.AFTER_DIALOGUE_START;
      // セリフ開始行から人物名を抽出
      const match = JFTN_PATTERNS.dialogueStart.exec(line.trim());
      if (match) {
        newContext.currentDialogueCharacter = match[1].trim();
        if (
          !newContext.characterList.includes(
            newContext.currentDialogueCharacter
          )
        ) {
          newContext.characterList.push(newContext.currentDialogueCharacter);
        }
      }
      break;

    case PScLineType.EMPTY:
      if (context.state === ParsingState.AFTER_DIALOGUE_START) {
        newContext.state = ParsingState.AFTER_EMPTY_LINE;
        newContext.currentDialogueCharacter = null;
      } else if (context.state === ParsingState.IN_CHARACTER_LIST) {
        newContext.state = ParsingState.NORMAL;
      } else {
        newContext.state = ParsingState.AFTER_EMPTY_LINE;
      }
      break;

    case PScLineType.ENDMARK:
      newContext.state = ParsingState.AFTER_ENDMARK;
      break;

    case PScLineType.H1:
    case PScLineType.H2:
    case PScLineType.H3:
      newContext.state = ParsingState.NORMAL;
      break;

    case PScLineType.CHARACTER:
      // 登場人物一覧内で登場人物を追加
      if (context.state === ParsingState.IN_CHARACTER_LIST) {
        const characterMatch = JFTN_PATTERNS.character.exec(line.trim());
        if (characterMatch) {
          const characterName = characterMatch[1].trim().split(/[:\s]/)[0];
          if (!newContext.characterList.includes(characterName)) {
            newContext.characterList.push(characterName);
          }
        }
      }
      break;

    default:
      // その他の場合は状態を維持
      break;
  }

  return newContext;
}

/**
 * 初期パース文脈を作成
 */
export function createInitialContext(): ParsingContext {
  return {
    state: ParsingState.NORMAL,
    lastLineType: null,
    currentDialogueCharacter: null,
    characterList: [],
    lineNumber: 0,
  };
}

/**
 * テキストから見出しレベルを抽出
 */
export function extractHeadingLevel(line: string): 1 | 2 | 3 | null {
  if (JFTN_PATTERNS.h3.test(line)) return 3;
  if (JFTN_PATTERNS.h2.test(line)) return 2;
  if (JFTN_PATTERNS.h1.test(line)) return 1;
  return null;
}

/**
 * テキストから見出し内容を抽出
 */
export function extractHeadingText(line: string): string {
  const h3Match = JFTN_PATTERNS.h3.exec(line);
  if (h3Match) return h3Match[1].trim();

  const h2Match = JFTN_PATTERNS.h2.exec(line);
  if (h2Match) return h2Match[1].trim();

  const h1Match = JFTN_PATTERNS.h1.exec(line);
  if (h1Match) return h1Match[1].trim();

  return line.trim();
}

/**
 * セリフ開始行から人物名を抽出
 */
export function extractDialogueCharacter(line: string): string | null {
  const match = JFTN_PATTERNS.dialogueStart.exec(line.trim());
  return match ? match[1].trim() : null;
}

/**
 * メタデータ行から値を抽出
 */
export function extractMetadataValue(
  line: string,
  type: 'title' | 'author'
): string | null {
  const pattern = type === 'title' ? JFTN_PATTERNS.title : JFTN_PATTERNS.author;
  const match = pattern.exec(line.trim());
  return match ? match[1].trim() : null;
}
