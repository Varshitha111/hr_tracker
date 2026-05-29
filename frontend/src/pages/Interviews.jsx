import { useState, useEffect } from 'react'
import { interviewAPI, candidateAPI } from '../services/api'
import { StatusBadge, Modal, Loader, EmptyState } from '../components/UI'
import toast from 'react-hot-toast'
import { Plus, CalendarCheck, Search, Pencil, ExternalLink } from 'lucide-react'

const STATUSES = ['Scheduled', 'InProgress', 'Completed', 'Cancelled']
const MODES = ['Online', 'Offline']
const initialForm = {
  candidateId: '', role: '', interviewDate: '', interviewTime: '',
  interviewMode: 'Online', interviewerName: '', meetingLink: '', status: 'Scheduled'
}

export default function Interviews() {
  const [interviews, setInterviews] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal] = useState({ open: false, mode: 'add', interview: null })
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [iv, cv] = await Promise.all([interviewAPI.getAll(), candidateAPI.getAll()])
      setInterviews(iv.data)
      setCandidates(cv.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm(initialForm)
    setModal({ open: true, mode: 'add', interview: null })
  }

  const openEdit = (iv) => {
    setForm({
      candidateId: String(iv.candidateId),
      role: iv.role,
      interviewDate: iv.interviewDate.split('T')[0],
      interviewTime: iv.interviewTime,
      interviewMode: iv.interviewMode,
      interviewerName: iv.interviewerName,
      meetingLink: iv.meetingLink || '',
      status: iv.status,
    })
    setModal({ open: true, mode: 'edit', interview: iv })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.candidateId || !form.role || !form.interviewDate || !form.interviewTime || !form.interviewerName) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, candidateId: Number(form.candidateId) }
      if (modal.mode === 'add') {
        await interviewAPI.create(payload)
        toast.success('Interview scheduled!')
      } else {
        await interviewAPI.update(modal.interview.interviewId, payload)
        toast.success('Interview updated!')
      }
      setModal({ open: false, mode: 'add', interview: null })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  // Auto-fill role from candidate
  const handleCandidateChange = (id) => {
    const candidate = candidates.find(c => c.candidateId === Number(id))
    setForm({ ...form, candidateId: id, role: candidate?.appliedRole || form.role })
  }

  const filtered = interviews.filter(iv => {
    const matchSearch = !search || [iv.candidateName, iv.role, iv.interviewerName]
      .some(f => f.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'All' || iv.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Interviews</h1>
          <p className="text-slate-400 text-sm mt-0.5">{interviews.length} interviews scheduled</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by candidate, role, interviewer..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s ? 'bg-ink-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {!filtered.length ? (
          <EmptyState
            icon={<CalendarCheck className="w-12 h-12" />}
            title="No interviews found"
            description="Schedule a new interview to get started."
            action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Schedule</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['Candidate', 'Role', 'Date & Time', 'Mode', 'Interviewer', 'Status', 'Link', ''].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(iv => (
                  <tr key={iv.interviewId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-semibold text-slate-800">{iv.candidateName}</td>
                    <td className="table-cell text-slate-500">{iv.role}</td>
                    <td className="table-cell">
                      <div className="font-medium text-slate-700">
                        {new Date(iv.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs font-mono text-slate-400">{iv.interviewTime}</div>
                    </td>
                    <td className="table-cell"><StatusBadge status={iv.interviewMode} /></td>
                    <td className="table-cell text-slate-500">{iv.interviewerName}</td>
                    <td className="table-cell"><StatusBadge status={iv.status} /></td>
                    <td className="table-cell">
                      {iv.meetingLink ? (
                        <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-ink-500 hover:text-ink-700 text-xs font-medium">
                          <ExternalLink className="w-3 h-3" /> Join
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-cell">
                      <button onClick={() => openEdit(iv)}
                        className="p-1.5 text-slate-400 hover:text-ink-600 hover:bg-ink-50 rounded-lg transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'add', interview: null })}
        title={modal.mode === 'add' ? 'Schedule Interview' : 'Edit Interview'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Candidate *</label>
            <select className="input" value={form.candidateId} onChange={e => handleCandidateChange(e.target.value)}>
              <option value="">Select candidate...</option>
              {candidates.map(c => (
                <option key={c.candidateId} value={c.candidateId}>{c.fullName} – {c.appliedRole}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Role *</label>
            <input className="input" placeholder="Full Stack Developer" value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Interview Date *</label>
              <input type="date" className="input" value={form.interviewDate}
                onChange={e => setForm({ ...form, interviewDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Interview Time *</label>
              <input type="time" className="input" value={form.interviewTime}
                onChange={e => setForm({ ...form, interviewTime: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mode</label>
              <select className="input" value={form.interviewMode}
                onChange={e => setForm({ ...form, interviewMode: e.target.value })}>
                {MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Interviewer Name *</label>
            <input className="input" placeholder="Mr. Suresh Kumar" value={form.interviewerName}
              onChange={e => setForm({ ...form, interviewerName: e.target.value })} />
          </div>
          {form.interviewMode === 'Online' && (
            <div>
              <label className="label">Meeting Link</label>
              <input className="input" placeholder="https://meet.google.com/..." value={form.meetingLink}
                onChange={e => setForm({ ...form, meetingLink: e.target.value })} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary"
              onClick={() => setModal({ open: false, mode: 'add', interview: null })}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {modal.mode === 'add' ? 'Schedule' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
