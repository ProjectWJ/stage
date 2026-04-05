import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getHackathon, getHackathons, getHackathonDetail,
  getLeaderboard, getTeamsByHackathon,
} from '@/lib'
import { StatusBadge } from '@/components/StatusBadge'
import { DetailTabs } from './DetailTabs'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getHackathons().map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const h = getHackathon(slug)
  return { title: h?.title ?? '해커톤 상세' }
}

export default async function HackathonDetailPage({ params }: Props) {
  const { slug } = await params
  const hackathon = getHackathon(slug)
  if (!hackathon) notFound()

  const sections = getHackathonDetail(slug)
  const leaderboard = getLeaderboard(slug)
  const teams = getTeamsByHackathon(slug)
  const tp = sections?.overview?.teamPolicy

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/hackathons" className="inline-flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg mb-7 hover:bg-gray-50 transition-colors no-underline">
        ← 목록으로
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-gray-200 rounded-xl p-8 mb-7">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={hackathon.status} />
          {tp && (
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md font-medium">
              {tp.allowSolo ? '개인 참가 가능' : '팀 필수'} · 최대 {tp.maxTeamSize}인
            </span>
          )}
          {hackathon.tags.map(t => (
            <span key={t} className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">{t}</span>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 leading-tight">{hackathon.title}</h1>
        {sections?.overview?.summary && (
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl">{sections.overview.summary}</p>
        )}
        {hackathon.status === 'ended' && (
          <div className="mt-6 bg-brand-light border border-brand/20 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand">해커톤이 모두 종료되었습니다.</p>
              <p className="text-xs text-gray-500 mt-0.5">참가자들의 출품작을 관람해보세요!</p>
            </div>
            <Link href={`/hackathons/${hackathon.slug}/recap`}
              className="bg-brand text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors no-underline whitespace-nowrap">
              쇼케이스 보기 →
            </Link>
          </div>
        )}
      </div>

      {/* 8-tab layout */}
      <Suspense>
        <DetailTabs
          hackathon={hackathon}
          sections={sections}
          leaderboard={leaderboard}
          teams={teams}
        />
      </Suspense>
    </div>
  )
}
