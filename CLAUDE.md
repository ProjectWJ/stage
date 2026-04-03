# STAGE — 오픈 해커톤 플랫폼

> 상세 명세 → `.claude/SPEC.md`
> 결정 맥락 → `.claude/CONTEXT.md`
> 기획 원본 → `.claude/PLAN.md`

---

## 프로젝트

**팀**: Greenery (팀장: 취침전, 팀원: 육빈)
**한줄 소개**: 누구나, 로그인 없이, 해커톤 결과를 한눈에 볼 수 있는 플랫폼

---

## 기술 스택

| 항목 | 값 |
|------|-----|
| 프레임워크 | Next.js 14 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS |
| 데이터 | 루트 `data/*.json` (4개 파일) |
| 상태 | localStorage |
| 배포 | Vercel |

---

## 디렉토리 구조

```
stage/
├── CLAUDE.md                           ← 지금 이 파일
├── data/                               ← 인수인계받은 JSON 원본 (절대 수정 금지)
│   ├── hackathons.json
│   ├── hackathon_detail.json
│   ├── leaderboard.json
│   └── teams.json
├── .claude/
│   ├── PLAN.md                         ← 제출된 기획서 원본
│   ├── SPEC.md                         ← 기능 명세서 (구현 지시서)
│   └── CONTEXT.md                      ← 대화 맥락 및 결정 히스토리
└── src/
    ├── app/
    │   ├── page.tsx                    ✅ 홈
    │   ├── hackathons/
    │   │   ├── page.tsx                ✅ 목록 (필터 TODO)
    │   │   └── [slug]/
    │   │       ├── page.tsx            ✅ 상세 (탭 구조 TODO)
    │   │       └── recap/page.tsx      ❌ Recap ★
    │   ├── showcase/page.tsx           ❌ 전체 쇼케이스 ★
    │   ├── submit/[slug]/page.tsx      ❌ 제출 폼 ★
    │   ├── leaderboard/page.tsx        ✅
    │   └── teams/page.tsx              ✅
    ├── components/
    │   ├── Header.tsx                  ✅
    │   ├── HackathonCard.tsx           ✅
    │   ├── StatusBadge.tsx             ✅
    │   ├── ShowcaseCard.tsx            ❌ ★
    │   ├── AISummaryBox.tsx            ❌ ★
    │   └── RecapHero.tsx               ❌ ★
    └── lib/
        ├── index.ts                    ✅ (루트 data/ 경로로 import)
        ├── ai.ts                       ✅ 더미 AI 요약
        └── storage.ts                  ✅ localStorage 헬퍼
```

---

## 데이터 접근 방식

루트 `data/` 디렉토리의 JSON을 직접 import합니다.

```ts
// src/lib/index.ts
import hackathonsRaw from '../../data/hackathons.json'
import hackathonDetailRaw from '../../data/hackathon_detail.json'
import leaderboardRaw from '../../data/leaderboard.json'
import teamsRaw from '../../data/teams.json'
```

`src/lib/data/` 는 존재하지 않습니다. 데이터 관련 작업은 항상 루트 `data/`를 참조하세요.

---

## 핵심 설계 원칙

1. **보는 것에는 마찰 없음** — 쇼케이스·Recap은 로그인 없이 접근 가능
2. **AI 요약은 더미 데이터** — `src/lib/ai.ts`의 seed 데이터 사용. 실제 API 호출 없음
3. **AI 요약은 결정론적** — 제출 시 1회 고정, localStorage 저장. 모든 조회에서 동일한 텍스트
4. **백엔드 없음** — Next.js SSG + JSON + localStorage만 사용

---

## 구현 우선순위

| 등급 | 항목 | 상태 |
|------|------|------|
| P0 | 기본 구현 완성 | 뼈대 있음. `/camp`·`/rankings` 추가, 탭 8개로 확장 필요 |
| P1 | 쇼케이스 + AI 요약 + 제출 폼 | ❌ 미구현 |
| P2 | Recap 페이지 | ❌ 미구현 |
| P3 | 반응형·예외 처리 | ❌ 미구현 |

---

## 상단바 경로 (필수)

제공된 명세 이미지 기준 필수 경로:
```
메인(/) · /hackathons · /camp · /rankings
```
우리 확장 기능으로 추가:
```
/showcase (쇼케이스 갤러리)
```

## 명령어

```bash
npm install
npm run dev    # localhost:3000
npm run build
npm run lint
```

---

## 절대 하지 말 것

- `src/lib/data/` 디렉토리 생성 — 데이터는 루트 `data/`만 사용
- `/teams` 경로 사용 — 팀 모집은 `/camp`로 통일
- 상단바에서 `/rankings` 누락 — 필수 4개 경로 유지
- 실제 Claude API 키를 코드에 하드코딩
- 쇼케이스·Recap에 로그인 요구
- localStorage 없이 동작 불가한 핵심 기능 설계
