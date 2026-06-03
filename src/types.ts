export type ClipType = 'text' | 'image' | 'markdown'

export interface Clip {
  id: string
  type: ClipType
  title: string
  content: string       // 텍스트/MD 내용, 이미지는 GitHub 경로
  color: string
  pinned: boolean
  tags: string[]        // 나중에 검색용
  createdAt: string
  updatedAt: string
}
