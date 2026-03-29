# CLAUDE.md

このファイルは Claude Code がプロジェクトのコンテキストを把握するための設定ファイルです。

## プロジェクト概要

日本式 Fountain 記法 (JFTN) を解析・レンダリングするための TypeScript ライブラリ。
日本の脚本制作者が JFTN 形式の脚本を構造化データとして扱い、HTML や PDF に変換できるようにする npm パッケージ。

詳細は以下を参照:
- 要件定義: [docs/requirements.md](docs/requirements.md)
- 設計書: [docs/design.md](docs/design.md)
- タスク一覧: [docs/tasks.md](docs/tasks.md)

## 技術スタック

- **言語**: TypeScript
- **プラットフォーム**: Node.js / npm パッケージ
- **ビルドツール**: Rollup / esbuild
- **テスト**: Jest (`ts-jest`)
- **リンター**: ESLint + Prettier
- **PDF 生成 (軽量版)**: PDFKit (~2MB、必須依存)
- **PDF 生成 (高機能版)**: Puppeteer (~300MB、オプショナル依存)

## よく使うコマンド

```bash
npm install          # 依存関係のインストール
npm run dev          # 開発サーバー起動
npm test             # テスト実行
npm run build        # ビルド
```

## プロジェクト構成

```
playscript-js/
├── src/
│   ├── index.ts              # メインエクスポート
│   ├── parser.ts             # パーサー実装
│   ├── renderer.ts           # HTML レンダラー
│   ├── pdf/                  # PDF レンダラー
│   │   ├── index.ts
│   │   ├── lightweight.ts    # PDFKit ベース (軽量版)
│   │   └── advanced.ts       # Puppeteer ベース (高機能版)
│   ├── types.ts              # 型定義
│   ├── utils.ts              # ユーティリティ
│   └── rules.ts              # 日本式記法ルール
├── tests/                    # テスト
│   ├── parser.test.ts
│   ├── renderer.test.ts
│   ├── pdf/
│   ├── utils.test.ts
│   └── fixtures/             # テスト用サンプルファイル
├── docs/                     # 設計・仕様ドキュメント
├── dist/                     # ビルド出力
└── examples/                 # サンプルコード
```

## ファイル命名規則

- ファイル名は kebab-case: `user-profile.js`
- コンポーネントファイルは PascalCase: `ScriptRenderer.ts`
- 設定ファイルは lowercase: `package.json`

## 日本語ドキュメント書式ルール

### 括弧

- 日本語コメント内の括弧は半角を使用し、前後に半角スペースを付ける
- 例:
  - ❌ `柱（レベル1）`
  - ✅ `柱 (レベル 1)`
  - ❌ `人物名（@マークなし）`
  - ✅ `人物名 (@ マークなし)`

### 英単語

- 日本語文中の英単語の前後には半角スペースを入れる
- 例:
  - ❌ `HTMLレンダリング`
  - ✅ `HTML レンダリング`
  - ❌ `TypeScriptライブラリ`
  - ✅ `TypeScript ライブラリ`

### コロン

- 日本語文中のコロンは半角を使用: `用語定義:`

### その他

- 可能な限り半角記号を使用する
- ただし、日本語の文章として自然な場合は全角も許可
- 適用範囲: コメント、.md ファイル、仕様書、設計書

## 開発方針

- AI アシスト開発 + 人間によるレビュー
- Python の `playscript` ライブラリと JSON 互換性を維持する
- 型安全な API を提供する
- 再利用可能な npm パッケージとして設計する
