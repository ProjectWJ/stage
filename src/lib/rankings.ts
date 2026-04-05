export interface RankingEntry {
  rank: number
  nickname: string
  points: number
  hackathonCount: number
}

export const RANKINGS: RankingEntry[] = [
  { rank: 1, nickname: '취침전', points: 2850, hackathonCount: 3 },
  { rank: 2, nickname: '윾빈', points: 2640, hackathonCount: 3 },
  { rank: 3, nickname: 'vibe_coder', points: 2410, hackathonCount: 2 },
  { rank: 4, nickname: 'ml_rookie', points: 2200, hackathonCount: 2 },
  { rank: 5, nickname: 'greenery01', points: 1980, hackathonCount: 2 },
  { rank: 6, nickname: 'handover_pro', points: 1750, hackathonCount: 1 },
  { rank: 7, nickname: 'llm_optimizer', points: 1620, hackathonCount: 1 },
  { rank: 8, nickname: 'stage_builder', points: 1430, hackathonCount: 1 },
  { rank: 9, nickname: 'rapid_ship', points: 1280, hackathonCount: 1 },
  { rank: 10, nickname: 'idea_factory', points: 1100, hackathonCount: 1 },
]
