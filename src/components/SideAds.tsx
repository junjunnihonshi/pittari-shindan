import { useMediaQuery } from '../lib/mediaQuery.ts'
import { AdSlot } from './AdSlot.tsx'

/** 左右の広告を出す画面幅（中央コンテンツの外側に 300px の広告と余白が収まる幅） */
const SIDE_ADS_QUERY = '(min-width: 1585px)'

/**
 * PC幅の左右広告（300×250・スクロールに追従）。トップページと診断ページで共通に使います。
 * - 中央コンテンツの外側に絶対配置するので、中央コンテンツの幅・位置は変わりません。
 *   親要素（.side-ad-host / .home-body）の高さいっぱいのレールの中で、広告が sticky で追従します
 * - 幅が足りない画面では描画しません（非表示の iframe でも広告が読み込まれてしまうため、CSS で隠すだけにしない）
 * - ページを移動するとページごと描き直されるので、広告も読み込み直されます。
 *   診断の質問を進めるだけでは描き直されません（同じページ内の表示切り替えのため）
 */
export function SideAds() {
  const show = useMediaQuery(SIDE_ADS_QUERY)
  if (!show) return null
  return (
    <>
      <div className="side-ad-rail side-ad-rail--left">
        <AdSlot id="sideLeft" variant="side" />
      </div>
      <div className="side-ad-rail side-ad-rail--right">
        <AdSlot id="sideRight" variant="side" />
      </div>
    </>
  )
}
