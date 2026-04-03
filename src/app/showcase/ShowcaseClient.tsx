'use client'
import { useState } from 'react'
import type { Hackathon } from '@/types'
import { EmptyState } from '@/components/EmptyState'

interface Props {
  endedHackathons: Hackathon[]
}

export function ShowcaseClient({ endedHackathons }: Props) {
  const [activeSlug, setActiveSlug] = useState<string>('all')

  const tabs = [
    { key: 'all', label: '전체' },
    ...endedHackathons.map(h => ({ key: h.slug, label: h.title })),
  ]

  return (
    <>
      {/* 필터 탭 */}
      <div className="flex border-b-2 border-gray-200 mb-10 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveSlug(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-0.5 whitespace-nowrap transition-all ${
              activeSlug === key
                ? 'text-brand border-brand font-semibold'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* 빈 상태 */}
      <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-sm">
        <p className="text-5xl mb-5">🎨</p>
        <h3 className="text-lg font-bold text-gray-700 mb-2">아직 제출된 솔루션이 없습니다</h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
          해커톤 참가자들의 결과물이 이곳에 모입니다.<br />
          제출 후 AI 요약과 함께 공개됩니다.
        </p>
      </div>
    </>
  )
}
