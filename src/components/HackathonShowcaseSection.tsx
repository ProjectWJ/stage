'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Hackathon, Submission } from '@/types'
import { formatDate } from '@/lib'
import { StatusBadge } from './StatusBadge'
import { ShowcaseCard } from './ShowcaseCard'
import { ShowcaseHighlightCard } from './ShowcaseHighlightCard'

const GRADIENTS = [
  'linear-gradient(135deg, #60a5fa, #4f46e5)',
  'linear-gradient(135deg, #c084fc, #db2777)',
  'linear-gradient(135deg, #34d399, #0d9488)',
  'linear-gradient(135deg, #fb923c, #ef4444)',
  'linear-gradient(135deg, #facc15, #d97706)',
]

interface Props {
  hackathon: Hackathon
  overview: string
  submissions: Submission[]
  rankMap: Record<string, 1 | 2 | 3>
  index: number
}

export function HackathonShowcaseSection({ hackathon, overview, submissions, rankMap, index }: Props) {
  const gradientStyle = { background: GRADIENTS[index % GRADIENTS.length] }
  const isLocked = hackathon.status === 'ongoing' || hackathon.status === 'upcoming'
  const [previewOpen, setPreviewOpen] = useState(false)

  const sorted = submissions.slice().sort((a, b) => {
    const ra = rankMap[`${a.hackathonSlug}::${a.teamName}`] ?? 99
    const rb = rankMap[`${b.hackathonSlug}::${b.teamName}`] ?? 99
    if (ra !== rb) return ra - rb
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  })

  return (
    <section id={hackathon.slug} className="scroll-mt-20 mb-16">
      {/* 섹션 헤더 */}
      <div className="flex flex-col gap-1.5 mb-5">
        <h2 className="text-xl font-bold text-gray-900">{hackathon.title}</h2>
        <div><StatusBadge status={hackathon.status} /></div>
      </div>

      {/* 해커톤 정보 카드 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex gap-5 shadow-sm">
        <div className="w-28 h-20 rounded-lg shrink-0" style={gradientStyle} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-2">~ {formatDate(hackathon.period.endAt)} 종료</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hackathon.tags.map(tag => (
              <span key={tag} className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
          {overview && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">{overview}</p>
          )}
          <Link
            href={`/hackathons/${hackathon.slug}`}
            className="inline-block text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors no-underline">
            해커톤 보기 →
          </Link>
        </div>
      </div>

      {/* 제출물 영역 */}
      {isLocked ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-8 text-center">
          <p className="text-2xl mb-3">🔒</p>
          <p className="text-sm font-semibold text-gray-700 mb-1">결과물은 해커톤 종료 후 공개됩니다</p>
          <p className="text-xs text-gray-400 mb-5">
            {formatDate(hackathon.period.endAt)} 이후 확인할 수 있습니다
          </p>
          <button
            onClick={() => setPreviewOpen(v => !v)}
            className="text-xs font-medium text-gray-400 border border-dashed border-gray-300 px-4 py-1.5 rounded-lg hover:text-gray-600 hover:border-gray-400 transition-colors">
            {previewOpen ? '임시 공개 닫기' : '임시 공개 (개발용)'}
          </button>
          {previewOpen && submissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 text-left">
              {sorted.map(s => (
                <ShowcaseCard
                  key={s.id}
                  submission={s}
                  hackathonTitle={hackathon.title}
                  rank={rankMap[`${s.hackathonSlug}::${s.teamName}`]}
                />
              ))}
            </div>
          )}
          {previewOpen && submissions.length === 0 && (
            <p className="text-xs text-gray-400 mt-4">제출물이 없습니다.</p>
          )}
        </div>
      ) : (() => {
        // ended 해커톤 — rankMap에 있는 top3만 하이라이트 카드로 표시
        const top3 = ([1, 2, 3] as const)
          .map(r => ({ rank: r, sub: sorted.find(s => rankMap[`${s.hackathonSlug}::${s.teamName}`] === r) }))
          .filter((x): x is { rank: 1 | 2 | 3; sub: Submission } => x.sub !== undefined)

        if (top3.length > 0) {
          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {top3.map(({ rank, sub }) => (
                  <ShowcaseHighlightCard key={sub.id} submission={sub} rank={rank} />
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/hackathons/${hackathon.slug}?tab=showcase`}
                  className="text-sm font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors no-underline">
                  전체 쇼케이스 보기 →
                </Link>
              </div>
            </>
          )
        }

        // rankMap 없으면 일반 그리드 폴백
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map(s => (
              <ShowcaseCard
                key={s.id}
                submission={s}
                hackathonTitle={hackathon.title}
                rank={rankMap[`${s.hackathonSlug}::${s.teamName}`]}
              />
            ))}
          </div>
        )
      })()}
    </section>
  )
}
