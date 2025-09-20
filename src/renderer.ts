import { Script, ScriptElement } from './types';

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
  private options: RenderOptions;

  constructor(options: RenderOptions = {}) {
    this.options = {
      writingMode: 'horizontal',
      fontSize: 16,
      fontFamily: 'serif',
      lineHeight: 1.6,
      theme: 'light',
      includeCSS: true,
      ...options
    };
  }

  render(script: Script, options?: RenderOptions): string {
    const mergedOptions = { ...this.options, ...options };
    return this.renderToHTML(script, mergedOptions);
  }

  renderToHTML(script: Script, options?: RenderOptions): string {
    // Minimal implementation - will be expanded in later tasks
    const css = options?.includeCSS ? this.generateCSS(options) : '';
    const content = script.elements.map(element => this.renderElement(element)).join('\n');
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${script.metadata.title || 'Script'}</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  <div class="script">
    ${content}
  </div>
</body>
</html>`;
  }

  renderElement(element: ScriptElement): string {
    // Minimal implementation - will be expanded in later tasks
    return `<div class="${element.type}">${element.content}</div>`;
  }

  generateCSS(options?: RenderOptions): string {
    // Minimal implementation - will be expanded in later tasks
    return `
      .script {
        font-family: ${options?.fontFamily || this.options.fontFamily};
        font-size: ${options?.fontSize || this.options.fontSize}px;
        line-height: ${options?.lineHeight || this.options.lineHeight};
      }
    `;
  }
}