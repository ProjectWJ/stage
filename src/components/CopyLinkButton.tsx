'use client'
import { useState } from 'react'

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
      {copied ? '복사됨 ✓' : '🔗 링크 복사'}
    </button>
  )
}
