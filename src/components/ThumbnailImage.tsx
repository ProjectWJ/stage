'use client'
import { useState } from 'react'

// slug를 시드로 그라디언트 선택 — 결정론적
const GRADIENTS = [
  'from-indigo-400 via-purple-400 to-pink-400',
  'from-blue-400 via-cyan-400 to-teal-400',
  'from-violet-500 via-indigo-400 to-blue-400',
  'from-orange-400 via-amber-400 to-yellow-300',
  'from-emerald-400 via-teal-400 to-cyan-400',
  'from-rose-400 via-pink-400 to-fuchsia-400',
]

function pickGradient(slug: string) {
  const hash = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

interface Props {
  src: string
  alt: string
  slug: string
}

export function ThumbnailImage({ src, alt, slug }: Props) {
  const [failed, setFailed] = useState(false)
  const gradient = pickGradient(slug)

  if (failed) {
    return (
      <div className={`w-full aspect-video bg-gradient-to-br ${gradient} rounded-t-xl`} />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full aspect-video object-cover rounded-t-xl"
    />
  )
}
