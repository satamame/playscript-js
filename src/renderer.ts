import { PSc, PScLine, PScLineType } from './types';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
  private sceneCounter = 0;
  private readonly __dirname: string;
  private defaultOptions: Required<RenderOptions> = {
    writingMode: 'horizontal',
    fontSize: 16,
    fontFamily:
      '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    lineHeight: 1.8,
    theme: 'light',
    includeCSS: true,
    customCSS: '',
  };

  constructor() {
    // ES moduleで__dirnameを取得
    const __filename = fileURLToPath(import.meta.url);
    this.__dirname = dirname(__filename);
  }

  /**
   * 台本を HTML として レンダリング
   */
  render(script: PSc, options?: RenderOptions): string {
    return this.renderToHTML(script, options);
  }

  /**
   * 台本を完全な HTML ドキュメントとしてレンダリング
   */
  renderToHTML(script: PSc, options?: RenderOptions): string {
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const css = mergedOptions.includeCSS ? this.generateCSS(mergedOptions) : '';
    const body = this.renderBody(script, mergedOptions);

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${script.title || '台本'}</title>
  ${css ? `<style>\n${css}\n</style>` : ''}
</head>
<body>
${body}
</body>
</html>`;
  }

  /**
   * 台本の本体部分をレンダリング
   */
  private renderBody(script: PSc, options: Required<RenderOptions>): string {
    const elements = script.lines.map(line =>
      this.renderElement(line, options)
    );

    return `<div class="script-container" data-writing-mode="${options.writingMode}" data-theme="${options.theme}">
${elements.join('\n')}
</div>`;
  }

  /**
   * 個別の要素をレンダリング
   */
  renderElement(element: PScLine, options?: RenderOptions): string {
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
    };

    switch (element.type) {
      case PScLineType.TITLE:
        return this.renderTitle(element);
      case PScLineType.AUTHOR:
        return this.renderAuthor(element);
      case PScLineType.CHARSHEADLINE:
        return this.renderCharactersHeadline(element);
      case PScLineType.CHARACTER:
        return this.renderCharacter(element);
      case PScLineType.H1:
        return this.renderHeading(element, mergedOptions, 1);
      case PScLineType.H2:
        return this.renderHeading(element, mergedOptions, 2);
      case PScLineType.H3:
        return this.renderHeading(element, mergedOptions, 3);
      case PScLineType.DIALOGUE:
        return this.renderDialogue(element, mergedOptions);
      case PScLineType.DIRECTION:
        return this.renderDirection(element);
      case PScLineType.COMMENT:
        return this.renderComment(element);
      case PScLineType.ENDMARK:
        return this.renderEndmark(element);
      case PScLineType.EMPTY:
        return this.renderEmpty();
      default:
        return `<div class="unknown-element">${this.escapeHtml(element.text || '')}</div>`;
    }
  }

  /**
   * CSS を生成
   */
  generateCSS(options?: RenderOptions): string {
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const baseCSS = this.loadCSSFile('base.css');
    const writingModeCSS = this.loadCSSFile(
      mergedOptions.writingMode === 'vertical'
        ? 'vertical.css'
        : 'horizontal.css'
    );
    const themeCSS = this.loadCSSFile(`theme-${mergedOptions.theme}.css`);
    const customCSS = mergedOptions.customCSS;

    return [baseCSS, writingModeCSS, themeCSS, customCSS]
      .filter(css => css.trim())
      .join('\n\n');
  }

  /**
   * CSSファイルを読み込み
   */
  private loadCSSFile(filename: string): string {
    try {
      // this.__dirname は dist ディレクトリを指すので、そこから styles フォルダを探す
      const cssPath = join(this.__dirname, 'styles', filename);
      const css = readFileSync(cssPath, 'utf-8');
      return css;
    } catch {
      // ファイルが見つからない場合は警告を出すが、処理は続行
      console.warn(
        `CSS file not found: ${filename} (${join(this.__dirname, 'styles', filename)})`
      );
      return '';
    }
  }

  // 個別要素のレンダリングメソッド

  private renderTitle(element: PScLine): string {
    return `<h1 class="script-title">${this.escapeHtml(element.text || '')}</h1>`;
  }

  private renderAuthor(element: PScLine): string {
    return `<div class="script-author">${this.escapeHtml(element.text || '')}</div>`;
  }

  private renderCharactersHeadline(element: PScLine): string {
    return `<h2 class="characters-headline">${this.escapeHtml(element.text || '')}</h2>`;
  }

  private renderCharacter(element: PScLine): string {
    const name = this.escapeHtml(element.name || '');
    const description = this.escapeHtml(element.text || '');

    return `<div class="character">
  <span class="character-name">${name}</span>
  ${description ? `<span class="character-description">${description}</span>` : ''}
</div>`;
  }

  private renderHeading(
    element: PScLine,
    options: Required<RenderOptions>,
    level: number
  ): string {
    // レベル1の見出しに連番を追加
    let text = element.text || '';
    if (level === 1 && options.writingMode === 'vertical') {
      // 既に番号が付いていない場合のみ追加
      if (!text.match(/^\d+[.\-\s]/)) {
        // 簡単な連番実装（実際のプロジェクトではより高度な管理が必要）
        const sceneNumber = this.getSceneNumber();
        text = `${sceneNumber}. ${text}`;
      }
    }
    return `<h${level + 1} class="scene-heading scene-heading-${level}">${this.escapeHtml(text)}</h${level + 1}>`;
  }

  private renderDialogue(
    element: PScLine,
    options: Required<RenderOptions>
  ): string {
    const character = this.escapeHtml(element.name || '');
    let text = this.escapeHtml(element.text || '').replace(/\n/g, '<br>');
    // 縦書きの場合はカギ括弧で括る
    if (options.writingMode === 'vertical') {
      text = `「${text}」`;
    }
    return `<div class="dialogue" data-character="${character}">
  <div class="character-name">${character}</div>
  <div class="dialogue-text">${text}</div>
</div>`;
  }

  private renderDirection(element: PScLine): string {
    const text = this.escapeHtml(element.text || '').replace(/\n/g, '<br>');
    return `<div class="direction">${text}</div>`;
  }

  private renderComment(element: PScLine): string {
    const text = this.escapeHtml(element.text || '').replace(/\n/g, '<br>');
    return `<div class="comment">${text}</div>`;
  }

  private renderEndmark(element: PScLine): string {
    const text = this.escapeHtml(element.text || '');
    return `<div class="endmark">${text}</div>`;
  }

  private renderEmpty(): string {
    return '<div class="empty-line"></div>';
  }

  // ユーティリティメソッド
  private getSceneNumber(): number {
    return ++this.sceneCounter;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
