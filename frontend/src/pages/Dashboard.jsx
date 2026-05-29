import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { StatCard, StatusBadge, Loader } from '../components/UI'
import { Users, CalendarCheck, Clock, CheckCircle, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mb-1">{today}</p>
        <h1 className="font-display font-bold text-2xl text-slate-800">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Here's what's happening with your interviews today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Candidates"
          value={stats?.totalCandidates ?? 0}
          color="ink"
        />
        <StatCard
          icon={<CalendarCheck className="w-5 h-5" />}
          label="Today's Interviews"
          value={stats?.interviewsToday ?? 0}
          color="amber"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Upcoming"
          value={stats?.upcomingInterviews ?? 0}
          color="emerald"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completed"
          value={stats?.completedInterviews ?? 0}
          color="rose"
        />
      </div>

      {/* Today's Schedule */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-slate-800">Today's Schedule</h2>
            <p className="text-xs text-slate-400 mt-0.5">Interviews scheduled for today</p>
          </div>
          <span className="badge bg-ink-50 text-ink-600 font-mono">
            {stats?.todayInterviews?.length ?? 0} interviews
          </span>
        </div>

        {!stats?.todayInterviews?.length ? (
          <div className="py-12 text-center">
            <CalendarCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No interviews scheduled for today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  {['Candidate', 'Role', 'Time', 'Mode', 'Interviewer', 'Status', 'Link'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.todayInterviews.map((iv, i) => (
                  <tr key={iv.interviewId} className="hover:bg-slate-50/50 transition-colors"
                      style={{ animationDelay: `${i * 60}ms` }}>
                    <td className="table-cell font-semibold text-slate-800">{iv.candidateName}</td>
                    <td className="table-cell text-slate-500">{iv.role}</td>
                    <td className="table-cell font-mono text-xs">{iv.interviewTime}</td>
                    <td className="table-cell"><StatusBadge status={iv.interviewMode} /></td>
                    <td className="table-cell">{iv.interviewerName}</td>
                    <td className="table-cell"><StatusBadge status={iv.status} /></td>
                    <td className="table-cell">
                      {iv.meetingLink ? (
                        <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-ink-500 hover:text-ink-700 text-xs font-medium">
                          <ExternalLink className="w-3 h-3" /> Join
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
