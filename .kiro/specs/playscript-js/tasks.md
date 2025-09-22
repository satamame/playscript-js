# Implementation Plan

- [x] 1. プロジェクトセットアップとコア型定義の作成
  - TypeScript プロジェクトの初期化とビルド環境の構築
  - package.json の設定とnpm名前確保のための最小限公開
  - コア型定義 (Script、ScriptElement、ScriptMetadata等) の実装
  - _Requirements: 1.4_

- [x] 2. Python 互換データ構造の実装
  - PScLineType 列挙型の実装 (Python の PScLineType と同じ値と名前)
  - PScLine クラスの実装 (type、name、text 属性と fromText メソッド)
  - PSc クラスの実装 (title、author、chars、lines 属性と fromLines メソッド)
  - _Requirements: 1.1, 1.4_

- [x] 3. JSON シリアライゼーション機能の実装



  - PScLine の toJSON/fromJSON メソッドの実装 (Python 互換形式)
  - PSc の toJSON/fromJSON メソッドの実装 (Python 互換形式)
  - linesFromTypesAndTexts ユーティリティ関数の実装
  - _Requirements: 1.1, 1.4_

- [ ] 4. JFTN パース規則とユーティリティ関数の実装
  - JFTN 記法の正規表現パターンと文脈依存ルールの定義
  - 日本語文字判定、見出し判定、セリフ判定などのユーティリティ関数の実装
  - テキスト正規化と日本語処理関数の実装
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [ ] 5. JftnParser クラスの基本実装
  - JftnParser クラスの骨格とコンストラクタの実装
  - parse メソッドの基本構造とメタデータ抽出機能の実装
  - 行単位でのパース処理と PScLine 生成機能の実装
  - _Requirements: 1.1, 1.4_

- [ ] 6. 文脈依存パース機能の実装
  - ParsingContext の状態管理機能の実装
  - 登場人物一覧、セリフ、ト書きの文脈依存判定ロジックの実装
  - 空行とエンドマーク後の文脈処理の実装
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 7. ScriptRenderer クラスの基本実装
  - ScriptRenderer クラスと RenderOptions インターフェースの実装
  - 基本的な HTML 構造生成と CSS 生成機能の実装
  - 各要素タイプ別のレンダリングメソッドの実装 (PScLine ベース)
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 8. 日本語特有のレンダリング機能の実装
  - 縦書き・横書き切り替え機能と CSS writing-mode 対応の実装
  - 日本語フォント指定と文字間隔調整機能の実装
  - 縦書き用記号変換と数字の縦中横処理の実装
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 9. 軽量版 PDF レンダラーの実装
  - LightweightPdfRenderer クラスの実装 (PDFKit 使用)
  - 基本的な PDF レイアウトと日本語フォント対応の実装
  - 横書き中心の PDF 生成機能の実装
  - _Requirements: 6.1, 6.2_

- [ ] 10. 高機能版 PDF レンダラーの実装
  - AdvancedPdfRenderer クラスの実装 (Puppeteer 使用、オプショナル依存)
  - 動的インポートとエラーハンドリングの実装
  - HTML/CSS ベースの高度な PDF 生成機能の実装
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11. PDF レンダラーファクトリーの実装
  - createPdfRenderer ファクトリー関数の実装
  - PdfRenderer インターフェースと共通オプションの実装
  - 軽量版・高機能版の切り替え機能の実装
  - _Requirements: 6.1, 6.2_

- [ ] 12. エラーハンドリングとバリデーション機能の実装
  - ParseError クラスと ParseResult インターフェースの実装
  - パース時のエラー検出と警告生成機能の実装
  - 不正な記法に対する適切なフォールバック処理の実装
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 13. 包括的なテストスイートの作成
  - Python 互換データ構造のテスト (JSON シリアライゼーション含む)
  - 各記法要素のパーステスト (タイトル、作者、見出し、セリフ、ト書き等)
  - HTML レンダリング出力の正確性テスト
  - _Requirements: 1.1, 2.2, 4.1, 5.1_

- [ ] 14. PDF レンダラーのテスト作成
  - 軽量版 PDF レンダラーのテスト作成
  - 高機能版 PDF レンダラーのテスト作成 (Puppeteer 利用可能時のみ)
  - PDF 出力の基本的な検証テスト作成
  - _Requirements: 6.1, 6.2_

- [ ] 15. 統合テストとサンプルファイルテストの作成
  - 完全な JFTN 脚本ファイルのパース→レンダリング統合テスト作成
  - Python との JSON 互換性テスト作成
  - 複雑な記法組み合わせのテストケース作成
  - _Requirements: 1.3, 2.3, 4.3, 5.4_

- [ ] 16. ビルドシステムとパッケージング設定の完成
  - TypeScript コンパイル設定と dist 出力の最適化
  - オプショナル依存 (Puppeteer) の package.json 設定
  - ESLint、Prettier 設定とコード品質チェックの自動化
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 17. ドキュメントとサンプルコードの作成
  - TypeDoc による API ドキュメント生成設定
  - Python 互換性と PDF 機能を含む README.md の作成
  - JFTN ファイルのサンプルと HTML/PDF 出力例の準備
  - _Requirements: 1.1, 2.1, 6.1_

- [ ] 18. 設計文書の簡略化とリファクタリング
  - 実装完了した機能の design.md 記述を設計レベルに簡略化
  - 詳細な実装例やコード例を削除し、アーキテクチャ概要に集約
  - 実装詳細はコードコメントや別ドキュメントに移行
  - _Requirements: 全般_