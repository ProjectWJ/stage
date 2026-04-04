import type { SubmissionData, Submission } from '@/types'

const KEY = (teamCode: string) => `submission:${teamCode}`

export const saveSubmission = (teamCode: string, data: SubmissionData): void => {
  try {
    localStorage.setItem(KEY(teamCode), JSON.stringify(data))
  } catch {}
}

export const getSubmission = (teamCode: string): SubmissionData | null => {
  try {
    const raw = localStorage.getItem(KEY(teamCode))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const getSubmissionsBySlug = (slug: string): SubmissionData[] => {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith('submission:'))
      .map(k => { try { return JSON.parse(localStorage.getItem(k)!) } catch { return null } })
      .filter((d): d is SubmissionData => d?.slug === slug)
  } catch { return [] }
}

export const getAISummary = (teamCode: string): string | null =>
  getSubmission(teamCode)?.aiSummary ?? null

export const isLocalStorageAvailable = (): boolean => {
  try { localStorage.setItem('__test__', '1'); localStorage.removeItem('__test__'); return true }
  catch { return false }
}

// ── 쇼케이스 제출물 (P1) ──
const SUBMISSIONS_KEY = 'stage_submissions'

// hackathonSlug === '' 이면 '기타(개인 프로젝트)' 카테고리
const SEED_SUBMISSIONS: Submission[] = [
  // ── aimers-8-model-lite ──
  {
    id: 'seed-a1',
    hackathonSlug: 'aimers-8-model-lite',
    nickname: '취침전',
    teamName: 'Team Alpha',
    githubUrl: 'https://github.com/example/team-alpha-lite',
    demoUrl: 'https://team-alpha-lite.vercel.app',
    description: 'DistilBERT 기반 경량화 모델로 원본 대비 40% 파라미터 절감, 정확도는 96% 유지.',
    submittedAt: '2026-02-24T21:05:00+09:00',
    aiSummary: '지식 증류(Knowledge Distillation) 기법으로 교사 모델의 소프트 레이블을 활용해 파라미터 수를 40% 줄이면서도 벤치마크 성능의 96%를 유지하는 데 성공했습니다. 추론 속도는 1.8배 향상되어 모바일 엣지 환경 배포 가능성을 높였습니다.',
  },
  {
    id: 'seed-a2',
    hackathonSlug: 'aimers-8-model-lite',
    nickname: 'ml_rookie',
    teamName: 'NeuralCraft',
    githubUrl: 'https://github.com/example/neuralcraft-lite',
    description: '가중치 양자화(INT8)와 레이어 프루닝을 조합해 모델 크기를 3배 압축. 정확도 손실 최소화.',
    submittedAt: '2026-02-25T11:15:00+09:00',
    aiSummary: 'INT8 양자화와 구조적 프루닝을 결합한 2단계 경량화 파이프라인을 구축했습니다. 동적 임계값 프루닝으로 중요 채널을 보존하면서 모델 크기를 67% 줄였고, 엣지 디바이스 테스트에서 배터리 소모량 30% 감소를 확인했습니다.',
  },
  {
    id: 'seed-a3',
    hackathonSlug: 'aimers-8-model-lite',
    nickname: 'vibe_coder',
    teamName: 'ZeroShot',
    githubUrl: 'https://github.com/example/zeroshot-compress',
    demoUrl: 'https://zeroshot-demo.vercel.app',
    description: 'MobileNetV3 아키텍처를 커스터마이즈하여 분류 태스크 특화 경량 모델 설계.',
    submittedAt: '2026-02-23T22:10:00+09:00',
    aiSummary: 'MobileNetV3의 역병목 구조(Inverted Residuals)를 태스크에 맞게 재설계하고 NAS(신경망 구조 탐색)로 최적 레이어 구성을 자동 탐색했습니다. 결과적으로 기존 베이스라인 대비 FLOPs 55% 절감, Top-1 Accuracy 0.7 포인트 하락에 그쳤습니다.',
  },
  {
    id: 'seed-a4',
    hackathonSlug: 'aimers-8-model-lite',
    nickname: 'greenery01',
    teamName: 'BitSlicers',
    githubUrl: 'https://github.com/example/bitslicers',
    description: '혼합 정밀도(Mixed-Precision) 학습과 Teacher-Free KD로 소규모 데이터셋에서도 안정적인 경량화 달성.',
    submittedAt: '2026-02-24T18:33:00+09:00',
    aiSummary: '라벨 없는 데이터에서 Self-Distillation을 적용해 별도 교사 모델 없이 경량화를 달성하는 Teacher-Free KD 방법론을 구현했습니다. 혼합 정밀도 학습(FP16/BF16)과 결합해 GPU 메모리 사용량을 45% 줄이고 학습 속도를 2.2배 향상시켰습니다.',
  },
  // ── daker-handover-2026-03 ──
  {
    id: 'seed-d1',
    hackathonSlug: 'daker-handover-2026-03',
    nickname: '육빈',
    teamName: '404found',
    githubUrl: 'https://github.com/example/404found-handover',
    demoUrl: 'https://404found.vercel.app',
    description: 'AI 기반 인수인계 문서 자동 생성기. 슬랙 대화·코드 커밋 히스토리를 분석해 핵심 맥락을 추출.',
    submittedAt: '2026-04-13T09:58:00+09:00',
    aiSummary: 'Slack 메시지와 Git commit 히스토리를 LLM으로 분석해 인수인계 문서를 자동 생성하는 파이프라인을 구현했습니다. RAG 아키텍처로 사내 문서를 참조해 컨텍스트 정확도를 높였으며, 실제 팀에서 테스트 시 인수인계 작성 시간을 70% 단축했습니다.',
  },
  {
    id: 'seed-d2',
    hackathonSlug: 'daker-handover-2026-03',
    nickname: 'stage_builder',
    teamName: 'LGTM',
    githubUrl: 'https://github.com/example/lgtm-handover',
    demoUrl: 'https://lgtm-hack.vercel.app',
    description: '코드 리뷰 히스토리와 PR 설명을 파싱해 도메인별 온보딩 가이드를 자동으로 구성.',
    submittedAt: '2026-04-13T09:40:00+09:00',
    aiSummary: 'GitHub PR 데이터를 코드 도메인별로 클러스터링하고, 반복 등장하는 리뷰 패턴을 추출해 자동 온보딩 가이드를 생성합니다. 새 팀원이 핵심 컨텍스트를 2시간 내 파악할 수 있는 구조화된 문서를 산출하며, 팀별 커스터마이징도 지원합니다.',
  },
  // ── 기타(개인 프로젝트) — hackathonSlug: '' ──
  {
    id: 'seed-p1',
    hackathonSlug: '',
    nickname: 'rapid_ship',
    teamName: 'OpenRecap',
    githubUrl: 'https://github.com/example/openrecap',
    demoUrl: 'https://openrecap.vercel.app',
    description: '오픈소스 해커톤 결과 아카이빙 도구. 어떤 대회든 결과물을 정형화된 포맷으로 기록.',
    submittedAt: '2026-03-10T14:22:00+09:00',
    aiSummary: '해커톤 결과물을 표준 JSON 스키마로 정의하고, GitHub Actions 기반 자동 아카이빙 파이프라인을 제공합니다. Markdown 렌더링, 팀 프로필, 데모 링크를 포함한 정적 사이트를 자동 생성해 참가 기록을 영구 보존할 수 있습니다.',
  },
  {
    id: 'seed-p2',
    hackathonSlug: '',
    nickname: 'idea_factory',
    teamName: 'DailyLog AI',
    githubUrl: 'https://github.com/example/dailylog-ai',
    description: '일일 작업 로그를 자동 요약하고 주간 회고를 생성해 주는 개인 생산성 도구.',
    submittedAt: '2026-03-18T09:05:00+09:00',
    aiSummary: '터미널 명령 기록, VS Code 활동 로그, 캘린더 이벤트를 수집해 LLM으로 일일 작업 다이제스트를 생성합니다. 주간 패턴 분석으로 생산성 병목을 시각화하며, Notion·Obsidian 연동으로 기존 워크플로에 통합 가능합니다.',
  },
  {
    id: 'seed-p3',
    hackathonSlug: '',
    nickname: 'llm_optimizer',
    teamName: 'PromptForge',
    githubUrl: 'https://github.com/example/promptforge',
    demoUrl: 'https://promptforge.vercel.app',
    description: '프롬프트 버전 관리와 A/B 테스트를 지원하는 LLM 프롬프트 엔지니어링 플랫폼.',
    submittedAt: '2026-03-25T19:45:00+09:00',
    aiSummary: 'Git 방식의 프롬프트 버전 관리 시스템을 구현하고, 동일 입력에 대한 여러 프롬프트 변형을 동시 실행해 품질 지표를 자동 평가합니다. 팀 단위 프롬프트 라이브러리 공유와 성능 회귀 감지 알림 기능을 제공합니다.',
  },
]

export const getAllSubmissions = (): Submission[] => {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY)
    const local: Submission[] = raw ? JSON.parse(raw) : []
    return [...SEED_SUBMISSIONS, ...local]
  } catch { return [...SEED_SUBMISSIONS] }
}

export const addSubmission = (s: Submission): void => {
  try {
    const all = getAllSubmissions()
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([...all, s]))
  } catch {}
}
