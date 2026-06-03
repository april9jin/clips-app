import { useState, useRef } from 'react'

interface Props {
  onAdd: (content: string, imageFile?: File) => void
}

export default function NoteInput({ onAdd }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!content.trim() && !imageFile) return
    onAdd(content, imageFile ?? undefined)
    setContent('')
    setImageFile(null)
    setImagePreview(null)
    setExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setExpanded(false)
      setContent('')
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
    setExpanded(true)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = Array.from(e.clipboardData.files).find(f => f.type.startsWith('image/'))
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`bg-white rounded-2xl border transition-all ${expanded ? 'border-gray-300 shadow-md' : 'border-gray-200 shadow-sm hover:shadow'}`}
      >
        {!expanded ? (
          /* 축소 상태 */
          <div className="flex items-center gap-3 px-4 py-3">
            <input
              type="text"
              placeholder="클립 추가..."
              className="flex-1 text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent"
              onFocus={() => { setExpanded(true); setTimeout(() => textRef.current?.focus(), 50) }}
              readOnly
            />
            <button
              onClick={() => { fileRef.current?.click() }}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              title="이미지 추가"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
          </div>
        ) : (
          /* 확장 상태 */
          <div className="p-4">
            {imagePreview && (
              <div className="relative mb-3">
                <img src={imagePreview} className="rounded-xl max-h-40 object-cover w-full" alt="preview" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full text-white text-xs flex items-center justify-center"
                >✕</button>
              </div>
            )}
            <textarea
              ref={textRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={imageFile ? '이미지 설명 (선택)...' : '내용을 입력하세요. Markdown 자동 인식. Ctrl+Enter로 저장'}
              rows={4}
              className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none resize-none bg-transparent"
              autoFocus
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => fileRef.current?.click()}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                title="이미지 추가"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setExpanded(false); setContent(''); setImageFile(null); setImagePreview(null) }}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() && !imageFile}
                  className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
    </div>
  )
}
