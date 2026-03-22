import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Custom icons
function UploadIcon({ color = '#CF9D7B' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 18V8M14 8L10 12M14 8L18 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 20C4.3 19.3 3 17.8 3 16C3 13.8 4.8 12 7 12C7.1 12 7.3 12 7.4 12C7.9 9.7 10 8 12.5 8C12.7 8 12.8 8 13 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
      <path d="M4 22H24" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.3"/>
    </svg>
  )
}

function FileIcon({ color = '#7A9E7E' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M10 2H5C4.4 2 4 2.4 4 3V15C4 15.6 4.4 16 5 16H13C13.6 16 14 15.6 14 15V6L10 2Z" stroke={color} strokeWidth="1.3"/>
      <path d="M10 2V6H14" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7 9H11M7 12H10" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2.5" stroke="#CF9D7B" strokeWidth="1.2"/>
      <path d="M5 2V4M11 2V4" stroke="#CF9D7B" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M2 7H14" stroke="#CF9D7B" strokeWidth="1" opacity="0.4"/>
      <rect x="5" y="9.5" width="2" height="2" rx="0.5" fill="#CF9D7B" opacity="0.7"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="rgba(207,157,123,0.5)" strokeWidth="1.2"/>
      <path d="M7 4V7.5L9 9" stroke="#CF9D7B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" fill="rgba(122,158,126,0.15)" stroke="rgba(122,158,126,0.4)"/>
      <path d="M5 8L7 10L11 6" stroke="#7A9E7E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DropZone({ label, icon, onFile, file, accept = { 'application/pdf': ['.pdf'] } }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept, maxSize: 5 * 1024 * 1024, multiple: false,
    onDrop: (accepted, rejected) => {
      if (rejected.length) { toast.error('PDF only, max 5MB'); return }
      onFile(accepted[0])
      toast.success(`Loaded: ${accepted[0].name}`)
    },
  })
  return (
    <div {...getRootProps()} className={`drop-zone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <FileIcon />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#EDE0D0' }}>{file.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB</div>
          </div>
          <CheckIcon />
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{icon}</div>
          <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.55)' }}>{label}</div>
          <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.3)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}>
            PDF only · Max 5MB
          </div>
        </div>
      )}
    </div>
  )
}

const loadingMessages = [
  'Extracting skills from resume…',
  'Analyzing job requirements…',
  'Computing skill gap…',
  'Building your roadmap…',
]

export default function CandidateUpload() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleId = searchParams.get('role_id')

  const [resumeFile, setResumeFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [jdText, setJdText] = useState('')
  // Default deadline = 90 days from today, daily hours = 2.0 (both optional)
  const defaultDeadline = (() => {
    const d = new Date(); d.setDate(d.getDate() + 90)
    return d.toISOString().split('T')[0]
  })()
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [dailyHours, setDailyHours] = useState('2.0')
  const [loading, setLoading] = useState(false)
  const [roleInfo, setRoleInfo] = useState(null)
  const [companyDeadline, setCompanyDeadline] = useState(null)
  const [loadMsgIdx, setLoadMsgIdx] = useState(0)

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  useEffect(() => {
    if (roleId) {
      axios.get(`${API}/api/hr/role/${roleId}`)
        .then(res => { setRoleInfo(res.data); setCompanyDeadline(res.data.company_deadline) })
        .catch(() => toast.error('Could not load role info'))
    }
  }, [roleId])

  useEffect(() => {
    if (loading) {
      const t = setInterval(() => setLoadMsgIdx(i => (i + 1) % loadingMessages.length), 1600)
      return () => clearInterval(t)
    }
  }, [loading])

  const effectiveDeadline = (() => {
    if (!companyDeadline && !deadline) return null
    if (!companyDeadline) return deadline
    if (!deadline) return companyDeadline
    return deadline < companyDeadline ? deadline : companyDeadline
  })()

  const daysLeft = effectiveDeadline
    ? Math.ceil((new Date(effectiveDeadline) - new Date()) / 86400000)
    : null

  async function handleAnalyze() {
    if (!resumeFile) { toast.error('Please upload your resume'); return }
    if (!roleId && !jdText.trim() && !jdFile) { toast.error('Please provide a job description'); return }
    // deadline has a default of 90 days — always valid
    setLoading(true)
    try {
      const form = new FormData()
      form.append('resume_file', resumeFile)
      form.append('deadline_date', effectiveDeadline)
      form.append('daily_hours', dailyHours)
      if (roleId) form.append('role_id', roleId)
      else if (jdFile) form.append('jd_file', jdFile)
      else form.append('jd_text', jdText)
      const res = await axios.post(`${API}/api/analyze`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      localStorage.setItem('gaplytics_analysis', JSON.stringify(res.data))
      localStorage.setItem('gaplytics_deadline', effectiveDeadline)
      localStorage.setItem('gaplytics_daily_hours', dailyHours)
      navigate('/candidate/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '44px 20px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {roleId && roleInfo && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="autumn-card"
              style={{ padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="rgba(114,75,57,0.2)"/>
                <path d="M16 8L19 13H25L20 17L22 22L16 18L10 22L12 17L7 13H13L16 8Z" fill="rgba(207,157,123,0.3)" stroke="#CF9D7B" strokeWidth="1.2"/>
              </svg>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>Applying for</div>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#EDE0D0', marginTop: 2 }}>{roleInfo.role_title}</div>
              </div>
            </motion.div>
          )}

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 36, margin: '0 0 10px', lineHeight: 1.1 }}>
              <span className="gradient-text">Start Your Journey</span>
            </h1>
            <p style={{ color: 'rgba(207,157,123,0.55)', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Upload your resume and receive a personalized AI-powered roadmap to close your skill gap.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Resume */}
            <div className="autumn-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: '#EDE0D0', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UploadIcon color="#CF9D7B" style={{ width: 16, height: 16 }} />
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 13V4L8 2L13 4V13" stroke="#CF9D7B" strokeWidth="1.3" strokeLinejoin="round" fill="none"/><path d="M6 13V9H10V13" stroke="#CF9D7B" strokeWidth="1.2" fill="none"/></svg>
                &nbsp;Your Resume
              </h3>
              <DropZone
                label="Drop your resume PDF here, or click to upload"
                icon={<UploadIcon color="rgba(207,157,123,0.45)" />}
                onFile={setResumeFile}
                file={resumeFile}
              />
              {resumeFile && (
                <button onClick={() => setResumeFile(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(207,157,123,0.5)', cursor: 'pointer', fontSize: 12, marginTop: 8, padding: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Remove file
                </button>
              )}
            </div>

            {/* JD */}
            {!roleId && (
              <div className="autumn-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 600, fontSize: 14, color: '#EDE0D0', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2H10L13 5V14H3V2Z" stroke="#CF9D7B" strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 2V5H13" stroke="#CF9D7B" strokeWidth="1.2"/><path d="M5 8H11M5 11H9" stroke="#CF9D7B" strokeWidth="1" strokeLinecap="round" opacity="0.5"/></svg>
                  Job Description
                </h3>
                {!jdFile && (
                  <>
                    <DropZone
                      label="Drop JD PDF here, or click to upload"
                      icon={<UploadIcon color="rgba(207,157,123,0.35)" />}
                      onFile={setJdFile}
                      file={null}
                    />
                    <div style={{ textAlign: 'center', color: 'rgba(207,157,123,0.35)', fontSize: 11, margin: '14px 0', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}>
                      — OR PASTE BELOW —
                    </div>
                    <textarea
                      className="autumn-input"
                      value={jdText}
                      onChange={e => setJdText(e.target.value)}
                      placeholder="Paste the full job description here…"
                      rows={6}
                      style={{ resize: 'vertical' }}
                    />
                  </>
                )}
                {jdFile && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileIcon />
                      <span style={{ color: '#7A9E7E', fontSize: 14 }}>{jdFile.name}</span>
                    </div>
                    <button onClick={() => setJdFile(null)} style={{ background: 'none', border: 'none', color: 'rgba(207,157,123,0.5)', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                  </div>
                )}
              </div>
            )}

            {/* Deadline & Study Hours — personalised per context */}
            <div className="autumn-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: '#EDE0D0', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarIcon /> {roleId ? 'Study Hours' : 'Deadline & Study Hours'}
                <span style={{ fontSize: 10, color: 'rgba(207,157,123,0.38)', fontFamily: 'JetBrains Mono, monospace', marginLeft: 4, fontWeight: 400 }}>optional</span>
              </h3>

              {/* When via HR link — only show daily hours, deadline comes from HR */}
              {roleId ? (
                <div>
                  <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(114,75,57,0.1)', borderRadius: 8, fontSize: 12, color: 'rgba(207,157,123,0.6)', border: '1px solid rgba(114,75,57,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="rgba(207,157,123,0.4)" strokeWidth="1.1"/><path d="M6.5 4V6.5L8 8" stroke="#CF9D7B" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    Deadline set by your employer: <strong style={{ color: 'var(--brass)', marginLeft: 4 }}>{companyDeadline || '—'}</strong>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', display: 'block', marginBottom: 7, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ClockIcon /> How many hours can you study per day?
                    </label>
                    <input type="number" className="autumn-input" value={dailyHours} min="0.5" max="12" step="0.5"
                      onChange={e => setDailyHours(e.target.value)}
                      style={{ maxWidth: 200 }} />
                    <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(207,157,123,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
                      This personalizes your daily roadmap — be honest!
                    </div>
                  </div>
                </div>
              ) : (
                /* Standalone mode — show both deadline and hours */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', display: 'block', marginBottom: 7, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}>
                        Job-ready by (default: 90 days)
                      </label>
                      <input type="date" className="autumn-input" value={deadline} min={minDateStr} onChange={e => setDeadline(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', display: 'block', marginBottom: 7, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClockIcon /> Daily hours
                      </label>
                      <input type="number" className="autumn-input" value={dailyHours} min="0.5" max="12" step="0.5" onChange={e => setDailyHours(e.target.value)} />
                    </div>
                  </div>
                  {daysLeft !== null && (
                    <div style={{ marginTop: 14, fontSize: 13, color: 'var(--brass)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(207,157,123,0.4)" strokeWidth="1.2"/><path d="M7 3.5V7.5L9.5 9" stroke="#CF9D7B" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      You have <strong style={{ color: '#EDE0D0' }}>&nbsp;{daysLeft} days&nbsp;</strong> to close your gap.
                    </div>
                  )}
                </>
              )}

              {/* Days left when via role link */}
              {roleId && daysLeft !== null && (
                <div style={{ marginTop: 14, fontSize: 13, color: 'var(--brass)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(207,157,123,0.4)" strokeWidth="1.2"/><path d="M7 3.5V7.5L9.5 9" stroke="#CF9D7B" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  You have <strong style={{ color: '#EDE0D0' }}>&nbsp;{daysLeft} days&nbsp;</strong> to close your gap.
                </div>
              )}
            </div>

            {/* Submit */}
            <button className="btn-primary" onClick={handleAnalyze} disabled={loading}
              style={{ fontSize: 15, padding: '16px 32px', borderRadius: 12, letterSpacing: '0.3px' }}>
              {loading ? (
                <span className="warm-pulse">Analyzing your profile…</span>
              ) : 'Analyze My Path'}
            </button>

            {/* Loading messages */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <motion.div
                  key={loadMsgIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{ fontSize: 13, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}
                >
                  {loadingMessages[loadMsgIdx]}
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}