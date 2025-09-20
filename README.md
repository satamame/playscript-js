# playscript-js

A TypeScript library for parsing and rendering Japanese Fountain (JFTN) screenplay format.

## Installation

```bash
npm install playscript-js
```

## Usage

```typescript
import { JftnParser, ScriptRenderer } from 'playscript-js';

const parser = new JftnParser();
const renderer = new ScriptRenderer();

const jftnText = `
Title: サンプル脚本
Author: 作者名

# シーン1

@太郎
こんにちは。

@花子
こんにちは、太郎さん。
`;

const result = parser.parse(jftnText);
if (result.success) {
  const html = renderer.render(result.data);
  console.log(html);
}
```

## Features

- Parse Japanese Fountain (JFTN) format
- Render to HTML with Japanese typography support
- TypeScript support with full type definitions
- Vertical and horizontal writing modes
- Customizable themes and styling

## Development Status

This library is currently in early development. Core functionality is being implemented incrementally.

## License

MIT