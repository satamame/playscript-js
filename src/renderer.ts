import { PSc, PScLine, PScLineType } from './types';
import { readFileSync } from 'fs';
import { join, dirname, isAbsolute } from 'path';
import { fileURLToPath } from 'url';

export type CSSSource = 'default' | { css: string } | { file: string };

export interface RenderOptions {
  writingMode?: 'horizontal' | 'vertical';
  cssSource?: CSSSource | CSSSource[];
  includeCSS?: boolean;
  dialogueBrackets?: boolean;
  sceneNumbers?: boolean;
}

export class ScriptRenderer {
  private sceneCounter = 0;
  private readonly __dirname: string;
  private defaultOptions: Required<RenderOptions> = {
    writingMode: 'horizontal',
    cssSource: 'default',
    includeCSS: true,
    dialogueBrackets: false,
    sceneNumbers: false,
  };

  constructor() {
    // ES module で __dirname を取得
    const __filename = fileURLToPath(import.meta.url);
    this.__dirname = dirname(__filename);
  }

  /**
   * 台本を HTML としてレンダリング
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

    return [
      '<!DOCTYPE html>',
      '<html lang="ja">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `  <title>${script.title || '台本'}</title>`,
      css ? `  <style>\n${css}\n  </style>` : '',
      '</head>',
      '<body>',
      body,
      '</body>',
      '</html>',
    ].filter(Boolean).join('\n');
  }

  /**
   * 台本の本体部分をレンダリング
   */
  private renderBody(script: PSc, options: Required<RenderOptions>): string {
    const elements = script.lines.map(line =>
      this.renderElement(line, options)
    );

    return [
      `<div class="script-container" data-writing-mode="${options.writingMode}">`,
      elements.join('\n'),
      '</div>',
    ].join('\n');
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
    const mergedOptions = { ...this.defaultOptions, ...options };
    const sources = Array.isArray(mergedOptions.cssSource)
      ? mergedOptions.cssSource
      : [mergedOptions.cssSource];

    return sources
      .map(source => this.resolveCSSSource(source, mergedOptions.writingMode))
      .filter(css => css.trim())
      .join('\n\n');
  }

  private resolveCSSSource(
    source: CSSSource,
    writingMode: 'horizontal' | 'vertical'
  ): string {
    if (source === 'default') {
      const filename =
        writingMode === 'vertical'
          ? 'default-vertical.css'
          : 'default-horizontal.css';
      return this.loadBundledCSS(filename);
    }
    if ('css' in source) {
      return source.css;
    }
    if ('file' in source) {
      return this.loadExternalCSS(source.file);
    }
    return '';
  }

  /**
   * パッケージ同梱の CSS ファイルを読み込む
   */
  private loadBundledCSS(filename: string): string {
    // this.__dirname は dist ディレクトリを指すので、そこから styles フォルダを探す
    const cssPath = join(this.__dirname, 'styles', filename);
    try {
      return readFileSync(cssPath, 'utf-8');
    } catch {
      console.warn(`Bundled CSS file not found: ${cssPath}`);
      return '';
    }
  }

  /**
   * 外部 CSS ファイルを読み込む
   */
  private loadExternalCSS(filePath: string): string {
    const resolvedPath = isAbsolute(filePath)
      ? filePath
      : join(process.cwd(), filePath);
    try {
      return readFileSync(resolvedPath, 'utf-8');
    } catch {
      console.warn(`CSS file not found: ${resolvedPath}`);
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

    return [
      '<div class="character">',
      `  <span class="character-name">${name}</span>`,
      description ? `  <span class="character-description">${description}</span>` : '',
      '</div>',
    ].filter(Boolean).join('\n');
  }

  private renderHeading(
    element: PScLine,
    options: Required<RenderOptions>,
    level: number
  ): string {
    let text = element.text || '';
    if (level === 1 && options.sceneNumbers) {
      if (!text.match(/^\d+[.\-\s]/)) {
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
    if (options.dialogueBrackets) {
      text = `「${text}」`;
    }
    return [
      `<div class="dialogue" data-character="${character}">`,
      `  <div class="character-name">${character}</div>`,
      `  <div class="dialogue-text">${text}</div>`,
      '</div>',
    ].join('\n');
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
