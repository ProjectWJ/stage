export type HackathonStatus = 'ongoing' | 'ended' | 'upcoming'

export interface Hackathon {
  slug: string
  title: string
  status: HackathonStatus
  tags: string[]
  thumbnailUrl: string
  period: { timezone: string; submissionDeadlineAt: string; endAt: string }
  links: { detail?: string; rules: string; faq: string }
}

export interface TeamPolicy { allowSolo: boolean; maxTeamSize: number }
export interface ScoreBreakdownItem { key: string; label: string; weightPercent: number }

export interface EvalSection {
  metricName: string
  description: string
  limits?: { maxRuntimeSec: number; maxSubmissionsPerDay: number }
  scoreSource?: string
  scoreDisplay?: { label: string; breakdown: ScoreBreakdownItem[] }
}

export interface Milestone { name: string; at: string }

export interface HackathonSections {
  overview: { summary: string; teamPolicy: TeamPolicy }
  info: { notice: string[]; links: { rules: string; faq: string } }
  eval: EvalSection
  schedule: { timezone: string; milestones: Milestone[] }
  prize?: { items: { place: string; amountKRW: number }[] }
  submit: {
    allowedArtifactTypes: string[]
    submissionUrl: string
    guide: string[]
    submissionItems?: { key: string; title: string; format: string }[]
  }
  leaderboard: { publicLeaderboardUrl: string; note: string }
  teams: { campEnabled: boolean; listUrl: string }
}

export interface HackathonDetail {
  slug: string
  title: string
  sections: HackathonSections
  extraDetails?: HackathonDetail[]
}

export interface LeaderboardArtifacts {
  webUrl?: string
  pdfUrl?: string
  planTitle?: string
}

export interface LeaderboardEntry {
  rank: number
  teamName: string
  score: number
  submittedAt: string
  scoreBreakdown?: { participant: number; judge: number }
  artifacts?: LeaderboardArtifacts
}

export interface LeaderboardData {
  hackathonSlug: string
  updatedAt: string
  entries: LeaderboardEntry[]
}

export interface LeaderboardRoot extends LeaderboardData {
  extraLeaderboards: LeaderboardData[]
}

export interface Team {
  teamCode: string
  hackathonSlug: string
  name: string
  isOpen: boolean
  memberCount: number
  lookingFor: string[]
  intro: string
  contact: { type: string; url: string }
  createdAt: string
}

// localStorage 저장 구조 (기존)
export interface SubmissionData {
  slug: string
  teamName: string
  aiSummary: string
  regenerateUsed: boolean
  submittedAt: string
  artifacts: { planUrl: string; webUrl: string; pdfUrl: string }
}

// 쇼케이스 제출물 (P1 신규)
export interface Submission {
  id: string
  hackathonSlug: string
  nickname: string
  teamName: string
  githubUrl: string
  demoUrl?: string
  description: string
  submittedAt: string
  aiSummary: string
  // 상세 페이지용 optional 필드
  techStack?: string[]
  problemStatement?: string
  features?: string[]
  teamIntro?: string
  // Recap 수상 코멘트
  judgeComment?: string
  participantComment?: string
}
