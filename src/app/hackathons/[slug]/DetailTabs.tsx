'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Hackathon, HackathonSections, LeaderboardData, Team, Submission } from '@/types'
import { formatDate, getMilestoneStatus, formatKRW, getTzAbbr } from '@/lib'
import { EmptyState } from '@/components/EmptyState'
import { ShowcaseCard } from '@/components/ShowcaseCard'
import { getAllSubmissions } from '@/lib/storage'
import { getUser } from '@/lib/auth'

type TabKey = 'overview' | 'teams' | 'eval' | 'prize' | 'info' | 'schedule' | 'submit' | 'leaderboard' | 'showcase'

const BASE_TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '개요' },
  { key: 'teams', label: '팀(캠프)' },
  { key: 'eval', label: '평가' },
  { key: 'prize', label: '상금' },
  { key: 'info', label: '안내' },
  { key: 'schedule', label: '일정' },
  { key: 'submit', label: '제출' },
  { key: 'leaderboard', label: '리더보드' },
]

const RANK_STYLES: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-slate-100 text-slate-600',
  3: 'bg-orange-100 text-orange-800',
}

interface Props {
  hackathon: Hackathon
  sections: HackathonSections | null
  leaderboard: LeaderboardData | null
  teams: Team[]
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 text-sm font-bold">{title}</div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function DetailTabs({ hackathon, sections, leaderboard, teams }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionsLoaded, setSubmissionsLoaded] = useState(false)
  const [mySubmission, setMySubmission] = useState<Submission | null | undefined>(undefined) // undefined=미확인

  const tabList = hackathon.status === 'ended'
    ? [...BASE_TABS, { key: 'showcase' as TabKey, label: '쇼케이스' }]
    : BASE_TABS

  const tabParam = searchParams.get('tab') as TabKey | null
  const active: TabKey = tabParam && tabList.some(t => t.key === tabParam) ? tabParam : 'overview'
  const top = leaderboard?.entries[0]

  useEffect(() => {
    if (hackathon.status !== 'ended') return
    try {
      setSubmissions(getAllSubmissions().filter(s => s.hackathonSlug === hackathon.slug))
    } finally {
      setSubmissionsLoaded(true)
    }
  }, [hackathon.slug, hackathon.status])

  useEffect(() => {
    if (hackathon.status !== 'ongoing') { setMySubmission(null); return }
    try {
      const user = getUser()
      if (!user) { setMySubmission(null); return }
      const found = getAllSubmissions().find(
        s => s.hackathonSlug === hackathon.slug && s.nickname === user.nickname
      )
      setMySubmission(found ?? null)
    } catch {
      setMySubmission(null)
    }
  }, [hackathon.slug, hackathon.status])

  function setActive(key: TabKey) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('tab', key)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  const rankMap: Record<string, 1 | 2 | 3> = {}
  leaderboard?.entries.forEach(e => {
    if (e.rank <= 3) rankMap[`${hackathon.slug}::${e.teamName}`] = e.rank as 1 | 2 | 3
  })

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b-2 border-gray-200 mb-7 overflow-x-auto overflow-y-hidden">
        {tabList.map(({ key, label }) => (
          <button key={key} onClick={() => setActive(key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-0.5 whitespace-nowrap transition-all ${
              active === key
                ? 'text-brand border-brand font-semibold'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-6 ${active !== 'showcase' ? 'lg:grid-cols-[1fr_280px]' : ''}`}>
        {/* Main content */}
        <div>
          {/* 개요 */}
          {active === 'overview' && (
            <div className="flex flex-col gap-5">
              {sections?.overview ? (
                <>
                  <InfoCard title="📋 대회 소개">
                    <p className="text-sm text-gray-600 leading-relaxed">{sections.overview.summary}</p>
                    <div className="flex gap-3 mt-4">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="font-bold text-base">{sections.overview.teamPolicy.allowSolo ? '가능' : '불가'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">개인 참가</p>
                      </div>
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="font-bold text-base">{sections.overview.teamPolicy.maxTeamSize}인</p>
                        <p className="text-xs text-gray-400 mt-0.5">최대 팀 규모</p>
                      </div>
                    </div>
                  </InfoCard>
                  {sections.prize && (
                    <InfoCard title="🏆 시상 내역">
                      {sections.prize.items.map((p, i) => {
                        const styles = ['bg-yellow-50 text-yellow-800 border-yellow-200', 'bg-slate-100 text-slate-600 border-slate-200', 'bg-orange-50 text-orange-800 border-orange-200']
                        return (
                          <div key={p.place} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${styles[i] ?? styles[2]}`}>{p.place}</span>
                            <span className="font-extrabold text-base">{formatKRW(p.amountKRW)}</span>
                          </div>
                        )
                      })}
                    </InfoCard>
                  )}
                </>
              ) : (
                <EmptyState icon="📋" message="개요 정보가 없습니다." />
              )}
            </div>
          )}

          {/* 팀(캠프) */}
          {active === 'teams' && (
            <div className="flex flex-col gap-4">
              {sections?.teams && !sections.teams.campEnabled ? (
                <EmptyState icon="👥" message="이 대회는 팀 모집을 지원하지 않습니다." />
              ) : teams.length === 0 ? (
                <EmptyState icon="👥" message="이 대회에 등록된 팀이 없습니다." />
              ) : (
                teams.map(t => (
                  <div key={t.teamCode} className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between ${!t.isOpen ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.isOpen ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.intro}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-xs text-gray-400">{t.memberCount}명</span>
                      {t.isOpen && (
                        <a href={t.contact.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold text-white bg-brand hover:bg-brand-dark px-3 py-1.5 rounded-lg transition-colors no-underline">
                          지원하기
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div className="mt-2">
                <Link href={sections?.teams?.listUrl ?? '/camp'} className="text-sm font-semibold text-brand hover:underline">
                  캠프 전체 보기 →
                </Link>
              </div>
            </div>
          )}

          {/* 평가 */}
          {active === 'eval' && (
            sections?.eval ? (
              <InfoCard title="📊 평가 방식">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="inline-flex items-center bg-brand-light text-brand border border-brand/20 text-sm font-bold px-3 py-2 rounded-lg">
                    📌 {sections.eval.metricName}
                  </div>
                  {sections.eval.scoreSource === 'vote' && (
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-lg">
                      🗳️ 투표 기반
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{sections.eval.description}</p>
                {sections.eval.scoreDisplay?.breakdown && (
                  <div className="mt-4 space-y-3">
                    {sections.eval.scoreDisplay.breakdown.map(b => (
                      <div key={b.key} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-14 font-medium">{b.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${b.weightPercent}%` }} />
                        </div>
                        <span className="text-sm font-mono text-brand font-medium w-8">{b.weightPercent}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {sections.eval.limits && (
                  <div className="flex gap-3 mt-4">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <p className="font-mono font-bold text-base">{sections.eval.limits.maxRuntimeSec}s</p>
                      <p className="text-xs text-gray-400 mt-0.5">최대 런타임</p>
                    </div>
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <p className="font-mono font-bold text-base">{sections.eval.limits.maxSubmissionsPerDay}회</p>
                      <p className="text-xs text-gray-400 mt-0.5">일일 제출 한도</p>
                    </div>
                  </div>
                )}
              </InfoCard>
            ) : (
              <EmptyState icon="📊" message="평가 정보가 없습니다." />
            )
          )}

          {/* 상금 */}
          {active === 'prize' && (
            sections?.prize ? (
              <InfoCard title="🏆 시상 내역">
                {sections.prize.items.map((p, i) => {
                  const styles = ['bg-yellow-50 text-yellow-800 border-yellow-200', 'bg-slate-100 text-slate-600 border-slate-200', 'bg-orange-50 text-orange-800 border-orange-200']
                  return (
                    <div key={p.place} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                      <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${styles[i] ?? styles[2]}`}>{p.place}</span>
                      <span className="font-extrabold text-xl">{formatKRW(p.amountKRW)}</span>
                    </div>
                  )
                })}
              </InfoCard>
            ) : (
              <EmptyState icon="🏆" message="시상 정보가 없습니다." />
            )
          )}

          {/* 안내 */}
          {active === 'info' && (
            sections?.info ? (
              <div className="flex flex-col gap-5">
                {sections.info.notice.length > 0 && (
                  <InfoCard title="📢 유의사항">
                    <ul className="space-y-2">
                      {sections.info.notice.map((n, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-gray-600 bg-orange-50 border-l-4 border-orange-400 px-3 py-2.5 rounded-r-lg">
                          <span className="flex-shrink-0">⚠️</span>{n}
                        </li>
                      ))}
                    </ul>
                  </InfoCard>
                )}
                <InfoCard title="🔗 관련 링크">
                  <div className="flex flex-col gap-2">
                    <a href={sections.info.links.rules} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors no-underline">
                      📋 규정 보기
                    </a>
                    <a href={sections.info.links.faq} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors no-underline">
                      ❓ FAQ
                    </a>
                  </div>
                </InfoCard>
              </div>
            ) : (
              <EmptyState icon="📢" message="안내 정보가 없습니다." />
            )
          )}

          {/* 일정 */}
          {active === 'schedule' && (
            sections?.schedule ? (
              <InfoCard title={`📅 진행 일정 (${getTzAbbr(sections.schedule.timezone)})`}>
                <div className="space-y-0">
                  {sections.schedule.milestones.map(m => {
                    const st = getMilestoneStatus(m.at)
                    return (
                      <div key={m.name} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                        <div className="mt-1.5 flex-shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            st === 'past' ? 'bg-slate-300'
                            : st === 'current' ? 'bg-brand ring-4 ring-brand/20'
                            : 'border-2 border-gray-300 bg-white'
                          }`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${st === 'past' ? 'text-gray-400 font-normal' : ''}`}>{m.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{formatDate(m.at)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </InfoCard>
            ) : (
              <EmptyState icon="📅" message="일정 정보가 없습니다." />
            )
          )}

          {/* 제출 */}
          {active === 'submit' && (
            sections?.submit ? (
              <div className="flex flex-col gap-5">
                <InfoCard title="📤 제출 안내">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sections.submit.allowedArtifactTypes.map(t => (
                      <span key={t} className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                  {sections.submit.submissionItems && (
                    <div className="space-y-2.5 mb-4">
                      {sections.submit.submissionItems.map((item, i) => (
                        <div key={item.key} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                          <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="text-xs text-gray-400 font-mono">{item.format}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <ul className="space-y-2">
                    {sections.submit.guide.map((g, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600">
                        <span className="text-brand font-bold flex-shrink-0">→</span>{g}
                      </li>
                    ))}
                  </ul>
                </InfoCard>
                <div className="flex flex-col gap-2">
                  {hackathon.status === 'ongoing' ? (
                    mySubmission ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">✅</span>
                        <div>
                          <p className="text-sm font-bold text-green-800">이미 제출하셨습니다.</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            팀명: <span className="font-semibold">{mySubmission.teamName}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/submit/${hackathon.slug}`}
                        className="inline-flex items-center self-start bg-brand text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors no-underline">
                        제출하기 →
                      </Link>
                    )
                  ) : (
                    <span className="inline-flex items-center self-start text-sm font-semibold text-gray-300 bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg cursor-not-allowed">
                      제출하기 →
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState icon="📤" message="제출 정보가 없습니다." />
            )
          )}

          {/* 리더보드 */}
          {active === 'leaderboard' && (
            leaderboard && leaderboard.entries.length > 0 ? (() => {
              const hasBreakdown = leaderboard.entries.some(e => e.scoreBreakdown)
              const hasArtifacts = leaderboard.entries.some(e => e.artifacts)
              return (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <p className="text-xs text-gray-400 font-mono">최종 업데이트: {formatDate(leaderboard.updatedAt)}</p>
                    {sections?.leaderboard?.note && (
                      <p className="text-xs text-gray-400 italic">{sections.leaderboard.note}</p>
                    )}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 w-16">순위</th>
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">팀명</th>
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">점수</th>
                          {hasBreakdown && <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">참가자 / 심사위원</th>}
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">제출 시각</th>
                          {hasArtifacts && <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">제출물</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.entries.map(e => (
                          <tr key={e.rank} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${e.rank <= 3 ? 'bg-gradient-to-r from-indigo-50/30 to-transparent' : ''}`}>
                            <td className="px-5 py-4">
                              <span className={`w-9 h-9 rounded-xl inline-flex items-center justify-center font-extrabold text-sm ${RANK_STYLES[e.rank] ?? 'bg-gray-100 text-gray-400 text-xs'}`}>
                                {e.rank}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-bold text-sm">{e.teamName}</td>
                            <td className="px-5 py-4">
                              <span className="font-mono font-medium text-base">{e.score}</span>
                              {e.scoreBreakdown && (
                                <p className="text-xs text-gray-400 font-mono mt-0.5 md:hidden">
                                  참가자 {e.scoreBreakdown.participant} / 심사위원 {e.scoreBreakdown.judge}
                                </p>
                              )}
                            </td>
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
              )
            })() : (
              <EmptyState icon="📋" message="등록된 순위가 없습니다." />
            )
          )}

          {/* 쇼케이스 */}
          {active === 'showcase' && (
            !submissionsLoaded ? (
              <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="w-full aspect-video bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <EmptyState icon="🎨" message="아직 제출된 솔루션이 없습니다." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {submissions.map(s => (
                  <ShowcaseCard
                    key={s.id}
                    submission={s}
                    hackathonTitle={hackathon.title}
                    rank={rankMap[`${hackathon.slug}::${s.teamName}`]}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Sidebar — 쇼케이스 탭에서는 숨김 */}
        {active !== 'showcase' && <div className="flex flex-col gap-4">
          {sections?.prize && (
            <InfoCard title="🏆 시상 내역">
              {sections.prize.items.map((p, i) => {
                const styles = ['bg-yellow-50 text-yellow-800 border-yellow-200', 'bg-slate-100 text-slate-600 border-slate-200', 'bg-orange-50 text-orange-800 border-orange-200']
                return (
                  <div key={p.place} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${styles[i] ?? styles[2]}`}>{p.place}</span>
                    <span className="font-extrabold text-base">{formatKRW(p.amountKRW)}</span>
                  </div>
                )
              })}
            </InfoCard>
          )}

          {top && (
            <InfoCard title="🥇 현재 1위">
              <div className="bg-gradient-to-br from-brand-light to-indigo-50 border border-brand/20 rounded-lg p-4 mb-3">
                <p className="text-xs font-semibold text-brand mb-1">RANK #1</p>
                <p className="font-bold text-base">{top.teamName}</p>
                <p className="font-mono text-xl text-brand">{top.score}</p>
                {top.artifacts && (
                  <div className="flex gap-2 mt-2">
                    {top.artifacts.webUrl && (
                      <a href={top.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand bg-white border border-brand/20 px-2.5 py-1 rounded-md hover:bg-brand hover:text-white transition-colors no-underline">
                        🌐 WEB
                      </a>
                    )}
                    {top.artifacts.pdfUrl && (
                      <a href={top.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand bg-white border border-brand/20 px-2.5 py-1 rounded-md hover:bg-brand hover:text-white transition-colors no-underline">
                        📄 {top.artifacts.planTitle ?? 'PDF'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </InfoCard>
          )}

          {sections?.info?.links && (
            <InfoCard title="🔗 관련 링크">
              <div className="flex flex-col gap-2">
                <a href={sections.info.links.rules} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors no-underline">
                  📋 규정 보기
                </a>
                <a href={sections.info.links.faq} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors no-underline">
                  ❓ FAQ
                </a>
              </div>
            </InfoCard>
          )}
        </div>}
      </div>
    </div>
  )
}
