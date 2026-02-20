# GitHub AsciiDoc Mermaid Preview

GitHub 上の AsciiDoc プレビューで、`link:path/to/file.mmd[role=include]` または `link:path/to/file.mermaid[role=include]` 形式で埋め込まれた Mermaid 図を SVG として描画する Chrome 拡張機能です。

## 機能

- GitHub の AsciiDoc ファイル（`.adoc`）プレビューで Mermaid の include を検出
- 相対パスから `.mmd` または `.mermaid` ファイルを取得し、SVG としてドキュメント内に描画
- **プライベートリポジトリ対応**: GitHub Personal Access Token (PAT) を設定すると、プライベートリポジトリのファイルも取得可能

## インストール

### 1. ビルド

```bash
npm install
npm run build
```

### 2. Chrome に読み込む

1. Chrome で `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトの `dist` フォルダを選択

## 使い方

1. GitHub で AsciiDoc ファイル（例: `README.adoc`）を開く
2. `link:../../path/to/diagram.mmd[role=include]` や `link:../../path/to/diagram.mermaid[role=include]` のような記述がある場合、自動的に Mermaid 図が SVG で描画される
3. プライベートリポジトリの場合は、拡張アイコン → 「設定を開く」から GitHub PAT を設定する

## GitHub Personal Access Token (PAT) の取得

プライベートリポジトリのファイルを取得するには、GitHub の Personal Access Token が必要です。

1. GitHub にログインし、[Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) を開く
2. 「Generate new token」をクリック
3. **Classic** トークンまたは **Fine-grained** トークンを選択
   - Classic: `repo` スコープにチェック
   - Fine-grained: 対象リポジトリへの読み取り権限を付与
4. トークンを生成し、コピーする
5. 拡張機能のオプションページでトークンを貼り付けて保存

## 対応形式

- `.mmd` または `.mermaid` ファイルを `link:path/to/file.mmd[role=include]` 形式で埋め込んだ AsciiDoc
- GitHub の blob ページ（`https://github.com/owner/repo/blob/branch/path/to/file.adoc`）で表示されるプレビュー

## ライセンス

MIT
