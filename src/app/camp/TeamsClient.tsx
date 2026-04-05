'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Team, Hackathon } from '@/types'

type SortKey = 'newest' | 'oldest'

export function TeamsClient({ teams, hackathons }: { teams: Team[]; hackathons: Hackathon[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const filter = searchParams.get('hackathon') ?? 'all'
  const [sort, setSort] = useState<SortKey>('newest')

  function setFilter(key: string) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('hackathon', key)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  const slugs = [...new Set(teams.map(t => t.hackathonSlug))]

  const chips = [
    { key: 'all', label: '전체' },
    { key: 'open', label: '모집 중' },
    ...slugs.map(s => {
      const h = hackathons.find(x => x.slug === s)
      const label = h?.title ? h.title.substring(0, 18) + (h.title.length > 18 ? '…' : '') : s
      return { key: s, label }
    }),
  ]

  const filtered = (filter === 'all' ? teams
    : filter === 'open' ? teams.filter(t => t.isOpen)
    : teams.filter(t => t.hackathonSlug === filter)
  ).slice().sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return sort === 'newest' ? -diff : diff
  })

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          {chips.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all ${
                filter === key
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand hover:bg-brand-light'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
          className="text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
          {sort === 'newest' ? '최신순 ↓' : '오래된순 ↑'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🤔</div>
          <p className="mb-4">조건에 맞는 팀이 없습니다.</p>
          <button onClick={() => setFilter('all')}
            className="text-sm font-medium text-brand border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand-light transition-colors">
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => {
            const h = hackathons.find(x => x.slug === t.hackathonSlug)
            return (
              <div key={t.teamCode} className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col transition-all hover:shadow-md ${!t.isOpen ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base">{t.name}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md ml-2 flex-shrink-0">
                    👥 {t.memberCount}명
                  </span>
                </div>
                {h && (
                  <span className="inline-block text-xs font-semibold text-brand bg-brand-light border border-brand/20 px-2 py-0.5 rounded-md mb-3 self-start">
                    {h.title.substring(0, 22)}{h.title.length > 22 ? '…' : ''}
                  </span>
                )}
                <p className="text-sm text-gray-500 leading-relaxed mb-3 flex-1">{t.intro}</p>
                {t.lookingFor.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {t.lookingFor.map(pos => (
                      <span key={pos} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                        🔍 {pos}
                      </span>
                    ))}
                  </div>
                )}
                {t.isOpen ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full self-start mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: 'pulse-dot 2s infinite' }} />
                      모집 중
                    </span>
                    <a href={t.contact.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center text-sm font-semibold text-white bg-brand hover:bg-brand-dark py-2.5 rounded-lg transition-colors no-underline mt-auto">
                      팀에 지원하기 →
                    </a>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center mt-auto pt-3 border-t border-gray-100">모집 마감</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
