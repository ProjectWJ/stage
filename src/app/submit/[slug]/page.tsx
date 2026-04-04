import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getHackathon, getHackathons } from '@/lib'
import { SubmitClient } from './SubmitClient'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getHackathons()
    .filter(h => h.status === 'ongoing')
    .map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const h = getHackathon(slug)
  return { title: h ? `${h.title} — 제출` : '제출' }
}

export default async function SubmitPage({ params }: Props) {
  const { slug } = await params
  const hackathon = getHackathon(slug)
  if (!hackathon || hackathon.status !== 'ongoing') notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">{hackathon.title}</h1>
      <p className="text-gray-500 text-sm mb-8">결과물을 제출하고 쇼케이스에 공개하세요.</p>
      <SubmitClient hackathonSlug={hackathon.slug} hackathonTitle={hackathon.title} />
    </div>
  )
}
