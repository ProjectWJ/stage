'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Hackathon, Submission } from '@/types'
import { getAllSubmissions } from '@/lib/storage'
import { ShowcaseCard } from '@/components/ShowcaseCard'

type TabKey = '전체' | '해커톤' | '기타'
const TABS: { key: TabKey; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: '해커톤', label: '해커톤' },
  { key: '기타', label: '기타' },
]

interface Props {
  allHackathons: Hackathon[]
  rankMap: Record<string, 1 | 2 | 3>
}

export function ShowcaseClient({ allHackathons, rankMap }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = (searchParams.get('tab') as TabKey | null) ?? '전체'
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    try {
      setSubmissions(getAllSubmissions())
    } finally {
      setMounted(true)
    }
  }, [])

  function setTab(key: TabKey) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('tab', key)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  const hackathonSlugs = new Set(allHackathons.map(h => h.slug))
  const titleMap = Object.fromEntries(allHackathons.map(h => [h.slug, h.title]))

  const byTab = activeTab === '전체'
    ? submissions
    : activeTab === '해커톤'
      ? submissions.filter(s => s.hackathonSlug && hackathonSlugs.has(s.hackathonSlug))
      : submissions.filter(s => !s.hackathonSlug || !hackathonSlugs.has(s.hackathonSlug))

  const lowerQuery = query.trim().toLowerCase()
  const filtered = (lowerQuery
    ? byTab.filter(s => {
        const title = titleMap[s.hackathonSlug] ?? ''
        return (
          s.teamName.toLowerCase().includes(lowerQuery) ||
          title.toLowerCase().includes(lowerQuery) ||
          s.description.toLowerCase().includes(lowerQuery)
        )
      })
    : byTab
  ).slice().sort((a, b) => {
    const diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    return sort === 'newest' ? -diff : diff
  })

  function getHackathonTitle(s: Submission) {
    if (!s.hackathonSlug) return '개인 프로젝트'
    return titleMap[s.hackathonSlug] ?? s.hackathonSlug
  }

  return (
    <>
      {/* 탭 */}
      <div className="flex border-b-2 border-gray-200 overflow-x-auto mb-4">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-0.5 whitespace-nowrap transition-all ${
              activeTab === key
                ? 'text-brand border-brand font-semibold'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* 검색 + 정렬 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="팀명·해커톤 검색"
            className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <button
          onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
          className="text-xs font-medium text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
          {sort === 'newest' ? '최신순 ↓' : '오래된순 ↑'}
        </button>
      </div>

      {/* 카드 목록 or 빈 상태 */}
      {mounted && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => (
            <ShowcaseCard
              key={s.id}
              submission={s}
              hackathonTitle={getHackathonTitle(s)}
              rank={rankMap[`${s.hackathonSlug}::${s.teamName}`]}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-sm">
          <p className="text-5xl mb-5">🎨</p>
          {lowerQuery ? (
            <>
              <h3 className="text-lg font-bold text-gray-700 mb-2">검색 결과가 없습니다</h3>
              <button onClick={() => setQuery('')}
                className="text-sm font-medium text-brand border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand-light transition-colors mt-2">
                검색 초기화
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-700 mb-2">아직 제출된 솔루션이 없습니다</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                해커톤 참가자들의 결과물이 이곳에 모입니다.<br />
                제출 후 AI 요약과 함께 공개됩니다.
              </p>
            </>
          )}
        </div>
      )}
    </>
  )
}
