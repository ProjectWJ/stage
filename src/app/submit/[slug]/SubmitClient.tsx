'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, setUser, generateNickname, type User } from '@/lib/auth'
import { addSubmission } from '@/lib/storage'
import { generateAISummary } from '@/lib/ai'
import type { Submission } from '@/types'

interface Props {
  hackathonSlug: string
  hackathonTitle: string
}

export function SubmitClient({ hackathonSlug }: Props) {
  const router = useRouter()
  const [user, setUserState] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  // 닉네임 설정 단계
  const [nickInput, setNickInput] = useState('')

  // 제출 폼 — 기본
  const [teamName, setTeamName] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [description, setDescription] = useState('')

  // 제출 폼 — 상세 (선택)
  const [techStackInput, setTechStackInput] = useState('')
  const [problemStatement, setProblemStatement] = useState('')
  const [featuresInput, setFeaturesInput] = useState('')
  const [teamIntro, setTeamIntro] = useState('')

  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const u = getUser()
      setUserState(u)
      if (!u) setNickInput(generateNickname())
    } finally {
      setMounted(true)
    }
  }, [])

  if (!mounted) return null

  // ── 닉네임 설정 단계 ──
  if (!user) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-1">먼저 닉네임을 설정해 주세요</h2>
        <p className="text-sm text-gray-500 mb-6">
          패스워드 없이 닉네임만으로 참여할 수 있어요. 아래 자동 생성된 닉네임을 사용하거나 직접 입력하세요.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            value={nickInput}
            onChange={e => setNickInput(e.target.value)}
            placeholder="닉네임 입력"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
          />
          <button
            onClick={() => setNickInput(generateNickname())}
            className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 hover:bg-gray-50 transition-colors whitespace-nowrap">
            자동생성
          </button>
        </div>
        <button
          onClick={() => {
            const nick = nickInput.trim()
            if (!nick) return
            setUser(nick)
            setUserState({ nickname: nick })
          }}
          disabled={!nickInput.trim()}
          className="w-full bg-brand text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          이 닉네임으로 시작하기
        </button>
      </div>
    )
  }

  // ── AI 요약 생성 ──
  const handleGenerateSummary = async () => {
    setAiGenerating(true)
    setAiSummary(null)
    try {
      const summary = await generateAISummary(teamName.trim())
      setAiSummary(summary)
    } finally {
      setAiGenerating(false)
    }
  }

  // ── 제출 폼 ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!teamName.trim()) { setError('팀명을 입력해 주세요.'); return }
    if (!githubUrl.trim()) { setError('GitHub URL을 입력해 주세요.'); return }
    if (!description.trim()) { setError('한줄 소개를 입력해 주세요.'); return }

    setSubmitting(true)
    try {
      const submission: Submission = {
        id: crypto.randomUUID(),
        hackathonSlug,
        nickname: user.nickname,
        teamName: teamName.trim(),
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim() || undefined,
        description: description.trim(),
        submittedAt: new Date().toISOString(),
        aiSummary: aiSummary ?? await generateAISummary(teamName.trim()),
        techStack: techStackInput.trim()
          ? techStackInput.split(',').map(t => t.trim()).filter(Boolean)
          : undefined,
        problemStatement: problemStatement.trim() || undefined,
        features: featuresInput.trim()
          ? featuresInput.split('\n').filter(Boolean)
          : undefined,
        teamIntro: teamIntro.trim() || undefined,
      }
      addSubmission(submission)
      router.push('/showcase')
    } catch {
      setError('제출 중 오류가 발생했습니다. 다시 시도해 주세요.')
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{user.nickname}</span> 으로 제출
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── 기본 정보 ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">팀명 <span className="text-red-400">*</span></label>
          <input
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="예) Team Alpha"
            className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            팀 소개 <span className="text-gray-400 font-normal text-xs">(선택)</span>
          </label>
          <textarea
            value={teamIntro}
            onChange={e => setTeamIntro(e.target.value)}
            placeholder="팀원 구성, 역할 분담, 팀의 강점 등을 소개해 주세요."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">GitHub URL <span className="text-red-400">*</span></label>
          <input
            value={githubUrl}
            onChange={e => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            type="url"
            className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            시연 영상 URL <span className="text-gray-400 font-normal text-xs">(선택)</span>
          </label>
          <input
            value={demoUrl}
            onChange={e => setDemoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            type="url"
            className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">한줄 소개 <span className="text-red-400">*</span></label>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setAiSummary(null) }}
            placeholder="어떤 문제를 어떻게 해결했는지 간단히 소개해 주세요."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 resize-none"
          />
        </div>

        {/* ── 상세 정보 (선택) ── */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">상세 정보 <span className="font-normal normal-case">— 선택 입력 (상세 페이지에 표시)</span></p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">기술 스택</label>
              <input
                value={techStackInput}
                onChange={e => { setTechStackInput(e.target.value); setAiSummary(null) }}
                placeholder="예) Next.js, TypeScript, Tailwind CSS"
                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
              />
              <p className="text-xs text-gray-400 mt-1">쉼표(,)로 구분해서 입력하세요</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">문제 정의</label>
              <textarea
                value={problemStatement}
                onChange={e => { setProblemStatement(e.target.value); setAiSummary(null) }}
                placeholder="어떤 문제를 발견했고, 왜 해결하려 했는지 설명해 주세요."
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">주요 기능</label>
              <textarea
                value={featuresInput}
                onChange={e => { setFeaturesInput(e.target.value); setAiSummary(null) }}
                placeholder={"핵심 기능을 한 줄씩 입력해 주세요.\n예) 실시간 코드 분석\n예) 자동 리팩토링 제안"}
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">줄바꿈으로 구분해서 입력하세요</p>
            </div>
          </div>
        </div>

        {/* ── AI 요약 생성 ── */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">🤖 AI 요약 생성</p>
              <p className="text-xs text-gray-400 mt-0.5">한줄 소개를 기반으로 AI 요약본을 미리 만들어봐요</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={!description.trim() || aiGenerating}
              className="text-sm font-semibold text-brand border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap">
              {aiGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                  생성 중…
                </>
              ) : aiSummary ? '재생성' : '요약 생성'}
            </button>
          </div>
          {aiSummary && (
            <div className="bg-brand-light border border-brand/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-brand mb-1.5">AI 요약 미리보기</p>
              <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand text-white font-semibold text-sm py-3 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              제출 중…
            </>
          ) : '제출하기 →'}
        </button>
      </form>
    </div>
  )
}
