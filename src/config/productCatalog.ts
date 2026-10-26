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
const txt = (v: AttrValue | undefined) => (known(v) ? String(v) : '公表なし')

/**
 * 仕様リンク（attributes.officialSpecUrl）の種類と表示文言。製品ごとの公式ページ以外を参照している商品だけ
 * catalogSpecLinkKind に種類を設定する（URL自体は変えない）。メーカー公式と国内正規代理店は区別する
 */
export const catalogSpecLinkLabels = {
  product: 'メーカー公式の製品情報',
  series: 'メーカー公式の製品情報（シリーズ一覧）',
  news: 'メーカー公式ニュースリリース',
  store: 'メーカー公式ストアの商品情報',
  datasheet: 'メーカー公式データシート（PDF）',
  distributor: '国内正規代理店の商品情報',
  category: 'メーカー公式の製品一覧',
  support: 'メーカー公式のサポート情報',
  mixedGenerations: 'メーカー公式の製品情報（旧モデル・V2併載）',
  reference: '参考資料',
} as const
export type CatalogSpecLinkKind = keyof typeof catalogSpecLinkLabels

/** 製品ごとの公式ページ（product）以外を参照している商品の、リンクの種類 */
export const catalogSpecLinkKind: Record<string, CatalogSpecLinkKind> = {
  // 複数の型番を載せたシリーズ一覧ページ
  'pressure-washer-113': 'series',
  'pressure-washer-114': 'series',
  'pressure-washer-115': 'series',
  'wireless-keyboard-106': 'news',
  'mobile-monitor-115': 'news',
  'mobile-monitor-114': 'store',
  'external-ssd-114': 'datasheet',
  'external-ssd-111': 'distributor',
  'external-ssd-112': 'distributor',
  // Webカメラ：ロジクールはWebカメラの製品一覧ページ、EMEET C960 はサポートページを参照している（製品ごとの仕様ページではない）
  'webcam-101': 'category',
  'webcam-102': 'category',
  'webcam-103': 'category',
  'webcam-104': 'category',
  'webcam-105': 'category',
  'webcam-106': 'category',
  'webcam-113': 'support',
  // ポータブル電源：DJI は公式ストアの商品ページ。Jackery 2000 New V2 は旧モデル（JE-2000D・2042Wh）と V2 を同じページに載せている
  'portable-power-station-111': 'store',
  'portable-power-station-113': 'mixedGenerations',
}

/**
 * brand 属性（メーカーの分類キー）と、商品名で使われている別表記。
 * 商品名に brand かその別表記が含まれていれば、メーカー名を重ねて表示しない（データは変更しない）
 */
export const catalogBrandAliases: Record<string, string[]> = {
  ELECOM: ['エレコム'],
  Logicool: ['ロジクール'],
  BUFFALO: ['バッファロー'],
}

/**
 * 一覧に表示する型番の上書き（表示専用）。商品データの exactSku は販売ページの照合に使うため変更せず、
 * 販売上の補足（販売店の型番・カラーなど）を含む場合だけ、ここで一覧の表示を整える
 */
export const catalogDisplayModel: Record<string, string> = {
  'usb-c-hub-102': 'A8340',
  // 防犯カメラ：exactSku は JAN・構成（本体のみ・ソーラーパネル同梱など）を含むため、一覧では型番だけを表示する（構成は商品名と仕様で表示）
  'security-camera-101': 'Tapo C220',
  'security-camera-102': 'Tapo C230',
  'security-camera-103': 'Tapo C250',
  'security-camera-104': 'Tapo C236',
  'security-camera-105': 'Tapo C520WS',
  'security-camera-106': 'Tapo C560WS',
  'security-camera-107': 'Tapo C425',
  'security-camera-108': 'Tapo C460 KIT',
  'security-camera-109': 'Tapo C610 KIT',
  'security-camera-110': 'T8416521',
  'security-camera-111': 'T8110421',
  'security-camera-113': 'T81723W1',
  'security-camera-115': 'W4102000',
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

  // ---- 横展開 第1グループ ----
  'mobile-monitor': [
    { label: '画面', value: (a) => `${num(a.screenInch, '型')}・${txt(a.resolutionWidth)}×${txt(a.resolutionHeight)}・リフレッシュレート ${num(a.refreshHz, 'Hz')}・${txt(a.panelType)}` },
    {
      label: '映像入力・給電',
      value: (a) => `USB-C ${yesNo(a.usbCVideoInput)}・HDMI ${yesNo(a.hdmiVideoInput)}・PCへのパススルー給電 ${a.pdPassthroughW === 0 ? 'なし' : `最大${num(a.pdPassthroughW, 'W')}`}`,
    },
    { label: '重さ・機能', value: (a) => `本体 ${num(a.weightGrams, 'g')}・タッチ操作 ${yesNo(a.touchSupported)}・スピーカー ${yesNo(a.speakers)}` },
  ],
  'wireless-mouse': [
    {
      label: '接続',
      value: (a) =>
        `Bluetooth ${yesNo(a.bluetooth)}・USBレシーバー ${a.receiverIncluded === true ? `付属（${txt(a.receiverPort)}）` : a.receiverIncluded === false ? 'なし' : '公表なし'}・接続台数 ${num(a.multiDeviceCount, '台')}`,
    },
    { label: '形状・ボタン', value: (a) => `${a.trackball === true ? 'トラックボール' : '一般的なマウス'}・ボタン ${num(a.buttonCount, '個')}・静音クリック ${yesNo(a.silentClick)}` },
    { label: '電源・重さ', value: (a) => `${txt(a.powerSource)}・本体 ${num(a.weightGrams, 'g')}` },
  ],
  'wireless-keyboard': [
    {
      label: '接続',
      value: (a) =>
        `Bluetooth ${yesNo(a.bluetoothSupported)}・USBレシーバー ${a.usbReceiverIncluded === true ? `付属（${txt(a.receiverConnector)}）` : a.usbReceiverIncluded === false ? 'なし' : '公表なし'}・接続台数 ${num(a.multiDeviceCount, '台')}`,
    },
    { label: '配列・キー', value: (a) => `${txt(a.layout)}・${txt(a.keySwitchType)}` },
    { label: '静音・電源', value: (a) => `静音設計 ${yesNo(a.quietDesign)}・${txt(a.batteryLife)}・バックライト ${yesNo(a.hasBacklight)}` },
  ],
  'usb-microphone': [
    {
      label: '方式・指向性',
      value: (a) => `${a.microphoneType === 'condenser' ? 'コンデンサー' : a.microphoneType === 'dynamic' ? 'ダイナミック' : txt(a.microphoneType)}・${txt(a.polarPatterns)}`,
    },
    { label: '接続', value: (a) => `USB ${yesNo(a.usbSupported)}・XLR ${yesNo(a.xlrSupported)}・ヘッドホン端子 ${yesNo(a.headphoneOutput)}` },
    { label: 'ミュート・音量', value: (a) => `ミュート ${txt(a.hardwareMute)}・ゲイン調整 ${txt(a.onboardGain)}` },
  ],
  'external-ssd': [
    { label: '容量・規格', value: (a) => `${txt(a.capacityLabel)}・${txt(a.usbStandard)}` },
    { label: '転送速度', value: (a) => txt(a.speedNote) },
    {
      label: '接続・付属品',
      value: (a) =>
        `${txt(a.directlyAttachedConnector)}・付属：${
          [a.includedCtoACable === true && 'USB-C to Aケーブル', a.includedCtoCCable === true && 'USB-C to Cケーブル', known(a.includedAdapter) && a.includedAdapter !== false && String(a.includedAdapter)]
            .filter(Boolean)
            .join('・') || 'なし'
        }`,
    },
    { label: '耐久性', value: (a) => `防水・防塵 ${txt(a.waterproofIPRating)}・耐衝撃 ${txt(a.dropResistance)}` },
  ],
  'security-camera': [
    {
      label: '設置場所',
      value: (a) => (a.intendedLocation === 'indoor' ? '屋内専用' : `${a.intendedLocation === 'both' ? '屋内外' : '屋外'}（${txt(a.ipRating)}）`),
    },
    { label: '画質', value: (a) => txt(a.videoResolution) },
    { label: '電源', value: (a) => (a.batteryPowered === true ? `バッテリー内蔵${a.solarPanelIncluded === true ? '・ソーラーパネル同梱' : ''}` : 'コンセント（AC給電）') },
    {
      label: '首振り・追尾',
      value: (a) => `首振り ${a.panTiltRange === '—' ? 'なし' : txt(a.panTiltRange)}・自動追尾 ${a.autoTrackingConfirmed === true ? 'あり' : 'なし'}`,
    },
    {
      label: '録画',
      value: (a) => `通常の24時間連続録画 ${a.continuousRecordingConfirmed === true ? '対応' : '対応を確認できず'}・${txt(a.localStorageType)}`,
    },
  ],

  // ---- 横展開 第2グループ ----
  webcam: [
    { label: '画質', value: (a) => `${txt(a.videoResolutionWidth)}×${txt(a.videoResolutionHeight)}・${txt(a.fpsByResolution)}` },
    {
      label: 'ピント・視野角',
      value: (a) => {
        const deg = (v: AttrValue | undefined) => String(v).replace(/^([\d/]+)/, '$1°')
        const fov =
          [known(a.horizontalFovDegrees) && `水平${deg(a.horizontalFovDegrees)}`, known(a.diagonalFovDegrees) && `対角${deg(a.diagonalFovDegrees)}`].filter(Boolean).join('・') ||
          txt(a.fovNote)
        return `オートフォーカス ${yesNo(a.autofocus)}・視野角 ${fov}`
      },
    },
    { label: '接続・マイク', value: (a) => `${txt(a.usbHostConnector)}・マイク ${txt(a.builtInMicrophone)}` },
    {
      label: 'プライバシー・補正',
      value: (a) => `プライバシーカバー ${yesNo(a.physicalPrivacyCover)}・自動フレーミング ${yesNo(a.autoFraming)}・明るさ補正 ${txt(a.lowLightCorrection)}`,
    },
  ],
  'portable-power-station': [
    { label: '容量・出力', value: (a) => `容量 ${num(a.capacityWh, 'Wh')}・AC定格出力 ${num(a.ratedAcW, 'W')}・容量の拡張 ${yesNo(a.expandable)}` },
    { label: '出力端子', value: (a) => `AC ${num(a.acPorts, '口')}・USB-C ${known(a.usbCMaxW) ? `最大${String(a.usbCMaxW)}W` : '公表なし'}` },
    {
      label: '充電',
      value: (a) => `AC充電で満充電まで ${num(a.fullAcChargeMinutes, '分')}・ソーラー充電 ${yesNo(a.solarCompatible)}・シガーソケット充電 ${yesNo(a.carChargingSupported)}`,
    },
    { label: '重さ・電池', value: (a) => `本体 ${num(a.weightKg, 'kg')}・${txt(a.batteryChemistry)}` },
  ],
}
