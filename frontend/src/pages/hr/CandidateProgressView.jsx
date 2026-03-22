import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'

function AnimatedBar({ pct, color = 'var(--brass)', delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 100 + delay); return () => clearTimeout(t) }, [pct, delay])
  return (
    <div style={{ height: 6, background: 'rgba(58,53,52,0.5)', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 100, transition: 'width 1s ease' }} />
    </div>
  )
}

function AnimatedCounter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = value; const dur = 1200
    const step = (end / dur) * 16
    const t = setInterval(() => {
      start = Math.min(start + step, end)
      setDisplay(parseFloat(start.toFixed(1)))
      if (start >= end) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  return <>{display}{suffix}</>
}

function StatusBadge({ status }) {
  const cfg = {
    not_started: { label: 'Not Started', color: 'rgba(207,157,123,0.5)',  bg: 'rgba(207,157,123,0.07)' },
    in_progress:  { label: 'In Progress', color: 'var(--brass)',            bg: 'rgba(207,157,123,0.1)'  },
    on_track:     { label: 'On Track',    color: '#7A9E7E',                 bg: 'rgba(122,158,126,0.1)'  },
    behind:       { label: 'Behind',      color: '#C07060',                 bg: 'rgba(192,112,96,0.1)'   },
    complete:     { label: 'Complete',    color: '#EDE0D0',                 bg: 'rgba(237,224,208,0.08)' },
  }[status] || { label: status, color: 'rgba(207,157,123,0.5)', bg: 'transparent' }
  return (
    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
      color: cfg.color, background: cfg.bg, padding: '4px 10px', borderRadius: 12,
      textTransform: 'uppercase', letterSpacing: '0.5px', border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  )
}

export default function CandidateProgressView() {
  const { role_id, candidate_id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    // Load from localStorage (stored when HR clicks View)
    const stored = localStorage.getItem('gaplytics_hr_viewing_candidate')
    const storedRole = localStorage.getItem('gaplytics_hr_viewing_role')
    if (stored) setCandidate(JSON.parse(stored))
    if (storedRole) setRole(JSON.parse(storedRole))
  }, [])

  if (!candidate) return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, color: 'rgba(207,157,123,0.4)', fontFamily: 'Plus Jakarta Sans' }}>
          Candidate data not found. Go back and click View again.
        </div>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ marginTop: 20, fontSize: 13 }}>
          ← Back
        </button>
      </div>
    </div>
  )

  const score         = candidate.match_pct || 0
  const progress      = candidate.progress_pct || 0
  const daysToReady   = candidate.predicted_days_to_competency || 0
  const topGaps       = candidate.top_gaps || []
  const scoreColor    = score >= 90 ? '#EDE0D0' : score >= 70 ? '#CF9D7B' : score >= 60 ? '#724B39' : '#9E4A3A'
  const hoursInvested = parseFloat(((progress / 100) * (role?.daily_hours || 2) * daysToReady).toFixed(1))
  const hoursLeft     = parseFloat((((100 - progress) / 100) * (role?.daily_hours || 2) * daysToReady).toFixed(1))
  const isLagging     = candidate.status === 'behind'

  // Build skill gap bars from top_gaps (we have names only from summary)
  const gapItems = topGaps.map((g, i) => ({
    name: g,
    gapPct: Math.max(20, 85 - i * 15), // estimated — actual data not in summary
  }))

  const stats = [
    {
      label: 'Match Score',
      value: <><AnimatedCounter value={score} suffix="%" /></>,
      sub: score >= 90 ? 'Elite — Interview Ready' : score >= 70 ? 'Strong Candidate' : score >= 60 ? 'Developing' : 'Needs Work',
      color: scoreColor,
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.8 6.2L14 7L11 9.8L11.8 14L8 11.8L4.2 14L5 9.8L2 7L6.2 6.2L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
    },
    {
      label: 'Roadmap Progress',
      value: <><AnimatedCounter value={progress} suffix="%" /></>,
      sub: `${progress < 30 ? 'Just started' : progress < 60 ? 'In progress' : progress < 90 ? 'Well underway' : 'Almost done'}`,
      color: progress >= 60 ? '#7A9E7E' : 'var(--brass)',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3.5L6 2L10 4L14 2V12.5L10 14L6 12L2 13.5V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
    },
    {
      label: 'Hours Invested',
      value: <><AnimatedCounter value={hoursInvested} suffix="h" /></>,
      sub: `${hoursLeft}h remaining to competency`,
      color: 'var(--brass)',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5V8.5L10.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    },
    {
      label: 'Days to Ready',
      value: <><AnimatedCounter value={daysToReady} suffix="d" /></>,
      sub: isLagging ? 'Behind schedule — needs attention' : 'On track for deadline',
      color: isLagging ? '#C07060' : '#7A9E7E',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5 2V4M11 2V4M2 7H14" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'rgba(207,157,123,0.5)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22,
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--brass)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(207,157,123,0.5)'}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H4M6 4L3 7L6 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Pipeline
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="autumn-card" style={{ padding: '24px 28px', marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(207,157,123,0.45)',
                letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>
                Candidate Investment & Progress
              </div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 30,
                color: '#EDE0D0', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
                {candidate.name}
              </h1>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusBadge status={candidate.status} />
                {role && (
                  <span style={{ fontSize: 12, color: 'rgba(207,157,123,0.45)', fontFamily: 'JetBrains Mono' }}>
                    {role.role_title}
                  </span>
                )}
              </div>
            </div>
            {/* Score ring */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(58,53,52,0.5)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                    strokeDasharray={`${(score / 100) * 213.6} 213.6`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s ease' }}/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600,
                    fontSize: 20, color: scoreColor, lineHeight: 1 }}>{score}%</span>
                  <span style={{ fontSize: 8, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono',
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.45)', fontFamily: 'JetBrains Mono' }}>
                Roadmap Completion
              </span>
              <span style={{ fontSize: 11, color: 'var(--brass)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                {progress}%
              </span>
            </div>
            <AnimatedBar pct={progress} color={progress >= 60
              ? 'linear-gradient(90deg,#4a7c59,#7A9E7E)'
              : 'linear-gradient(90deg,var(--coffee),var(--brass))'} />
          </div>

          {/* Lag warning */}
          {isLagging && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(192,112,96,0.08)',
              border: '1px solid rgba(192,112,96,0.2)', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 12H1L7 1Z" stroke="#C07060" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M7 5V8M7 10.5V10.5" stroke="#C07060" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 12, color: 'rgba(192,112,96,0.9)' }}>
                This candidate is <strong>behind schedule</strong> — may need a nudge or deadline extension.
              </span>
            </div>
          )}
        </motion.div>

        {/* 4 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
          {stats.map((st, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ padding: '16px 18px', borderRadius: 12,
                background: 'rgba(22,33,39,0.85)', border: '1px solid rgba(58,53,52,0.5)',
                display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: st.color }}>
                {st.icon}
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', letterSpacing: '0.8px',
                  textTransform: 'uppercase', color: 'rgba(207,157,123,0.4)' }}>
                  {st.label}
                </span>
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600,
                fontSize: 28, color: st.color, lineHeight: 1 }}>
                {st.value}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'DM Sans' }}>
                {st.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Skill gaps */}
        {gapItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="autumn-card" style={{ padding: '20px 24px', marginBottom: 22 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 500,
              color: 'var(--brass)', marginBottom: 16, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Top Skill Gaps to Close
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {gapItems.map((g, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#EDE0D0', fontFamily: 'Plus Jakarta Sans', fontWeight: 500 }}>
                      {g.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono' }}>
                      Gap
                    </span>
                  </div>
                  <AnimatedBar
                    pct={g.gapPct}
                    color={i === 0 ? 'linear-gradient(90deg,#9E4A3A,#C07060)' : 'linear-gradient(90deg,var(--coffee),var(--brass))'}
                    delay={i * 80}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timeline estimate */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="autumn-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 500,
            color: 'var(--brass)', marginBottom: 16, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Readiness Timeline
          </div>
          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', top: 18, left: 18, right: 18, height: 1,
              background: 'rgba(58,53,52,0.5)' }} />
            {[
              { label: 'Analysis', done: true,  icon: '✓' },
              { label: 'Learning',  done: progress > 0, icon: progress > 0 ? '→' : '○' },
              { label: '50% Done',  done: progress >= 50, icon: progress >= 50 ? '✓' : '○' },
              { label: 'Interview Ready', done: score >= 90, icon: score >= 90 ? '✓' : '○' },
            ].map((step, i, arr) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%',
                  background: step.done ? 'rgba(122,158,126,0.2)' : 'rgba(22,33,39,0.9)',
                  border: `1.5px solid ${step.done ? '#7A9E7E' : 'rgba(58,53,52,0.6)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: step.done ? '#7A9E7E' : 'rgba(207,157,123,0.3)',
                  fontFamily: 'JetBrains Mono' }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: 10, color: step.done ? 'rgba(207,157,123,0.7)' : 'rgba(207,157,123,0.35)',
                  fontFamily: 'Plus Jakarta Sans', textAlign: 'center', lineHeight: 1.3 }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, fontSize: 12, color: 'rgba(207,157,123,0.4)', fontFamily: 'DM Sans', lineHeight: 1.6 }}>
            Estimated competency in <strong style={{ color: 'var(--brass)' }}>{daysToReady} days</strong>.
            {hoursInvested > 0 && ` ${candidate.name.split(' ')[0]} has already invested ${hoursInvested}h toward this role.`}
          </div>
        </motion.div>

      </div>
    </div>
  )
}