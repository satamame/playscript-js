# Requirements Document

## Introduction

この機能は、Fountain 脚本フォーマットを日本語向けにカスタマイズした記法 (JFTN) を解析・レンダリングするための TypeScript ライブラリです。日本の脚本制作者が、日本語の Fountain 記法で書かれた脚本を構造化データとして扱い、HTML やその他の形式に変換できるようにします。

## Requirements

### Requirement 1

**User Story:** 開発者として、日本式 Fountain 記法 (JFTN) のテキストを構造化データに変換したい。そうすることで、脚本データをプログラムで処理・操作できる。

#### Acceptance Criteria

1. WHEN JFTN テキストがパーサーに渡される THEN システムは構造化された Script オブジェクトを返す SHALL
2. WHEN パース処理でエラーが発生する THEN システムは詳細なエラー情報と行番号を提供する SHALL
3. WHEN パース処理が成功する THEN システムはメタデータと要素の配列を含む Script オブジェクトを返す SHALL
4. WHEN ライブラリがインポートされる THEN システムは TypeScript 型定義を提供する SHALL

### Requirement 2

**User Story:** 開発者として、構造化された脚本データを日本語特有の文字組みで HTML レンダリングしたい。そうすることで、日本の脚本フォーマットに適した Web ページやプレビューを生成できる。

#### Acceptance Criteria

1. WHEN Script オブジェクトがレンダラーに渡される THEN システムは日本語の縦書き・横書きに対応した HTML を生成する SHALL
2. WHEN HTML がレンダリングされる THEN システムは適切な日本語フォントと文字間隔の CSS を含める SHALL
3. WHEN キャラクター名がレンダリングされる THEN システムは日本語キャラクター名を適切にフォーマットする SHALL
4. WHEN ト書きがレンダリングされる THEN システムは日本語のト書きを適切なスタイルで表示する SHALL

### Requirement 3

**User Story:** 開発者として、HTML レンダリングの表示設定をカスタマイズしたい。そうすることで、アプリケーションの要件に合わせた表示スタイルを適用できる。

#### Acceptance Criteria

1. WHEN RenderOptions が指定される THEN システムはフォントサイズ、フォントファミリー、行間の設定を適用する SHALL
2. WHEN 縦書き・横書きが指定される THEN システムは適切な CSS writing-mode を生成する SHALL
3. WHEN テーマが指定される THEN システムはライト・ダークテーマに対応した CSS を生成する SHALL

### Requirement 4

**User Story:** 脚本制作者として、日本式 Fountain 記法を使って脚本を執筆したい。そうすることで、日本の脚本制作慣習に合った自然な執筆ができる。

#### Acceptance Criteria

1. WHEN 日本語の役名が記述される THEN システムは全角文字の役名を正しく認識する SHALL
2. WHEN 日本語のシーンヘッダーが記述される THEN システムは日本語のシーンヘッダーを適切にパースする SHALL
3. WHEN 日本語の括弧記法が使用される THEN システムは全角括弧「」や () を適切に処理する SHALL
4. WHEN 縦書き用の記号が使用される THEN システムは縦書き表示時に適切な記号変換を行う SHALL

### Requirement 5

**User Story:** 脚本制作者として、本家 Fountain とは異なる日本式の記法を使いたい。そうすることで、日本の脚本制作の標準的な書式で執筆できる。

#### Acceptance Criteria

1. WHEN 日本式のキャラクター記法が使用される THEN システムは日本独自のキャラクター名フォーマットを認識する SHALL
2. WHEN 日本式のト書き記法が使用される THEN システムは本家 Fountain と異なる日本式ト書きルールを適用する SHALL
3. WHEN 日本式の強調記法が使用される THEN システムは日本独自の強調表現を適切にレンダリングする SHALL
4. WHEN 日本式のページブレーク記法が使用される THEN システムは日本の脚本フォーマットに合ったページ区切りを処理する SHALL
5. WHEN 日本式のメタデータ記法が使用される THEN システムは日本の脚本に特有のメタ情報を正しく解析する SHALL

### Requirement 6

**User Story:** 開発者として、構造化された脚本データを様々な形式で出力したい。そうすることで、アプリケーションで脚本を様々な用途に活用できる。

#### Acceptance Criteria

1. WHEN HTML レンダリングが実行される THEN システムは完全な HTML ドキュメントを生成する SHALL
2. WHEN HTML が生成される THEN システムは日本語フォントを指定した CSS を含める SHALL
3. WHEN レンダリングオプションが指定される THEN システムは指定されたスタイル設定を適用する SHALL
4. WHEN カスタム CSS が指定される THEN システムは追加のスタイルを適用する SHALL