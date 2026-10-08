/**
 * 選び方コラムの一覧。
 * 記事を追加するときは、このフォルダに記事ファイルを作り、下の columns に追加するだけで
 * コラム一覧・記事ページ・sitemap.xml・プリレンダリングに反映されます。
 */
import { airConditionerHowToChoose } from './airConditionerHowToChoose.ts'
import { airPurifierHowToChoose } from './airPurifierHowToChoose.ts'
import { coffeeMakerHowToChoose } from './coffeeMakerHowToChoose.ts'
import { deskChairHowToChoose } from './deskChairHowToChoose.ts'
import { dishwasherHowToChoose } from './dishwasherHowToChoose.ts'
import { electricBlanketHowToChoose } from './electricBlanketHowToChoose.ts'
import { electricKettleHowToChoose } from './electricKettleHowToChoose.ts'
import { electricPressureCookerHowToChoose } from './electricPressureCookerHowToChoose.ts'
import { hairDryerHowToChoose } from './hairDryerHowToChoose.ts'
import { heaterHowToChoose } from './heaterHowToChoose.ts'
import { humidifierHowToChoose } from './humidifierHowToChoose.ts'
import { mattressHowToChoose } from './mattressHowToChoose.ts'
import { mensShaverHowToChoose } from './mensShaverHowToChoose.ts'
import { microwaveHowToChoose } from './microwaveHowToChoose.ts'
import { mobileBatteryHowToChoose } from './mobileBatteryHowToChoose.ts'
import { monitorHowToChoose } from './monitorHowToChoose.ts'
import { pillowHowToChoose } from './pillowHowToChoose.ts'
import { printerHowToChoose } from './printerHowToChoose.ts'
import { refrigeratorHowToChoose } from './refrigeratorHowToChoose.ts'
import { riceCookerHowToChoose } from './riceCookerHowToChoose.ts'
import { robotVacuumHowToChoose } from './robotVacuumHowToChoose.ts'
import { smartwatchHowToChoose } from './smartwatchHowToChoose.ts'
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
  /** 関連する診断のID。指定すると、その診断ページからこの記事へリンクします */
  relatedDiagnosisId?: string
  /** 診断ページに表示するこの記事へのリンク文言 */
  relatedLinkLabel?: string
  /**
   * 本文。「## 見出し」「### 小見出し」「- 箇条書き」「1. 番号付きリスト」「→ 診断へのリンク」と、
   * 空行区切りの段落で書きます（空行の後の「→」の行は relatedDiagnosisId の診断へのリンクになります）。
   */
  body: string
}

/** 一覧には公開日の新しい順に表示（同じ公開日の記事はこの配列の順） */
export const columns: Column[] = [
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

export function columnPath(slug: string): string {
  return `/column/${slug}/`
}

export function getColumnBySlug(slug: string): Column | undefined {
  return columns.find((c) => c.slug === slug)
}

export function getColumnForDiagnosis(diagnosisId: string): Column | undefined {
  return columns.find((c) => c.relatedDiagnosisId === diagnosisId)
}
