---
name: nextjs-conventions
description: |
  このプロジェクトのNext.js (App Router) 開発規約。ディレクトリ構成、Server/Client
  コンポーネントの境界、データフェッチとキャッシュ戦略、Server Actions、エラー/ローディング
  ハンドリング、環境変数の扱い方を定義する。Next.jsのコンポーネント・ルート・Server Action・
  API/Route Handler を新規作成または編集するとき、またデータフェッチやキャッシュの実装方針を
  決めるときは、たとえユーザーが規約に明示的に言及していなくても必ずこのスキルを参照すること。
---

# Next.js Conventions（プロジェクト規約）

このプロジェクトの App Router 実装ルール。新規ファイルを作る前・既存ファイルを編集する前にこれを確認し、判断に迷ったらここに書かれた既定値に従う。なぜそうするかも併記してあるので、状況が合わない場合は理由をもとに判断すること。

<!-- TODO: プロジェクト名・概要・主要技術スタックを1〜2行で書く -->
<!-- 例: ECサイトのフロント。Next.js 15 (App Router) / TypeScript / Tailwind / Drizzle + PostgreSQL / Vercel デプロイ -->

## ディレクトリ構成

- ルーティングは `app/` 配下。再利用ロジック・UIは `app/` の外（`components/`, `lib/`, `hooks/` 等）に置き、`app/` 内はルートに固有のものだけにする。これはルートツリーを読みやすく保つため。
- コロケーション可能なファイル（`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`）はそのルートディレクトリ内に置く。
- 共有UIは `components/`、純粋ロジック・データアクセスは `lib/`、クライアントフックは `hooks/` に分ける。

<!-- TODO: 実際のディレクトリ構成を貼る。例:
app/
  (marketing)/        # ルートグループ
  (app)/
    dashboard/
      page.tsx
      loading.tsx
components/ui/         # プリミティブ
components/features/   # 機能単位
lib/                   # data access, utils
-->

## Server / Client コンポーネントの境界

- **デフォルトは Server Component。** `"use client"` は本当に必要なときだけ付ける。クライアントバンドルを小さく保ち、データ取得をサーバー側に寄せるため。
- `"use client"` が必要なのは次の場合だけ: `useState`/`useEffect` 等のフック、イベントハンドラ（onClick 等）、ブラウザ専用API（window, localStorage）、Context Provider。
- `"use client"` は**できるだけ葉（leaf）に近いコンポーネントに付ける。** ページ全体をClient化せず、インタラクティブな小コンポーネントだけ切り出す。
- Client Component に渡す props は**シリアライズ可能な値のみ**。関数やクラスインスタンス、Dateそのものを境界越しに渡すとエラーになる。
- Server → Client へデータを渡すときは、Server Component でフェッチして必要な部分だけ props で渡す。Client 側で fetch しない（ウォーターフォールと認証漏れを避けるため）。

## データフェッチとキャッシュ

- データ取得は基本 Server Component 内で行う。
- `fetch` のキャッシュ方針を**明示する**。既定の挙動に依存して「なぜか古い/毎回叩く」状態を避けるため。
  - 変化しない/低頻度更新: `fetch(url, { next: { revalidate: <秒> } })`
  - 常に最新が必要: `fetch(url, { cache: "no-store" })`
- 複数の独立したフェッチは `Promise.all` で並列化し、ウォーターフォールを避ける。
- DB直アクセス（ORM等）の場合は `cache()` / `unstable_cache` でリクエスト内重複を排除する。

<!-- TODO: このプロジェクトのデータ層を書く。
例: データアクセスは lib/data/*.ts に集約。コンポーネントから直接ORMを呼ばず、必ずdata層関数経由。
revalidate の既定は 60秒。ユーザー固有データは no-store。 -->

## Server Actions と Route Handler の使い分け

- フォーム送信・ミューテーション（作成/更新/削除）は **Server Actions** を使う。
- 外部から叩かれるAPI、Webhook、サードパーティ連携、非フォームのJSON APIは **Route Handler (`route.ts`)** を使う。
- Server Action 内では必ず: (1) 入力バリデーション（<!-- TODO: zod など -->）、(2) 認可チェック、(3) 成功後の `revalidatePath` / `revalidateTag`。
- Server Action は `"use server"` を付け、`lib/actions/` に集約する。<!-- TODO: 置き場所を確定 -->

## ローディングとエラー

- 非同期データを持つルートには `loading.tsx`（Suspense フォールバック）を置く。
- ルート単位のエラーは `error.tsx`（Client Component、`reset` を受け取る）で捕捉する。
- 想定内の「データ無し」は `not-found.tsx` + `notFound()` を使い、エラーと区別する。

## 環境変数

- ブラウザに露出してよい変数だけ `NEXT_PUBLIC_` を付ける。シークレット（APIキー、DB接続文字列）には**絶対に付けない**。Client Component からサーバー専用の env を参照しないこと。漏洩を防ぐため。
- env のスキーマ検証を入れる。<!-- TODO: @t3-oss/env-nextjs など使うなら明記 -->

## TypeScript / コード規約

- <!-- TODO: strict設定、any禁止ポリシー、import順、命名規則などを書く -->
- <!-- TODO: コンポーネントの props 型定義スタイル（type vs interface）など -->

## スタイリング

- <!-- TODO: Tailwind / CSS Modules / vanilla-extract など採用方針と、クラス命名・共通トークンの場所 -->

## 状態管理

- <!-- TODO: サーバー状態（fetch/RSC）とクライアント状態の境界。Zustand / Jotai / Context のどれをいつ使うか -->

## やってはいけない（このプロジェクトのアンチパターン）

- ページ全体への安易な `"use client"` 付与。
- Client Component 内での直接データフェッチ（Server側に寄せる）。
- `fetch` のキャッシュ指定を省略して既定挙動に依存すること。
- シークレット env への `NEXT_PUBLIC_` 付与。
- <!-- TODO: 過去にハマった固有のNG例を追記していくと精度が上がる -->

## 確認チェックリスト（コンポーネント/ルート追加時）

1. Server で済むものを不要に Client にしていないか
2. `fetch` のキャッシュ方針を明示したか
3. Server Action に バリデーション・認可・revalidate を入れたか
4. `loading.tsx` / `error.tsx` が必要なルートに揃っているか
5. シークレットをクライアントに露出していないか
