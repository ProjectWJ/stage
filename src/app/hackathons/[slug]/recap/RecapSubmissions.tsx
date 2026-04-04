'use client'
import { useState, useEffect } from 'react'
import type { Submission } from '@/types'
import { getAllSubmissions } from '@/lib/storage'
import { ShowcaseCard } from '@/components/ShowcaseCard'

export function RecapSubmissions({ hackathonSlug, hackathonTitle }: { hackathonSlug: string; hackathonTitle: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const all = getAllSubmissions().filter(s => s.hackathonSlug === hackathonSlug)
      setSubmissions(all)
    } finally {
      setMounted(true)
    }
  }, [hackathonSlug])

  if (!mounted || submissions.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-xl font-extrabold tracking-tight mb-6">제출물 쇼케이스</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {submissions.map(s => (
          <ShowcaseCard key={s.id} submission={s} hackathonTitle={hackathonTitle} />
        ))}
      </div>
    </section>
  )
}
