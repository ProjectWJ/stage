'use client'
import { useState, useEffect, startTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Hackathon, Submission } from '@/types'
import { getAllSubmissions } from '@/lib/storage'
import { ShowcaseCard } from '@/components/ShowcaseCard'
import { HackathonShowcaseSection } from '@/components/HackathonShowcaseSection'

type TabKey = '해커톤' | '개인 프로젝트'

interface Props {
  allHackathons: Hackathon[]
  rankMap: Record<string, 1 | 2 | 3>
  overviewMap: Record<string, string>
}

const SCROLL_KEY = 'showcase-scroll'

export function ShowcaseClient({ allHackathons, rankMap, overviewMap }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = (searchParams.get('tab') as TabKey | null) ?? '해커톤'
  const scrollTarget = searchParams.get('scroll')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  // 스크롤 위치 저장 (새로고침·뒤로가기 대비)
  useEffect(() => {
    const save = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    window.addEventListener('beforeunload', save)
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('beforeunload', save)
      window.removeEventListener('pagehide', save)
    }
  }, [])

  useEffect(() => {
    try {
      const subs = getAllSubmissions()
      startTransition(() => {
        setSubmissions(subs)
        setMounted(true)
      })
    } catch {
      startTransition(() => setMounted(true))
    }
  }, [])

  // 마운트 후: 저장된 스크롤 복원 or 앵커 섹션으로 이동
  useEffect(() => {
    if (!mounted) return
    const saved = sessionStorage.getItem(SCROLL_KEY)
    if (saved) {
      const y = parseInt(saved)
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }))
      sessionStorage.removeItem(SCROLL_KEY)
      return
    }
    if (scrollTarget) {
      requestAnimationFrame(() =>
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  function setTab(key: TabKey) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('tab', key)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  const hackathonSlugs = new Set(allHackathons.map(h => h.slug))

  // 해커톤 정렬: ongoing → ended(endAt 내림차순) → upcoming
  const STATUS_ORDER: Record<string, number> = { ongoing: 0, ended: 1, upcoming: 2 }
  const sortedHackathons = allHackathons.slice().sort((a, b) => {
    const so = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (so !== 0) return so
    return new Date(b.period.endAt).getTime() - new Date(a.period.endAt).getTime()
  })

  const lowerQuery = query.trim().toLowerCase()

  // 해커톤 탭: 검색 필터 적용한 섹션 목록
  // upcoming은 제출물 없어도 섹션 표시 (잠금 UI로 렌더됨)
  const hackathonSections = sortedHackathons.map(h => {
    const hacSubs = submissions.filter(s => s.hackathonSlug === h.slug)

    // upcoming: 항상 포함 (빈 배열 그대로)
    if (h.status === 'upcoming') {
      if (!lowerQuery || h.title.toLowerCase().includes(lowerQuery)) {
        return { hackathon: h, submissions: hacSubs }
      }
      return null
    }

    if (hacSubs.length === 0) return null

    if (!lowerQuery) return { hackathon: h, submissions: hacSubs }

    // 해커톤 제목 매칭 → 전체 제출물 표시
    if (h.title.toLowerCase().includes(lowerQuery)) return { hackathon: h, submissions: hacSubs }

    // 팀명·설명 매칭 → 매칭된 제출물만 표시
    const matched = hacSubs.filter(s =>
      s.teamName.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
    )
    if (matched.length === 0) return null
    return { hackathon: h, submissions: matched }
  }).filter(Boolean) as { hackathon: Hackathon; submissions: Submission[] }[]

  // 앵커 칩: 제출물 있는 해커톤 + upcoming 포함
  const anchorHackathons = sortedHackathons.filter(h =>
    h.status === 'upcoming' || submissions.some(s => s.hackathonSlug === h.slug)
  )

  // 개인 프로젝트 탭
  const personalSubs = submissions
    .filter(s => !s.hackathonSlug || !hackathonSlugs.has(s.hackathonSlug))
    .slice()
    .sort((a, b) => {
      const diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      return sort === 'newest' ? -diff : diff
    })

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="flex border-b-2 border-gray-200 mb-8 gap-6 pb-3">
          {[1, 2].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-20" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="w-full aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 탭 */}
      <div className="flex border-b-2 border-gray-200 mb-8 overflow-x-auto overflow-y-hidden">
        {(['해커톤', '개인 프로젝트'] as TabKey[]).map(key => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-0.5 whitespace-nowrap transition-all ${
              activeTab === key
                ? 'text-brand border-brand font-semibold'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}>
            {key}
          </button>
        ))}
      </div>

      {activeTab === '해커톤' ? (
        <>
          {/* 검색창 — 가운데 정렬 */}
          <div className="flex justify-center mb-4">
            <div className="relative w-full max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">🔍</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="해커톤·팀명 검색"
                className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          {/* 앵커 칩 */}
          {mounted && anchorHackathons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {anchorHackathons.map(h => (
                <button
                  key={h.slug}
                  onClick={() => document.getElementById(h.slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="text-xs font-medium text-gray-500 border border-gray-200 bg-white px-3 py-1.5 rounded-full hover:border-brand hover:text-brand hover:bg-brand-light transition-colors">
                  {h.title.length > 20 ? h.title.substring(0, 20) + '…' : h.title}
                </button>
              ))}
            </div>
          )}

          {/* 해커톤 섹션 목록 */}
          {mounted && hackathonSections.length > 0 ? (
            hackathonSections.map(({ hackathon, submissions: subs }, i) => (
              <HackathonShowcaseSection
                key={hackathon.slug}
                hackathon={hackathon}
                overview={overviewMap[hackathon.slug] ?? ''}
                submissions={subs}
                rankMap={rankMap}
                index={i}
              />
            ))
          ) : mounted ? (
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
          ) : null}
        </>
      ) : (
        <>
          {/* 개인 프로젝트 탭 — 기존 카드 그리드 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
              className="text-xs font-medium text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
              {sort === 'newest' ? '최신순 ↓' : '오래된순 ↑'}
            </button>
          </div>

          {mounted && personalSubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {personalSubs.map(s => (
                <ShowcaseCard
                  key={s.id}
                  submission={s}
                  hackathonTitle="개인 프로젝트"
                />
              ))}
            </div>
          ) : mounted ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-sm">
              <p className="text-5xl mb-5">🎨</p>
              <h3 className="text-lg font-bold text-gray-700 mb-2">아직 제출된 개인 프로젝트가 없습니다</h3>
            </div>
          ) : null}
        </>
      )}
    </>
  )
}
