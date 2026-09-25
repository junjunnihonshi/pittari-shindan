/**
 * ビルド時のプリレンダリング用の入口（scripts/seoPlugin.ts から読み込む。ブラウザでは使わない）。
 * ページの最初の表示内容を HTML にして、JavaScript を実行しない検索エンジンにも本文を読めるようにする。
 * ブラウザでは main.tsx の createRoot がこの HTML を同じ内容で描き直すため、hydration は行わない。
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import { setPrerenderPath } from './lib/router.ts'

export function render(path: string): string {
  setPrerenderPath(path)
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
