import type { HackathonStatus } from '@/types'
import { STATUS_KO } from '@/lib'

const DOT_CLASS: Record<HackathonStatus, string> = {
  ongoing: 'bg-green-500 animate-[pulse-dot_2s_infinite]',
  ended: 'bg-slate-400',
  upcoming: 'bg-blue-500',
}

export function StatusBadge({ status }: { status: HackathonStatus }) {
  return (
    <span className={`badge-${status}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_CLASS[status]}`} />
      {STATUS_KO[status]}
    </span>
  )
}
