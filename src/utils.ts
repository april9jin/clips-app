export function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function nextColor(): string {
  return '#ffffff'
}

const MD_PATTERN = /^#{1,6} |^\s*[-*+] |\*\*|__|\[.+\]\(|^```|^> /m

export function detectType(content: string): 'markdown' | 'text' {
  return MD_PATTERN.test(content) ? 'markdown' : 'text'
}

export function autoTitle(content: string): string {
  const firstLine = content.trim().split('\n')[0]
  // 마크다운 기호 제거
  const clean = firstLine.replace(/^#{1,6}\s*/, '').replace(/\*+/g, '').replace(/`/g, '').trim()
  const words = clean.split(/\s+/).filter(Boolean)
  return words.slice(0, 3).join(' ')
}
