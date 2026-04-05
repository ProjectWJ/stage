import { Suspense } from 'react'
import type { Metadata } from 'next'
import { RANKINGS } from '@/lib/rankings'
import { getAllLeaderboards, getHackathons, getHackathonDetail } from '@/lib'
import { RankingsClient } from './RankingsClient'

export const metadata: Metadata = { title: '랭킹' }

export default function RankingsPage() {
  const hackathons = getHackathons()
  const leaderboards = getAllLeaderboards()

  // leaderboard 데이터가 없는 ongoing 해커톤도 팀별 탭에 노출
  const lbSlugs = new Set(leaderboards.map(lb => lb.hackathonSlug))
  const allLeaderboards = [
    ...leaderboards,
    ...hackathons
      .filter(h => h.status === 'ongoing' && !lbSlugs.has(h.slug))
      .map(h => ({ hackathonSlug: h.slug, updatedAt: '', entries: [] as typeof leaderboards[0]['entries'] })),
  ]

  const lbSections = Object.fromEntries(
    allLeaderboards.map(lb => [lb.hackathonSlug, getHackathonDetail(lb.hackathonSlug)?.leaderboard ?? null])
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">랭킹</h1>
        <p className="text-gray-500">해커톤 참여·수위 기록 기반 글로벌 랭킹입니다.</p>
      </div>
      <Suspense>
        <RankingsClient rankings={RANKINGS} leaderboards={allLeaderboards} hackathons={hackathons} lbSections={lbSections} />
      </Suspense>
    </div>
  )
}
