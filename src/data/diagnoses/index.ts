import type { Diagnosis } from '../../types/diagnosis.ts'
import { deskChair } from './deskChair.ts'
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
  suitcase,
  mobileBattery,
  deskChair,
  showerHead,
  humidifier,
  pet,
]

/** 公開中（enabled が false でない）の診断 */
export const diagnoses: Diagnosis[] = allDiagnoses.filter((d) => d.enabled !== false)

export function getDiagnosisBySlug(slug: string): Diagnosis | undefined {
  return diagnoses.find((d) => d.slug === slug)
}
