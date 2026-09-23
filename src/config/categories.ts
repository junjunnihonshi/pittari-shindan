import type { CategoryGroupId } from '../types/diagnosis.ts'

/** トップページのカテゴリ分類。表示順はこの配列の順番です */
export const categoryGroups: { id: CategoryGroupId; label: string }[] = [
  { id: 'life', label: '暮らし' },
  { id: 'kitchen', label: 'キッチン' },
  { id: 'beauty', label: '美容・身だしなみ' },
  { id: 'digital', label: 'デジタル' },
  { id: 'travel', label: '旅行' },
  { id: 'pet', label: 'ペット' },
]
