import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getHackathon, getHackathons, getHackathonDetail, getLeaderboard, formatDate } from '@/lib'
import { RecapHero } from '@/components/RecapHero'
import { RecapTopThree } from '@/components/RecapTopThree'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getHackathons().map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const h = getHackathon(slug)
  return { title: h ? `${h.title} — Recap` : 'Recap' }
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-slate-100 text-slate-600',
  3: 'bg-orange-100 text-orange-800',
}

export default async function RecapPage({ params }: Props) {
  const { slug } = await params
  const hackathon = getHackathon(slug)
  if (!hackathon) notFound()

  if (hackathon.status !== 'ended') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link href={`/hackathons/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg mb-8 hover:bg-gray-50 transition-colors no-underline">
          ← 해커톤 상세로
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl mb-5">🔒</p>
          <h1 className="text-2xl font-extrabold tracking-tight mb-3">아직 결과가 공개되지 않은 대회입니다</h1>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-8">
            {hackathon.status === 'ongoing'
              ? '대회가 진행 중입니다. 종료 후 결과가 공개됩니다.'
              : '아직 시작되지 않은 대회입니다.'}
          </p>
          <Link href={`/hackathons/${slug}`}
            className="bg-brand text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors no-underline">
            대회 상세 보기 →
          </Link>
        </div>
      </div>
    )
  }

  const sections = getHackathonDetail(slug)
  const leaderboard = getLeaderboard(slug)
  const entries = leaderboard?.entries ?? []
  const hasBreakdown = entries.some(e => e.scoreBreakdown)
  const hasArtifacts = entries.some(e => e.artifacts)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href={`/hackathons/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg mb-8 hover:bg-gray-50 transition-colors no-underline">
        ← 해커톤 상세로
      </Link>

      {/* 헤더: 제목 + 통계 + 링크 복사 */}
      <RecapHero hackathon={hackathon} entries={entries} sections={sections} />

      {/* 수상팀 하이라이트 + 코멘트 (Client — localStorage) */}
      {entries.length > 0 && (
        <RecapTopThree
          entries={entries}
          hackathonSlug={slug}
          hackathonTitle={hackathon.title}
        />
      )}

      {/* 점수 분포 차트 */}
      {hasBreakdown && (() => {
        const withBreakdown = entries.filter(e => e.scoreBreakdown).slice(0, 8)
        const cap = Math.max(...withBreakdown.map(e => Math.max(e.scoreBreakdown!.participant, e.scoreBreakdown!.judge)))
        return (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold tracking-tight mb-6">📊 점수 분포</h2>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 max-w-2xl">
              <div className="space-y-4">
                {withBreakdown.map(e => (
                  <div key={e.rank}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="font-semibold truncate max-w-[10rem]">{e.teamName}</span>
                      <span className="font-mono text-brand font-medium">{e.score}</span>
                    </div>
                    <div className="flex gap-1.5 h-2.5">
                      <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(e.scoreBreakdown!.participant / cap) * 100}%` }} />
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${(e.scoreBreakdown!.judge / cap) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100">
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3.5 h-2.5 rounded-full bg-blue-400 inline-block" /> 참가자 점수
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3.5 h-2.5 rounded-full bg-brand inline-block" /> 심사위원 점수
                </span>
              </div>
            </div>
          </section>
        )
      })()}

      {/* 전체 순위표 — 최하단 */}
      {entries.length > 0 && (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-xl font-extrabold tracking-tight">전체 순위</h2>
            <p className="text-xs text-gray-400 font-mono">
              최종 업데이트: {leaderboard ? formatDate(leaderboard.updatedAt) : '—'}
            </p>
          </div>
          {sections?.leaderboard?.note && (
            <p className="text-xs text-gray-400 italic mb-3">{sections.leaderboard.note}</p>
          )}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
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
                {entries.map(e => (
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
        </section>
      )}
    </div>
  )
}
