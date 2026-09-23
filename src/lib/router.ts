/**
 * 依存ライブラリを増やさないための、最小限のクライアントサイドルーター。
 */
import { useSyncExternalStore } from 'react'

const EVENT = 'app:navigate'

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(EVENT, callback)
  }
}

/** 末尾のスラッシュを取り除いたパス（"/" はそのまま） */
export function normalizePath(path: string): string {
  const p = path.replace(/\/+$/, '')
  return p === '' ? '/' : p
}

export function usePathname(): string {
  return useSyncExternalStore(
    subscribe,
    () => normalizePath(window.location.pathname),
    () => '/',
  )
}

export function navigate(to: string) {
  const hash = to.split('#')[1]
  if (to !== window.location.pathname + window.location.hash) {
    window.history.pushState(null, '', to)
    window.dispatchEvent(new Event(EVENT))
  }
  if (hash) {
    requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }))
  } else {
    window.scrollTo(0, 0)
  }
}
