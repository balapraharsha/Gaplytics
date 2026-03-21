import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function MatchBadge({ pct }) {
  if (pct >= 90) return <span className="badge-elite" style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>ELITE {pct}%</span>
  if (pct >= 70) return <span className="badge-strong" style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>STRONG {pct}%</span>
  if (pct >= 60) return <span className="badge-developing" style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>DEVELOPING {pct}%</span>
  return <span className="badge-needs-work" style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>NEEDS WORK {pct}%</span>
}

function StatusBadge({ status }) {
  const cfg = {
    not_started: { color: 'rgba(207,157,123,0.5)', bg: 'rgba(207,157,123,0.07)' },
    in_progress: { color: 'var(--brass)', bg: 'rgba(207,157,123,0.1)' },
    on_track: { color: '#7A9E7E', bg: 'rgba(122,158,126,0.1)' },
    behind: { color: '#C07060', bg: 'rgba(192,112,96,0.1)' },
    complete: { color: '#EDE0D0', bg: 'rgba(237,224,208,0.08)' },
  }[status] || { color: 'rgba(207,157,123,0.5)', bg: 'transparent' }
  return (
    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: cfg.color, background: cfg.bg, padding: '3px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default function RoleDetail() {
  const { role_id } = useParams()
  const navigate = useNavigate()
  const [roleData, setRoleData] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [sortBy, setSortBy] = useState('match_pct')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRole() }, [role_id])

  async function fetchRole() {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/hr/role/${role_id}`)
      setRoleData(res.data); setCandidates(res.data.candidates || [])
    } catch { toast.error('Failed to load role details') }
    finally { setLoading(false) }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(`${window.location.origin}/candidate?role_id=${role_id}`)
    toast.success('Candidate link copied')
  }

  function toggleCompare(id) {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) { toast.error('Select exactly 2 candidates'); return prev }
      return [...prev, id]
    })
  }

  function goCompare() {
    if (selectedForCompare.length !== 2) { toast.error('Select exactly 2 candidates'); return }
    navigate('/hr/compare', { state: { role_id, candidate_id_a: selectedForCompare[0], candidate_id_b: selectedForCompare[1] } })
  }

  const sorted = [...candidates].sort((a, b) => {
    let aV = a[sortBy], bV = b[sortBy]
    if (typeof aV === 'string') { aV = aV.toLowerCase(); bV = bV.toLowerCase() }
    return sortDir === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1)
  })

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const today = new Date()
  const deadline = roleData ? new Date(roleData.company_deadline) : null
  const daysLeft = deadline ? Math.ceil((deadline - today) / 86400000) : 0
  const eliteCount = candidates.filter(c => c.match_pct >= 90).length
  const strongCount = candidates.filter(c => c.match_pct >= 70 && c.match_pct < 90).length
  const avgMatch = candidates.length ? (candidates.reduce((s, c) => s + c.match_pct, 0) / candidates.length).toFixed(1) : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', zIndex: 1, position: 'relative' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 20px' }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 12 }} />)}
      </div>
    </div>
  )

  const thStyle = { padding: '11px 16px', textAlign: 'left', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: 'rgba(207,157,123,0.45)', letterSpacing: '0.8px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
  const tdStyle = { padding: '13px 16px', fontSize: 13, color: 'rgba(207,157,123,0.6)', verticalAlign: 'middle' }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 20px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, color: 'rgba(207,157,123,0.45)', marginBottom: 6, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Role Detail
              </div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 32, margin: '0 0 10px', color: '#EDE0D0', letterSpacing: '-0.3px' }}>
                {roleData?.role_title}
              </h1>
              <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.45)', display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'JetBrains Mono, monospace' }}>
                <span>Deadline: {roleData?.company_deadline}</span>
                <span style={{ color: daysLeft < 14 ? 'var(--brass)' : 'rgba(207,157,123,0.45)' }}>{daysLeft} days remaining</span>
                <span>{candidates.length} candidates</span>
              </div>
            </div>
            <button className="btn-hr" onClick={copyShareLink}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V3C4 2.4 4.4 2 5 2H11C11.6 2 12 2.4 12 3V9C12 9.6 11.6 10 11 10H10" stroke="currentColor" strokeWidth="1.2"/></svg>
              Share Link
            </button>
          </div>

          {/* Team readiness */}
          {candidates.length > 0 && (
            <div className="hr-card" style={{ padding: '16px 20px', marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Team Readiness</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 24, color: '#EDE0D0' }}>{avgMatch}%</div>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div className="progress-bar-track" style={{ height: 6 }}>
                  <div className="progress-bar-fill-elite" style={{ width: `${avgMatch}%`, height: 6 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {eliteCount > 0 && <span className="badge-elite" style={{ padding: '4px 10px', borderRadius: 14, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{eliteCount} ELITE</span>}
                {strongCount > 0 && <span className="badge-strong" style={{ padding: '4px 10px', borderRadius: 14, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{strongCount} STRONG</span>}
                {candidates.filter(c => c.status === 'behind').length > 0 && (
                  <span className="badge-needs-work" style={{ padding: '4px 10px', borderRadius: 14, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                    {candidates.filter(c => c.status === 'behind').length} BEHIND
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Compare bar */}
        {selectedForCompare.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="autumn-card"
            style={{ padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(207,157,123,0.6)', fontSize: 13 }}>{selectedForCompare.length}/2 selected for comparison</span>
            <button className="btn-hr" onClick={goCompare} disabled={selectedForCompare.length !== 2}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H5M9 7H12M7 4V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="9" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/></svg>
              Compare
            </button>
          </motion.div>
        )}

        {/* Pipeline table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="autumn-card" style={{ overflow: 'hidden' }}>
          {candidates.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
                <circle cx="16" cy="14" r="7" stroke="rgba(207,157,123,0.3)" strokeWidth="1.5"/>
                <path d="M4 36C4 29.4 9.4 24 16 24" stroke="rgba(207,157,123,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M28 22V34M22 28H34" stroke="rgba(207,157,123,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#EDE0D0', marginBottom: 8 }}>No candidates yet</div>
              <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.45)', marginBottom: 18 }}>Share the candidate link to start receiving applications.</div>
              <button className="btn-hr" onClick={copyShareLink} style={{ fontSize: 13 }}>Copy Share Link</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(207,157,123,0.1)' }}>
                    <th style={thStyle} />
                    {[['name', 'Name'], ['match_pct', 'Match'], ['status', 'Status'], ['progress_pct', 'Progress'], ['predicted_days_to_competency', 'Ready In']].map(([col, label]) => (
                      <th key={col} style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort(col)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {label}
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M4.5 1V8M2 3.5L4.5 1L7 3.5M2 5.5L4.5 8L7 5.5" stroke={sortBy === col ? 'var(--brass)' : 'rgba(207,157,123,0.3)'} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </th>
                    ))}
                    <th style={thStyle}>Top Gaps</th>
                    <th style={thStyle} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c, i) => (
                    <motion.tr key={c.candidate_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '1px solid rgba(207,157,123,0.06)', background: selectedForCompare.includes(c.candidate_id) ? 'rgba(207,157,123,0.04)' : 'transparent' }}>
                      <td style={tdStyle}>
                        <input type="checkbox" checked={selectedForCompare.includes(c.candidate_id)}
                          onChange={() => toggleCompare(c.candidate_id)}
                          style={{ accentColor: 'var(--brass)', width: 13, height: 13 }} />
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, color: '#EDE0D0' }}>{c.name}</td>
                      <td style={tdStyle}><MatchBadge pct={c.match_pct} /></td>
                      <td style={tdStyle}><StatusBadge status={c.status} /></td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar-track" style={{ flex: 1, height: 4 }}>
                            <div className="progress-bar-fill" style={{ width: `${c.progress_pct}%`, height: 4 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.45)', minWidth: 30, fontFamily: 'JetBrains Mono, monospace' }}>{c.progress_pct}%</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--brass)', fontFamily: 'JetBrains Mono, monospace' }}>~{c.predicted_days_to_competency}d</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {c.top_gaps.slice(0, 2).map(g => (
                            <span key={g} className="chip-gap" style={{ fontSize: 10, padding: '2px 7px' }}>{g}</span>
                          ))}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <button className="btn-ghost" style={{ padding: '5px 11px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.5"/></svg>
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
