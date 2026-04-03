import type { SubmissionData } from '@/types'

const KEY = (teamCode: string) => `submission:${teamCode}`

export const saveSubmission = (teamCode: string, data: SubmissionData): void => {
  try {
    localStorage.setItem(KEY(teamCode), JSON.stringify(data))
  } catch {}
}

export const getSubmission = (teamCode: string): SubmissionData | null => {
  try {
    const raw = localStorage.getItem(KEY(teamCode))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const getSubmissionsBySlug = (slug: string): SubmissionData[] => {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith('submission:'))
      .map(k => { try { return JSON.parse(localStorage.getItem(k)!) } catch { return null } })
      .filter((d): d is SubmissionData => d?.slug === slug)
  } catch { return [] }
}

export const getAISummary = (teamCode: string): string | null =>
  getSubmission(teamCode)?.aiSummary ?? null

export const isLocalStorageAvailable = (): boolean => {
  try { localStorage.setItem('__test__', '1'); localStorage.removeItem('__test__'); return true }
  catch { return false }
}
