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

  render(script: PSc, options?: RenderOptions): string {
    const mergedOptions = { ...this.options, ...options };
    return this.renderToHTML(script, mergedOptions);
  }

  renderToHTML(script: PSc, options?: RenderOptions): string {
    // Minimal implementation - will be expanded in later tasks
    const css = options?.includeCSS ? this.generateCSS(options) : '';
    const content = script.lines.map((element: PScLine) => this.renderElement(element)).join('\n');
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${script.title || 'Script'}</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  <div class="script">
    ${content}
  </div>
</body>
</html>`;
  }

  renderElement(element: PScLine): string {
    // Minimal implementation - will be expanded in later tasks
    const typeName = Object.keys(PScLineType)[Object.values(PScLineType).indexOf(element.type)];
    return `<div class="psc-line-${typeName?.toLowerCase() || 'unknown'}">${element.text || ''}</div>`;
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