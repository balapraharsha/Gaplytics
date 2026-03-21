import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'gaplytics_progress'

function CalendarHeatmap({ days, progress, today }) {
  const getColor = (day) => {
    if (day.date === today) return '#CF9D7B'
    const done = progress[day.date] || []
    if (done.length > 0 && done.length >= (day.module_ids?.length || 1)) return '#7A9E7E'
    if (day.day_type === 'study' && day.module_ids?.length > 0) return '#724B39'
    if (done.length > 0) return '#5a7a5c'
    return 'rgba(58,53,52,0.5)'
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {days.map((day, i) => (
        <div key={i} title={`Day ${day.day_number} — ${day.date}`}
          style={{ width: 11, height: 11, borderRadius: 2, background: getColor(day), cursor: 'pointer', transition: 'background 0.3s', border: day.date === today ? '1px solid rgba(207,157,123,0.6)' : 'none' }}
          onClick={() => document.getElementById(`day-${day.day_number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        />
      ))}
    </div>
  )
}

function CheckIcon({ done }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="5" fill={done ? 'rgba(122,158,126,0.2)' : 'transparent'} stroke={done ? 'rgba(122,158,126,0.5)' : 'rgba(207,157,123,0.25)'} strokeWidth="1.3"/>
      {done && <path d="M5.5 10L8.5 13L14.5 7" stroke="#7A9E7E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  )
}

function DayCard({ day, modules, progress, onToggle, today }) {
  const isToday = day.is_today
  const isPast = new Date(day.date) < new Date() && !isToday
  const done = progress[day.date] || []

  const borderColor = {
    review: 'rgba(207,157,123,0.25)',
    rest: 'rgba(122,158,126,0.18)',
    final_review: 'rgba(237,224,208,0.3)',
    mock_test: 'rgba(237,224,208,0.35)',
    study: isToday ? 'rgba(207,157,123,0.4)' : 'rgba(207,157,123,0.1)',
  }[day.day_type] || 'rgba(207,157,123,0.1)'

  return (
    <div id={`day-${day.day_number}`} className={isToday ? 'day-card-today' : ''}
      style={{
        background: 'rgba(22,33,39,0.85)', backdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`, borderRadius: 12,
        padding: '14px 18px', position: 'relative', opacity: isPast ? 0.55 : 1,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: modules.length ? 12 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isToday && <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brass)', display: 'inline-block', flexShrink: 0 }} />}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, color: isToday ? 'var(--brass)' : 'rgba(207,157,123,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isToday ? 'Today' : `Day ${day.day_number}`}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>{day.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {day.day_type === 'review' && <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.6)' }}>Review Day</span>}
          {day.day_type === 'rest' && <span style={{ fontSize: 11, color: '#7A9E7E' }}>Rest Day</span>}
          {day.day_type === 'final_review' && <span style={{ fontSize: 11, color: 'var(--brass-light)' }}>Final Review</span>}
          {day.day_type === 'mock_test' && <span style={{ fontSize: 11, color: 'var(--brass-light)', fontWeight: 700 }}>Mock Test Day</span>}
          {day.estimated_hours > 0 && <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>{day.estimated_hours}h</span>}
        </div>
      </div>

      {modules.map(mod => {
        const isComplete = done.includes(mod.id)
        const diffColor = { Beginner: '#7A9E7E', Intermediate: '#CF9D7B', Advanced: '#9E4A3A' }[mod.difficulty] || '#CF9D7B'
        return (
          <div key={mod.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9, marginTop: 7,
              background: isComplete ? 'rgba(122,158,126,0.07)' : 'rgba(22,33,39,0.5)',
              border: `1px solid ${isComplete ? 'rgba(122,158,126,0.2)' : 'rgba(207,157,123,0.1)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => onToggle(day.date, mod.id)}
          >
            <CheckIcon done={isComplete} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: isComplete ? '#7A9E7E' : '#EDE0D0', textDecoration: isComplete ? 'line-through' : 'none', textDecorationColor: 'rgba(122,158,126,0.5)' }}>
                {mod.title}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{mod.duration_hours}h</span>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: `${diffColor}12`, color: diffColor, border: `1px solid ${diffColor}25`, fontSize: 10, letterSpacing: '0.3px' }}>
                  {mod.difficulty}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DeadlineRoadmap() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [progress, setProgress] = useState({})

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const stored = localStorage.getItem('gaplytics_analysis')
    if (!stored) { navigate('/candidate'); return }
    setAnalysis(JSON.parse(stored))
    setProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))
    setTimeout(() => {
      document.querySelector('.day-card-today')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }, [])

  function toggleModule(dateStr, moduleId) {
    setProgress(prev => {
      const dayDone = prev[dateStr] || []
      const newDayDone = dayDone.includes(moduleId) ? dayDone.filter(id => id !== moduleId) : [...dayDone, moduleId]
      const next = { ...prev, [dateStr]: newDayDone }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      if (!dayDone.includes(moduleId)) toast.success('Module completed')
      return next
    })
  }

  if (!analysis) return null

  const { pathway, modules_detail = [] } = analysis
  const { daily_schedule } = pathway
  const moduleMap = Object.fromEntries((modules_detail || []).map(m => [m.id, m]))

  const totalModules = daily_schedule.days.reduce((s, d) => s + d.module_ids.length, 0)
  const completedModules = Object.values(progress).reduce((s, arr) => s + arr.length, 0)
  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 20px' }}>

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="autumn-card" style={{ padding: 26, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 32, margin: '0 0 8px', letterSpacing: '-0.3px' }} className="gradient-text">
                Learning Roadmap
              </h1>
              <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}>
                <span>{daily_schedule.daily_hours}h/day</span>
                <span>{daily_schedule.total_days} days total</span>
                <span>{daily_schedule.total_content_hours}h content</span>
                <span style={{ color: 'var(--brass)' }}>Deadline: {String(daily_schedule.deadline_date)}</span>
              </div>
            </div>

            {/* Progress ring */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 72, height: 72 }}>
                <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(58,53,52,0.6)" strokeWidth="5"/>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="url(#prog-grad)" strokeWidth="5"
                    strokeDasharray={`${(progressPct / 100) * 188} 188`} strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="prog-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#724B39"/>
                      <stop offset="100%" stopColor="#CF9D7B"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 18, color: '#EDE0D0' }}>{progressPct}%</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(207,157,123,0.45)', marginTop: 5, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complete</div>
            </div>
          </div>

          {/* Heatmap */}
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Calendar Overview
            </div>
            <CalendarHeatmap days={daily_schedule.days} progress={progress} today={todayStr} />
          </div>

          <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'rgba(207,157,123,0.45)', marginTop: 10, flexWrap: 'wrap' }}>
            {[['rgba(58,53,52,0.5)', 'Not started'], ['#724B39', 'Scheduled'], ['#7A9E7E', 'Complete'], ['#CF9D7B', 'Today']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: color }} />
                {label}
              </div>
            ))}
          </div>

          {daily_schedule.warning && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(114,75,57,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--brass)', border: '1px solid rgba(114,75,57,0.25)' }}>
              {daily_schedule.warning}
            </div>
          )}
        </motion.div>

        {/* Day cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {daily_schedule.days.map((day, i) => {
            const dayModules = day.module_ids.map(id => moduleMap[id]).filter(Boolean)
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.025, 0.4) }}>
                <DayCard day={day} modules={dayModules} progress={progress} onToggle={toggleModule} today={todayStr} />
              </motion.div>
            )
          })}
        </div>

        {/* Bottom stats */}
        <div className="autumn-card" style={{ padding: 22, marginTop: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 16 }}>
            {[
              { label: 'Modules Remaining', value: `${totalModules - completedModules}`, color: '#EDE0D0' },
              { label: 'Hours Left', value: `${(daily_schedule.total_content_hours * (1 - progressPct / 100)).toFixed(1)}h`, color: 'var(--brass)' },
              { label: 'On Track', value: 'Active', color: '#7A9E7E' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 10, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 26, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setProgress({}); toast.success('Progress reset') }}
            style={{
              background: 'none', border: '1px solid rgba(207,157,123,0.18)',
              color: 'rgba(207,157,123,0.5)', borderRadius: 8, padding: '7px 14px',
              cursor: 'pointer', fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6C2 3.8 3.8 2 6 2C7.6 2 9 2.9 9.7 4M10 6C10 8.2 8.2 10 6 10C4.4 10 3 9.1 2.3 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9.5 1.5V4H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  )
}
