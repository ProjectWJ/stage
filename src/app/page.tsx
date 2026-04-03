import Link from 'next/link'
import { getHackathons, formatKRW } from '@/lib'
import { HackathonCard } from '@/components/HackathonCard'

export default function HomePage() {
  const hackathons = getHackathons()
  const ongoing = hackathons.filter(h => h.status === 'ongoing')
  const upcoming = hackathons.filter(h => h.status === 'upcoming')
  const ended = hackathons.filter(h => h.status === 'ended')
  const totalPrize = 3_000_000 + 1_500_000 + 800_000

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-indigo-50/60 to-orange-50/40 border-b border-gray-200 py-20 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <span className="inline-flex items-center gap-1.5 bg-brand-light text-brand border border-brand/20 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            오픈 해커톤 플랫폼
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-5">
            누구나, <span className="text-brand">로그인 없이</span>,<br />
            해커톤 결과를 <span className="text-brand">한눈에</span>.
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed mb-10">
            해커톤 플랫폼 본연의 역할 —<br />결과를 보여주는 것 — 에 집중합니다.
          </p>

          <div className="inline-flex border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            {[
              { val: hackathons.length, label: '전체 해커톤' },
              { val: ongoing.length, label: '진행 중', color: 'text-green-600' },
              { val: hackathons.reduce((s, h) => s + (h.slug === 'daker-handover-2026-03' ? 2 : h.slug === 'aimers-8-model-lite' ? 2 : 1), 0), label: '참가 팀', color: 'text-brand' },
              { val: formatKRW(totalPrize), label: '총 상금' },
            ].map(({ val, label, color = '' }, i, arr) => (
              <div key={label} className={`px-8 py-5 text-center ${i < arr.length - 1 ? 'border-r border-gray-200' : ''}`}>
                <p className={`text-2xl font-extrabold leading-none ${color}`}>{val}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/hackathons"
              className="bg-brand text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors no-underline">
              해커톤 보러가기 →
            </Link>
            <Link href="/camp"
              className="bg-white text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors no-underline">
              팀 찾기
            </Link>
            <Link href="/rankings"
              className="bg-white text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors no-underline">
              랭킹 보기
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        {/* Ongoing */}
        <section className="py-14">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-xl font-bold tracking-tight">진행 중인 해커톤</h2>
          </div>
          {ongoing.length > 0
            ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{ongoing.map(h => <HackathonCard key={h.slug} hackathon={h} />)}</div>
            : <p className="text-gray-400 text-sm">현재 진행 중인 해커톤이 없습니다.</p>
          }
        </section>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="pb-14">
            <h2 className="text-xl font-bold tracking-tight mb-7">예정 해커톤</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map(h => <HackathonCard key={h.slug} hackathon={h} />)}
            </div>
          </section>
        )}

        {/* Ended */}
        {ended.length > 0 && (
          <section className="pb-14">
            <h2 className="text-xl font-bold tracking-tight mb-7">최근 종료</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ended.map(h => <HackathonCard key={h.slug} hackathon={h} />)}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
