import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getHackathon, getHackathons, getHackathonDetail, getLeaderboard } from '@/lib'
import { RecapHero } from '@/components/RecapHero'
import { RecapTopThree } from '@/components/RecapTopThree'
import { RecapSubmissions } from './RecapSubmissions'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getHackathons().map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const h = getHackathon(slug)
  return { title: h ? `${h.title} — Recap` : 'Recap' }
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

      {/* 전체 쇼케이스 */}
      <RecapSubmissions hackathonSlug={slug} hackathonTitle={hackathon.title} />
    </div>
  )
}
