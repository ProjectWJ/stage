import type { Submission } from '@/types'
import { AISummaryBox } from './AISummaryBox'

const RANK_BADGE: Record<1 | 2 | 3, { label: string; className: string }> = {
  1: { label: '🥇 1위', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  2: { label: '🥈 2위', className: 'bg-slate-100 text-slate-600 border-slate-300' },
  3: { label: '🥉 3위', className: 'bg-orange-100 text-orange-800 border-orange-300' },
}

interface Props {
  submission: Submission
  hackathonTitle: string
  rank?: 1 | 2 | 3
}

export function ShowcaseCard({ submission, hackathonTitle, rank }: Props) {
  const { teamName, nickname, description, githubUrl, demoUrl, aiSummary, submittedAt } = submission

  const date = new Date(submittedAt)
  const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일`
  const badge = rank ? RANK_BADGE[rank] : null

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col ${badge ? 'border-yellow-300' : 'border-gray-200'}`}>
      {/* 헤더 */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{teamName}</h3>
            {badge && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
          <span title={hackathonTitle} className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md shrink-0 max-w-[7rem] truncate">
            {hackathonTitle}
          </span>
        </div>
        <p className="text-xs text-gray-400">{nickname} · {dateStr}</p>
      </div>

      {/* 본문 — flex-1로 늘려 버튼을 항상 하단에 고정 */}
      <div className="flex flex-col flex-1 gap-3">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <AISummaryBox summary={aiSummary} />
      </div>

      {/* 버튼 — mt-auto로 카드 하단 고정 */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors no-underline">
          GitHub →
        </a>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-brand border border-brand/20 bg-brand-light px-3 py-1.5 rounded-lg hover:bg-brand/10 transition-colors no-underline">
            데모 보기 →
          </a>
        )}
      </div>
    </div>
  )
}
