import { useState, useEffect } from 'react'
import { feedbackAPI, candidateAPI } from '../services/api'
import { StatusBadge, Modal, Loader, EmptyState, RatingBar } from '../components/UI'
import toast from 'react-hot-toast'
import { Plus, MessageSquare } from 'lucide-react'

const DECISIONS = ['Selected', 'Rejected', 'Hold']

const RatingSlider = ({ label, value, onChange, color = 'ink' }) => {
  const colors = {
    ink: 'accent-ink-500',
    emerald: 'accent-emerald-500',
    amber: 'accent-amber-500'
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="label mb-0">{label}</label>
        <span className={`text-sm font-bold font-mono ${
          value >= 8 ? 'text-emerald-600' : value >= 5 ? 'text-ink-600' : 'text-rose-500'
        }`}>{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-full cursor-pointer ${colors[color]}`} />
      <div className="flex justify-between text-xs text-slate-300 mt-0.5">
        <span>1</span><span>5</span><span>10</span>
      </div>
    </div>
  )
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    candidateId: '',
    technicalRating: 5,
    communicationRating: 5,
    overallRating: 5,
    remarks: '',
    finalDecision: 'Hold'
  })

  const load = async () => {
    try {
      const [fb, cv] = await Promise.all([feedbackAPI.getAll(), candidateAPI.getAll()])
      setFeedbacks(fb.data)
      setCandidates(cv.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.candidateId || !form.remarks) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      await feedbackAPI.create({ ...form, candidateId: Number(form.candidateId) })
      toast.success('Feedback submitted!')
      setModal(false)
      setForm({ candidateId: '', technicalRating: 5, communicationRating: 5, overallRating: 5, remarks: '', finalDecision: 'Hold' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Feedback</h1>
          <p className="text-slate-400 text-sm mt-0.5">{feedbacks.length} feedback submissions</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          Submit Feedback
        </button>
      </div>

      {/* Feedback cards */}
      {!feedbacks.length ? (
        <div className="card">
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="No feedback yet"
            description="Submit feedback after completing an interview."
            action={<button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Submit Feedback</button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {feedbacks.map(fb => (
            <div key={fb.feedbackId} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{fb.candidateName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{fb.appliedRole}</p>
                </div>
                <StatusBadge status={fb.finalDecision} />
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Technical</p>
                  <RatingBar value={fb.technicalRating} color="ink" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Communication</p>
                  <RatingBar value={fb.communicationRating} color="emerald" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Overall</p>
                  <RatingBar value={fb.overallRating} color="amber" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 italic leading-relaxed">"{fb.remarks}"</p>
              </div>

              <div className="mt-3 text-xs text-slate-300 font-mono">
                {new Date(fb.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Submit Interview Feedback">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Candidate *</label>
            <select className="input" value={form.candidateId}
              onChange={e => setForm({ ...form, candidateId: e.target.value })}>
              <option value="">Select candidate...</option>
              {candidates.map(c => (
                <option key={c.candidateId} value={c.candidateId}>{c.fullName} – {c.appliedRole}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-5">
            <RatingSlider label="Technical Rating" value={form.technicalRating} color="ink"
              onChange={v => setForm({ ...form, technicalRating: v })} />
            <RatingSlider label="Communication Rating" value={form.communicationRating} color="emerald"
              onChange={v => setForm({ ...form, communicationRating: v })} />
            <RatingSlider label="Overall Rating" value={form.overallRating} color="amber"
              onChange={v => setForm({ ...form, overallRating: v })} />
          </div>

          <div>
            <label className="label">Remarks *</label>
            <textarea className="input resize-none" rows={3} placeholder="Share your observations about the candidate..."
              value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
          </div>

          <div>
            <label className="label">Final Decision</label>
            <div className="grid grid-cols-3 gap-2">
              {DECISIONS.map(d => (
                <button key={d} type="button"
                  onClick={() => setForm({ ...form, finalDecision: d })}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.finalDecision === d
                      ? d === 'Selected' ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : d === 'Rejected' ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
