import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p className="text-6xl font-extrabold text-brand mb-4">404</p>
      <h1 className="text-xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/" className="bg-brand text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-dark transition-colors no-underline">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
