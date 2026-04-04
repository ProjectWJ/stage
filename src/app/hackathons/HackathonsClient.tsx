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
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = Array.from(new Set(hackathons.flatMap(h => h.tags))).sort()

  const filtered = hackathons.filter(h => {
    const statusOk = status === 'all' || h.status === status
    const tagsOk = selectedTags.length === 0 || selectedTags.every(t => h.tags.includes(t))
    return statusOk && tagsOk
  })

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-3">
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

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {allTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand hover:bg-brand-light'
              }`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          message="조건에 맞는 해커톤이 없습니다."
          action={{ label: '필터 초기화', onClick: () => { setStatus('all'); setSelectedTags([]) } }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(h => <HackathonCard key={h.slug} hackathon={h} />)}
        </div>
      )}
    </>
  )
}
