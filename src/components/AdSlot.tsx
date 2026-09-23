import { adSlots, type AdSlotId } from '../config/ads.ts'

/**
 * 広告枠。広告タグを置いた静的HTMLを iframe で読み込みます。
 * - 枠の大きさを先に確保するので、広告の読み込みが遅い・失敗した場合もレイアウトがずれません
 * - 画面幅いっぱいの行の中央に置くので、幅320pxのスマホでも広告全体が表示されます
 *   （container の中に入れると左右の余白で幅が足りなくなるため、container で包まずに使ってください）
 */
export function AdSlot({ id }: { id: AdSlotId }) {
  const slot = adSlots[id]
  if (!slot.enabled) return null

  return (
    <aside className="ad-slot" aria-label={slot.label}>
      <p className="ad-slot__label">{slot.label}</p>
      <div className="ad-slot__frame-wrap" style={{ width: slot.width, height: slot.height }}>
        <iframe
          className="ad-slot__frame"
          src={slot.src}
          title={slot.label}
          width={slot.width}
          height={slot.height}
          loading="lazy"
          scrolling="no"
        />
      </div>
    </aside>
  )
}
