import type { Hackathon, HackathonSections, LeaderboardEntry } from '@/types'
import { formatDate, formatKRW } from '@/lib'

const PODIUM = [
  { rank: 2, label: '🥈 2위', size: 'small', color: 'from-slate-50 to-gray-100', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600' },
  { rank: 1, label: '🥇 우승', size: 'large', color: 'from-yellow-50 to-amber-50', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-800' },
  { rank: 3, label: '🥉 3위', size: 'small', color: 'from-orange-50 to-amber-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
]

function ArtifactLinks({ entry }: { entry: LeaderboardEntry }) {
  if (!entry.artifacts) return null
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {entry.artifacts.webUrl && (
        <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-brand bg-white border border-brand/20 px-2.5 py-1 rounded-md hover:bg-brand hover:text-white transition-colors no-underline">
          🌐 WEB
        </a>
      )}
      {entry.artifacts.pdfUrl && (
        <a href={entry.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-brand bg-white border border-brand/20 px-2.5 py-1 rounded-md hover:bg-brand hover:text-white transition-colors no-underline">
          📄 {entry.artifacts.planTitle ?? 'PDF'}
        </a>
      )}
    </div>
  )
}

interface Props {
  hackathon: Hackathon
  entries: LeaderboardEntry[]
  sections: HackathonSections | null
}

export function RecapHero({ hackathon, entries, sections }: Props) {
  const byRank = Object.fromEntries(entries.slice(0, 3).map(e => [e.rank, e]))

  return (
    <div className="mb-10">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">RECAP</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{hackathon.title}</h1>
        <p className="text-sm text-gray-400">종료일: {formatDate(hackathon.period.endAt)}</p>
      </div>

      {/* 포디움 */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {PODIUM.map(({ rank, label, size, color, border, badge }) => {
          const entry = byRank[rank]
          if (!entry) return null
          const isLarge = size === 'large'
          return (
            <div key={rank}
              className={`bg-gradient-to-br ${color} border ${border} rounded-2xl shadow-sm flex flex-col items-center text-center
                ${isLarge ? 'px-8 py-7 flex-1 max-w-xs' : 'px-5 py-5 w-44'}`}>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge} mb-3`}>{label}</span>
              <p className={`font-extrabold leading-tight mb-1 ${isLarge ? 'text-xl' : 'text-base'}`}>{entry.teamName}</p>
              <p className={`font-mono text-brand ${isLarge ? 'text-3xl font-black' : 'text-xl font-bold'}`}>{entry.score}</p>
              <ArtifactLinks entry={entry} />
            </div>
          )
        })}
      </div>

      {/* 시상 내역 */}
      {sections?.prize && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-sm mx-auto">
          <div className="px-5 py-3 border-b border-gray-100 text-sm font-bold text-center">🏆 시상 내역</div>
          <div className="divide-y divide-gray-100">
            {sections.prize.items.map((p, i) => {
              const styles = ['text-yellow-800', 'text-slate-600', 'text-orange-800']
              return (
                <div key={p.place} className="flex items-center justify-between px-5 py-3">
                  <span className={`text-sm font-semibold ${styles[i] ?? styles[2]}`}>{p.place}</span>
                  <span className="font-extrabold text-base">{formatKRW(p.amountKRW)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
