import type { Metadata } from 'next'
import { getAllLeaderboards, getHackathons } from '@/lib'
import { LeaderboardTabs } from './LeaderboardTabs'

export const metadata: Metadata = { title: '리더보드' }

export default function LeaderboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">리더보드</h1>
        <p className="text-gray-500">해커톤별 참가팀 순위를 확인하세요.</p>
      </div>
      <LeaderboardTabs leaderboards={getAllLeaderboards()} hackathons={getHackathons()} />
    </div>
  )
}
