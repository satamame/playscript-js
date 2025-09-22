/**
 * 日本語処理ユーティリティ関数のテスト
 */

import {
  normalizeText,
  convertFullwidthToHalfwidth,
  convertHalfwidthKatakanaToFullwidth,
  convertToVerticalText,
  convertSymbolsForVertical,
  applyTateChuYoko,
  markAlphabetForRotation,
  getJapaneseCharacterType,
  countJapaneseCharacters,
  calculateLineLength,
  wrapJapaneseText,
  formatJapaneseText,
  extractScriptMetadata,
  isWhitespaceOnly,
  trimJapanese,
  splitJapaneseLines,
  splitJapaneseWords,
} from '../src/utils';
import { containsJapanese } from '../src/rules';

describe('Text Normalization', () => {
  test('should normalize text with default options', () => {
    const input = 'こんにちは　　世界';
    const result = normalizeText(input);
    expect(result).toBe('こんにちは 世界');
  });

  test('should convert fullwidth alphanumeric to halfwidth', () => {
    const input = 'ＡＢＣＤ１２３４';
    const result = normalizeText(input, { convertFullwidthAlphanumeric: true });
    expect(result).toBe('ABCD1234');
  });

  test('should convert halfwidth katakana to fullwidth', () => {
    const input = 'ｱｲｳｴｵ';
    const result = normalizeText(input, { convertHalfwidthKatakana: true });
    expect(result).toBe('アイウエオ');
  });

  test('should normalize whitespace', () => {
    const input = 'こんにちは　　　世界';
    const result = normalizeText(input, { normalizeWhitespace: true });
    expect(result).toBe('こんにちは 世界');
  });

  test('should trim lines', () => {
    const input = '  こんにちは  \n  世界  ';
    const result = normalizeText(input, {
      trimLines: true,
      normalizeWhitespace: false,
    });
    expect(result).toBe('こんにちは\n世界');
  });

  test('should apply Unicode normalization', () => {
    const input = 'が'; // 濁点が分離している場合
    const result = normalizeText(input, { unicodeNormalization: 'NFC' });
    expect(result).toBe('が');
  });
});

describe('Character Conversion', () => {
  test('should convert fullwidth to halfwidth', () => {
    expect(convertFullwidthToHalfwidth('ＡＢＣＤ')).toBe('ABCD');
    expect(convertFullwidthToHalfwidth('１２３４')).toBe('1234');
    expect(convertFullwidthToHalfwidth('ａｂｃｄ')).toBe('abcd');
  });

  test('should convert halfwidth katakana to fullwidth', () => {
    expect(convertHalfwidthKatakanaToFullwidth('ｱｲｳｴｵ')).toBe('アイウエオ');
    expect(convertHalfwidthKatakanaToFullwidth('ｶｷｸｹｺ')).toBe('カキクケコ');
    expect(convertHalfwidthKatakanaToFullwidth('ｻｼｽｾｿ')).toBe('サシスセソ');
    expect(convertHalfwidthKatakanaToFullwidth('ｧｨｩｪｫ')).toBe('ァィゥェォ');
    expect(convertHalfwidthKatakanaToFullwidth('ｰ')).toBe('ー');
  });
});

describe('Vertical Text Conversion', () => {
  test('should convert text for vertical writing', () => {
    const input = 'こんにちは12!?';
    const result = convertToVerticalText(input);
    expect(result).toContain('︕'); // ! → ︕ (半角 → 縦書き用)
    expect(result).toContain('︖'); // ? → ︖ (半角 → 縦書き用)
    expect(result).toContain('<span class="tate-chu-yoko">12</span>');
  });

  test('should convert symbols for vertical writing', () => {
    expect(convertSymbolsForVertical('()')).toBe('︵︶');
    expect(convertSymbolsForVertical('（）')).toBe('︵︶');
    expect(convertSymbolsForVertical('[]')).toBe('︻︼');
    expect(convertSymbolsForVertical('－')).toBe('｜');
    expect(convertSymbolsForVertical('…')).toBe('⋮');
    // 半角の感嘆符・疑問符のみ変換
    expect(convertSymbolsForVertical('!?')).toBe('︕︖');
    // 全角の感嘆符・疑問符は変換しない（既に縦書き対応済み）
    expect(convertSymbolsForVertical('！？')).toBe('！？');
  });

  test('should apply tate-chu-yoko to numbers', () => {
    expect(applyTateChuYoko('1')).toBe('<span class="tate-chu-yoko">1</span>');
    expect(applyTateChuYoko('12')).toBe(
      '<span class="tate-chu-yoko">12</span>'
    );
    expect(applyTateChuYoko('123')).toBe('123'); // 3桁は対象外
    expect(applyTateChuYoko('1と2')).toBe(
      '<span class="tate-chu-yoko">1</span>と<span class="tate-chu-yoko">2</span>'
    );
    expect(applyTateChuYoko('第1章')).toBe(
      '第<span class="tate-chu-yoko">1</span>章'
    );
  });

  test('should mark alphabet for rotation', () => {
    expect(markAlphabetForRotation('ABC')).toBe(
      '<span class="rotate-alphabet">ABC</span>'
    );
    expect(markAlphabetForRotation('Hello World')).toBe(
      '<span class="rotate-alphabet">Hello</span> <span class="rotate-alphabet">World</span>'
    );
  });
});

describe('Japanese Character Analysis', () => {
  test('should identify Japanese character types', () => {
    expect(getJapaneseCharacterType('あ')).toBe('hiragana');
    expect(getJapaneseCharacterType('ア')).toBe('katakana');
    expect(getJapaneseCharacterType('漢')).toBe('kanji');
    expect(getJapaneseCharacterType('A')).toBe('other');
    expect(getJapaneseCharacterType('1')).toBe('other');
  });

  test('should count Japanese characters', () => {
    const result = countJapaneseCharacters('こんにちはアイウエオ漢字ABC123');
    expect(result.total).toBe(18);
    expect(result.hiragana).toBe(5); // こんにちは
    expect(result.katakana).toBe(5); // アイウエオ
    expect(result.kanji).toBe(2); // 漢字
    expect(result.ascii).toBe(6); // ABC123
    expect(result.other).toBe(0);
  });

  test('should calculate line length with Japanese characters', () => {
    expect(calculateLineLength('こんにちは')).toBe(10); // 5文字 × 2
    expect(calculateLineLength('Hello')).toBe(5); // 5文字 × 1
    expect(calculateLineLength('こんにちはHello')).toBe(15); // 5×2 + 5×1
  });

  test('should calculate line length with custom weights', () => {
    const result = calculateLineLength('こんにちはHello', {
      fullwidthWeight: 3,
      halfwidthWeight: 1,
    });
    expect(result).toBe(20); // 5×3 + 5×1
  });
});

describe('Text Wrapping', () => {
  test('should wrap Japanese text', () => {
    const result = wrapJapaneseText('こんにちは世界', 6);
    expect(result).toEqual(['こんに', 'ちは世', '界']);
  });

  test('should wrap text with punctuation breaks', () => {
    const result = wrapJapaneseText('こんにちは、世界。', 12, {
      breakOnPunctuation: true,
    });
    expect(result).toEqual(['こんにちは、', '世界。']);
  });

  test('should wrap mixed Japanese and English text', () => {
    const result = wrapJapaneseText('こんにちはHello', 8);
    expect(result).toEqual(['こんにち', 'はHello']);
  });
});

describe('Text Formatting', () => {
  test('should format Japanese text for horizontal writing', () => {
    const input = 'こんにちは　　世界';
    const result = formatJapaneseText(input, 'horizontal');
    expect(result).toBe('こんにちは 世界');
  });

  test('should format Japanese text with normalization and vertical conversion', () => {
    const input = 'こんにちは　　12！ｱｲｳ'; // 全角スペース + 半角カタカナを含む
    const result = formatJapaneseText(input, 'vertical');
    expect(result).toContain('こんにちは'); // 基本テキスト
    expect(result).toContain('アイウ'); // 半角カタカナが全角に正規化
    expect(result).toContain('<span class="tate-chu-yoko">12</span>'); // 縦中横
    expect(result).toContain('！'); // 全角感嘆符はそのまま
    expect(result).not.toContain('　'); // 全角スペースが正規化される
    expect(result).not.toContain('ｱｲｳ'); // 半角カタカナが変換される
  });
});

describe('Metadata Extraction', () => {
  test('should extract script metadata', () => {
    const lines = [
      'Title: テスト台本',
      'Author: 山田太郎',
      '# シーン1',
      '@太郎',
      'こんにちは',
    ];

    const result = extractScriptMetadata(lines);
    expect(result.title).toBe('テスト台本');
    expect(result.author).toBe('山田太郎');
    expect(result.remainingLines).toEqual(['# シーン1', '@太郎', 'こんにちは']);
  });

  test('should handle missing metadata', () => {
    const lines = ['# シーン1', '@太郎', 'こんにちは'];

    const result = extractScriptMetadata(lines);
    expect(result.title).toBe('');
    expect(result.author).toBe('');
    expect(result.remainingLines).toEqual(lines);
  });
});

describe('Utility Functions', () => {
  test('should detect whitespace-only strings', () => {
    expect(isWhitespaceOnly('')).toBe(true);
    expect(isWhitespaceOnly('   ')).toBe(true);
    expect(isWhitespaceOnly('\t\n')).toBe(true);
    expect(isWhitespaceOnly('text')).toBe(false);
    expect(isWhitespaceOnly(' text ')).toBe(false);
  });

  test('should trim Japanese text including fullwidth spaces', () => {
    expect(trimJapanese('　こんにちは　')).toBe('こんにちは');
    expect(trimJapanese('  こんにちは  ')).toBe('こんにちは');
    expect(trimJapanese('\tこんにちは\n')).toBe('こんにちは');
  });

  test('should split Japanese lines', () => {
    const result = splitJapaneseLines('こんにちは\n世界\r\nテスト');
    expect(result).toEqual(['こんにちは', '世界', 'テスト']);
  });

  test('should split Japanese words', () => {
    const result = splitJapaneseWords('こんにちは　世界　テスト');
    expect(result).toEqual(['こんにちは', '世界', 'テスト']);
  });

  test('should handle empty input in word splitting', () => {
    expect(splitJapaneseWords('')).toEqual([]);
    expect(splitJapaneseWords('   ')).toEqual([]);
  });
});

describe('Edge Cases', () => {
  test('should handle empty strings', () => {
    expect(normalizeText('')).toBe('');
    expect(convertToVerticalText('')).toBe('');
    expect(formatJapaneseText('')).toBe('');
  });

  test('should handle strings with only whitespace', () => {
    expect(normalizeText('   ')).toBe('');
    expect(trimJapanese('　　　')).toBe('');
  });

  test('should handle mixed character types', () => {
    const mixed = 'こんにちはHello123！？';
    expect(containsJapanese(mixed)).toBe(true);

    const counts = countJapaneseCharacters(mixed);
    expect(counts.total).toBe(15);
    expect(counts.hiragana).toBe(5);
    expect(counts.ascii).toBe(8);
  });

  test('should handle Unicode edge cases', () => {
    // 結合文字のテスト - 濁点が分離した形（NFD形式）
    const combined = 'か\u3099'; // か + 濁点（分離形）
    const normalized = normalizeText(combined, { unicodeNormalization: 'NFC' });
    expect(normalized.length).toBe(1); // NFC正規化で1文字になる
    expect(normalized).toBe('が'); // 結合された「が」
  });
});

// 日本語処理の実用的なテストケース
describe('Real-world Japanese Text Processing', () => {
  test('should process typical screenplay dialogue', () => {
    const dialogue = '太郎「こんにちは、花子さん。今日はいい天気ですね！」';
    const formatted = formatJapaneseText(dialogue);
    expect(formatted).toContain('太郎');
    expect(formatted).toContain('こんにちは');
  });

  test('should handle vertical text with mixed content', () => {
    const text = '第1章　太郎の冒険（24年）';
    const vertical = convertToVerticalText(text);
    expect(vertical).toContain('<span class="tate-chu-yoko">1</span>');
    expect(vertical).toContain('<span class="tate-chu-yoko">24</span>');
  });

  test('should wrap long Japanese sentences appropriately', () => {
    const longText =
      'これは非常に長い日本語の文章で、適切に折り返されるべきです。';
    const wrapped = wrapJapaneseText(longText, 20);
    expect(wrapped.length).toBeGreaterThan(1);
    wrapped.forEach(line => {
      expect(calculateLineLength(line)).toBeLessThanOrEqual(20);
    });
  });
});
