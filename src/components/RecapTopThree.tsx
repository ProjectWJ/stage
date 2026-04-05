'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { LeaderboardEntry, Submission } from '@/types'
import { getAllSubmissions } from '@/lib/storage'
import { AISummaryBox } from './AISummaryBox'

const RANK_CONFIG: Record<number, {
  label: string
  bg: string
  border: string
  badge: string
  scoreCls: string
}> = {
  1: {
    label: '🥇 우승',
    bg: 'from-yellow-50 via-amber-50 to-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    scoreCls: 'text-yellow-700',
  },
  2: {
    label: '🥈 2위',
    bg: 'from-slate-50 via-gray-50 to-slate-50',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    scoreCls: 'text-slate-600',
  },
  3: {
    label: '🥉 3위',
    bg: 'from-orange-50 via-amber-50 to-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    scoreCls: 'text-orange-700',
  },
}

interface Props {
  entries: LeaderboardEntry[]
  hackathonSlug: string
  hackathonTitle: string
}

export function RecapTopThree({ entries, hackathonSlug, hackathonTitle }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      setSubmissions(getAllSubmissions().filter(s => s.hackathonSlug === hackathonSlug))
    } finally {
      setMounted(true)
    }
  }, [hackathonSlug])

  const top3 = entries.filter(e => e.rank <= 3).sort((a, b) => a.rank - b.rank)
  if (top3.length === 0) return null

  const subMap = Object.fromEntries(submissions.map(s => [s.teamName, s]))

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold tracking-tight">수상팀 하이라이트</h2>
        <Link
          href={`/hackathons/${hackathonSlug}?tab=leaderboard`}
          className="text-sm font-semibold text-brand border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand-light transition-colors no-underline whitespace-nowrap">
          순위 확인하기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {top3.map(entry => {
          const cfg = RANK_CONFIG[entry.rank]
          const sub = mounted ? subMap[entry.teamName] : undefined
          const isFirst = entry.rank === 1

          return (
            <div
              key={entry.rank}
              className={`
                relative bg-gradient-to-br ${cfg.bg} border-2 ${cfg.border}
                rounded-2xl p-6 flex flex-col shadow-sm
                ${isFirst ? 'lg:shadow-md lg:ring-2 lg:ring-yellow-200/60' : ''}
              `}>
              {/* 1위 반짝 효과 */}
              {isFirst && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm shadow-md">
                  ✨
                </div>
              )}

              {/* 순위 + 점수 */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.badge}`}>
                  {cfg.label}
                </span>
                <span className={`font-mono font-extrabold ${isFirst ? 'text-2xl' : 'text-xl'} ${cfg.scoreCls}`}>
                  {entry.score}
                </span>
              </div>

              {/* 팀명 */}
              <h3 className={`font-extrabold tracking-tight mb-3 ${isFirst ? 'text-xl' : 'text-lg'}`}>
                {entry.teamName}
              </h3>

              {/* 본문 */}
              <div className="flex flex-col gap-3 flex-1">
                {sub ? (
                  <>
                    <p className="text-sm text-gray-600 leading-relaxed">{sub.description}</p>
                    <AISummaryBox summary={sub.aiSummary} />

                    {/* 코멘트 */}
                    {sub.judgeComment && (
                      <div className="bg-white/80 border border-purple-100 rounded-xl p-3.5">
                        <p className="text-xs font-semibold text-purple-600 mb-1.5">💬 심사위원 코멘트</p>
                        <p className="text-xs text-gray-600 leading-relaxed italic">&quot;{sub.judgeComment}&quot;</p>
                      </div>
                    )}
                    {sub.participantComment && (
                      <div className="bg-white/80 border border-blue-100 rounded-xl p-3.5">
                        <p className="text-xs font-semibold text-blue-600 mb-1.5">👥 팀 코멘트</p>
                        <p className="text-xs text-gray-600 leading-relaxed italic">&quot;{sub.participantComment}&quot;</p>
                      </div>
                    )}
                  </>
                ) : (
                  // 제출물 없을 때 — 아티팩트 설명만
                  !mounted && (
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-gray-200/70 rounded w-full" />
                      <div className="h-3 bg-gray-200/70 rounded w-4/5" />
                    </div>
                  )
                )}
              </div>

              {/* 링크 버튼 */}
              {(() => {
                const links = [
                  sub?.githubUrl && { href: sub.githubUrl, label: 'GitHub →', cls: 'text-gray-600 border-gray-200' },
                  (sub?.demoUrl || entry.artifacts?.webUrl) && {
                    href: (sub?.demoUrl ?? entry.artifacts?.webUrl)!,
                    label: '🌐 데모 보기',
                    cls: 'text-brand border-brand/20 bg-white/60',
                  },
                  entry.artifacts?.pdfUrl && {
                    href: entry.artifacts.pdfUrl,
                    label: `📄 ${entry.artifacts.planTitle ?? 'PDF'}`,
                    cls: 'text-gray-600 border-gray-200',
                  },
                ].filter(Boolean) as { href: string; label: string; cls: string }[]

                if (links.length === 0) return null
                return (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/60">
                    {links.map(l => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                        className={`text-xs font-semibold border px-3 py-1.5 rounded-lg hover:bg-white transition-colors no-underline ${l.cls}`}>
                        {l.label}
                      </a>
                    ))}
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </section>
  )
}
