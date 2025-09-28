import { PSc, PScLine, PScLineType } from './types';

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

  constructor(private options: RenderOptions = {}) {}

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
      ...this.options,
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
      ...this.options,
      ...options,
    };

    switch (element.type) {
      case PScLineType.TITLE:
        return this.renderTitle(element, mergedOptions);
      case PScLineType.AUTHOR:
        return this.renderAuthor(element, mergedOptions);
      case PScLineType.CHARSHEADLINE:
        return this.renderCharactersHeadline(element, mergedOptions);
      case PScLineType.CHARACTER:
        return this.renderCharacter(element, mergedOptions);
      case PScLineType.H1:
        return this.renderHeading(element, mergedOptions, 1);
      case PScLineType.H2:
        return this.renderHeading(element, mergedOptions, 2);
      case PScLineType.H3:
        return this.renderHeading(element, mergedOptions, 3);
      case PScLineType.DIALOGUE:
        return this.renderDialogue(element, mergedOptions);
      case PScLineType.DIRECTION:
        return this.renderDirection(element, mergedOptions);
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
      ...this.options,
      ...options,
    };

    const baseCSS = this.generateBaseCSS(mergedOptions);
    const themeCSS = this.generateThemeCSS(mergedOptions);
    const writingModeCSS = this.generateWritingModeCSS(mergedOptions);
    const customCSS = mergedOptions.customCSS;

    return [baseCSS, themeCSS, writingModeCSS, customCSS]
      .filter(css => css.trim())
      .join('\n\n');
  }

  // 個別要素のレンダリングメソッド

  private renderTitle(
    element: PScLine,
    options: Required<RenderOptions>
  ): string {
    return `<h1 class="script-title">${this.escapeHtml(element.text || '')}</h1>`;
  }

  private renderAuthor(
    element: PScLine,
    options: Required<RenderOptions>
  ): string {
    return `<div class="script-author">${this.escapeHtml(element.text || '')}</div>`;
  }

  private renderCharactersHeadline(
    element: PScLine,
    options: Required<RenderOptions>
  ): string {
    return `<h2 class="characters-headline">${this.escapeHtml(element.text || '')}</h2>`;
  }

  private renderCharacter(
    element: PScLine,
    options: Required<RenderOptions>
  ): string {
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
    return `<h${level + 1} class="scene-heading scene-heading-${level}">${this.escapeHtml(element.text || '')}</h${level + 1}>`;
  }

  private renderDialogue(
    element: PScLine,
    options: Required<RenderOptions>
  ): string {
    const character = this.escapeHtml(element.name || '');
    const text = this.escapeHtml(element.text || '').replace(/\n/g, '<br>');

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
    return `<div class="empty-line"></div>`;
  }

  // CSS 生成メソッド

  private generateBaseCSS(options: Required<RenderOptions>): string {
    return `/* Base Styles */
.script-container {
  font-family: ${options.fontFamily};
  font-size: ${options.fontSize}px;
  line-height: ${options.lineHeight};
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.script-title {
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.script-author {
  text-align: center;
  font-size: 1.1em;
  margin: 0 0 2rem 0;
  color: #666;
}

.characters-headline {
  font-size: 1.5em;
  font-weight: bold;
  margin: 2rem 0 1rem 0;
  border-bottom: 2px solid #333;
  padding-bottom: 0.5rem;
}

.character {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 4px;
}

.character-name {
  font-weight: bold;
  margin-right: 1rem;
}

.character-description {
  color: #666;
}

.scene-heading {
  font-weight: bold;
  margin: 2rem 0 1rem 0;
  padding: 0.5rem 0;
}

.scene-heading-1 {
  font-size: 1.4em;
  border-bottom: 1px solid #333;
}

.scene-heading-2 {
  font-size: 1.2em;
}

.scene-heading-3 {
  font-size: 1.1em;
}

.dialogue {
  margin: 1rem 0;
  padding-left: 2rem;
}

.dialogue .character-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.dialogue-text {
  margin-left: 1rem;
}

.direction {
  margin: 1rem 0;
  font-style: italic;
  color: #555;
  padding: 0.5rem;
  border-radius: 4px;
}

.comment {
  margin: 1rem 0;
  font-size: 0.9em;
  color: #888;
  font-style: italic;
  padding: 0.5rem;
  border-left: 3px solid #ddd;
}

.endmark {
  text-align: right;
  font-weight: bold;
  font-size: 1.2em;
  margin: 2rem 0;
  padding: 1rem;
}

.empty-line {
  height: 1em;
}

.unknown-element {
  color: #ff0000;
  padding: 0.5rem;
  border: 1px solid #ff9999;
  margin: 0.5rem 0;
}`;
  }

  private generateThemeCSS(options: Required<RenderOptions>): string {
    if (options.theme === 'dark') {
      return `/* Dark Theme */
.script-container[data-theme="dark"] {
  background: #1a1a1a;
  color: #e0e0e0;
}

.script-container[data-theme="dark"] .script-author {
  color: #aaa;
}

.script-container[data-theme="dark"] .characters-headline {
  border-bottom-color: #666;
}

.script-container[data-theme="dark"] .character {
}

.script-container[data-theme="dark"] .character-description {
  color: #aaa;
}

.script-container[data-theme="dark"] .scene-heading-1 {
  border-bottom-color: #666;
}

.script-container[data-theme="dark"] .direction {
  color: #ccc;
}

.script-container[data-theme="dark"] .comment {
  color: #999;
  border-left-color: #555;
}

.script-container[data-theme="dark"] .endmark {
}`;
    }
    return '';
  }

  private generateWritingModeCSS(options: Required<RenderOptions>): string {
    if (options.writingMode === 'vertical') {
      return `/* Vertical Writing Mode */
.script-container[data-writing-mode="vertical"] {
  writing-mode: vertical-rl;
  text-orientation: upright;
  max-width: none;
  max-height: 100vh;
  overflow-x: auto;
  padding: 2rem;
}

.script-container[data-writing-mode="vertical"] .script-title,
.script-container[data-writing-mode="vertical"] .script-author {
  text-align: start;
}

.script-container[data-writing-mode="vertical"] .dialogue {
  padding-right: 2rem;
  padding-left: 0;
}

.script-container[data-writing-mode="vertical"] .dialogue-text {
  margin-right: 1rem;
  margin-left: 0;
}

.script-container[data-writing-mode="vertical"] .endmark {
  text-align: start;
  align-self: end;
}`;
    }
    return '';
  }

  // ユーティリティメソッド

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
