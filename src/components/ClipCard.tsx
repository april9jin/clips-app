import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Clip } from '../types'
import { getImageUrl } from '../github'
import { formatDate } from '../utils'

interface Props {
  clip: Clip
  onPin: () => void
  onDelete: () => void
  onEdit: () => void
  onCopied: () => void
}

const MAX_LINES = 10

function PinIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M17 4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1H9a1 1 0 0 0-1 1v2c0 2.55 1.71 4.7 4 5.42V20h-1a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2h-1v-6.58C16.29 12.7 18 10.55 18 8V6a1 1 0 0 0-1-1h-2V4z"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"/>
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/>
    </svg>
  )
}

async function copyImageToClipboard(imgEl: HTMLImageElement): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = imgEl.naturalWidth
  canvas.height = imgEl.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imgEl, 0, 0)
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
  )
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

export default function ClipCard({ clip, onPin, onDelete, onEdit, onCopied }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const lines = clip.content.split('\n')
  const isLong = clip.type !== 'image' && lines.length > MAX_LINES
  const [collapsed, setCollapsed] = useState(isLong)

  const displayContent = isLong && collapsed
    ? lines.slice(0, MAX_LINES).join('\n') + '\n…'
    : clip.content

  useEffect(() => {
    if (clip.type !== 'image') return
    getImageUrl(clip.content).then(setImgSrc).catch(() => setImgSrc(null))
  }, [clip.type, clip.content])

  const handleClick = async () => {
    try {
      if (clip.type === 'image') {
        if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
          await copyImageToClipboard(imgRef.current)
          onCopied()
        }
      } else {
        await navigator.clipboard.writeText(clip.content)
        onCopied()
      }
    } catch {
      // 권한 없을 때 무시
    }
  }

  return (
    <div className="break-inside-avoid mb-1">
      {/* 카드 */}
      <div
        className="bg-white rounded-2xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        onClick={handleClick}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 gap-2 min-h-[32px]">
          <span className="font-bold text-sm text-gray-800 leading-snug truncate flex-1">
            {clip.title || ' '}
          </span>

          <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
            {isLong && (
              <button
                onClick={() => setCollapsed(v => !v)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                title={collapsed ? '전문 보기' : '접기'}
              >
                {collapsed
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
                }
              </button>
            )}
            <button
              onClick={onPin}
              className={`p-1 rounded-full hover:bg-gray-100 transition-opacity ${clip.pinned ? 'text-gray-700 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
              title={clip.pinned ? '핀 해제' : '핀 고정'}
            >
              <PinIcon filled={clip.pinned} />
            </button>
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 w-24">
                  <button onClick={() => { onEdit(); setMenuOpen(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">수정</button>
                  <button onClick={() => { onDelete(); setMenuOpen(false) }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-50">삭제</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-4 pb-3 text-sm text-gray-700">
          {clip.type === 'image' ? (
            imgSrc ? (
              <img
                ref={imgRef}
                src={imgSrc}
                alt={clip.title || '이미지'}
                crossOrigin="anonymous"
                className="rounded-xl w-full object-contain max-h-56"
              />
            ) : (
              <div className="h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                불러오는 중...
              </div>
            )
          ) : clip.type === 'markdown' ? (
            <div className="prose prose-sm max-w-none text-gray-700 [&>*:first-child]:mt-0 overflow-hidden">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words overflow-hidden leading-relaxed">{displayContent}</p>
          )}
        </div>
      </div>

      {/* 날짜 캡션 — 카드 바깥, 우측 정렬 */}
      <div className="text-right pr-1 mt-0.5 mb-2 text-gray-400 select-none" style={{ fontSize: '10px' }}>
        {formatDate(clip.createdAt)}
      </div>
    </div>
  )
}
