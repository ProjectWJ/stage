import type {
  Hackathon, HackathonDetail, HackathonSections,
  LeaderboardData, LeaderboardRoot, Team,
} from '@/types'

// ── 루트 data/ 디렉토리에서 직접 import ──
import hackathonsRaw from '../../data/hackathons.json'
import hackathonDetailRaw from '../../data/hackathon_detail.json'
import leaderboardRaw from '../../data/leaderboard.json'
import teamsRaw from '../../data/teams.json'

// ── Hackathons ──
export const getHackathons = (): Hackathon[] => hackathonsRaw as Hackathon[]
export const getHackathon = (slug: string) =>
  getHackathons().find(h => h.slug === slug)

// ── Detail ──
const detailRoot = hackathonDetailRaw as HackathonDetail

export const getHackathonDetail = (slug: string): HackathonSections | null => {
  if (detailRoot.slug === slug) return detailRoot.sections
  return detailRoot.extraDetails?.find(d => d.slug === slug)?.sections ?? null
}

export const getAllDetailSlugs = (): string[] => [
  detailRoot.slug,
  ...(detailRoot.extraDetails?.map(d => d.slug) ?? []),
]

// ── Leaderboard ──
const lbRoot = leaderboardRaw as LeaderboardRoot

export const getLeaderboard = (slug: string): LeaderboardData | null => {
  if (lbRoot.hackathonSlug === slug)
    return { hackathonSlug: lbRoot.hackathonSlug, updatedAt: lbRoot.updatedAt, entries: lbRoot.entries }
  return lbRoot.extraLeaderboards?.find(l => l.hackathonSlug === slug) ?? null
}

export const getAllLeaderboards = (): LeaderboardData[] => [
  { hackathonSlug: lbRoot.hackathonSlug, updatedAt: lbRoot.updatedAt, entries: lbRoot.entries },
  ...(lbRoot.extraLeaderboards ?? []),
]

// ── Teams ──
export const getTeams = (): Team[] => teamsRaw as Team[]
export const getTeamsByHackathon = (slug: string) =>
  getTeams().filter(t => t.hackathonSlug === slug)

// ── Utils ──
export const formatKRW = (n: number) => `${(n / 10000).toLocaleString('ko-KR')}만원`

export const formatDate = (d: string) => {
  const date = new Date(d)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours < 12 ? '오전' : '오후'
  const h = hours % 12 || 12
  return `${month}월 ${day}일 ${period} ${h}:${String(minutes).padStart(2, '0')}`
}

export const getMilestoneStatus = (at: string): 'past' | 'current' | 'future' => {
  const t = new Date(at), now = new Date()
  if (t < now) return 'past'
  if (t.getTime() - now.getTime() < 86400000 * 3) return 'current'
  return 'future'
}

export const STATUS_KO: Record<string, string> = {
  ongoing: '진행 중', ended: '종료', upcoming: '예정',
}
