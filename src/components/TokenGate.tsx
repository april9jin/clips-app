import { useState } from 'react'

interface Props {
  onSave: () => void
}

export default function TokenGate({ onSave }: Props) {
  const [token, setToken] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return
    localStorage.setItem('gh_token', token.trim())
    onSave()
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="flex justify-center mb-5 text-gray-700">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          </svg>
        </div>
        <h1 className="text-center text-lg font-semibold text-gray-800 mb-1">Clips</h1>
        <p className="text-center text-sm text-gray-400 mb-6">GitHub Personal Access Token</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="github_pat_..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-gray-50"
          />
          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            시작하기
          </button>
        </form>
        <p className="text-xs text-gray-300 mt-4 text-center">토큰은 이 기기에만 저장됩니다</p>
      </div>
    </div>
  )
}
