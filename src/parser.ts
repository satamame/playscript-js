import { PSc, PScLine, PScLineType, ParseResult, ParseError } from './types';

interface ParsingOptions {
  includeEmptyLines?: boolean;
}

interface ParsingContext {
  lastElementType: PScLineType | null;
  afterEmptyLine: boolean;
  afterEndmark: boolean;
  inCharacterList: boolean;
  inDialogue: boolean;
  currentDialogueCharacter: string | null;
  dialogueLines: string[];
}

export class JftnParser {
  private context: ParsingContext;
  private options: ParsingOptions;

  constructor(options: ParsingOptions = {}) {
    this.context = {
      lastElementType: null,
      afterEmptyLine: false,
      afterEndmark: false,
      inCharacterList: false,
      inDialogue: false,
      currentDialogueCharacter: null,
      dialogueLines: [],
    };
    this.options = {
      includeEmptyLines: false, // デフォルトでは空行を含めない
      ...options,
    };
  }

  parse(text: string): ParseResult {
    try {
      const lines = text.split(/\r?\n/);
      const pscLines: PScLine[] = [];
      const errors: ParseError[] = [];
      const warnings: ParseError[] = [];

      // 各行をパース
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        try {
          // 次の行を先読み (空行処理のため)
          const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
          const elements = this.parseElement(line, nextLine);
          let lastElementType: PScLineType | undefined;

          if (elements) {
            if (Array.isArray(elements)) {
              pscLines.push(...elements);
              // 配列の場合は最後の要素のタイプを記録
              lastElementType = elements[elements.length - 1]?.type;
            } else {
              pscLines.push(elements);
              lastElementType = elements.type;
            }
          }

          // 空行の場合でもコンテキストは更新する
          this.updateContext(line.trim() === '', lastElementType);
        } catch (error) {
          const parseError =
            error instanceof ParseError
              ? error
              : new ParseError(String(error), lineNumber);
          errors.push(parseError);
        }
      }

      // 最後にセリフが残っている場合は出力
      const finalDialogue = this.finalizePendingDialogue();
      if (finalDialogue) {
        pscLines.push(finalDialogue);
      }

      // メタデータを抽出
      const metadata = this.parseMetadata(pscLines);

      // PSc オブジェクトを作成
      const script = new PSc({
        title: metadata.title,
        author: metadata.author,
        chars: metadata.chars,
        lines: pscLines,
      });

      return {
        success: errors.length === 0,
        data: script,
        errors,
        warnings: warnings.map(w => w.message),
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          error instanceof ParseError
            ? error
            : new ParseError(String(error), 0),
        ],
        warnings: [],
      };
    }
  }

  parseElement(
    line: string,
    nextLine?: string | null
  ): PScLine | PScLine[] | null {
    const trimmedLine = line.trim();

    // 空行
    if (trimmedLine === '') {
      // セリフ中の場合は終了させる
      const pendingDialogue = this.finalizePendingDialogue();

      // 空行を含める場合の条件判定
      let shouldIncludeEmptyLine = false;
      if (this.options.includeEmptyLines) {
        // 前の行がト書きまたはコメント行で、かつ次の行もト書きまたはコメント行の場合のみ空行を含める
        const prevIsDirectionOrComment =
          this.context.lastElementType === PScLineType.DIRECTION ||
          this.context.lastElementType === PScLineType.COMMENT;

        const nextIsDirectionOrComment =
          typeof nextLine === 'string' &&
          this.isDirectionOrComment(nextLine.trim());

        shouldIncludeEmptyLine =
          prevIsDirectionOrComment && nextIsDirectionOrComment;
      }

      const emptyLine = shouldIncludeEmptyLine
        ? new PScLine(PScLineType.EMPTY)
        : null;

      if (pendingDialogue && emptyLine) {
        return [pendingDialogue, emptyLine];
      } else if (pendingDialogue) {
        return pendingDialogue;
      } else {
        return emptyLine;
      }
    }

    // タイトル行
    const titleMatch = /^Title:\s*(.+)$/i.exec(trimmedLine);
    if (titleMatch) {
      return new PScLine(PScLineType.TITLE, undefined, titleMatch[1].trim());
    }

    // 作者行
    const authorMatch = /^Author:\s*(.+)$/i.exec(trimmedLine);
    if (authorMatch) {
      return new PScLine(PScLineType.AUTHOR, undefined, authorMatch[1].trim());
    }

    // 登場人物見出し
    if (/^#\s*登場人物\s*$/.test(trimmedLine)) {
      // 登場人物一覧モードに入る
      this.context.inCharacterList = true;
      return new PScLine(PScLineType.CHARSHEADLINE, undefined, '登場人物');
    }

    // 見出し (# で始まる行)
    const headingMatch = /^(#{1,3})\s*(.+)$/.exec(trimmedLine);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const type =
        level === 1
          ? PScLineType.H1
          : level === 2
            ? PScLineType.H2
            : PScLineType.H3;

      // 前のセリフがあれば完了させる
      const previousDialogue = this.finalizePendingDialogue();

      // 登場人物一覧モードを終了
      this.context.inCharacterList = false;

      const heading = new PScLine(type, undefined, text);

      if (previousDialogue) {
        return [previousDialogue, heading];
      } else {
        return heading;
      }
    }

    // セリフ (@人物名 で始まる行)
    const dialogueMatch = /^@([^@\s]+)\s*(.*)$/.exec(trimmedLine);
    if (dialogueMatch) {
      const character = dialogueMatch[1];
      const text = dialogueMatch[2].trim();

      // 前のセリフがあれば完了させる
      const previousDialogue = this.finalizePendingDialogue();

      // 登場人物一覧モードを終了
      this.context.inCharacterList = false;

      // 新しいセリフを開始
      this.context.inDialogue = true;
      this.context.currentDialogueCharacter = character;
      this.context.dialogueLines = text ? [text] : [];

      return previousDialogue;
    }

    // 登場人物 (登場人物一覧内で @ や # で始まらない場合)
    if (
      this.context.inCharacterList &&
      !trimmedLine.startsWith('@') &&
      !trimmedLine.startsWith('#')
    ) {
      // 人物名と説明を分離 (コロンで区切られている場合)
      const charMatch = /^([^:：]+)[：:]?\s*(.*)$/.exec(trimmedLine);
      if (charMatch) {
        const name = charMatch[1].trim();
        const description = charMatch[2].trim();
        return new PScLine(PScLineType.CHARACTER, name, description);
      }
    }

    // エンドマーク (行頭に '> ' があれば何でも良い)
    if (/^>\s*(.*)$/.test(trimmedLine)) {
      const match = /^>\s*(.*)$/.exec(trimmedLine);

      // 前のセリフがあれば完了させる
      const previousDialogue = this.finalizePendingDialogue();

      // 登場人物一覧モードを終了
      this.context.inCharacterList = false;

      const endmark = new PScLine(
        PScLineType.ENDMARK,
        undefined,
        match ? match[1] : ''
      );

      if (previousDialogue) {
        return [previousDialogue, endmark];
      } else {
        return endmark;
      }
    }

    // コメント (// で始まる行)
    if (trimmedLine.startsWith('//')) {
      // 登場人物一覧モードを終了
      this.context.inCharacterList = false;

      return new PScLine(
        PScLineType.COMMENT,
        undefined,
        trimmedLine.substring(2).trim()
      );
    }

    // セリフの継続 (セリフ開始後の行で、@ や # で始まらない場合)
    if (
      this.context.inDialogue &&
      !trimmedLine.startsWith('@') &&
      !trimmedLine.startsWith('#') &&
      !trimmedLine.startsWith('>') &&
      !trimmedLine.startsWith('//')
    ) {
      // セリフ行を蓄積
      this.context.dialogueLines.push(trimmedLine);
      return null;
    }

    // その他はト書きとして扱う
    return new PScLine(PScLineType.DIRECTION, undefined, trimmedLine);
  }

  finalizePendingDialogue(): PScLine | null {
    if (
      this.context.inDialogue &&
      this.context.currentDialogueCharacter &&
      this.context.dialogueLines.length > 0
    ) {
      const dialogueText = this.context.dialogueLines.join('\n');
      const dialogue = new PScLine(
        PScLineType.DIALOGUE,
        this.context.currentDialogueCharacter,
        dialogueText
      );

      // セリフ状態をリセット
      this.context.inDialogue = false;
      this.context.currentDialogueCharacter = null;
      this.context.dialogueLines = [];

      return dialogue;
    }
    return null;
  }

  parseMetadata(lines: PScLine[]): {
    title: string;
    author: string;
    chars: string[];
  } {
    let title = '';
    let author = '';
    const chars: string[] = [];

    for (const line of lines) {
      switch (line.type) {
        case PScLineType.TITLE:
          if (!title && line.text) {
            title = line.text;
          }
          break;
        case PScLineType.AUTHOR:
          if (!author && line.text) {
            author = line.text;
          }
          break;
        case PScLineType.DIALOGUE:
          // セリフ行の name 属性から登場人物を抽出
          if (line.name && !chars.includes(line.name)) {
            chars.push(line.name);
          }
          break;
      }
    }

    return { title, author, chars };
  }

  updateContext(isEmpty: boolean, elementType?: PScLineType): void {
    this.context.afterEmptyLine = isEmpty;

    // 要素タイプを記録 (空行以外の場合)
    if (!isEmpty && elementType) {
      this.context.lastElementType = elementType;
    }

    // 空行でセリフ終了
    if (isEmpty && this.context.inDialogue) {
      // セリフ終了はfinalizePendingDialogueで処理されるので、ここではフラグのみ設定
      // 実際の終了処理は次の非セリフ要素で行われる
    }
  }

  private isDirectionOrComment(line: string): boolean {
    if (!line) return false;

    // コメント行
    if (line.startsWith('//')) {
      return true;
    }

    // 以下の場合はト書きではない
    if (line.startsWith('Title:') || line.startsWith('Author:')) return false;
    if (line.startsWith('#')) return false;
    if (line.startsWith('@')) return false;
    if (line.startsWith('>')) return false;

    // 登場人物一覧内の場合は、登場人物行かもしれないのでト書きではない
    if (this.context.inCharacterList) return false;

    // その他はト書きとして扱う
    return true;
  }
}
