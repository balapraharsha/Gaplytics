import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../components/Navbar'
import ReasoningTrace from '../../components/ReasoningTrace'
import InteractiveFeedback from '../../components/InteractiveFeedback'
import ChatCoach from '../../components/ChatCoach'
import ResumeTailor from '../../components/ResumeTailor'

// Custom icons
function TrophyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 14C8.2 14 6 11.8 6 9V4H16V9C16 11.8 13.8 14 11 14Z" stroke="#EDE0D0" strokeWidth="1.4"/>
      <path d="M6 6H4C3.4 6 3 6.4 3 7V8C3 9.7 4.3 11 6 11" stroke="#EDE0D0" strokeWidth="1.4"/>
      <path d="M16 6H18C18.6 6 19 6.4 19 7V8C19 9.7 17.7 11 16 11" stroke="#EDE0D0" strokeWidth="1.4"/>
      <path d="M9 14V17H7M13 14V17H15" stroke="#EDE0D0" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7 17H15" stroke="#EDE0D0" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function MapIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 3.5L6 2L10 4L14 2V12.5L10 14L6 12L2 13.5V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6 2V12M10 4V14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
    </svg>
  )
}

function BrainIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2C6.3 2 5 3.3 5 5V11C5 12.7 6.3 14 8 14C9.7 14 11 12.7 11 11V5C11 3.3 9.7 2 8 2Z" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M5 6H3.5C2.7 6 2 6.7 2 7.5C2 8.3 2.7 9 3.5 9H5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M11 6H12.5C13.3 6 14 6.7 14 7.5C14 8.3 13.3 9 12.5 9H11" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  )
}

function CalendarIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 2V4M11 2V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M2 7H14" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    </svg>
  )
}

function AnimatedScore({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = value; const dur = 1600
    const step = (end / dur) * 16
    const t = setInterval(() => {
      start = Math.min(start + step, end)
      setDisplay(parseFloat(start.toFixed(1)))
      if (start >= end) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value])

  const color = value >= 90 ? '#EDE0D0' : value >= 80 ? '#CF9D7B' : value >= 60 ? '#724B39' : '#9E4A3A'
  const glow = value >= 90 ? '0 0 40px rgba(237,224,208,0.2)' : '0 0 24px rgba(207,157,123,0.15)'

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 68, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color, textShadow: glow, lineHeight: 1, letterSpacing: '-2px' }}>
        {display}<span style={{ fontSize: 28, color: 'rgba(207,157,123,0.4)', fontWeight: 300 }}>%</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.45)', fontFamily: 'JetBrains Mono, monospace', marginTop: 4, letterSpacing: '1px', textTransform: 'uppercase' }}>Overall Match</div>
    </div>
  )
}

function SkillChip({ skill, type }) {
  const cls = type === 'known' ? 'chip-known' : type === 'gap' ? 'chip-gap' : 'chip-required'
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {skill.name || skill.skill_name}
    </span>
  )
}

// ─── SVG Graph View ──────────────────────────────────────────
function RoadmapGraph({ modules }) {
  const [tooltip, setTooltip] = useState(null)
  const [transform, setTransform] = useState({ x: 40, y: 30, scale: 1 })
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // Layout: group by difficulty into columns, then rows within each column
  const COLS = { Beginner: 0, Intermediate: 1, Advanced: 2 }
  const COL_X = [60, 310, 560]
  const NODE_W = 200, NODE_H = 90, ROW_GAP = 110

  const laid = modules.map((m, i) => {
    const col = COLS[m.difficulty] ?? 0
    const row = modules.slice(0, i).filter(x => (COLS[x.difficulty] ?? 0) === col).length
    return { ...m, _x: COL_X[col], _y: 30 + row * ROW_GAP, _col: col }
  })

  const totalH = Math.max(400, ...laid.map(n => n._y + NODE_H + 30))
  const totalW = 800

  const diffColor = d => ({
    Beginner:     { fill: '162127', stroke: '3A3534', text: 'CF9D7B', badge: '2A3840' },
    Intermediate: { fill: '1F1A14', stroke: '724B39', text: 'CF9D7B', badge: '2E2010' },
    Advanced:     { fill: '1C1210', stroke: '9E4A3A', text: 'DDB898', badge: '2E1510' },
  }[d] || { fill: '162127', stroke: '3A3534', text: 'CF9D7B', badge: '2A3840' })

  const onMouseDown = e => {
    dragging.current = true
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }
  }
  const onMouseMove = e => {
    if (!dragging.current) return
    setTransform(t => ({ ...t, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }))
  }
  const onMouseUp = () => { dragging.current = false }
  const zoom = delta => setTransform(t => ({ ...t, scale: Math.min(Math.max(t.scale * delta, 0.3), 2.5) }))

  if (!laid.length) return (
    <div className="autumn-card" style={{ padding: 40, textAlign: 'center', color: 'rgba(207,157,123,0.4)', fontSize: 14 }}>
      No modules to display in graph view.
    </div>
  )

  return (
    <div className="autumn-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(207,157,123,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 14, color: '#EDE0D0' }}>
          Learning Graph — {laid.length} modules
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['Beginner','Intermediate','Advanced'].map((d,i) => {
            const c = diffColor(d)
            return (
              <span key={d} style={{ fontSize: 10, fontFamily: 'JetBrains Mono', padding: '2px 8px', borderRadius: 4,
                background: `#${c.badge}`, border: `1px solid #${c.stroke}`, color: `#${c.text}` }}>
                {d}
              </span>
            )
          })}
          <button onClick={() => setTransform({ x: 40, y: 30, scale: 1 })}
            style={{ background: 'rgba(22,33,39,0.8)', border: '1px solid rgba(58,53,52,0.6)', borderRadius: 6,
              color: 'rgba(207,157,123,0.5)', padding: '3px 10px', cursor: 'pointer', fontSize: 11 }}>
            Reset
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', padding: '8px 0 0', background: 'rgba(12,21,25,0.6)' }}>
        {['Beginner','Intermediate','Advanced'].map((label, i) => (
          <div key={label} style={{ width: 250, textAlign: 'center', fontSize: 9, fontFamily: 'JetBrains Mono',
            color: 'rgba(207,157,123,0.35)', letterSpacing: '1px', textTransform: 'uppercase', paddingBottom: 6,
            borderBottom: '1px solid rgba(58,53,52,0.4)' }}>
            {label}
          </div>
        ))}
      </div>

      <div ref={containerRef} style={{ position: 'relative', height: 460, background: '#0C1519', overflow: 'hidden', cursor: dragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <svg width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(114,75,57,0.6)" />
            </marker>
            {/* Column dividers */}
          </defs>
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {/* Column divider lines */}
            {[260, 510].map(cx => (
              <line key={cx} x1={cx} y1={0} x2={cx} y2={totalH}
                stroke="rgba(58,53,52,0.3)" strokeWidth="1" strokeDasharray="4 4" />
            ))}

            {/* Edges: connect nodes sequentially within same skill chain */}
            {laid.slice(0, -1).map((n, i) => {
              const next = laid[i + 1]
              if (!next) return null
              const x1 = n._x + NODE_W, y1 = n._y + NODE_H / 2
              const x2 = next._x,       y2 = next._y + NODE_H / 2
              // Only draw edge if next col is same or adjacent
              if (Math.abs(next._col - n._col) > 1) return null
              const mx = (x1 + x2) / 2
              return (
                <path key={i}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  fill="none" stroke="rgba(114,75,57,0.4)" strokeWidth="1.2"
                  strokeDasharray="5 3" markerEnd="url(#arrowhead)" />
              )
            })}

            {/* Nodes */}
            {laid.map((m, i) => {
              const c = diffColor(m.difficulty)
              const title = m.title.length > 24 ? m.title.slice(0, 24) + '…' : m.title
              const isHovered = tooltip?.id === m.id
              return (
                <g key={m.id}
                  onMouseEnter={() => setTooltip(m)}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Shadow */}
                  <rect x={m._x + 3} y={m._y + 3} width={NODE_W} height={NODE_H} rx={8}
                    fill="rgba(0,0,0,0.25)" />
                  {/* Card */}
                  <rect x={m._x} y={m._y} width={NODE_W} height={NODE_H} rx={8}
                    fill={`#${c.fill}`} stroke={isHovered ? `#CF9D7B` : `#${c.stroke}`}
                    strokeWidth={isHovered ? 1.5 : 1} />
                  {/* Top accent bar */}
                  <rect x={m._x} y={m._y} width={NODE_W} height={3} rx={0}
                    fill={`#${c.stroke}`} />
                  {/* MOD badge */}
                  <rect x={m._x + 10} y={m._y + 10} width={44} height={16} rx={3}
                    fill={`#${c.badge}`} />
                  <text x={m._x + 32} y={m._y + 21} textAnchor="middle"
                    fill={`#${c.text}`} fontSize="8" fontFamily="JetBrains Mono" opacity="0.8">
                    MOD {i + 1}
                  </text>
                  {/* Title */}
                  <text x={m._x + 10} y={m._y + 42}
                    fill={`#${c.text}`} fontSize="11.5" fontFamily="Plus Jakarta Sans" fontWeight="600">
                    {title}
                  </text>
                  {/* Meta row */}
                  <text x={m._x + 10} y={m._y + 62}
                    fill="rgba(160,136,120,0.65)" fontSize="9.5" fontFamily="DM Sans">
                    {m.duration_hours}h
                  </text>
                  <text x={m._x + 38} y={m._y + 62}
                    fill="rgba(160,136,120,0.4)" fontSize="9.5" fontFamily="DM Sans">
                    · {m.difficulty}
                  </text>
                  {/* Completion circle */}
                  <circle cx={m._x + NODE_W - 14} cy={m._y + NODE_H - 14} r={8}
                    fill="rgba(22,33,39,0.8)" stroke={`#${c.stroke}`} strokeWidth="1" />
                  <text x={m._x + NODE_W - 14} y={m._y + NODE_H - 10}
                    textAnchor="middle" fill={`#${c.text}`} fontSize="9" fontFamily="JetBrains Mono">
                    {i + 1}
                  </text>
                </g>
              )
            })}

            {/* Tooltip */}
            {tooltip && (() => {
              const c = diffColor(tooltip.difficulty)
              const tx = tooltip._x + NODE_W + 8
              const ty = tooltip._y
              return (
                <g>
                  <rect x={tx} y={ty} width={220} height={72} rx={8}
                    fill="rgba(22,33,39,0.98)" stroke="rgba(207,157,123,0.35)" strokeWidth="1" />
                  <text x={tx + 12} y={ty + 20} fill="#EDE0D0" fontSize="12"
                    fontFamily="Plus Jakarta Sans" fontWeight="600">{tooltip.title}</text>
                  <text x={tx + 12} y={ty + 36} fill="rgba(207,157,123,0.6)" fontSize="10"
                    fontFamily="DM Sans">{tooltip.duration_hours}h · {tooltip.difficulty}</text>
                  <text x={tx + 12} y={ty + 52} fill="rgba(160,136,120,0.6)" fontSize="9"
                    fontFamily="DM Sans">{(tooltip.description || '').slice(0, 48)}…</text>
                  <text x={tx + 12} y={ty + 66} fill="rgba(122,158,126,0.7)" fontSize="9"
                    fontFamily="JetBrains Mono">{tooltip.skill_name}</text>
                </g>
              )
            })()}
          </g>
        </svg>

        {/* Zoom buttons */}
        <div style={{ position: 'absolute', bottom: 12, right: 14, display: 'flex', gap: 5 }}>
          {[['+', 1.15],['-', 0.87],['⤢', 1]].map(([btn, delta]) => (
            <button key={btn}
              onClick={() => btn === '⤢' ? setTransform({x:40,y:30,scale:1}) : zoom(delta)}
              style={{ width: 28, height: 28, background: 'rgba(22,33,39,0.92)', border: '1px solid rgba(58,53,52,0.7)',
                borderRadius: 6, color: 'rgba(207,157,123,0.6)', cursor: 'pointer', fontSize: btn==='⤢'?11:17,
                display:'flex',alignItems:'center',justifyContent:'center' }}>
              {btn}
            </button>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 10,
          color: 'rgba(207,157,123,0.3)', fontFamily: 'JetBrains Mono' }}>
          drag to pan · scroll to zoom
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [tab, setTab] = useState('roadmap')

  useEffect(() => {
    const stored = localStorage.getItem('gaplytics_analysis')
    if (!stored) { navigate('/candidate'); return }
    setAnalysis(JSON.parse(stored))
  }, [])

  if (!analysis) return null

  const { gap_result, pathway } = analysis
  const score = gap_result.overall_match_percentage
  const isElite = score >= 90
  const deadline = localStorage.getItem('gaplytics_deadline') || ''
  const daysLeft = deadline ? Math.ceil((new Date(deadline) - new Date()) / 86400000) : '?'

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        {/* Investment & Progress Summary */}
        {(() => {
          const totalModules   = (analysis.modules_detail || []).length
          const progress       = JSON.parse(localStorage.getItem('gaplytics_progress') || '{}')
          const completedMods  = Object.values(progress).reduce((s, arr) => s + arr.length, 0)
          const completedPct   = totalModules > 0 ? Math.round((completedMods / totalModules) * 100) : 0
          const totalHours     = pathway.total_hours || 0
          const hoursCompleted = totalModules > 0 ? parseFloat(((completedMods / totalModules) * totalHours).toFixed(1)) : 0
          const hoursRemaining = parseFloat((totalHours - hoursCompleted).toFixed(1))
          const totalDays      = pathway.daily_schedule?.total_days || 90
          const daysElapsed    = totalDays - (typeof daysLeft === 'number' ? daysLeft : totalDays)
          const daysLagging    = daysElapsed > 0 && completedPct < Math.round((daysElapsed / totalDays) * 100)
            ? Math.round(((daysElapsed / totalDays) * 100 - completedPct) / 100 * totalDays)
            : 0
          const expectedPct    = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0
          const onTrack        = completedPct >= expectedPct - 5

          const stats = [
            {
              label: 'Modules Done',
              value: `${completedMods}/${totalModules}`,
              sub: `${completedPct}% complete`,
              color: completedPct >= 50 ? '#7A9E7E' : 'var(--brass)',
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: 'Hours Invested',
              value: `${hoursCompleted}h`,
              sub: `${hoursRemaining}h remaining`,
              color: 'var(--brass)',
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 5V8.5L10.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              label: 'Days Left',
              value: typeof daysLeft === 'number' ? `${daysLeft}d` : '—',
              sub: deadline || 'No deadline set',
              color: typeof daysLeft === 'number' && daysLeft < 14 ? '#C07060' : 'rgba(207,157,123,0.7)',
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 2V4M11 2V4M2 7H14" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              label: 'Pace Status',
              value: daysLagging > 0 ? `${daysLagging}d behind` : onTrack ? 'On Track' : 'On Track',
              sub: daysLagging > 0
                ? `Expected ${expectedPct}% done, you're at ${completedPct}%`
                : `${expectedPct}% expected, ${completedPct}% done`,
              color: daysLagging > 0 ? '#C07060' : '#7A9E7E',
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12L6 7L9 9.5L14 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="14" cy="4" r="1.5" fill="currentColor"/>
                </svg>
              ),
            },
          ]

          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="autumn-card"
              style={{ padding: '22px 26px', marginBottom: 24 }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(207,157,123,0.45)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 5 }}>
                    Role Investment Tracker
                  </div>
                  <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 28, margin: 0, color: '#EDE0D0', letterSpacing: '-0.3px' }}>
                    {gap_result.candidate_name || 'Your Progress'}
                  </h1>
                  <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="4" r="2" stroke="rgba(207,157,123,0.5)" strokeWidth="1.1"/><path d="M1 10C1 8.3 3 7 5.5 7C8 7 10 8.3 10 10" stroke="rgba(207,157,123,0.5)" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    {gap_result.target_role}
                  </div>
                </div>
                <AnimatedScore value={score} />
              </div>

              {/* Overall progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono' }}>Overall Completion</span>
                  <span style={{ fontSize: 11, color: 'var(--brass)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{completedPct}%</span>
                </div>
                <div style={{ position: 'relative', height: 8, background: 'rgba(58,53,52,0.5)', borderRadius: 100, overflow: 'hidden' }}>
                  {/* Expected progress marker */}
                  {expectedPct > 0 && (
                    <div style={{ position: 'absolute', left: `${expectedPct}%`, top: 0, width: 2, height: '100%', background: 'rgba(207,157,123,0.3)', zIndex: 2 }} />
                  )}
                  {/* Actual progress */}
                  <div style={{
                    height: '100%', borderRadius: 100,
                    width: `${completedPct}%`,
                    background: completedPct >= expectedPct
                      ? 'linear-gradient(90deg, #4a7c59, #7A9E7E)'
                      : 'linear-gradient(90deg, var(--coffee), var(--brass))',
                    transition: 'width 1.2s ease',
                  }} />
                </div>
                {expectedPct > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(207,157,123,0.35)', fontFamily: 'JetBrains Mono' }}>
                      Expected by now: {expectedPct}%
                    </span>
                  </div>
                )}
              </div>

              {/* 4 stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {stats.map((st, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: 'rgba(12,21,25,0.5)',
                    border: `1px solid rgba(58,53,52,0.6)`,
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: st.color }}>
                      {st.icon}
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(207,157,123,0.45)' }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 26, color: st.color, lineHeight: 1 }}>
                      {st.value}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'DM Sans' }}>
                      {st.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lag warning */}
              {daysLagging > 0 && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(192,112,96,0.08)', border: '1px solid rgba(192,112,96,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="#C07060" strokeWidth="1.2" strokeLinejoin="round"/><path d="M7 5V8M7 10V10" stroke="#C07060" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 12, color: 'rgba(192,112,96,0.9)' }}>
                    You're <strong>{daysLagging} day{daysLagging !== 1 ? 's' : ''} behind schedule</strong>. Complete {Math.ceil(hoursRemaining / Math.max(1, daysLeft))}h/day to catch up.
                  </span>
                </div>
              )}
            </motion.div>
          )
        })()}

        {/* Elite Banner */}
        <AnimatePresence>
          {isElite && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="elite-card elite-shimmer"
              style={{ padding: '22px 28px', marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(207,157,123,0.15)', border: '1px solid rgba(207,157,123,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrophyIcon />
                </div>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 24, letterSpacing: '-0.3px' }} className="gradient-text-elite">
                    ELITE READY
                  </div>
                  <div style={{ color: 'rgba(207,157,123,0.6)', fontSize: 13, marginTop: 3 }}>
                    Top tier match — your score unlocks the full Mock Technical Interview.
                  </div>
                </div>
              </div>
              <button className="btn-elite" onClick={() => navigate('/candidate/interview')} style={{ fontSize: 13 }}>
                Start Mock Interview
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skills Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 22 }}>
          {/* Known */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="autumn-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, color: '#7A9E7E', marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#7A9E7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              You Already Know
              <span style={{ background: 'rgba(122,158,126,0.15)', color: '#7A9E7E', borderRadius: 10, padding: '1px 7px', fontSize: 10 }}>
                {gap_result.known_skills.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {gap_result.known_skills.map(s => (
                <SkillChip key={s.name} skill={s} type="known" />
              ))}
              {gap_result.known_skills.length === 0 && <span style={{ fontSize: 13, color: 'rgba(207,157,123,0.4)' }}>No direct matches found</span>}
            </div>
          </motion.div>

          {/* Gaps */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="autumn-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, color: 'var(--brass)', marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#CF9D7B" strokeWidth="1.2"/><path d="M6 3.5V6.5M6 8.5V8.5" stroke="#CF9D7B" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Skill Gaps
              <span style={{ background: 'rgba(207,157,123,0.12)', color: 'var(--brass)', borderRadius: 10, padding: '1px 7px', fontSize: 10 }}>
                {gap_result.gap_skills.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {gap_result.gap_skills.map(g => (
                <SkillChip key={g.skill_name} skill={g} type="gap" />
              ))}
            </div>
          </motion.div>

          {/* Rejection */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="autumn-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, color: '#9E6A5A', marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Rejection Risks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gap_result.rejection_reasons.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: 'rgba(207,157,123,0.55)', lineHeight: 1.5, padding: '8px 12px', background: 'rgba(158,74,58,0.06)', borderRadius: 8, borderLeft: '2px solid rgba(158,74,58,0.25)' }}>
                  {r}
                </div>
              ))}
              {gap_result.rejection_reasons.length === 0 && (
                <div style={{ fontSize: 12, color: '#7A9E7E', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#7A9E7E" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  No critical rejection risks
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Interactive feedback for non-elite */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 22 }}>
          {!isElite && <InteractiveFeedback gapResult={gap_result} />}
        </motion.div>

        {/* Resume Tailor — shows for scores 60–89 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ResumeTailor gapResult={gap_result} analysisContext={analysis} />
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {[
            { key: 'roadmap', label: 'Daily Roadmap', icon: <CalendarIcon size={13} /> },
            { key: 'graph',   label: 'Graph View',    icon: <MapIcon size={13} /> },
            { key: 'trace',   label: 'AI Reasoning',  icon: <BrainIcon size={13} /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '9px 18px', borderRadius: 9, border: tab === t.key ? 'none' : '1px solid rgba(207,157,123,0.18)',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 500,
                background: tab === t.key ? 'linear-gradient(135deg, var(--coffee), var(--brass))' : 'rgba(22,33,39,0.7)',
                color: tab === t.key ? 'var(--chinese-black)' : 'rgba(207,157,123,0.6)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/candidate/roadmap')}
            style={{
              padding: '9px 18px', borderRadius: 9, border: '1px solid rgba(207,157,123,0.18)',
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 500,
              background: 'transparent', color: 'var(--brass)',
              display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s',
            }}
          >
            <MapIcon size={13} /> Full Roadmap
          </button>
        </div>

        {tab === 'roadmap' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="autumn-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#EDE0D0', marginBottom: 16 }}>
                Day-by-Day Schedule Preview
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pathway.daily_schedule.days.slice(0, 10).map((day, i) => {
                  const isToday = day.is_today
                  const moduleDetail = analysis.modules_detail || []
                  const todayModules = day.module_ids.map(id => moduleDetail.find(m => m.id === id)).filter(Boolean)
                  return (
                    <div key={i} className={isToday ? 'day-card-today' : ''} style={{
                      padding: '11px 16px', borderRadius: 10,
                      background: 'rgba(22,33,39,0.6)',
                      border: `1px solid rgba(207,157,123,${isToday ? '0.4' : '0.1'})`,
                      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    }}>
                      <div style={{ minWidth: 60 }}>
                        {isToday && <span className="pulse-dot" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--brass)', marginRight: 6 }} />}
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, color: isToday ? 'var(--brass)' : 'rgba(207,157,123,0.45)', letterSpacing: '0.5px' }}>
                          {isToday ? 'TODAY' : `DAY ${day.day_number}`}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>{day.date}</span>
                      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {todayModules.map(m => (
                          <span key={m.id} style={{
                            background: 'rgba(114,75,57,0.15)', color: 'var(--brass)', borderRadius: 6,
                            padding: '3px 10px', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', border: '1px solid rgba(207,157,123,0.15)',
                          }}>
                            {m.title}
                          </span>
                        ))}
                        {day.day_type === 'review' && <span style={{ color: 'rgba(207,157,123,0.6)', fontSize: 12 }}>Review Day</span>}
                        {day.day_type === 'rest' && <span style={{ color: 'rgba(207,157,123,0.4)', fontSize: 12 }}>Rest Day</span>}
                        {day.day_type === 'final_review' && <span style={{ color: 'var(--brass-light)', fontSize: 12 }}>Final Review</span>}
                        {day.day_type === 'mock_test' && <span style={{ color: 'var(--brass-light)', fontSize: 12 }}>Mock Test Day</span>}
                      </div>
                      {day.estimated_hours > 0 && (
                        <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>{day.estimated_hours}h</span>
                      )}
                    </div>
                  )
                })}
                {pathway.daily_schedule.days.length > 10 && (
                  <button onClick={() => navigate('/candidate/roadmap')} style={{
                    background: 'none', border: '1px dashed rgba(207,157,123,0.18)', borderRadius: 10,
                    padding: '12px', color: 'var(--brass)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13,
                    transition: 'all 0.2s',
                  }}>
                    +{pathway.daily_schedule.days.length - 10} more days — View Full Roadmap →
                  </button>
                )}
              </div>
              {pathway.daily_schedule.warning && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(114,75,57,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--brass)', border: '1px solid rgba(114,75,57,0.25)' }}>
                  {pathway.daily_schedule.warning}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'graph' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <RoadmapGraph modules={analysis.modules_detail || []} nodes={pathway.nodes || []} />
          </motion.div>
        )}

        {tab === 'trace' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ReasoningTrace trace={pathway.reasoning_trace} />
          </motion.div>
        )}
      </div>

      <ChatCoach analysisContext={analysis} />
    </div>
  )
}