# GitHub AsciiDoc Mermaid Preview

GitHub 上の AsciiDoc プレビューで、`link:path/to/file.mmd[role=include]` または `link:path/to/file.mermaid[role=include]` 形式で埋め込まれた Mermaid 図を SVG として描画する Chrome 拡張機能です

## 機能

- GitHub の AsciiDoc ファイル（`.adoc`）プレビューで Mermaid の include を検出
- 相対パスから `.mmd` または `.mermaid` ファイルを取得し、SVG としてドキュメント内に描画
- **プライベートリポジトリ対応**: GitHub Personal Access Token (PAT) を設定すると、プライベートリポジトリのファイルも取得可能

> [!IMPORTANT] 
> **PATを設定することを強く推奨します。**  
> [**>>設定方法はこちら<<**](#PATの取得と設定方法)  
> PATを設定しないとGitHub APIのレート制限により同一IPアドレスでの認証されていないAPI利用が制限されます（同じネットワークの人に迷惑かかるかもってことです）。
> 詳しくは[REST API のレート制限](https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28)を参照してください。


## インストール

### 方法 A: 配布用 ZIP から（推奨）

1. 本リポジトリの Releases から `github-asciidoc-mermaid-preview-vX.X.X.zip` をダウンロード
2. ZIP を解凍する
3. Chrome で `chrome://extensions/` を開く
4. 「デベロッパーモード」を有効にする
5. 「パッケージ化されていない拡張機能を読み込む」をクリック
6. 解凍したフォルダを選択

### 方法 B: ソースからビルド

```bash
npm install
npm run build
```

1. Chrome で `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトの `dist` フォルダを選択

### 配布用 ZIP の作成・GitHub Release 用

```bash
npm run package
```

`github-asciidoc-mermaid-preview-v1.0.0.zip` がプロジェクト直下に生成されます。この ZIP を GitHub の Releases にアップロードしてください。

## 使い方

1. GitHub で AsciiDoc ファイル（例: `README.adoc`）を開く
2. `link:../../path/to/diagram.mmd[role=include]` や `link:../../path/to/diagram.mermaid[role=include]` のような記述がある場合、自動的に Mermaid 図が SVG で描画される
3. プライベートリポジトリの場合は、拡張アイコン → 「設定を開く」から GitHub PAT を設定する

## PATの取得と設定方法
PAT(Personal Access Token)の取得と設定方法について。

プライベートリポジトリのファイルを取得するには、GitHub の Personal Access Token が必要です。

1. GitHub にログインし、[Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) を開く
2. 「Generate new token」をクリック
3. **Generate new token(classic)** トークンまたは **Generate new token** トークンを選択
   - Generate new token(classic): 
     - Note: わかりやすい名前を記入(例: `GitHub AsciiDoc Mermaid Preview`)
     - Expiration: PATの有効期限を選択
     - repoにチェック
   - Generate new token:
     - Token name: わかりやすい名前を記入(例: `GitHub AsciiDoc Mermaid Preview`)
     - Expiration: PATの有効期限を選択
     - Repository access: 対象としたいリポジトリを選択
4. トークンを生成し、コピーする
5. 拡張機能のオプションページでトークンを貼り付けて保存

## 対応形式

- `.mmd` または `.mermaid` ファイルを `link:path/to/file.mmd[role=include]` 形式で埋め込んだ AsciiDoc
- GitHub の blob ページ（`https://github.com/owner/repo/blob/branch/path/to/file.adoc`）で表示されるプレビュー
