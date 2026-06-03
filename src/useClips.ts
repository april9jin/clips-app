import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Clip, ClipType } from './types'
import { fetchClips, saveClips, uploadImage, deleteImage } from './github'
import { nextColor, autoTitle, detectType } from './utils'

export function useClips() {
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchClips()
      setClips(data)
    } catch (e: any) {
      if (e.message === 'NO_TOKEN') setError('NO_TOKEN')
      else setError('로드 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const persist = useCallback(async (next: Clip[]) => {
    setSaving(true)
    try {
      await saveClips(next)
    } finally {
      setSaving(false)
    }
  }, [])

  const addClip = useCallback(async (
    content: string,
    imageFile?: File,
  ) => {
    const id = uuidv4()
    let type: ClipType = 'text'
    let finalContent = content

    if (imageFile) {
      type = 'image'
      const base64 = await fileToBase64(imageFile)
      const path = await uploadImage(id, base64, imageFile.type)
      finalContent = path
    } else {
      type = detectType(content)
    }

    const clip: Clip = {
      id,
      type,
      title: imageFile ? (content.trim() || '이미지') : autoTitle(content),
      content: finalContent,
      color: nextColor(),
      pinned: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const next = [clip, ...clips]
    setClips(next)
    await persist(next)
  }, [clips, persist])

  const updateClip = useCallback(async (id: string, updates: Partial<Clip>) => {
    const next = clips.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
    setClips(next)
    await persist(next)
  }, [clips, persist])

  const deleteClip = useCallback(async (id: string) => {
    const clip = clips.find(c => c.id === id)
    const next = clips.filter(c => c.id !== id)
    setClips(next)
    await persist(next)
    if (clip?.type === 'image') {
      await deleteImage(clip.content).catch(() => {})
    }
  }, [clips, persist])

  const togglePin = useCallback(async (id: string) => {
    const clip = clips.find(c => c.id === id)
    if (!clip) return
    await updateClip(id, { pinned: !clip.pinned })
  }, [clips, updateClip])

  return { clips, loading, saving, error, load, addClip, updateClip, deleteClip, togglePin }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
