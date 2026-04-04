import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getHackathon, getHackathons, getHackathonDetail, getLeaderboard, formatDate } from '@/lib'
import { RecapHero } from '@/components/RecapHero'
import { RecapSubmissions } from './RecapSubmissions'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getHackathons().filter(h => h.status === 'ended').map(h => ({ slug: h.slug }))
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
  if (!hackathon || hackathon.status !== 'ended') notFound()

  const sections = getHackathonDetail(slug)
  const leaderboard = getLeaderboard(slug)
  const hasBreakdown = leaderboard?.entries.some(e => e.scoreBreakdown) ?? false
  const hasArtifacts = leaderboard?.entries.some(e => e.artifacts) ?? false

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href={`/hackathons/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg mb-8 hover:bg-gray-50 transition-colors no-underline">
        ← 해커톤 상세로
      </Link>

      <RecapHero hackathon={hackathon} entries={leaderboard?.entries ?? []} sections={sections} />

      {/* 전체 순위표 */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <section className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">전체 순위</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">최종 업데이트: {formatDate(leaderboard.updatedAt)}</p>
            </div>
            <Link href={`/showcase?tab=${slug}`}
              className="text-sm font-semibold text-brand border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand-light transition-colors no-underline whitespace-nowrap">
              쇼케이스 보기 →
            </Link>
          </div>
          {sections?.leaderboard?.note && (
            <p className="text-xs text-gray-400 italic mb-3">{sections.leaderboard.note}</p>
          )}
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
        </section>
      )}

      {/* 제출물 쇼케이스 (localStorage, 클라이언트) */}
      <Suspense>
        <RecapSubmissions hackathonSlug={slug} hackathonTitle={hackathon.title} />
      </Suspense>
    </div>
  )
}
