// Status Badge
export function StatusBadge({ status }) {
  const map = {
    Scheduled: 'bg-ink-50 text-ink-600',
    Completed: 'bg-slate-100 text-slate-600',
    Selected: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-rose-50 text-rose-700',
    InProgress: 'bg-amber-50 text-amber-700',
    Cancelled: 'bg-slate-100 text-slate-500',
    Hold: 'bg-amber-50 text-amber-700',
    Online: 'bg-ink-50 text-ink-600',
    Offline: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`badge ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

// Stat Card
export function StatCard({ icon, label, value, color = 'ink', trend }) {
  const colors = {
    ink: { bg: 'bg-ink-50', text: 'text-ink-500', num: 'text-ink-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', num: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', num: 'text-amber-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-500', num: 'text-rose-600' },
  }
  const c = colors[color] || colors.ink
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-display font-bold ${c.num}`}>{value}</p>
        </div>
        <div className={`${c.bg} ${c.text} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Rating display
export function RatingBar({ value, max = 10, color = 'ink' }) {
  const colors = { ink: 'bg-ink-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' }
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < value ? colors[color] : 'bg-slate-200'}`} />
        ))}
      </div>
      <span className="text-xs font-mono text-slate-500">{value}/{max}</span>
    </div>
  )
}

// Modal
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-display font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-slate-300 mb-4">{icon}</div>
      <h3 className="font-display font-bold text-slate-600 mb-1">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{description}</p>
      {action}
    </div>
  )
}

// Loader
export function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-500 rounded-full animate-spin" />
    </div>
  )
}

// Confirm dialog
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        <h3 className="font-display font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button onClick={onConfirm} className="btn-danger text-sm">Delete</button>
        </div>
      </div>
    </div>
  )
}
