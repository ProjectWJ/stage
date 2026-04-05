import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTeams, getHackathons } from '@/lib'
import { TeamsClient } from './TeamsClient'

export const metadata: Metadata = { title: '캠프 — 팀 모집' }

export default function CampPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">캠프</h1>
        <p className="text-gray-500">함께할 팀을 찾거나, 팀원을 모집하세요.</p>
      </div>
      <Suspense>
        <TeamsClient teams={getTeams()} hackathons={getHackathons()} />
      </Suspense>
    </div>
  )
}
