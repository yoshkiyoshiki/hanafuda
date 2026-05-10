# koikoi-app 🎴

花札用のモバイルアプリケーションです。  
このプロジェクトは [Expo](https://expo.dev) で構築された React Native アプリです。

## 概要

このアプリは花札のゲーム進行と点数計算を支援するアプリケーションです。

## クイックスタート

1. 依存関係をインストール

   ```bash
   npm install
   ```

2. アプリを起動

   ```bash
   npx expo start
   ```

実行すると以下のオプションが表示されます：

- [開発ビルド](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android エミュレータ](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS シミュレータ](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## フォルダ構成と役割

### 📁 `app/`
**アプリケーション画面とルーティング**
- `_layout.tsx`: ナビゲーション構造とレイアウト定義
- `index.tsx`: メイン画面（ホーム画面）
- `modal.tsx`: モーダル画面

このプロジェクトは [ファイルベースのルーティング](https://docs.expo.dev/router/introduction/) を使用しています。

### 📁 `assets/`
**画像・メディアリソース**
- `images/`: アプリで使用される画像ファイル（アイコン、ロゴなど）

### 📁 `components/`
**再利用可能な React コンポーネント**
- `external-link.tsx`: 外部リンク表示用コンポーネント
- `haptic-tab.tsx`: ハプティクスフィードバック付きタブ
- `hello-wave.tsx`: ウェルカムメッセージコンポーネント
- `parallax-scroll-view.tsx`: パララックス効果付きスクロールビュー
- `themed-text.tsx`: テーマ対応のテキストコンポーネント
- `themed-view.tsx`: テーマ対応のビューコンポーネント
- `ui/`: UI 関連の汎用コンポーネント
  - `collapsible.tsx`: 展開/折りたたみ可能なコンポーネント
  - `icon-symbol.tsx`: アイコンシンボルコンポーネント
  - `icon-symbol.ios.tsx`: iOS 専用アイコンシンボルコンポーネント

### 📁 `constants/`
**アプリケーション全体で使用される定数・設定**
- `cardImages.js`: 花札カード画像のマッピング
- `cards.js`: カードデータ定義
- `handEvaluator.js`: 役の評価・判定ロジック
- `hands.js`: 役（手）の定義と点数
- `theme.ts`: カラーテーマとデザイン設定

### 📁 `hooks/`
**カスタム React Hook**
- `use-color-scheme.ts`: カラースキーム（ダーク/ライト）管理フック
- `use-color-scheme.web.ts`: Web 用カラースキーム管理フック
- `use-theme-color.ts`: テーマカラー取得フック

### 📁 `scripts/`
**ユーティリティスクリプト**
- `reset-project.js`: プロジェクトをリセットするスクリプト
  ```bash
  npm run reset-project
  ```
  このコマンドでスターターコードが **app-example** ディレクトリに移動し、開発用の空の **app** ディレクトリが作成されます。

## 設定ファイル

- `app.json`: Expo アプリ設定
- `eas.json`: Expo Application Services（EAS）ビルド設定
- `tsconfig.json`: TypeScript コンパイラ設定
- `eslint.config.js`: ESLint 設定
- `package.json`: プロジェクト依存関係とスクリプト定義

## 参考資料

詳細は以下のドキュメントを参照してください：

- [Expo ドキュメント](https://docs.expo.dev/)
- [Expo チュートリアル](https://docs.expo.dev/tutorial/introduction/)
- [Expo GitHub](https://github.com/expo/expo)
