export interface User { nickname: string }

const USER_KEY = 'stage_user'

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch { return null }
}

export function setUser(nickname: string): void {
  try { localStorage.setItem(USER_KEY, JSON.stringify({ nickname })) } catch {}
}

export function clearUser(): void {
  try { localStorage.removeItem(USER_KEY) } catch {}
}

export function generateNickname(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `해커_${n}`
}
