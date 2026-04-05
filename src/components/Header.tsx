'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, startTransition } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const loginRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startTransition(() => setUserState(getUser()))
  }, [])

  // 경로 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    startTransition(() => setMenuOpen(false))
  }, [pathname])

  // 바깥 클릭 시 로그인 드롭다운 닫기
  useEffect(() => {
    if (!showLogin) return
    const handler = (e: PointerEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node))
        setShowLogin(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [showLogin])

  const handleOpenLogin = () => {
    setNickInput(generateNickname())
    setShowLogin(true)
    // 모바일에서는 메뉴를 닫지 않음 — 로그인 폼이 메뉴 패널 안에 렌더됨
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
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight no-underline text-gray-900">
          <span className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-sm font-bold">S</span>
          STAGE
        </Link>

        {/* 데스크탑 nav */}
        <nav className="hidden md:flex items-center gap-1">
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
              <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-3rem)] bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
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

        {/* 모바일: 닉네임 + 햄버거 */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg max-w-[80px] truncate">
              {user.nickname}
            </span>
          )}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-lg"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 패널 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="max-w-5xl mx-auto px-6 py-3">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-3 rounded-lg text-sm font-medium transition-all no-underline ${
                  isActive(href)
                    ? 'text-brand bg-brand-light'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-semibold text-gray-700">{user.nickname}</span>
                  <button onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    로그아웃
                  </button>
                </div>
              ) : (
                <button onClick={handleOpenLogin}
                  className="w-full text-sm font-semibold text-brand bg-brand-light border border-brand/20 px-3.5 py-2.5 rounded-lg hover:bg-brand/10 transition-colors">
                  로그인
                </button>
              )}
            </div>
          </nav>

          {/* 모바일 로그인 드롭다운 */}
          {showLogin && (
            <div className="max-w-5xl mx-auto px-6 pb-4" ref={loginRef}>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
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
            </div>
          )}
        </div>
      )}
    </header>
  )
}
