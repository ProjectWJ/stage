'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllSubmissions } from '@/lib/storage'
import { getAllLeaderboards, formatDate } from '@/lib'
import { AISummaryBox } from '@/components/AISummaryBox'
import type { Submission } from '@/types'

const RANK_BADGE: Record<1 | 2 | 3, { label: string; className: string }> = {
  1: { label: '🥇 1위', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  2: { label: '🥈 2위', className: 'bg-slate-100 text-slate-600 border-slate-300' },
  3: { label: '🥉 3위', className: 'bg-orange-100 text-orange-800 border-orange-300' },
}

function buildRankMap(): Record<string, 1 | 2 | 3> {
  const map: Record<string, 1 | 2 | 3> = {}
  for (const lb of getAllLeaderboards()) {
    for (const e of lb.entries) {
      if (e.rank <= 3) map[`${lb.hackathonSlug}::${e.teamName}`] = e.rank as 1 | 2 | 3
    }
  }
  return map
}

interface Props { id: string }

export function SubmissionDetailClient({ id }: Props) {
  const [submission, setSubmission] = useState<Submission | null | undefined>(undefined)
  const [rankMap, setRankMap] = useState<Record<string, 1 | 2 | 3>>({})

  useEffect(() => {
    try {
      const all = getAllSubmissions()
      setSubmission(all.find(s => s.id === id) ?? null)
      setRankMap(buildRankMap())
    } catch {
      setSubmission(null)
    }
  }, [id])

  // 로딩
  if (submission === undefined) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="w-6 h-6 border-2 border-gray-200 border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  // 없음
  if (submission === null) {
    return (
      <div className="text-center py-32">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-lg font-bold text-gray-700 mb-2">제출물을 찾을 수 없습니다</h2>
        <p className="text-sm text-gray-400 mb-6">삭제됐거나 잘못된 주소일 수 있어요.</p>
        <Link href="/showcase" className="text-sm font-medium text-brand border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand-light transition-colors no-underline">
          쇼케이스로 돌아가기
        </Link>
      </div>
    )
  }

  const {
    hackathonSlug, teamName, nickname, submittedAt,
    githubUrl, demoUrl, description,
    techStack, problemStatement, features, teamIntro, aiSummary,
  } = submission

  const rank = rankMap[`${hackathonSlug}::${teamName}`]
  const badge = rank ? RANK_BADGE[rank] : null
  const dateStr = formatDate(submittedAt)

  return (
    <article>
      {/* 뒤로가기 */}
      <Link href="/showcase" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors no-underline mb-8">
        ← 쇼케이스로 돌아가기
      </Link>

      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {hackathonSlug && (
            <Link
              href={`/hackathons/${hackathonSlug}`}
              className="text-xs font-semibold text-brand bg-brand-light border border-brand/20 px-2.5 py-0.5 rounded-md no-underline hover:bg-brand/10 transition-colors">
              {hackathonSlug}
            </Link>
          )}
          {badge && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">{teamName}</h1>
        <p className="text-sm text-gray-400">{nickname} · {dateStr}</p>

        <div className="flex flex-wrap gap-2 mt-5">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors no-underline">
            GitHub →
          </a>
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand border border-brand/20 bg-brand-light px-4 py-2 rounded-lg hover:bg-brand/10 transition-colors no-underline">
              데모 보기 →
            </a>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* 프로젝트 소개 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📝</span> 프로젝트 소개
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </section>

        {/* 문제 정의 */}
        {problemStatement && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>🔍</span> 문제 정의
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{problemStatement}</p>
          </section>
        )}

        {/* 주요 기능 */}
        {features && features.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>⚡</span> 주요 기능
            </h2>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-brand mt-0.5 shrink-0">•</span>
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 기술 스택 */}
        {techStack && techStack.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>🛠</span> 기술 스택
            </h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map(t => (
                <span key={t} className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 팀 소개 */}
        {teamIntro && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>👥</span> 팀 소개
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{teamIntro}</p>
          </section>
        )}

        {/* AI 요약 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span>🤖</span> AI 요약
          </h2>
          <AISummaryBox summary={aiSummary} />
        </section>
      </div>
    </article>
  )
}
