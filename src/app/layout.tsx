import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: { default: 'STAGE — 오픈 해커톤 플랫폼', template: '%s | STAGE' },
  description: '누구나, 로그인 없이, 해커톤 결과를 한눈에 볼 수 있는 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-white text-gray-900 min-h-screen">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
