/**
 * 診断ページの「この診断で比較している商品」に表示する主な仕様（診断ごとに設定）。
 * - 値は各診断の商品データ（products[].attributes）から読み取るだけで、ここに仕様の値は書きません（二重管理しない）
 * - メーカーが公表していない値（'unknown'）は「公表なし」と表示し、推測で埋めません
 * - ここに設定がある診断だけ一覧を表示します（試作：高圧洗浄機・USB-Cハブ）
 */
import type { AttrValue } from '../types/diagnosis.ts'

type Attrs = Record<string, AttrValue>
export interface CatalogSpec {
  label: string
  value: (a: Attrs) => string
}

const known = (v: AttrValue | undefined) => v !== undefined && v !== 'unknown' && v !== ''
const num = (v: AttrValue | undefined, unit: string) => (known(v) ? `${v}${unit}` : '公表なし')
const yesNo = (v: AttrValue | undefined) => (v === true ? 'あり' : v === false ? 'なし' : '公表なし')

/**
 * officialSpecUrl が製品ごとのページではなく、複数の型番を載せたシリーズ一覧ページの商品。
 * リンク文言を「メーカー公式の製品情報（シリーズ一覧）」にして、製品個別のページと誤認されないようにする
 */
export const seriesListSpecUrlProductIds = new Set(['pressure-washer-113', 'pressure-washer-114', 'pressure-washer-115'])

/**
 * 一覧に表示する型番の上書き（表示専用）。商品データの exactSku は販売ページの照合に使うため変更せず、
 * 販売上の補足（販売店の型番・カラーなど）を含む場合だけ、ここで一覧の表示を整える
 */
export const catalogDisplayModel: Record<string, string> = {
  'usb-c-hub-102': 'A8340',
}

/** 最初から表示する商品数（残りは開閉式。HTMLには全件を出力する） */
export const catalogInitialCount = 3

export const productCatalogSpecs: Record<string, CatalogSpec[]> = {
  'pressure-washer': [
    { label: '電源', value: (a) => (a.powerType === 'battery' ? '充電式（コードレス）' : `AC100V・${String(a.supportedFrequencies)}`) },
    { label: '圧力', value: (a) => `常用 ${num(a.workingPressureMPa, 'MPa')}／最大許容 ${num(a.maximumPressureMPa, 'MPa')}` },
    {
      label: '給水方法',
      value: (a) =>
        [a.directTapSupported === true && '水道直結', a.selfSuctionWithIncludedParts === true && 'バケツなどから自吸（付属品で可）', a.integratedTankIncluded === true && `付属タンク（${String(a.tankCapacityLiters)}L）`]
          .filter(Boolean)
          .join('・') || '公表なし',
    },
    {
      label: 'ホース・質量',
      value: (a) => `高圧ホース ${a.powerType === 'battery' ? '—（ハンディ型）' : num(a.highPressureHoseLengthMeters, 'm')}・本体 ${num(a.productWeightKg, 'kg')}`,
    },
  ],
  'usb-c-hub': [
    {
      label: '映像出力',
      value: (a) =>
        [
          Number(a.hdmiPortCount) > 0 && `HDMI×${String(a.hdmiPortCount)}（最大${String(a.maximumHdmiResolution)}/${String(a.maximumHdmiRefreshHz)}Hz）`,
          Number(a.displayPortCount) > 0 && `DisplayPort×${String(a.displayPortCount)}`,
          Number(a.vgaPortCount) > 0 && `VGA×${String(a.vgaPortCount)}`,
          Number(a.usbCVideoPortCount) > 0 && `映像出力対応USB-C×${String(a.usbCVideoPortCount)}`,
        ]
          .filter(Boolean)
          .join('・') || 'なし',
    },
    { label: 'USB端子', value: (a) => `USB-A×${String(a.usbAPortCount)}・データ用USB-C×${String(a.usbCDataPortCount)}（最大${num(a.maximumUsbDataGbps, 'Gbps')}）` },
    { label: '有線LAN／カード', value: (a) => `有線LAN ${yesNo(a.ethernetSupported)}・SD ${yesNo(a.sdSlotSupported)}・microSD ${yesNo(a.microSdSlotSupported)}` },
    {
      label: '給電・質量',
      value: (a) => `PCへの給電 ${a.pdMaximumHostOutputWatts === 0 ? '非対応' : `最大${num(a.pdMaximumHostOutputWatts, 'W')}`}・本体 ${num(a.weightGrams, 'g')}`,
    },
  ],
}
