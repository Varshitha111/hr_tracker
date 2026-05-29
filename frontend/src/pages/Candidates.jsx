import { useState, useEffect } from 'react'
import { candidateAPI } from '../services/api'
import { StatusBadge, Modal, Loader, EmptyState, ConfirmDialog } from '../components/UI'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Users, Search, Upload, X } from 'lucide-react'

const STATUSES = ['Scheduled', 'Completed', 'Selected', 'Rejected']
const initialForm = { fullName: '', email: '', phoneNumber: '', skills: '', experience: '', appliedRole: '', status: 'Scheduled' }

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal] = useState({ open: false, mode: 'add', candidate: null })
  const [form, setForm] = useState(initialForm)
  const [resume, setResume] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })

  const load = () => {
    candidateAPI.getAll()
      .then(r => setCandidates(r.data))
      .catch(() => toast.error('Failed to load candidates'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm(initialForm)
    setResume(null)
    setModal({ open: true, mode: 'add', candidate: null })
  }

  const openEdit = (c) => {
    setForm({
      fullName: c.fullName,
      email: c.email,
      phoneNumber: c.phoneNumber,
      skills: c.skills,
      experience: String(c.experience),
      appliedRole: c.appliedRole,
      status: c.status,
    })
    setResume(null)
    setModal({ open: true, mode: 'edit', candidate: c })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.appliedRole) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (resume) fd.append('resume', resume)

      if (modal.mode === 'add') {
        await candidateAPI.create(fd)
        toast.success('Candidate added successfully')
      } else {
        await candidateAPI.update(modal.candidate.candidateId, fd)
        toast.success('Candidate updated successfully')
      }
      setModal({ open: false, mode: 'add', candidate: null })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await candidateAPI.delete(deleteConfirm.id)
      toast.success('Candidate deleted')
      setDeleteConfirm({ open: false, id: null })
      load()
    } catch {
      toast.error('Failed to delete candidate')
    }
  }

  const filtered = candidates.filter(c => {
    const matchSearch = !search || [c.fullName, c.email, c.appliedRole, c.skills]
      .some(f => f.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <Loader />

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Candidates</h1>
          <p className="text-slate-400 text-sm mt-0.5">{candidates.length} total candidates</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search by name, email, role, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                statusFilter === s ? 'bg-ink-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {!filtered.length ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No candidates found"
            description="Try adjusting your search or add a new candidate."
            action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Candidate</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['Candidate', 'Role', 'Skills', 'Exp.', 'Status', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.candidateId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell">
                      <div>
                        <div className="font-semibold text-slate-800">{c.fullName}</div>
                        <div className="text-xs text-slate-400">{c.email}</div>
                        <div className="text-xs text-slate-400">{c.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="table-cell text-slate-600">{c.appliedRole}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {c.skills.split(',').slice(0, 3).map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-ink-50 text-ink-600 text-xs rounded-md font-medium">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell font-mono text-sm">{c.experience}y</td>
                    <td className="table-cell"><StatusBadge status={c.status} /></td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-ink-600 hover:bg-ink-50 rounded-lg transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ open: true, id: c.candidateId })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'add', candidate: null })}
        title={modal.mode === 'add' ? 'Add Candidate' : 'Edit Candidate'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" placeholder="John Doe" value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="john@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="9876543210" value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Applied Role *</label>
              <input className="input" placeholder="Full Stack Developer" value={form.appliedRole}
                onChange={e => setForm({ ...form, appliedRole: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Skills</label>
              <input className="input" placeholder="React, Node.js, MongoDB" value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input type="number" className="input" min="0" max="50" value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Resume</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-ink-300 transition-colors">
                {resume ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-slate-600">{resume.name}</span>
                    <button type="button" onClick={() => setResume(null)} className="text-slate-400 hover:text-rose-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs text-slate-400">Click to upload PDF/DOC</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={e => setResume(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary"
              onClick={() => setModal({ open: false, mode: 'add', candidate: null })}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {modal.mode === 'add' ? 'Add Candidate' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate? This action cannot be undone."
      />
    </div>
  )
}
