# STAGE 기능 명세서

> **용도**: 바이브 코딩 작업 지시서. 기획서(`기획서_final.docx`)와 1:1 대응하며, 섹션 참조는 `[기획서 §X.X]`로 표기.
> **규칙**: 결정되지 않은 항목은 `※` 표시. 구현 완료 시 `- [x]`로 체크.
> 
> **핵심 설계 원칙**: 보는 것에는 마찰이 없어야 한다.
> 모든 쇼케이스·Recap 페이지는 **로그인 없이** 접근 가능해야 한다.
> 제출·지원 같은 행동에만 최소한의 인증을 요구한다.

---

## 0. 프로젝트 기본 정보

| 항목 | 값 |
|------|-----|
| 프레임워크 | Next.js 14 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS |
| 데이터 소스 | 루트 `data/*.json` (4개 파일) |
| 클라이언트 상태 | `localStorage` |
| AI 요약 | 더미 seed 데이터 (실제 API 호출 없음) |
| 배포 | Vercel |

### 디렉토리 구조

```
src/
├── app/
│   ├── page.tsx                          # 홈
│   ├── hackathons/
│   │   ├── page.tsx                      # 해커톤 목록
│   │   └── [slug]/
│   │       ├── page.tsx                  # 해커톤 상세
│   │       └── recap/
│   │           └── page.tsx              # 대회 결과(Recap) ★
│   ├── showcase/
│   │   └── page.tsx                      # 전체 쇼케이스 갤러리 ★
│   ├── submit/
│   │   └── [slug]/
│   │       └── page.tsx                  # 제출 페이지 ★
│   ├── leaderboard/
│   │   └── page.tsx
│   ├── rankings/
│   │   └── page.tsx                      # 유저별 랭킹 (더미 데이터)
│   └── camp/
│       └── page.tsx                      # 팀 모집 (구: /teams)
├── components/
│   ├── Header.tsx
│   ├── HackathonCard.tsx
│   ├── StatusBadge.tsx
│   ├── ShowcaseCard.tsx                  # ★
│   ├── AISummaryBox.tsx                  # ★
│   └── RecapHero.tsx                     # ★
├── lib/
│   ├── index.ts                          # 데이터 접근 함수
│   ├── ai.ts                             # AI 요약 더미 데이터 반환 ★
│   └── storage.ts                        # localStorage 헬퍼 ★
└── types/
    └── index.ts
```

---

## 1. 데이터 구조 [기획서 §3.2]

### 1.1 핵심 타입 요약

```ts
// 대회 상태
type HackathonStatus = 'ongoing' | 'ended' | 'upcoming'

// 리더보드 엔트리 (투표형은 scoreBreakdown 존재)
interface LeaderboardEntry {
  rank: number
  teamName: string
  score: number
  submittedAt: string
  scoreBreakdown?: { participant: number; judge: number }
  artifacts?: { webUrl?: string; pdfUrl?: string; planTitle?: string }
}

// localStorage 저장 구조
// 이미지 명세 기준: hackathons · teams(camp) · submissions · leaderboards 4가지 저장
interface SubmissionStore {
  [teamCode: string]: {
    slug: string
    teamName: string
    aiSummary: string          // 고정된 AI 요약
    regenerateUsed: boolean    // 재생성 사용 여부 ※1회 한도
    submittedAt: string
    artifacts: {
      planUrl: string
      webUrl: string
      pdfUrl: string
    }
  }
}
// storage.ts seed 초기화 시 JSON 데이터를 localStorage에 복사
// → hackathons, teams, leaderboards는 JSON에서 seed, submissions는 제출 폼에서 저장
```

### 1.2 데이터 접근 함수 (`src/lib/index.ts`)

| 함수 | 반환 | 용도 |
|------|------|------|
| `getHackathons()` | `Hackathon[]` | 전체 대회 목록 |
| `getHackathon(slug)` | `Hackathon \| undefined` | 단일 대회 |
| `getHackathonDetail(slug)` | `HackathonSections \| null` | 대회 상세 섹션 |
| `getLeaderboard(slug)` | `LeaderboardData \| null` | 대회 리더보드 |
| `getAllLeaderboards()` | `LeaderboardData[]` | 전체 리더보드 |
| `getTeams()` | `Team[]` | 전체 팀 (`/camp` 진입점) |
| `getTeamsByHackathon(slug)` | `Team[]` | 대회별 팀 |

### 1.3 localStorage 헬퍼 (`src/lib/storage.ts`)

```ts
// 제출 데이터 저장
saveSubmission(teamCode: string, data: SubmissionStore[string]): void

// 제출 데이터 조회
getSubmission(teamCode: string): SubmissionStore[string] | null

// 특정 대회 전체 제출 조회
getSubmissionsBySlug(slug: string): SubmissionStore[string][]

// AI 요약만 조회 (쇼케이스/Recap에서 사용)
getAISummary(teamCode: string): string | null
```

---

## 2. 페이지별 명세 [기획서 §2]

---

### 2.1 홈 `/`

**역할**: 플랫폼 진입점. 진행중·예정 대회 카드와 통계 표시.

#### 레이아웃
```
Hero 섹션
  - 플랫폼 통계 (전체 대회 수 / 진행중 수 / 참가팀 수 / 총 상금)
섹션: 진행 중인 해커톤
  - HackathonCard 그리드 (status === 'ongoing')
섹션: 예정 해커톤  ← ongoing이 없으면 이 섹션이 최상단
  - HackathonCard 그리드 (status === 'upcoming')
섹션: 최근 종료
  - HackathonCard 그리드 (status === 'ended')
```

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| HackathonCard 클릭 | `router.push('/hackathons/[slug]')` | 해커톤 상세 페이지 이동 |

#### 예외
- 진행중 대회 없음 → "현재 진행 중인 해커톤이 없습니다." 텍스트 표시

---

### 2.2 해커톤 목록 `/hackathons`

**역할**: 전체 대회 카드 + 상태·태그 필터.

#### 레이아웃
```
페이지 헤더 (제목 + 총 개수)
필터 바
  - 상태 칩: 전체 / 진행 중 / 예정 / 종료
  - 태그 칩: hackathons.tags 유니크 값으로 자동 생성 ※
HackathonCard 그리드
```

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| 상태 칩 클릭 | `status` 필터 적용 | 카드 목록 즉시 갱신 |
| 태그 칩 클릭 ※ | `tags` 필터 적용 | 카드 목록 갱신 |
| 필터 초기화 버튼 | 모든 필터 해제 | 전체 카드 표시 |
| HackathonCard 클릭 | 상세 페이지 이동 | |

#### 예외
- 필터 결과 없음 → 빈 상태 UI: 아이콘 + "조건에 맞는 해커톤이 없습니다." + [필터 초기화] 버튼

---

### 2.3 해커톤 상세 `/hackathons/[slug]`

**역할**: 대회 상세 정보 + 5개 탭 구조. [기획서 §2.3]

#### 레이아웃
```
← 목록으로 (뒤로 버튼)
DetailHero
  - 상태 배지 / 팀 정책 / 태그
  - 대회 제목 + summary
  - [제출하기] 버튼 (ongoing일 때만) / [결과 보기] 버튼 (ended일 때만) ★
탭: 개요 | 팀(캠프) | 평가 | 상금 | 안내 | 일정 | 제출 | 리더보드
(★ 쇼케이스 탭은 ended 대회에서만 추가 노출)
탭별 콘텐츠 + 사이드바 (시상 내역 / 1위 미리보기 / 링크)
```

#### 탭별 콘텐츠 상세

**개요 탭**
- `sections.overview.summary`
- 팀 구성 정책 (allowSolo, maxTeamSize)
- 시상 내역 (prize.items)

**일정 탭**
- `sections.schedule.milestones` 타임라인
- 각 마일스톤: `getMilestoneStatus(at)` → `past | current | future`
- past: 회색 점, current: 브랜드 컬러 + 링 강조, future: 빈 원

**평가 탭**
- `sections.eval.metricName` + description
- `scoreDisplay.breakdown` 있으면 비중 바 렌더링
- `limits` 있으면 런타임·제출 한도 카드

**쇼케이스 탭** ★
- `getSubmissionsBySlug(slug)` + leaderboard entries 조합
- ShowcaseCard 그리드 (최대 6개 미리보기)
- [전체 쇼케이스 보기 →] → `/showcase?hackathon=[slug]`
- 제출물 없음 → "아직 제출된 솔루션이 없습니다." 빈 상태

**팀(캠프) 탭**
- `getTeamsByHackathon(slug)` 목록
- 팀명 / 인원수 / 모집 상태 도트
- [이 해커톤 팀 구성] 초대/수락/거절 버튼 ※

**상금 탭**
- `sections.prize.items` 시상 내역

**안내 탭**
- `sections.info.notice` 유의사항
- 규정/FAQ 링크

**제출(Submit) 탭**
- 제출 가이드 (`sections.submit.guide`)
- 제출 폼 인라인 또는 `/submit/[slug]` 이동 버튼

**리더보드(Leaderboard) 탭**
- 해당 대회 리더보드 (`getLeaderboard(slug)`)
- 미제출 팀은 순위 없이 "미제출" 표기

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| 탭 클릭 | 활성 탭 상태 변경 | 콘텐츠 영역 교체 |
| [제출하기] 클릭 | `/submit/[slug]` 이동 | ongoing 대회에서만 노출 |
| [결과 보기] 클릭 | `/hackathons/[slug]/recap` 이동 | ended 대회에서만 노출 ★ |

#### 예외
- 존재하지 않는 slug → `notFound()` → 404 페이지
- detail 데이터 없음 → 기본 정보(hackathons.json)만 표시, 탭 일부 비활성

---

### 2.4 대회 결과 페이지 `/hackathons/[slug]/recap` ★ [기획서 §4.3]

**역할**: 종료된 대회의 결과를 자동 조립해 외부 공유 가능한 공개 페이지로 제공.

#### 레이아웃
```
RecapHero
  - 대회 제목 / 기간 / 참가팀 수 / 최고점 / 총 상금
  - [링크 복사] 버튼

수상팀 하이라이트
  - 1~3위 카드: 팀명 / 점수 / AI 요약 / WEB·PDF 링크

점수 분포 ※
  - scoreBreakdown 있는 경우: 참가자 vs 심사위원 평균 비교 바

진행 일정 타임라인
  - schedule.milestones (모두 past 처리)

[전체 쇼케이스 보기 →] 링크
```

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| [링크 복사] 클릭 | `navigator.clipboard.writeText(url)` | 버튼 텍스트 "복사됨 ✓" 2초 후 원복 |
| 수상팀 WEB 클릭 | 외부 링크 열기 | 새 탭 |
| [전체 쇼케이스 보기] 클릭 | `/showcase?hackathon=[slug]` | 이동 |

#### 예외
- `status !== 'ended'` → "아직 결과가 공개되지 않은 대회입니다." 안내 + [대회 상세 보기] 버튼
- leaderboard 데이터 없음 → 수상팀 섹션 대신 "결과 집계 중입니다." 표시
- AI 요약 없는 팀 → 요약 카드 영역 생략 (팀명·점수만 표시)

---

### 2.5 전체 쇼케이스 갤러리 `/showcase` ★ [기획서 §4.2]

**역할**: 모든 종료 대회 제출물을 통합 갤러리로 표시.

#### 레이아웃
```
페이지 헤더
필터 탭
  - 전체 / [대회명 탭들] (ended 대회만)
ShowcaseCard 그리드
```

#### ShowcaseCard 구성
```
웹 프리뷰 영역 (높이 고정, 회색 bg + "웹 프리뷰" 텍스트 ※)
순위 뱃지 (1위=금, 2위=은, 3위=동)
팀명
AI 요약 박스 (저장된 aiSummary 또는 없으면 영역 생략)
[🌐 WEB] [📄 PDF] 링크 버튼
```

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| 대회 필터 탭 클릭 | URL 쿼리 `?hackathon=[slug]` 갱신 | 해당 대회 카드만 표시 |
| WEB / PDF 링크 클릭 | 외부 링크 열기 | 새 탭 |

#### 예외
- 제출물 없는 대회 탭 → "이 대회에는 아직 제출된 솔루션이 없습니다."
- artifacts 없는 팀 → WEB/PDF 버튼 비활성 + "미제출" 배지

> ※ 실제 iframe 프리뷰는 크로스오리진 이슈로 이번 구현에서 제외. 회색 플레이스홀더 사용.

---

### 2.6 제출 페이지 `/submit/[slug]` ★ [기획서 §4.4]

**역할**: 참가자가 제출 정보를 입력하고 AI 요약을 생성·확정하는 페이지.

#### 레이아웃
```
대회명 헤더
제출 폼
  - Step 1: 팀 코드 입력 ※ (더미 인증용)
  - Step 2: 기획서 URL 또는 텍스트 입력 (text_or_url)
  - Step 3: 웹링크 URL 입력
  - Step 4: PDF URL 입력
  ──────────────────────
  [AI 요약 생성] 버튼 (필수 입력 완료 시 활성)
  AI 요약 미리보기 카드 (생성 후 표시)
  [재생성] 버튼 (1회 한도) ※
  ──────────────────────
  [최종 제출 확정] 버튼 (요약 생성 후 활성)
```

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| 필수 필드 미입력 상태에서 [AI 요약 생성] | 버튼 disabled | 클릭 불가 |
| [AI 요약 생성] 클릭 | `generateSummary()` 호출 | 로딩 스피너 → 요약 카드 표시 |
| [재생성] 클릭 (1회 한도) | 다른 더미 요약 반환 | 새 요약으로 교체, 재생성 버튼 disabled |
| [최종 제출 확정] 클릭 | `saveSubmission()` → localStorage 저장 | 완료 화면: "제출 완료!" + [쇼케이스 확인] 링크 |
| 이미 제출한 팀 코드 입력 | `getSubmission(teamCode)` 체크 | "이미 제출하셨습니다." 안내 + 기존 요약 표시 ※ |

#### 예외
- 필수 입력 누락 → 해당 필드 빨간 테두리 + "필수 입력 항목입니다."
- AI 요약 생성 실패 → "요약 생성에 실패했습니다." + [다시 시도] 버튼
- localStorage 미지원 → 경고 배너 표시 후 나머지 기능은 정상 동작

---

### 2.7 리더보드 `/leaderboard` [기획서 §4.1]

#### 레이아웃
```
페이지 헤더
대회 탭 (getAllLeaderboards() 기반)
업데이트 시각
순위 테이블
  - 기본 컬럼: 순위 / 팀명 / 점수 / 제출 시각
  - scoreBreakdown 있는 경우: 참가자 / 심사위원 컬럼 추가
  - artifacts 있는 경우: 제출물 링크 컬럼 추가
```

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| 대회 탭 클릭 | 활성 탭 변경 | 테이블 데이터 교체 |
| WEB / PDF 링크 클릭 | 외부 링크 | 새 탭 |

#### 예외
- entries 빈 배열 → "등록된 순위가 없습니다."

---

### 2.8-1 랭킹 `/rankings`

**역할**: 해커톤 전체 참여/수위 기록에 대한 유저별 랭킹. 더미 데이터로 구성.

#### 레이아웃
```
페이지 헤더
기간 필터: 최근 7일 / 30일 / 전체
글로벌 랭킹 테이블
  - rank / 닉네임 / points
```

#### 더미 데이터
- JSON에 유저 데이터 없음 → `src/lib/rankings.ts`에 더미 배열로 구성 ※
- 기간 필터는 UI만 동작, 실제 데이터 변화 없음 (더미)

#### 예외
- 데이터 없음 → "아직 랭킹 데이터가 없습니다."

---

### 2.9 팀 모집 `/camp` [기획서 §4.1]

#### 레이아웃
```
페이지 헤더
필터 칩: 전체 / 모집 중 / [대회명들]
팀 카드 그리드
```

#### 입력 → 동작 → 결과
| 입력 | 동작 | 결과 |
|------|------|------|
| "모집 중" 필터 | `isOpen: true` 필터 | 모집 중 팀만 표시 |
| 대회 필터 | `hackathonSlug` 필터 | 해당 대회 팀만 표시 |
| [팀에 지원하기] | `window.open(contact.url)` | 외부 연락 링크 |

#### 예외
- 필터 결과 없음 → "조건에 맞는 팀이 없습니다." + [필터 초기화]

---

## 3. 컴포넌트 명세

### 3.1 공통 컴포넌트

| 컴포넌트 | Props | 역할 |
|----------|-------|------|
| `Header` | — | 네비게이션. 경로: `/ · /hackathons · /camp · /rankings` (필수), `+ /showcase` (확장) |
| `StatusBadge` | `status: HackathonStatus` | 진행중/예정/종료 배지 |
| `HackathonCard` | `hackathon: Hackathon` | 대회 카드 (목록·홈용) |
| `EmptyState` | `message: string`, `action?: {label, onClick}` | 빈 상태 UI 재사용 |

### 3.2 확장 기능 컴포넌트 ★

| 컴포넌트 | Props | 역할 |
|----------|-------|------|
| `ShowcaseCard` | `entry: LeaderboardEntry`, `summary?: string` | 쇼케이스 카드 |
| `AISummaryBox` | `summary: string`, `loading?: boolean` | AI 요약 표시 박스 |
| `RecapHero` | `hackathon: Hackathon`, `stats: RecapStats` | Recap 헤더 섹션 |
| `SubmitForm` | `slug: string` | 제출 폼 전체 (Client Component) |

---

## 4. AI 요약 기능 [기획서 §3.3]

> 실제 Claude API를 호출하지 않습니다.
> 프론트 단 키 노출 및 토큰 비용 문제로 인해 **더미 seed 데이터**를 사용하며,
> 생성 → 미리보기 → 재생성(1회) → 확정·고정의 **플로우만 시연**합니다.

### 4.1 더미 데이터 구조 (`src/lib/ai.ts`)

```ts
// 팀 코드 기반 더미 요약 맵
const DUMMY_SUMMARIES: Record<string, string[]> = {
  '404found': [
    '기능 명세서만 보고 인수인계 웹서비스를 구현·배포한 팀. 빠른 MVP 완성 후 UX 확장에 집중했으며 참가자·심사위원 모두에게 고르게 높은 평가를 받았다.',
    '명세서 기반으로 핵심 기능을 빠르게 완성하고, 사용자 경험 확장을 통해 완성도를 높인 팀.',
  ],
  'LGTM': [
    '기획-구현-문서화 파이프라인을 체계적으로 완성한 팀. 일관성과 완성도 면에서 두드러진 결과물을 제출했다.',
    '설계부터 배포까지 일관된 흐름을 유지하며 문서화까지 깔끔하게 마무리한 팀.',
  ],
}

// 호출 시 해당 팀의 더미 배열에서 순서대로 반환 (재생성 시 다음 인덱스)
export function generateAISummary(teamCode: string, attempt: number): string {
  const summaries = DUMMY_SUMMARIES[teamCode] ?? DUMMY_SUMMARIES['default']
  return summaries[attempt % summaries.length]
}
```

### 4.2 저장 구조

```ts
// 키 형식: "submission:{teamCode}"
// 값: JSON.stringify(SubmissionStore[teamCode])
localStorage.setItem(`submission:${teamCode}`, JSON.stringify(data))
```

---

## 5. 예외 처리 총괄 [기획서 §5]

| 상황 | 처리 방법 |
|------|-----------|
| 존재하지 않는 slug | `notFound()` → 커스텀 404 |
| 진행 중인 대회의 Recap 접근 | "결과 미공개" 안내 화면 |
| 더미 요약 로딩 실패 | 에러 메시지 + [다시 시도] 버튼 |
| artifacts 없는 팀 (쇼케이스) | "미제출" 배지, 링크 버튼 비활성 |
| AI 요약 없는 팀 (쇼케이스/Recap) | 요약 박스 영역 생략 |
| 필수 입력 누락 (제출 폼) | 빨간 테두리 + 인라인 오류 메시지 |
| localStorage 미지원 | 경고 배너, 나머지 기능 정상 동작 |
| 빈 리더보드 / 팀 목록 | EmptyState 컴포넌트 표시 |
| 외부 링크 접속 불가 | 플랫폼 내 처리 없음 (링크만 제공) |

---

## 6. 구현 체크리스트

### P0 — 기본 구현
- [ ] 홈 페이지 (진행중·예정·종료 섹션 + 버튼 3개)
- [ ] 해커톤 목록 `/hackathons` (상태 필터)
- [ ] 해커톤 상세 `/hackathons/[slug]` (8개 탭)
- [ ] 리더보드 `/leaderboard` (탭 전환, scoreBreakdown 표시)
- [ ] 랭킹 `/rankings` (더미 데이터 테이블, 기간 필터 UI)
- [ ] 팀 모집 `/camp` (필터)
- [ ] 빈 상태 UI (EmptyState 컴포넌트)
- [ ] 404 페이지
- [ ] Header 경로 업데이트 (`/teams` → `/camp`, `/rankings` 추가)

### P1 — 쇼케이스 + AI 요약
- [ ] `src/lib/storage.ts` localStorage 헬퍼
- [ ] `src/lib/ai.ts` 더미 AI 요약 함수 구현
- [ ] ShowcaseCard 컴포넌트
- [ ] AISummaryBox 컴포넌트
- [ ] 해커톤 상세 → 쇼케이스 탭
- [ ] `/showcase` 전체 갤러리
- [ ] `/submit/[slug]` 제출 폼

### P2 — Recap 페이지
- [ ] RecapHero 컴포넌트
- [ ] `/hackathons/[slug]/recap` 페이지
- [ ] [결과 보기] 버튼 (ended 대회 상세에 추가)
- [ ] [링크 복사] 기능

### P3 — 완성도
- [ ] 반응형 (모바일 1단 그리드)
- [ ] 태그 필터 (해커톤 목록) ※
- [ ] 점수 분포 차트 (Recap) ※
- [ ] 로딩 스켈레톤 ※

---

## 7. 더미 데이터 보완 항목

> 실제 JSON에 없어서 임의로 채워야 하는 값들.

| 항목 | 현재 상태 | 보완 방법 |
|------|-----------|-----------|
| 쇼케이스 AI 요약 | localStorage에 없으면 없음 | 더미 제출 데이터를 `storage.ts` 초기화 시 seed |
| 웹 프리뷰 이미지 | 없음 | 회색 플레이스홀더 사용 |
| 팀 구성원 정보 | teams.json에 없음 | 이번 구현 범위 외 |
| `monthly-vibe-coding-2026-02` 상세 | `hackathon_detail.json`에 없음 | 기본 정보(hackathons.json)만 표시 |
