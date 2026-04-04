interface Props { summary: string }

export function AISummaryBox({ summary }: Props) {
  return (
    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 mt-3">
      <p className="text-xs font-semibold text-indigo-400 mb-1">✨ AI 요약</p>
      <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
    </div>
  )
}
