'use client'
import { useState, useEffect } from 'react'

// slug를 시드로 그라디언트 선택 — 결정론적, inline style 사용 (Tailwind 동적 클래스 스캔 누락 방지)
const GRADIENTS = [
  'linear-gradient(135deg, #818cf8, #ec4899)',
  'linear-gradient(135deg, #60a5fa, #2dd4bf)',
  'linear-gradient(135deg, #a78bfa, #60a5fa)',
  'linear-gradient(135deg, #fb923c, #fbbf24)',
  'linear-gradient(135deg, #34d399, #22d3ee)',
  'linear-gradient(135deg, #fb7185, #e879f9)',
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
  const [mounted, setMounted] = useState(false)
  const [failed, setFailed] = useState(false)
  const gradientStyle = { background: pickGradient(slug) }

  useEffect(() => { setMounted(true) }, [])

  // SSR 및 hydration: 항상 gradient div → img가 HTML에 박히지 않음
  if (!mounted || failed) {
    return <div className="w-full aspect-video rounded-t-xl" style={gradientStyle} />
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
