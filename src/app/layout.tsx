import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: { default: 'STAGE — 오픈 해커톤 플랫폼', template: '%s | STAGE' },
  description: '해커톤의 끝은 이야기가 되어야 한다. 오픈 해커톤 플랫폼 STAGE.',
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
