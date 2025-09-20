# Contributing to playscript-js

## 開発環境のセットアップ

### 必要な環境
- Node.js 18 以上
- npm または yarn

### セットアップ手順

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd playscript-js
```

2. 依存関係をインストール:
```bash
npm install
```

3. ビルド:
```bash
npm run build
```

4. テスト実行:
```bash
npm test
```

## 開発ワークフロー

### ブランチ戦略
- `main`: 安定版
- `develop`: 開発版
- `feature/*`: 新機能開発
- `fix/*`: バグ修正

### コミットメッセージ
Conventional Commits 形式を使用:
```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
test: テスト追加・修正
refactor: リファクタリング
```

### コードスタイル
- TypeScript を使用
- ESLint + Prettier でフォーマット
- 日本語コメントは japanese-writing-style.md に従う

### テスト
- Jest を使用
- 新機能には必ずテストを追加
- カバレッジ 80% 以上を維持

## プルリクエスト

1. feature ブランチを作成
2. 変更を実装
3. テストを追加・実行
4. プルリクエストを作成
5. レビュー後にマージ

## 質問・議論

Issues や Discussions でお気軽にご質問ください。