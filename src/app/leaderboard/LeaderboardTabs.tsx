'use client'
import { useState } from 'react'
import type { LeaderboardData, Hackathon } from '@/types'
import { formatDate } from '@/lib'

const RANK_STYLES: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-slate-100 text-slate-600',
  3: 'bg-orange-100 text-orange-800',
}

export function LeaderboardTabs({ leaderboards, hackathons }: { leaderboards: LeaderboardData[]; hackathons: Hackathon[] }) {
  const [activeSlug, setActiveSlug] = useState(leaderboards[0]?.hackathonSlug)
  const active = leaderboards.find(l => l.hackathonSlug === activeSlug)
  if (!active) return null

  const hasBreakdown = active.entries.some(e => e.scoreBreakdown)
  const hasArtifacts = active.entries.some(e => e.artifacts)

  return (
    <>
      <div className="flex border-b-2 border-gray-200 mb-7 overflow-x-auto">
        {leaderboards.map(lb => {
          const h = hackathons.find(x => x.slug === lb.hackathonSlug)
          return (
            <button key={lb.hackathonSlug} onClick={() => setActiveSlug(lb.hackathonSlug)}
              className={`px-5 py-3 text-sm font-medium border-b-2 -mb-0.5 whitespace-nowrap transition-all ${
                lb.hackathonSlug === activeSlug
                  ? 'text-brand border-brand font-semibold'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}>
              {h?.title ?? lb.hackathonSlug}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 font-mono mb-4">최종 업데이트: {formatDate(active.updatedAt)}</p>

      {active.entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p>등록된 순위가 없습니다.</p>
        </div>
      ) : (
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
              {active.entries.map(e => (
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
                            📄 PDF
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
      )}
    </>
  )
}
