/** コラム本文（src/data/columns/*.ts の body）を、表示用のブロックに分ける */
export type ColumnBlock =
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3' | 'p' | 'cta'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }

export function parseColumnBody(body: string): ColumnBlock[] {
  const blocks: ColumnBlock[] = []
  let h2Count = 0
  let prevBlank = true
  for (const line of body.split('\n').map((l) => l.trim())) {
    const afterBlank = prevBlank
    prevBlank = !line
    if (!line) continue
    const listItem = line.match(/^(?:(-)|\d+\.)\s+(.*)$/)
    if (listItem) {
      const type = listItem[1] ? 'ul' : 'ol'
      const last = blocks[blocks.length - 1]
      if (last && (last.type === 'ul' || last.type === 'ol') && last.type === type) last.items.push(listItem[2])
      else blocks.push({ type, items: [listItem[2]] })
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', id: `section-${++h2Count}`, text: line.slice(3) })
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) })
    } else if (line.startsWith('→ ') && afterBlank) {
      // 空行の後の「→」行だけを診断へのリンクにする（「A」の次の行の「→ B」のような例示はそのまま段落として表示）
      blocks.push({ type: 'cta', text: line.slice(2) })
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }
  return blocks
}
