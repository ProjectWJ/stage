// 실제 Claude API 호출 없음 — 더미 seed 데이터 사용
// 프론트 키 노출 및 토큰 비용 문제로 인한 결정 (.claude/CONTEXT.md 참고)

const DUMMY_SUMMARIES: Record<string, string[]> = {
  '404found': [
    '기능 명세서만 보고 인수인계 웹서비스를 구현·배포한 팀. 빠른 MVP 완성 후 UX 확장에 집중했으며 참가자·심사위원 모두에게 고르게 높은 평가를 받았다.',
    '명세서 기반으로 핵심 기능을 빠르게 완성하고, 사용자 경험 확장을 통해 완성도를 높인 팀.',
  ],
  'LGTM': [
    '기획-구현-문서화 파이프라인을 체계적으로 완성한 팀. 일관성과 완성도 면에서 두드러진 결과물을 제출했다.',
    '설계부터 배포까지 일관된 흐름을 유지하며 문서화까지 깔끔하게 마무리한 팀.',
  ],
  'Team Alpha': [
    '추론 최적화와 모델 경량화 실험에 집중한 팀. 제한된 환경에서 성능과 추론 속도를 동시에 끌어올리는 전략으로 최고 점수를 기록했다.',
    '성능·속도 균형 최적화에 집중하여 리더보드 1위를 달성한 경량화 전문 팀.',
  ],
  'Team Gamma': [
    '안정적인 경량화 접근법으로 높은 FinalScore를 달성한 팀. 재현 가능한 실험 설계와 꼼꼼한 제출 관리가 돋보였다.',
    '철저한 실험 관리와 안정적인 최적화 전략으로 상위권에 안착한 팀.',
  ],
  default: [
    '해커톤 과제를 성실히 수행한 팀. 주어진 명세를 기반으로 기능을 구현하고 완성도 높은 결과물을 제출했다.',
    '기획부터 구현까지 일관된 방향성을 유지하며 완성도 있는 결과물을 선보인 팀.',
  ],
}

// attempt: 재생성 횟수 (0 = 첫 생성, 1 = 재생성 1회)
export async function generateAISummary(
  teamName: string,
  attempt: number = 0
): Promise<string> {
  // 로딩 플로우 시연을 위한 딜레이
  await new Promise(r => setTimeout(r, 1200))

  const summaries = DUMMY_SUMMARIES[teamName] ?? DUMMY_SUMMARIES['default']
  return summaries[attempt % summaries.length]
}
