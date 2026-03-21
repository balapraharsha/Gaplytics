import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function AnimatedCounter({ value, decimals = 1 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = parseFloat(value); const dur = 1200
    const step = (end / dur) * 16
    const t = setInterval(() => {
      start = Math.min(start + step, end)
      setDisplay(parseFloat(start.toFixed(decimals)))
      if (start >= end) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  return <>{display}</>
}

function CandidateCard({ candidate, side }) {
  const isA = side === 'a'
  const accentColor = isA ? 'var(--brass)' : 'var(--coffee)'
  const borderColor = isA ? 'rgba(207,157,123,0.25)' : 'rgba(114,75,57,0.35)'

  return (
    <div className="autumn-card" style={{ padding: 26, flex: 1, borderColor }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(207,157,123,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
          Candidate {side.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 24, color: '#EDE0D0', marginBottom: 10 }}>
          {candidate.name}
        </div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 60, color: accentColor, lineHeight: 1, letterSpacing: '-2px', textShadow: `0 0 30px ${accentColor}30` }}>
          <AnimatedCounter value={candidate.match_pct} decimals={0} />
          <span style={{ fontSize: 24, color: 'rgba(207,157,123,0.3)', fontWeight: 300 }}>%</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 4 }}>Match Score</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Top Gaps</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {candidate.top_gaps.map(g => <span key={g} className="chip-gap">{g}</span>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Ready In</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 24, color: accentColor }}>~{candidate.predicted_days_to_competency} days</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Status</div>
          <div style={{ fontSize: 13, color: 'var(--brass)', textTransform: 'capitalize', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{candidate.status.replace('_', ' ')}</div>
        </div>
      </div>

      <button className="btn-hr" style={{ width: '100%', marginTop: 22, fontSize: 13 }}>
        Select for Onboarding
      </button>
    </div>
  )
}

export default function CompareView() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!state?.candidate_id_a || !state?.candidate_id_b) { navigate(-1); return }
    fetchComparison()
  }, [])

  async function fetchComparison() {
    try {
      const res = await axios.post(`${API}/api/hr/compare`, {
        candidate_id_a: state.candidate_id_a,
        candidate_id_b: state.candidate_id_b,
        role_id: state.role_id,
      })
      setResult(res.data)
    } catch { toast.error('Failed to load comparison') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div className="warm-pulse" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 22, color: '#EDE0D0' }}>Generating AI comparison…</div>
        <div style={{ color: 'rgba(207,157,123,0.45)', fontSize: 13, marginTop: 10, fontFamily: 'JetBrains Mono, monospace' }}>Analyzing candidates with Gemini AI</div>
      </div>
    </div>
  )

  if (!result) return null

  const thSt = { padding: '11px 16px', textAlign: 'left', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: 'rgba(207,157,123,0.4)', letterSpacing: '0.8px', textTransform: 'uppercase' }
  const tdSt = { padding: '12px 16px', fontSize: 13, color: 'rgba(207,157,123,0.6)' }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '36px 20px' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'rgba(207,157,123,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--brass)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(207,157,123,0.5)'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H4M6 4L3 7L6 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Pipeline
        </button>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 34, color: '#EDE0D0', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
          Candidate <span className="gradient-text">Comparison</span>
        </h1>
        <p style={{ color: 'rgba(207,157,123,0.45)', margin: '0 0 30px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}>
          Side-by-side analysis powered by Gemini AI
        </p>

        {/* Candidates + verdict */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <CandidateCard candidate={result.candidate_a} side="a" />

          {/* Verdict center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', minWidth: 100, gap: 12 }}>
            <div style={{ width: 1, flex: 1, background: 'linear-gradient(to bottom, transparent, rgba(207,157,123,0.2), transparent)' }} />
            <div className="autumn-card" style={{ padding: '16px 14px', textAlign: 'center', width: 120 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
                <path d="M11 14C8.2 14 6 11.8 6 9V4H16V9C16 11.8 13.8 14 11 14Z" stroke="#EDE0D0" strokeWidth="1.3"/>
                <path d="M6 6H4C3.4 6 3 6.4 3 7V8C3 9.7 4.3 11 6 11" stroke="#EDE0D0" strokeWidth="1.3"/>
                <path d="M16 6H18C18.6 6 19 6.4 19 7V8C19 9.7 17.7 11 16 11" stroke="#EDE0D0" strokeWidth="1.3"/>
                <path d="M9 14V17H7M13 14V17H15M7 17H15" stroke="#EDE0D0" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600, color: 'rgba(207,157,123,0.5)', marginBottom: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>AI Verdict</div>
              <p style={{ fontSize: 11, color: 'rgba(207,157,123,0.6)', lineHeight: 1.5, margin: 0 }}>{result.ai_verdict}</p>
            </div>
            <div style={{ width: 1, flex: 1, background: 'linear-gradient(to bottom, transparent, rgba(207,157,123,0.2), transparent)' }} />
          </div>

          <CandidateCard candidate={result.candidate_b} side="b" />
        </div>

        {/* Skill comparison */}
        {result.skill_comparison_table?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="autumn-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(207,157,123,0.1)' }}>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#EDE0D0' }}>Skill Comparison</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(207,157,123,0.08)' }}>
                    <th style={thSt}>Skill</th>
                    <th style={{ ...thSt, color: 'var(--brass)' }}>{result.candidate_a.name}</th>
                    <th style={{ ...thSt, color: 'var(--coffee)' }}>{result.candidate_b.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.skill_comparison_table.map((row, i) => (
                    <tr key={row.skill} style={{ borderBottom: i < result.skill_comparison_table.length - 1 ? '1px solid rgba(207,157,123,0.05)' : 'none' }}>
                      <td style={{ ...tdSt, color: '#EDE0D0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{row.skill}</td>
                      <td style={tdSt}>{row.candidate_a_has ? <span style={{ color: '#7A9E7E', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Has</span> : <span style={{ color: 'var(--brass)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Gap</span>}</td>
                      <td style={tdSt}>{row.candidate_b_has ? <span style={{ color: '#7A9E7E', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Has</span> : <span style={{ color: 'rgba(114,75,57,0.9)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Gap</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
