# word list（日本語・ラオ語 単語帳）

Vue 3 + Vite で作った単語帳アプリです。ビルド結果（`dist/`）を GitHub Pages で公開しています。
デザインは Bootstrap 5.3 と Bootstrap Icons（どちらも `index.html` で CDN から読み込み）を使っています。ライト／ダークテーマはヘッダー右上のボタンで切り替えられます。

公開サイト：https://nenthippavanh.github.io/dist/

| タブ | 内容 | データ |
| --- | --- | --- |
| All Words | General・Water Supply・Health Care の単語と水道用語辞典の見出し語をまとめて検索 | 下のすべて |
| General | 一般の単語 | `src/data/GeneralList.json` |
| Water Supply | 手入力の単語 ＋ 水道用語辞典（MawaSU2、約5,100語、日本語・ラオ語・タイ語の解説付き） | `src/data/WaterSupplyList.json`、`public/water-supply/` |
| Health Care | 保健・医療の単語 | `src/data/HealthCareList.json` |

## 1. はじめての準備

[Node.js](https://nodejs.org/) をインストールしてから、プロジェクトのフォルダで一度だけ実行します。

```sh
npm install
```

## 2. ローカルのブラウザで確認する

### 開発サーバー（ふだんの確認用）

```sh
npm run dev
```

ブラウザで http://localhost:5173/ を開きます。ファイルを保存すると画面が自動で更新されます。

### ビルド後の確認（公開前の最終チェック）

```sh
npm run build
npm run preview
```

ブラウザで http://localhost:4173/ を開きます。GitHub Pages で公開されるもの（`dist/`）と同じ内容です。

どちらも、止めるときはターミナルで `Ctrl + C` を押します。

> **注意：** `dist/index.html` をダブルクリックして直接開くと（`file://`）、ブラウザが辞書データの読み込みをブロックするため正しく表示されません。必ず上のどちらかの方法で開いてください。

## 3. 単語を追加・修正する

`src/data/` の JSON ファイルを編集します。単語は `list_items` の中に1行ずつ文字列で書きます。

```json
{
    "list_items": [
        "沈殿池　ちんでんち　ອ່າງນໍ້ານອນ, ອ່າງຕົກຕະກອນ",
        "ろ過池　ろかち　ອ່າງຕອງ"
    ]
}
```

- 各行は `"` で囲み、行と行の間に `,` を付けます。**最後の行の後ろには `,` を付けません。**
- 書き方の順番（漢字　よみ　ラオ語 など）は自由です。検索は行全体の文字に対して行われます。
- 保存したら `npm run dev` で確認し、「5. 公開する」の手順で反映します。

どのファイルがどのタブに出るかは、上の表を見てください。

## 4. 水道用語辞典（waterSupply）を更新する

Water Supply タブの辞書は、別プロジェクト `waterSupply`（MawaSU2 の静的HTML辞書）から変換して作っています。
waterSupply 側で翻訳を追加・修正したら、次の手順で取り込み直します。

```sh
npm run import:water-supply
npm run build
```

- 初期設定では、このプロジェクトと同じ階層の `../waterSupply` フォルダを読み込みます。
  ```
  dic/
  ├─ nenthippavanh.github.io/   ← このプロジェクト
  └─ waterSupply/               ← 辞書の元データ（html/search/*.html）
  ```
  別の場所にある場合はパスを指定します：`npm run import:water-supply -- C:/path/to/waterSupply`
- 変換スクリプトは `scripts/import-water-supply.mjs` です。`public/water-supply/` の中身は毎回すべて作り直されるので、手で編集しないでください。
  - `index.json`：全エントリの見出し語（日本語・よみ・英語・ラオ語・タイ語）。起動時に読み込み、検索に使います。
  - `detail/<番号>.json`：解説と関連用語。エントリ番号の上3桁ごとに分けてあり、語をクリックしたときに必要な分だけ読み込みます。
  - `img/`：解説で使っている数式・図の画像。
- 実行すると件数などが表示されます。例：
  ```
  entries: 5094 (lao: 5094, thai: 2471)
  images copied: 348
  missing images (skipped): f03327.gif, m_5718.gif, f13981.gif
  ```
  `missing images` は元データ側に画像ファイルが無いもので、その画像は表示されません。
  `unexpected tags` や `unparsed pages` が表示された場合は、元のHTMLの書き方が想定と違うページがあるので確認してください。

### 検索のしくみ

- すべてのタブで、ひらがなとカタカナ、英字の大文字と小文字を区別せずに検索します（例：「ろたうい」で「ロタウイルス」が見つかります）。処理は `src/search.js` の `normalize` です。
- 日本語・ひらがな・カタカナ・英語・ラオ語・タイ語のどれでも検索できます。
- 辞書は旧表記（沈澱・濾過・攪拌・曝気・管渠）ですが、常用表記（沈殿・ろ過・撹拌・ばっ気・管きょ）でも見つかります。対応表は `src/search.js` の `KANJI_VARIANTS` です。
- Water Supply タブでは、見出し語が完全に一致するもの、前方一致するものが上に表示されます。

## 5. 公開する（GitHub Pages）

公開されるのはビルド結果の `dist/` フォルダです。変更したら必ずビルドしてから、`dist/` も一緒にコミットして push します。

```sh
npm run build
git add -A
git commit -m "変更内容"
git push
```

`vite.config.js` に `base: './'` を設定しているので、`dist/index.html` の中のパスは自動で相対パス（`./assets/...`）になります。手で直す必要はありません。

## フォルダ構成

```
├─ index.html                     開発用のHTML（ビルドで dist/index.html になる）
├─ vite.config.js                 Vite の設定
├─ package.json                   npm スクリプト（dev / build / preview / import:water-supply）
├─ scripts/
│   └─ import-water-supply.mjs    waterSupply の辞書を変換するスクリプト
├─ public/                        そのまま dist/ にコピーされるファイル
│   ├─ favicon.ico
│   └─ water-supply/              変換された水道用語辞典（自動生成）
├─ src/
│   ├─ main.js                    アプリの起動
│   ├─ App.vue                    ヘッダー、テーマ切替、タブ（開いているタブは URL の #general などで保持）
│   ├─ assets/main.css            Bootstrap に追加するアプリ独自のスタイル
│   ├─ components/
│   │   ├─ WordList.vue           検索欄付きの単語一覧（All Words / General / Health Care で共通）
│   │   ├─ WordItem.vue           単語1行の表示（日本語＋読み方、その下にラオ語）
│   │   └─ WordText.vue           読み方（（ひらがな））を小さく表示する部品
│   ├─ wordFormat.js              単語の行を「日本語／読み方／ラオ語」に分ける処理
│   ├─ Home.vue                   All Word
│   ├─ General.vue
│   ├─ WaterSupply.vue            手入力の単語 ＋ 水道用語辞典
│   ├─ HealthCare.vue
│   ├─ waterSupplyDictionary.js   水道用語辞典の読み込み
│   ├─ search.js                  検索用の文字の正規化（全タブ共通）
│   └─ data/                      単語リスト（JSON）
└─ dist/                          ビルド結果（GitHub Pages で公開）
```

## 補足

- `src/data/List.json` はどのタブでも使われていません。
- 水道用語辞典でラオ語が翻訳済みの見出し語は 2,798 語、タイ語は 2,436 語です。未翻訳の語は、ラオ語欄に日本語がそのまま表示されます。
