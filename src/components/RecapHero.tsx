import type { Hackathon, HackathonSections, LeaderboardEntry } from '@/types'
import { formatDate, formatKRW } from '@/lib'
import { CopyLinkButton } from './CopyLinkButton'

interface Props {
  hackathon: Hackathon
  entries: LeaderboardEntry[]
  sections: HackathonSections | null
}

export function RecapHero({ hackathon, entries, sections }: Props) {
  const maxScore = entries[0]?.score
  const totalPrize = sections?.prize?.items.reduce((sum, p) => sum + p.amountKRW, 0) ?? 0
  const participantCount = entries.length

  return (
    <div className="mb-10 text-center">
      <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-3">RECAP</p>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">{hackathon.title}</h1>
      <p className="text-sm text-gray-400 mb-6">종료일: {formatDate(hackathon.period.endAt)}</p>

      {/* 통계 배지 */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {participantCount > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center min-w-[80px]">
            <p className="font-extrabold text-2xl">{participantCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">참가팀</p>
          </div>
        )}
        {maxScore != null && (
          <div className="bg-brand-light border border-brand/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
            <p className="font-extrabold text-2xl text-brand">{maxScore}</p>
            <p className="text-xs text-gray-400 mt-0.5">최고점</p>
          </div>
        )}
        {totalPrize > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 text-center min-w-[80px]">
            <p className="font-extrabold text-2xl text-yellow-700">{formatKRW(totalPrize)}</p>
            <p className="text-xs text-gray-400 mt-0.5">총 상금</p>
          </div>
        )}
      </div>

      <CopyLinkButton />
    </div>
  )
}
