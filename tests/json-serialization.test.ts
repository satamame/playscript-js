/**
 * JSON シリアライゼーション機能のテスト
 * Python playscript パッケージとの互換性を確認
 */

import { PScLine, PScLineType, PSc, linesFromTypesAndTexts } from '../src/types';

describe('JSON Serialization', () => {
  describe('PScLine JSON serialization', () => {
    test('should serialize DIALOGUE line to Python-compatible JSON', () => {
      const line = new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは');
      const json = line.toJSON();
      
      expect(json).toEqual({
        class: 'PScLine',
        type: 'DIALOGUE',
        name: '太郎',
        text: 'こんにちは'
      });
    });

    test('should serialize TITLE line to Python-compatible JSON', () => {
      const line = new PScLine(PScLineType.TITLE, undefined, '台本のタイトル');
      const json = line.toJSON();
      
      expect(json).toEqual({
        class: 'PScLine',
        type: 'TITLE',
        text: '台本のタイトル'
      });
    });

    test('should serialize CHARACTER line to Python-compatible JSON', () => {
      const line = new PScLine(PScLineType.CHARACTER, '太郎', '主人公');
      const json = line.toJSON();
      
      expect(json).toEqual({
        class: 'PScLine',
        type: 'CHARACTER',
        name: '太郎',
        text: '主人公'
      });
    });

    test('should serialize EMPTY line to Python-compatible JSON', () => {
      const line = new PScLine(PScLineType.EMPTY);
      const json = line.toJSON();
      
      expect(json).toEqual({
        class: 'PScLine',
        type: 'EMPTY'
      });
    });

    test('should serialize DIRECTION line to Python-compatible JSON', () => {
      const line = new PScLine(PScLineType.DIRECTION, undefined, '太郎が立ち上がる');
      const json = line.toJSON();
      
      expect(json).toEqual({
        class: 'PScLine',
        type: 'DIRECTION',
        text: '太郎が立ち上がる'
      });
    });
  });

  describe('PScLine JSON deserialization', () => {
    test('should deserialize DIALOGUE line from Python-compatible JSON', () => {
      const json = {
        class: 'PScLine',
        type: 'DIALOGUE',
        name: '太郎',
        text: 'こんにちは'
      };
      
      const line = PScLine.fromJSON(json);
      
      expect(line.type).toBe(PScLineType.DIALOGUE);
      expect(line.name).toBe('太郎');
      expect(line.text).toBe('こんにちは');
    });

    test('should deserialize TITLE line from Python-compatible JSON', () => {
      const json = {
        class: 'PScLine',
        type: 'TITLE',
        text: '台本のタイトル'
      };
      
      const line = PScLine.fromJSON(json);
      
      expect(line.type).toBe(PScLineType.TITLE);
      expect(line.name).toBeUndefined();
      expect(line.text).toBe('台本のタイトル');
    });

    test('should deserialize EMPTY line from Python-compatible JSON', () => {
      const json = {
        class: 'PScLine',
        type: 'EMPTY'
      };
      
      const line = PScLine.fromJSON(json);
      
      expect(line.type).toBe(PScLineType.EMPTY);
      expect(line.name).toBeUndefined();
      expect(line.text).toBeUndefined();
    });
  });

  describe('PSc JSON serialization', () => {
    test('should serialize PSc to Python-compatible JSON', () => {
      const script = new PSc({
        title: '台本のタイトル',
        author: '作者名',
        chars: ['太郎', '花子'],
        lines: [
          new PScLine(PScLineType.TITLE, undefined, '台本のタイトル'),
          new PScLine(PScLineType.AUTHOR, undefined, '作者名'),
          new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは'),
          new PScLine(PScLineType.DIALOGUE, '花子', 'こんばんは')
        ]
      });
      
      const json = script.toJSON();
      
      expect(json).toEqual({
        class: 'PSc',
        title: '台本のタイトル',
        author: '作者名',
        chars: ['太郎', '花子'],
        lines: [
          {
            class: 'PScLine',
            type: 'TITLE',
            text: '台本のタイトル'
          },
          {
            class: 'PScLine',
            type: 'AUTHOR',
            text: '作者名'
          },
          {
            class: 'PScLine',
            type: 'DIALOGUE',
            name: '太郎',
            text: 'こんにちは'
          },
          {
            class: 'PScLine',
            type: 'DIALOGUE',
            name: '花子',
            text: 'こんばんは'
          }
        ]
      });
    });

    test('should serialize empty PSc to Python-compatible JSON', () => {
      const script = new PSc();
      const json = script.toJSON();
      
      expect(json).toEqual({
        class: 'PSc',
        title: '',
        author: '',
        chars: [],
        lines: []
      });
    });
  });

  describe('PSc JSON deserialization', () => {
    test('should deserialize PSc from Python-compatible JSON', () => {
      const json = {
        class: 'PSc',
        title: '台本のタイトル',
        author: '作者名',
        chars: ['太郎', '花子'],
        lines: [
          {
            class: 'PScLine',
            type: 'TITLE',
            text: '台本のタイトル'
          },
          {
            class: 'PScLine',
            type: 'DIALOGUE',
            name: '太郎',
            text: 'こんにちは'
          }
        ]
      };
      
      const script = PSc.fromJSON(json);
      
      expect(script.title).toBe('台本のタイトル');
      expect(script.author).toBe('作者名');
      expect(script.chars).toEqual(['太郎', '花子']);
      expect(script.lines).toHaveLength(2);
      
      expect(script.lines[0].type).toBe(PScLineType.TITLE);
      expect(script.lines[0].text).toBe('台本のタイトル');
      
      expect(script.lines[1].type).toBe(PScLineType.DIALOGUE);
      expect(script.lines[1].name).toBe('太郎');
      expect(script.lines[1].text).toBe('こんにちは');
    });

    test('should deserialize PSc with missing fields from JSON', () => {
      const json = {
        class: 'PSc'
      };
      
      const script = PSc.fromJSON(json);
      
      expect(script.title).toBe('');
      expect(script.author).toBe('');
      expect(script.chars).toEqual([]);
      expect(script.lines).toEqual([]);
    });
  });

  describe('Round-trip serialization', () => {
    test('should maintain data integrity through serialize/deserialize cycle', () => {
      const originalScript = new PSc({
        title: '台本のタイトル',
        author: '作者名',
        chars: ['太郎', '花子', '次郎'],
        lines: [
          new PScLine(PScLineType.TITLE, undefined, '台本のタイトル'),
          new PScLine(PScLineType.AUTHOR, undefined, '作者名'),
          new PScLine(PScLineType.CHARSHEADLINE, undefined, '登場人物'),
          new PScLine(PScLineType.CHARACTER, '太郎', '主人公'),
          new PScLine(PScLineType.CHARACTER, '花子', 'ヒロイン'),
          new PScLine(PScLineType.H1, undefined, 'シーン1'),
          new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは'),
          new PScLine(PScLineType.DIALOGUE, '花子', 'こんばんは'),
          new PScLine(PScLineType.DIRECTION, undefined, '太郎が立ち上がる'),
          new PScLine(PScLineType.EMPTY),
          new PScLine(PScLineType.ENDMARK, undefined, 'THE END')
        ]
      });
      
      // Serialize to JSON
      const json = JSON.stringify(originalScript.toJSON());
      
      // Deserialize from JSON
      const restoredScript = PSc.fromJSON(JSON.parse(json));
      
      // Verify all properties are preserved
      expect(restoredScript.title).toBe(originalScript.title);
      expect(restoredScript.author).toBe(originalScript.author);
      expect(restoredScript.chars).toEqual(originalScript.chars);
      expect(restoredScript.lines).toHaveLength(originalScript.lines.length);
      
      // Verify each line is preserved
      for (let i = 0; i < originalScript.lines.length; i++) {
        const original = originalScript.lines[i];
        const restored = restoredScript.lines[i];
        
        expect(restored.type).toBe(original.type);
        expect(restored.name).toBe(original.name);
        expect(restored.text).toBe(original.text);
      }
    });
  });

  describe('linesFromTypesAndTexts utility', () => {
    test('should create PScLine array from types and texts', () => {
      const types = [
        PScLineType.TITLE,
        PScLineType.AUTHOR,
        PScLineType.DIALOGUE,
        PScLineType.DIRECTION
      ];
      const texts = [
        '台本のタイトル',
        '作者名',
        '太郎 こんにちは',
        '太郎が立ち上がる'
      ];
      
      const lines = linesFromTypesAndTexts(types, texts);
      
      expect(lines).toHaveLength(4);
      
      expect(lines[0].type).toBe(PScLineType.TITLE);
      expect(lines[0].text).toBe('台本のタイトル');
      
      expect(lines[1].type).toBe(PScLineType.AUTHOR);
      expect(lines[1].text).toBe('作者名');
      
      expect(lines[2].type).toBe(PScLineType.DIALOGUE);
      expect(lines[2].name).toBe('太郎');
      expect(lines[2].text).toBe('こんにちは');
      
      expect(lines[3].type).toBe(PScLineType.DIRECTION);
      expect(lines[3].text).toBe('太郎が立ち上がる');
    });

    test('should handle mismatched array lengths', () => {
      const types = [PScLineType.TITLE, PScLineType.AUTHOR];
      const texts = ['台本のタイトル'];
      
      const lines = linesFromTypesAndTexts(types, texts);
      
      expect(lines).toHaveLength(1);
      expect(lines[0].type).toBe(PScLineType.TITLE);
      expect(lines[0].text).toBe('台本のタイトル');
    });

    test('should handle empty arrays', () => {
      const lines = linesFromTypesAndTexts([], []);
      expect(lines).toEqual([]);
    });
  });

  describe('Python compatibility examples', () => {
    test('should match Python psc_dumps output format', () => {
      // Python で以下のコードを実行した場合の出力と同じ形式になることを確認
      // psc = PSc(title="テスト", author="作者", chars=["太郎"], 
      //           lines=[PScLine(PScLineType.DIALOGUE, "太郎", "こんにちは")])
      // json_str = psc_dumps(psc)
      
      const script = new PSc({
        title: 'テスト',
        author: '作者',
        chars: ['太郎'],
        lines: [
          new PScLine(PScLineType.DIALOGUE, '太郎', 'こんにちは')
        ]
      });
      
      const jsonStr = JSON.stringify(script.toJSON());
      const parsed = JSON.parse(jsonStr);
      
      expect(parsed.class).toBe('PSc');
      expect(parsed.title).toBe('テスト');
      expect(parsed.author).toBe('作者');
      expect(parsed.chars).toEqual(['太郎']);
      expect(parsed.lines[0].class).toBe('PScLine');
      expect(parsed.lines[0].type).toBe('DIALOGUE');
      expect(parsed.lines[0].name).toBe('太郎');
      expect(parsed.lines[0].text).toBe('こんにちは');
    });

    test('should be able to load Python psc_loads format', () => {
      // Python の psc_loads で読み込める形式のJSONを TypeScript で処理
      const pythonJson = `{
        "class": "PSc",
        "title": "Python からの台本",
        "author": "Python 作者",
        "chars": ["キャラA", "キャラB"],
        "lines": [
          {
            "class": "PScLine",
            "type": "TITLE",
            "text": "Python からの台本"
          },
          {
            "class": "PScLine",
            "type": "DIALOGUE",
            "name": "キャラA",
            "text": "Python から来ました"
          }
        ]
      }`;
      
      const script = PSc.fromJSON(JSON.parse(pythonJson));
      
      expect(script.title).toBe('Python からの台本');
      expect(script.author).toBe('Python 作者');
      expect(script.chars).toEqual(['キャラA', 'キャラB']);
      expect(script.lines).toHaveLength(2);
      expect(script.lines[1].name).toBe('キャラA');
      expect(script.lines[1].text).toBe('Python から来ました');
    });
  });
});