import type { Submission } from '@/types'
import { AISummaryBox } from './AISummaryBox'

const RANK_CONFIG: Record<1 | 2 | 3, { label: string; bg: string; border: string; badge: string }> = {
  1: { label: '🥇 우승', bg: 'from-yellow-50 via-amber-50 to-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  2: { label: '🥈 2위', bg: 'from-slate-50 via-gray-50 to-slate-50', border: 'border-slate-300', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  3: { label: '🥉 3위', bg: 'from-orange-50 via-amber-50 to-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
}

interface Props {
  submission: Submission
  rank: 1 | 2 | 3
}

export function ShowcaseHighlightCard({ submission, rank }: Props) {
  const cfg = RANK_CONFIG[rank]
  const isFirst = rank === 1
  const { id, teamName, nickname, description, githubUrl, demoUrl, aiSummary, judgeComment, participantComment } = submission

  return (
    <div
      onClick={() => window.open(`/showcase/${id}`, '_blank')}
      className={`relative bg-gradient-to-br ${cfg.bg} border-2 ${cfg.border} rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isFirst ? 'ring-2 ring-yellow-200/60' : ''}`}>

      {/* 1위 반짝 효과 */}
      {isFirst && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm shadow-md">
          ✨
        </div>
      )}

      {/* 순위 뱃지 */}
      <div className="mb-4">
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* 팀명 */}
      <h3 className={`font-extrabold tracking-tight mb-1 ${isFirst ? 'text-xl' : 'text-lg'}`}>
        {teamName}
      </h3>
      <p className="text-xs text-gray-400 mb-3">{nickname}</p>

      {/* 본문 */}
      <div className="flex flex-col gap-3 flex-1">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <AISummaryBox summary={aiSummary} />
        {judgeComment && (
          <div className="bg-white/80 border border-purple-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-purple-600 mb-1.5">💬 심사위원 코멘트</p>
            <p className="text-xs text-gray-600 leading-relaxed italic">&quot;{judgeComment}&quot;</p>
          </div>
        )}
        {participantComment && (
          <div className="bg-white/80 border border-blue-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-blue-600 mb-1.5">👥 팀 코멘트</p>
            <p className="text-xs text-gray-600 leading-relaxed italic">&quot;{participantComment}&quot;</p>
          </div>
        )}
      </div>

      {/* 링크 */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/60">
        <a href={githubUrl} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-white transition-colors no-underline">
          GitHub →
        </a>
        {demoUrl && (
          <a href={demoUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs font-semibold text-brand border border-brand/20 bg-white/60 px-3 py-1.5 rounded-lg hover:bg-white transition-colors no-underline">
            🌐 데모 보기
          </a>
        )}
      </div>
    </div>
  )
}
