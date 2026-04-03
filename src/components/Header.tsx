'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: '홈' },
  { href: '/hackathons', label: '해커톤' },
  { href: '/camp', label: '캠프' },
  { href: '/rankings', label: '랭킹' },
  { href: '/showcase', label: '쇼케이스' },
]

export function Header() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight no-underline text-gray-900">
          <span className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-sm font-bold">S</span>
          STAGE
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all no-underline ${
                isActive(href)
                  ? 'text-brand bg-brand-light'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
