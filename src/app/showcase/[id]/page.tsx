import { Suspense } from 'react'
import { SubmissionDetailClient } from './SubmissionDetailClient'

interface Props { params: Promise<{ id: string }> }

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <span className="w-6 h-6 border-2 border-gray-200 border-t-brand rounded-full animate-spin" />
        </div>
      }>
        <SubmissionDetailClient id={id} />
      </Suspense>
    </div>
  )
}
