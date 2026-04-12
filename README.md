# STAGE — 오픈 해커톤 플랫폼


<img width="1616" height="1037" alt="Image" src="https://github.com/user-attachments/assets/256e3c04-1b34-493e-a6e6-b4ccabe89047" />


<div align="center">

<h3>해커톤의 끝은 이야기가 되어야 한다</h3>

<p>
  <a href="https://stage-eight-blue.vercel.app"><strong>🔗 라이브 데모</strong></a>
  &nbsp;·&nbsp;
  <a href="https://daker.ai/public/hackathons/monthly-hackathon-emergency-handover-docs">긴급 인수인계 해커톤 출품작</a>
</p>

<p><strong>팀 Greenery</strong> — 취침전 · 윾빈</p>

</div>


## 시연 영상
<div align="center">
  <a href="https://youtu.be/A_iFyDFh9K0">
    <img src="http://img.youtube.com/vi/A_iFyDFh9K0/0.jpg" alt="시연 영상" />
  </a>
</div>

---

## 소개

STAGE는 오픈 해커톤의 참가 신청부터 결과물 제출, 쇼케이스 관람까지 한 곳에서 처리할 수 있는 플랫폼입니다.
로그인 없이 닉네임만으로 참여할 수 있으며, 종료된 해커톤의 수상작과 전체 출품작을 자유롭게 둘러볼 수 있습니다.

## 주요 기능

- **해커톤 목록 · 상세** — 진행 중 / 예정 / 종료 상태 필터, 평가 방식 · 일정 · 상금 정보
- **결과물 제출 폼** — 닉네임 기반 무로그인 제출, AI 요약 자동 생성
- **Recap 페이지** — 수상팀 하이라이트 카드, 점수 분포 차트, 전체 출품작 쇼케이스
- **전체 쇼케이스** — 해커톤별 top3 하이라이트, 출품작 상세 페이지
- **랭킹 · 리더보드** — 해커톤별 전체 순위표
- **팀 캠프** — 팀원 모집 현황

## 기술 스택

| 항목 | 값 |
|------|-----|
| 프레임워크 | Next.js 14 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS v4 |
| 데이터 | 정적 JSON + localStorage |
| 배포 | Vercel |

## 시작하기

```bash
npm install
npm run dev   # http://localhost:3000
```

```bash
npm run build  # 프로덕션 빌드
npm run lint   # 린트 검사
```

## 프로젝트 구조

```
stage/
├── data/            # 해커톤 · 리더보드 · 팀 JSON 데이터
├── src/
│   ├── app/         # Next.js App Router 페이지
│   │   ├── hackathons/[slug]/       # 해커톤 상세 · Recap
│   │   ├── showcase/                # 전체 쇼케이스
│   │   ├── submit/[slug]/           # 결과물 제출 폼
│   │   ├── rankings/                # 랭킹
│   │   └── camp/                    # 팀 캠프
│   ├── components/  # 공통 컴포넌트
│   └── lib/         # 데이터 접근 · 인증 · localStorage 헬퍼
└── public/
```

## 설계 원칙

- **마찰 없는 관람** — 쇼케이스 · Recap은 로그인 없이 누구나 접근 가능
- **백엔드 없음** — Next.js SSG + JSON + localStorage만 사용
- **AI 요약은 결정론적** — 제출 시 1회 생성 후 고정, 모든 조회에서 동일한 텍스트 노출
