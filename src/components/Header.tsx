'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { getUser, setUser, clearUser, generateNickname, type User } from '@/lib/auth'

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

  const [user, setUserState] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [nickInput, setNickInput] = useState('')
  const loginRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserState(getUser())
  }, [])

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!showLogin) return
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node))
        setShowLogin(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showLogin])

  const handleOpenLogin = () => {
    setNickInput(generateNickname())
    setShowLogin(true)
  }

  const handleLogin = () => {
    const nick = nickInput.trim()
    if (!nick) return
    setUser(nick)
    setUserState({ nickname: nick })
    setShowLogin(false)
  }

  const handleLogout = () => {
    clearUser()
    setUserState(null)
  }

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

          {/* 인증 영역 */}
          <div className="relative ml-2" ref={loginRef}>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                  {user.nickname}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5">
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenLogin}
                className="text-sm font-semibold text-brand bg-brand-light border border-brand/20 px-3.5 py-1.5 rounded-lg hover:bg-brand/10 transition-colors">
                로그인
              </button>
            )}

            {/* 로그인 드롭다운 */}
            {showLogin && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
                <p className="text-sm font-semibold text-gray-800 mb-1">닉네임으로 시작하기</p>
                <p className="text-xs text-gray-400 mb-3">패스워드 없이 닉네임만으로 참여할 수 있어요.</p>
                <div className="flex gap-2 mb-2">
                  <input
                    value={nickInput}
                    onChange={e => setNickInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="닉네임 입력"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
                    autoFocus
                  />
                  <button
                    onClick={() => setNickInput(generateNickname())}
                    className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 hover:bg-gray-50 transition-colors whitespace-nowrap">
                    자동생성
                  </button>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={!nickInput.trim()}
                  className="w-full bg-brand text-white text-sm font-semibold py-2 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  시작하기
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
