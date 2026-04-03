'use client'
import { useState } from 'react'
import type { RankingEntry } from '@/lib/rankings'

type Period = '7d' | '30d' | 'all'

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

export function RankingsClient({ rankings }: { rankings: RankingEntry[] }) {
  const [period, setPeriod] = useState<Period>('all')

  return (
    <>
      <div className="flex gap-2 mb-8">
        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
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
    </>
  )
}
