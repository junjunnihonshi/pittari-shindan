import type { Diagnosis } from '../../types/diagnosis.ts'
import { deskChair } from './deskChair.ts'
import { electricKettle } from './electricKettle.ts'
import { fryingPan } from './fryingPan.ts'
import { hairDryer } from './hairDryer.ts'
import { humidifier } from './humidifier.ts'
import { mobileBattery } from './mobileBattery.ts'
import { pet } from './pet.ts'
import { pillow } from './pillow.ts'
import { showerHead } from './showerHead.ts'
import { suitcase } from './suitcase.ts'
import { vacuum } from './vacuum.ts'

/**
 * 診断の一覧（登録簿）。
 * 新しい診断を追加するときは、このフォルダに設定ファイルを作成し、
 * 上で import してこの配列に 1 行追加するだけでOKです（トップページ・URL・sitemap に自動反映）。
 */
const allDiagnoses: Diagnosis[] = [
  pillow,
  hairDryer,
  vacuum,
  fryingPan,
  electricKettle,
  suitcase,
  mobileBattery,
  deskChair,
  showerHead,
  humidifier,
  pet,
]

/**
 * 登録されているすべての診断（準備中を含む）。
 * トップページの一覧には全件表示され、enabled: false のものは「準備中」カードになります。
 */
export const diagnoses: Diagnosis[] = allDiagnoses

/** 公開中の診断か（enabled: true のものだけがリンク・診断ページ・sitemap の対象） */
export function isDiagnosisEnabled(d: Diagnosis): boolean {
  return d.enabled === true
}

/** 公開中の診断のみ */
export const enabledDiagnoses: Diagnosis[] = allDiagnoses.filter(isDiagnosisEnabled)

/** URL の slug から診断を探す（準備中の診断も返すので、呼び出し側で isDiagnosisEnabled を確認すること） */
export function getDiagnosisBySlug(slug: string): Diagnosis | undefined {
  return allDiagnoses.find((d) => d.slug === slug)
}
