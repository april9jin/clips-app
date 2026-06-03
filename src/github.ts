import { Octokit } from '@octokit/rest'
import type { Clip } from './types'

const OWNER = 'april9jin'
const REPO = 'clips'
const CLIPS_PATH = 'data/clips.json'
const IMAGES_PATH = 'data/images'

function getOctokit() {
  const token = localStorage.getItem('gh_token')
  if (!token) throw new Error('NO_TOKEN')
  return new Octokit({ auth: token })
}

export async function fetchClips(): Promise<Clip[]> {
  const octokit = getOctokit()
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: CLIPS_PATH })
    if ('content' in data) {
      const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0))
      const json = new TextDecoder('utf-8').decode(bytes)
      return JSON.parse(json)
    }
    return []
  } catch (e: any) {
    if (e.status === 404) return []
    throw e
  }
}

async function getFileSha(path: string): Promise<string | undefined> {
  const octokit = getOctokit()
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path })
    if ('sha' in data) return data.sha
  } catch {
    return undefined
  }
}

export async function saveClips(clips: Clip[]): Promise<void> {
  const octokit = getOctokit()
  const sha = await getFileSha(CLIPS_PATH)
  const bytes = new TextEncoder().encode(JSON.stringify(clips, null, 2))
  const content = btoa(String.fromCharCode(...bytes))
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: CLIPS_PATH,
    message: 'update clips',
    content,
    sha,
  })
}

export async function uploadImage(id: string, base64Data: string, mimeType: string): Promise<string> {
  const octokit = getOctokit()
  const ext = mimeType.split('/')[1] || 'png'
  const path = `${IMAGES_PATH}/${id}.${ext}`
  const sha = await getFileSha(path)
  // base64Data는 data:image/...;base64, 접두사 포함 — 접두사 제거
  const content = base64Data.replace(/^data:[^;]+;base64,/, '')
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: `upload image ${id}`,
    content,
    sha,
  })
  return path
}

export async function deleteImage(path: string): Promise<void> {
  const octokit = getOctokit()
  const sha = await getFileSha(path)
  if (!sha) return
  await octokit.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path,
    message: `delete image`,
    sha,
  })
}

// private 레포는 raw URL이 안 됨 → API로 download_url 획득 후 캐싱
const imageUrlCache = new Map<string, string>()

export async function getImageUrl(path: string): Promise<string> {
  if (imageUrlCache.has(path)) return imageUrlCache.get(path)!
  const octokit = getOctokit()
  const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path })
  if ('download_url' in data && data.download_url) {
    // download_url도 private에선 토큰 없이 안 됨 → content를 blob으로 변환
    if ('content' in data && data.content) {
      const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0))
      const blob = new Blob([bytes])
      const url = URL.createObjectURL(blob)
      imageUrlCache.set(path, url)
      return url
    }
    imageUrlCache.set(path, data.download_url)
    return data.download_url
  }
  return ''
}
