---
name: word-list-site
description: 日本語・ラオ語・タイ語の単語帳サイト（nenthippavanh.github.io、Vue 3 + Vite、GitHub Pages で dist/ を公開）の作業手順。単語の追加・修正（src/data/*.json）、水道用語辞典を ../waterSupply から取り込み直す（npm run import:water-supply）、ビルド、ローカル確認、コミット・公開のときは必ずこのスキルを使う。「単語を追加して」「辞書を更新して」「waterSupply の翻訳を反映して」「ビルドして」「変更をコミットして」「公開して」「検索で〜が出ない」など、このリポジトリでデータ・画面・dist に触れる作業全般が対象。
---

# 単語帳サイトの作業手順

このリポジトリは Vue 3 + Vite の単語帳アプリで、**ビルド結果の `dist/` をそのまま GitHub Pages で公開**している（https://nenthippavanh.github.io/dist/ ）。
つまり `src/` や `public/` を変えても、ビルドして `dist/` をコミット・push しない限りサイトには反映されない。この点がすべての手順の前提になる。

詳しい説明は `README.md` にある（ユーザー向けの日本語ドキュメント）。手順を変えたら README も合わせて直す。

## 全体像

| タブ | データ | 編集方法 |
| --- | --- | --- |
| General | `src/data/GeneralList.json` | 手で編集 |
| Water Supply | `src/data/WaterSupplyList.json` ＋ `public/water-supply/`（水道用語辞典 MawaSU2、5,094語） | JSON は手で編集、辞典は**自動生成** |
| Health Care | `src/data/HealthCareList.json` | 手で編集 |
| All Words | 上のすべて | — |

- `src/data/List.json` はどのタブでも使っていない。
- 検索の正規化（ひらがな/カタカナ、大文字/小文字、旧字体→常用表記）は `src/search.js` の `normalize` と `KANJI_VARIANTS`。全タブ共通。
- 単語の行を「日本語／読み方／ラオ語」に分けるのは `src/wordFormat.js`。

## node / npm の実行

Git Bash では `node` が PATH に無いことがあるので、`npm` や `node` は **PowerShell ツール**で実行する。

## 作業1：単語を追加・修正する（src/data/*.json）

各ファイルは `{"list_items": ["...", "..."]}` の形で、1単語＝1つの文字列。

- よく使う書き方：`"沈殿池　ちんでんち　ອ່າງນໍ້ານອນ"`（全角スペース区切り）や `"景観（けいかん）　ທັດສະນີຍະພາບ"`。既存の行の書き方に合わせる。
- 検索は行全体に対して行われるので、順番は厳密でなくてよい。ただし表示は `wordFormat.js` が分解するので、既存の行と同じパターンにしておくと崩れない。
- 編集後は JSON として壊れていないか確認する（最後の要素の後ろに `,` があると読めなくなる）：
  ```powershell
  node -e "for (const f of ['General','WaterSupply','HealthCare']) JSON.parse(require('fs').readFileSync('src/data/'+f+'List.json','utf8'))"
  ```

## 作業2：水道用語辞典を取り込み直す（public/water-supply/）

辞典の元データは隣のフォルダ `../waterSupply`（`html/search/NNNNN.html`、UTF-16LE）。翻訳作業はそちらのリポジトリで行い、そちらに独自の `CLAUDE.md` と `tools/tr/` の翻訳パイプラインがある。**このリポジトリの `public/water-supply/` は毎回まるごと作り直されるので、手で編集しない**（直しても次の取り込みで消える）。翻訳の誤りは `../waterSupply` 側で直す。

```powershell
npm run import:water-supply      # 別の場所なら: npm run import:water-supply -- C:/path/to/waterSupply
```

出力の読み方：
- `entries: 5094 (lao: …, thai: …)` — 件数。5094 から大きく減っていたら元データの読み込みに問題がある。
- `missing images (skipped): f03327.gif, m_5718.gif, f13981.gif` — この3つは元データに無い既知のもの。これ以外が増えたら報告する。
- `unparsed pages` や `unexpected tags` — 元の HTML の書き方が想定外。該当ページを開いて原因を確認し、ユーザーに伝える（`scripts/import-water-supply.mjs` の修正が必要なこともある）。

取り込み後、変更範囲を確認する：`git diff --stat public/water-supply` と、`git diff --word-diff` で数件の中身を見て、何が変わったか（タイ語の追加、ラオ語の翻訳、解説の修正など）を把握する。これがコミットメッセージの材料になる。

### README の翻訳件数を更新する

`README.md` の「補足」に「ラオ語が翻訳済みの見出し語は N 語、タイ語は N 語」とある。取り込みで件数が変わったら更新する。数え方（ラオ語は日本語のままでないもの）：

```powershell
node -e "const L=require('./public/water-supply/index.json');console.log('lao', L.filter(e=>e.lo&&e.lo!==e.ja).length, 'thai', L.filter(e=>e.th).length)"
```

## 作業3：ビルドと確認

```powershell
npm run build      # dist/ を作り直す（public/ も dist/ にコピーされる）
```

- 画面の確認：`npm run dev`（http://localhost:5173/ ）か、ビルド後に `npm run preview`（http://localhost:4173/ 、公開と同じ内容）。どちらも長く動き続けるので `run_in_background` で起動し、終わったら止める。
- `dist/index.html` を直接開く（`file://`）と辞書データが読めず表示されない。これはバグではない。
- `vite.config.js` の `base: './'` により `dist/` 内のパスは相対パスになる。手で直す必要はない。
- データだけ変えたときでも、`public/` と `dist/` の両方が変わる。`diff -rq public/water-supply dist/water-supply` で一致を確認できる。

## 作業4：コミットと公開

このリポジトリの慣習では、**元の変更とビルド結果を別々のコミット**にする：

1. `public/`・`src/`・`README.md` などの変更 → 内容を表す英語のメッセージ
   例：`add Thai and Lao translations to water supply dictionary`、`add word into HealthCareList.json`、`redesign with Bootstrap 5.3`
2. `dist/` の変更 → `run build of <1 と同じ内容>`
   例：`run build of water supply Thai and Lao translations`

メッセージは小文字始まりの短い英語。本文に何をどれくらい変えたか（件数・範囲など）を書くとよい。

### dist/assets の「見かけだけの変更」に注意

`core.autocrlf=true` のため、`dist/assets/*.css`・`dist/assets/*.js`・`dist/index.html` が `git status` で `M` と表示されても、中身は同じで改行コードだけが違う、ということがよくある。コミット前に確認する：

```bash
git diff --numstat dist/assets dist/index.html
```

何も出なければ実際の変更は無いのでコミットに含めない（含めても差分は空）。`src/` を変えてビルドした場合はファイル名のハッシュが変わり、古いファイルの削除と新しいファイルの追加になるので、`git add -A dist` で削除も含めて記録する。

### push

コミットまで頼まれたらコミットだけ行い、push はユーザーが頼んだときだけ行う（push すると数分で公開サイトに反映される）。

## チェックリスト（データを変えたとき）

1. 編集 or `npm run import:water-supply`
2. JSON の確認／取り込み出力の確認
3. 必要なら README の件数・説明を更新
4. `npm run build`
5. コミット1（元の変更）→ コミット2（`run build of …`）。改行コードだけの dist/assets は含めない
6. 頼まれたら push
