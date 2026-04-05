'use client'
import { useState, useRef, useEffect, startTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { RankingEntry } from '@/lib/rankings'
import type { LeaderboardData, LeaderboardEntry, Hackathon, HackathonSections } from '@/types'
import { formatDate } from '@/lib'
import { getAllSubmissions } from '@/lib/storage'

type Period = '7d' | '30d' | 'all'
type MainTab = '개인별' | '팀별'

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '최근 7일',
  '30d': '최근 30일',
  'all': '전체',
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-slate-100 text-slate-600',
  3: 'bg-orange-100 text-orange-800',
}

export function RankingsClient({
  rankings,
  leaderboards,
  hackathons,
  lbSections,
}: {
  rankings: RankingEntry[]
  leaderboards: LeaderboardData[]
  hackathons: Hackathon[]
  lbSections: Record<string, HackathonSections['leaderboard'] | null>
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScoreOrder, setShowScoreOrder] = useState(false)
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const tab = (searchParams.get('tab') as MainTab | null) ?? '개인별'
  const period = (searchParams.get('period') as Period | null) ?? 'all'

  // upcoming 해커톤은 팀별 탭에서 제외
  const visibleLeaderboards = leaderboards.filter(lb => {
    const h = hackathons.find(x => x.slug === lb.hackathonSlug)
    return h?.status === 'ended' || h?.status === 'ongoing'
  })

  const selectedSlug = searchParams.get('slug') ?? visibleLeaderboards[0]?.hackathonSlug ?? ''

  function updateParams(updates: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) p.set(k, v)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  const activeLeaderboard = visibleLeaderboards.find(l => l.hackathonSlug === selectedSlug)
  const activeSections = lbSections[selectedSlug] ?? null
  const selectedHackathon = hackathons.find(x => x.slug === selectedSlug)
  const isOngoing = selectedHackathon?.status === 'ongoing'

  // ongoing 해커톤: localStorage 제출물을 제출 시각 순으로 로드
  useEffect(() => {
    if (!isOngoing) { startTransition(() => setLocalEntries([])); return }
    try {
      const entries = getAllSubmissions()
        .filter(s => s.hackathonSlug === selectedSlug)
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
        .map((s, i): LeaderboardEntry => ({
          rank: i + 1,
          teamName: s.teamName,
          score: 0,
          submittedAt: s.submittedAt,
        }))
      startTransition(() => setLocalEntries(entries))
    } catch { startTransition(() => setLocalEntries([])) }
  }, [selectedSlug, isOngoing])

  // 진행 중 해커톤: 기본은 제출 시각 순(localStorage), 토글 ON 시 leaderboard 점수 순
  const displayedEntries = (() => {
    if (!isOngoing) return activeLeaderboard?.entries ?? []
    const lbEntries = activeLeaderboard?.entries ?? []
    if (showScoreOrder && lbEntries.length > 0) return lbEntries
    return localEntries
  })()

  const hasBreakdown = (isOngoing && !showScoreOrder)
    ? false
    : (activeLeaderboard?.entries.some(e => e.scoreBreakdown) ?? false)
  const hasArtifacts = activeLeaderboard?.entries.some(e => e.artifacts) ?? false

  const filteredLeaderboards = searchQuery
    ? visibleLeaderboards.filter(lb => {
        const h = hackathons.find(x => x.slug === lb.hackathonSlug)
        return (h?.title ?? lb.hackathonSlug).toLowerCase().includes(searchQuery.toLowerCase())
      })
    : visibleLeaderboards

  const selectedTitle = hackathons.find(x => x.slug === selectedSlug)?.title ?? selectedSlug

  return (
    <>
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        {(['개인별', '팀별'] as MainTab[]).map(t => (
          <button key={t} onClick={() => updateParams({ tab: t })}
            className={`text-sm font-semibold px-5 py-2 rounded-lg transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === '개인별' ? (
        <>
          <div className="flex gap-2 mb-8">
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <button key={p} onClick={() => updateParams({ period: p })}
                className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all ${
                  period === p
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand hover:bg-brand-light'
                }`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 w-16">순위</th>
                  <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">닉네임</th>
                  <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">포인트</th>
                  <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">참가 대회</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map(entry => (
                  <tr key={entry.rank} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${entry.rank <= 3 ? 'bg-gradient-to-r from-indigo-50/30 to-transparent' : ''}`}>
                    <td className="px-5 py-4">
                      <span className={`w-9 h-9 rounded-xl inline-flex items-center justify-center font-extrabold text-sm ${RANK_STYLES[entry.rank] ?? 'bg-gray-100 text-gray-400 text-xs'}`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-sm">{entry.nickname}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-medium text-base">{entry.points.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">pt</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-500">{entry.hackathonCount}회</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Hackathon selector row */}
          <div ref={containerRef} className="relative flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
              <input
                value={isOpen ? searchQuery : selectedTitle}
                onChange={e => { setSearchQuery(e.target.value); setIsOpen(true) }}
                onFocus={() => { setIsOpen(true); setSearchQuery('') }}
                placeholder="해커톤 검색..."
                className="w-full text-sm font-medium border border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
              {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-full max-h-52 overflow-y-auto">
                  {filteredLeaderboards.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400 text-center">결과 없음</p>
                  ) : (
                    filteredLeaderboards.map(lb => {
                      const h = hackathons.find(x => x.slug === lb.hackathonSlug)
                      const title = h?.title ?? lb.hackathonSlug
                      return (
                        <button key={lb.hackathonSlug}
                          onPointerDown={() => { updateParams({ slug: lb.hackathonSlug }); setIsOpen(false); setSearchQuery('') }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            lb.hackathonSlug === selectedSlug
                              ? 'text-brand font-semibold bg-brand-light'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          {title}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
            <Link href={`/hackathons/${selectedSlug}`}
              className="text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors no-underline whitespace-nowrap">
              해커톤 상세 보기 →
            </Link>
          </div>

          {activeLeaderboard && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  {activeLeaderboard.updatedAt && (
                    <p className="text-xs text-gray-400 font-mono">최종 업데이트: {formatDate(activeLeaderboard.updatedAt)}</p>
                  )}
                  {isOngoing && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      진행 중 — 제출 시각 순
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeSections?.note && (
                    <p className="text-xs text-gray-400 italic">{activeSections.note}</p>
                  )}
                  {isOngoing && (
                    <button
                      onClick={() => setShowScoreOrder(v => !v)}
                      className={`text-xs font-mono font-semibold px-3 py-1 rounded-md border transition-colors ${
                        showScoreOrder
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}>
                      🔧 {showScoreOrder ? '점수순 ON' : '점수순 OFF'}
                    </button>
                  )}
                </div>
              </div>

              {displayedEntries.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">📋</div>
                  <p>등록된 순위가 없습니다.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 w-16">순위</th>
                        <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">팀명</th>
                        {(!isOngoing || showScoreOrder) && (
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">점수</th>
                        )}
                        {hasBreakdown && <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">참가자 / 심사위원</th>}
                        <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">제출 시각</th>
                        {hasArtifacts && <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">제출물</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedEntries.map(e => (
                        <tr key={e.rank} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${e.rank <= 3 ? 'bg-gradient-to-r from-indigo-50/30 to-transparent' : ''}`}>
                          <td className="px-5 py-4">
                            <span className={`w-9 h-9 rounded-xl inline-flex items-center justify-center font-extrabold text-sm ${RANK_STYLES[e.rank] ?? 'bg-gray-100 text-gray-400 text-xs'}`}>
                              {e.rank}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-sm">{e.teamName}</td>
                          {(!isOngoing || showScoreOrder) && (
                            <td className="px-5 py-4">
                              <span className="font-mono font-medium text-base">{e.score}</span>
                              {e.scoreBreakdown && (
                                <p className="text-xs text-gray-400 font-mono mt-0.5 md:hidden">
                                  참가자 {e.scoreBreakdown.participant} / 심사위원 {e.scoreBreakdown.judge}
                                </p>
                              )}
                            </td>
                          )}
                          {hasBreakdown && (
                            <td className="px-5 py-4 hidden md:table-cell">
                              {e.scoreBreakdown
                                ? <span className="text-sm font-mono text-gray-500">{e.scoreBreakdown.participant} / {e.scoreBreakdown.judge}</span>
                                : '—'}
                            </td>
                          )}
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className="text-xs font-mono text-gray-400">{formatDate(e.submittedAt)}</span>
                          </td>
                          {hasArtifacts && (
                            <td className="px-5 py-4 hidden md:table-cell">
                              <div className="flex gap-1.5">
                                {e.artifacts?.webUrl && (
                                  <a href={e.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-semibold text-brand bg-brand-light border border-brand/20 px-2 py-1 rounded-md hover:bg-brand hover:text-white transition-colors no-underline">
                                    🌐 WEB
                                  </a>
                                )}
                                {e.artifacts?.pdfUrl && (
                                  <a href={e.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-semibold text-brand bg-brand-light border border-brand/20 px-2 py-1 rounded-md hover:bg-brand hover:text-white transition-colors no-underline">
                                    📄 {e.artifacts.planTitle ?? 'PDF'}
                                  </a>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
