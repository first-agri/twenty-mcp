# First Agri Twenty MCP Server セットアップガイド

このドキュメントは、First Agriのインサイドセールスチーム向けのセットアップガイドです。

## 概要

Twenty MCP Serverを使用すると、Claude Desktop から直接 IS Lead（インサイドセールスリード）を操作できます。

### 主な機能

- **IS Lead 作成**: 自然言語でリードを登録
- **IS Lead 検索**: フェーズ/国/ソース別にフィルタ
- **IS Lead 更新**: フェーズ変更、失注理由の記録
- **統計取得**: 離脱理由内訳、ソース別成果など

## 前提条件

- **Node.js 18以上** - [nodejs.org](https://nodejs.org/)からダウンロード
- **Claude Desktop** - [claude.ai/desktop](https://claude.ai/desktop)からダウンロード
- **Twenty API Key** - 管理者（石木）から取得

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/first-agri/twenty-mcp.git
cd twenty-mcp
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ビルド

```bash
npm run build
```

### 4. Claude Desktop の設定

以下のファイルを編集します：

**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "node",
      "args": ["/path/to/twenty-mcp/dist/index.js"],
      "env": {
        "TWENTY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

`/path/to/twenty-mcp` を実際のパスに置き換えてください。

例（Mac）:
```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "node",
      "args": ["/Users/清原/Projects/twenty-mcp/dist/index.js"],
      "env": {
        "TWENTY_API_KEY": "eyJhbGciOi..."
      }
    }
  }
}
```

### 5. Claude Desktop を再起動

設定後、Claude Desktop を完全に終了して再起動してください。

## 使い方

Claude Desktop で以下のように話しかけてください。

### IS Lead の作成

```
ABC Coffee、アメリカ、Instagramから。抹茶ラテ用、月50kg、3000-5000円希望
```

Claude が IS Lead として登録します。

### IS Lead の検索

```
Instagram経由の有効返信リードを一覧表示して
```

```
アメリカのリードを検索
```

### フェーズ別一覧

```
フェーズ別のリード数を教えて
```

### 統計情報

```
今週の離脱理由の内訳を教えて
```

```
ソース別の成果を見せて
```

### IS Lead の更新

```
ABC Coffeeを失注に変更。理由は価格不一致
```

## IS Lead ツール一覧

| ツール名 | 説明 |
|---------|------|
| `create_is_lead` | IS Leadを新規作成 |
| `get_is_lead` | IDでIS Leadを取得 |
| `update_is_lead` | IS Leadを更新 |
| `search_is_leads` | IS Leadを検索 |
| `list_is_leads_by_phase` | フェーズ別一覧 |
| `get_is_lead_stats` | 統計情報取得 |

## IS Lead フィールド

| フィールド | 説明 | 例 |
|-----------|------|-----|
| name | 顧客名（必須） | ABC Coffee |
| phase | フェーズ | VALID_REPLY, LOST, ON_HOLD, CONVERTED |
| country | 国 | USA, UK, Thailand, Japan |
| leadSource | リードソース | INSTAGRAM, EMAIL, HP, ALIBABA |
| customerNeeds | 顧客ニーズ | 抹茶ラテ用 |
| quantity | 希望数量(kg) | 50 |
| priceRangeMin | 希望価格下限(円/kg) | 3000 |
| priceRangeMax | 希望価格上限(円/kg) | 5000 |
| lostReason | 失注理由 | 価格不一致 |
| memo | メモ | 自由記述 |

## トラブルシューティング

### Claude がツールを認識しない

1. Claude Desktop を完全に終了
2. 設定ファイルのJSONが正しいか確認
3. API Keyが正しいか確認
4. Claude Desktop を再起動

### API エラーが発生する

- Rate limit: 1分間に100リクエストまで。連続操作時は少し待つ
- 認証エラー: API Keyが期限切れの可能性。管理者に連絡

## サポート

問題が発生した場合は、石木（amishiki）に連絡してください。
