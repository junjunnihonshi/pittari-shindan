/**
 * 選び方コラムの一覧。
 * 記事を追加するときは、このフォルダに記事ファイルを作り、下の columns に追加するだけで
 * コラム一覧・記事ページ・sitemap.xml・プリレンダリングに反映されます。
 */
import { airConditionerHowToChoose } from './airConditionerHowToChoose.ts'
import { airConditionerLifespan } from './replacement/airConditionerLifespan.ts'
import { airPurifierLifespan } from './replacement/airPurifierLifespan.ts'
import { dehumidifierLifespan } from './replacement/dehumidifierLifespan.ts'
import { dishwasherLifespan } from './replacement/dishwasherLifespan.ts'
import { hairDryerLifespan } from './replacement/hairDryerLifespan.ts'
import { microwaveLifespan } from './replacement/microwaveLifespan.ts'
import { refrigeratorLifespan } from './replacement/refrigeratorLifespan.ts'
import { riceCookerLifespan } from './replacement/riceCookerLifespan.ts'
import { robotVacuumLifespan } from './replacement/robotVacuumLifespan.ts'
import { tvLifespan } from './replacement/tvLifespan.ts'
import { vacuumLifespan } from './replacement/vacuumLifespan.ts'
import { washingMachineLifespan } from './replacement/washingMachineLifespan.ts'
import { airFryerHowToChoose } from './airFryerHowToChoose.ts'
import { airPurifierHowToChoose } from './airPurifierHowToChoose.ts'
import { blenderHowToChoose } from './blenderHowToChoose.ts'
import { bluetoothSpeakerHowToChoose } from './bluetoothSpeakerHowToChoose.ts'
import { bodySoapHowToChoose } from './bodySoapHowToChoose.ts'
import { circulatorFanHowToChoose } from './circulatorFanHowToChoose.ts'
import { coffeeMakerHowToChoose } from './coffeeMakerHowToChoose.ts'
import { dehumidifierHowToChoose } from './dehumidifierHowToChoose.ts'
import { deskChairHowToChoose } from './deskChairHowToChoose.ts'
import { dishwasherHowToChoose } from './dishwasherHowToChoose.ts'
import { electricBlanketHowToChoose } from './electricBlanketHowToChoose.ts'
import { electricKettleHowToChoose } from './electricKettleHowToChoose.ts'
import { electricPressureCookerHowToChoose } from './electricPressureCookerHowToChoose.ts'
import { electricToothbrushHowToChoose } from './electricToothbrushHowToChoose.ts'
import { fryingPanHowToChoose } from './fryingPanHowToChoose.ts'
import { hairDryerHowToChoose } from './hairDryerHowToChoose.ts'
import { hairIronHowToChoose } from './hairIronHowToChoose.ts'
import { hairTreatmentHowToChoose } from './hairTreatmentHowToChoose.ts'
import { heaterHowToChoose } from './heaterHowToChoose.ts'
import { hotPlateHowToChoose } from './hotPlateHowToChoose.ts'
import { humidifierHowToChoose } from './humidifierHowToChoose.ts'
import { mattressHowToChoose } from './mattressHowToChoose.ts'
import { mensShaverHowToChoose } from './mensShaverHowToChoose.ts'
import { microwaveHowToChoose } from './microwaveHowToChoose.ts'
import { mobileBatteryHowToChoose } from './mobileBatteryHowToChoose.ts'
import { monitorHowToChoose } from './monitorHowToChoose.ts'
import { pillowHowToChoose } from './pillowHowToChoose.ts'
import { printerHowToChoose } from './printerHowToChoose.ts'
import { projectorHowToChoose } from './projectorHowToChoose.ts'
import { refrigeratorHowToChoose } from './refrigeratorHowToChoose.ts'
import { riceCookerHowToChoose } from './riceCookerHowToChoose.ts'
import { robotVacuumHowToChoose } from './robotVacuumHowToChoose.ts'
import { shampooHowToChoose } from './shampooHowToChoose.ts'
import { showerHeadHowToChoose } from './showerHeadHowToChoose.ts'
import { smartwatchHowToChoose } from './smartwatchHowToChoose.ts'
import { soundbarHowToChoose } from './soundbarHowToChoose.ts'
import { suitcaseHowToChoose } from './suitcaseHowToChoose.ts'
import { tabletHowToChoose } from './tabletHowToChoose.ts'
import { toasterHowToChoose } from './toasterHowToChoose.ts'
import { tvHowToChoose } from './tvHowToChoose.ts'
import { vacuumHowToChoose } from './vacuumHowToChoose.ts'
import { washingMachineHowToChoose } from './washingMachineHowToChoose.ts'
import { wifiRouterHowToChoose } from './wifiRouterHowToChoose.ts'
import { wirelessEarbudsHowToChoose } from './wirelessEarbudsHowToChoose.ts'

export interface Column {
  /** URL の一部（/column/<slug>/） */
  slug: string
  /** 記事タイトル（<title>・H1 に使用） */
  title: string
  /** パンくずなどで使う短いタイトル */
  shortTitle: string
  /** meta description・コラム一覧のカードの説明文 */
  description: string
  /** カテゴリ名（表示用） */
  category: string
  /** 公開日（YYYY-MM-DD） */
  publishedAt: string
  /**
   * 関連する診断のID。本文の「→」行はこの診断へのリンクになります。
   * 選び方コラム（columns）は、その診断ページからこの記事へリンクされます（診断と1対1）
   */
  relatedDiagnosisId?: string
  /** 記事の種類。未指定は選び方コラム、'replacement' は買い替え時期コラム（replacementColumns に登録） */
  articleType?: 'replacement'
  /** 買い替え時期コラムが対応する選び方コラムの slug（選び方コラムの末尾から、この記事へリンクします） */
  guideSlug?: string
  /** コラム一覧の検索にだけ使うキーワード */
  searchKeywords?: string[]
  /** 診断ページに表示するこの記事へのリンク文言 */
  relatedLinkLabel?: string
  /**
   * 本文。「## 見出し」「### 小見出し」「- 箇条書き」「1. 番号付きリスト」「→ 診断へのリンク」と、
   * 空行区切りの段落で書きます（空行の後の「→」の行は relatedDiagnosisId の診断へのリンクになります）。
   * 比較表は「[表] キャプション」の次の行から「| 見出し | … |」「|---|」「| 行 | … |」と書き、直後の「※」行は表の注記になります。
   * 段落の中の「[文字](サイト内のURL)」はリンクになります。
   */
  body: string
}

/** 一覧には公開日の新しい順に表示（同じ公開日の記事はこの配列の順） */
export const columns: Column[] = [
  shampooHowToChoose,
  hairTreatmentHowToChoose,
  bodySoapHowToChoose,
  bluetoothSpeakerHowToChoose,
  blenderHowToChoose,
  soundbarHowToChoose,
  circulatorFanHowToChoose,
  suitcaseHowToChoose,
  hotPlateHowToChoose,
  hairIronHowToChoose,
  fryingPanHowToChoose,
  dehumidifierHowToChoose,
  showerHeadHowToChoose,
  airFryerHowToChoose,
  projectorHowToChoose,
  electricToothbrushHowToChoose,
  toasterHowToChoose,
  mensShaverHowToChoose,
  smartwatchHowToChoose,
  pillowHowToChoose,
  deskChairHowToChoose,
  electricKettleHowToChoose,
  electricBlanketHowToChoose,
  monitorHowToChoose,
  coffeeMakerHowToChoose,
  heaterHowToChoose,
  airPurifierHowToChoose,
  dishwasherHowToChoose,
  humidifierHowToChoose,
  tabletHowToChoose,
  mobileBatteryHowToChoose,
  vacuumHowToChoose,
  microwaveHowToChoose,
  hairDryerHowToChoose,
  printerHowToChoose,
  wifiRouterHowToChoose,
  electricPressureCookerHowToChoose,
  riceCookerHowToChoose,
  robotVacuumHowToChoose,
  wirelessEarbudsHowToChoose,
  washingMachineHowToChoose,
  tvHowToChoose,
  mattressHowToChoose,
  airConditionerHowToChoose,
  refrigeratorHowToChoose,
]

/**
 * 買い替え時期コラム。選び方コラム（columns）とは別に管理し、診断との1対1対応・関連コラムの検査の対象にしない。
 * 記事ページ・コラム一覧・sitemap.xml・プリレンダリングには allColumns として反映されます。
 */
export const replacementColumns: Column[] = [
  washingMachineLifespan,
  refrigeratorLifespan,
  riceCookerLifespan,
  airConditionerLifespan,
  microwaveLifespan,
  vacuumLifespan,
  tvLifespan,
  dehumidifierLifespan,
  robotVacuumLifespan,
  dishwasherLifespan,
  airPurifierLifespan,
  hairDryerLifespan,
]

/** 公開中のすべてのコラム（選び方＋買い替え時期） */
export const allColumns: Column[] = [...columns, ...replacementColumns]

export function columnPath(slug: string): string {
  return `/column/${slug}/`
}

export function getColumnBySlug(slug: string): Column | undefined {
  return allColumns.find((c) => c.slug === slug)
}

/** 選び方コラムに対応する買い替え時期コラム */
export function getReplacementColumnsForGuide(guideSlug: string): Column[] {
  return replacementColumns.filter((c) => c.guideSlug === guideSlug)
}

/** データの確認用：slug の重複、買い替え時期コラムの対応先・種別の誤り（ビルド時の検査に使う） */
export function findColumnProblems(): string[] {
  const problems: string[] = []
  const slugs = allColumns.map((c) => c.slug)
  for (const s of new Set(slugs)) if (slugs.filter((x) => x === s).length > 1) problems.push(`コラムの slug ${s} が重複しています`)
  if (slugs.includes('replacement')) problems.push('slug replacement は買い替え時期コラム一覧（/column/replacement/）の URL なので使えません')
  for (const c of columns) if (c.articleType) problems.push(`${c.slug} は選び方コラムですが articleType が指定されています`)
  for (const c of replacementColumns) {
    if (c.articleType !== 'replacement') problems.push(`${c.slug} に articleType: 'replacement' がありません`)
    if (!columns.some((g) => g.slug === c.guideSlug)) problems.push(`${c.slug} の guideSlug ${c.guideSlug} が選び方コラムにありません`)
  }
  return problems
}

export function getColumnForDiagnosis(diagnosisId: string): Column | undefined {
  return columns.find((c) => c.relatedDiagnosisId === diagnosisId)
}
