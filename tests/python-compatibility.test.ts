/**
 * Tests for Python playscript package compatibility
 */

import {
  PSc,
  PScLine,
  PScLineType,
  linesFromTypesAndTexts,
} from '../src/types';

describe('Python Compatibility', () => {
  describe('PScLineType', () => {
    it('should have same values as Python PScLineType', () => {
      expect(PScLineType.TITLE).toBe(0);
      expect(PScLineType.AUTHOR).toBe(1);
      expect(PScLineType.CHARSHEADLINE).toBe(2);
      expect(PScLineType.CHARACTER).toBe(3);
      expect(PScLineType.H1).toBe(4);
      expect(PScLineType.H2).toBe(5);
      expect(PScLineType.H3).toBe(6);
      expect(PScLineType.DIRECTION).toBe(7);
      expect(PScLineType.DIALOGUE).toBe(8);
      expect(PScLineType.ENDMARK).toBe(9);
      expect(PScLineType.COMMENT).toBe(10);
      expect(PScLineType.EMPTY).toBe(11);
      expect(PScLineType.CHARACTER_CONTINUED).toBe(12);
      expect(PScLineType.DIRECTION_CONTINUED).toBe(13);
      expect(PScLineType.DIALOGUE_CONTINUED).toBe(14);
      expect(PScLineType.COMMENT_CONTINUED).toBe(15);
    });
  });

  describe('PScLine', () => {
    it('should create basic line types', () => {
      const titleLine = new PScLine(PScLineType.TITLE, undefined, 'タイトル');
      expect(titleLine.type).toBe(PScLineType.TITLE);
      expect(titleLine.text).toBe('タイトル');
      expect(titleLine.name).toBeUndefined();

      const authorLine = new PScLine(PScLineType.AUTHOR, undefined, '作者名');
      expect(authorLine.type).toBe(PScLineType.AUTHOR);
      expect(authorLine.text).toBe('作者名');

      const emptyLine = new PScLine(PScLineType.EMPTY);
      expect(emptyLine.type).toBe(PScLineType.EMPTY);
      expect(emptyLine.text).toBeUndefined();
      expect(emptyLine.name).toBeUndefined();
    });

    it('should create character lines', () => {
      const charLine = new PScLine(PScLineType.CHARACTER, '太郎', '主人公');
      expect(charLine.type).toBe(PScLineType.CHARACTER);
      expect(charLine.name).toBe('太郎');
      expect(charLine.text).toBe('主人公');

      // Character without text
      const charLineNoText = new PScLine(PScLineType.CHARACTER, '花子');
      expect(charLineNoText.name).toBe('花子');
      expect(charLineNoText.text).toBeUndefined();
    });

    it('should create dialogue lines', () => {
      const dialogueLine = new PScLine(
        PScLineType.DIALOGUE,
        '太郎',
        'こんにちは'
      );
      expect(dialogueLine.type).toBe(PScLineType.DIALOGUE);
      expect(dialogueLine.name).toBe('太郎');
      expect(dialogueLine.text).toBe('こんにちは');
    });

    it('should enforce required fields', () => {
      // CHARACTER requires name
      expect(() => new PScLine(PScLineType.CHARACTER)).toThrow(
        'Argument "name" is required'
      );

      // DIALOGUE requires name
      expect(() => new PScLine(PScLineType.DIALOGUE)).toThrow(
        'Argument "name" is required'
      );

      // TITLE requires text
      expect(() => new PScLine(PScLineType.TITLE)).toThrow(
        'Argument "text" is required'
      );
    });

    describe('fromText', () => {
      it('should parse character lines', () => {
        const line1 = PScLine.fromText(PScLineType.CHARACTER, '太郎: 主人公');
        expect(line1.name).toBe('太郎');
        expect(line1.text).toBe('主人公');

        const line2 = PScLine.fromText(PScLineType.CHARACTER, '花子　ヒロイン');
        expect(line2.name).toBe('花子');
        expect(line2.text).toBe('ヒロイン');

        const line3 = PScLine.fromText(PScLineType.CHARACTER, '次郎');
        expect(line3.name).toBe('次郎');
        expect(line3.text).toBe('');
      });

      it('should parse dialogue lines', () => {
        const line1 = PScLine.fromText(
          PScLineType.DIALOGUE,
          '太郎「こんにちは」'
        );
        expect(line1.name).toBe('太郎');
        expect(line1.text).toBe('こんにちは');

        const line2 = PScLine.fromText(PScLineType.DIALOGUE, '花子 おはよう」');
        expect(line2.name).toBe('花子');
        expect(line2.text).toBe('おはよう');

        const line3 = PScLine.fromText(PScLineType.DIALOGUE, '「こんばんは」');
        expect(line3.name).toBe('*'); // default name
        expect(line3.text).toBe('こんばんは');
      });

      it('should parse other line types', () => {
        const titleLine = PScLine.fromText(PScLineType.TITLE, '台本のタイトル');
        expect(titleLine.text).toBe('台本のタイトル');
        expect(titleLine.name).toBeUndefined();

        const directionLine = PScLine.fromText(
          PScLineType.DIRECTION,
          '舞台は学校の教室'
        );
        expect(directionLine.text).toBe('舞台は学校の教室');
      });
    });

    describe('JSON serialization', () => {
      it('should serialize to Python-compatible JSON', () => {
        const line = new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは');
        const json = line.toJSON();

        expect(json).toEqual({
          class: 'PScLine',
          type: 'DIALOGUE',
          name: '太郎',
          text: 'こんにちは',
        });
      });

      it('should deserialize from Python-compatible JSON', () => {
        const json = {
          class: 'PScLine',
          type: 'DIALOGUE',
          name: '太郎',
          text: 'こんにちは',
        };

        const line = PScLine.fromJSON(json);
        expect(line.type).toBe(PScLineType.DIALOGUE);
        expect(line.name).toBe('太郎');
        expect(line.text).toBe('こんにちは');
      });

      it('should handle lines without optional fields', () => {
        const emptyLineJson = {
          class: 'PScLine',
          type: 'EMPTY',
        };

        const line = PScLine.fromJSON(emptyLineJson);
        expect(line.type).toBe(PScLineType.EMPTY);
        expect(line.name).toBeUndefined();
        expect(line.text).toBeUndefined();
      });
    });
  });

  describe('PSc', () => {
    it('should create empty script', () => {
      const script = new PSc();
      expect(script.title).toBe('');
      expect(script.author).toBe('');
      expect(script.chars).toEqual([]);
      expect(script.lines).toEqual([]);
    });

    it('should create script with data', () => {
      const lines = [
        new PScLine(PScLineType.TITLE, undefined, 'テスト台本'),
        new PScLine(PScLineType.AUTHOR, undefined, 'テスト作者'),
        new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは'),
      ];

      const script = new PSc({
        title: 'テスト台本',
        author: 'テスト作者',
        chars: ['太郎', '花子'],
        lines,
      });

      expect(script.title).toBe('テスト台本');
      expect(script.author).toBe('テスト作者');
      expect(script.chars).toEqual(['太郎', '花子']);
      expect(script.lines).toHaveLength(3);
    });

    it('should create from lines', () => {
      const lines = [new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは')];

      const script = PSc.fromLines(lines);
      expect(script.lines).toEqual(lines);
      expect(script.title).toBe('');
      expect(script.author).toBe('');
    });

    describe('JSON serialization', () => {
      it('should serialize to Python-compatible JSON', () => {
        const script = new PSc({
          title: 'テスト台本',
          author: 'テスト作者',
          chars: ['太郎', '花子'],
          lines: [new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは')],
        });

        const json = script.toJSON();
        expect(json).toEqual({
          class: 'PSc',
          title: 'テスト台本',
          author: 'テスト作者',
          chars: ['太郎', '花子'],
          lines: [
            {
              class: 'PScLine',
              type: 'DIALOGUE',
              name: '太郎',
              text: 'こんにちは',
            },
          ],
        });
      });

      it('should deserialize from Python-compatible JSON', () => {
        const json = {
          class: 'PSc',
          title: 'テスト台本',
          author: 'テスト作者',
          chars: ['太郎', '花子'],
          lines: [
            {
              class: 'PScLine',
              type: 'DIALOGUE',
              name: '太郎',
              text: 'こんにちは',
            },
          ],
        };

        const script = PSc.fromJSON(json);
        expect(script.title).toBe('テスト台本');
        expect(script.author).toBe('テスト作者');
        expect(script.chars).toEqual(['太郎', '花子']);
        expect(script.lines).toHaveLength(1);
        expect(script.lines[0].type).toBe(PScLineType.DIALOGUE);
        expect(script.lines[0].name).toBe('太郎');
        expect(script.lines[0].text).toBe('こんにちは');
      });

      it('should handle missing fields with defaults', () => {
        const json = {
          class: 'PSc',
          lines: [],
        };

        const script = PSc.fromJSON(json);
        expect(script.title).toBe('');
        expect(script.author).toBe('');
        expect(script.chars).toEqual([]);
        expect(script.lines).toEqual([]);
      });
    });

    it('should round-trip through JSON', () => {
      const original = new PSc({
        title: 'テスト台本',
        author: 'テスト作者',
        chars: ['太郎', '花子'],
        lines: [
          new PScLine(PScLineType.TITLE, undefined, 'テスト台本'),
          new PScLine(PScLineType.AUTHOR, undefined, 'テスト作者'),
          new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは'),
          new PScLine(PScLineType.DIALOGUE, '花子', 'こんばんは'),
          new PScLine(PScLineType.EMPTY),
        ],
      });

      // Serialize to JSON string (like Python psc_dumps)
      const jsonString = JSON.stringify(original.toJSON());

      // Deserialize from JSON string (like Python psc_loads)
      const restored = PSc.fromJSON(JSON.parse(jsonString));

      expect(restored.title).toBe(original.title);
      expect(restored.author).toBe(original.author);
      expect(restored.chars).toEqual(original.chars);
      expect(restored.lines).toHaveLength(original.lines.length);

      for (let i = 0; i < original.lines.length; i++) {
        expect(restored.lines[i].type).toBe(original.lines[i].type);
        expect(restored.lines[i].name).toBe(original.lines[i].name);
        expect(restored.lines[i].text).toBe(original.lines[i].text);
      }
    });
  });

  describe('linesFromTypesAndTexts', () => {
    it('should create lines from types and texts', () => {
      const types = [
        PScLineType.TITLE,
        PScLineType.AUTHOR,
        PScLineType.DIALOGUE,
      ];
      const texts = ['テスト台本', 'テスト作者', '太郎「こんにちは」'];

      const lines = linesFromTypesAndTexts(types, texts);

      expect(lines).toHaveLength(3);
      expect(lines[0].type).toBe(PScLineType.TITLE);
      expect(lines[0].text).toBe('テスト台本');
      expect(lines[1].type).toBe(PScLineType.AUTHOR);
      expect(lines[1].text).toBe('テスト作者');
      expect(lines[2].type).toBe(PScLineType.DIALOGUE);
      expect(lines[2].name).toBe('太郎');
      expect(lines[2].text).toBe('こんにちは');
    });

    it('should handle mismatched array lengths', () => {
      const types = [PScLineType.TITLE, PScLineType.AUTHOR];
      const texts = ['テスト台本'];

      const lines = linesFromTypesAndTexts(types, texts);
      expect(lines).toHaveLength(1);
    });
  });
});
