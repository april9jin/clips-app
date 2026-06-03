import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Clip } from '../types'
import { detectType, autoTitle } from '../utils'

interface Props {
  clip: Clip
  onSave: (updates: Partial<Clip>) => void
  onClose: () => void
}

export default function ClipEditor({ clip, onSave, onClose }: Props) {
  const [content, setContent] = useState(clip.type !== 'image' ? clip.content : '')
  const [mdPreview, setMdPreview] = useState(false)

  const handleSave = () => {
    if (clip.type !== 'image' && !content.trim()) return
    const type = clip.type === 'image' ? 'image' : detectType(content)
    onSave({
      content: clip.type === 'image' ? clip.content : content,
      type,
      title: autoTitle(content || clip.title),
    })
    onClose()
  }

  const isMarkdown = detectType(content) === 'markdown'

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="rounded-2xl shadow-xl w-full max-w-lg"
        style={{ backgroundColor: clip.color }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 space-y-3">
          {/* 제목 미리보기 */}
          <p className="text-xs text-gray-400">
            제목 자동 생성: <strong className="text-gray-600">{autoTitle(content || clip.title) || '—'}</strong>
          </p>

          {clip.type === 'image' ? (
            <p className="text-sm text-gray-500">이미지 교체는 삭제 후 재업로드하세요.</p>
          ) : (
            <>
              {isMarkdown && (
                <div className="flex gap-2">
                  <button onClick={() => setMdPreview(false)} className={`text-xs px-2 py-1 rounded-lg ${!mdPreview ? 'bg-black/10 text-gray-700' : 'text-gray-400'}`}>편집</button>
                  <button onClick={() => setMdPreview(true)} className={`text-xs px-2 py-1 rounded-lg ${mdPreview ? 'bg-black/10 text-gray-700' : 'text-gray-400'}`}>미리보기</button>
                </div>
              )}
              {mdPreview && isMarkdown ? (
                <div className="prose prose-sm max-w-none min-h-[120px] text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 font-mono"
                  autoFocus
                />
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 pb-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-black/5 rounded-lg">취소</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700">저장</button>
        </div>
      </div>
    </div>
  )
}
