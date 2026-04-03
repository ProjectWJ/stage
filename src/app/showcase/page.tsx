import type { Metadata } from 'next'
import { getHackathons } from '@/lib'
import { ShowcaseClient } from './ShowcaseClient'

export const metadata: Metadata = { title: '쇼케이스' }

export default function ShowcasePage() {
  const endedHackathons = getHackathons().filter(h => h.status === 'ended')

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">쇼케이스</h1>
        <p className="text-gray-500">해커톤 참가팀의 결과물을 한눈에 확인하세요.</p>
      </div>
      <ShowcaseClient endedHackathons={endedHackathons} />
    </div>
  )
}
