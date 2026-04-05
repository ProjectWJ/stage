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
    techStack: ['PyTorch', 'vLLM', 'DistilBERT', 'HuggingFace Transformers', 'Python'],
    problemStatement: 'LLM 서빙 비용과 엣지 디바이스 배포 한계를 동시에 해결해야 했습니다. 원본 모델 대비 파라미터를 40% 이상 줄이면서도 다운스트림 태스크 정확도를 최대한 유지하는 경량화 모델을 목표로 설정했습니다.',
    features: [
      '지식 증류(Knowledge Distillation) 기반 2단계 경량화 파이프라인',
      '교사 모델 소프트 레이블 활용으로 학생 모델 정확도 96% 유지',
      '추론 속도 1.8배 향상 — 모바일·엣지 환경 실배포 가능',
      'vLLM 서빙 스크립트 원클릭 배포 지원',
    ],
    teamIntro: '취침전(팀장): 모델 경량화·KD 논문 구현 전담. 딥러닝 엣지 배포 실무 2년 경력. NeurIPS 워크샵 발표 경험 보유.',
    judgeComment: '경량화 기법을 단순 적용에 그치지 않고 태스크 특성에 맞게 조합한 점이 돋보였습니다. 추론 속도와 정확도의 균형을 실측 데이터로 명확히 제시한 완성도 높은 결과물입니다.',
    participantComment: '처음에는 파라미터 절감 목표치를 40%로 잡았는데, 실제로 달성하면서 저희도 놀랐어요. KD 논문을 읽고 직접 구현하는 과정이 가장 보람 있었습니다.',
  },
  {
    id: 'seed-a2',
    hackathonSlug: 'aimers-8-model-lite',
    nickname: 'ml_rookie',
    teamName: 'Team Gamma',
    githubUrl: 'https://github.com/example/team-gamma-lite',
    demoUrl: 'https://team-gamma-lite.vercel.app',
    description: '가중치 양자화(INT8)와 레이어 프루닝을 조합해 모델 크기를 3배 압축. 정확도 손실 최소화.',
    submittedAt: '2026-02-25T09:40:00+09:00',
    aiSummary: 'INT8 양자화와 구조적 프루닝을 결합한 2단계 경량화 파이프라인을 구축했습니다. 동적 임계값 프루닝으로 중요 채널을 보존하면서 모델 크기를 67% 줄였고, 엣지 디바이스 테스트에서 배터리 소모량 30% 감소를 확인했습니다.',
    techStack: ['PyTorch', 'ONNX', 'TensorRT', 'Python', 'Docker'],
    problemStatement: '프루닝과 양자화는 각각 단점이 있어 단독 적용 시 정확도 손실이 큽니다. 두 기법을 순차적으로 결합하는 2단계 파이프라인을 설계하여 각 기법의 한계를 보완하고 최대 압축률을 달성하는 것을 목표로 했습니다.',
    features: [
      '구조적 프루닝 + INT8 양자화 2단계 파이프라인',
      '동적 임계값 프루닝으로 중요 채널 자동 보존',
      '모델 크기 67% 압축, 정확도 손실 최소화',
      'ONNX 변환 및 TensorRT 최적화 자동화 스크립트',
    ],
    teamIntro: 'ml_rookie(팀장): MLOps·모델 최적화 전문. Kaggle Grandmaster 등급. 프루닝·양자화 연구 1년.',
    judgeComment: '두 기법을 순차 결합하는 파이프라인 설계가 체계적이었습니다. 실험 재현성까지 고려한 자동화 스크립트가 실무 적용 가능성을 높였습니다.',
    participantComment: '프루닝과 양자화를 각각 적용했을 때 정확도 손실이 컸는데, 순서를 바꿔가며 실험한 끝에 최적 조합을 찾았어요.',
  },
  {
    id: 'seed-a2b',
    hackathonSlug: 'aimers-8-model-lite',
    nickname: 'neural_arch',
    teamName: 'NeuralCraft',
    githubUrl: 'https://github.com/example/neuralcraft-lite',
    description: '어텐션 헤드 프루닝과 레이어 공유(Layer Sharing)를 결합한 트랜스포머 특화 경량화 기법 적용.',
    submittedAt: '2026-02-25T11:15:00+09:00',
    aiSummary: 'INT8 양자화와 구조적 프루닝을 결합한 2단계 경량화 파이프라인을 구축했습니다. 동적 임계값 프루닝으로 중요 채널을 보존하면서 모델 크기를 67% 줄였고, 엣지 디바이스 테스트에서 배터리 소모량 30% 감소를 확인했습니다.',
    techStack: ['PyTorch', 'HuggingFace Transformers', 'W&B', 'Python'],
    problemStatement: '트랜스포머 모델 특성상 어텐션 헤드 수가 추론 비용의 핵심 병목입니다. 불필요한 헤드를 제거하고 인접 레이어 간 가중치를 공유해 파라미터를 줄이면서도 문맥 이해 능력을 유지하는 방법을 탐구했습니다.',
    features: [
      '어텐션 헤드 중요도 분석 기반 선택적 프루닝',
      '레이어 공유(Parameter Sharing)로 메모리 절감',
      'W&B 기반 실험 자동 트래킹 및 재현 가능한 파이프라인',
      '압축률·정확도 트레이드오프 시각화 대시보드',
    ],
    teamIntro: 'neural_arch(팀장): 트랜스포머 아키텍처 연구 2년. BERT 계열 모델 최적화 논문 3편 공저.',
    judgeComment: '트랜스포머 구조를 깊이 이해한 접근법이었습니다. 어텐션 헤드 중요도 분석 결과를 시각화해 설득력 있게 제시했습니다.',
    participantComment: '레이어 공유를 적용했을 때 처음엔 성능이 떨어졌는데, 공유 범위를 조정하니 오히려 정규화 효과까지 얻었어요.',
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
    techStack: ['PyTorch', 'TorchVision', 'NAS', 'Python', 'FastAPI'],
    problemStatement: '태스크 특화 경량 모델을 처음부터 설계하면 파인튜닝 기반 경량화보다 더 높은 압축률을 달성할 수 있다는 가설을 검증하고자 했습니다. MobileNetV3를 베이스로 NAS로 최적 구조를 탐색하는 접근법을 선택했습니다.',
    features: [
      'NAS(신경망 구조 탐색)로 태스크 최적 레이어 구성 자동 탐색',
      'MobileNetV3 역병목 구조 커스터마이즈',
      'FLOPs 55% 절감, Top-1 Accuracy 0.7 포인트 손실',
      'FastAPI 기반 경량 추론 서버 내장',
    ],
    teamIntro: 'vibe_coder(팀장): 모바일·엣지 AI 개발 3년. MobileNet 계열 아키텍처 실무 경험 다수.',
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
    techStack: ['PyTorch', 'bitsandbytes', 'DeepSpeed', 'Python'],
    problemStatement: '별도 교사 모델 확보 없이도 KD 효과를 얻을 수 있는 방법이 필요했습니다. 또한 라벨 없는 데이터가 많은 현실 환경에서도 적용 가능한 범용 경량화 파이프라인을 목표로 했습니다.',
    features: [
      'Teacher-Free Self-Distillation — 교사 모델 없이 경량화',
      '혼합 정밀도(FP16/BF16) 학습으로 GPU 메모리 45% 절감',
      'DeepSpeed ZeRO 최적화 결합으로 학습 속도 2.2배',
      '라벨 없는 데이터에서도 적용 가능한 범용 파이프라인',
    ],
    teamIntro: 'greenery01(팀장): LLM 파인튜닝·경량화 전문. DeepSpeed·bitsandbytes 오픈소스 기여 경험.',
  },
  // ── monthly-vibe-coding-2026-02 ──
  {
    id: 'seed-v1',
    hackathonSlug: 'monthly-vibe-coding-2026-02',
    nickname: '취침전',
    teamName: 'VibeFlow',
    githubUrl: 'https://github.com/example/vibeflow',
    demoUrl: 'https://vibeflow.vercel.app',
    description: 'AI가 코드 작성 흐름을 실시간으로 분석해 다음 행동을 예측하고, 반복 작업을 자동화해 주는 바이브 코딩 보조 도구.',
    submittedAt: '2026-03-02T14:20:00+09:00',
    aiSummary: 'AST 파싱과 LLM 기반 패턴 인식을 결합해 개발자의 코딩 흐름을 모델링합니다. 반복 편집 패턴을 감지해 자동 리팩토링을 제안하고, 컨텍스트 기반 스니펫을 즉시 삽입해 주는 VSCode 익스텐션 형태로 구현했습니다.',
    techStack: ['TypeScript', 'VSCode Extension API', 'Tree-sitter', 'OpenAI API', 'Node.js'],
    problemStatement: '바이브 코딩 환경에서 개발자는 반복적인 보일러플레이트 작성과 컨텍스트 전환에 많은 시간을 씁니다. 코딩 흐름을 실시간으로 분석해 다음 동작을 예측하고 반복 작업을 자동화함으로써 순수 창작에 집중할 수 있는 환경을 만들고자 했습니다.',
    features: [
      'Tree-sitter AST 실시간 분석으로 코딩 패턴 인식',
      '반복 편집 감지 시 자동 리팩토링 제안',
      '컨텍스트 기반 코드 스니펫 즉시 삽입',
      'VSCode 익스텐션 형태로 바이브 코딩 환경에 직접 통합',
    ],
    teamIntro: '취침전(팀장): VSCode 익스텐션 개발 경험 2년. AST 기반 코드 분석 및 자동화 도구 제작 전문.',
  },
  {
    id: 'seed-v2',
    hackathonSlug: 'monthly-vibe-coding-2026-02',
    nickname: '육빈',
    teamName: 'PromptPilot',
    githubUrl: 'https://github.com/example/promptpilot',
    demoUrl: 'https://promptpilot-demo.vercel.app',
    description: '자연어로 작성한 아이디어를 즉시 실행 가능한 바이브 코딩 워크플로로 변환해 주는 AI 에이전트.',
    submittedAt: '2026-03-01T21:45:00+09:00',
    aiSummary: '사용자가 자연어로 작업 의도를 입력하면 LLM이 세부 단계를 분해하고, 각 단계에 적합한 코드 스니펫과 도구 호출 체인을 자동으로 생성합니다. 멀티 에이전트 협력 구조로 복잡한 워크플로도 단일 프롬프트로 실행할 수 있습니다.',
    techStack: ['Next.js', 'TypeScript', 'LangChain', 'OpenAI API', 'Tailwind CSS'],
    problemStatement: '바이브 코딩 중 아이디어가 떠올라도 실제 코드로 구현하기까지 맥락이 단절되는 문제가 있습니다. 자연어 아이디어를 단계별 워크플로로 즉시 변환하는 에이전트를 통해 아이디어-구현 간격을 0에 가깝게 줄이는 것이 목표였습니다.',
    features: [
      '자연어 입력 → 단계별 워크플로 자동 분해',
      '각 단계에 맞는 코드 스니펫·도구 호출 체인 생성',
      '멀티 에이전트 협력 구조로 복잡한 워크플로 처리',
      '실행 이력 저장 및 재사용 가능한 워크플로 라이브러리',
    ],
    teamIntro: '육빈(팀장): LLM 에이전트·프롬프트 엔지니어링 전문. LangChain 기반 프로덕션 에이전트 배포 경험.',
  },
  {
    id: 'seed-v3',
    hackathonSlug: 'monthly-vibe-coding-2026-02',
    nickname: 'vibe_coder',
    teamName: 'IdealAI',
    githubUrl: 'https://github.com/example/idealai',
    description: 'Figma 디자인을 업로드하면 바이브 코딩 환경에 맞는 Next.js 컴포넌트를 즉시 생성하는 디자인-투-코드 파이프라인.',
    submittedAt: '2026-03-03T09:10:00+09:00',
    aiSummary: 'Figma API로 디자인 토큰과 레이아웃 트리를 추출하고, GPT-4 Vision으로 컴포넌트 의도를 파악해 Tailwind CSS 기반 Next.js 코드를 생성합니다. 반응형 처리와 접근성 속성을 자동 추가하며, Storybook 스토리도 함께 출력합니다.',
    techStack: ['Next.js', 'TypeScript', 'Figma API', 'GPT-4 Vision', 'Tailwind CSS'],
    problemStatement: '바이브 코딩에서 디자인-구현 간격이 여전히 크다는 점에 주목했습니다. Figma 파일만 있으면 즉시 프로덕션 수준의 컴포넌트 코드를 생성해 디자이너와 개발자 간 핸드오프 비용을 제거하는 것이 목표였습니다.',
    features: [
      'Figma API로 디자인 토큰·레이아웃 트리 자동 추출',
      'GPT-4 Vision으로 컴포넌트 의도 파악 및 코드 생성',
      'Tailwind CSS 기반 반응형·접근성 속성 자동 처리',
      'Storybook 스토리 자동 생성 및 컴포넌트 문서화',
    ],
    teamIntro: 'vibe_coder(팀장): 프론트엔드 개발 4년. 디자인 시스템 및 컴포넌트 자동화 경험 다수. Figma API 전문.',
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
    techStack: ['Next.js', 'TypeScript', 'GitHub Actions', 'JSON Schema', 'Tailwind CSS'],
    problemStatement: '해커톤 결과물은 대회가 끝나면 흩어지거나 잊혀집니다. 어떤 대회든 동일한 스키마로 결과를 기록하고 영구 보존할 수 있는 오픈소스 도구가 필요하다고 느꼈습니다.',
    features: [
      '표준 JSON 스키마 기반 해커톤 결과 아카이빙',
      'GitHub Actions 자동 파이프라인으로 무설정 배포',
      '팀 프로필·데모 링크 포함한 정적 사이트 자동 생성',
      'Markdown 렌더링 및 태그 기반 검색 지원',
    ],
    teamIntro: 'rapid_ship(솔로): 풀스택 개발자. 해커톤 10회 이상 참가 경험. 오픈소스 기여 활동 중.',
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
    techStack: ['Python', 'LLM API', 'SQLite', 'Notion API', 'Obsidian'],
    problemStatement: '매일 무엇을 했는지 기록하고 회고하는 습관이 중요하지만, 바쁜 일상에서 직접 작성하기 어렵습니다. 개발자의 디지털 발자국(터미널·에디터·캘린더)을 자동 수집해 회고를 대신 써주는 도구를 만들고자 했습니다.',
    features: [
      '터미널 명령·VSCode 활동·캘린더 이벤트 자동 수집',
      'LLM 기반 일일 작업 다이제스트 자동 생성',
      '주간 패턴 분석으로 생산성 병목 시각화',
      'Notion·Obsidian 연동으로 기존 워크플로 통합',
    ],
    teamIntro: 'idea_factory(솔로): 개인 생산성 도구 개발 취미. Python 자동화 스크립트 수십 개 운영 중.',
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
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'OpenAI API', 'Tailwind CSS'],
    problemStatement: '프롬프트 엔지니어링은 반복 실험이 핵심이지만, 버전 관리·비교·협업 도구가 없어 스프레드시트에 의존하는 경우가 많습니다. 코드 개발 워크플로처럼 프롬프트도 체계적으로 관리할 수 있는 플랫폼이 필요했습니다.',
    features: [
      'Git 방식 프롬프트 버전 관리 (커밋·브랜치·롤백)',
      '동일 입력에 대한 프롬프트 변형 A/B 동시 실행',
      '품질 지표 자동 평가 및 성능 회귀 감지 알림',
      '팀 단위 프롬프트 라이브러리 공유 및 권한 관리',
    ],
    teamIntro: 'llm_optimizer(솔로): LLM 프롬프트 엔지니어링 전문. 대규모 프롬프트 최적화 프로젝트 다수 경험.',
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
    const raw = localStorage.getItem(SUBMISSIONS_KEY)
    const local: Submission[] = raw ? JSON.parse(raw) : []
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([...local, s]))
  } catch {}
}
