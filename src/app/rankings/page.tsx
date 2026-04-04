import { Suspense } from 'react'
import type { Metadata } from 'next'
import { RANKINGS } from '@/lib/rankings'
import { getAllLeaderboards, getHackathons, getHackathonDetail } from '@/lib'
import { RankingsClient } from './RankingsClient'

export const metadata: Metadata = { title: '랭킹' }

export default function RankingsPage() {
  const leaderboards = getAllLeaderboards()
  const lbSections = Object.fromEntries(
    leaderboards.map(lb => [lb.hackathonSlug, getHackathonDetail(lb.hackathonSlug)?.leaderboard ?? null])
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">랭킹</h1>
        <p className="text-gray-500">해커톤 참여·수위 기록 기반 글로벌 랭킹입니다.</p>
      </div>
      <Suspense>
        <RankingsClient rankings={RANKINGS} leaderboards={leaderboards} hackathons={getHackathons()} lbSections={lbSections} />
      </Suspense>
    </div>
  )
}
