import Link from 'next/link'
import type { Hackathon } from '@/types'
import { formatDate, getTzAbbr, getHackathonDetail } from '@/lib'
import { StatusBadge } from './StatusBadge'
import { ThumbnailImage } from './ThumbnailImage'

export function HackathonCard({ hackathon: h }: { hackathon: Hackathon }) {
  const detail = getHackathonDetail(h.slug)
  const summary = detail?.overview?.summary
  const isEnded = h.status === 'ended'
  const tz = getTzAbbr(h.period.timezone)

  return (
    <Link href={h.links.detail ?? `/hackathons/${h.slug}`}
      className="flex flex-col bg-white border border-gray-200 rounded-xl no-underline text-gray-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-lg hover:shadow-brand/10 hover:ring-2 hover:ring-brand/20 overflow-hidden">
      <ThumbnailImage src={h.thumbnailUrl} alt={h.title} slug={h.slug} />
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-3">
          <StatusBadge status={h.status} />
        </div>
        <h3 className="font-bold text-base leading-snug mb-2.5">{h.title}</h3>
        {summary && <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{summary}</p>}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {h.tags.map(tag => (
            <span key={tag} className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">{isEnded ? '대회 종료' : '제출 마감'}</p>
            <p className="text-sm font-semibold mt-0.5">
              {formatDate(isEnded ? h.period.endAt : h.period.submissionDeadlineAt)}
              <span className="text-xs font-normal text-gray-400 ml-1">({tz})</span>
            </p>
          </div>
          <span className="text-sm font-semibold text-brand bg-brand-light border border-brand/20 px-3 py-1.5 rounded-lg">
            자세히 →
          </span>
        </div>
      </div>
    </Link>
  )
}
