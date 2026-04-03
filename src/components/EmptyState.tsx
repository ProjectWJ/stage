interface EmptyStateProps {
  icon?: string
  message: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = '🔍', message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="mb-4 text-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium text-brand border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand-light transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
