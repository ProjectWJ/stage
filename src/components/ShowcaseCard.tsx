import type { Submission } from '@/types'
import { AISummaryBox } from './AISummaryBox'

interface Props {
  submission: Submission
  hackathonTitle: string
}

export function ShowcaseCard({ submission, hackathonTitle }: Props) {
  const { teamName, nickname, description, githubUrl, demoUrl, aiSummary, submittedAt } = submission

  const date = new Date(submittedAt)
  const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일`

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{teamName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{nickname} · {dateStr}</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
          {hackathonTitle}
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>

      <AISummaryBox summary={aiSummary} />

      <div className="flex gap-2 mt-1">
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
