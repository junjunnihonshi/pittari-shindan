/** コラム本文（src/data/columns/*.ts の body）を、表示用のブロックに分ける */
export type ColumnBlock =
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3' | 'p' | 'cta'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'table'; caption: string; head: string[]; rows: string[][]; notes: string[] }

/** 「| a | b |」→ ['a', 'b'] */
function tableCells(line: string): string[] {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

export function parseColumnBody(body: string): ColumnBlock[] {
  const blocks: ColumnBlock[] = []
  let h2Count = 0
  let prevBlank = true
  // 比較表：「[表] キャプション」の次の行から「| … |」の行が続く間が表。表の直後（空行なし）の「※」行は表の注記
  let pendingCaption: string | null = null
  for (const line of body.split('\n').map((l) => l.trim())) {
    const afterBlank = prevBlank
    prevBlank = !line
    if (!line) continue
    const last = blocks[blocks.length - 1]
    if (line.startsWith('[表] ')) {
      pendingCaption = line.slice(4).trim()
      continue
    }
    if (line.startsWith('|') && (pendingCaption !== null || (last?.type === 'table' && !afterBlank))) {
      if (/^\|[\s|:-]+\|$/.test(line)) continue // 「|---|---|」の区切り行
      if (pendingCaption !== null) {
        blocks.push({ type: 'table', caption: pendingCaption, head: tableCells(line), rows: [], notes: [] })
        pendingCaption = null
      } else if (last?.type === 'table') {
        last.rows.push(tableCells(line))
      }
      continue
    }
    if (line.startsWith('※') && last?.type === 'table' && !afterBlank) {
      last.notes.push(line)
      continue
    }
    const listItem = line.match(/^(?:(-)|\d+\.)\s+(.*)$/)
    if (listItem) {
      const type = listItem[1] ? 'ul' : 'ol'
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
