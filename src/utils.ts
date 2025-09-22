/**
 * Utility functions for Japanese text processing and normalization
 * Supports JFTN (Japanese Fountain) specific text handling
 */

/**
 * テキスト正規化オプション
 */
export interface NormalizationOptions {
  /** 全角英数字を半角に変換 */
  convertFullwidthAlphanumeric?: boolean;
  /** 半角カタカナを全角に変換 */
  convertHalfwidthKatakana?: boolean;
  /** 連続する空白を単一の空白に変換 */
  normalizeWhitespace?: boolean;
  /** 行末の空白を削除 */
  trimLines?: boolean;
  /** Unicode正規化を適用 */
  unicodeNormalization?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' | false;
}

/**
 * 縦書き変換オプション
 */
export interface VerticalTextOptions {
  /** 数字を縦中横で表示 */
  tateChuYoko?: boolean;
  /** 英字を縦書き用に回転 */
  rotateAlphabet?: boolean;
  /** 記号を縦書き用に変換 */
  convertSymbols?: boolean;
}

/**
 * テキストを正規化する
 */
export function normalizeText(
  text: string,
  options: NormalizationOptions = {}
): string {
  const {
    convertFullwidthAlphanumeric = false,
    convertHalfwidthKatakana = true,
    normalizeWhitespace = true,
    trimLines = true,
    unicodeNormalization = 'NFC',
  } = options;

  let normalized = text;

  // Unicode正規化
  if (unicodeNormalization) {
    normalized = normalized.normalize(unicodeNormalization);
  }

  // 全角英数字を半角に変換
  if (convertFullwidthAlphanumeric) {
    normalized = convertFullwidthToHalfwidth(normalized);
  }

  // 半角カタカナを全角に変換
  if (convertHalfwidthKatakana) {
    normalized = convertHalfwidthKatakanaToFullwidth(normalized);
  }

  // 行末の空白を削除
  if (trimLines) {
    normalized = normalized
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }

  // 空白の正規化（全角スペースも含む）
  if (normalizeWhitespace) {
    normalized = normalized.replace(/[\s\u3000]+/g, ' ');
  }

  return normalized;
}

/**
 * 全角英数字を半角に変換
 */
export function convertFullwidthToHalfwidth(text: string): string {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, char => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });
}

/**
 * 半角カタカナを全角に変換
 */
export function convertHalfwidthKatakanaToFullwidth(text: string): string {
  const halfwidthToFullwidth: { [key: string]: string } = {
    ｱ: 'ア',
    ｲ: 'イ',
    ｳ: 'ウ',
    ｴ: 'エ',
    ｵ: 'オ',
    ｶ: 'カ',
    ｷ: 'キ',
    ｸ: 'ク',
    ｹ: 'ケ',
    ｺ: 'コ',
    ｻ: 'サ',
    ｼ: 'シ',
    ｽ: 'ス',
    ｾ: 'セ',
    ｿ: 'ソ',
    ﾀ: 'タ',
    ﾁ: 'チ',
    ﾂ: 'ツ',
    ﾃ: 'テ',
    ﾄ: 'ト',
    ﾅ: 'ナ',
    ﾆ: 'ニ',
    ﾇ: 'ヌ',
    ﾈ: 'ネ',
    ﾉ: 'ノ',
    ﾊ: 'ハ',
    ﾋ: 'ヒ',
    ﾌ: 'フ',
    ﾍ: 'ヘ',
    ﾎ: 'ホ',
    ﾏ: 'マ',
    ﾐ: 'ミ',
    ﾑ: 'ム',
    ﾒ: 'メ',
    ﾓ: 'モ',
    ﾔ: 'ヤ',
    ﾕ: 'ユ',
    ﾖ: 'ヨ',
    ﾗ: 'ラ',
    ﾘ: 'リ',
    ﾙ: 'ル',
    ﾚ: 'レ',
    ﾛ: 'ロ',
    ﾜ: 'ワ',
    ｦ: 'ヲ',
    ﾝ: 'ン',
    ｧ: 'ァ',
    ｨ: 'ィ',
    ｩ: 'ゥ',
    ｪ: 'ェ',
    ｫ: 'ォ',
    ｬ: 'ャ',
    ｭ: 'ュ',
    ｮ: 'ョ',
    ｯ: 'ッ',
    ｰ: 'ー',
  };

  return text.replace(/[ｱ-ﾝｧ-ｫｬ-ｮｯｰ]/g, char => {
    return halfwidthToFullwidth[char] || char;
  });
}

/**
 * 縦書き用にテキストを変換
 */
export function convertToVerticalText(
  text: string,
  options: VerticalTextOptions = {}
): string {
  const {
    tateChuYoko = true,
    rotateAlphabet = true,
    convertSymbols = true,
  } = options;

  let converted = text;

  // 記号の縦書き変換
  if (convertSymbols) {
    converted = convertSymbolsForVertical(converted);
  }

  // 数字の縦中横処理
  if (tateChuYoko) {
    converted = applyTateChuYoko(converted);
  }

  // 英字の回転処理は最後に実行（HTMLタグを壊さないため）
  if (rotateAlphabet) {
    converted = markAlphabetForRotation(converted);
  }

  return converted;
}

/**
 * 記号を縦書き用に変換
 */
export function convertSymbolsForVertical(text: string): string {
  const symbolMap: { [key: string]: string } = {
    // 括弧類
    '(': '︵',
    ')': '︶',
    '[': '︻',
    ']': '︼',
    '{': '︷',
    '}': '︸',
    '（': '︵',
    '）': '︶',
    '［': '︻',
    '］': '︼',
    '｛': '︷',
    '｝': '︸',

    // ダッシュ類
    '-': '｜',
    '−': '｜',
    '―': '｜',
    '─': '｜',
    '－': '｜',

    // 三点リーダー
    '…': '⋮',
    '‥': '⋰',

    // 半角の感嘆符・疑問符のみ変換（全角は既に縦書き対応済み）
    '!': '︕',
    '?': '︖',
  };

  return text.replace(/[()[\]{}（）［］｛｝\-−―─－…‥!?]/g, char => {
    return symbolMap[char] || char;
  });
}

/**
 * 数字に縦中横を適用
 */
export function applyTateChuYoko(text: string): string {
  // 2桁以下の数字を縦中横でマーク（3桁以上は対象外）
  // シンプルな実装：連続する数字を見つけて、2桁以下なら変換
  return text.replace(/\d+/g, match => {
    if (match.length <= 2) {
      return `<span class="tate-chu-yoko">${match}</span>`;
    }
    return match;
  });
}

/**
 * 英字を回転用にマーク
 */
export function markAlphabetForRotation(text: string): string {
  // HTMLタグが含まれている場合は処理をスキップ
  if (text.includes('<') && text.includes('>')) {
    return text;
  }

  // 通常の英字のみを回転用にマーク
  return text.replace(/\b[A-Za-z]+\b/g, match => {
    return `<span class="rotate-alphabet">${match}</span>`;
  });
}

/**
 * 日本語の文字種を判定
 */
export function getJapaneseCharacterType(
  char: string
): 'hiragana' | 'katakana' | 'kanji' | 'other' {
  const code = char.charCodeAt(0);

  if (code >= 0x3040 && code <= 0x309f) {
    return 'hiragana';
  } else if (code >= 0x30a0 && code <= 0x30ff) {
    return 'katakana';
  } else if (code >= 0x4e00 && code <= 0x9faf) {
    return 'kanji';
  } else {
    return 'other';
  }
}

/**
 * テキストの文字数をカウント（日本語対応）
 */
export function countJapaneseCharacters(text: string): {
  total: number;
  hiragana: number;
  katakana: number;
  kanji: number;
  ascii: number;
  other: number;
} {
  const counts = {
    total: 0,
    hiragana: 0,
    katakana: 0,
    kanji: 0,
    ascii: 0,
    other: 0,
  };

  // サロゲートペアを考慮した文字の反復
  for (const char of text) {
    counts.total++;

    const type = getJapaneseCharacterType(char);
    switch (type) {
      case 'hiragana':
        counts.hiragana++;
        break;
      case 'katakana':
        counts.katakana++;
        break;
      case 'kanji':
        counts.kanji++;
        break;
      default:
        if (/[A-Za-z0-9]/.test(char)) {
          counts.ascii++;
        } else {
          counts.other++;
        }
        break;
    }
  }

  return counts;
}

/**
 * 行の長さを計算（日本語の文字幅を考慮）
 */
export function calculateLineLength(
  text: string,
  options: {
    fullwidthWeight?: number;
    halfwidthWeight?: number;
  } = {}
): number {
  const { fullwidthWeight = 2, halfwidthWeight = 1 } = options;

  let length = 0;
  for (const char of text) {
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF01-\uFF5E]/.test(char)) {
      // 全角文字
      length += fullwidthWeight;
    } else {
      // 半角文字
      length += halfwidthWeight;
    }
  }

  return length;
}

/**
 * テキストを指定した長さで折り返し
 */
export function wrapJapaneseText(
  text: string,
  maxLength: number,
  options: {
    fullwidthWeight?: number;
    halfwidthWeight?: number;
    breakOnPunctuation?: boolean;
  } = {}
): string[] {
  const {
    fullwidthWeight = 2,
    halfwidthWeight = 1,
    breakOnPunctuation = true,
  } = options;

  const lines: string[] = [];
  let currentLine = '';
  let currentLength = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWeight =
      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF01-\uFF5E]/.test(char)
        ? fullwidthWeight
        : halfwidthWeight;

    // 句読点での改行を優先
    if (breakOnPunctuation && /[、。！？]/.test(char)) {
      currentLine += char;
      currentLength += charWeight;

      // 句読点で改行（長さに関係なく）
      lines.push(currentLine);
      currentLine = '';
      currentLength = 0;
    } else if (currentLength + charWeight > maxLength) {
      // 行が長すぎる場合は現在の行を確定して新しい行を開始
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = char;
      currentLength = charWeight;
    } else {
      currentLine += char;
      currentLength += charWeight;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * 日本語の読みやすさを向上させるためのフォーマット
 */
export function formatJapaneseText(
  text: string,
  writingMode: 'horizontal' | 'vertical' = 'horizontal'
): string {
  let formatted = text;

  // 基本的な正規化
  formatted = normalizeText(formatted, {
    convertHalfwidthKatakana: true,
    normalizeWhitespace: true,
    trimLines: true,
  });

  // 縦書きの場合の特別処理
  if (writingMode === 'vertical') {
    formatted = convertToVerticalText(formatted, {
      tateChuYoko: true,
      convertSymbols: true,
    });
  }

  return formatted;
}

/**
 * メタデータからタイトルと作者を抽出
 */
export function extractScriptMetadata(lines: string[]): {
  title: string;
  author: string;
  remainingLines: string[];
} {
  let title = '';
  let author = '';
  const remainingLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // タイトル行
    const titleMatch = /^Title:\s*(.+)$/i.exec(trimmedLine);
    if (titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }

    // 作者行
    const authorMatch = /^Author:\s*(.+)$/i.exec(trimmedLine);
    if (authorMatch) {
      author = authorMatch[1].trim();
      continue;
    }

    // その他の行
    remainingLines.push(line);
  }

  return { title, author, remainingLines };
}

/**
 * 文字列が空白のみかどうかを判定
 */
export function isWhitespaceOnly(text: string): boolean {
  return /^\s*$/.test(text);
}

/**
 * 文字列から先頭と末尾の空白を除去（日本語の全角スペースも含む）
 */
export function trimJapanese(text: string): string {
  return text.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}

/**
 * 日本語テキストの行を分割
 */
export function splitJapaneseLines(text: string): string[] {
  return text.split(/\r?\n/);
}

/**
 * 日本語テキストの単語を分割（簡易版）
 */
export function splitJapaneseWords(text: string): string[] {
  // 簡易的な日本語単語分割
  // より高度な分割には形態素解析ライブラリが必要
  return text.split(/[\s\u3000]+/).filter(word => word.length > 0);
}
