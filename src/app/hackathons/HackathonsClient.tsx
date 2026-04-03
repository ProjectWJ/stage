'use client'
import { useState } from 'react'
import type { Hackathon } from '@/types'
import { HackathonCard } from '@/components/HackathonCard'
import { EmptyState } from '@/components/EmptyState'

type StatusFilter = 'all' | 'ongoing' | 'upcoming' | 'ended'

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: '전체',
  ongoing: '진행 중',
  upcoming: '예정',
  ended: '종료',
}

export function HackathonsClient({ hackathons }: { hackathons: Hackathon[] }) {
  const [status, setStatus] = useState<StatusFilter>('all')

  const filtered = status === 'all' ? hackathons : hackathons.filter(h => h.status === status)

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {(Object.keys(STATUS_LABELS) as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all ${
              status === s
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand hover:bg-brand-light'
            }`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          message="조건에 맞는 해커톤이 없습니다."
          action={{ label: '필터 초기화', onClick: () => setStatus('all') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(h => <HackathonCard key={h.slug} hackathon={h} />)}
        </div>
      )}
    </>
  )
}
