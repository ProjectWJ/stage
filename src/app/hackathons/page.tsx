import type { Metadata } from 'next'
import { getHackathons } from '@/lib'
import { HackathonsClient } from './HackathonsClient'

export const metadata: Metadata = { title: '해커톤 목록' }

export default function HackathonsPage() {
  const hackathons = getHackathons()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">해커톤</h1>
        <p className="text-gray-500">전체 {hackathons.length}개의 해커톤이 있습니다.</p>
      </div>
      <HackathonsClient hackathons={hackathons} />
    </div>
  )
}
