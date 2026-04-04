import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getHackathons, getAllLeaderboards } from '@/lib'
import { ShowcaseClient } from './ShowcaseClient'

export const metadata: Metadata = { title: '쇼케이스' }

export default function ShowcasePage() {
  const hackathons = getHackathons()

  // slug::teamName → rank(1|2|3) 맵 — 리더보드 1~3위 팀 표시용
  const rankMap: Record<string, 1 | 2 | 3> = {}
  for (const lb of getAllLeaderboards()) {
    for (const e of lb.entries) {
      if (e.rank <= 3) {
        rankMap[`${lb.hackathonSlug}::${e.teamName}`] = e.rank as 1 | 2 | 3
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">쇼케이스</h1>
        <p className="text-gray-500">해커톤 참가팀의 결과물을 한눈에 확인하세요.</p>
      </div>
      <Suspense>
        <ShowcaseClient allHackathons={hackathons} rankMap={rankMap} />
      </Suspense>
    </div>
  )
}
