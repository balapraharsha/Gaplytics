import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../components/Navbar'
import ReasoningTrace from '../../components/ReasoningTrace'
import InteractiveFeedback from '../../components/InteractiveFeedback'
import ChatCoach from '../../components/ChatCoach'

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

        {/* Top Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="autumn-card" style={{ padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {gap_result.candidate_name && (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(207,157,123,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Candidate</div>
              )}
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 30, margin: '0 0 10px', color: '#EDE0D0', letterSpacing: '-0.3px' }}>
                {gap_result.candidate_name || 'Your Analysis'}
              </h1>
              <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.5)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="5" r="2.5" stroke="rgba(207,157,123,0.5)" strokeWidth="1.2"/><path d="M2 12C2 9.8 4 8 6.5 8C9 8 11 9.8 11 12" stroke="rgba(207,157,123,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  {gap_result.target_role}
                </span>
                {deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CalendarIcon /> {deadline}
                  </span>
                )}
                <span style={{ color: daysLeft < 14 ? 'var(--brass)' : 'rgba(207,157,123,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 3V6.5L8 8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  {daysLeft} days left
                </span>
                <span>{pathway.total_hours}h total</span>
              </div>
            </div>
            <AnimatedScore value={score} />
          </div>
        </motion.div>

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

        {/* Interactive feedback */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 22 }}>
          {!isElite && <InteractiveFeedback gapResult={gap_result} />}
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {[
            { key: 'roadmap', label: 'Daily Roadmap', icon: <CalendarIcon size={13} /> },
            { key: 'trace', label: 'AI Reasoning', icon: <BrainIcon size={13} /> },
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
                {pathway.daily_schedule.days.slice(0, 6).map((day, i) => {
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
                {pathway.daily_schedule.days.length > 6 && (
                  <button onClick={() => navigate('/candidate/roadmap')} style={{
                    background: 'none', border: '1px dashed rgba(207,157,123,0.18)', borderRadius: 10,
                    padding: '12px', color: 'var(--brass)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13,
                    transition: 'all 0.2s',
                  }}>
                    +{pathway.daily_schedule.days.length - 6} more days — View Full Roadmap
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
