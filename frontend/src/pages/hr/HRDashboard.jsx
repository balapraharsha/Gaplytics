import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="#CF9D7B" strokeWidth="1.2" fill="rgba(114,75,57,0.15)"/>
      <path d="M9 5V13M5 9H13" stroke="#CF9D7B" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="7" width="16" height="11" rx="3" stroke="#CF9D7B" strokeWidth="1.3"/>
      <path d="M7 7V5.5C7 4.7 7.7 4 8.5 4H11.5C12.3 4 13 4.7 13 5.5V7" stroke="#CF9D7B" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2 12H18" stroke="#CF9D7B" strokeWidth="1" strokeOpacity="0.4"/>
      <path d="M8.5 12V13M11.5 12V13" stroke="#CF9D7B" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="7" r="3.5" stroke="#CF9D7B" strokeWidth="1.3"/>
      <path d="M2 17C2 13.7 4.7 11 8 11C11.3 11 14 13.7 14 17" stroke="#CF9D7B" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M13 4.5C14.4 5.1 15.5 6.5 15.5 8C15.5 9.5 14.4 10.9 13 11.5" stroke="#CF9D7B" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      <path d="M16 12C17.2 12.8 18 14.3 18 16" stroke="#CF9D7B" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2.5" stroke="rgba(207,157,123,0.5)" strokeWidth="1.2"/>
      <path d="M5 2V4M11 2V4" stroke="rgba(207,157,123,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M2 7H14" stroke="rgba(207,157,123,0.3)" strokeWidth="1"/>
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 14L7 9L10 12L14 7L18 9" stroke="#7A9E7E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7H18V10" stroke="#7A9E7E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="4" width="9" height="9" rx="2" stroke="rgba(207,157,123,0.5)" strokeWidth="1.2"/>
      <path d="M4 4V3C4 2.4 4.4 2 5 2H11C11.6 2 12 2.4 12 3V9C12 9.6 11.6 10 11 10H10" stroke="rgba(207,157,123,0.5)" strokeWidth="1.2"/>
    </svg>
  )
}

function CreateRoleForm({ onCreated }) {
  const [roleTitle, setRoleTitle] = useState('')
  const [jdText, setJdText] = useState('')
  const [jdFile, setJdFile] = useState(null)
  const [deadline, setDeadline] = useState('')
  const [dailyHours, setDailyHours] = useState('2.0')
  const [loading, setLoading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] }, maxSize: 5 * 1024 * 1024, multiple: false,
    onDrop: (accepted, rejected) => {
      if (rejected.length) { toast.error('PDF only, max 5MB'); return }
      setJdFile(accepted[0]); toast.success(`Loaded: ${accepted[0].name}`)
    },
  })

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  async function handleSubmit() {
    if (!roleTitle.trim()) { toast.error('Role title is required'); return }
    if (!jdText.trim() && !jdFile) { toast.error('Job description is required'); return }
    if (!deadline) { toast.error('Company deadline is required'); return }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('role_title', roleTitle)
      form.append('company_deadline', deadline)
      form.append('daily_hours', dailyHours)
      if (jdFile) form.append('jd_file', jdFile)
      else form.append('jd_text', jdText)
      const res = await axios.post(`${API}/api/hr/create-role`, form)
      const data = res.data
      const existing = JSON.parse(localStorage.getItem('gaplytics_hr_roles') || '[]')
      existing.push({ role_id: data.role_id, role_title: data.role_title, deadline, created_at: new Date().toISOString() })
      localStorage.setItem('gaplytics_hr_roles', JSON.stringify(existing))
      toast.success('Role created successfully')
      onCreated(data.role_id)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create role')
    } finally { setLoading(false) }
  }

  return (
    <div className="autumn-card" style={{ padding: 28 }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 22, color: '#EDE0D0', margin: '0 0 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <PlusIcon /> Create New Role
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role Title</label>
          <input className="autumn-input" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer" />
        </div>

        <div>
          <label style={{ fontSize: 11, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Job Description {jdFile ? <span style={{ color: '#7A9E7E', textTransform: 'none' }}> — {jdFile.name}</span> : ''}
          </label>
          {!jdFile && (
            <>
              <div {...getRootProps()} className={`drop-zone ${isDragActive ? 'active' : ''}`} style={{ marginBottom: 10, padding: 20 }}>
                <input {...getInputProps()} />
                <div style={{ color: 'rgba(207,157,123,0.45)', fontSize: 13 }}>Drop JD PDF here, or click to upload</div>
              </div>
              <div style={{ textAlign: 'center', color: 'rgba(207,157,123,0.3)', fontSize: 11, margin: '10px 0', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}>— OR PASTE BELOW —</div>
              <textarea className="autumn-input" value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste your full job description here…" rows={5} style={{ resize: 'vertical' }} />
            </>
          )}
          {jdFile && (
            <button onClick={() => setJdFile(null)} style={{ background: 'none', border: 'none', color: 'rgba(207,157,123,0.5)', cursor: 'pointer', fontSize: 12 }}>Remove file</button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Training Deadline</label>
            <input type="date" className="autumn-input" value={deadline} min={minDateStr} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Hours Budget</label>
            <input type="number" className="autumn-input" value={dailyHours} min="0.5" max="12" step="0.5" onChange={e => setDailyHours(e.target.value)} />
          </div>
        </div>

        <button className="btn-hr" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4, fontSize: 14 }}>
          {loading ? <span className="warm-pulse">Creating Role…</span> : 'Create Role'}
        </button>
      </div>
    </div>
  )
}

// Demo roles seeded automatically on first HR dashboard visit
const DEMO_ROLES_SEEDED_KEY = 'gaplytics_demo_seeded'

const DEMO_ROLES_LOCAL = [
  { role_id: 'demo-role-001', role_title: 'Senior Backend Engineer', deadline: '', created_at: new Date().toISOString() },
  { role_id: 'demo-role-002', role_title: 'ML Engineer',             deadline: '', created_at: new Date().toISOString() },
]

export default function HRDashboard() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    async function loadRoles() {
      // Always fetch live from backend
      try {
        const res = await axios.get(`${API}/api/hr/roles`)
        const apiRoles = res.data.roles || []

        // If no roles on backend yet, seed demo data automatically
        if (apiRoles.length === 0 && !localStorage.getItem(DEMO_ROLES_SEEDED_KEY)) {
          setSeeding(true)
          await seedDemoRoles()
          setSeeding(false)
          // Fetch again after seeding
          const res2 = await axios.get(`${API}/api/hr/roles`)
          const seeded = res2.data.roles || []
          setRoles(seeded)
          // Update localStorage so cards link correctly
          localStorage.setItem('gaplytics_hr_roles', JSON.stringify(
            seeded.map(r => ({ role_id: r.role_id, role_title: r.role_title, deadline: r.company_deadline, created_at: r.created_at }))
          ))
          localStorage.setItem(DEMO_ROLES_SEEDED_KEY, '1')
        } else {
          setRoles(apiRoles)
          localStorage.setItem('gaplytics_hr_roles', JSON.stringify(
            apiRoles.map(r => ({ role_id: r.role_id, role_title: r.role_title, deadline: r.company_deadline, created_at: r.created_at }))
          ))
        }
      } catch {
        // Fallback to localStorage if backend unreachable
        const stored = JSON.parse(localStorage.getItem('gaplytics_hr_roles') || '[]')
        setRoles(stored)
      }
    }
    loadRoles()
  }, [])

  async function seedDemoRoles() {
    const today = new Date()
    const deadline1 = new Date(today); deadline1.setDate(today.getDate() + 60)
    const deadline2 = new Date(today); deadline2.setDate(today.getDate() + 45)

    const demoRoles = [
      {
        role_title: 'Senior Backend Engineer',
        company_deadline: deadline1.toISOString().split('T')[0],
        daily_hours: 2.0,
        jd_text: `We are looking for a Senior Backend Engineer with strong Python skills.
Required: Python (5+ years), FastAPI, Docker, PostgreSQL, System Design.
Nice to have: Kubernetes, Redis, AWS.
You will design and build scalable REST APIs, containerize services with Docker,
and collaborate with frontend and DevOps teams to ship production-grade features.`,
      },
      {
        role_title: 'ML Engineer',
        company_deadline: deadline2.toISOString().split('T')[0],
        daily_hours: 3.0,
        jd_text: `We are hiring a Machine Learning Engineer to build and deploy ML models at scale.
Required: Python, Machine Learning, Pandas/NumPy, Data Pipelines, Model Evaluation.
Nice to have: Deep Learning, NLP, AWS SageMaker, MLflow.
You will build end-to-end ML pipelines, train and evaluate models,
and integrate AI capabilities into our product.`,
      },
    ]

    for (const role of demoRoles) {
      try {
        const form = new FormData()
        form.append('role_title', role.role_title)
        form.append('company_deadline', role.company_deadline)
        form.append('daily_hours', String(role.daily_hours))
        form.append('jd_text', role.jd_text)
        await axios.post(`${API}/api/hr/create-role`, form)
      } catch (e) {
        console.warn('Demo role seed failed:', e)
      }
    }
  }

  function handleCreated(roleId) {
    const updated = JSON.parse(localStorage.getItem('gaplytics_hr_roles') || '[]')
    setRoles(updated)
    setShowForm(false)
    navigate(`/hr/role/${roleId}`)
  }

  const totalCandidates = roles.reduce((sum, r) => sum + (r.candidates?.length || 0), 0)
  const avgMatch = roles.length > 0
    ? Math.round(roles.reduce((sum, r) => sum + (r.team_avg_match || 74), 0) / roles.length)
    : 74

  const stats = [
    { icon: <BriefcaseIcon />, label: 'Active Roles',       value: roles.length },
    { icon: <UsersIcon />,     label: 'Candidates Tracked', value: totalCandidates },
    { icon: <TrendIcon />,     label: 'Avg Readiness',      value: `${avgMatch}%` },
  ]

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 38, margin: '0 0 6px', color: '#EDE0D0', letterSpacing: '-0.5px' }}>
              HR <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'rgba(207,157,123,0.5)', margin: 0, fontSize: 14 }}>Manage roles, track candidates, and optimize onboarding.</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '12px 22px' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            New Role
          </button>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="autumn-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(114,75,57,0.15)', border: '1px solid rgba(207,157,123,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 28, color: '#EDE0D0', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', marginTop: 3 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 28 }}>
            <CreateRoleForm onCreated={handleCreated} />
          </motion.div>
        )}

        {/* Roles list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {roles.length === 0 && !showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="autumn-card"
              style={{ padding: '60px 40px', textAlign: 'center' }}>
              {seeding ? (
                <>
                  <div className="warm-pulse" style={{ fontSize: 32, marginBottom: 16 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                      <circle cx="20" cy="20" r="16" stroke="rgba(207,157,123,0.2)" strokeWidth="3"/>
                      <path d="M20 4 A16 16 0 0 1 36 20" stroke="#CF9D7B" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#EDE0D0', margin: '0 0 8px' }}>
                    Setting up demo roles…
                  </h3>
                  <p style={{ color: 'rgba(207,157,123,0.4)', fontSize: 13 }}>
                    Creating Senior Backend Engineer and ML Engineer roles with AI skill extraction
                  </p>
                </>
              ) : (
                <>
                  <BriefcaseIcon />
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#EDE0D0', margin: '16px 0 8px' }}>
                    No roles created yet
                  </h3>
                  <p style={{ color: 'rgba(207,157,123,0.4)', fontSize: 14, margin: '0 0 20px' }}>Start by posting your first role.</p>
                  <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: 13 }}>
                    Create First Role
                  </button>
                </>
              )}
            </motion.div>
          )}

          {roles.map((role, i) => (
            <motion.div key={role.role_id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="autumn-card"
              style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, cursor: 'pointer' }}
              onClick={() => navigate(`/hr/role/${role.role_id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(114,75,57,0.2)', border: '1px solid rgba(207,157,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BriefcaseIcon />
                </div>
                <div>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#EDE0D0' }}>{role.role_title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.45)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarIcon />
                    Deadline: {role.deadline}
                    <span style={{ opacity: 0.3 }}>·</span>
                    ID: {role.role_id.slice(0, 8)}…
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    const url = `${window.location.origin}/candidate?role_id=${role.role_id}`
                    navigator.clipboard.writeText(url)
                    toast.success('Candidate link copied')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(22,33,39,0.8)', border: '1px solid rgba(207,157,123,0.18)',
                    color: 'rgba(207,157,123,0.55)', borderRadius: 8, padding: '7px 12px',
                    cursor: 'pointer', fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif',
                    transition: 'all 0.2s',
                  }}
                >
                  <CopyIcon /> Copy Link
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(207,157,123,0.5)', fontSize: 13 }}>
                  View <ArrowRightIcon />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}