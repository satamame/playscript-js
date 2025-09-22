/**
 * JFTN パース規則のテスト
 */

import {
  JFTN_PATTERNS,
  JAPANESE_PATTERNS,
  ParsingState,
  CONTEXT_RULES,
  isHeading,
  isDialogueStart,
  isEndmark,
  isComment,
  isEmpty,
  containsJapanese,
  containsFullwidth,
  identifyLineType,
  updateParsingContext,
  createInitialContext,
  extractHeadingLevel,
  extractHeadingText,
  extractDialogueCharacter,
  extractMetadataValue,
} from '../src/rules';
import { PScLineType } from '../src/types';

describe('JFTN Patterns', () => {
  describe('JFTN_PATTERNS', () => {
    test('should match title pattern', () => {
      expect(JFTN_PATTERNS.title.test('Title: 台本のタイトル')).toBe(true);
      expect(JFTN_PATTERNS.title.test('title: 小文字でも')).toBe(true);
      expect(JFTN_PATTERNS.title.test('TITLE: 大文字でも')).toBe(true);
      expect(JFTN_PATTERNS.title.test('タイトル: これは違う')).toBe(false);
    });

    test('should match author pattern', () => {
      expect(JFTN_PATTERNS.author.test('Author: 山田太郎')).toBe(true);
      expect(JFTN_PATTERNS.author.test('author: 小文字でも')).toBe(true);
      expect(JFTN_PATTERNS.author.test('AUTHOR: 大文字でも')).toBe(true);
      expect(JFTN_PATTERNS.author.test('作者: これは違う')).toBe(false);
    });

    test('should match characters headline pattern', () => {
      expect(JFTN_PATTERNS.charsheadline.test('# 登場人物')).toBe(true);
      expect(JFTN_PATTERNS.charsheadline.test('#登場人物')).toBe(true);
      expect(JFTN_PATTERNS.charsheadline.test('# 登場人物 ')).toBe(true);
      expect(JFTN_PATTERNS.charsheadline.test('## 登場人物')).toBe(false);
      expect(JFTN_PATTERNS.charsheadline.test('# キャラクター')).toBe(false);
    });

    test('should match heading patterns', () => {
      expect(JFTN_PATTERNS.h1.test('# シーン1')).toBe(true);
      expect(JFTN_PATTERNS.h2.test('## サブシーン')).toBe(true);
      expect(JFTN_PATTERNS.h3.test('### 詳細シーン')).toBe(true);
      expect(JFTN_PATTERNS.h1.test('普通のテキスト')).toBe(false);
    });

    test('should match dialogue start pattern', () => {
      expect(JFTN_PATTERNS.dialogueStart.test('@太郎')).toBe(true);
      expect(JFTN_PATTERNS.dialogueStart.test('@花子さん')).toBe(true);
      expect(JFTN_PATTERNS.dialogueStart.test('@ 太郎')).toBe(true);
      expect(JFTN_PATTERNS.dialogueStart.test('太郎')).toBe(false);
    });

    test('should match endmark pattern', () => {
      expect(JFTN_PATTERNS.endmark.test('THE END')).toBe(true);
      expect(JFTN_PATTERNS.endmark.test('the end')).toBe(true);
      expect(JFTN_PATTERNS.endmark.test('終')).toBe(true);
      expect(JFTN_PATTERNS.endmark.test('おわり')).toBe(true);
      expect(JFTN_PATTERNS.endmark.test('終了')).toBe(false);
    });

    test('should match empty pattern', () => {
      expect(JFTN_PATTERNS.empty.test('')).toBe(true);
      expect(JFTN_PATTERNS.empty.test('   ')).toBe(true);
      expect(JFTN_PATTERNS.empty.test('\t')).toBe(true);
      expect(JFTN_PATTERNS.empty.test('text')).toBe(false);
    });

    test('should match comment pattern', () => {
      expect(JFTN_PATTERNS.comment.test('// これはコメント')).toBe(true);
      expect(JFTN_PATTERNS.comment.test('//')).toBe(true);
      expect(JFTN_PATTERNS.comment.test('/ これは違う')).toBe(false);
    });
  });

  describe('JAPANESE_PATTERNS', () => {
    test('should match hiragana', () => {
      expect(JAPANESE_PATTERNS.hiragana.test('あいうえお')).toBe(true);
      expect(JAPANESE_PATTERNS.hiragana.test('アイウエオ')).toBe(false);
      expect(JAPANESE_PATTERNS.hiragana.test('漢字')).toBe(false);
    });

    test('should match katakana', () => {
      expect(JAPANESE_PATTERNS.katakana.test('アイウエオ')).toBe(true);
      expect(JAPANESE_PATTERNS.katakana.test('あいうえお')).toBe(false);
      expect(JAPANESE_PATTERNS.katakana.test('漢字')).toBe(false);
    });

    test('should match kanji', () => {
      expect(JAPANESE_PATTERNS.kanji.test('漢字')).toBe(true);
      expect(JAPANESE_PATTERNS.kanji.test('あいうえお')).toBe(false);
      expect(JAPANESE_PATTERNS.kanji.test('アイウエオ')).toBe(false);
    });

    test('should match japanese characters', () => {
      expect(JAPANESE_PATTERNS.japanese.test('あいうえお')).toBe(true);
      expect(JAPANESE_PATTERNS.japanese.test('アイウエオ')).toBe(true);
      expect(JAPANESE_PATTERNS.japanese.test('漢字')).toBe(true);
      expect(JAPANESE_PATTERNS.japanese.test('English')).toBe(false);
    });

    test('should match fullwidth symbols', () => {
      expect(JAPANESE_PATTERNS.fullwidthSymbols.test('！？')).toBe(true);
      expect(JAPANESE_PATTERNS.fullwidthSymbols.test('!?')).toBe(false);
    });

    test('should match fullwidth brackets', () => {
      expect(JAPANESE_PATTERNS.fullwidthBrackets.test('（）')).toBe(true);
      expect(JAPANESE_PATTERNS.fullwidthBrackets.test('「」')).toBe(true);
      expect(JAPANESE_PATTERNS.fullwidthBrackets.test('()')).toBe(false);
    });
  });
});

describe('Line Type Detection Functions', () => {
  test('isHeading should detect heading lines', () => {
    expect(isHeading('# シーン1')).toBe(true);
    expect(isHeading('## サブシーン')).toBe(true);
    expect(isHeading('### 詳細シーン')).toBe(true);
    expect(isHeading('# 登場人物')).toBe(true);
    expect(isHeading('普通のテキスト')).toBe(false);
  });

  test('isDialogueStart should detect dialogue start lines', () => {
    expect(isDialogueStart('@太郎')).toBe(true);
    expect(isDialogueStart('@花子さん')).toBe(true);
    expect(isDialogueStart('太郎')).toBe(false);
  });

  test('isEndmark should detect endmark lines', () => {
    expect(isEndmark('THE END')).toBe(true);
    expect(isEndmark('終')).toBe(true);
    expect(isEndmark('おわり')).toBe(true);
    expect(isEndmark('終了')).toBe(false);
  });

  test('isComment should detect comment lines', () => {
    expect(isComment('// コメント')).toBe(true);
    expect(isComment('//')).toBe(true);
    expect(isComment('/ 違う')).toBe(false);
  });

  test('isEmpty should detect empty lines', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty('\t')).toBe(true);
    expect(isEmpty('text')).toBe(false);
  });

  test('containsJapanese should detect Japanese characters', () => {
    expect(containsJapanese('こんにちは')).toBe(true);
    expect(containsJapanese('コンニチハ')).toBe(true);
    expect(containsJapanese('日本語')).toBe(true);
    expect(containsJapanese('Hello')).toBe(false);
    expect(containsJapanese('Hello こんにちは')).toBe(true);
  });

  test('containsFullwidth should detect fullwidth characters', () => {
    expect(containsFullwidth('こんにちは')).toBe(true);
    expect(containsFullwidth('！？')).toBe(true);
    expect(containsFullwidth('（）')).toBe(true);
    expect(containsFullwidth('Hello')).toBe(false);
  });
});

describe('Line Type Identification', () => {
  test('should identify basic line types', () => {
    const context = createInitialContext();

    expect(identifyLineType('', context)).toBe(PScLineType.EMPTY);
    expect(identifyLineType('Title: テスト', context)).toBe(PScLineType.TITLE);
    expect(identifyLineType('Author: 作者', context)).toBe(PScLineType.AUTHOR);
    expect(identifyLineType('# 登場人物', context)).toBe(
      PScLineType.CHARSHEADLINE
    );
    expect(identifyLineType('# シーン1', context)).toBe(PScLineType.H1);
    expect(identifyLineType('## サブシーン', context)).toBe(PScLineType.H2);
    expect(identifyLineType('### 詳細', context)).toBe(PScLineType.H3);
    expect(identifyLineType('@太郎', context)).toBe(PScLineType.DIALOGUE);
    expect(identifyLineType('THE END', context)).toBe(PScLineType.ENDMARK);
    expect(identifyLineType('// コメント', context)).toBe(PScLineType.COMMENT);
  });

  test('should handle context-dependent identification', () => {
    let context = createInitialContext();

    // 通常状態では明示的でない行はト書き
    expect(identifyLineType('太郎が立ち上がる', context)).toBe(
      PScLineType.DIRECTION
    );

    // 登場人物一覧内では登場人物
    context = { ...context, state: ParsingState.IN_CHARACTER_LIST };
    expect(identifyLineType('太郎: 主人公', context)).toBe(
      PScLineType.CHARACTER
    );

    // セリフ開始後はセリフ継続
    context = { ...context, state: ParsingState.AFTER_DIALOGUE_START };
    expect(identifyLineType('こんにちは', context)).toBe(
      PScLineType.DIALOGUE_CONTINUED
    );

    // 空行後はト書き
    context = { ...context, state: ParsingState.AFTER_EMPTY_LINE };
    expect(identifyLineType('太郎が歩く', context)).toBe(PScLineType.DIRECTION);

    // エンドマーク後はコメント
    context = { ...context, state: ParsingState.AFTER_ENDMARK };
    expect(identifyLineType('制作ノート', context)).toBe(PScLineType.COMMENT);
  });
});

describe('Context Management', () => {
  test('should create initial context', () => {
    const context = createInitialContext();

    expect(context.state).toBe(ParsingState.NORMAL);
    expect(context.lastLineType).toBe(null);
    expect(context.currentDialogueCharacter).toBe(null);
    expect(context.characterList).toEqual([]);
    expect(context.lineNumber).toBe(0);
  });

  test('should update context for character headline', () => {
    let context = createInitialContext();
    context = updateParsingContext(
      context,
      PScLineType.CHARSHEADLINE,
      '# 登場人物'
    );

    expect(context.state).toBe(ParsingState.IN_CHARACTER_LIST);
    expect(context.lastLineType).toBe(PScLineType.CHARSHEADLINE);
    expect(context.lineNumber).toBe(1);
  });

  test('should update context for dialogue start', () => {
    let context = createInitialContext();
    context = updateParsingContext(context, PScLineType.DIALOGUE, '@太郎');

    expect(context.state).toBe(ParsingState.AFTER_DIALOGUE_START);
    expect(context.currentDialogueCharacter).toBe('太郎');
    expect(context.characterList).toContain('太郎');
  });

  test('should update context for empty line', () => {
    let context = createInitialContext();
    context = updateParsingContext(context, PScLineType.DIALOGUE, '@太郎');
    context = updateParsingContext(context, PScLineType.EMPTY, '');

    expect(context.state).toBe(ParsingState.AFTER_EMPTY_LINE);
    expect(context.currentDialogueCharacter).toBe(null);
  });

  test('should update context for endmark', () => {
    let context = createInitialContext();
    context = updateParsingContext(context, PScLineType.ENDMARK, 'THE END');

    expect(context.state).toBe(ParsingState.AFTER_ENDMARK);
  });

  test('should track character list', () => {
    let context = createInitialContext();
    context = updateParsingContext(
      context,
      PScLineType.CHARSHEADLINE,
      '# 登場人物'
    );
    context = updateParsingContext(
      context,
      PScLineType.CHARACTER,
      '## 太郎: 主人公'
    );

    expect(context.characterList).toContain('太郎');
  });
});

describe('Text Extraction Functions', () => {
  test('should extract heading level', () => {
    expect(extractHeadingLevel('# シーン1')).toBe(1);
    expect(extractHeadingLevel('## サブシーン')).toBe(2);
    expect(extractHeadingLevel('### 詳細')).toBe(3);
    expect(extractHeadingLevel('普通のテキスト')).toBe(null);
  });

  test('should extract heading text', () => {
    expect(extractHeadingText('# シーン1')).toBe('シーン1');
    expect(extractHeadingText('## サブシーン')).toBe('サブシーン');
    expect(extractHeadingText('### 詳細シーン')).toBe('詳細シーン');
    expect(extractHeadingText('普通のテキスト')).toBe('普通のテキスト');
  });

  test('should extract dialogue character', () => {
    expect(extractDialogueCharacter('@太郎')).toBe('太郎');
    expect(extractDialogueCharacter('@花子さん')).toBe('花子さん');
    expect(extractDialogueCharacter('@ 太郎')).toBe('太郎');
    expect(extractDialogueCharacter('太郎')).toBe(null);
  });

  test('should extract metadata values', () => {
    expect(extractMetadataValue('Title: テスト台本', 'title')).toBe(
      'テスト台本'
    );
    expect(extractMetadataValue('Author: 山田太郎', 'author')).toBe('山田太郎');
    expect(extractMetadataValue('普通のテキスト', 'title')).toBe(null);
  });
});

describe('Context Rules', () => {
  test('should handle character list context', () => {
    expect(CONTEXT_RULES.inCharacterList('太郎: 主人公', false)).toBe(
      PScLineType.CHARACTER
    );
    expect(CONTEXT_RULES.inCharacterList('', true)).toBe(null);
  });

  test('should handle dialogue start context', () => {
    expect(CONTEXT_RULES.afterDialogueStart('こんにちは', false)).toBe(
      PScLineType.DIALOGUE_CONTINUED
    );
    expect(CONTEXT_RULES.afterDialogueStart('', true)).toBe(null);
  });

  test('should handle empty line context', () => {
    expect(CONTEXT_RULES.afterEmptyLine('太郎が歩く')).toBe(
      PScLineType.DIRECTION
    );
    expect(CONTEXT_RULES.afterEmptyLine('// コメント')).toBe(
      PScLineType.COMMENT
    );
    expect(CONTEXT_RULES.afterEmptyLine('@太郎')).toBe(null);
  });

  test('should handle endmark context', () => {
    expect(CONTEXT_RULES.afterEndmark('制作ノート')).toBe(PScLineType.COMMENT);
    expect(CONTEXT_RULES.afterEndmark('何でも')).toBe(PScLineType.COMMENT);
  });
});
