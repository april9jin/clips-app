import { useState, useCallback } from 'react'
import { useClips } from './useClips'
import ClipCard from './components/ClipCard'
import ClipEditor from './components/ClipEditor'
import NoteInput from './components/NoteInput'
import TokenGate from './components/TokenGate'
import Toast from './components/Toast'
import type { Clip } from './types'

function ClipboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  )
}

export default function App() {
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem('gh_token'))
  const { clips, loading, saving, error, load, addClip, updateClip, deleteClip, togglePin } = useClips()
  const [editTarget, setEditTarget] = useState<Clip | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => setToast(msg), [])

  if (!hasToken || error === 'NO_TOKEN') {
    return <TokenGate onSave={() => { setHasToken(true); load() }} />
  }

  const pinned = clips.filter(c => c.pinned)
  const rest = clips.filter(c => !c.pinned)

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 sticky top-0 z-40">
        <div className="text-gray-700">
          <ClipboardIcon />
        </div>
        <span className="text-base font-semibold text-gray-700 tracking-tight">Clips</span>
        <div className="flex-1" />
        {saving && <span className="text-xs text-gray-400">저장 중...</span>}
        <button
          onClick={load}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          title="새로고침"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.5 16a9 9 0 1 1-2.1-9.4L23 10"/>
          </svg>
        </button>
        <button
          onClick={() => { localStorage.removeItem('gh_token'); setHasToken(false) }}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          title="토큰 변경"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </button>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 상단 입력창 */}
        <NoteInput onAdd={(content, imageFile) => addClip(content, imageFile).then(() => showToast('저장됐어요'))} />

        {loading ? (
          <div className="text-center text-gray-400 py-20 text-sm">불러오는 중...</div>
        ) : (
          <>
            {/* 핀 고정 */}
            {pinned.length > 0 && (
              <section className="mb-6">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">고정됨</p>
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
                  {pinned.map(clip => (
                    <ClipCard
                      key={clip.id}
                      clip={clip}
                      onPin={() => togglePin(clip.id)}
                      onDelete={() => deleteClip(clip.id)}
                      onEdit={() => setEditTarget(clip)}
                      onCopied={() => showToast('복사됐어요')}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 나머지 */}
            {rest.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">기타</p>
                )}
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
                  {rest.map(clip => (
                    <ClipCard
                      key={clip.id}
                      clip={clip}
                      onPin={() => togglePin(clip.id)}
                      onDelete={() => deleteClip(clip.id)}
                      onEdit={() => setEditTarget(clip)}
                      onCopied={() => showToast('복사됐어요')}
                    />
                  ))}
                </div>
              </section>
            )}

            {clips.length === 0 && (
              <div className="text-center text-gray-300 py-20">
                <div className="flex justify-center mb-4 opacity-30">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  </svg>
                </div>
                <p className="text-sm">첫 클립을 추가해보세요</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 수정 모달 */}
      {editTarget && (
        <ClipEditor
          clip={editTarget}
          onSave={updates => { updateClip(editTarget.id, updates); showToast('수정됐어요') }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
